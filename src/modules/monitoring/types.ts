export type CardConfigKeys = "coverage" | "exex" | "accuracy";

export type CardConfig = {
  key: CardConfigKeys;
  title: string;
  icon: React.ReactNode;
  value: string;
  subtitle: string;
  extra?: Array<{
    label: string;
    color: string;
  }>;
  tooltip?: string;
};
