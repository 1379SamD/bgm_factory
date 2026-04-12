import styles from "./IdeaTab.module.css";

import { useState, useEffect } from "react";

type WeeklyPlanItem = {
  date: string;
  title: string;
  jpDescription: string;
  enDescription: string;
  hashtags: string;
};

type WeeklyPlan = {
  weekId: string;
  items: WeeklyPlanItem[];
};

export default function Idea() {
  const [jsons, setJsons] = useState<any[]>([]);
  const [jsonDetail, setJsonDetail] = useState<WeeklyPlan | null>(null);

  useEffect(() => {
    const loadJson = async () => {
      const dir = "D:\\youtubebgmContensJsonfile";

      const data = await window.api.loadJsonFiles(dir);
      setJsons(data);
    };

    loadJson();
  }, []);
  return (
    <div className={styles.columns}>
      <section className={styles.card}>
        <div className={styles.cardTitle}>CONTENTS FILE LIST</div>
        <div className={styles.jsonList}>
          {jsons.map((v) => (
            <div
              onClick={() => {
                setJsonDetail(v);
              }}
              // key={v.id}
              // className={styles.row}
            >
              <div className={styles.row}>{v.weekId}</div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.cardTitle}>WEEkLY PLANS</div>
        <div>
          {jsonDetail?.items.map((v) => (
            <div>
              <div>{v.date}</div>
              <div>{v.title}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
