import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type Segment = {
  start: number;
  end: number;
  density: number;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ===== メイン処理 =====
export async function analyzeDensity(filePath: string) {
  const segments = await getSegmentDensities(filePath, 3);

  const densities = segments.map((s) => s.density);

  const maxDensity = Math.max(...densities);

  const avgDensity =
    densities.reduce((sum, v) => sum + v, 0) / densities.length;

  // console.log(
  //   "densities:",
  //   densities.map((d) => d.toFixed(1)),
  // );
  segments.forEach((s) => {
    console.log(
      `${formatTime(s.start)}〜${formatTime(s.end)} : ${s.density.toFixed(1)}`,
    );
  });
  console.log("maxDensity:", maxDensity.toFixed(1));
  console.log("avgDensity:", avgDensity.toFixed(1));

  return {
    densities,
    maxDensity,
    avgDensity,
  };
}

// ===== 3秒ごとに分割 =====
async function getSegmentDensities(
  filePath: string,
  segmentSec: number,
): Promise<Segment[]> {
  const duration = await getDuration(filePath);
  const segments: Segment[] = [];

  for (let start = 0; start < duration; start += segmentSec) {
    const len = Math.min(segmentSec, duration - start);

    const density = await getDensityForRange(filePath, start, len);

    segments.push({
      start,
      end: start + len,
      density,
    });
  }

  return segments;
}

// ===== 長さ取得 =====
async function getDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);

  return Number(stdout.trim());
}

// ===== 密度取得（RMSベース） =====
async function getDensityForRange(
  filePath: string,
  start: number,
  duration: number,
): Promise<number> {
  const { stderr } = await execFileAsync("ffmpeg", [
    "-hide_banner",
    "-ss",
    String(start),
    "-t",
    String(duration),
    "-i",
    filePath,
    "-af",
    "astats=metadata=1:reset=1",
    "-f",
    "null",
    "-",
  ]);

  // RMS抽出
  const match = stderr.match(/RMS level dB:\s*(-?\d+(\.\d+)?)/);

  if (!match) return 0;

  const rmsDb = Number(match[1]);

  // density変換（扱いやすくする）
  return Math.max(0, 100 + rmsDb);
}
