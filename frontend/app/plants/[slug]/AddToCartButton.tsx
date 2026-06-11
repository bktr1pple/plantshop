'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import type { Plant } from '@/app/types/plant';

export default function AddToCartButton({ plant }: { plant: Plant }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    addToCart({
      id: plant.id.toString(),
      name: plant.name,
      price: plant.price,
      image: plant.images?.[0] ?? '/images/placeholder.jpg',
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsAdding(false);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl disabled:opacity-50 sm:w-auto"
    >
      {isAdding ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Додаємо...
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          Додати в кошик
        </>
      )}
    </button>
  );
}
