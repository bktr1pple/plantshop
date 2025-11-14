'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog_old'
import { Button } from '@/components/ui/button_old'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Plant } from '../types/plant'

interface PlantModalCarouselProps {
  plant: Plant | null
  onClose: () => void
}

export default function PlantModalCarousel({ plant, onClose }: PlantModalCarouselProps) {
  const [current, setCurrent] = React.useState(0)

  // Закрытие по ESC
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!plant) return null

  const images = plant.images || ['/images/placeholder.jpg']

  const next = () => setCurrent((prev) => (prev + 1) % images.length)
  const prev = () => setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))

  return (
    <AnimatePresence>
      <Dialog open={!!plant} onOpenChange={onClose}>
        <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
        <DialogContent className="fixed inset-0 flex items-center justify-center z-50 border-none bg-transparent shadow-none">
          <motion.div
            key={plant.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ❌ Закрити */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md"
            >
              <X size={20} />
            </button>

            {/* 🔄 Карусель */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <Carousel>
                <CarouselContent>
                  {images.map((src, index) => (
                    <CarouselItem key={index} className="flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: index === current ? 1 : 0 }}
                        transition={{ duration: 0.4 }}
                        className={`w-full h-full flex items-center justify-center`}
                      >
                        <Image
                          src={src}
                          alt={plant.name}
                          fill
                          className="object-contain w-full h-full"
                        />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* ⬅️➡️ Кнопки за межами фото */}
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="absolute left-[-60px] sm:left-[-80px] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
              >
                <ChevronLeft size={24} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="absolute right-[-60px] sm:right-[-80px] top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full"
              >
                <ChevronRight size={24} />
              </Button>
            </div>

            {/* ℹ️ Інфо про рослину */}
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{plant.name}</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">{plant.description}</p>
              <p className="text-2xl font-semibold text-green-700 mb-6">${plant.price.toFixed(2)}</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full font-semibold shadow-md active:scale-95 transition-all">
                Add to Cart
              </button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
