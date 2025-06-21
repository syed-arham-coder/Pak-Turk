"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Search,
  Filter,
  Star,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Building2,
  Truck,
  Shield,
  Award,
  DollarSign,
  Heart,
  Share2,
  ArrowUpDown,
  Grid,
  ListOrdered,
  Loader2,
  Play,
  Eye,
  CheckCircle,
  MapPin,
  FileText,
} from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  product_name: string
  product_description: string
  product_overview?: string
  price_per_unit: number
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

const allCategories = [
  "Agriculture",
  "Agriculture Technology",
  "Arts",
  "Aviation",
  "Banking",
  "Construction",
  "Ecommerce",
  "Educational Services",
  "Energy",
  "Finance",
  "Healthcare",
  "Information Technology",
  "Logistics & Transport",
  "Manufacturing",
  "Mining",
  "Pharmaceuticals",
  "Public Services",
  "Real Estate",
  "Retail Trade",
  "Utilities",
  "Media & News",
  "Telecommunication",
  "Tourism",
  "Hospitality",
  "Food & Beverage",
  "Entertainment",
  "Fashion",
  "BPO",
]

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ))
}

export default function MarketplacePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)

  // Fetch all products from all companies
  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      console.log("Fetching all products...")
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      console.log("API response:", data)
      if (data.success) {
        console.log("Products fetched:", data.products.length)
        setProducts(data.products)
      } else {
        throw new Error(data.error || "Failed to fetch products")
      }
    } catch (error: any) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllProducts()
  }, [])

  useEffect(() => {
    console.log("Dialog state changed:", productDetailOpen)
    console.log("Selected product:", selectedProduct)
  }, [productDetailOpen, selectedProduct])

  const handleViewVideo = (videoUrl: string) => {
    setCurrentVideo(videoUrl)
    setVideoModalOpen(true)
  }

  const openProductDialog = (product: Product) => {
    console.log("Opening product dialog for:", product)
    setSelectedProduct(product)
    setSelectedImageIndex(0)
    setProductDetailOpen(true)
    console.log("Dialog state set to open")
  }

  const handleContactVendor = (action: "message" | "meeting") => {
    if (!selectedProduct) return

    const actionText = action === "message" ? "message" : "meeting"
      toast({
      title: "Contact Vendor",
      description: `Request to ${actionText} vendor for ${selectedProduct.product_name} has been sent.`,
    })
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return
    toast({
      title: "Added to Cart",
      description: `${selectedProduct.product_name} has been added to your cart.`,
    })
  }

  const filteredAndSortedProducts = useMemo(() => {
    const filteredProducts = products.filter((product) => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTermLower) ||
        product.product_description.toLowerCase().includes(searchTermLower) ||
        product.brand_name.toLowerCase().includes(searchTermLower) ||
        product.model_number.toLowerCase().includes(searchTermLower) ||
        (product.company_name && product.company_name.toLowerCase().includes(searchTermLower))

      const matchesCategory =
        filterCategory === "all" ||
        allCategories[Number.parseInt(product.category_id) - 1] === filterCategory ||
        product.category_id === filterCategory

      return matchesSearch && matchesCategory
    })

    const sortedProducts = [...filteredProducts]

    if (sortOption === "name-asc") {
      sortedProducts.sort((a, b) => a.product_name.localeCompare(b.product_name))
    } else if (sortOption === "name-desc") {
      sortedProducts.sort((a, b) => b.product_name.localeCompare(a.product_name))
    } else if (sortOption === "newest") {
      sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return sortedProducts
  }, [products, searchTerm, filterCategory, sortOption])

  return (
    <div className="container mx-auto py-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Package className="mr-2 h-6 w-6 text-primary" /> Marketplace
              </CardTitle>
              <CardDescription>Browse products from all companies in the marketplace.</CardDescription>
            </div>
          </div>
          <div className="mt-4 flex flex-col lg:flex-row gap-2 items-center">
            <div className="relative flex-grow w-full lg:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, companies, or models..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name-asc">Name: A-Z</SelectItem>
                <SelectItem value="name-desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openProductDialog(product)}
                >
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg?width=300&height=200&text=N/A"}
                      alt={product.product_name}
                      width={300}
                      height={200}
                      className="rounded-t-md object-cover w-full aspect-[3/2]"
                      onError={(e) => {
                        console.log("Image failed to load for product:", product.id)
                        e.currentTarget.src = "/placeholder.svg?width=300&height=200&text=N/A"
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.iso_certified && <Badge className="bg-blue-500 text-white">ISO</Badge>}
                      {!product.out_of_stock && <Badge className="bg-green-500 text-white">IN STOCK</Badge>}
                      {product.out_of_stock && <Badge className="bg-red-500 text-white">OUT OF STOCK</Badge>}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.video && (
                      <div className="absolute bottom-2 left-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewVideo(product.video!)
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2">{product.product_name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.product_description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{getInitials(product.brand_name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{product.brand_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          {product.role}
                        </p>
                      </div>
                      <Badge variant={product.out_of_stock ? "secondary" : "default"} className="text-xs">
                        {product.out_of_stock ? "Out of Stock" : "In Stock"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="flex flex-col md:flex-row hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openProductDialog(product)}
                >
                  <div className="relative md:w-48 md:flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg?width=200&height=150&text=N/A"}
                      alt={product.product_name}
                      width={200}
                      height={150}
                      className="rounded-l-md object-cover w-full h-48 md:h-full"
                      onError={(e) => {
                        console.log("Image failed to load for product:", product.id)
                        e.currentTarget.src = "/placeholder.svg?width=200&height=150&text=N/A"
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.iso_certified && <Badge className="bg-blue-500 text-white text-xs">ISO</Badge>}
                      {!product.out_of_stock && <Badge className="bg-green-500 text-white text-xs">IN STOCK</Badge>}
                    </div>
                    {product.video && (
                      <div className="absolute bottom-2 left-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewVideo(product.video!)
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{product.product_name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant="outline">
                        {allCategories[Number.parseInt(product.category_id) - 1] || "General"}
                      </Badge>
                      <Badge variant={product.out_of_stock ? "secondary" : "default"}>
                        {product.out_of_stock ? "Out of Stock" : "In Stock"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{product.product_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(product.brand_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{product.brand_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {filteredAndSortedProducts.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No products found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details Dialog - Enhanced Marketplace Style */}
      <Dialog open={productDetailOpen} onOpenChange={setProductDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-grow">
                    <DialogTitle className="text-2xl">{selectedProduct.product_name}</DialogTitle>
                    <DialogDescription className="text-base mt-1">
                      {selectedProduct.product_description}
                    </DialogDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge>{allCategories[Number.parseInt(selectedProduct.category_id) - 1] || "General"}</Badge>
                      {selectedProduct.iso_certified && <Badge variant="outline">ISO Certified</Badge>}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">Specs</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
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

                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
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

                        {selectedProduct.image_360 && (
                          <div>
                            <h4 className="font-medium mb-2">360° View</h4>
                            <Image
                              src={selectedProduct.image_360 || "/placeholder.svg"}
                              alt={`${selectedProduct.product_name} 360 view`}
                              width={300}
                              height={200}
                              className="rounded-lg object-cover w-full"
                            />
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

                <TabsContent value="shipping" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedProduct.port && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Port</p>
                            <p className="text-sm text-muted-foreground">{selectedProduct.port}</p>
                          </div>
                        </div>
                      )}
                      {selectedProduct.shipping_option && (
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Shipping Method</p>
                            <p className="text-sm text-muted-foreground">{selectedProduct.shipping_option}</p>
                          </div>
                        </div>
                      )}
                      {selectedProduct.production_capacity && (
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Production Capacity</p>
                            <p className="text-sm text-muted-foreground">{selectedProduct.production_capacity}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Added</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedProduct.created_at).toLocaleDateString()}
                          </p>
                        </div>
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
                  toast({
                    title: "Video Error",
                    description: "Unable to play this video. The format may not be supported.",
                    variant: "destructive",
                  })
                }}
                onLoadStart={() => console.log("Video loading started")}
                onLoadedData={() => console.log("Video data loaded")}
                onCanPlay={() => console.log("Video can play")}
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
    </div>
  )
}
