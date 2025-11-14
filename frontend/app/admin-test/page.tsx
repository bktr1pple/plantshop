"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye,
  Download,
  Upload,
  Settings,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronDown,
  BarChart3,
  CreditCard,
  Bell,
  Menu,
  Sun,
  Moon,
  LogOut,
  Home,
  Tag,
  Star,
  Shield,
  MessageSquare,
  Image,
  FolderOpen,
  ClipboardList,
  Truck,
  RefreshCw,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Створюємо клієнт QueryClient
const queryClient = new QueryClient();

// Типи даних
type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'admin' | 'user' | 'moderator';
  joinDate: string;
  lastLogin: string;
  orders: number;
  totalSpent: number;
  avatar?: string;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  sales: number;
  createdAt: string;
  images: string[];
  description: string;
  rating: number;
  tags: string[];
};

type Order = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  date: string;
  items: number;
  address: string;
  payment: 'card' | 'cash' | 'paypal';
  trackingNumber?: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
};

// Схеми валідації
const userFormSchema = z.object({
  name: z.string().min(2, 'Ім\'я повинно містити мінімум 2 символи'),
  email: z.string().email('Введіть коректний email'),
  phone: z.string().min(10, 'Введіть коректний номер телефону'),
  role: z.enum(['admin', 'user', 'moderator']),
  status: z.enum(['active', 'inactive']),
});

const productFormSchema = z.object({
  name: z.string().min(2, 'Назва повинна містити мінімум 2 символи'),
  category: z.string().min(1, 'Виберіть категорію'),
  price: z.number().min(1, 'Ціна повинна бути більше 0'),
  stock: z.number().min(0, 'Кількість не може бути від\'ємною'),
  description: z.string().min(10, 'Опис повинен містити мінімум 10 символів'),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type ProductFormValues = z.infer<typeof productFormSchema>;

// Генерація мокових даних
const generateMockData = () => {
  const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: ['Олександр Іванов', 'Марія Петрова', 'Дмитро Сидоров', 'Олена Коваль', 'Сергій Шевченко'][i % 5],
    email: `user${i + 1}@example.com`,
    phone: `+38 (0${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 100)}${Math.floor(Math.random() * 100)}`,
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    role: ['admin', 'user', 'moderator'][Math.floor(Math.random() * 3)] as any,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    orders: Math.floor(Math.random() * 50),
    totalSpent: Math.floor(Math.random() * 50000),
  }));

  const mockProducts: Product[] = Array.from({ length: 20 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: ['Монстера Деліціоза', 'Фікус Бенджаміна', 'Суккулент Мікс', 'Орхідея Фаленопсис', 'Кактус Декабрист', 'Бамбук Щастя', 'Лаврове Дерево', 'Фіалка Узамбарська'][i % 8],
    category: ['Декоративні', 'Суккуленти', 'Квітучі', 'Дерева', 'Кактуси'][Math.floor(Math.random() * 5)],
    price: [1200, 800, 350, 1500, 600, 450, 900, 1200][i % 8],
    stock: Math.floor(Math.random() * 50),
    status: Math.random() > 0.7 ? 'out_of_stock' : Math.random() > 0.5 ? 'low_stock' : 'in_stock',
    sales: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    images: [],
    description: 'Красива рослина для вашого дому або офісу',
    rating: Math.floor(Math.random() * 5) + 1,
    tags: ['популярне', 'новинка', 'зі знижкою'].slice(0, Math.floor(Math.random() * 3)),
  }));

  const mockOrders: Order[] = Array.from({ length: 30 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: mockUsers[i % mockUsers.length].name,
    email: mockUsers[i % mockUsers.length].email,
    amount: Math.floor(Math.random() * 5000) + 500,
    status: ['pending', 'processing', 'delivered', 'cancelled'][Math.floor(Math.random() * 4)] as any,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: Math.floor(Math.random() * 5) + 1,
    address: `вул. Прикладна, буд. ${Math.floor(Math.random() * 100)}, кв. ${Math.floor(Math.random() * 100)}`,
    payment: ['card', 'cash', 'paypal'][Math.floor(Math.random() * 3)] as any,
    trackingNumber: Math.random() > 0.3 ? `TRK${Math.floor(Math.random() * 1000000)}` : undefined,
  }));

  const mockNotifications: Notification[] = [
    { id: '1', title: 'Нове замовлення', message: 'Надйшло нове замовлення ORD-1045', type: 'info', date: new Date().toISOString(), read: false },
    { id: '2', title: 'Низький запас', message: 'Фікус Бенджаміна закінчується', type: 'warning', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
    { id: '3', title: 'Замовлення доставлено', message: 'Замовлення ORD-1032 успішно доставлено', type: 'success', date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: true },
  ];

  return { mockUsers, mockProducts, mockOrders, mockNotifications };
};

