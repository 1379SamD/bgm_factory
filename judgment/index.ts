import { startWatch } from "./watchFolder.js";

export function startNoiseWatcher() {
  const TARGET = "D:/bgm-factory/source/tracks";

  startWatch(TARGET);

  console.log("ノイズ監視スタート");
}
