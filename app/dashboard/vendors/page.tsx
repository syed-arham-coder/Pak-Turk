"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  Eye,
  MessageSquare,
  Star,
  CheckCircle,
  ExternalLink,
  Loader2,
  Grid,
  ListOrdered,
  ArrowUpDown,
} from "lucide-react"

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

export default function VendorsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    businessType: "all",
    companyType: "all",
    country: "",
    industry: "",
  })
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Fetch all companies
  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append("search", searchTerm)
      if (filters.businessType && filters.businessType !== "all") params.append("business_type", filters.businessType)
      if (filters.companyType && filters.companyType !== "all") params.append("company_type", filters.companyType)
      if (filters.country) params.append("country", filters.country)
      if (filters.industry) params.append("industry", filters.industry)

      const response = await fetch(`/api/companies?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
      } else {
        throw new Error(data.error || "Failed to fetch companies")
      }
    } catch (error: any) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to fetch companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [searchTerm, filters])

  const openCompanyDialog = (company: Company) => {
    setSelectedCompany(company)
    setCompanyDetailOpen(true)
  }

  const getInitials = (name: string) => {
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

  const filteredAndSortedCompanies = companies
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Company]
      const bValue = b[sortBy as keyof Company]
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Browse and connect with verified vendors and suppliers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.businessType} onValueChange={(value) => setFilters({ ...filters, businessType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manufacturer">Manufacturer</SelectItem>
                <SelectItem value="trader">Trader</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="exporter">Exporter</SelectItem>
                <SelectItem value="importer">Importer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.companyType} onValueChange={(value) => setFilters({ ...filters, companyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Company Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="proprietorship">Proprietorship</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Country"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
            <Input
              placeholder="Industry"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedCompanies.length} companies found
        </p>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="name">Company Name</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="business_type">Business Type</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Companies Grid/List */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openCompanyDialog(company)}
                >
                  <div className="relative p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={company.profile_photo || ""} alt={company.name} />
                        <AvatarFallback className="text-sm">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{company.name}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.city}, {company.country}</span>
                      </div>
                      
                      {company.industry && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{company.industry}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className={`text-xs ${getBusinessTypeColor(company.business_type)}`}>
                          {company.business_type}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getCompanyTypeColor(company.company_type)}`}>
                          {company.company_type}
                        </Badge>
                      </div>
                      
                      {company.trade_association_member && (
                        <Badge variant="default" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Trade Member
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 pt-0 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Joined {formatDate(company.created_at)}
                      </div>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => openCompanyDialog(company)}
                >
                  <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={company.profile_photo || ""} alt={company.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{company.city}, {company.country}</span>
                        </div>
                        {company.industry && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>{company.industry}</span>
                          </div>
                        )}
                        {company.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className={getBusinessTypeColor(company.business_type)}>
                          {company.business_type}
                        </Badge>
                        <Badge variant="outline" className={getCompanyTypeColor(company.company_type)}>
                          {company.company_type}
                        </Badge>
                        {company.trade_association_member && (
                          <Badge variant="default">
                            <Award className="h-3 w-3 mr-1" />
                            Trade Member
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Joined {formatDate(company.created_at)}
                      </div>
                      <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Detail Dialog */}
      <Dialog open={companyDetailOpen} onOpenChange={setCompanyDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedCompany.profile_photo || ""} alt={selectedCompany.name} />
                    <AvatarFallback className="text-xl">
                      {getInitials(selectedCompany.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription className="text-base">
                    </DialogDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedCompany.city}, {selectedCompany.country}</span>
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
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
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
                          <Badge variant="outline" className={`ml-2 ${getCompanyTypeColor(selectedCompany.company_type)}`}>
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
                          <span className="text-sm">{selectedCompany.address}, {selectedCompany.city}, {selectedCompany.country}</span>
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
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-muted-foreground">{formatDate(selectedCompany.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <CompanyProducts companyId={selectedCompany.id} />
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                  <CompanyTeam companyId={selectedCompany.id} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// CompanyProducts: Fetch and display all products for a company
function CompanyProducts({ companyId }: { companyId: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/products?company_id=${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [companyId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!products.length) {
    return <div className="text-center text-muted-foreground py-8">No products found for this company.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col group">
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg?width=300&height=200&text=N/A"}
              alt={product.product_name}
              className="rounded-t-md object-cover w-full aspect-[3/2]"
              style={{ minHeight: 120, background: '#f3f4f6' }}
            />
          </div>
          <CardContent className="flex-1 flex flex-col p-4">
            <h3 className="font-semibold text-base mb-1 truncate">{product.product_name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{product.category_name}</Badge>
              {product.out_of_stock ? (
                <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
              ) : (
                <Badge variant="default" className="text-xs">In Stock</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.product_description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-semibold text-primary">{product.role}</span>
              {product.iso_certified ? (
                <Badge variant="outline" className="text-xs">ISO</Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// CompanyTeam: Fetch and display all users for a company
function CompanyTeam({ companyId }: { companyId: string }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/company/users?companyId=${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [companyId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!users.length) {
    return <div className="text-center text-muted-foreground py-8">No team members found for this company.</div>
  }
  const roleColor = (role: string) => {
    if (role === "Admin") return "bg-blue-100 text-blue-800"
    if (role === "Manager") return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <Card key={user.id} className="flex flex-col">
          <CardContent className="flex flex-col gap-2 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {user.full_name ? user.full_name[0] : (user.name ? user.name[0] : "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-0">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={roleColor(user.role)}>{user.role}</Badge>
                  {user.department && <span className="text-xs text-muted-foreground">{user.department}</span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {user.status === "Active" ? (
                <>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => window.location.href = `/dashboard/messages?userId=${user.id}`}><MessageSquare className="h-4 w-4 mr-1" /> Message</Button>
                  <Button size="sm" variant="outline" className="flex-1"><Calendar className="h-4 w-4 mr-1" /> Meet</Button>
                </>
              ) : (
                <Badge variant="outline" className="text-xs">Not Available</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
