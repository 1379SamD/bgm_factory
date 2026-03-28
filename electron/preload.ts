import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded"); // ★追加
contextBridge.exposeInMainWorld("api", {
  loadFixedMp3: () => ipcRenderer.invoke("load-fixed-mp3"),
  pickImage: () => ipcRenderer.invoke("pick-image"),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  saveVideoMeta: (saveDir: string, publishDate: string, publishTime: string) =>
    ipcRenderer.invoke("save-video-meta", saveDir, publishDate, publishTime),
  saveMeta:(saveDir: string, meta: any) => ipcRenderer.invoke("save-meta", saveDir, meta),
  wavFileConcat:(bgmDetail: any[], outputDir: string) => ipcRenderer.invoke("wavFile-concat", bgmDetail, outputDir),
  wavFileGenerate:(wavFilepath: string) => ipcRenderer.invoke("wavFile-generate", wavFilepath),
  mp4FileGenerate:(outputDir: string, backgroundPath: string) => ipcRenderer.invoke("mp4File-generate", outputDir, backgroundPath),
});
