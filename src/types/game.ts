export interface GameDataRow {
  GroupID: string;
  TextID: string;
  Comment: string;
  ko: string;
  en: string;
  jp: string;
  zh: string;
  "zh-cht": string;
  "pt-br": string;
  pt: string;
  "es-la": string;
  es: string;
  fr: string;
  de: string;
  ru: string;
  [key: string]: string;
}

export type DataCategory = "skills" | "items" | "boosters" | "metaprogress" | "weapons" | "weapon_modify";

export interface CategoryConfig {
  id: DataCategory;
  label: string;
  file: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "skills", label: "Skills", file: "skills.csv" },
  { id: "items", label: "Items", file: "items.csv" },
  { id: "boosters", label: "Boosters", file: "boosters.csv" },
  { id: "metaprogress", label: "Metaprogress", file: "metaprogress.csv" },
  { id: "weapons", label: "Weapons", file: "weapons.csv" },
  { id: "weapon_modify", label: "Weapon Modify", file: "weapon_modify.csv" },
];
