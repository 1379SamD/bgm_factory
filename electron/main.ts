// electron/main.ts（全部これに置き換え）
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs/promises";
import { parseFile } from "music-metadata";
import { fileURLToPath } from "url";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // ★ main.ts(ビルド後は dist-electron/main-xxxx.js) と同じフォルダにある preload.mjs を参照
  const preloadPath = fileURLToPath(new URL("./preload.mjs", import.meta.url));
  console.log("[preload use]", preloadPath);

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
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

// -------- IPC: 固定フォルダ D:\sunoai_bgm から mp3 + duration を返す --------
ipcMain.handle("load-fixed-mp3", async () => {
  const folder = "D:\\sunoai_bgm";

  try {
    const entries = await fs.readdir(folder);

    const mp3Names = entries
      .filter((name) => name.toLowerCase().endsWith(".mp3"))
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

        return { id: name, name, durationSec };
      })
    );

    return { ok: true, folder, files };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error", folder, files: [] };
  }
});