"use strict";
const electron = require("electron");
console.log("[preload] loaded");
electron.contextBridge.exposeInMainWorld("api", {
  loadFixedMp3: () => electron.ipcRenderer.invoke("load-fixed-mp3"),
  pickImage: () => electron.ipcRenderer.invoke("pick-image")
});
