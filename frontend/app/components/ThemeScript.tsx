// components/ThemeScript.tsx
import Script from 'next/script';

export function ThemeScript() {
  return (
    <Script id="theme-script" strategy="beforeInteractive">
      {`
          (function() {
            try {
              var savedTheme = localStorage.getItem('theme');
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = savedTheme || (systemDark ? 'dark' : 'light');
              
              document.documentElement.classList.toggle('dark', theme === 'dark');
              
              // Для CSS variables
              document.documentElement.style.setProperty('--initial-theme', theme);
            } catch (e) {}
          })();
        `}
    </Script>
  );
}
