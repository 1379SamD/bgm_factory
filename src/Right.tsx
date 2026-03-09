import styles from "./App.module.css";

type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  descJp: string;
  setDescJp: React.Dispatch<React.SetStateAction<string>>;
  descEn: string;
  setDescEn: React.Dispatch<React.SetStateAction<string>>;
  hashtags: string;
  setHashtags: React.Dispatch<React.SetStateAction<string>>;
  saveMetaToLocal: () => void
  copy: (text: string) => Promise<void>
};

export default function Right({ title, setTitle, descJp, setDescJp, descEn, setDescEn, hashtags, setHashtags, saveMetaToLocal, copy}: Props) {
  return (
    <section className={styles.card}>
      <div className={styles.cardTitle}>METADATA</div>
      <div className={styles.cardSub}>投稿用メタ（先に保存しておく）</div>

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
        <input
          className={styles.input}
          placeholder="#SleepMusic #作業用BGM ..."
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />
      </div>

      <div className={styles.actionsCol}>
        <button className={styles.btnPrimary} onClick={saveMetaToLocal}>
          JSON保存（今はlocalStorage）
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(title)}
          disabled={!title}
        >
          タイトルコピー
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(descJp + "\n\n" + descEn)}
          disabled={!descJp && !descEn}
        >
          説明コピー（JP+EN）
        </button>
        <button
          className={styles.btn}
          onClick={() => copy(hashtags)}
          disabled={!hashtags}
        >
          タグコピー
        </button>
      </div>
    </section>
  );
}
