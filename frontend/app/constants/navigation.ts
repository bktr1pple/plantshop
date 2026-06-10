// constants/navigation.ts
import { NavLink } from '@/app/types/navigation';

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Головна" },
  { 
    href: "/plants", 
    label: "Рослини", 
    submenu: [
      { href: "/plants", label: "Кімнатні рослини" },
      { href: "/plants", label: "Садові рослини" },
      { href: "/plants", label: "Кактуси та сукуленти" },
      { href: "/plants", label: "Рідкісні види" },
    ]
  },
  { href: "/landscape-design", label: "Ландшафтний дизайн" },
  { href: "/contact", label: "Контакти" },
];

export const POPULAR_SEARCHES = ['монстера', 'кактуси', 'орхідеї', 'фікус', 'сукуленти', 'пальми'];
