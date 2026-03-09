import styles from "./App.module.css";
import type { Track } from "./App.tsx";

type Props = {
  selectedTracks: Track[];
  formatMMSS: (totalSec: number) => string;
  formatHHMMSS: (totalSec: number) => string;
  totalSec: number;
  over60min: boolean;
};

export default function Center({
  selectedTracks,
  formatMMSS,
  formatHHMMSS,
  totalSec,
  over60min,
}: Props) {
  return (
    <section className={styles.cardWide}>
      <div className={styles.cardTitle}>BUILD</div>
      <div className={styles.cardSub}>
        選択した曲をまとめる（v1ではフォルダ作成は後でIPC）
      </div>

      <div className={styles.buildBox}>
        {selectedTracks.length === 0 ? (
          <div className={styles.muted}>
            左で曲をチェックするとここに表示される
          </div>
        ) : (
          selectedTracks.map((t) => (
            <div key={t.id} className={styles.buildRow}>
              <span style={{ flex: 1 }}>{t.name}</span>
              <span className={styles.muted}>{formatMMSS(t.durationSec)}</span>
            </div>
          ))
        )}
      </div>

      <div className={styles.totalLine}>
        合計：<b>{formatHHMMSS(totalSec)}</b>{" "}
        <span
          className={`${styles.badge} ${over60min ? styles.badgeOk : styles.badgeNg}`}
        >
          {over60min ? "Ready" : "Need more"}
        </span>
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
