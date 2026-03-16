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
  const [imagePath, setImagePath] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

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

  const pickImage = async () => {
    const result = await window.api.pickImage();
    if (!result) return;

    setImagePath(result.path);
    setPreviewUrl(result.previewUrl);
  };

  const imageSrc = imagePath ? `file:///${imagePath.replace(/\\/g, "/")}` : "";

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

        {/* Center */}
        <Center
          selectedTracks={selectedTracks}
          formatMMSS={formatMMSS}
          formatHHMMSS={formatHHMMSS}
          totalSec={totalSec}
          over60min={over60min}
          imagePath={imagePath}
          pickImage={pickImage}
          imageSrc={imageSrc}
          previewUrl={previewUrl}
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
        />
      </div>
    </div>
  );
}
