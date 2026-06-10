"use client";

import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { API_URL } from "@/lib/site-settings";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

type SubmitState = "idle" | "loading" | "success" | "error";

const initialForm: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
};

function getApiMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const message = (data as { message?: unknown }).message;
  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string").join(", ") || fallback;
  }

  return fallback;
}

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const captchaRef = useRef<ReCAPTCHA>(null);
  const [form, setForm] = useState<ContactFormState>(initialForm);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string>("");

  const workingHours = settings.showroomHours.split("\n").filter(Boolean);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const canSubmit =
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    form.message.trim().length >= 10 &&
    form.consent &&
    !!captchaToken &&
    submitState !== "loading";

  const updateField = (
    field: keyof ContactFormState,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitState === "error") {
      setSubmitState("idle");
      setMessage("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!siteKey) {
      setSubmitState("error");
      setMessage("Не налаштовано ключ reCAPTCHA для контактної форми.");
      return;
    }

    if (!canSubmit) {
      setSubmitState("error");
      setMessage("Заповніть обов’язкові поля та підтвердьте reCAPTCHA.");
      return;
    }

    setSubmitState("loading");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          subject: form.subject.trim() || undefined,
          message: form.message.trim(),
          captchaToken,
        }),
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        throw new Error(
          getApiMessage(data, "Не вдалося надіслати повідомлення. Спробуйте ще раз."),
        );
      }

      setForm(initialForm);
      setCaptchaToken(null);
      captchaRef.current?.reset();
      setSubmitState("success");
      setMessage(getApiMessage(data, "Повідомлення надіслано. Ми відповімо найближчим часом."));
    } catch (error) {
      captchaRef.current?.reset();
      setCaptchaToken(null);
      setSubmitState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Сервер тимчасово недоступний. Спробуйте ще раз пізніше.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white pt-24 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-50">
      <main className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <section className="space-y-8">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              Контакти PlantShop
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Напишіть нам
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {settings.contactIntro}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                Ім’я *
                <input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  disabled={submitState === "loading"}
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Ваше ім’я"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Email *
                <input
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  disabled={submitState === "loading"}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="name@example.com"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Телефон
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  disabled={submitState === "loading"}
                  type="tel"
                  autoComplete="tel"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="+380..."
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Тема
                <select
                  value={form.subject}
                  onChange={(event) => updateField("subject", event.target.value)}
                  disabled={submitState === "loading"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">Оберіть тему</option>
                  <option value="Питання щодо рослини">Питання щодо рослини</option>
                  <option value="Питання щодо замовлення">Питання щодо замовлення</option>
                  <option value="Ландшафтний дизайн">Ландшафтний дизайн</option>
                  <option value="Інше питання">Інше питання</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-1.5 text-sm font-medium">
              Повідомлення *
              <textarea
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                disabled={submitState === "loading"}
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
                placeholder="Опишіть питання або запит на консультацію"
              />
            </label>

            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => updateField("consent", event.target.checked)}
                disabled={submitState === "loading"}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                Я погоджуюся, що PlantShop використає ці дані для відповіді на моє звернення.
              </span>
            </label>

            <div className="mt-5">
              {siteKey ? (
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={siteKey}
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                  onErrored={() => {
                    setCaptchaToken(null);
                    setSubmitState("error");
                    setMessage("Не вдалося завантажити reCAPTCHA. Спробуйте оновити сторінку.");
                  }}
                  className="recaptcha-container"
                />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                  Для контактної форми потрібно налаштувати ключ reCAPTCHA.
                </div>
              )}
            </div>

            {message && (
              <div
                className={
                  "mt-4 rounded-xl border p-3 text-sm " +
                  (submitState === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100")
                }
                role="status"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState === "loading" ? (
                "Надсилаємо..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Надіслати
                </>
              )}
            </button>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <h2 className="text-lg font-semibold">Швидкі контакти</h2>
            <div className="mt-5 space-y-4 text-sm">
              <a href={settings.contactPhoneHref} className="flex gap-3 rounded-xl p-3 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Phone className="mt-0.5 h-5 w-5 text-emerald-600" />
                <span>
                  <span className="block font-medium">Телефон</span>
                  <span className="text-slate-600 dark:text-slate-300">{settings.contactPhoneDisplay}</span>
                </span>
              </a>
              <a href={`mailto:${settings.contactEmail}`} className="flex gap-3 rounded-xl p-3 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <Mail className="mt-0.5 h-5 w-5 text-emerald-600" />
                <span>
                  <span className="block font-medium">Email</span>
                  <span className="break-all text-slate-600 dark:text-slate-300">{settings.contactEmail}</span>
                </span>
              </a>
              <div className="flex gap-3 rounded-xl p-3">
                <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
                <span>
                  <span className="block font-medium">Адреса</span>
                  <span className="text-slate-600 dark:text-slate-300">{settings.contactAddress}</span>
                </span>
              </div>
              <div className="flex gap-3 rounded-xl p-3">
                <Clock className="mt-0.5 h-5 w-5 text-emerald-600" />
                <span>
                  <span className="block font-medium">Графік роботи</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {workingHours.length
                      ? workingHours.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)
                      : "За домовленістю"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
            <h2 className="mt-3 text-lg font-semibold">Потрібна консультація з озеленення?</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50">
              Опишіть простір, умови освітлення та бажаний результат. Ми підкажемо, які рослини або послуги PlantShop краще підійдуть.
            </p>
            <Link href="/landscape-design" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
              Переглянути послуги
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <a href={settings.messengerUrl} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900/90">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>
              <span className="block text-sm font-semibold">Месенджери</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{settings.messengerLabel}</span>
            </span>
          </a>
        </aside>
      </main>
    </div>
  );
}
