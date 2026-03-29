import styles from "./ScheduleTab.module.css";
import { useState, useEffect } from "react";

export default function ScheduleTab() {
  const [jsons, setJsons] = useState<any[]>([]);

  useEffect(() => {
    const loadJson = async () => {
      const dir = "D:\\youtubeBGMPostReservation";

      const data = await window.api.loadJsonFiles(dir);
      setJsons(data);
    };

    loadJson();
  }, []);

  return (
    <div className={styles.columns}>
      <section className={styles.card}>
        <p className={styles.cardTitle}>JSONファイル一覧</p>
        <div className={styles.jsonList}>
          {jsons.map((v) => (
            <div key={v.id} className={styles.row}>
              <div className={styles.listStyle}>
                <div>
                  <p className={styles.jsonTextTitle}>{v.title}</p>
                  <p className={styles.jsonTextTime}>{v.publishAt}</p>
                </div>
                <button className={styles.publishBtn}>予約投稿</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.card}></section>
    </div>
  );
}
