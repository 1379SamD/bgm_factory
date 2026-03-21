import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded"); // ★追加
contextBridge.exposeInMainWorld("api", {
  loadFixedMp3: () => ipcRenderer.invoke("load-fixed-mp3"),
  pickImage: () => ipcRenderer.invoke("pick-image"),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  saveVideoMeta: (saveDir: string, publishDate: string, publishTime: string) =>
    ipcRenderer.invoke("save-video-meta", saveDir, publishDate, publishTime),
  saveMeta:(saveDir: string, meta: any) => ipcRenderer.invoke("save-meta", saveDir, meta),
});
