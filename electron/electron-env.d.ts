/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
// interface Window {
//   ipcRenderer: import('electron').IpcRenderer
//   api: {
//     loadFixedMp3: () => Promise<any>;

//   };
// }

export {}

declare global {
  interface Window {
    api: {
      loadFixedMp3: () => Promise<{
        ok: boolean
        error?: string
        folder: string
        files: { id: string; name: string; durationSec: number; fullPath: string }[]
      }>
      pickImage: () => Promise<{
        path: string;
        previewUrl: string;
      } | null>;
      pickFolder: () => Promise<string | null>;
      saveVideoMeta: (
        saveDir: string,
        publishDate: string,
        publishTime: string
      ) => Promise<{
        success: boolean;
      }>;
      saveMeta: (
        saveDir: string,
        meta: any,
      ) => void
    };
  }
}