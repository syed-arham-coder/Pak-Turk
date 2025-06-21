"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  ShoppingCart,
  User,
  Truck,
  ThumbsUp,
  CreditCard,
  Headphones,
  Star,
  Play,
  CheckCircle,
  MapPin,
  FileText,
  Package,
  Building2,
  Award,
  Calendar,
  Globe,
  Mail,
  MessageSquare,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import FooterOne from "@/components/footer/footer-one"
import Image from "next/image"
import Slider from "react-slick"
import Header from "@/components/layout/header"
import BannerSliderSection from "@/components/ui/banner-slider-section"

interface Category {
  id: number
  name: string
  image: string | null
}

interface Product {
  id: string
  product_name: string
  product_description: string
  product_overview?: string
  role: 'Buyer' | 'Saler' | 'Buyer/Saler'
  minimum_units: number
  maximum_units: number
  image?: string
  images?: Array<{ data: string; isPrimary: boolean; displayOrder: number; name?: string }>
  video?: string
  category_id: string
  company_id: string
  company_name?: string
  out_of_stock: boolean
  brand_name: string
  model_number: string
  product_unit: string
  min_order_quantity: number
  hscode: string
  port?: string
  shipping_option?: string
  production_capacity?: string
  brochure_url?: string
  warranty?: string
  iso_certified: boolean
  meta_title?: string
  meta_keyword?: string
  meta_description?: string
  specifications?: Array<{ key: string; value: string }>
  created_at: string
  image_360?: string
  brochure?: string
  category_name?: string
}

