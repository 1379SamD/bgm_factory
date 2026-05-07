import chokidar from "chokidar";
import fs from "fs";
import { processAudioCheck } from "./service/processAudioCheck.js";

let queue: string[] = [];
let isProcessing = false;
const queuedOrProcessing = new Set<string>();

function isTargetWav(filePath: string) {
  if (!filePath.toLowerCase().endsWith(".wav")) return false;

  if (
    filePath.includes("__ok") ||
    filePath.includes("__noise") ||
    filePath.includes("__high") ||
    filePath.includes("__tempoNG") ||
    filePath.includes("__unstable")
  ) {
    return false;
  }

  return true;
}

export function startWatch(folderPath: string) {
  console.log("watcher起動");

  const watcher = chokidar.watch(folderPath, {
    ignoreInitial: true,
  });

  watcher.on("add", async (filePath: string) => {
    if (!isTargetWav(filePath)) return;

    if (queuedOrProcessing.has(filePath)) {
      console.log("すでにキュー済み:", filePath);
      return;
    }

    // ★ここで先にロック
    queuedOrProcessing.add(filePath);

    console.log("追加検知:", filePath);

    try {
      await waitForStable(filePath);

      if (!fs.existsSync(filePath)) {
        console.log("安定待ち後に存在しない:", filePath);
        queuedOrProcessing.delete(filePath);
        return;
      }

      queue.push(filePath);
      processQueue();
    } catch (e) {
      queuedOrProcessing.delete(filePath);
      console.error("waitForStable失敗:", e);
    }
  });
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;

  while (queue.length > 0) {
    const file = queue.shift()!;
    console.log("処理開始:", file);

    try {
      if (!fs.existsSync(file)) {
        console.log("処理時点で存在しないのでスキップ:", file);
        continue;
      }

      await processAudioCheck(file);
    } catch (e) {
      console.error("エラー:", e);
    } finally {
      queuedOrProcessing.delete(file);
    }
  }

  isProcessing = false;
}

async function waitForStable(filePath: string) {
  let prevSize = -1;

  while (true) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`ファイルが存在しません: ${filePath}`);
    }

    const { size } = fs.statSync(filePath);

    if (size === prevSize) break;

    prevSize = size;
    await new Promise((r) => setTimeout(r, 1000));
  }
}