"use client";

import React, { useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
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
  Settings,
  User,
  Bell,
  Menu,
  Sun,
  Moon,
  LogOut,
  Truck,
  Star,
} from "lucide-react";

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
} from "@tanstack/react-table";

import { LazyMotion, domAnimation, m } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

// ───────────────────────────────────────────────────────────
// QueryClient
// ───────────────────────────────────────────────────────────

const queryClient = new QueryClient();

// ───────────────────────────────────────────────────────────
// Типи
// ───────────────────────────────────────────────────────────

type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  role: "admin" | "user" | "moderator";
  joinDate: string;
  lastLogin: string;
  orders: number;
  totalSpent: number;
};

type ProductType = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  sales: number;
  createdAt: string;
  description: string;
  rating: number;
};

type OrderType = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  date: string;
  items: number;
  payment: "card" | "cash" | "paypal";
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  date: string;
  read: boolean;
};

// ───────────────────────────────────────────────────────────
// Валідація форм
// ───────────────────────────────────────────────────────────

const userFormSchema = z.object({
  name: z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
  email: z.string().email("Введіть коректний email"),
  phone: z.string().min(8, "Введіть коректний номер телефону"),
  role: z.enum(["admin", "user", "moderator"]),
  status: z.enum(["active", "inactive"]),
});

const productFormSchema = z.object({
  name: z.string().min(2, "Назва повинна містити мінімум 2 символи"),
  category: z.string().min(1, "Виберіть категорію"),
  price: z.number().min(1, { message: "Ціна повинна бути більше 0" }),
  stock: z.number().min(0, { message: "Кількість не може бути від'ємною" }),
  description: z.string().min(10, "Опис повинен містити мінімум 10 символів"),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type ProductFormValues = z.infer<typeof productFormSchema>;

// ───────────────────────────────────────────────────────────
// Мокові дані (для макету адмінки)
// ───────────────────────────────────────────────────────────

function generateMockData() {
  const mockUsers: UserType[] = Array.from({ length: 12 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: [
      "Олександр Іванов",
      "Марія Петрова",
      "Дмитро Сидоров",
      "Олена Коваль",
      "Сергій Шевченко",
    ][i % 5],
    email: `user${i + 1}@example.com`,
    phone: "+38 (050) 000-00-00",
    status: Math.random() > 0.2 ? "active" : "inactive",
    role: (["admin", "user", "moderator"][Math.floor(Math.random() * 3)] ??
      "user") as UserType["role"],
    joinDate: "2024-01-10",
    lastLogin: "2025-01-01",
    orders: Math.floor(Math.random() * 40),
    totalSpent: Math.floor(Math.random() * 70000),
  }));

  const mockProducts: ProductType[] = [
    {
      id: "p1",
      name: "Монстера деліціоза",
      category: "Декоративні",
      price: 1500,
      stock: 12,
      status: "in_stock",
      sales: 37,
      createdAt: "2024-03-05",
      description: "Велика зелена рослина для дому з виразними листками.",
      rating: 5,
    },
    {
      id: "p2",
      name: "Фікус Бенджаміна",
      category: "Для офісу",
      price: 1100,
      stock: 4,
      status: "low_stock",
      sales: 22,
      createdAt: "2024-04-10",
      description: "Класична офісна рослина для затишного простору.",
      rating: 4,
    },
    {
      id: "p3",
      name: "Сукулент мікс",
      category: "Невибагливі",
      price: 350,
      stock: 0,
      status: "out_of_stock",
      sales: 48,
      createdAt: "2024-02-18",
      description:
        "Невибагливі сукуленти для поличок, робочого столу та подарунків.",
      rating: 5,
    },
  ];

  const mockOrders: OrderType[] = Array.from({ length: 6 }, (_, i) => ({
    id: `ORD-${1000 + i}`,
    customer: mockUsers[i % mockUsers.length].name,
    email: mockUsers[i % mockUsers.length].email,
    amount: 500 + Math.floor(Math.random() * 5000),
    status: (["pending", "processing", "delivered", "cancelled"][
      Math.floor(Math.random() * 4)
    ] ?? "pending") as OrderType["status"],
    date: "2025-01-12",
    items: 1 + Math.floor(Math.random() * 5),
    payment: (["card", "cash", "paypal"][
      Math.floor(Math.random() * 3)
    ] ?? "card") as OrderType["payment"],
  }));

  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Нове замовлення",
      message: "Надійшло замовлення ORD-1042",
      type: "info",
      date: new Date().toISOString(),
      read: false,
    },
    {
      id: "2",
      title: "Низький запас товару",
      message: "Фікус Бенджаміна — залишилось 3 шт.",
      type: "warning",
      date: new Date().toISOString(),
      read: false,
    },
  ];

  return { mockUsers, mockProducts, mockOrders, mockNotifications };
}

