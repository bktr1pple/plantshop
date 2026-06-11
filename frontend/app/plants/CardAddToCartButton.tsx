'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { Plant } from '@/app/types/plant';

export default function CardAddToCartButton({ plant }: { plant: Plant }) {
  const { addToCart } = useCart();

  const handleAddToCart = (event: React.MouseEvent) => {
    // Кнопка лежить поверх stretched-link картки — не даємо кліку
    // провалитися в навігацію на детальну сторінку.
    event.preventDefault();
    event.stopPropagation();

    addToCart({
      id: plant.id.toString(),
      name: plant.name,
      price: plant.price,
      image: plant.images?.[0] ?? '/images/placeholder.jpg',
    });
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      aria-label={`Додати ${plant.name} в кошик`}
      className="relative z-10 flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl"
    >
      <ShoppingCart size={14} />
      <span className="hidden sm:inline">Додати</span>
    </button>
  );
}
