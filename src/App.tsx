import { useMemo, useState, useEffect } from "react";
import Header from "./Header";
import Left from "./Left";
import Center from "./Center";
import Right from "./Right";
import style from "./App.module.css";

export type Track = {
  id: string;
  name: string;
  durationSec: number;
  fullPath: string;
};

// BGM一曲の演奏時間
function formatMMSS(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
// BGMの合計時間
function formatHHMMSS(totalSec: number) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [descJp, setDescJp] = useState("");
  const [descEn, setDescEn] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [thumbnailPath, setThumbnailPath] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [backgroundPath, setBackgroundPath] = useState("");
  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [saveDir, setSaveDir] = useState("D:\\youtubeBGMPostReservation");
  const [date, setDate] = useState("");
  const [publishTime, setPublishTime] = useState("22:00");

  const currentDate = (): string => {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1); // 注意：0始まり
    const day = String(now.getDate());
    const hour = String(now.getHours());
    const min = String(now.getMinutes());
    const sec = String(now.getSeconds());
    return year + month + day + hour + min + sec;
  };

  const handlePickFolder = async () => {
    const result = await window.api.pickFolder();
    if (result === null) return;

    setSaveDir(result);
  };

  const handleSaveVideoMeta = async () => {
    if (!date || !publishTime) {
      alert("投稿日と投稿時間を選択してください");
      return;
    };
    
    //メインフォルダ配下に、予約投稿に合わせてフォルダを作成する
    const targetDir = await window.api.saveVideoMeta(saveDir, date, publishTime);
    
    const now = new Date();
    const meta = {
      id: `${date}_${Date.now()}`,
      title: title,
      bgmDetail: selectedTracks,
      jpDescription: descJp,
      EnDescription: descEn,
      hashtags: hashtags,
      thumbnailPath: thumbnailPath,
      videoPath: "",
      status: "pending",
      visibility: "private",
      publishAt: `${date}T${publishTime}`,
      createdAt: now.toISOString(),
    };

    await window.api.saveMeta(
      targetDir.dirPath,
      meta
    );

    //wavファイル連結処理
    await window.api.wavFileConcat(meta.bgmDetail, targetDir.dirPath);
  };

  useEffect(() => {
    const load = async () => {
      try {
        console.log("window.api", (window as any).api);

        if (!window.api?.loadFixedMp3) {
          console.error("window.api is undefined (preload not loaded)");
          return;
        }
        const res = await window.api.loadFixedMp3();
        console.log("loadFixedMp3 res:", res);

        if (res.ok) {
          setTracks(res.files);
        } else {
          console.error(res.error);
          alert(`MP3読み込み失敗: ${res.error ?? "unknown"}`);
        }
      } catch (e) {
        console.error("loadFixedMp3 threw:", e);
        alert(`例外: ${String(e)}`);
      }
    };
    load();
  }, []);

  const selectedTracks = useMemo(
    () => tracks.filter((t) => selectedIds.has(t.id)),
    [tracks, selectedIds],
  );

  const totalSec = useMemo(
    () => selectedTracks.reduce((sum, t) => sum + t.durationSec, 0),
    [selectedTracks],
  );

  const over60min = totalSec >= 60 * 60;

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(tracks.map((t) => t.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const saveMetaToLocal = () => {
    const payload = {
      title,
      description_jp: descJp,
      description_en: descEn,
      hashtags,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("bgmFactory:meta", JSON.stringify(payload, null, 2));
    alert("保存しました（localStorage）。次はIPCでmeta.jsonに保存する！");
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("コピーしました");
  };

  const pickImage = async (
    setImagePath: (v: string) => void,
    setPreviewUrl: (v: string) => void,
  ) => {
    const result = await window.api.pickImage();
    if (!result) return;

    setImagePath(result.path);
    setPreviewUrl(result.previewUrl);
  };

  const thumbnailSrc = thumbnailPath
    ? `file:///${thumbnailPath.replace(/\\/g, "/")}`
    : "";
  const backgroundSrc = backgroundPath
    ? `file:///${backgroundPath.replace(/\\/g, "/")}`
    : "";

  // const saveDir1 = `${date}`;

  const formatDate = (date: string) => {
    return date.replace(/-/g, "");
  };

  return (
    <div className={style.app}>
      {/* Header */}
      <Header
        selectedCount={selectedTracks.length}
        totalSecTime={formatHHMMSS(totalSec)}
        over60min={over60min}
      />

      {/* columns */}
      <div className={style.columns}>
        {/* Left */}
        <Left
          tracks={tracks}
          selectedIds={selectedIds}
          toggle={toggle}
          formatMMSS={formatMMSS}
          selectAll={selectAll}
          clearAll={clearAll}
        />

        <section className={style.test}>
          <div className={style.test1}>
            {/* Center */}
            <Center
              selectedTracks={selectedTracks}
              formatMMSS={formatMMSS}
              formatHHMMSS={formatHHMMSS}
              totalSec={totalSec}
              over60min={over60min}
              pickImage={pickImage}
              // thumbnailSrc={thumbnailSrc}
              setThumbnailPath={setThumbnailPath}
              thumbnailPreview={thumbnailPreview}
              setThumbnailPreview={setThumbnailPreview}
              // backgroundSrc={backgroundSrc}
              setBackgroundPath={setBackgroundPath}
              backgroundPreview={backgroundPreview}
              setBackgroundPreview={setBackgroundPreview}
            />

            {/* Right */}
            <Right
              title={title}
              setTitle={setTitle}
              descJp={descJp}
              setDescJp={setDescJp}
              descEn={descEn}
              setDescEn={setDescEn}
              hashtags={hashtags}
              setHashtags={setHashtags}
              saveMetaToLocal={saveMetaToLocal}
              copy={copy}
              setDate={setDate}
              date={date}
              setPublishTime={setPublishTime}
              publishTime={publishTime}
            />
          </div>
          <div className={style.test2}>
            <p className={style.saveFolder}>
              {/* D:\\youtubeBGMPostReservation\\{currentDate()}\\
               */}
              {/* {saveDir}{formatDate(`${date}`)}_{title.split(" ")[0]} */}
              {saveDir}
              {formatDate(`${date}`)}
            </p>
            <div className={style.test3}>
              <div className={style.saveFolderBtn}>
                <button
                  className={style.folderSelectBtn}
                  onClick={handlePickFolder}
                >
                  メインフォルダ選択
                </button>
                <button
                  className={style.generateBtn}
                  onClick={handleSaveVideoMeta}
                >
                  生成
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
