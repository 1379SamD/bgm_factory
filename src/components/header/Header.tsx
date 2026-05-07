import styles from "./Header.module.css";
import { TabType } from "../../types/tabType";

type Props = {
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
};

export default function Header({ setActiveTab }: Props) {
  return (
    <div className={styles.header}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div className={styles.brand}>BGM Factory</div>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("idea")}
          className={`${styles.tab}`}
        >
          Ideas
        </button>
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
