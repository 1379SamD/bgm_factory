import styles from "./App.module.css";
import type { Track } from "./App.tsx";
import { useState } from "react";

type Props = {
  selectedTracks: Track[];
  formatMMSS: (totalSec: number) => string;
  formatHHMMSS: (totalSec: number) => string;
  totalSec: number;
  over60min: boolean;
  imagePath: string;
  pickImage: () => Promise<void>;
  imageSrc: string;
  previewUrl: string;
};

export default function Center({
  selectedTracks,
  formatMMSS,
  formatHHMMSS,
  totalSec,
  over60min,
  imagePath,
  pickImage,
  previewUrl,
}: Props) {
  const [level, setLevel] = useState(3);
  return (
    <section className={styles.cardWide}>
      <div className={styles.cardTitle}>BUILD</div>
      {/* <div className={styles.cardSub}>
        選択した曲をまとめる（v1ではフォルダ作成は後でIPC）
      </div> */}

      <div className={styles.buildBox}>
        {selectedTracks.length === 0 ? (
          <div className={styles.muted}>
            TRACKSで曲をチェックするとここに表示される
          </div>
        ) : (
          selectedTracks.map((t) => (
            <div key={t.id} className={styles.row}>
              <span
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.name}
              </span>
              <span className={styles.muted}>{formatMMSS(t.durationSec)}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles.roopCounter}>
        <span>ループ回数：</span>
        <div className={styles.roopSelectNum}>
          {[1, 2, 3, 4].map((n) => (
            <label key={n}>
              {n}
              <input
                type="radio"
                name="level"
                value={n}
                checked={level === n}
                onChange={() => setLevel(n)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className={styles.totalLine}>
        合計：<b>{formatHHMMSS(totalSec)}</b>{" "}
        <span
          className={`${styles.badge} ${over60min ? styles.badgeOk : styles.badgeNg}`}
        >
          {over60min ? "Ready" : "Need more"}
        </span>
      </div>

      <div className={styles.thumbnailPic}>
        <span>サムネイル画像</span>
        <div className={styles.field}>
          {/* <div className={styles.label}>Thumbnail</div> */}
          <button onClick={pickImage}>画像を選択</button>

          {imagePath && <div>{imagePath}</div>}

          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: 220,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnPrimary}
          disabled={selectedTracks.length === 0}
        >
          作業フォルダ作成（次：IPCで実装）
        </button>
        <button className={styles.btn} disabled>
          フォルダを開く（次：IPC）
        </button>
      </div>
    </section>
  );
}
