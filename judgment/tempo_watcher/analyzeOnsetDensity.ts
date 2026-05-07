import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type OnsetSegment = {
  start: number;
  end: number;
  onsetCount: number;
};

type TempoStatus = "ok" | "fast" | "unstable";

export async function analyzeOnsetDensity(filePath: string) {
  const windowSec = 3; // 3秒間を見る
  const stepSec = 1; // 1秒ずつずらす

  const pcm = await loadPcmMono16k(filePath);
  const onsets = detectOnsets(pcm.samples, pcm.sampleRate);

  const duration = pcm.samples.length / pcm.sampleRate;

  const segments = createOnsetSegments(onsets, duration, windowSec, stepSec);

  const counts = segments.map((s) => s.onsetCount);
  const maxOnsetCount = Math.max(...counts);
  const avgOnsetCount = counts.reduce((sum, v) => sum + v, 0) / counts.length;

  const result = judgeOnsetTempo(segments);

  // ③ リネーム
  // let suffix = "";

  // if (result.status === "ok") {
  //   suffix = "__ok.wav";
  // } else if (result.status === "fast") {
  //   suffix = "__tempoNG.wav";
  // } else {
  //   suffix = "__unstable.wav";
  // }

  // const newPath = filePath.replace(".wav", suffix);

  // fs.renameSync(filePath, newPath);

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  segments.forEach((s) => {
    if (s.onsetCount >= 4) {
      // console.log(`⚠️ ${s.start}s〜${s.end}s : ${s.onsetCount}`);
      console.log(
        `⚠️ ${formatTime(s.start)}〜${formatTime(s.end)} : ${s.onsetCount}`,
      );
    }
  });
  console.log("maxOnsetCount:", maxOnsetCount);
  console.log("avgOnsetCount:", avgOnsetCount.toFixed(2));
  console.log("status:", result.status);
  console.log("maxConsecutiveHigh:", result.maxConsecutiveHigh);
  console.log("highRatio:", result.highRatio.toFixed(2));

  return {
    segments,
    onsetCounts: counts,
    maxOnsetCount,
    avgOnsetCount,
    ...result,
  };
}

async function loadPcmMono16k(filePath: string) {
  const sampleRate = 16000;

  const { stdout } = await execFileAsync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      filePath,
      "-ac",
      "1",
      "-ar",
      String(sampleRate),
      "-f",
      "s16le",
      "pipe:1",
    ],
    {
      encoding: "buffer",
      maxBuffer: 1024 * 1024 * 200,
    },
  );

  const samples = new Float32Array(stdout.length / 2);

  for (let i = 0; i < samples.length; i++) {
    const int16 = stdout.readInt16LE(i * 2);
    samples[i] = int16 / 32768;
  }

  return {
    samples,
    sampleRate,
  };
}

function detectOnsets(samples: Float32Array, sampleRate: number): number[] {
  const frameSize = 1024;
  const hopSize = 512;

  const energies: number[] = [];

  for (let i = 0; i + frameSize < samples.length; i += hopSize) {
    let sum = 0;

    for (let j = 0; j < frameSize; j++) {
      const v = samples[i + j];
      sum += v * v;
    }

    const rms = Math.sqrt(sum / frameSize);
    const logEnergy = Math.log10(rms + 1e-8);

    energies.push(logEnergy);
  }

  const fluxes: number[] = [];

  for (let i = 1; i < energies.length; i++) {
    const diff = energies[i] - energies[i - 1];
    fluxes.push(Math.max(0, diff));
  }

  const mean =
    fluxes.reduce((sum, v) => sum + v, 0) / Math.max(1, fluxes.length);

  const variance =
    fluxes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    Math.max(1, fluxes.length);

  const stdDev = Math.sqrt(variance);

  const threshold = mean + stdDev * 1.5;

  const onsets: number[] = [];
  const minGapSec = 0.28;
  let lastOnsetTime = -999;

  for (let i = 1; i < fluxes.length - 1; i++) {
    const isLocalPeak = fluxes[i] > fluxes[i - 1] && fluxes[i] > fluxes[i + 1];
    const isStrong = fluxes[i] > threshold;

    const time = (i * hopSize) / sampleRate;

    if (isLocalPeak && isStrong && time - lastOnsetTime >= minGapSec) {
      onsets.push(time);
      lastOnsetTime = time;
    }
  }

  return onsets;
}

function createOnsetSegments(
  onsets: number[],
  duration: number,
  windowSec: number,
  stepSec: number,
): OnsetSegment[] {
  const segments: OnsetSegment[] = [];

  for (let start = 0; start + windowSec <= duration; start += stepSec) {
    const end = start + windowSec;

    const onsetCount = onsets.filter((t) => t >= start && t < end).length;

    segments.push({
      start,
      end,
      onsetCount,
    });
  }

  return segments;
}

function judgeOnsetTempo(segments: OnsetSegment[]) {
  const HIGH_ONSET_THRESHOLD = 7; // 3秒で7回以上
  const FAST_CONSECUTIVE_COUNT = 3; // 3回連続でアウト
  const UNSTABLE_HIGH_RATIO = 0.4;

  let highCount = 0;
  let consecutiveHigh = 0;
  let maxConsecutiveHigh = 0;

  for (const segment of segments) {
    const isHigh = segment.onsetCount >= HIGH_ONSET_THRESHOLD;

    if (isHigh) {
      highCount++;
      consecutiveHigh++;
    } else {
      consecutiveHigh = 0;
    }

    maxConsecutiveHigh = Math.max(maxConsecutiveHigh, consecutiveHigh);
  }

  const highRatio = highCount / segments.length;

  let status: TempoStatus = "ok";

  if (maxConsecutiveHigh >= FAST_CONSECUTIVE_COUNT) {
    status = "fast";
  } else if (highRatio >= UNSTABLE_HIGH_RATIO) {
    status = "unstable";
  }

  return {
    status,
    highCount,
    highRatio,
    maxConsecutiveHigh,
  };
}
