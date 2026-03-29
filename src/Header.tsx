import styles from "./App.module.css";

type TabType = "create" | "schedule";
type Props = {
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
};

export default function Header({ setActiveTab }: Props) {
  return (
    <div className={styles.header}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className={styles.brand}>BGM Factory</div>
        {/* <div className={styles.sub}>
          選択 {selectedCount}曲 / 合計 {totalSecTime}{" "}
          <span
            className={`${styles.badge} ${over60min ? styles.badgeOk : styles.badgeNg}`}
          >
            {over60min ? "✓ 60分超え" : "60分未満"}
          </span>
        </div> */}
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("create")}
          className={`${styles.tab} ${styles.tabActive}`}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={styles.tab}
        >
          Schedule
        </button>
        <button className={styles.tab}>
          Analytics
        </button>
      </div>
    </div>
  );
}