const { mockUsers, mockProducts, mockOrders, mockNotifications } = generateMockData();

// API функції (мокові)
const fetchUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockUsers;
};

const fetchProducts = async (): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockProducts;
};

const fetchOrders = async (): Promise<Order[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return mockOrders;
};

const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockNotifications;
};

const createUser = async (user: UserFormValues): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    ...user,
    phone: '+38 (000) 000-00-00',
    joinDate: new Date().toISOString().split('T')[0],
    lastLogin: new Date().toISOString().split('T')[0],
    orders: 0,
    totalSpent: 0,
  };
  return newUser;
};

const updateUser = async (id: string, user: UserFormValues): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const updatedUser: User = {
    id,
    ...user,
    phone: '+38 (000) 000-00-00',
    joinDate: '2023-01-01',
    lastLogin: new Date().toISOString().split('T')[0],
    orders: 0,
    totalSpent: 0,
  };
  return updatedUser;
};

const deleteUser = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
};

const createProduct = async (product: ProductFormValues): Promise<Product> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const newProduct: Product = {
    id: Math.random().toString(36).substr(2, 9),
    ...product,
    status: product.stock > 10 ? 'in_stock' : product.stock > 0 ? 'low_stock' : 'out_of_stock',
    sales: 0,
    createdAt: new Date().toISOString().split('T')[0],
    images: [],
    rating: 0,
    tags: [],
  };
  return newProduct;
};

// Компоненти таблиць
const userColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent dark:hover:bg-transparent p-0 font-semibold text-xs sm:text-sm"
        >
          Ім'я
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shrink-0">
          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{row.getValue('name')}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Роль',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const roleConfig = {
        admin: { label: 'Адмін', class: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-800 text-xs' },
        user: { label: 'Користувач', class: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs' },
        moderator: { label: 'Модератор', class: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-800 text-xs' },
      };
      
      return (
        <Badge variant="outline" className={cn("font-medium", roleConfig[role as keyof typeof roleConfig]?.class)}>
          {roleConfig[role as keyof typeof roleConfig]?.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <div className="flex items-center">
          {status === 'active' ? (
            <>
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 sm:mr-2 animate-pulse shrink-0" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs sm:text-sm">Активний</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-1 sm:mr-2 shrink-0" />
              <span className="text-gray-600 dark:text-gray-400 font-medium text-xs sm:text-sm">Неактивний</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'orders',
    header: 'Замовлення',
    cell: ({ row }) => (
      <div className="font-semibold text-gray-900 dark:text-white text-center text-xs sm:text-sm">
        {row.getValue('orders')}
      </div>
    ),
  },
  {
    accessorKey: 'totalSpent',
    header: 'Всього витрачено',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('totalSpent'));
      const formatted = new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount);
      return <div className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{formatted}</div>;
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Останній вхід',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastLogin'));
      return (
        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          {date.toLocaleDateString('uk-UA')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const [isEditOpen, setIsEditOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);

      const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setIsDeleteOpen(false);
        },
      });

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="sr-only">Відкрити меню</span>
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-48">
              <DropdownMenuLabel className="text-gray-900 dark:text-white text-xs">Дії</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer text-xs"
              >
                Копіювати ID
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem 
                className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer text-xs"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit className="h-3 w-3 mr-2" />
                Редагувати
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-xs"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Діалог редагування */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
                  Редагувати користувача
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Внесіть зміни в інформацію про користувача.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Ім'я</Label>
                  <Input defaultValue={user.name} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Email</Label>
                  <Input defaultValue={user.email} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Роль</Label>
                    <Select defaultValue={user.role}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="user" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Користувач</SelectItem>
                        <SelectItem value="moderator" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Модератор</SelectItem>
                        <SelectItem value="admin" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Адміністратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300 font-medium text-sm">Статус</Label>
                    <Select defaultValue={user.status}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectItem value="active" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Активний</SelectItem>
                        <SelectItem value="inactive" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Неактивний</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto order-2 sm:order-1 text-sm"
                >
                  Скасувати
                </Button>
                <Button 
                  type="submit"
                  className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg w-full sm:w-auto order-1 sm:order-2 text-sm"
                >
                  Зберегти зміни
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Діалог видалення */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
                  Видалити користувача
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  Ви впевнені, що хочете видалити користувача {user.name}? Цю дію не можна скасувати.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full sm:w-auto order-2 sm:order-1 text-sm"
                >
                  Скасувати
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(user.id)}
                  disabled={deleteMutation.isPending}
                  className="w-full sm:w-auto order-1 sm:order-2 text-sm"
                >
                  {deleteMutation.isPending ? 'Видалення...' : 'Видалити'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];

