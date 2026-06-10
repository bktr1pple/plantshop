'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Sprout,
  ImageIcon,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';
import type { Plant } from '@/app/types/plant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNotification } from '@/app/components/NotificationSystem';
import { API_URL } from '@/lib/site-settings';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { formatPrice } from '@/lib/format-price';
import {
  deleteAdminMedia,
} from '@/lib/admin-api';
import {
  MediaUploader,
  type ManagedImageItem,
} from '@/components/admin/MediaUploader';
import { SafeImage } from '@/components/SafeImage';

type PlantSort = 'updated-desc' | 'price-asc' | 'price-desc' | 'name-asc';
type PlantFilter = 'all' | 'with-images' | 'without-images';

type PlantFormState = {
  name: string;
  description: string;
  price: string;
  images: ManagedImageItem[];
};

function createEmptyForm(): PlantFormState {
  return {
    name: '',
    description: '',
    price: '',
    images: [],
  };
}

function mapPlantToForm(plant: Plant): PlantFormState {
  return {
    name: plant.name,
    description: plant.description ?? '',
    price: plant.price.toString(),
    images: (plant.images ?? []).map((url) => ({
      id: url,
      url,
      filename: url.split('/').pop() ?? url,
      isTemporary: false,
    })),
  };
}

function formatDate(value?: string): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizePlantResponse(data: unknown): Plant | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const plant = data as Plant;
  return {
    ...plant,
    images: Array.isArray(plant.images) ? plant.images : [],
  };
}

