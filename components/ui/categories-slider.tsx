"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Category {
  id: number
  name: string
  image: string | null
}

interface CategoriesSliderProps {
  categories: Category[]
  categoriesLoading: boolean
  getCategoryEmoji: (categoryName: string) => string
  getCategoryColor: (categoryName: string) => string
}

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
  categories,
  categoriesLoading,
  getCategoryEmoji,
  getCategoryColor
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleSlides, setVisibleSlides] = useState(5)

  /* ── Responsive slide count ──────────────────────────────── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleSlides(1)
      } else if (window.innerWidth < 1024) {
        setVisibleSlides(3)
      } else {
        setVisibleSlides(5)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* ── Navigation helpers ──────────────────────────────────── */
  const nextSlide = useCallback(
    () => setCurrentIndex((i) => (i === categories.length - 1 ? 0 : i + 1)),
    [categories.length]
  )
  const prevSlide = useCallback(
    () => setCurrentIndex((i) => (i === 0 ? categories.length - 1 : i - 1)),
    [categories.length]
  )

  /* ── Page / dot helpers ──────────────────────────────────── */
  const totalPages = Math.ceil(categories.length / visibleSlides)
  const currentPage = Math.floor(currentIndex / visibleSlides)

  /* Slice the array only on small / medium screens */
  const getVisibleSlides = (): Category[] => {
    if (visibleSlides >= categories.length) return categories

    const start = currentPage * visibleSlides
    const chunk = categories.slice(start, start + visibleSlides)

    /* wrap‑around chunk if we reached the end */
    return chunk.length < visibleSlides
      ? [...chunk, ...categories.slice(0, visibleSlides - chunk.length)]
      : chunk
  }

  const visible = getVisibleSlides()

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No categories found in database</p>
          <p className="text-sm text-gray-400">Please add categories to the database to see them here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our Categories
        </h1>
        <p className="text-lg text-gray-600">
          Explore our different product categories
        </p>
      </header>

      {/* Slider */}
      <section className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="relative">
          {/* Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-gray-50 w-14 h-14 border-gray-300"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-lg hover:bg-gray-50 w-14 h-14 border-gray-300"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </Button>

          {/* Slides */}
          <div className="mx-20">
            <div
              className={`grid gap-6 ${
                visibleSlides === 1
                  ? "grid-cols-1"
                  : visibleSlides === 3
                  ? "grid-cols-3"
                  : "grid-cols-5"
              }`}
            >
              {visible.map((category) => {
                const originalIdx = categories.findIndex((c) => c.id === category.id)
                const isActive = originalIdx === currentIndex

                return (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                      isActive
                        ? "border-2 border-green-500 shadow-xl bg-white"
                        : "border border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white"
                    }`}
                    onClick={() => setCurrentIndex(originalIdx)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[200px]">
                      <div className="relative w-[151px] h-[151px] mb-4">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover rounded-lg transform transition-transform duration-300 hover:scale-110"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center rounded-lg ${getCategoryColor(category.name)}`}>
                            <span className="text-4xl">{getCategoryEmoji(category.name)}</span>
                          </div>
                        )}
                      </div>
                      <h3
                        className={`text-lg font-semibold transition-colors duration-300 ${
                          isActive ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx === currentPage
                    ? "bg-green-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => setCurrentIndex(idx * visibleSlides)}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CategoriesSlider
