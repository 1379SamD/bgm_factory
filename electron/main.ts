// electron/main.ts（全部これに置き換え）
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs/promises";
import { parseFile } from "music-metadata";
import { fileURLToPath } from "url";
import { exec } from "child_process";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // ★ main.ts(ビルド後は dist-electron/main-xxxx.js) と同じフォルダにある preload.mjs を参照
  const preloadPath = fileURLToPath(new URL("./preload.mjs", import.meta.url));
  console.log("[preload use]", preloadPath);

  mainWindow = new BrowserWindow({
    width: 960,
    height: 1080,
    resizable: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // dev: Vite
  mainWindow.loadURL("http://localhost:5173");

  // デバッグ用（外したければ消してOK）
  mainWindow.webContents.openDevTools({ mode: "detach" });
}

app
  .whenReady()
  .then(createWindow)
  .catch((e) => {
    console.error("[whenReady error]", e);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function formatFolderName(date: string, time: string) {
  const ymd = date.replace(/-/g, "");
  const hm = time.replace(/:/g, "");
  return `${ymd}_${hm}`;
}
function formatJsonName(publishAt: string) {
  const publishAtFormat = publishAt.replace(/:/g, "");
  return publishAtFormat;
}

// -------- IPC: 固定フォルダ D:\sunoai_bgm から mp3 + duration を返す --------
ipcMain.handle("load-fixed-mp3", async () => {
  const folder = "D:\\sunoai_bgm";

  try {
    const entries = await fs.readdir(folder);

    const mp3Names = entries
      .filter((name) => name.toLowerCase().endsWith(".wav"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const files = await Promise.all(
      mp3Names.map(async (name) => {
        const fullPath = path.join(folder, name);

        let durationSec = 0;
        try {
          const meta = await parseFile(fullPath);
          durationSec = Math.max(0, Math.floor(meta.format.duration ?? 0));
        } catch {
          durationSec = 0;
        }

        return { id: name, name, durationSec, fullPath };
      }),
    );

    return { ok: true, folder, files };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message ?? "Unknown error",
      folder,
      files: [],
    };
  }
});

ipcMain.handle("pick-image", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const ext = path.extname(filePath).toLowerCase();

  let mime = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
  if (ext === ".webp") mime = "image/webp";

  const buffer = await fs.readFile(filePath);

  return {
    path: filePath,
    previewUrl: `data:${mime};base64,${buffer.toString("base64")}`,
  };
});

ipcMain.handle("pick-folder", async () => {
  const result = await dialog.showOpenDialog({
    defaultPath: "D:\\youtubeBGMPostReservation",
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle(
  "save-video-meta",
  async (_event, saveDir, publishDate, publishTime) => {
    const folderName = formatFolderName(publishDate, publishTime);
    // const BASE_DIR = "D:\\youtubeBGMPostReservation";
    const targetDir = path.join(saveDir, folderName);
    await fs.mkdir(targetDir, { recursive: true });
    return {
      success: true,
      dirPath: targetDir,
    };
  },
);

ipcMain.handle("save-meta", async (_event, targetDir, meta) => {
  // JSONファイルパス
  const jsonFilePath = path.join(
    targetDir,
    `${formatJsonName(meta.publishAt)}_${meta.title.split(" ")[0]}.json`,
    // `test.json`,
  );
  console.log(jsonFilePath);

  await fs.writeFile(jsonFilePath, JSON.stringify(meta, null, 2), "utf-8");
  console.log(meta);
});

ipcMain.handle(
  "wavFile-concat",
  async (_event, bgmDetail: any[], outputDir: string) => {
    const wavFilePath = path.join(outputDir, "wavInput.txt");

    const WavContent = Array(3)
      .fill(bgmDetail)
      .flat()
      .map((b) => `file '${b.fullPath.replace(/\\/g, "/")}'`)
      .join("\n");
    await fs.writeFile(wavFilePath, WavContent, "utf-8");
    return wavFilePath;
  },
);

ipcMain.handle("wavFile-generate", async (_event, outputDir: string) => {
  const txtPath = path.join(outputDir, "wavInput.txt").replace(/\\/g, "/");
  const outputPath = path.join(outputDir, "output.wav").replace(/\\/g, "/");

  return await new Promise((resolve) => {
    exec(
      `ffmpeg -f concat -safe 0 -i ${txtPath} -c copy ${outputPath}`,
      (err) => {
        if (err) {
          console.error("エラー:", err);
          return;
        }
        resolve(true);
        console.log("結合完了！");
      },
    );
  });
});

ipcMain.handle(
  "mp4File-generate",
  async (_event, outputDir: string, backgroundPath: string) => {
    const imagePath = backgroundPath.replace(/\\/g, "/");
    const audioPath = path.join(outputDir, "output.wav").replace(/\\/g, "/");
    const outputPath = path.join(outputDir, "output.mp4").replace(/\\/g, "/");

    const cmd =
      `ffmpeg -y -loop 1 -framerate 2 -i "${imagePath}" -i "${audioPath}" ` +
      `-fflags +genpts ` +
      `-vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" ` +
      `-c:v h264_nvenc -preset p4 -bf 0 ` +
      `-c:a aac -b:a 192k ` +
      `-pix_fmt yuv420p ` +
      `-movflags +faststart ` +
      `-shortest "${outputPath}"`;

    return await new Promise<{ success: boolean; outputPath: string }>(
      (resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            console.error("動画生成失敗", err);
            console.error("stdout:", stdout);
            console.error(stderr);
            reject(err);
            return;
          }

          console.log("動画生成成功！");
          resolve({
            success: true,
            outputPath,
          });
        });
      },
    );
  },
);

async function getJsonFilesRecursive(dir: string): Promise<any[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  let results: any[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // フォルダなら再帰
      const sub = await getJsonFilesRecursive(fullPath);
      results = results.concat(sub);
    } else if (entry.name.endsWith(".json")) {
      // JSONなら読む
      const content = await fs.readFile(fullPath, "utf-8");
      results.push(JSON.parse(content));
    }
  }

  return results;
}

ipcMain.handle("load-json-files", async (_event, dirPath: string) => {
  try {
    const result = await getJsonFilesRecursive(dirPath);
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
});
