// types/navigation.ts
export interface NavLink {
  href: string;
  label: string;
  submenu?: NavLink[];
}

export interface AuthForm {
  name: string;
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  name: string;
  email: string;
}

export type AnimationVariants = Record<string, Record<string, unknown>>;