const { mockUsers, mockProducts, mockOrders, mockNotifications } =
  generateMockData();

// ───────────────────────────────────────────────────────────
// Мокові API
// ───────────────────────────────────────────────────────────

const fetchUsers = async (): Promise<UserType[]> => {
  await new Promise((r) => setTimeout(r, 400));
  return mockUsers;
};

const fetchProducts = async (): Promise<ProductType[]> => {
  await new Promise((r) => setTimeout(r, 400));
  return mockProducts;
};

const fetchOrders = async (): Promise<OrderType[]> => {
  await new Promise((r) => setTimeout(r, 400));
  return mockOrders;
};

const fetchNotifications = async (): Promise<Notification[]> => {
  await new Promise((r) => setTimeout(r, 200));
  return mockNotifications;
};

const createUser = async (data: UserFormValues): Promise<UserType> => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id: Math.random().toString(36).slice(2),
    ...data,
    joinDate: new Date().toISOString().split("T")[0],
    lastLogin: new Date().toISOString().split("T")[0],
    orders: 0,
    totalSpent: 0,
  };
};

const createProduct = async (
  data: ProductFormValues
): Promise<ProductType> => {
  await new Promise((r) => setTimeout(r, 400));

  const status: ProductType["status"] =
    data.stock === 0
      ? "out_of_stock"
      : data.stock < 5
      ? "low_stock"
      : "in_stock";

  return {
    id: Math.random().toString(36).slice(2),
    ...data,
    status,
    sales: 0,
    createdAt: new Date().toISOString().split("T")[0],
    rating: 0,
  };
};

const deleteUser = async (_id: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 300));
};

// ───────────────────────────────────────────────────────────
// Таблиця користувачів (desktop)
// ───────────────────────────────────────────────────────────

