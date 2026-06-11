// constants/navigation.ts
import { NavLink } from '@/app/types/navigation';

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Головна" },
  { href: "/plants", label: "Рослини" },
  { href: "/landscape-design", label: "Ландшафтний дизайн" },
  { href: "/contact", label: "Контакти" },
];

export const POPULAR_SEARCHES = ['монстера', 'кактуси', 'орхідеї', 'фікус', 'сукуленти', 'пальми'];
