import styles from "./ScheduleTab.module.css";
import { useState, useEffect } from "react";
import type { VideoMeta } from "./types/videoMeta";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function ScheduleTab() {
  const [jsons, setJsons] = useState<any[]>([]);
  const [jsonDetail, setJsonDetail] = useState<VideoMeta | null>(null);

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
      <section className={styles.jsonPanel}>
        <p className={styles.cardTitle}>JSONファイル一覧</p>
        <div className={styles.jsonList}>
          {jsons.map((v) => (
            <div
              onClick={() => {
                setJsonDetail(v);
              }}
              key={v.id}
              className={styles.row}
            >
              <div className={styles.listStyle}>
                <div>
                  <p className={styles.jsonTextTitle}>{v.title}</p>
                  <p className={styles.jsonTextTime}>{v.publishAt}</p>
                </div>
                <div className={styles.statusAndPost}>
                  <p className={styles.status}>{v.status}</p>
                  <button
                    className={styles.publishBtn}
                    onClick={async(e) => {
                      e.stopPropagation();

                      try {
                        await window.api.ScheduleOnePost(v);
                        console.log("予約投稿成功");
                      } catch (err) {
                        console.error("予約投稿失敗", err);
                      }
                    }}
                  >
                    予約投稿
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className={styles.detailPanel}>
          <p className={styles.cardTitle}>説明概要</p>
          <div className={styles.detailList}>
            {jsonDetail && (
              <div>
                <p className={styles.jsonDetailTitle}>{jsonDetail.title}</p>
                <p>{jsonDetail.jpDescription}</p>
                <p>{jsonDetail.enDescription}</p>
                <p>{jsonDetail.hashtags}</p>
              </div>
            )}
          </div>
        </div>
        <div className={styles.calendarPanel}>
          <p className={styles.cardTitle}>カレンダー</p>
          <Calendar />
        </div>
      </section>
    </div>
  );
}
