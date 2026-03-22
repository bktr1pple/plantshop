"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    const frame = window.requestAnimationFrame(() => {
      setIsStandalone(standalone);
      setIsIOS(isIos || isSafari);
    });

    // Обработчик для установки PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(installEvent);
      setIsVisible(true);
    };

    // Обработчик для успешной установки
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleIOSInstructions = () => {
    setIsVisible(false);
    // Можно показать модальное окно с инструкциями для iOS
    alert('Для установки приложения на iOS: нажмите кнопку "Поделиться" и выберите "На экран «Домой»"');
  };

  if (isStandalone || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                Установите приложение
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs mb-3">
                Установите Plant Shop для быстрого доступа и работы офлайн
              </p>
              
              <div className="flex gap-2">
                {!isIOS ? (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Установить
                  </button>
                ) : (
                  <button
                    onClick={handleIOSInstructions}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Инструкция
                  </button>
                )}
                
                <button
                  onClick={() => setIsVisible(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
