"use strict";
const electron = require("electron");
console.log("[preload] loaded");
electron.contextBridge.exposeInMainWorld("api", {
  loadFixedMp3: () => electron.ipcRenderer.invoke("load-fixed-mp3"),
  pickImage: () => electron.ipcRenderer.invoke("pick-image"),
  pickFolder: () => electron.ipcRenderer.invoke("pick-folder"),
  saveVideoMeta: (saveDir, publishDate, publishTime) => electron.ipcRenderer.invoke("save-video-meta", saveDir, publishDate, publishTime),
  saveMeta: (saveDir, meta) => electron.ipcRenderer.invoke("save-meta", saveDir, meta),
  wavFileConcat: (bgmDetail, outputDir) => electron.ipcRenderer.invoke("wavFile-concat", bgmDetail, outputDir)
});
