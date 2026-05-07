import fs from "fs";
import { extractHighBand } from "./extractHighBand.js";
import { getAverageVolume } from "./getAverageVolume.js";
import { getMinVolume } from "./getMinVolume.js";

// detectNoiseは後で

export async function processNoiseCheck(filePath: string) {
  const tempPath = filePath.replace(/\.wav$/i, "__high.wav");

  // 高域抽出
  await extractHighBand(filePath, tempPath);

  // 平均音量
  const avgVolume = await getAverageVolume(tempPath);
  console.log("平均音量:", avgVolume);

  // ③ 最小音量
  const minVolume = await getMinVolume(tempPath);
  console.log("最小音量:", minVolume);

  const variation = avgVolume - minVolume;
  console.log("変動幅:", variation);

  // ② ノイズ判定
  const isNoise = avgVolume > -62 && minVolume > -100 && variation < 30;

  // ③ リネーム
  // const newPath = filePath.replace(
  //   ".wav",
  //   isNoise ? "__noise.wav" : "__ok.wav",
  // );

  // fs.renameSync(filePath, newPath);

  // ④ temp削除（存在チェック入れた方が安全）
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  return {
    isNoise,
    avgVolume,
    minVolume,
    variation,
  };
}
