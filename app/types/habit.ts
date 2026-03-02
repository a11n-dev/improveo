/** Editable form state shared by habit create/edit overlays. */
export interface HabitFormDraft {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
}
