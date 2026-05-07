import { exec } from "child_process";

export function getMinVolume(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${filePath}" -af astats=metadata=1:reset=0 -f null NUL`;

    exec(cmd, (_error, _stdout, stderr) => {
      const output = stderr;

      const match = output.match(/RMS trough dB:\s*(-?\d+(?:\.\d+)?)/);

      if (!match) {
        console.error(output);
        reject(new Error("最小音量が取得できない"));
        return;
      }

      const minVolume = parseFloat(match[1]);
      resolve(minVolume);
    });
  });
}