function UserActionsCell({ user }: { user: UserType }) {
  const [openDelete, setOpenDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setOpenDelete(false);
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-52 border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <DropdownMenuLabel className="text-xs text-slate-500">
            Дії
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-sm text-slate-700 dark:text-slate-200"
            onClick={() => navigator.clipboard.writeText(user.id)}
          >
            Скопіювати ID
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm text-amber-700 dark:text-amber-200"
            onClick={() => setOpenDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Видалити
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="max-w-sm border border-slate-200 bg-white text-base dark:border-slate-700 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Видалити користувача
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Ви впевнені, що хочете видалити користувача «{user.name}»? Цю дію
              не можна скасувати.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 text-sm"
              onClick={() => setOpenDelete(false)}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              className="h-10 flex-1 text-sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(user.id)}
            >
              {deleteMutation.isPending ? "Видалення..." : "Видалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const userColumns: ColumnDef<UserType>[] = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    size: 40,
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 p-0 text-sm font-semibold hover:bg-transparent dark:hover:bg-transparent"
      >
        Ім&apos;я
        <TrendingUp className="h-4 w-4 text-gray-400" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 md:flex">
          {String(row.getValue("name"))
            .split(" ")
            .map((p) => p[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-50">
            {row.getValue("name") as string}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {row.original.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <span className="text-sm font-semibold">Роль</span>,
    cell: ({ row }) => {
      const role = row.getValue("role") as UserType["role"];
      const map = {
        admin: {
          label: "Адмін",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800",
        },
        user: {
          label: "Користувач",
          className:
            "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800",
        },
        moderator: {
          label: "Модератор",
          className:
            "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800",
        },
      } as const;

      const cfg = map[role];

      return (
        <Badge
          variant="outline"
          className={cn("px-3 py-1 text-sm font-medium", cfg.className)}
        >
          {cfg.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="text-sm font-semibold">Статус</span>,
    cell: ({ row }) => {
      const status = row.getValue("status") as UserType["status"];
      const isActive = status === "active";

      return (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isActive ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              isActive
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-slate-600 dark:text-slate-300"
            )}
          >
            {isActive ? "Активний" : "Неактивний"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "orders",
    header: () => <span className="text-sm font-semibold">Замовлення</span>,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {row.getValue("orders") as number}
      </span>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: () => (
      <span className="text-sm font-semibold">Всього витрачено</span>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("totalSpent") as number;
      const formatted = new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
      }).format(amount || 0);

      return (
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "lastLogin",
    header: () => (
      <span className="whitespace-nowrap text-sm font-semibold">
        Останній вхід
      </span>
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
        {row.getValue("lastLogin") as string}
      </span>
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];

// ───────────────────────────────────────────────────────────
// Основний контент адмінки
// ───────────────────────────────────────────────────────────

function AdminContent() {
  const [activeTab, setActiveTab] = useState<
    "users" | "products" | "orders" | "analytics" | "settings"
  >("users");

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    lastLogin: false,
  });
  const [rowSelection, setRowSelection] = useState({});

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState<"user" | "admin" | "moderator">(
    "user"
  );
  const [userStatus, setUserStatus] = useState<"active" | "inactive">("active");

  const queryClient = useQueryClient();

  // Тема з localStorage
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Дані
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const { data: notificationsData = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    setNotifications(notificationsData);
  }, [notificationsData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateUserOpen(false);
      setUserRole("user");
      setUserStatus("active");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCreateProductOpen(false);
    },
  });

  // Форми
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
    },
  });

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      stock: 0,
      description: "",
    },
  });

  // Таблиця користувачів
  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Статистика
  const totalRevenue = orders.reduce((acc, o) => acc + o.amount, 0);
  const activeProducts = products.filter((p) => p.status === "in_stock").length;

  const stats = [
    {
      title: "Користувачі",
      value: users.length,
      icon: Users,
      description: "Активні акаунти клієнтів",
    },
    {
      title: "Товари в наявності",
      value: activeProducts,
      icon: Package,
      description: "Можна додати до каталогу",
    },
    {
      title: "Замовлення",
      value: orders.length,
      icon: ShoppingCart,
      description: "Останні замовлення клієнтів",
    },
    {
      title: "Оборот",
      value: `₴${totalRevenue.toLocaleString("uk-UA")}`,
      icon: DollarSign,
      description: "Сумарний дохід",
    },
  ];

  const onSubmitUser = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  const onSubmitProduct = (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  // ────────────────────────────────────────────────────────
  // JSX
  // ────────────────────────────────────────────────────────

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-slate-50 text-[15px] text-slate-900 dark:bg-slate-950 dark:text-slate-50 sm:text-[16px]">
        {/* Верхній бар */}
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-3.5 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Package className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold tracking-tight sm:text-lg">
                    Plant Admin
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                    Панель управління магазином рослин
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                onClick={toggleTheme}
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                  >
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <DropdownMenuLabel className="p-0 text-base">
                      Сповіщення
                    </DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        onClick={markAllRead}
                      >
                        Прочитати всі
                      </Button>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-5 text-center text-sm text-slate-500">
                        Немає сповіщень
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={cn(
                            "flex flex-col items-start gap-1 px-3 py-2.5 text-sm",
                            !n.read &&
                              "bg-emerald-50/60 dark:bg-emerald-900/20"
                          )}
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((x) =>
                                x.id === n.id ? { ...x, read: true } : x
                              )
                            )
                          }
                        >
                          <span className="font-semibold">{n.title}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {n.message}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Профіль */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-base sm:flex"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="hidden flex-col text-left sm:flex">
                      <span className="text-sm font-medium">
                        Адміністратор
                      </span>
                      <span className="text-xs text-slate-500">
                        admin@plantshop.com
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-slate-200 bg-white text-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <DropdownMenuItem className="text-sm">
                    <User className="mr-2 h-4 w-4" />
                    Профіль
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Налаштування
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 md:static md:block",
              sidebarOpen ? "block" : "hidden md:block"
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-base dark:border-slate-800 md:hidden">
                <p className="font-medium">Меню</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </Button>
              </div>

              <nav className="flex-1 space-y-1 px-3 py-4 text-base">
                {[
                  { id: "users", label: "Користувачі", icon: Users },
                  { id: "products", label: "Товари", icon: Package },
                  { id: "orders", label: "Замовлення", icon: ShoppingCart },
                  { id: "analytics", label: "Аналітика", icon: DollarSign },
                  { id: "settings", label: "Налаштування", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                      activeTab === item.id
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="border-t border-slate-200 px-3 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <p>
                  Порада: регулярно оновлюйте каталог рослин і стежте за
                  запасами.
                </p>
              </div>
            </div>
          </aside>

          {/* Overlay під мобільний сайдбар */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-20 bg-black/40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Основний контент */}
          <main className="flex-1 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
            {/* Статистика */}
            <section className="mb-6 space-y-4">
              <div>
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  {activeTab === "users" && "Користувачі"}
                  {activeTab === "products" && "Каталог товарів"}
                  {activeTab === "orders" && "Замовлення"}
                  {activeTab === "analytics" && "Аналітика"}
                  {activeTab === "settings" && "Налаштування магазину"}
                </h1>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">
                  Керування інтернет-магазином декоративних рослин та
                  ландшафтних послуг.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                  <m.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                      <CardContent className="flex items-center justify-between gap-4 px-4 py-4">
                        <div className="min-w-0">
                          <p className="text-sm text-slate-500">
                            {stat.title}
                          </p>
                          <p className="mt-1 text-lg font-semibold sm:text-xl">
                            {stat.value}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            {stat.description}
                          </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          <stat.icon className="h-5 w-5" />
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </div>
            </section>

            {/* Вкладки / контент */}
            <section className="space-y-5">
              {activeTab === "users" && (
                <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                  <CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl">
                        Управління користувачами
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Перегляд, фільтрація та редагування клієнтів.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="h-10 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
                        onClick={() => {
                          userForm.reset({
                            name: "",
                            email: "",
                            phone: "",
                            role: "user",
                            status: "active",
                          });
                          setUserRole("user");
                          setUserStatus("active");
                          setIsCreateUserOpen(true);
                        }}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Додати користувача
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 rounded-full border-slate-200 px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        <Download className="mr-1.5 h-4 w-4" />
                        Експорт
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-3 py-4 sm:px-4">
                    {/* Фільтри / пошук */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                          placeholder="Пошук за ім'ям або email..."
                          className="h-11 pl-10 text-base"
                          value={
                            (userTable
                              .getColumn("name")
                              ?.getFilterValue() as string) ?? ""
                          }
                          onChange={(e) =>
                            userTable
                              .getColumn("name")
                              ?.setFilterValue(e.target.value)
                          }
                        />
                      </div>
                      <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            const value = e.target.value;
                            setStatusFilter(value);
                            userTable
                              .getColumn("status")
                              ?.setFilterValue(
                                value === "all" ? undefined : value
                              );
                          }}
                          className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:w-44"
                        >
                          <option value="all">Всі статуси</option>
                          <option value="active">Активні</option>
                          <option value="inactive">Неактивні</option>
                        </select>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-11 w-11 border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-200"
                        >
                          <Filter className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* MOBILE LIST VIEW */}
                    <div className="space-y-3 md:hidden">
                      {usersLoading ? (
                        <p className="py-4 text-center text-sm text-slate-500">
                          Завантаження користувачів...
                        </p>
                      ) : userTable.getRowModel().rows.length ? (
                        userTable.getRowModel().rows.map((row) => {
                          const user = row.original as UserType;

                          return (
                            <Card
                              key={user.id}
                              className="border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                            >
                              <CardContent className="flex items-start gap-3 px-3 py-3.5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  {user.name
                                    .split(" ")
                                    .map((p) => p[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate text-base font-semibold">
                                        {user.name}
                                      </p>
                                      <p className="truncate text-sm text-slate-500">
                                        {user.email}
                                      </p>
                                    </div>
                                    <Badge
                                      className={cn(
                                        "shrink-0 border-none px-2.5 py-1 text-xs font-medium",
                                        user.status === "active" &&
                                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
                                        user.status === "inactive" &&
                                          "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                                      )}
                                    >
                                      {user.status === "active"
                                        ? "Активний"
                                        : "Неактивний"}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:text-sm">
                                    <span>Роль: {user.role}</span>
                                    <span>Замовлень: {user.orders}</span>
                                    <span>
                                      Витрачено:{" "}
                                      {new Intl.NumberFormat("uk-UA", {
                                        style: "currency",
                                        currency: "UAH",
                                      }).format(user.totalSpent || 0)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between pt-1.5">
                                    <span className="text-xs text-slate-400">
                                      Останній вхід: {user.lastLogin}
                                    </span>
                                    <UserActionsCell user={user} />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-sm text-slate-500">
                          Дані відсутні.
                        </p>
                      )}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800 md:block">
                      <Table className="w-full">
                        <TableHeader className="bg-slate-50/60 text-sm dark:bg-slate-900/60">
                          {userTable.getHeaderGroups().map((hg) => (
                            <TableRow
                              key={hg.id}
                              className="border-b last:border-b-0"
                            >
                              {hg.headers.map((header) => (
                                <TableHead
                                  key={header.id}
                                  className="whitespace-nowrap py-3 px-2 align-middle text-sm font-medium text-slate-600 dark:text-slate-300"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              ))}
                            </TableRow>
                          ))}
                        </TableHeader>
                        <TableBody className="text-sm sm:text-base">
                          {usersLoading ? (
                            <TableRow>
                              <TableCell
                                colSpan={userTable.getAllColumns().length}
                                className="py-8 text-center text-slate-500"
                              >
                                Завантаження користувачів...
                              </TableCell>
                            </TableRow>
                          ) : userTable.getRowModel().rows.length ? (
                            userTable.getRowModel().rows.map((row) => (
                              <TableRow
                                key={row.id}
                                className="border-b last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                                data-state={
                                  row.getIsSelected() ? "selected" : undefined
                                }
                              >
                                {row.getVisibleCells().map((cell) => (
                                  <TableCell
                                    key={cell.id}
                                    className="py-3 px-2 align-middle"
                                  >
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
                                colSpan={userTable.getAllColumns().length}
                                className="py-8 text-center text-slate-500"
                              >
                                Дані відсутні.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Пагінація */}
                    <div className="flex flex-col items-center justify-between gap-3 pt-2 text-sm text-slate-500 sm:flex-row">
                      <span className="text-center sm:text-left">
                        Вибрано{" "}
                        {userTable.getFilteredSelectedRowModel().rows.length} з{" "}
                        {userTable.getFilteredRowModel().rows.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 text-sm"
                          disabled={!userTable.getCanPreviousPage()}
                          onClick={() => userTable.previousPage()}
                        >
                          Назад
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 px-4 text-sm"
                          disabled={!userTable.getCanNextPage()}
                          onClick={() => userTable.nextPage()}
                        >
                          Вперед
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "products" && (
                <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                  <CardHeader className="flex flex-col gap-3 border-b border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl">
                        Каталог товарів
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Основні рослини, які ви продаєте.
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="h-10 rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
                        onClick={() => {
                          productForm.reset();
                          setIsCreateProductOpen(true);
                        }}
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Додати товар
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 px-3 py-4 sm:px-4">
                    <Alert className="border-emerald-100 bg-emerald-50/60 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <AlertDescription>
                        В каталозі {products.length} товарів. Стежте за
                        кількістю на складі, щоб уникати відсутності улюблених
                        рослин клієнтів.
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <Card
                          key={product.id}
                          className="border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                        >
                          <CardHeader className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <CardTitle className="truncate text-base font-semibold">
                                  {product.name}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  {product.category}
                                </CardDescription>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border-none px-2.5 py-1 text-xs font-medium",
                                  product.status === "in_stock" &&
                                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
                                  product.status === "low_stock" &&
                                    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
                                  product.status === "out_of_stock" &&
                                    "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                                )}
                              >
                                {product.status === "in_stock" && "В наявності"}
                                {product.status === "low_stock" && "Мало"}
                                {product.status === "out_of_stock" &&
                                  "Немає в наявності"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 px-4 py-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-base font-semibold">
                                ₴{product.price.toLocaleString("uk-UA")}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span>{product.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <span>Залишок: {product.stock} шт.</span>
                              <span>Продано: {product.sales} шт.</span>
                            </div>
                            <Progress
                              className="h-2"
                              value={
                                product.sales + product.stock === 0
                                  ? 0
                                  : (product.sales /
                                      (product.sales + product.stock)) *
                                    100
                              }
                            />
                          </CardContent>
                          <CardFooter className="flex gap-2 px-4 py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 flex-1 text-sm"
                            >
                              <Edit className="mr-1.5 h-4 w-4" />
                              Редагувати
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 flex-1 text-sm"
                            >
                              <Eye className="mr-1.5 h-4 w-4" />
                              Перегляд
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "orders" && (
                <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                  <CardHeader className="border-b border-slate-100 px-3 py-3 sm:px-4 dark:border-slate-800">
                    <CardTitle className="text-lg sm:text-xl">
                      Замовлення
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Останні замовлення клієнтів на рослини та послуги.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 px-3 py-4 sm:px-4">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="flex h-10 w-full justify-start gap-2 overflow-x-auto rounded-lg bg-slate-100/80 p-1 text-sm dark:bg-slate-900/60">
                        <TabsTrigger
                          value="all"
                          className="flex-1 whitespace-nowrap sm:flex-none"
                        >
                          Всі
                        </TabsTrigger>
                        <TabsTrigger
                          value="pending"
                          className="flex-1 whitespace-nowrap sm:flex-none"
                        >
                          Очікування
                        </TabsTrigger>
                        <TabsTrigger
                          value="processing"
                          className="flex-1 whitespace-nowrap sm:flex-none"
                        >
                          Обробка
                        </TabsTrigger>
                        <TabsTrigger
                          value="delivered"
                          className="flex-1 whitespace-nowrap sm:flex-none"
                        >
                          Доставлено
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4 space-y-3">
                        {orders.map((order) => (
                          <Card
                            key={order.id}
                            className="border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                          >
                            <CardContent className="px-4 py-3.5">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                                    <ShoppingCart className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-base font-semibold">
                                      {order.id}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {order.customer}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {order.date}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-sm">
                                  <p className="text-base font-semibold">
                                    ₴{order.amount.toLocaleString("uk-UA")}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "border-none px-2.5 py-1 text-xs",
                                      order.status === "delivered" &&
                                        "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
                                      order.status === "processing" &&
                                        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
                                      order.status === "pending" &&
                                        "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                                      order.status === "cancelled" &&
                                        "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-200"
                                    )}
                                  >
                                    {order.status === "delivered" &&
                                      "Доставлено"}
                                    {order.status === "processing" &&
                                      "В обробці"}
                                    {order.status === "pending" &&
                                      "Очікування"}
                                    {order.status === "cancelled" &&
                                      "Скасовано"}
                                  </Badge>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 px-3 text-xs sm:text-sm"
                                    >
                                      <Eye className="mr-1.5 h-4 w-4" />
                                      Деталі
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-9 px-3 text-xs sm:text-sm"
                                    >
                                      <Truck className="mr-1.5 h-4 w-4" />
                                      Відстежити
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {activeTab === "analytics" && (
                <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                  <CardHeader className="border-b border-slate-100 px-3 py-3 sm:px-4 dark:border-slate-800">
                    <CardTitle className="text-lg sm:text-xl">
                      Аналітика продажів
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Огляд ключових показників за останній період.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 px-3 py-4 sm:px-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Місячний оборот (умовно)
                      </p>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {["Січ", "Лют", "Бер", "Кві", "Тра", "Чер"].map(
                          (mth, i) => {
                            const val = 30 + i * 8;
                            return (
                              <div
                                key={mth}
                                className="flex items-center gap-3"
                              >
                                <span className="w-10 text-slate-500">
                                  {mth}
                                </span>
                                <div className="flex-1 rounded-full bg-slate-100 dark:bg-slate-900">
                                  <div
                                    className="h-2 rounded-full bg-emerald-500/80"
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Найпопулярніші рослини
                      </p>
                      <div className="space-y-2 text-xs sm:text-sm">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
                          >
                            <span className="truncate">{p.name}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-100">
                              {p.sales} шт.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "settings" && (
                <Card className="border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
                  <CardHeader className="border-b border-slate-100 px-3 py-3 sm:px-4 dark:border-slate-800">
                    <CardTitle className="text-lg sm:text-xl">
                      Налаштування магазину
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Базові параметри, контакти та режим роботи.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-3 py-4 sm:px-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="store-name">Назва магазину</Label>
                        <Input
                          id="store-name"
                          className="h-11 text-base"
                          defaultValue="Green Home Studio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-email">
                          Email для клієнтів
                        </Label>
                        <Input
                          id="store-email"
                          type="email"
                          className="h-11 text-base"
                          defaultValue="hello@greenhome.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-phone">Телефон</Label>
                        <Input
                          id="store-phone"
                          className="h-11 text-base"
                          defaultValue="+38 (050) 000-00-00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="store-address">Адреса шоуруму</Label>
                        <Input
                          id="store-address"
                          className="h-11 text-base"
                          defaultValue="м. Луцьк, вул. Зелена, 12"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="pr-2">
                          <p className="font-medium">
                            Приймати онлайн-замовлення
                          </p>
                          <p className="text-xs text-slate-500 sm:text-sm">
                            Якщо вимкнути — клієнти бачитимуть лише каталог.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="pr-2">
                          <p className="font-medium">Email-сповіщення</p>
                          <p className="text-xs text-slate-500 sm:text-sm">
                            Отримувати листи про нові замовлення.
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button className="h-11 rounded-full bg-emerald-600 px-6 text-base font-medium text-white hover:bg-emerald-700">
                        Зберегти зміни
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>
          </main>
        </div>

        {/* Модалки */}
        <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
          <DialogContent className="max-w-sm border border-slate-200 bg-white px-4 py-4 text-base sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Новий користувач
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Додайте адміністратора, менеджера магазину або клієнта.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={userForm.handleSubmit(onSubmitUser)}
              className="space-y-3 pt-1"
            >
              <div className="space-y-1.5">
                <Label htmlFor="user-name">Ім&apos;я</Label>
                <Input
                  id="user-name"
                  {...userForm.register("name")}
                  className="h-11 text-base"
                />
                {userForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {userForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  {...userForm.register("email")}
                  className="h-11 text-base"
                />
                {userForm.formState.errors.email && (
                  <p className="text-xs text-red-500">
                    {userForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="user-phone">Телефон</Label>
                <Input
                  id="user-phone"
                  {...userForm.register("phone")}
                  className="h-11 text-base"
                />
                {userForm.formState.errors.phone && (
                  <p className="text-xs text-red-500">
                    {userForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Роль</Label>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "user"
                        | "admin"
                        | "moderator";
                      setUserRole(value);
                      userForm.setValue("role", value);
                    }}
                    className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="user">Користувач</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Адмін</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Статус</Label>
                  <select
                    value={userStatus}
                    onChange={(e) => {
                      const value = e.target.value as "active" | "inactive";
                      setUserStatus(value);
                      userForm.setValue("status", value);
                    }}
                    className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="active">Активний</option>
                    <option value="inactive">Неактивний</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 text-sm"
                  onClick={() => setIsCreateUserOpen(false)}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  className="h-11 flex-1 bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending
                    ? "Створення..."
                    : "Створити користувача"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateProductOpen}
          onOpenChange={setIsCreateProductOpen}
        >
          <DialogContent className="max-w-sm border border-slate-200 bg-white px-4 py-4 text-base sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Новий товар
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                Додайте нову рослину або позицію каталогу.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={productForm.handleSubmit(onSubmitProduct)}
              className="space-y-3 pt-1"
            >
              <div className="space-y-1.5">
                <Label htmlFor="product-name">Назва</Label>
                <Input
                  id="product-name"
                  {...productForm.register("name")}
                  className="h-11 text-base"
                />
                {productForm.formState.errors.name && (
                  <p className="text-xs text-red-500">
                    {productForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-category">Категорія</Label>
                <Input
                  id="product-category"
                  placeholder="Напр. Декоративні, Сукуленти..."
                  {...productForm.register("category")}
                  className="h-11 text-base"
                />
                {productForm.formState.errors.category && (
                  <p className="text-xs text-red-500">
                    {productForm.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="product-price">Ціна (₴)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    className="h-11 text-base"
                    {...productForm.register("price", {
                      valueAsNumber: true,
                    })}
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-xs text-red-500">
                      {productForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="product-stock">Кількість</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    className="h-11 text-base"
                    {...productForm.register("stock", {
                      valueAsNumber: true,
                    })}
                  />
                  {productForm.formState.errors.stock && (
                    <p className="text-xs text-red-500">
                      {productForm.formState.errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-description">Опис</Label>
                <Textarea
                  id="product-description"
                  className="min-h-[100px] text-base"
                  {...productForm.register("description")}
                />
                {productForm.formState.errors.description && (
                  <p className="text-xs text-red-500">
                    {productForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <DialogFooter className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 text-sm"
                  onClick={() => setIsCreateProductOpen(false)}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  className="h-11 flex-1 bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending
                    ? "Створення..."
                    : "Створити товар"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LazyMotion>
  );
}

// ───────────────────────────────────────────────────────────
// Головний експорт сторінки
// ───────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminContent />
    </QueryClientProvider>
  );
}
