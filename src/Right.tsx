import styles from "./App.module.css";
import { useState } from "react";

type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  descJp: string;
  setDescJp: React.Dispatch<React.SetStateAction<string>>;
  descEn: string;
  setDescEn: React.Dispatch<React.SetStateAction<string>>;
  hashtags: string;
  setHashtags: React.Dispatch<React.SetStateAction<string>>;
  saveMetaToLocal: () => void;
  copy: (text: string) => Promise<void>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setPublishTime: React.Dispatch<React.SetStateAction<string>>;
  publishTime: string;
};

export default function Right({
  title,
  setTitle,
  descJp,
  setDescJp,
  descEn,
  setDescEn,
  hashtags,
  setHashtags,
  saveMetaToLocal,
  copy,
  setDate,
  date,
  setPublishTime,
  publishTime,
}: Props) {
  // const [publishTime, setPublishTime] = useState("22:00");

  const metaDataCheck = (): boolean => {
    if (title === "" || descJp === "" || descEn === "" || hashtags === "") {
      return false;
    } else {
      return true;
    }
  };

  return (
    <section className={styles.rightCard}>
      <div className={styles.rightTitle}>
        <div className={styles.cardTitle}>METADATA</div>
        <span
          className={`${styles.badge} ${metaDataCheck() ? styles.badgeOk : styles.badgeNg}`}
        >
          {metaDataCheck() ? "Ready" : "Need more"}
        </span>
      </div>
      <div className={styles.field}>
        <div className={styles.label}>Post Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          id="publishTime"
          value={publishTime}
          onChange={(e) => setPublishTime(e.target.value)}
          className={styles.select}
        >
          <option value="07:00">07:00</option>
          <option value="08:00">08:00</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="12:00">12:00</option>
          <option value="18:00">18:00</option>
          <option value="19:00">19:00</option>
          <option value="20:00">20:00</option>
          <option value="21:00">21:00</option>
          <option value="22:00">22:00</option>
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Title</div>
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>JP Description</div>
        <textarea
          className={styles.textarea}
          value={descJp}
          onChange={(e) => setDescJp(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>EN Description</div>
        <textarea
          className={styles.textarea}
          value={descEn}
          onChange={(e) => setDescEn(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Hashtags</div>
        <textarea
          className={styles.hashtagsInput}
          placeholder="#SleepMusic #作業用BGM ..."
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />
      </div>

      <div className={styles.actionsCol}>
        <button className={styles.btnPrimary} onClick={saveMetaToLocal}>
          JSON保存
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(title)}
          disabled={!title}
        >
          Title Copy
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(descJp + "\n\n" + descEn)}
          disabled={!descJp && !descEn}
        >
          Description Copy（JP+EN）
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(hashtags)}
          disabled={!hashtags}
        >
          Hashtags Copy
        </button>
      </div>
    </section>
  );
}
