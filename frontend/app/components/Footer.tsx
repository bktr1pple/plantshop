export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 shadow-inner mt-0 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} PlantShop. Всі права захищені.
        </p>

        <div className="flex gap-6">
          <a
            href="/privacy"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Політика конфіденційності
          </a>
          <a
            href="/terms"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Умови використання
          </a>
          <a
            href="/contact"
            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Контакти
          </a>
        </div>
      </div>
    </footer>
  );
}