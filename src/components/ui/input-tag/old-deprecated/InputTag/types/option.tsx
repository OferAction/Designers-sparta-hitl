export interface Option {
  value: string;
  label: string;
  icon?: React.FC<any>;
  command?: string;
  children?: Option[];
  isTitle?: boolean;
  isSubTitle?: boolean;
  keywords?: string[];
  type?: string;
}
