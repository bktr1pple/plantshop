import Link from 'next/link';
import { ArrowRight, Images, Package, Settings2, Sprout, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchServerPlants, fetchServerPublicSiteSettings } from '@/lib/server-api';
import { formatPrice } from '@/lib/format-price';

function formatDate(value?: string): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AdminPage() {
  const [plants, settings] = await Promise.all([
    fetchServerPlants(),
    fetchServerPublicSiteSettings(),
  ]);

  const plantsWithImages = plants.filter((plant) => (plant.images?.length ?? 0) > 0).length;
  const averagePrice =
    plants.length > 0
      ? plants.reduce((sum, plant) => sum + plant.price, 0) / plants.length
      : 0;
  const recentPlants = plants.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Усього рослин</CardDescription>
            <CardTitle className="text-3xl">{plants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Зображення в каталозі</CardDescription>
            <CardTitle className="text-3xl">{plantsWithImages}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Середня ціна</CardDescription>
            <CardTitle className="text-3xl">{formatPrice(averagePrice)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardDescription>Контактний email</CardDescription>
            <CardTitle className="text-lg">{settings.contactEmail}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Швидкі дії</CardTitle>
            <CardDescription>
              Основні сценарії керування сайтом в одному місці.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Link href="/admin/plants">
              <div className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60">
                <Sprout className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="font-semibold">Керування рослинами</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Створення, редагування, видалення та робота з фото.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  Відкрити
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/admin/media">
              <div className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60">
                <Images className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="font-semibold">Медіатека</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Завантаження зображень, бібліотека файлів і очищення непотрібних ресурсів.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  Відкрити
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/admin/settings">
              <div className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60">
                <Settings2 className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="font-semibold">Налаштування сайту</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Hero, footer, контакти та соціальні посилання без редагування коду.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  Відкрити
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link href="/admin/orders">
              <div className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/60">
                <Package className="mb-3 h-8 w-8 text-emerald-600" />
                <h3 className="font-semibold">Замовлення</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Перегляд історії покупок, деталей замовлень і оновлення статусів.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  Відкрити
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Статус storefront</CardTitle>
            <CardDescription>
              Короткий зріз того, що зараз опубліковано на сайті.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Hero
              </p>
              <p className="mt-2 text-lg font-semibold">{settings.heroTitleLine1} / {settings.heroTitleLine2} / {settings.heroTitleLine3}</p>
              <p className="mt-2 text-sm text-slate-500">{settings.heroSubtitle}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Контакти
              </p>
              <p className="mt-2 font-semibold">{settings.contactPhoneDisplay}</p>
              <p className="text-sm text-slate-500">{settings.contactEmail}</p>
              <p className="text-sm text-slate-500">{settings.contactAddress}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Оновлення каталогу</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Остання зміна: {formatDate(recentPlants[0]?.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-lg border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Останні рослини</CardTitle>
          <CardDescription>
            Недавні зміни каталогу, щоб швидко повернутися до останньої роботи.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPlants.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/50">
              Каталог поки що порожній. Почніть із додавання першої рослини.
            </div>
          ) : (
            recentPlants.map((plant) => (
              <div
                key={plant.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{plant.name}</p>
                    <Badge variant="outline">{plant.images?.length ?? 0} фото</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Оновлено: {formatDate(plant.updatedAt)}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/admin/plants">Відкрити каталог</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
