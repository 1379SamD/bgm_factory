import type {WeeklyPlanItem} from "./weeklyPlanItem";

export type WeeklyPlan = {
  weekId: string;
  items: WeeklyPlanItem[];
};