export function PlantsAdminManager({
  initialPlants,
}: {
  initialPlants: Plant[];
}) {
  const router = useRouter();
  const { addNotification } = useNotification();

  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PlantFilter>('all');
  const [sort, setSort] = useState<PlantSort>('updated-desc');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [pendingDeletePlant, setPendingDeletePlant] = useState<Plant | null>(null);
  const [form, setForm] = useState<PlantFormState>(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPlants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = plants.filter((plant) => {
      const matchesSearch =
        !normalizedSearch ||
        plant.name.toLowerCase().includes(normalizedSearch) ||
        (plant.description ?? '').toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'with-images' && (plant.images?.length ?? 0) > 0) ||
        (filter === 'without-images' && (plant.images?.length ?? 0) === 0);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name, 'uk');
        case 'updated-desc':
        default:
          return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
      }
    });
  }, [filter, plants, search, sort]);

  const totalWithImages = plants.filter((plant) => (plant.images?.length ?? 0) > 0).length;
  const averagePrice =
    plants.length > 0
      ? plants.reduce((sum, plant) => sum + plant.price, 0) / plants.length
      : 0;

  const openCreateDialog = () => {
    setEditingPlant(null);
    setForm(createEmptyForm());
    setIsEditorOpen(true);
  };

  const openEditDialog = (plant: Plant) => {
    setEditingPlant(plant);
    setForm(mapPlantToForm(plant));
    setIsEditorOpen(true);
  };

  const cleanupTemporaryImages = async (images: ManagedImageItem[]) => {
    const tempImages = images.filter((image) => image.isTemporary);
    await Promise.all(
      tempImages.map((image) =>
        deleteAdminMedia(image.url).catch(() => undefined),
      ),
    );
  };

  const closeEditorDialog = async (preserveUploads = false) => {
    if (!preserveUploads) {
      await cleanupTemporaryImages(form.images);
    }

    setIsEditorOpen(false);
    setEditingPlant(null);
    setForm(createEmptyForm());
    setIsSubmitting(false);
  };

  const notifyError = (message: string) => {
    addNotification({
      type: 'error',
      title: 'Помилка',
      message,
    });
  };

  const notifySuccess = (message: string) => {
    addNotification({
      type: 'success',
      title: 'Успішно',
      message,
    });
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      notifyError('Назва рослини є обов’язковою.');
      return false;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      notifyError('Вкажіть коректну невід’ємну ціну.');
      return false;
    }

    return true;
  };

  const submitPlant = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${API_URL}/plants${editingPlant ? `/${editingPlant.id}` : ''}`,
        {
          method: editingPlant ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: Number(form.price),
            images: form.images.map((image) => image.url),
          }),
        },
      );

      const data = (await res.json().catch(() => null)) as unknown;

      if (!res.ok) {
        if (data && typeof data === 'object' && 'message' in data) {
          const message = (data as { message?: unknown }).message;
          if (typeof message === 'string') {
            notifyError(message);
          } else if (Array.isArray(message)) {
            notifyError(message.join(', '));
          } else {
            notifyError('Не вдалося зберегти рослину.');
          }
        } else {
          notifyError('Не вдалося зберегти рослину.');
        }
        return;
      }

      const savedPlant = normalizePlantResponse(data);
      if (!savedPlant) {
        notifyError('Сервер повернув некоректну відповідь.');
        return;
      }

      setPlants((prev) => {
        if (editingPlant) {
          return prev.map((plant) => (plant.id === savedPlant.id ? savedPlant : plant));
        }

        return [savedPlant, ...prev];
      });

      notifySuccess(
        editingPlant
          ? `Рослину "${savedPlant.name}" успішно оновлено.`
          : `Рослину "${savedPlant.name}" успішно створено.`,
      );

      router.refresh();
      await closeEditorDialog(true);
    } catch {
      notifyError('Не вдалося зберегти рослину через мережеву помилку.');
      setIsSubmitting(false);
    }
  };

  const confirmDeletePlant = (plant: Plant) => {
    setPendingDeletePlant(plant);
    setIsDeleteOpen(true);
  };

  const handleDeletePlant = async () => {
    if (!pendingDeletePlant) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/plants/${pendingDeletePlant.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = (await res.json().catch(() => null)) as
        | { message?: string | string[] }
        | null;

      if (!res.ok) {
        const message =
          typeof data?.message === 'string'
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(', ')
              : 'Не вдалося видалити рослину.';
        notifyError(message);
        setIsSubmitting(false);
        return;
      }

      setPlants((prev) =>
        prev.filter((plant) => plant.id !== pendingDeletePlant.id),
      );
      notifySuccess(`Рослину "${pendingDeletePlant.name}" видалено.`);
      setIsDeleteOpen(false);
      setPendingDeletePlant(null);
      setIsSubmitting(false);
      router.refresh();
    } catch {
      notifyError('Не вдалося видалити рослину через мережеву помилку.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Загальна кількість рослин</CardDescription>
            <CardTitle className="text-3xl">{plants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Позиції з фото</CardDescription>
            <CardTitle className="text-3xl">{totalWithImages}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Середня ціна</CardDescription>
            <CardTitle className="text-3xl">{formatPrice(averagePrice)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Каталог рослин</CardTitle>
              <CardDescription>
                Керуйте товарами, зображеннями та візуальним порядком каталогу.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.refresh()}>
                <RefreshCw className="h-4 w-4" />
                Оновити
              </Button>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Додати рослину
              </Button>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                placeholder="Пошук за назвою або описом"
              />
            </div>

            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as PlantFilter)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Фільтр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі позиції</SelectItem>
                <SelectItem value="with-images">Лише з фото</SelectItem>
                <SelectItem value="without-images">Без фото</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sort}
              onValueChange={(value) => setSort(value as PlantSort)}
            >
              <SelectTrigger className="w-full">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Сортування" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated-desc">Останні зміни</SelectItem>
                <SelectItem value="price-asc">Ціна: зростання</SelectItem>
                <SelectItem value="price-desc">Ціна: спадання</SelectItem>
                <SelectItem value="name-asc">Назва: А-Я</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPlants.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-950/50">
              <Sprout className="mb-4 h-10 w-10 text-emerald-500" />
              <h3 className="text-lg font-semibold">Нічого не знайдено</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Змініть пошук або фільтр. Якщо каталогу ще немає, створіть першу рослину.
              </p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Створити першу позицію
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlants.map((plant) => (
                <article
                  key={plant.id}
                  aria-label={`Рослина ${plant.name}`}
                  className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/45 sm:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[72px_minmax(0,1fr)_180px]"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900 sm:h-[72px] sm:w-[72px]">
                    <SafeImage
                      src={plant.images?.[0] || '/images/placeholder.jpg'}
                      alt={plant.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 space-y-2 self-center">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">
                        {plant.name}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                        {plant.description || 'Без опису'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {formatPrice(plant.price)}
                      </span>
                      <Badge variant="outline" className="gap-1 whitespace-nowrap">
                        <ImageIcon className="h-3 w-3" />
                        Фото: {plant.images?.length ?? 0}
                      </Badge>
                      <Badge variant="outline" className="whitespace-nowrap">
                        Оновлено: {formatDate(plant.updatedAt)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-2 sm:col-start-2 sm:flex-row xl:col-start-auto xl:self-center xl:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full min-w-0 sm:w-auto xl:w-full"
                      onClick={() => openEditDialog(plant)}
                    >
                      <Pencil className="h-4 w-4" />
                      Редагувати
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full min-w-0 sm:w-auto xl:w-full"
                      onClick={() => confirmDeletePlant(plant)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Видалити
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) {
            void closeEditorDialog();
            return;
          }

          setIsEditorOpen(true);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-6xl">
          <DialogHeader className="border-b border-slate-200 px-6 py-5 pr-14 dark:border-slate-800">
            <DialogTitle>
              {editingPlant ? 'Редагування рослини' : 'Нова рослина'}
            </DialogTitle>
            <DialogDescription>
              Задайте основні дані, завантажте фото й визначте обкладинку для каталогу.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(92vh-9.5rem)] overflow-y-auto px-6 py-5">
          <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(420px,1.15fr)]">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Назва</label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Туя Смарагд"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Ціна</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="250.00"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Опис</label>
                <Textarea
                  rows={8}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Коротко опишіть рослину, її характер і переваги."
                />
              </div>
            </div>

            <div className="space-y-4">
              <MediaUploader
                collection="plants"
                images={form.images}
                disabled={isSubmitting}
                onChange={(images) => setForm((prev) => ({ ...prev, images }))}
                onError={notifyError}
                onTemporaryRemove={async (image) => {
                  await deleteAdminMedia(image.url);
                }}
              />
            </div>
          </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <Button
              type="button"
              variant="outline"
              onClick={() => void closeEditorDialog()}
            >
              Скасувати
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={() => void submitPlant()}>
              {isSubmitting
                ? 'Збереження...'
                : editingPlant
                  ? 'Зберегти зміни'
                  : 'Створити рослину'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Видалити рослину?"
        description={
          pendingDeletePlant
            ? `Після підтвердження "${pendingDeletePlant.name}" буде видалено з каталогу.`
            : 'Після підтвердження позицію буде видалено.'
        }
        confirmLabel="Видалити"
        isSubmitting={isSubmitting}
        onConfirm={() => void handleDeletePlant()}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setPendingDeletePlant(null);
          }
        }}
      />
    </div>
  );
}
