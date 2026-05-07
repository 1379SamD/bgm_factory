import { contextBridge, ipcRenderer } from "electron";
import type { VideoMeta } from "../src/types/videoMeta";

console.log("[preload] loaded");
contextBridge.exposeInMainWorld("api", {
  loadFixedWav: () => ipcRenderer.invoke("load-fixed-wav"),
  pickImage: () => ipcRenderer.invoke("pick-image"),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  saveVideoMeta: (saveDir: string, publishDate: string, publishTime: string) =>
    ipcRenderer.invoke("save-video-meta", saveDir, publishDate, publishTime),
  saveMeta: (saveDir: string, meta: any) =>
    ipcRenderer.invoke("save-meta", saveDir, meta),
  wavFileConcat: (bgmDetail: any[], outputDir: string, level: number) =>
    ipcRenderer.invoke("wavFile-concat", bgmDetail, outputDir, level),
  wavFileGenerate: (wavFilepath: string) =>
    ipcRenderer.invoke("wavFile-generate", wavFilepath),
  mp4FileGenerate: (outputDir: string, backgroundPath: string) =>
    ipcRenderer.invoke("mp4File-generate", outputDir, backgroundPath),
  loadJsonFiles: (dirPath: string) =>
    ipcRenderer.invoke("load-json-files", dirPath),
  ScheduleOnePost: (jsonMetaData: VideoMeta) =>
    ipcRenderer.invoke("schedule-one-post", jsonMetaData),
  DeleteWavFile: (wavFilePath: String) =>
    ipcRenderer.invoke("delete-wav-file", wavFilePath),
  wavFileGenerateCrossfade: (bgmDetail: any[], outputDir: string, level: number, crossFade: number) =>
    ipcRenderer.invoke("wavFile-generate-crossfade",  bgmDetail, outputDir, level, crossFade),
});
