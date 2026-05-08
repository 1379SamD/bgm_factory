import { exec } from "child_process";
import { parseFile } from "music-metadata";

type SuspiciousSection = {
  start: number;
  end: number;
  avgVolume: number;
  minVolume: number;
  variation: number;
};

type BandAnalyzeResult = {
  avgVolumes: number[];
  minVolumes: number[];
};

const WINDOW_SEC = 6;
const HIT_THRESHOLD = 1;

function analyzeHighBand(filePath: string): Promise<BandAnalyzeResult> {
  return analyzeBand(filePath, "highpass=f=7000,lowpass=f=16000", "高域");
}

function analyzeMidBand(filePath: string): Promise<BandAnalyzeResult> {
  return analyzeBand(filePath, "highpass=f=500,lowpass=f=4000", "中域");
}

function analyzeLowBand(filePath: string): Promise<BandAnalyzeResult> {
  return analyzeBand(filePath, "lowpass=f=250", "低域");
}

function analyzeBand(
  filePath: string,
  filter: string,
  label: string,
): Promise<BandAnalyzeResult> {
  return new Promise((resolve, reject) => {
    const cmd =
      `ffmpeg -hide_banner -i "${filePath}" ` +
      `-af "${filter},volumedetect,astats=metadata=1:reset=${WINDOW_SEC}" ` +
      `-f null NUL`;

    exec(cmd, (_error, _stdout, stderr) => {
      const avgMatches = [
        ...stderr.matchAll(/mean_volume:\s*(-?\d+(?:\.\d+)?) dB/g),
      ];

      const minMatches = [
        ...stderr.matchAll(/RMS trough dB:\s*(-?\d+(?:\.\d+)?)/g),
      ];

      if (!avgMatches.length || !minMatches.length) {
        console.log(stderr);
        reject(new Error(`${label}解析失敗`));
        return;
      }

      resolve({
        avgVolumes: avgMatches.map((v) => parseFloat(v[1])),
        minVolumes: minMatches.map((v) => parseFloat(v[1])),
      });
    });
  });
}

function checkBandNoise(
  bandLabel: string,
  avgVolumes: number[],
  minVolumes: number[],
  avgThreshold: number,
  variationThreshold: number,
) {
  const suspiciousSections: SuspiciousSection[] = [];
  const length = Math.min(avgVolumes.length, minVolumes.length);

  console.log(`==== ${bandLabel} 判定ログ ====`);

  for (let i = 0; i < length; i++) {
    const avgVolume = avgVolumes[i];
    const minVolume = minVolumes[i];
    const variation = avgVolume - minVolume;

    const start = i * WINDOW_SEC;
    const end = start + WINDOW_SEC;

    console.log(
      `${start}〜${end} avg:${avgVolume} min:${minVolume} variation:${variation}`,
    );

    const isSuspicious =
      avgVolume > avgThreshold &&
      variation < variationThreshold;

    if (isSuspicious) {
      suspiciousSections.push({
        start,
        end,
        avgVolume,
        minVolume,
        variation,
      });

      console.log(
        `⚠️ ${bandLabel} ${start}〜${end} avg:${avgVolume} min:${minVolume} variation:${variation}`,
      );
    }
  }

  return {
    isNoise: suspiciousSections.length >= HIT_THRESHOLD,
    hitCount: suspiciousSections.length,
    suspiciousSections,
  };
}

export async function processFastNoiseCheck(filePath: string) {
  console.log("爆速ノイズチェック開始:", filePath);

  const meta = await parseFile(filePath);
  const durationSec = Math.floor(meta.format.duration ?? 0);

  console.log("曲長:", durationSec);

  const high = await analyzeHighBand(filePath);
  const highResult = checkBandNoise(
    "高域",
    high.avgVolumes,
    high.minVolumes,
    -65,
    35,
  );
  console.log("高域結果:", highResult);

  // ここから下はログ確認用。最終判定には使わない。
  const mid = await analyzeMidBand(filePath);
  const midResult = checkBandNoise(
    "中域",
    mid.avgVolumes,
    mid.minVolumes,
    -65,
    45,
  );
  console.log("中域結果 ※参考:", midResult);

  const low = await analyzeLowBand(filePath);
  const lowResult = checkBandNoise(
    "低域",
    low.avgVolumes,
    low.minVolumes,
    -58,
    40,
  );
  console.log("低域結果 ※参考:", lowResult);

  const isNoise = highResult.isNoise;

  return {
    isNoise,
    highResult,
    midResult,
    lowResult,
  };
}