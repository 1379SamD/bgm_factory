import { useState } from "react";
import styles from "./App.module.css";
import CreateTab from "./CreateTab";
import Header from "./Header";
import ScheduleTab from "./ScheduleTab";
import Idea from "./Idea";

type TabType = "create" | "schedule" | "idea";


export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  
  const [title, setTitle] = useState("");
  const [descJp, setDescJp] = useState("");
  const [descEn, setDescEn] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className={styles.app}>
      <Header setActiveTab={setActiveTab} />
      <main>
        {activeTab === "idea" && <Idea
          setTitle={setTitle}
          setDescJp={setDescJp}
          setDescEn={setDescEn}
          setHashtags={setHashtags}
          setActiveTab={setActiveTab}
          setDate={setDate}
        />
        }
        {activeTab === "create" && <CreateTab
          title={title}
          setTitle={setTitle}
          descJp={descJp}
          setDescJp={setDescJp}
          descEn={descEn}
          setDescEn={setDescEn}
          hashtags={hashtags}
          setHashtags={setHashtags}
          date={date}
          setDate={setDate}
        />
        }
        {activeTab === "schedule" && <ScheduleTab />}
      </main>
    </div>
  );
}
