import styles from "./App.module.css";
import type { Track } from "./types/track.ts";
// import { useState } from "react";

type Props = {
  selectedTracks: Track[];
  formatMMSS: (totalSec: number) => string;
  formatHHMMSS: (totalSec: number) => string;
  totalSec: number;
  over60min: boolean;
  // imagePath: string;
  pickImage: (
    setPath: (v: string) => void,
    setPreview: (v: string) => void,
  ) => void;
  // imageSrc: string;
  // previewUrl: string;

  setThumbnailPath: (v: string) => void;
  setThumbnailPreview: (v: string) => void;
  setBackgroundPath: (v: string) => void;
  setBackgroundPreview: (v: string) => void;
  thumbnailPreview: string;
  backgroundPreview: string;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  crossFead: number;
  setCrossFead: React.Dispatch<React.SetStateAction<number>>;
};

export default function Center({
  selectedTracks,
  formatMMSS,
  formatHHMMSS,
  totalSec,
  pickImage,
  setThumbnailPath,
  setThumbnailPreview,
  setBackgroundPath,
  setBackgroundPreview,
  thumbnailPreview,
  backgroundPreview,
  level,
  setLevel,
  crossFead,
  setCrossFead,
}: Props) {
  // const [level, setLevel] = useState(3);
  // const [crossFead, setCrossFead] = useState(3);
  let sumIncludingLoops = totalSec * level;
  let loopsOver60min = sumIncludingLoops >= 60 * 60;

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
                  minWidth: 0,
                  display: "block",
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
        <span className={styles.cardTitle}>ループ回数：{level}回</span>
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

      <div className={styles.roopCounter}>
        <span className={styles.cardTitle}>
          クロスフェード：{crossFead === 0 ? "なし" : crossFead + "秒"}
        </span>
        <div className={styles.roopSelectNum}>
          {[0, 1, 2, 3].map((n) => (
            <label key={n}>
              {n}
              <input
                type="radio"
                name="crossFead"
                value={n}
                checked={crossFead === n}
                onChange={() => setCrossFead(n)}
              />
            </label>
          ))}
        </div>
      </div>

      <div className={styles.totalLine}>
        <span>
          <b>
            {formatHHMMSS(
              crossFead === 0
                ? sumIncludingLoops
                : sumIncludingLoops -
                    crossFead * Math.max(0, selectedTracks.length - 1),
            )}
          </b>
        </span>
        <span
          className={`${styles.badge} ${loopsOver60min ? styles.badgeOk : styles.badgeNg}`}
        >
          {loopsOver60min ? "Ready" : "Need more"}
        </span>
      </div>

      <div className={styles.thumbnailPic}>
        <div className={styles.pic}>
          <span className={styles.cardTitle}>サムネイル画像：</span>
          <button
            onClick={() => pickImage(setThumbnailPath, setThumbnailPreview)}
            className={styles.picButton}
          >
            画像を選択
          </button>
        </div>

        <div className={styles.imgSize}>
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
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

        <div className={styles.pic}>
          <span className={styles.cardTitle}>背景画像：</span>
          <button
            onClick={() => pickImage(setBackgroundPath, setBackgroundPreview)}
            className={styles.picButton}
          >
            画像を選択
          </button>
        </div>

        <div className={styles.imgSize}>
          {backgroundPreview && (
            <img
              src={backgroundPreview}
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
    </section>
  );
}
