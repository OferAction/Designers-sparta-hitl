export interface GTMenuItem {
  id: string;
  label: string;
  value?: string;
  icon?: React.ReactNode;
  section?: "recents" | "all";
  isGroupTitle?: boolean;
  type?: string;
}
