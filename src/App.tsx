import {useState} from "react";
import styles from "./App.module.css";
import CreateTab from "./CreateTab";
import Header from "./Header";
import ScheduleTab from "./ScheduleTab"
import Idea from "./Idea"

type TabType = "create" | "schedule" | "idea";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("create");

  return (
    <div className={styles.app}>
      <Header setActiveTab={setActiveTab}/>
      <main>
        {activeTab === "idea" && <Idea />}
        {activeTab === "create" && <CreateTab />}
        {activeTab === "schedule" && <ScheduleTab/>}
      </main>
    </div>
  );
}