// Основний компонент адмін-панелі
function AdminContent() {
  const [activeTab, setActiveTab] = useState<'users' | 'products' | 'orders' | 'analytics' | 'settings'>('users');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const queryClient = useQueryClient();

  // Визначення мобільного пристрою
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Завантаження теми з localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Збереження теми в localStorage
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // React Query запити
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData);
    }
  }, [notificationsData]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateUserOpen(false);
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateProductOpen(false);
    },
  });

  // Forms
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
    },
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
    },
  });

  // Таблиця користувачів з адаптацією для мобільних
  const mobileUserColumns = React.useMemo(() => {
    if (isMobile) {
      return userColumns.filter(col => {
        // Безпечна перевірка наявності accessorKey
        const hasAccessorKey = 'accessorKey' in col;
        const accessorKeyValue = hasAccessorKey ? (col as any).accessorKey : null;
        
        return (
          col.id === 'select' || 
          accessorKeyValue === 'name' || 
          accessorKeyValue === 'status' || 
          col.id === 'actions'
        );
      });
    }
    return userColumns;
  }, [isMobile, userColumns]);

  const userTable = useReactTable({
    data: users || [],
    columns: mobileUserColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Статистика
  const stats = [
    {
      title: 'Всього користувачів',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Всього замовлень',
      value: '856',
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      gradient: 'from-emerald-500 to-green-500',
    },
    {
      title: 'Товари в наявності',
      value: '156',
      change: '+5%',
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      gradient: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Загальний дохід',
      value: '₴245,678',
      change: '+15%',
      icon: DollarSign,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const navigationItems = [
    { id: 'users', label: 'Користувачі', icon: Users, description: 'Управління користувачами' },
    { id: 'products', label: 'Товари', icon: Package, description: 'Каталог товарів' },
    { id: 'orders', label: 'Замовлення', icon: ShoppingCart, description: 'Історія замовлень' },
    { id: 'analytics', label: 'Аналітика', icon: BarChart3, description: 'Статистика та звіти' },
    { id: 'settings', label: 'Налаштування', icon: Settings, description: 'Налаштування системи' },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const onSubmitUser = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  const onSubmitProduct = (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className={cn(
      "min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-x-hidden"
    )}>
      {/* Верхня панель */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-9 w-9"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                    PlantAdmin
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Панель управління магазином</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-9 w-9"
              >
                {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-9 w-9">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[90vw]">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                    <DropdownMenuLabel className="text-gray-900 dark:text-white p-0 text-sm">Сповіщення</DropdownMenuLabel>
                    {unreadNotifications > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-auto p-0">
                        Прочитати всі
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem 
                          key={notification.id}
                          className={cn(
                            "p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-700",
                            !notification.read && "bg-blue-50 dark:bg-blue-500/10"
                          )}
                          onClick={() => setNotifications(notifications.map(n => 
                            n.id === notification.id ? { ...n, read: true } : n
                          ))}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 shrink-0",
                              notification.type === 'info' && "bg-blue-500",
                              notification.type === 'warning' && "bg-yellow-500",
                              notification.type === 'success' && "bg-green-500",
                              notification.type === 'error' && "bg-red-500"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {notification.title}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 truncate">
                                {notification.message}
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                {new Date(notification.date).toLocaleDateString('uk-UA')}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Немає сповіщень
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 h-auto">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shrink-0">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Адміністратор</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@plantshop.com</p>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-48">
                  <DropdownMenuLabel className="text-gray-900 dark:text-white text-sm">Мій акаунт</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer text-sm">
                    <User className="h-3 w-3 mr-2" />
                    Профіль
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer text-sm">
                    <Settings className="h-3 w-3 mr-2" />
                    Налаштування
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-sm">
                    <LogOut className="h-3 w-3 mr-2" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Бічна панель */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:bg-white/80 lg:dark:bg-gray-800/80",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between lg:justify-start">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Навігація</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 p-2 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-left transition-all duration-200 group rounded-lg",
                    activeTab === item.id
                      ? "bg-linear-to-r from-emerald-500/10 to-cyan-500/10 border-r-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <div className={cn(
                    "p-1.5 sm:p-2 rounded-lg transition-all duration-200 group-hover:scale-110 shrink-0",
                    activeTab === item.id 
                      ? "bg-linear-to-br from-emerald-500 to-cyan-500 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  )}>
                    <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base">{item.label}</div>
                    <div className="text-xs opacity-60 truncate">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>
            <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-linear-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg p-3 sm:p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Потрібна допомога?</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Зверніться до служби підтримки</p>
                <Button size="sm" className="w-full bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-xs h-8">
                  <MessageSquare className="h-3 w-3 mr-1 sm:mr-2" />
                  Підтримка
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Основний вміст */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 min-w-0">
          {/* Статистика */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">{stat.title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 truncate">{stat.value}</p>
                        <div className="flex items-center">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 mr-1" />
                          <span className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">за місяць</span>
                        </div>
                      </div>
                      <div className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl ${stat.bgColor} shrink-0 ml-2`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-linear-to-br ${stat.gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg`}>
                          <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Вміст вкладок */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="mb-3 sm:mb-0 min-w-0 flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {activeTab === 'users' && 'Управління користувачами'}
                  {activeTab === 'products' && 'Каталог товарів'}
                  {activeTab === 'orders' && 'Історія замовлень'}
                  {activeTab === 'analytics' && 'Аналітика продажів'}
                  {activeTab === 'settings' && 'Налаштування системи'}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
                  {activeTab === 'users' && 'Перегляд та управління користувачами системи'}
                  {activeTab === 'products' && 'Управління каталогом товарів та залишками'}
                  {activeTab === 'orders' && 'Перегляд та обробка замовлень клієнтів'}
                  {activeTab === 'analytics' && 'Статистика продажів та аналітика бізнесу'}
                  {activeTab === 'settings' && 'Налаштування системи та параметрів магазину'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
                {activeTab === 'users' && (
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1 sm:gap-2 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-xs h-8 flex-1 sm:flex-none"
                    onClick={() => setIsCreateUserOpen(true)}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Додати користувача</span>
                    <span className="xs:hidden">Додати</span>
                  </Button>
                )}
                {activeTab === 'products' && (
                  <Button 
                    size="sm" 
                    className="flex items-center gap-1 sm:gap-2 bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-xs h-8 flex-1 sm:flex-none"
                    onClick={() => setIsCreateProductOpen(true)}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Додати товар</span>
                    <span className="xs:hidden">Додати</span>
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs h-8 flex-1 sm:flex-none">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Експорт</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs h-8 flex-1 sm:flex-none">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Фільтри</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Пошук і фільтри */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                        <Input
                          placeholder="Пошук користувачів..."
                          className="pl-8 sm:pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm h-9 sm:h-10"
                          value={(userTable.getColumn('name')?.getFilterValue() as string) ?? ''}
                          onChange={(event) =>
                            userTable.getColumn('name')?.setFilterValue(event.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Select
                        value={(userTable.getColumn('status')?.getFilterValue() as string) ?? 'all'}
                        onValueChange={(value) => {
                          if (value === 'all') {
                            userTable.getColumn('status')?.setFilterValue(undefined);
                          } else {
                            userTable.getColumn('status')?.setFilterValue(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm h-9 sm:h-10">
                          <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectItem value="all" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Всі статуси</SelectItem>
                          <SelectItem value="active" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Активний</SelectItem>
                          <SelectItem value="inactive" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Неактивний</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Таблиця */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-700/50">
                          {userTable.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                              {headerGroup.headers.map((header) => {
                                return (
                                  <TableHead key={header.id} className="text-gray-700 dark:text-gray-300 font-semibold py-3 sm:py-4 text-xs sm:text-sm">
                                    {header.isPlaceholder
                                      ? null
                                      : flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                  </TableHead>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody>
                          {userTable.getRowModel().rows?.length ? (
                            userTable.getRowModel().rows.map((row) => (
                              <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell key={cell.id} className="py-2 sm:py-3 text-xs sm:text-sm">
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={mobileUserColumns.length}
                                className="h-24 text-center text-gray-500 dark:text-gray-400 text-sm"
                              >
                                {usersLoading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                    Завантаження даних...
                                  </div>
                                ) : (
                                  'Немає даних для відображення.'
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Пагінація */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6">
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                      {userTable.getFilteredSelectedRowModel().rows.length} з{' '}
                      {userTable.getFilteredRowModel().rows.length} рядків(и) вибрано.
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => userTable.previousPage()}
                        disabled={!userTable.getCanPreviousPage()}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs h-8"
                      >
                        Назад
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => userTable.nextPage()}
                        disabled={!userTable.getCanNextPage()}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs h-8"
                      >
                        Вперед
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-4 sm:space-y-6">
                  <Alert className="text-sm">
                    <Package className="h-4 w-4" />
                    <AlertDescription>
                      В каталозі {mockProducts.length} товарів. {mockProducts.filter(p => p.status === 'out_of_stock').length} товарів відсутні на складі.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {mockProducts.map((product) => (
                      <Card key={product.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {product.name}
                              </CardTitle>
                              <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                {product.category}
                              </CardDescription>
                            </div>
                            <Badge variant={
                              product.status === 'in_stock' ? 'default' : 
                              product.status === 'low_stock' ? 'secondary' : 'destructive'
                            } className="text-xs shrink-0 ml-2">
                              {product.status === 'in_stock' ? 'В наявності' : 
                               product.status === 'low_stock' ? 'Мало' : 'Немає в наявності'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4 pt-0">
                          <div className="flex justify-between items-center">
                            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                              ₴{product.price}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{product.rating}.0</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <span>Залишок: {product.stock} шт.</span>
                            <span>Продано: {product.sales} шт.</span>
                          </div>
                          <Progress value={(product.sales / (product.sales + product.stock)) * 100} className="h-1.5 sm:h-2" />
                          <div className="flex gap-1 sm:gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                              <Edit className="h-3 w-3 mr-1" />
                              Редаг.
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                              <Eye className="h-3 w-3 mr-1" />
                              Перегляд
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4 sm:space-y-6">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-gray-100 dark:bg-gray-700 p-1 w-full flex flex-wrap h-auto">
                      <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-xs flex-1">
                        Всі
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-xs flex-1">
                        Очікування
                      </TabsTrigger>
                      <TabsTrigger value="processing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-xs flex-1">
                        Обробка
                      </TabsTrigger>
                      <TabsTrigger value="delivered" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 text-xs flex-1">
                        Доставка
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="space-y-3 sm:space-y-4">
                      <div className="grid gap-3 sm:gap-4">
                        {mockOrders.slice(0, 5).map((order) => (
                          <Card key={order.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.id}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{order.customer}</p>
                                    <p className="text-gray-500 dark:text-gray-500 text-xs">{order.date}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">₴{order.amount}</p>
                                  <Badge variant={
                                    order.status === 'delivered' ? 'default' :
                                    order.status === 'processing' ? 'secondary' :
                                    order.status === 'pending' ? 'outline' : 'destructive'
                                  } className="text-xs">
                                    {order.status === 'delivered' ? 'Доставлено' :
                                     order.status === 'processing' ? 'В обробці' :
                                     order.status === 'pending' ? 'Очікування' : 'Скасовано'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {order.items} товарів · {order.payment === 'card' ? 'Карта' : order.payment === 'cash' ? 'Готівка' : 'PayPal'}
                                </div>
                                <div className="flex gap-1 sm:gap-2">
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline ml-1">Деталі</span>
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <Truck className="h-3 w-3" />
                                    <span className="hidden sm:inline ml-1">Відстежити</span>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-900 dark:text-white text-lg">Статистика продажів</CardTitle>
                        <CardDescription className="text-sm">Продажі за останні 30 днів</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                          {['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'].map((month, i) => (
                            <div key={month} className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-8">{month}</span>
                              <div className="w-20 sm:w-24 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mx-2 sm:mx-4">
                                <div 
                                  className="bg-linear-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" 
                                  style={{ width: `${Math.random() * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white w-16 sm:w-20 text-right">
                                ₴{Math.floor(Math.random() * 50000).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-900 dark:text-white text-lg">Популярні товари</CardTitle>
                        <CardDescription className="text-sm">Найбільш продавані товари</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                          {mockProducts.slice(0, 5).map((product, i) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-linear-to-br from-emerald-500 to-cyan-500 rounded flex items-center justify-center shrink-0">
                                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {product.name}
                                </span>
                              </div>
                              <div className="text-right shrink-0 ml-2">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                  {product.sales} продажів
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ₴{(product.price * product.sales).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4 sm:space-y-6">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-gray-900 dark:text-white text-lg sm:text-xl">Налаштування магазину</CardTitle>
                      <CardDescription className="text-sm">Основні параметри вашого магазину рослин</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="store-name" className="text-gray-700 dark:text-gray-300 text-sm">
                            Назва магазину
                          </Label>
                          <Input 
                            id="store-name" 
                            defaultValue="PlantShop" 
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="store-email" className="text-gray-700 dark:text-gray-300 text-sm">
                            Email магазину
                          </Label>
                          <Input 
                            id="store-email" 
                            type="email" 
                            defaultValue="info@plantshop.com"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="store-description" className="text-gray-700 dark:text-gray-300 text-sm">
                          Опис магазину
                        </Label>
                        <Textarea 
                          id="store-description" 
                          defaultValue="Найкращий магазин рослин у вашому місті. Широкий асортимент, якісні рослини та швидка доставка."
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm min-h-20 sm:min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <Label htmlFor="maintenance-mode" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                              Режим обслуговування
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Увімкніть для тимчасового закриття магазину
                            </p>
                          </div>
                          <Switch id="maintenance-mode" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <Label htmlFor="email-notifications" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                              Email сповіщення
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Отримувати сповіщення про нові замовлення
                            </p>
                          </div>
                          <Switch id="email-notifications" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <Label htmlFor="low-stock-alerts" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                              Сповіщення про низький запас
                            </Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Отримувати сповіщення коли товари закінчуються
                            </p>
                          </div>
                          <Switch id="low-stock-alerts" defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 p-4 sm:p-6">
                      <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm w-full sm:w-auto order-2 sm:order-1">
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Скинути
                      </Button>
                      <Button className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-sm w-full sm:w-auto order-1 sm:order-2 mb-2 sm:mb-0">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Зберегти налаштування
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Діалог створення користувача */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
              Додати користувача
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
              Заповніть інформацію про нового користувача системи.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Ім'я
              </Label>
              <Input
                id="name"
                placeholder="Введіть повне ім'я"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                {...userForm.register('name')}
              />
              {userForm.formState.errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {userForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Введіть email адресу"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                {...userForm.register('email')}
              />
              {userForm.formState.errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {userForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Телефон
              </Label>
              <Input
                id="phone"
                placeholder="+38 (XXX) XXX-XX-XX"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                {...userForm.register('phone')}
              />
              {userForm.formState.errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {userForm.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Роль
                </Label>
                <Select
                  value={userForm.watch('role')}
                  onValueChange={(value: 'admin' | 'user' | 'moderator') =>
                    userForm.setValue('role', value)
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm">
                    <SelectValue placeholder="Виберіть роль" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="user" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Користувач</SelectItem>
                    <SelectItem value="moderator" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Модератор</SelectItem>
                    <SelectItem value="admin" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Адміністратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Статус
                </Label>
                <Select
                  value={userForm.watch('status')}
                  onValueChange={(value: 'active' | 'inactive') =>
                    userForm.setValue('status', value)
                  }
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm">
                    <SelectValue placeholder="Виберіть статус" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="active" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Активний</SelectItem>
                    <SelectItem value="inactive" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Неактивний</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateUserOpen(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm w-full sm:w-auto order-2 sm:order-1"
              >
                Скасувати
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending}
                className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-sm w-full sm:w-auto order-1 sm:order-2"
              >
                {createUserMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Створення...
                  </>
                ) : (
                  'Створити користувача'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Діалог створення товару */}
      <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-[95vw] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold">
              Додати товар
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
              Заповніть інформацію про новий товар для каталогу.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-name" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Назва товару
              </Label>
              <Input
                id="product-name"
                placeholder="Введіть назву товару"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                {...productForm.register('name')}
              />
              {productForm.formState.errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {productForm.formState.errors.name.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Категорія
                </Label>
                <Select
                  onValueChange={(value) => productForm.setValue('category', value)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm">
                    <SelectValue placeholder="Виберіть категорію" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectItem value="Декоративні" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Декоративні</SelectItem>
                    <SelectItem value="Суккуленти" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Суккуленти</SelectItem>
                    <SelectItem value="Квітучі" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Квітучі</SelectItem>
                    <SelectItem value="Дерева" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Дерева</SelectItem>
                    <SelectItem value="Кактуси" className="text-gray-900 dark:text-white focus:bg-gray-100 dark:focus:bg-gray-600 text-sm">Кактуси</SelectItem>
                  </SelectContent>
                </Select>
                {productForm.formState.errors.category && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {productForm.formState.errors.category.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                  Ціна (₴)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  {...productForm.register('price', { valueAsNumber: true })}
                />
                {productForm.formState.errors.price && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {productForm.formState.errors.price.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Кількість на складі
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                {...productForm.register('stock', { valueAsNumber: true })}
              />
              {productForm.formState.errors.stock && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {productForm.formState.errors.stock.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                Опис товару
              </Label>
              <Textarea
                id="description"
                placeholder="Детальний опис товару..."
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm min-h-20 sm:min-h-[100px]"
                {...productForm.register('description')}
              />
              {productForm.formState.errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {productForm.formState.errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateProductOpen(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm w-full sm:w-auto order-2 sm:order-1"
              >
                Скасувати
              </Button>
              <Button 
                type="submit" 
                disabled={createProductMutation.isPending}
                className="bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg text-sm w-full sm:w-auto order-1 sm:order-2"
              >
                {createProductMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Створення...
                  </>
                ) : (
                  'Створити товар'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Overlay для мобільного меню */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Головний компонент сторінки з провайдером
export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminContent />
    </QueryClientProvider>
  );
}