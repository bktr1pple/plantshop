'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/SafeImage';
import { uploadAdminMedia, type MediaCollection } from '@/lib/admin-api';
import { cn } from '@/lib/utils';

export type ManagedImageItem = {
  id: string;
  url: string;
  filename?: string;
  isTemporary: boolean;
};

interface MediaUploaderProps {
  collection: MediaCollection;
  images: ManagedImageItem[];
  disabled?: boolean;
  onChange: (images: ManagedImageItem[]) => void;
  onError: (message: string) => void;
  onTemporaryRemove?: (image: ManagedImageItem) => Promise<void>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function MediaUploader({
  collection,
  images,
  disabled = false,
  onChange,
  onError,
  onTemporaryRemove,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (filesList: FileList | null) => {
    if (!filesList?.length) {
      return;
    }

    const files = Array.from(filesList);
    const invalidType = files.find((file) => !file.type.startsWith('image/'));
    if (invalidType) {
      onError('Дозволено лише зображення.');
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      onError('Кожен файл має бути менше 5 МБ.');
      return;
    }

    setIsUploading(true);

    try {
      const uploadedItems = await uploadAdminMedia(files, collection);
      onChange([
        ...images,
        ...uploadedItems.map((item) => ({
          id: item.url,
          url: item.url,
          filename: item.filename,
          isTemporary: true,
        })),
      ]);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Не вдалося завантажити файли');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (image: ManagedImageItem) => {
    if (image.isTemporary && onTemporaryRemove) {
      try {
        await onTemporaryRemove(image);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Не вдалося видалити файл');
        return;
      }
    }

    onChange(images.filter((item) => item.id !== image.id));
  };

  const makePrimary = (image: ManagedImageItem) => {
    const nextImages = [
      image,
      ...images.filter((item) => item.id !== image.id),
    ];
    onChange(nextImages);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50',
          disabled && 'opacity-60',
        )}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Завантаження зображень
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          JPG, PNG, WEBP або GIF до 5 МБ. Можна вибирати одразу кілька файлів.
        </p>
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => void handleUpload(e.target.files)}
          />
          <Button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {isUploading ? 'Завантаження...' : 'Додати зображення'}
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                <SafeImage
                  src={image.url}
                  alt={image.filename || `Plant image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {index === 0 && (
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-current" />
                    Обкладинка
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <p className="truncate text-sm text-slate-500">
                  {image.filename || image.url}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => makePrimary(image)}
                    disabled={disabled || index === 0}
                  >
                    <Star className="h-4 w-4" />
                    Обкладинка
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void handleRemove(image)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
