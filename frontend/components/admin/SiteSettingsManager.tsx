'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Globe2, Save, Phone, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/components/NotificationSystem';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
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

type SettingsSectionProps = {
  title: string;
  description: string;
  icon: typeof LayoutTemplate;
  children: ReactNode;
};

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-md bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
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
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Завантаження налаштувань...
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Налаштування сайту
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              Редагуйте головну сторінку, контакти, бренд і footer. Кнопка збереження доступна зверху та внизу форми.
            </p>
          </div>
          <Button
            className="w-full xl:w-auto"
            onClick={() => void saveSettings()}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Збереження...' : 'Зберегти зміни'}
          </Button>
        </div>
      </div>

      <SettingsSection
        title="Головна сторінка"
        description="Керуйте hero-контентом, який бачить відвідувач одразу після входу на сайт."
        icon={LayoutTemplate}
      >
        <div className="grid gap-3 xl:grid-cols-2">
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
          <div className="xl:col-span-2">
            <Input
              value={form.heroPrimaryCtaHref}
              onChange={(e) => setField('heroPrimaryCtaHref', e.target.value)}
              placeholder="Посилання кнопки hero"
            />
          </div>
          <div className="xl:col-span-2">
            <Textarea
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) => setField('heroSubtitle', e.target.value)}
              placeholder="Підзаголовок hero-блоку"
            />
          </div>
        </div>
      </SettingsSection>

      <div className="grid gap-3 xl:grid-cols-2">
        <SettingsSection
          title="Контакти та соціальні мережі"
          description="Ці дані використовуються у footer та на сторінці контактів."
          icon={Phone}
        >
          <div className="grid gap-3">
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
          </div>
        </SettingsSection>

        <SettingsSection
          title="Бренд і footer"
          description="Оновлюйте бренд, опис і фінальні CTA, які бачать користувачі по всьому сайту."
          icon={Globe2}
        >
          <div className="grid gap-3">
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
              rows={3}
              value={form.contactIntro}
              onChange={(e) => setField('contactIntro', e.target.value)}
              placeholder="Текст introduction для сторінки контактів"
            />
            <Textarea
              rows={3}
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
          </div>
        </SettingsSection>
      </div>

      <div className="flex justify-end rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Button
          aria-label="Зберегти зміни внизу форми"
          className="w-full sm:w-auto"
          onClick={() => void saveSettings()}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Збереження...' : 'Зберегти зміни'}
        </Button>
      </div>
    </div>
  );
}
