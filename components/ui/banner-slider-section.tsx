"use client"

import { useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import Image from "next/image"
import Link from "next/link"

import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/autoplay"

interface Category {
  id: number
  name: string
  image: string | null
}

export default function BannerSliderSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section className="section-t-space banner-section py-8 bg-white">
      <div className="container-fluid-lg max-w-7xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Featured Industries</h2>
        </div>
        <div className="banner-slider relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex gap-4 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer rounded-xl h-48 w-full max-w-xs" />
                ))}
              </div>
              <div className="flex justify-center items-center mt-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-600">Loading Categories...</span>
              </div>
            </div>
          ) : (
            <Swiper
              modules={[Pagination, Autoplay]}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              spaceBetween={20}
              slidesPerView={1}
              slidesPerGroup={1}
              speed={800}
              pagination={{
                el: ".swiper-pagination-custom",
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 1000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }}
              loop={true}
              loopAdditionalSlides={3}
              watchSlidesProgress={true}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 1,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 1,
                  spaceBetween: 20,
                },
              }}
              className="banner-swiper"
            >
              {categories.map((category) => (
                <SwiperSlide key={category.id}>
                  <div className="banner-slide h-full">
                    <Link href={`/collections?category=${category.id}`} className="block h-full">
                      <div className="banner-contain group relative overflow-hidden rounded-xl h-full bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-[4/3] w-full">
                          <Image
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg drop-shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              {category.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="swiper-pagination-custom mt-6 flex justify-center"></div>
        </div>
      </div>
    </section>
  )
} 