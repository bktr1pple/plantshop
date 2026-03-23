'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Images, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useNotification } from '@/app/components/NotificationSystem';
import { SafeImage } from '@/components/SafeImage';
import {
  deleteAdminMedia,
  listAdminMedia,
  type MediaCollection,
  type MediaItem,
} from '@/lib/admin-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaUploader, type ManagedImageItem } from '@/components/admin/MediaUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager() {
  const { addNotification } = useNotification();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [collection, setCollection] = useState<'all' | MediaCollection>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMedia = async (selectedCollection: 'all' | MediaCollection = collection) => {
    try {
      setIsLoading(true);
      const nextItems =
        selectedCollection === 'all'
          ? await listAdminMedia()
          : await listAdminMedia(selectedCollection);
      setItems(nextItems);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Не вдалося завантажити медіатеку',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        item.filename.toLowerCase().includes(normalizedSearch) ||
        item.url.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [items, search]);

  const temporaryImages: ManagedImageItem[] = [];

  const notifySuccess = (message: string) =>
    addNotification({
      type: 'success',
      title: 'Успішно',
      message,
    });

  const notifyError = (message: string) =>
    addNotification({
      type: 'error',
      title: 'Помилка',
      message,
    });

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAdminMedia(pendingDelete.url);
      setItems((prev) => prev.filter((item) => item.url !== pendingDelete.url));
      notifySuccess(`Файл "${pendingDelete.filename}" видалено.`);
      setPendingDelete(null);
      setIsDeleteOpen(false);
    } catch (error) {
      notifyError(
        error instanceof Error
          ? error.message
          : 'Не вдалося видалити файл.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Медіатека</CardTitle>
              <CardDescription>
                Завантажуйте файли, використовуйте їх у формах і прибирайте непотрібні ресурси.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => void loadMedia()}>
              <RefreshCw className="h-4 w-4" />
              Оновити
            </Button>
          </div>
          <MediaUploader
            collection={collection === 'all' ? 'plants' : collection}
            images={temporaryImages}
            onChange={() => {
              void loadMedia();
            }}
            onError={notifyError}
          />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                placeholder="Пошук за ім’ям файлу або URL"
              />
            </div>

            <Select
              value={collection}
              onValueChange={(value) => {
                const next = value as 'all' | MediaCollection;
                setCollection(next);
                void loadMedia(next);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі колекції</SelectItem>
                <SelectItem value="plants">Рослини</SelectItem>
                <SelectItem value="site">Сайт</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Завантаження медіатеки...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
              <Images className="mb-4 h-10 w-10 text-emerald-500" />
              <h3 className="text-lg font-semibold">Медіатека порожня</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Завантажте перші зображення для каталогу або контенту сайту.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleItems.map((item) => (
                <div
                  key={item.url}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                    <SafeImage
                      src={item.url}
                      alt={item.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-medium">
                        {item.filename}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                        {item.collection}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatBytes(item.size)} • {new Date(item.updatedAt).toLocaleString('uk-UA')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={async () => {
                          await navigator.clipboard.writeText(item.url);
                          notifySuccess('URL зображення скопійовано.');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Скопіювати
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setPendingDelete(item);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isDeleteOpen}
        title="Видалити файл?"
        description={
          pendingDelete
            ? `Файл "${pendingDelete.filename}" буде видалено назавжди. Якщо він ще використовується у рослинах, сервер не дозволить цю операцію.`
            : 'Файл буде видалено назавжди.'
        }
        confirmLabel="Видалити файл"
        isSubmitting={isDeleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
