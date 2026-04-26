import styles from "./App.module.css";
import type { Track } from "./types/track";

type Props = {
  tracks: Track[];
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  formatMMSS: (totalSec: number) => string;
  selectAll: () => void;
  clearAll: () => void;
  selectedCount: number;
  totalSecTime: string;
  over60min: boolean;
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
};

type Status = "unchecked" | "ok" | "noise";

function getStatus(fileName: string): Status {
  if (fileName.includes("__noise")) return "noise";
  if (fileName.includes("__ok")) return "ok";
  return "unchecked";
}

function StatusLabel({ fileName }: { fileName: string }) {
  const status = getStatus(fileName);

  if (status === "noise") {
    return <span className={`${styles.badge} ${styles.ng}`}>ノイズあり</span>;
  }

  if (status === "ok") {
    return <span className={`${styles.badge} ${styles.ok}`}>ノイズなし</span>;
  }

  return <span className={`${styles.badge} ${styles.pending}`}>未判定</span>;
}

export default function Left({
  tracks,
  selectedIds,
  toggle,
  formatMMSS,
  selectAll,
  clearAll,
  selectedCount,
  totalSecTime,
  setTracks,
}: Props) {

  const deleteWavFile = async (path: string) => {
    await window.api.DeleteWavFile(path);
    setTracks((prev) => prev.filter((track) => track.fullPath !== path));
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardTitle}>TRACKS</div>
      <div className={styles.cardSub}>sunoai BGM</div>

      <div className={styles.sub}>
        選択 {selectedCount}曲 / 合計 {totalSecTime}{" "}
      </div>

      <div className={styles.list}>
        {tracks.map((t) => (
          <label key={t.id} className={styles.trackRow}>
            <div className={styles.trackMain}>
              <input
                type="checkbox"
                checked={selectedIds.has(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span className={styles.trackName}>{t.name}</span>
              <span className={styles.muted}>{formatMMSS(t.durationSec)}</span>
            </div>
            <div className={styles.trackActions}>
              <StatusLabel fileName={t.fullPath} />
              <button
                onClick={() => deleteWavFile(t.fullPath)}
                className={styles.delete}
              >
                削除
              </button>
            </div>
          </label>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} onClick={selectAll}>
          全選択
        </button>
        <button className={styles.btnGhost} onClick={clearAll}>
          解除
        </button>
      </div>
    </section>
  );
}
