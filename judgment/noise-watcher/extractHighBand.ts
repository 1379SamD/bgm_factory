import { exec } from "child_process";

export function extractHighBand(input: string, output: string) {
  const cmd = `ffmpeg -y -i "${input}" -af "highpass=f=7000,lowpass=f=16000" "${output}"`;

  return new Promise<void>((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}