import { contextBridge, ipcRenderer } from "electron";

console.log("[preload] loaded"); // ★追加
contextBridge.exposeInMainWorld("api", {
  loadFixedMp3: () => ipcRenderer.invoke("load-fixed-mp3"),
  pickImage: () => ipcRenderer.invoke("pick-image"),
});

// contextBridge.exposeInMainWorld("api", {
//   loadFixedMp3: () => ipcRenderer.invoke("loadFixedMp3"),
// });