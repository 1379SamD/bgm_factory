import { VideoMeta } from "./../src/types/videoMeta";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import fsPromises from "fs/promises";
import fs from "fs";
import { parseFile } from "music-metadata";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Track } from "./../src/types/track";
import { startNoiseWatcher } from "../judgment/index";

const isDev = !app.isPackaged;

const envPath = isDev
  ? path.join(process.cwd(), ".env")
  : path.join(app.getPath("userData"), ".env");

dotenv.config({ path: envPath });

const moveBgmFile = async (bgm: Track) => {
  const fileName = path.basename(bgm.fullPath);
  const newPath = path.join(
    process.env.TRACKS_POSTED_FOLDER_PATH || "",
    fileName,
  );

  await fsPromises.rename(bgm.fullPath, newPath);
  bgm.fullPath = newPath;
};

let mainWindow: BrowserWindow | null = null;

function createWindow() {
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

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app
  .whenReady()
  .then(() => {
    createWindow();
    startNoiseWatcher();
  })
  .catch((e) => {
    console.error("[whenReady error]", e);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (err) => {
  console.error(err);
  dialog.showErrorBox("Unexpected Error", err.message);
});

process.on("unhandledRejection", (reason: any) => {
  console.error(reason);
  dialog.showErrorBox("Promise Error", String(reason));
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

// 格納されているwavファイルを読み込んで表示する処理
ipcMain.handle("load-fixed-wav", async () => {
  const folder = process.env.TRACKS_FOLDER_PATH;

  if (!folder) {
    return {
      ok: false,
      error: "TRACKS_FOLDER_PATH が設定されていません",
      folder: "",
      files: [],
    };
  }

  try {
    const entries = await fsPromises.readdir(folder);

    const wavNames = entries
      .filter((name) => name.toLowerCase().endsWith(".wav"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const files = await Promise.all(
      wavNames.map(async (name) => {
        const fullPath = path.join(folder, name);

        let durationSec = 0;

        try {
          const meta = await parseFile(fullPath);
          durationSec = Math.max(0, Math.floor(meta.format.duration ?? 0));
        } catch {
          durationSec = 0;
        }

        return {
          id: name,
          name,
          durationSec,
          fullPath,
        };
      }),
    );

    return {
      ok: true,
      folder,
      files,
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";

    return {
      ok: false,
      error: message,
      folder,
      files: [],
    };
  }
});

// サムネイル・背景画像をダイアログで選択する処理
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

  const buffer = await fsPromises.readFile(filePath);

  return {
    path: filePath,
    previewUrl: `data:${mime};base64,${buffer.toString("base64")}`,
  };
});

// 生成先フォルダの親フォルダをダイアログで選択する処理
ipcMain.handle("pick-folder", async () => {
  const result = await dialog.showOpenDialog({
    defaultPath: process.env.PROJECT_FOLDER_PATH,
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

// 生成先フォルダを作成する処理(wav,mp4,metaデータ)
ipcMain.handle(
  "save-video-meta",
  async (_event, saveDir, publishDate, publishTime) => {
    const folderName = formatFolderName(publishDate, publishTime);
    const targetDir = path.join(saveDir, folderName);
    await fsPromises.mkdir(targetDir, { recursive: true });
    return {
      success: true,
      dirPath: targetDir,
    };
  },
);

// jsonファイル保存
ipcMain.handle("save-meta", async (_event, targetDir, meta) => {
  // JSONファイルパス
  const jsonFilePath = path.join(
    targetDir,
    `${formatJsonName(meta.publishAt)}_${meta.title.split(" ")[0]}.json`,
  );

  const newMeta = {
    ...meta,
    jsonFilePath,
  };

  await fsPromises.writeFile(
    jsonFilePath,
    JSON.stringify(newMeta, null, 2),
    "utf-8",
  );
});

// トラックループ処理　→　トラック名をループ回数に応じてテキスト出力
ipcMain.handle(
  "wavFile-concat",
  async (_event, bgmDetail: any[], outputDir: string, level: number) => {
    const wavFilePath = path.join(outputDir, "wavInput.txt");

    const WavContent = Array(level)
      .fill(bgmDetail)
      .flat()
      .map((b) => `file '${b.fullPath.replace(/\\/g, "/")}'`)
      .join("\n");
    await fsPromises.writeFile(wavFilePath, WavContent, "utf-8");
    return wavFilePath;
  },
);

// クロスフェードなし処理　→　wavファイル生成
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

// クロスフェードあり処理　→　wavファイル生成
ipcMain.handle(
  "wavFile-generate-crossfade",
  async (
    _event,
    bgmDetail: any[],
    outputDir: string,
    level: number,
    crossfade: number,
  ) => {
    const outputPath = path.join(outputDir, "output.wav").replace(/\\/g, "/");

    // const tracks = Array(level).fill(bgmDetail).flat();
    const tracks = Array.from({ length: level }, () => bgmDetail).flat();

    if (tracks.length < 2) {
      console.log("クロスフェード対象が2曲未満です");
      return false;
    }

    const inputs = tracks
      .map((b) => `-i "${b.fullPath.replace(/\\/g, "/")}"`)
      .join(" ");

    const fadeSec = crossfade;

    const filters: string[] = [];

    filters.push(`[0:a][1:a]acrossfade=d=${fadeSec}:c1=tri:c2=tri[a1]`);

    for (let i = 2; i < tracks.length; i++) {
      filters.push(
        `[a${i - 1}][${i}:a]acrossfade=d=${fadeSec}:c1=tri:c2=tri[a${i}]`,
      );
    }

    const filterComplex = filters.join(";");
    const lastLabel = `[a${tracks.length - 1}]`;

    const cmd = `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -map "${lastLabel}" "${outputPath}"`;

    return await new Promise((resolve) => {
      exec(cmd, (err) => {
        if (err) {
          console.error("クロスフェード結合エラー:", err);
          resolve(false);
          return;
        }

        console.log("クロスフェード結合完了！");
        resolve(true);
      });
    });
  },
);

// mp4ファイル生成処理
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

// 保存されているjsonファイルを配列に格納（load-json-files処理内で利用）
async function getJsonFilesRecursive(dir: string): Promise<any[]> {
  const entries = await fsPromises.readdir(dir, { withFileTypes: true });

  let results: any[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // フォルダなら再帰
      const sub = await getJsonFilesRecursive(fullPath);
      results = results.concat(sub);
    } else if (entry.name.endsWith(".json")) {
      // JSONなら読む
      const content = await fsPromises.readFile(fullPath, "utf-8");
      results.push(JSON.parse(content));
    }
  }

  return results;
}

// 保存されているjsonファイルを配列に格納
ipcMain.handle("load-json-files", async (_event, dirPath: string) => {
  try {
    const result = await getJsonFilesRecursive(dirPath);
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
});

// YouTube予約投稿：個別設定
ipcMain.handle("schedule-one-post", async (_event, jsonMetaData: VideoMeta) => {
  // YouTube概要欄テキストの整形
  function buildDescription(jsonMetaData: VideoMeta) {
    return [
      jsonMetaData.jpDescription,
      "",
      jsonMetaData.enDescription,
      "",
      jsonMetaData.hashtags,
    ].join("\n");
  }

  // 初回作成処理
  async function createYoutubeClient() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    console.log("YouTubeクライアント作成OK");

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: jsonMetaData.title,
          description: buildDescription(jsonMetaData),
        },
        status: {
          privacyStatus: "private",
          publishAt: jsonMetaData.publishAt,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(jsonMetaData.videoPath),
      },
    });
    const videoId = response.data.id;
    console.log("アップロード成功:", videoId);

    if (!videoId) {
      throw new Error("videoIdの取得に失敗");
    }

    await youtube.thumbnails.set({
      videoId,
      requestBody: {},
      media: {
        mimeType: "image/png",
        body: fs.createReadStream(jsonMetaData.thumbnailPath),
      },
    });

    for (const bgm of jsonMetaData.bgmDetail) {
      await moveBgmFile(bgm);
    }

    // jsonファイルのステータスの更新
    const raw = await fsPromises.readFile(jsonMetaData.jsonFilePath, "utf-8");
    const data: VideoMeta = JSON.parse(raw);

    data.status = "scheduled";
    await fsPromises.writeFile(
      jsonMetaData.jsonFilePath,
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }

  await createYoutubeClient();
});

// 個別にwavファイル削除
ipcMain.handle("delete-wav-file", async (_event, wavFilePath: string) => {
  await fsPromises.unlink(wavFilePath);
});
