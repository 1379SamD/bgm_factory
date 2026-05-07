import { exec } from "child_process";

export function getAverageVolume(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -i "${filePath}" -af volumedetect -f null NUL`;

    exec(cmd, (error, _stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      // stderr にログが出る
      const output = stderr;

      // mean_volume を抽出
      const match = output.match(/mean_volume:\s*(-?\d+(\.\d+)?) dB/);

      if (!match) {
        reject("平均音量が取得できない");
        return;
      }

      const meanVolume = parseFloat(match[1]);

      resolve(meanVolume);
    });
  });
}
