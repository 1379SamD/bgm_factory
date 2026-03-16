import styles from "./App.module.css";

type Props = {
  selectedCount: number;
  totalSecTime: string;
  over60min: boolean;
};

export default function Header({
  selectedCount,
  totalSecTime,
  over60min,
}: Props) {
  return (
    <div className={styles.header}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className={styles.brand}>BGM Factory</div>
        <div className={styles.sub}>
          選択 {selectedCount}曲 / 合計 {totalSecTime}{" "}
          <span
            className={`${styles.badge} ${over60min ? styles.badgeOk : styles.badgeNg}`}
          >
            {over60min ? "✓ 60分超え" : "60分未満"}
          </span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.tabActive}`}>Create</button>
        <button className={styles.tab} disabled>
          Publish（v2）
        </button>
        <button className={styles.tab} disabled>
          Analytics（後で）
        </button>
      </div>
    </div>
  );
}
