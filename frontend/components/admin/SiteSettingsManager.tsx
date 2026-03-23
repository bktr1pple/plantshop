'use client';

import { useEffect, useState } from 'react';
import { Globe2, Save, Phone, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/components/NotificationSystem';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  defaultSiteSettings,
  type SiteSettings,
} from '@/lib/site-settings';
import {
  getAdminSiteSettings,
  updateAdminSiteSettings,
} from '@/lib/admin-api';

function hoursToTextarea(value: string): string {
  return value;
}

export function SiteSettingsManager() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const { refreshSettings } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const data = await getAdminSiteSettings();
        setForm({
          ...defaultSiteSettings,
          ...data,
          showroomHours: hoursToTextarea(data.showroomHours),
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Не вдалося завантажити налаштування',
          message:
            error instanceof Error
              ? error.message
              : 'Спробуйте ще раз пізніше.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [addNotification]);

  const setField = <K extends keyof SiteSettings>(
    field: K,
    value: SiteSettings[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const updated = await updateAdminSiteSettings(form);
      setForm({
        ...defaultSiteSettings,
        ...updated,
      });
      await refreshSettings();
      router.refresh();
      addNotification({
        type: 'success',
        title: 'Налаштування збережено',
        message: 'Публічні тексти й контакти сайту оновлено.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Не вдалося зберегти налаштування',
        message:
          error instanceof Error
            ? error.message
            : 'Спробуйте ще раз пізніше.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-slate-500">
          Завантаження налаштувань...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-emerald-600" />
            Головна сторінка
          </CardTitle>
          <CardDescription>
            Керуйте hero-контентом, який бачить відвідувач одразу після входу на сайт.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <Input
            value={form.heroTitleLine1}
            onChange={(e) => setField('heroTitleLine1', e.target.value)}
            placeholder="Перша лінія заголовка"
          />
          <Input
            value={form.heroTitleLine2}
            onChange={(e) => setField('heroTitleLine2', e.target.value)}
            placeholder="Друга лінія заголовка"
          />
          <Input
            value={form.heroTitleLine3}
            onChange={(e) => setField('heroTitleLine3', e.target.value)}
            placeholder="Третя лінія заголовка"
          />
          <Input
            value={form.heroPrimaryCtaLabel}
            onChange={(e) => setField('heroPrimaryCtaLabel', e.target.value)}
            placeholder="Текст головної кнопки"
          />
          <div className="lg:col-span-2">
            <Input
              value={form.heroPrimaryCtaHref}
              onChange={(e) => setField('heroPrimaryCtaHref', e.target.value)}
              placeholder="Посилання кнопки hero"
            />
          </div>
          <div className="lg:col-span-2">
            <Textarea
              rows={4}
              value={form.heroSubtitle}
              onChange={(e) => setField('heroSubtitle', e.target.value)}
              placeholder="Підзаголовок hero-блоку"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-emerald-600" />
              Контакти та соціальні мережі
            </CardTitle>
            <CardDescription>
              Ці дані використовуються у footer та на сторінці контактів.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={form.contactPhoneDisplay}
              onChange={(e) => setField('contactPhoneDisplay', e.target.value)}
              placeholder="Телефон для відображення"
            />
            <Input
              value={form.contactPhoneHref}
              onChange={(e) => setField('contactPhoneHref', e.target.value)}
              placeholder="Посилання телефону, наприклад tel:+380..."
            />
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setField('contactEmail', e.target.value)}
              placeholder="Email"
            />
            <Input
              value={form.contactAddress}
              onChange={(e) => setField('contactAddress', e.target.value)}
              placeholder="Адреса"
            />
            <Textarea
              rows={3}
              value={form.showroomHours}
              onChange={(e) => setField('showroomHours', e.target.value)}
              placeholder="Години роботи"
            />
            <Input
              value={form.messengerLabel}
              onChange={(e) => setField('messengerLabel', e.target.value)}
              placeholder="Підпис месенджера"
            />
            <Input
              value={form.messengerUrl}
              onChange={(e) => setField('messengerUrl', e.target.value)}
              placeholder="Посилання на месенджер"
            />
            <Input
              value={form.facebookUrl}
              onChange={(e) => setField('facebookUrl', e.target.value)}
              placeholder="Facebook URL"
            />
            <Input
              value={form.instagramUrl}
              onChange={(e) => setField('instagramUrl', e.target.value)}
              placeholder="Instagram URL"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-emerald-600" />
              Бренд і footer
            </CardTitle>
            <CardDescription>
              Оновлюйте бренд, опис і фінальні CTA, які бачать користувачі по всьому сайту.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={form.siteName}
              onChange={(e) => setField('siteName', e.target.value)}
              placeholder="Назва сайту"
            />
            <Input
              value={form.siteTagline}
              onChange={(e) => setField('siteTagline', e.target.value)}
              placeholder="Короткий теглайн"
            />
            <Textarea
              rows={4}
              value={form.contactIntro}
              onChange={(e) => setField('contactIntro', e.target.value)}
              placeholder="Текст introduction для сторінки контактів"
            />
            <Textarea
              rows={4}
              value={form.footerDescription}
              onChange={(e) => setField('footerDescription', e.target.value)}
              placeholder="Опис у footer"
            />
            <Input
              value={form.footerCtaLabel}
              onChange={(e) => setField('footerCtaLabel', e.target.value)}
              placeholder="Текст footer CTA"
            />
            <Input
              value={form.footerCtaHref}
              onChange={(e) => setField('footerCtaHref', e.target.value)}
              placeholder="Посилання footer CTA"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => void saveSettings()} disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? 'Збереження...' : 'Зберегти зміни'}
        </Button>
      </div>
    </div>
  );
}
