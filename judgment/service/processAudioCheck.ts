import { processNoiseCheck } from "../noise-watcher/noiseProcessor.js";
import { analyzeOnsetDensity } from "../tempo_watcher/analyzeOnsetDensity.js";
import { processSlidingNoiseCheck } from "../SlidingNoiseCheck/analyzeHighBandSection.js";
import fs from "fs";

export async function processAudioCheck(filePath: string) {
  const noiseResult = await processNoiseCheck(filePath);
  const slidingNoise = await processSlidingNoiseCheck(filePath);

  const isNoise = noiseResult.isNoise || slidingNoise.isNoise;

  console.log("全体ノイズ:", noiseResult);
  console.log("区間ノイズ:", slidingNoise);
  console.log("最終判定:", isNoise);

  console.log("ノイズ解析結果", {
    file: filePath,
    isNoise: noiseResult.isNoise,
    avgVolume: noiseResult.avgVolume,
    minVolume: noiseResult.minVolume,
    variation: noiseResult.variation,
  });

  if (isNoise) {
    const newPath = filePath.replace(".wav", "__noise.wav");

    await new Promise((r) => setTimeout(r, 200));

    fs.renameSync(filePath, newPath);

    return;
  }

  const tempoResult = await analyzeOnsetDensity(filePath);

  let suffix = "";

  if (tempoResult.status === "ok") {
    suffix = "__ok.wav";
  } else if (tempoResult.status === "fast") {
    suffix = "__ok__tempoNG.wav";
  } else {
    suffix = "__ok__unstable.wav";
  }

  await new Promise((r) => setTimeout(r, 300));

  const newPath = filePath.replace(/\.wav$/i, suffix);
  fs.renameSync(filePath, newPath);
}
