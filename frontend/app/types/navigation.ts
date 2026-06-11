// types/navigation.ts
export interface NavLink {
  href: string;
  label: string;
  submenu?: NavLink[];
}