interface Company {
  id: string
  name: string
  address: string
  website: string
  business_type: string
  company_type: string
  trade_association_member: boolean
  city: string
  country: string
  created_at: string
  updated_at: string
  profile_photo: string | null
  company_description: string
  email: string
  industry: string
  phone: string
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [email, setEmail] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)

  const productsSliderRef = useRef<any>(null)
  const vendorsSliderRef = useRef<any>(null)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchCompanies()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      } else {
        console.error("Failed to fetch categories:", data.message)
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const response = await fetch("/api/products?limit=8")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      if (data.success) {
        setProducts(data.products || [])
      } else {
        console.error("Failed to fetch products:", data.error)
        setProducts([])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true)
      const response = await fetch("/api/companies?limit=4")
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      if (data.success) {
        setCompanies(data.companies || [])
      } else {
        console.error("Failed to fetch companies:", data.error)
        setCompanies([])
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      setCompanies([])
    } finally {
      setCompaniesLoading(false)
    }
  }

  const handleViewVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl)
    setVideoModalOpen(true)
  }

  const openProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setSelectedImageIndex(0)
    setProductDetailOpen(true)
  }

  const openCompanyDialog = (company: Company) => {
    setSelectedCompany(company)
    setCompanyDetailOpen(true)
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getBusinessTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      manufacturer: "bg-blue-100 text-blue-800",
      trader: "bg-green-100 text-green-800",
      service: "bg-purple-100 text-purple-800",
      exporter: "bg-orange-100 text-orange-800",
      importer: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.other
  }

  const getCompanyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      private: "bg-indigo-100 text-indigo-800",
      public: "bg-yellow-100 text-yellow-800",
      partnership: "bg-pink-100 text-pink-800",
      proprietorship: "bg-teal-100 text-teal-800",
      government: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors.other
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const getCategoryEmoji = (categoryName: string): string => {
    const emojiMap: { [key: string]: string } = {
      Vegetables: "🥬",
      "Fish & Meats": "🥩",
      Desserts: "🧁",
      "Drinks & Juice": "🧃",
      "Animals Food": "🐕",
      "Fresh Fruits": "🍎",
      "Yummy Candy": "🍭",
      "Dairy & Eggs": "🥛",
      Snacks: "🥜",
      Beverages: "🥤",
      Bakery: "🍞",
      "Frozen Foods": "🧊",
      "Canned Goods": "🥫",
      Condiments: "🧂",
      Grains: "🌾",
      Nuts: "🥜",
      Seafood: "🦐",
      Poultry: "🍗",
      Organic: "🌱",
      "Gluten Free": "🌾",
    }
    return emojiMap[categoryName] || "📦"
  }

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      Vegetables: "bg-green-600",
      "Fish & Meats": "bg-red-500",
      Desserts: "bg-yellow-400",
      "Drinks & Juice": "bg-orange-400",
      "Animals Food": "bg-amber-600",
      "Fresh Fruits": "bg-red-400",
      "Yummy Candy": "bg-pink-400",
      "Dairy & Eggs": "bg-blue-100",
      Snacks: "bg-amber-500",
      Beverages: "bg-blue-500",
      Bakery: "bg-yellow-500",
      "Frozen Foods": "bg-blue-300",
      "Canned Goods": "bg-gray-500",
      Condiments: "bg-orange-500",
      Grains: "bg-yellow-600",
      Nuts: "bg-amber-700",
      Seafood: "bg-blue-400",
      Poultry: "bg-red-600",
      Organic: "bg-green-500",
      "Gluten Free": "bg-yellow-300",
    }
    return colorMap[categoryName] || "bg-gray-500"
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3) // Assuming 3 slides
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* React Slick Arrow Styling */
        .products-slider .slick-prev,
        .products-slider .slick-next,
        .vendors-slider .slick-prev,
        .vendors-slider .slick-next {
          width: 40px;
          height: 40px;
          background: white !important;
          border-radius: 50% !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          transition: all 0.3s ease !important;
          z-index: 10 !important;
        }
        
        .products-slider .slick-prev:hover,
        .products-slider .slick-next:hover,
        .vendors-slider .slick-prev:hover,
        .vendors-slider .slick-next:hover {
          background: #16a34a !important;
          color: white !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        .products-slider .slick-prev,
        .vendors-slider .slick-prev {
          left: -20px !important;
        }
        
        .products-slider .slick-next,
        .vendors-slider .slick-next {
          right: -20px !important;
        }
        
        .products-slider .slick-prev:before,
        .products-slider .slick-next:before,
        .vendors-slider .slick-prev:before,
        .vendors-slider .slick-next:before {
          font-family: 'lucide-react' !important;
          font-size: 20px !important;
          color: #4b5563 !important;
          transition: color 0.3s ease !important;
        }
        
        .products-slider .slick-prev:hover:before,
        .products-slider .slick-next:hover:before,
        .vendors-slider .slick-prev:hover:before,
        .vendors-slider .slick-next:hover:before {
          color: white !important;
        }
        
        .products-slider .slick-prev:before,
        .vendors-slider .slick-prev:before {
          content: "‹" !important;
        }
        
        .products-slider .slick-next:before,
        .vendors-slider .slick-next:before {
          content: "›" !important;
        }
      `}</style>

      {/* Header */}
      <Header />
      {/* Hero Slider Section */}
      <section className="w-full">
        <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px]">
          <Image
            src="/assets/slider.png"
            alt="Slider"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>
      </section>

      {/* Product Categories Section */}
      <BannerSliderSection />

      {/*Vendors Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Companies</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => vendorsSliderRef.current?.slickPrev()}
                  className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-green-600 hover:text-white transition-all duration-300 border border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => vendorsSliderRef.current?.slickNext()}
                  className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-green-600 hover:text-white transition-all duration-300 border border-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Link href="/dashboard/vendors" className="text-green-600 hover:text-green-700 font-medium">
                All Companies
              </Link>
            </div>
          </div>

          {/* Vendors Horizontal Scroll */}
          {companiesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading Companies...</span>
            </div>
          ) : companies.length > 0 ? (
            <div className="relative">
              <Slider
                ref={vendorsSliderRef}
                dots={false}
                arrows={false}
                infinite={true}
                speed={500}
                slidesToShow={4}
                slidesToScroll={1}
                responsive={[
                  { breakpoint: 1600, settings: { slidesToShow: 4 } },
                  { breakpoint: 1200, settings: { slidesToShow: 3 } },
                  { breakpoint: 992, settings: { slidesToShow: 3 } },
                  { breakpoint: 768, settings: { slidesToShow: 2 } },
                  { breakpoint: 576, settings: { slidesToShow: 1 } },
                ]}
                className="vendors-slider"
              >
                {companies.map((company) => (
                  <div key={company.id} className="px-3">
                    <div
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 product-card-hover"
                      onClick={() => openCompanyDialog(company)}
                    >
                      {/* Company Header */}
                      <div className="relative w-full h-32 rounded-t-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50"></div>

                        {/* Company Avatar */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                            {company.profile_photo ? (
                              <Image
                                src={`data:image/jpeg;base64,${company.profile_photo}`}
                                alt={company.name}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="text-lg font-bold bg-green-600 text-white">
                                {getCompanyInitials(company.name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>

                        {/* Trade Member Badge */}
                        {company.trade_association_member && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                              <Award className="h-3 w-3" />
                              Trade Member
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Company Info */}
                      <div className="p-4 h-40 flex flex-col justify-between">
                        <div>
                          {/* Company Name */}
                          <h3 className="font-semibold text-base text-gray-800 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
                            {company.name}
                          </h3>
                          {/* Location */}
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">
                              {company.city}, {company.country}
                            </span>
                          </div>

                          {/* Business Type Badges */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${getBusinessTypeColor(company.business_type)}`}
                            >
                              {company.business_type}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${getCompanyTypeColor(company.company_type)}`}
                            >
                              {company.company_type}
                            </div>
                          </div>
                        </div>

                        {/* Industry */}
                        <div className="text-xs text-gray-500 truncate">{company.industry}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No vendors found</p>
              <p className="text-sm">Vendors will appear here once they are added to the database</p>
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Products</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => productsSliderRef.current?.slickPrev()}
                  className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-green-600 hover:text-white transition-all duration-300 border border-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => productsSliderRef.current?.slickNext()}
                  className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:bg-green-600 hover:text-white transition-all duration-300 border border-gray-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <Link href="/dashboard/marketplace" className="text-green-600 hover:text-green-700 font-medium">
                View All Products
              </Link>
            </div>
          </div>

          {/* Products Horizontal Scroll */}
          {productsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="relative">
              <Slider
                ref={productsSliderRef}
                dots={false}
                arrows={false}
                infinite={true}
                speed={500}
                slidesToShow={4}
                slidesToScroll={1}
                responsive={[
                  { breakpoint: 1600, settings: { slidesToShow: 4 } },
                  { breakpoint: 1200, settings: { slidesToShow: 3 } },
                  { breakpoint: 992, settings: { slidesToShow: 3 } },
                  { breakpoint: 768, settings: { slidesToShow: 2 } },
                  { breakpoint: 576, settings: { slidesToShow: 1 } },
                ]}
                className="products-slider"
              >
                {products.map((product) => (
                  <div key={product.id} className="px-3">
                    <div
                      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100 product-card-hover"
                      onClick={() => openProductDialog(product)}
                    >
                      {/* Product Image */}
                      <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                        <Image
                          src={product.image || "/placeholder.svg?width=320&height=192&text=N/A"}
                          alt={product.product_name}
                          width={320}
                          height={192}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.log("Image failed to load for product:", product.id)
                            e.currentTarget.src = "/placeholder.svg?width=320&height=192&text=N/A"
                          }}
                        />


                        {/* Video Play Button */}
                        {product.video && (
                          <div className="absolute bottom-3 left-3">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-10 w-10 bg-white/90 hover:bg-white shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewVideo(product.video!)
                              }}
                            >
                              <Play className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        {/* Product Name */}
                        <h3 className="font-semibold text-base text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {product.product_name}
                        </h3>

                        {/* Brand */}
                        <div className="flex items-center gap-2 mb-3">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">{getInitials(product.brand_name)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-500 truncate">{product.brand_name}</span>
                        </div>

                        {/* Price and Status */}
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {product.role}
                          </div>
                          <div
                            className={`text-sm px-3 py-1 rounded-full ${
                              product.out_of_stock ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                            }`}
                          >
                            {product.out_of_stock ? "Out of Stock" : "In Stock"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No products found</p>
              <p className="text-sm">Products will appear here once they are added to the database</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Shipping */}
            <div className="bg-green-50 rounded-2xl p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Free Shipping</h3>
                <p className="text-sm text-gray-600">Free shipping all over the US</p>
              </div>
            </div>

            {/* 100% Satisfaction */}
            <div className="bg-green-50 rounded-2xl p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">100% Satisfaction</h3>
                <p className="text-sm text-gray-600">Money back guarantee</p>
              </div>
            </div>

            {/* Secure Payments */}
            <div className="bg-green-50 rounded-2xl p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Secure Payments</h3>
                <p className="text-sm text-gray-600">SSL encrypted checkout</p>
              </div>
            </div>

            {/* 24/7 Support */}
            <div className="bg-green-50 rounded-2xl p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">24/7 Support</h3>
                <p className="text-sm text-gray-600">Round the clock assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* About-Us Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Video Background */}
              <video
                className="absolute inset-0 w-full h-full object-cover z-0"
                src="/videos/about-us.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="relative z-20 flex flex-col lg:flex-row items-center">
                {/* Left Content */}
                <div className="flex-1 p-8 lg:p-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Enough Talk. Time to Walk the Walk.</h2>
                  <p className="text-gray-300 text-lg mb-8 tracking-wider">Driving Strategic Trade & Investment Growth Between Pakistan and Türkiye.</p>
                    <Button
                      type="button"
                      className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium"
                    >
                      Read More
                    </Button>
                </div>
                {/* Right Image */}
                <div className="flex-1 p-8 lg:p-12">
                  <div className="relative">
                    <img
                      src="/images/about-us-image.png"
                      alt="Image"
                      className="w-full h-auto max-w-md mx-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </section>

        
      {/* Footer */}
      <FooterOne />

      {/* Product Details Dialog */}
      <Dialog open={productDetailOpen} onOpenChange={setProductDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <DialogTitle className="text-2xl">{selectedProduct.product_name}</DialogTitle>
                    <div className="flex items-center gap-4 mt-2">
                      {selectedProduct.iso_certified && <Badge variant="outline">ISO Certified</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">
                      {selectedProduct.role}
                    </p>
                    <Badge
                      className={
                        selectedProduct.out_of_stock ? "bg-red-500 text-white mt-1" : "bg-green-500 text-white mt-1"
                      }
                    >
                      {selectedProduct.out_of_stock ? "Out of Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">Specs</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="relative mb-4">
                        <Image
                          src={
                            selectedProduct.images?.[selectedImageIndex]?.data ||
                            selectedProduct.image ||
                            "/placeholder.svg?width=500&height=400&text=N/A" ||
                            "/placeholder.svg"
                          }
                          alt={selectedProduct.product_name}
                          width={500}
                          height={400}
                          className="rounded-lg object-cover w-full aspect-[5/4]"
                        />
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto">
                            {selectedProduct.images.map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 border-2 rounded ${
                                  selectedImageIndex === index ? "border-primary" : "border-gray-200"
                                }`}
                              >
                                <Image
                                  src={image.data || "/placeholder.svg"}
                                  alt={`${selectedProduct.product_name} ${index + 1}`}
                                  width={80}
                                  height={60}
                                  className="rounded object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Product Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price per unit:</span>
                            <span className="font-semibold text-primary text-lg">
                              {selectedProduct.role}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Unit:</span>
                            <span>{selectedProduct.product_unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Min Order:</span>
                            <span>
                              {selectedProduct.min_order_quantity} {selectedProduct.product_unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available Units:</span>
                            <span>
                              {selectedProduct.minimum_units} - {selectedProduct.maximum_units}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge
                              variant={selectedProduct.out_of_stock ? "destructive" : "default"}
                              className={
                                selectedProduct.out_of_stock
                                  ? "bg-red-500/20 text-red-700 border-red-500/30"
                                  : "bg-green-500/20 text-green-700 border-green-500/30"
                              }
                            >
                              {selectedProduct.out_of_stock ? "Out of Stock" : "In Stock"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedProduct.specifications?.slice(0, 6).map((spec, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">
                                  {spec.key}: {spec.value}
                                </span>
                              </div>
                            )) || (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">High Quality Product</span>
                              </div>
                            )}
                            {selectedProduct.iso_certified && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">ISO Certified</span>
                              </div>
                            )}
                            {selectedProduct.warranty && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Warranty: {selectedProduct.warranty}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="mb-4 text-sm leading-relaxed">{selectedProduct.product_description}</p>
                        {selectedProduct.product_overview && (
                          <div>
                            <h4 className="font-semibold mb-2">Overview</h4>
                            <p className="text-sm text-muted-foreground">{selectedProduct.product_overview}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProduct.images && selectedProduct.images.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Product Images ({selectedProduct.images.length})</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {selectedProduct.images.map((img, index) => (
                                <div key={index} className="relative">
                                  <Image
                                    src={img.data || "/placeholder.svg"}
                                    alt={img.name || `${selectedProduct.product_name} ${index + 1}`}
                                    width={150}
                                    height={100}
                                    className="rounded-lg object-cover w-full aspect-[3/2]"
                                  />
                                  {img.isPrimary && (
                                    <Badge className="absolute top-1 left-1 text-xs bg-blue-500">Primary</Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedProduct.video && (
                          <div>
                            <h4 className="font-medium mb-2">Product Video</h4>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewVideo(selectedProduct.video!)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Watch Product Video
                            </Button>
                          </div>
                        )}

                        {selectedProduct.brochure_url && (
                          <div>
                            <h4 className="font-medium mb-2">Brochure</h4>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(selectedProduct.brochure_url, "_blank")}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Brochure
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProduct.specifications && selectedProduct.specifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProduct.specifications.map((spec, index) => (
                            <div key={index} className="flex justify-between p-3 bg-muted/50 rounded">
                              <span className="font-medium">{spec.key}:</span>
                              <span className="text-muted-foreground">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No specifications available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Product Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between p-3 bg-muted/50 rounded">
                          <span className="font-medium">Model Number:</span>
                          <span className="text-muted-foreground">{selectedProduct.model_number}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/50 rounded">
                          <span className="font-medium">Brand:</span>
                          <span className="text-muted-foreground">{selectedProduct.brand_name}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-muted/50 rounded">
                          <span className="font-medium">HS Code:</span>
                          <span className="text-muted-foreground">{selectedProduct.hscode}</span>
                        </div>
                        {selectedProduct.warranty && (
                          <div className="flex justify-between p-3 bg-muted/50 rounded">
                            <span className="font-medium">Warranty:</span>
                            <span className="text-muted-foreground">{selectedProduct.warranty}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vendor" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getInitials(selectedProduct.brand_name)}</AvatarFallback>
                        </Avatar>
                        {selectedProduct.brand_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStars(4.5)}
                          <span className="text-sm ml-1">4.5 Company Rating</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          This product is manufactured by {selectedProduct.brand_name}, a trusted supplier in the
                          industry.
                        </p>
                        {selectedProduct.iso_certified && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">ISO Certified Company</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Video</DialogTitle>
          </DialogHeader>
          {currentVideo && (
            <div className="aspect-video">
              <video
                controls
                className="w-full h-full rounded-lg"
                preload="metadata"
                onError={(e) => {
                  console.error("Video error:", e)
                }}
              >
                <source src={currentVideo} type="video/mp4" />
                <source src={currentVideo} type="video/webm" />
                <source src={currentVideo} type="video/avi" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Detail Dialog */}
      <Dialog open={companyDetailOpen} onOpenChange={setCompanyDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">{getCompanyInitials(selectedCompany.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedCompany.name}</DialogTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedCompany.city}, {selectedCompany.country}
                        </span>
                      </div>
                      {selectedCompany.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={selectedCompany.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Company Information</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Business Type:</span>
                          <Badge className={`ml-2 ${getBusinessTypeColor(selectedCompany.business_type)}`}>
                            {selectedCompany.business_type}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Type:</span>
                          <Badge
                            variant="outline"
                            className={`ml-2 ${getCompanyTypeColor(selectedCompany.company_type)}`}
                          >
                            {selectedCompany.company_type}
                          </Badge>
                        </div>
                        {selectedCompany.industry && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Industry:</span>
                            <p className="text-sm">{selectedCompany.industry}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Address:</span>
                          <p className="text-sm">{selectedCompany.address}</p>
                        </div>
                        {selectedCompany.trade_association_member && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Trade Association Member</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedCompany.company_description || "No description available."}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Company Details</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Name:</span>
                          <p className="text-sm">{selectedCompany.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Business Type:</span>
                          <p className="text-sm capitalize">{selectedCompany.business_type}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Company Type:</span>
                          <p className="text-sm capitalize">{selectedCompany.company_type}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Industry:</span>
                          <p className="text-sm">{selectedCompany.industry || "Not specified"}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Trade Association Member:</span>
                          <p className="text-sm">{selectedCompany.trade_association_member ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Location</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Address:</span>
                          <p className="text-sm">{selectedCompany.address}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">City:</span>
                          <p className="text-sm">{selectedCompany.city}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Country:</span>
                          <p className="text-sm">{selectedCompany.country}</p>
                        </div>
                        {selectedCompany.website && (
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Website:</span>
                            <a
                              href={selectedCompany.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {selectedCompany.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        {selectedCompany.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedCompany.email}</span>
                          </div>
                        )}
                        {selectedCompany.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedCompany.phone}</span>
                          </div>
                        )}
                        {selectedCompany.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={selectedCompany.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {selectedCompany.website}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {selectedCompany.address}, {selectedCompany.city}, {selectedCompany.country}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button className="w-full" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Star className="h-4 w-4 mr-2" />
                          Add to Favorites
                        </Button>
                        {selectedCompany.website && (
                          <Button className="w-full" variant="outline" asChild>
                            <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Activity Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Company Registered</p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedCompany.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
