import styles from "./App.module.css";
import type {Track} from "./App.tsx";

type Props = {
  tracks: Track[]
  selectedIds: Set<string>
  toggle: (id: string) => void
  formatMMSS: (totalSec: number) => string
  selectAll: () => void
  clearAll: () => void
}

export default function Left({tracks, selectedIds, toggle, formatMMSS, selectAll, clearAll}: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.cardTitle}>TRACKS</div>
      <div className={styles.cardSub}>sunoai BGM</div>

      <div className={styles.list}>
        {tracks.map((t) => (
          <label key={t.id} className={styles.row}>
            <input
              type="checkbox"
              checked={selectedIds.has(t.id)}
              onChange={() => toggle(t.id)}
            />
            <span className={styles.trackName}>{t.name}</span>
            <span className={styles.muted}>{formatMMSS(t.durationSec)}</span>
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
