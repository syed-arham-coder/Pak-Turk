"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  PlusCircle,
  Edit,
  Trash2,
  Search,
  Package,
  ArrowUpDown,
  ListOrdered,
  Grid,
  Loader2,
  Play,
  Filter,
  AlertTriangle,
  Star,
  Heart,
  Share2,
  Eye,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Truck, Award, FileText } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Product {
  id: string
  product_name: string
  product_description: string
  product_overview?: string
  price_per_unit: number
  minimum_units: number
  maximum_units: number
  image?: string // Keep for backward compatibility
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
  role: 'Buyer' | 'Saler' | 'Buyer/Saler'
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

const productUnits = ["Piece", "Vehicle", "Kg", "sq/m"]
const ports = ["Karachi Port"]
const shippingOptions = ["Sea freight"]

function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const canManageProducts = true

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

export default function ProductCatalogPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("name-asc")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [productDetailOpen, setProductDetailOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Form handling
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      product_name: "",
      product_description: "",
      product_overview: "",
      meta_title: "",
      meta_keyword: "",
      meta_description: "",
      category: "",
      minimum_units: "",
      maximum_units: "",
      role: "Saler",
      product_unit: "",
      min_order_quantity: "",
      model_number: "",
      brand_name: "",
      hscode: "",
      port: "",
      shipping_option: "",
      production_capacity: "",
      brochure_url: "",
      warranty: "",
      iso_certified: false,
      out_of_stock: false,
      specifications: [
        { key: "Height", value: "" },
        { key: "Width", value: "" },
        { key: "Volume", value: "" },
        { key: "Color", value: "" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "specifications" })

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products?company_id=${user?.companyId}`)
      const data = await response.json()

      if (data.success) {
        console.log("Fetched products:", data.products.length)
        // Debug: Log first product's images and video
        if (data.products.length > 0) {
          console.log("First product images:", data.products[0].images)
          console.log("First product video:", data.products[0].video ? "Has video" : "No video")
        }
        setProducts(data.products)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch products",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.companyId) {
      fetchProducts()
    }
  }, [user?.companyId])

  // Submit new product
  const onSubmit = async (data: any) => {
    if (!user?.companyId) {
      toast({
        title: "Error",
        description: "Company ID not found",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()

      // Add text fields
      if (editingProduct) {
        formData.append("product_id", editingProduct.id)
      }
      formData.append("company_id", user.companyId.toString())
      formData.append("product_name", data.product_name)
      formData.append("category_id", "1") // You might want to map category names to IDs
      formData.append("product_description", data.product_description)
      formData.append("product_overview", data.product_overview || "")
      formData.append("meta_title", data.meta_title || "")
      formData.append("meta_keyword", data.meta_keyword || "")
      formData.append("meta_description", data.meta_description || "")
      formData.append("minimum_units", data.minimum_units?.toString() || "0")
      formData.append("maximum_units", data.maximum_units?.toString() || "0")
      formData.append("price_per_unit", data.price_per_unit?.toString() || "0")
      formData.append("product_unit", data.product_unit || "")
      formData.append("min_order_quantity", data.min_order_quantity?.toString() || "0")
      formData.append("model_number", data.model_number || "")
      formData.append("brand_name", data.brand_name || "")
      formData.append("hscode", data.hscode || "")
      formData.append("port", data.port || "")
      formData.append("shipping_option", data.shipping_option || "")
      formData.append("production_capacity", data.production_capacity || "")
      formData.append("brochure_url", data.brochure_url || "")
      formData.append("warranty", data.warranty || "")
      formData.append("iso_certified", data.iso_certified ? "true" : "false")
      formData.append("out_of_stock", data.out_of_stock ? "true" : "false")

      // Add specifications
      if (data.specifications && data.specifications.length > 0) {
        const validSpecs = data.specifications.filter((spec: any) => spec.key && spec.value)
        if (validSpecs.length > 0) {
          formData.append("specifications", JSON.stringify(validSpecs))
        }
      }

      // Handle file uploads
      const imageInput = document.querySelector('input[name="images"]') as HTMLInputElement
      if (imageInput?.files && imageInput.files.length > 0) {
        console.log(`Uploading ${imageInput.files.length} images`)
        for (let i = 0; i < imageInput.files.length; i++) {
          formData.append("images", imageInput.files[i])
        }
      }

      const image360Input = document.querySelector('input[name="image_360"]') as HTMLInputElement
      if (image360Input?.files?.[0]) {
        formData.append("image_360", image360Input.files[0])
      }

      const videoInput = document.querySelector('input[name="video"]') as HTMLInputElement
      if (videoInput?.files?.[0]) {
        console.log(`Uploading video: ${videoInput.files[0].name}`)
        formData.append("video", videoInput.files[0])
      }

      const brochureInput = document.querySelector('input[name="brochure"]') as HTMLInputElement
      if (brochureInput?.files?.[0]) {
        formData.append("brochure", brochureInput.files[0])
      }

      const method = editingProduct ? "PUT" : "POST"
      const response = await fetch("/api/products", {
        method,
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: editingProduct ? "Product updated successfully" : "Product added successfully",
        })
        setIsAddProductOpen(false)
        setIsEditProductOpen(false)
        setEditingProduct(null)
        reset()
        fetchProducts() // Refresh the products list
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${editingProduct ? "update" : "add"} product`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting product:", error)
      toast({
        title: "Error",
        description: `Failed to ${editingProduct ? "update" : "add"} product`,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)

    // Populate form with existing data
    setValue("product_name", product.product_name)
    setValue("product_description", product.product_description)
    setValue("product_overview", product.product_overview || "")
    setValue("meta_title", product.meta_title || "")
    setValue("meta_keyword", product.meta_keyword || "")
    setValue("meta_description", product.meta_description || "")
    setValue("minimum_units", product.minimum_units.toString())
    setValue("maximum_units", product.maximum_units.toString())
    setValue("price_per_unit", product.price_per_unit.toString())
    setValue("product_unit", product.product_unit)
    setValue("min_order_quantity", product.min_order_quantity.toString())
    setValue("model_number", product.model_number)
    setValue("brand_name", product.brand_name)
    setValue("hscode", product.hscode)
    setValue("port", product.port || "")
    setValue("shipping_option", product.shipping_option || "")
    setValue("production_capacity", product.production_capacity || "")
    setValue("brochure_url", product.brochure_url || "")
    setValue("warranty", product.warranty || "")
    setValue("iso_certified", product.iso_certified)
    setValue("out_of_stock", product.out_of_stock)
    setValue("specifications", product.specifications || [])

    setIsEditProductOpen(true)
  }

  // Open delete confirmation
  const openDeleteConfirmation = (productId: string) => {
    setDeleteProductId(productId)
    setConfirmDeleteOpen(true)
  }

  // Delete product
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return

    try {
      console.log(`Deleting product with ID: ${deleteProductId}`)
      const response = await fetch(`/api/products?id=${deleteProductId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        // Remove the product from the local state
        setProducts((prevProducts) => prevProducts.filter((product) => product.id !== deleteProductId))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleteProductId(null)
      setConfirmDeleteOpen(false)
    }
  }

  // Open video modal
  const handleViewVideo = (videoUrl: string) => {
    console.log("Opening video modal with URL:", videoUrl.substring(0, 50) + "...")
    setCurrentVideo(videoUrl)
    setVideoModalOpen(true)
  }

  // Open product details
  const openProductDialog = (product: Product) => {
    setSelectedProduct(product)
    setSelectedImageIndex(0)
    setProductDetailOpen(true)
  }

  const filteredAndSortedProducts = useMemo(() => {
    const filteredProducts = products.filter((product) => {
      const searchTermLower = searchTerm.toLowerCase()
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTermLower) ||
        product.product_description.toLowerCase().includes(searchTermLower) ||
        product.brand_name.toLowerCase().includes(searchTermLower) ||
        product.model_number.toLowerCase().includes(searchTermLower)

      // Fix category filtering - match against actual category names
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
                <Package className="mr-2 h-6 w-6 text-primary" /> My Products
              </CardTitle>
              <CardDescription>Manage your company's products here.</CardDescription>
            </div>
            {canManageProducts && (
              <Button onClick={() => setIsAddProductOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            )}
          </div>
          <div className="mt-4 flex flex-col lg:flex-row gap-2 items-center">
            <div className="relative flex-grow w-full lg:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, brands, or models..."
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
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
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
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.iso_certified && <Badge className="bg-blue-500 text-white">ISO</Badge>}
                      {!product.out_of_stock && <Badge className="bg-green-500 text-white">IN STOCK</Badge>}
                      {product.out_of_stock && <Badge className="bg-red-500 text-white">OUT OF STOCK</Badge>}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {canManageProducts && (
                        <>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditProduct(product)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDeleteConfirmation(product.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(4.5)} {/* Mock rating */}
                        <span className="text-xs text-muted-foreground">(0)</span>
                      </div>
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
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {product.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(4.5)}
                        <span className="text-sm text-muted-foreground">4.5 (0 reviews)</span>
                      </div>
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
                        {canManageProducts && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditProduct(product)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteConfirmation(product.id)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        )}
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

      {/* Add Product Modal */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name*</Label>
                <Input {...register("product_name", { required: "Product name is required" })} />
                {errors.product_name && <span className="text-red-500 text-xs">{errors.product_name.message}</span>}
              </div>
              <div>
                <Label>Category*</Label>
                <Controller
                  control={control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="md:col-span-2">
                <Label>Product Description*</Label>
                <Textarea {...register("product_description", { required: "Description is required" })} rows={2} />
                {errors.product_description && (
                  <span className="text-red-500 text-xs">{errors.product_description.message}</span>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Product Overview</Label>
                <Textarea {...register("product_overview")} rows={2} />
              </div>
            </div>

            {/* SEO/Meta Fields */}
            <div>
              <h4 className="text-lg font-semibold mb-3">SEO & Meta Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input {...register("meta_title")} placeholder="SEO title for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
                </div>
                <div>
                  <Label>Meta Keywords</Label>
                  <Input {...register("meta_keyword")} placeholder="keyword1, keyword2, keyword3" />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords for SEO</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    {...register("meta_description")}
                    rows={2}
                    placeholder="Brief description for search engine results"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Minimum Units*</Label>
                <Input type="number" {...register("minimum_units", { required: "Minimum units required" })} />
                {errors.minimum_units && <span className="text-red-500 text-xs">{errors.minimum_units.message}</span>}
              </div>
              <div>
                <Label>Maximum Units</Label>
                <Input type="number" {...register("maximum_units")} />
              </div>
              <div>
                <Label>Price Per Unit (USD)*</Label>
                <Input type="number" step="0.01" {...register("price_per_unit", { required: "Price is required" })} />
                {errors.price_per_unit && <span className="text-red-500 text-xs">{errors.price_per_unit.message}</span>}
              </div>
              <div>
                <Label>Product Unit*</Label>
                <Controller
                  control={control}
                  name="product_unit"
                  rules={{ required: "Product unit is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {productUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.product_unit && <span className="text-red-500 text-xs">{errors.product_unit.message}</span>}
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Min Order Quantity*</Label>
                <Input type="number" {...register("min_order_quantity", { required: "Min order quantity required" })} />
                {errors.min_order_quantity && (
                  <span className="text-red-500 text-xs">{errors.min_order_quantity.message}</span>
                )}
              </div>
              <div>
                <Label>Model Number*</Label>
                <Input {...register("model_number", { required: "Model number required" })} />
                {errors.model_number && <span className="text-red-500 text-xs">{errors.model_number.message}</span>}
              </div>
              <div>
                <Label>Brand Name*</Label>
                <Input {...register("brand_name", { required: "Brand name required" })} />
                {errors.brand_name && <span className="text-red-500 text-xs">{errors.brand_name.message}</span>}
              </div>
              <div>
                <Label>HSCODE*</Label>
                <Input {...register("hscode", { required: "HSCODE required" })} />
                {errors.hscode && <span className="text-red-500 text-xs">{errors.hscode.message}</span>}
              </div>
              <div>
                <Label>Port</Label>
                <Controller
                  control={control}
                  name="port"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port} value={port}>
                            {port}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Shipping Option</Label>
                <Controller
                  control={control}
                  name="shipping_option"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping option" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Upload Images (Multiple)</Label>
                <Input type="file" name="images" accept="image/*" multiple />
                <p className="text-xs text-muted-foreground mt-1">
                  Select multiple images. First image will be the primary image.
                </p>
              </div>
              <div>
                <Label>Upload 360 Image</Label>
                <Input type="file" name="image_360" accept="image/*" />
              </div>
              <div>
                <Label>Upload Video</Label>
                <Input type="file" name="video" accept="video/mp4,video/webm,video/avi" />
                <p className="text-xs text-muted-foreground mt-1">Supported formats: MP4, WebM, AVI</p>
              </div>
              <div>
                <Label>Upload Brochure</Label>
                <Input type="file" name="brochure" accept="application/pdf" />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <Label>Specifications</Label>
              <div className="space-y-2 mt-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      className="w-32"
                      {...register(`specifications.${idx}.key` as const)}
                      placeholder="Key (e.g. Height)"
                    />
                    <Input
                      className="w-48"
                      {...register(`specifications.${idx}.value` as const)}
                      placeholder="Value (e.g. 10cm)"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Specification
                </Button>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Warranty</Label>
                <Input {...register("warranty")} placeholder="e.g. 1 Year" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register("iso_certified")} id="iso_certified" />
                <Label htmlFor="iso_certified">ISO Certified?</Label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register("out_of_stock")} id="out_of_stock" />
                <Label htmlFor="out_of_stock">Out of Stock?</Label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Same form fields as Add Product Modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product Name*</Label>
                <Input {...register("product_name", { required: "Product name is required" })} />
                {errors.product_name && <span className="text-red-500 text-xs">{errors.product_name.message}</span>}
              </div>
              <div>
                <Label>Category*</Label>
                <Controller
                  control={control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && <span className="text-red-500 text-xs">Required</span>}
              </div>
              <div className="md:col-span-2">
                <Label>Product Description*</Label>
                <Textarea {...register("product_description", { required: "Description is required" })} rows={2} />
                {errors.product_description && (
                  <span className="text-red-500 text-xs">{errors.product_description.message}</span>
                )}
              </div>
              <div className="md:col-span-2">
                <Label>Product Overview</Label>
                <Textarea {...register("product_overview")} rows={2} />
              </div>
            </div>

            {/* SEO/Meta Fields */}
            <div>
              <h4 className="text-lg font-semibold mb-3">SEO & Meta Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Meta Title</Label>
                  <Input {...register("meta_title")} placeholder="SEO title for search engines" />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 50-60 characters</p>
                </div>
                <div>
                  <Label>Meta Keywords</Label>
                  <Input {...register("meta_keyword")} placeholder="keyword1, keyword2, keyword3" />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated keywords for SEO</p>
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    {...register("meta_description")}
                    rows={2}
                    placeholder="Brief description for search engine results"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 150-160 characters</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Minimum Units*</Label>
                <Input type="number" {...register("minimum_units", { required: "Minimum units required" })} />
                {errors.minimum_units && <span className="text-red-500 text-xs">{errors.minimum_units.message}</span>}
              </div>
              <div>
                <Label>Maximum Units</Label>
                <Input type="number" {...register("maximum_units")} />
              </div>
              <div>
                <Label>Price Per Unit (USD)*</Label>
                <Input type="number" step="0.01" {...register("price_per_unit", { required: "Price is required" })} />
                {errors.price_per_unit && <span className="text-red-500 text-xs">{errors.price_per_unit.message}</span>}
              </div>
              <div>
                <Label>Product Unit*</Label>
                <Controller
                  control={control}
                  name="product_unit"
                  rules={{ required: "Product unit is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {productUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.product_unit && <span className="text-red-500 text-xs">{errors.product_unit.message}</span>}
              </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Min Order Quantity*</Label>
                <Input type="number" {...register("min_order_quantity", { required: "Min order quantity required" })} />
                {errors.min_order_quantity && (
                  <span className="text-red-500 text-xs">{errors.min_order_quantity.message}</span>
                )}
              </div>
              <div>
                <Label>Model Number*</Label>
                <Input {...register("model_number", { required: "Model number required" })} />
                {errors.model_number && <span className="text-red-500 text-xs">{errors.model_number.message}</span>}
              </div>
              <div>
                <Label>Brand Name*</Label>
                <Input {...register("brand_name", { required: "Brand name required" })} />
                {errors.brand_name && <span className="text-red-500 text-xs">{errors.brand_name.message}</span>}
              </div>
              <div>
                <Label>HSCODE*</Label>
                <Input {...register("hscode", { required: "HSCODE required" })} />
                {errors.hscode && <span className="text-red-500 text-xs">{errors.hscode.message}</span>}
              </div>
              <div>
                <Label>Port</Label>
                <Controller
                  control={control}
                  name="port"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port} value={port}>
                            {port}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Shipping Option</Label>
                <Controller
                  control={control}
                  name="shipping_option"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping option" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Upload New Images (Multiple)</Label>
                <Input type="file" name="images" accept="image/*" multiple />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep existing images. Upload new images to replace all existing ones.
                </p>
              </div>
              <div>
                <Label>Upload New 360 Image</Label>
                <Input type="file" name="image_360" accept="image/*" />
              </div>
              <div>
                <Label>Upload New Video</Label>
                <Input type="file" name="video" accept="video/mp4,video/webm,video/avi" />
                <p className="text-xs text-muted-foreground mt-1">Supported formats: MP4, WebM, AVI</p>
              </div>
              <div>
                <Label>Upload New Brochure</Label>
                <Input type="file" name="brochure" accept="application/pdf" />
              </div>
            </div>

            {/* Specifications */}
            <div>
              <Label>Specifications</Label>
              <div className="space-y-2 mt-2">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      className="w-32"
                      {...register(`specifications.${idx}.key` as const)}
                      placeholder="Key (e.g. Height)"
                    />
                    <Input
                      className="w-48"
                      {...register(`specifications.${idx}.value` as const)}
                      placeholder="Value (e.g. 10cm)"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Specification
                </Button>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Warranty</Label>
                <Input {...register("warranty")} placeholder="e.g. 1 Year" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register("iso_certified")} id="edit_iso_certified" />
                <Label htmlFor="edit_iso_certified">ISO Certified?</Label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register("out_of_stock")} id="edit_out_of_stock" />
                <Label htmlFor="edit_out_of_stock">Out of Stock?</Label>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Product...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the
              product and all its associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      <div className="flex items-center gap-1">
                        {renderStars(4.5)}
                        <span className="text-sm ml-1">4.5 (0 reviews)</span>
                      </div>
                      <Badge>{allCategories[Number.parseInt(selectedProduct.category_id) - 1] || "General"}</Badge>
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

                      <div className="flex gap-2">
                        {canManageProducts && (
                          <>
                            <Button
                              className="flex-1"
                              onClick={() => {
                                setProductDetailOpen(false)
                                handleEditProduct(selectedProduct)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Product
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setProductDetailOpen(false)
                                openDeleteConfirmation(selectedProduct.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
