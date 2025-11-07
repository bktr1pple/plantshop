// app/page.tsx

import Footer from '../components/Footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-grow">
        <h2 className="text-3xl font-bold mb-8 text-center">About Us</h2>

      </main>
      <Footer />
    </div>
  );
}
