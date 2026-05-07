import { exec } from "child_process";
import { parseFile } from "music-metadata";

type SuspiciousSection = {
  start: number;
  end: number;
  avgVolume: number;
  minVolume: number;
  variation: number;
};

function analyzeHighBandSection(
  filePath: string,
  start: number,
  duration: number,
): Promise<{ avgVolume: number; minVolume: number; variation: number }> {
  return new Promise((resolve, reject) => {
    const cmd =
      `ffmpeg -hide_banner -ss ${start} -t ${duration} -i "${filePath}" ` +
      `-af "highpass=f=7000,lowpass=f=16000,volumedetect,astats=metadata=1:reset=0" ` +
      `-f null NUL`;

    exec(cmd, (_error, _stdout, stderr) => {
      const avgMatch = stderr.match(/mean_volume:\s*(-?\d+(?:\.\d+)?) dB/);
      const minMatch = stderr.match(/RMS trough dB:\s*(-?\d+(?:\.\d+)?)/);

      if (!avgMatch || !minMatch) {
        reject(new Error("区間音量が取得できません"));
        return;
      }

      const avgVolume = parseFloat(avgMatch[1]);
      const minVolume = parseFloat(minMatch[1]);
      const variation = avgVolume - minVolume;

      resolve({ avgVolume, minVolume, variation });
    });
  });
}

export async function processSlidingNoiseCheck(filePath: string) {
  const meta = await parseFile(filePath);
  const durationSec = Math.floor(meta.format.duration ?? 0);

  const WINDOW_SEC = 3;

  const STEP_SEC = 3;

  const SUSPICIOUS_AVG_VOLUME = -60;
  const SUSPICIOUS_MIN_VOLUME = -90;
  const SUSPICIOUS_VARIATION = 30;

  const SUSPICIOUS_CONSECUTIVE_COUNT = 3;

  const suspiciousSections: SuspiciousSection[] = [];

  let consecutiveCount = 0;
  let maxConsecutiveCount = 0;

  for (let start = 0; start <= durationSec - WINDOW_SEC; start += STEP_SEC) {
    const end = start + WINDOW_SEC;

    let result: { avgVolume: number; minVolume: number; variation: number };

    try {
      result = await analyzeHighBandSection(filePath, start, WINDOW_SEC);
    } catch (e) {
      console.error(`区間解析失敗: ${start}〜${end}`, e);
      consecutiveCount = 0;
      continue;
    }

    const isSuspicious =
      result.avgVolume > SUSPICIOUS_AVG_VOLUME &&
      result.minVolume > SUSPICIOUS_MIN_VOLUME &&
      result.variation < SUSPICIOUS_VARIATION;

    if (isSuspicious) {
      consecutiveCount++;

      suspiciousSections.push({
        start,
        end,
        ...result,
      });
    } else {
      consecutiveCount = 0;
    }

    maxConsecutiveCount = Math.max(maxConsecutiveCount, consecutiveCount);
  }

  const isNoise = maxConsecutiveCount >= SUSPICIOUS_CONSECUTIVE_COUNT;

  return {
    isNoise,
    maxConsecutiveCount,
    suspiciousSections,
  };
}