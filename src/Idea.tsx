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

type TabType = "create" | "schedule" | "idea";

type Props = {
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setDescJp: React.Dispatch<React.SetStateAction<string>>;
  setDescEn: React.Dispatch<React.SetStateAction<string>>;
  setHashtags: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
};

export default function Idea({
  setTitle,
  setDescJp,
  setDescEn,
  setHashtags,
  setActiveTab,
  setDate,
}: Props) {
  const [jsons, setJsons] = useState<any[]>([]);
  const [jsonDetail, setJsonDetail] = useState<WeeklyPlan | null>(null);

  useEffect(() => {
    const loadJson = async () => {
      const dir = "D:/bgm-factory/ideas";

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
            <div
              onClick={() => {
                setTitle(v.title);
                setDescJp(v.jpDescription);
                setDescEn(v.enDescription);
                setHashtags(v.hashtags);
                setDate(v.date);
                setActiveTab("create");
              }}
            >
              <div className={styles.row}>
                <div>{v.date}</div>
                <div>{v.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
