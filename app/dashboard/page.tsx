"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useAppContext } from "@/contexts/app-context"
import { Briefcase, MessageSquarePlus, Package, Users } from "lucide-react"
import Link from "next/link"
import { Activity, CreditCard, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"

export default function OverviewPage() {
  const { user } = useAuth()
  const { t } = useAppContext()
  const [companyData, setCompanyData] = useState({
    name: "",
    industry: "",
    phone: "",
    business_type: "",
    company_type: "",
    city: "",
    country: "",
    trade_association_member: false,
    address: "",
    website: "",
    company_description: "",
    default_language: "English",
    currency: "USD",
  })
  const [logoPreview, setLogoPreview] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const quickStats = [
    {
      title: t("dashboard.stats.activeProducts"),
      value: "125",
      icon: Package,
      change: t("dashboard.stats.thisWeek", { count: "5" }),
      color: "text-blue-500",
    },
    {
      title: t("dashboard.stats.pendingMeetings"),
      value: "8",
      icon: Briefcase,
      change: t("dashboard.stats.today", { count: "2" }),
      color: "text-amber-500",
    },
    {
      title: t("dashboard.stats.unreadMessages"),
      value: "15",
      icon: MessageSquarePlus,
      change: t("dashboard.stats.new", { count: "3" }),
      color: "text-teal-500",
    },
    {
      title: t("dashboard.stats.teamMembers"),
      value: "12",
      icon: Users,
      change: t("dashboard.stats.companyWide"),
      color: "text-indigo-500",
    },
  ]

  const activities = [
    {
      text: t("dashboard.activity.newProduct", { product: "Alpha Widget", company: "Innovate Corp" }),
      time: t("dashboard.activity.timeAgo", { time: "10m" }),
      icon: Package,
    },
    {
      text: t("dashboard.activity.meetingRequest", { company: "Tech Solutions Ltd" }),
      time: t("dashboard.activity.timeAgo", { time: "1h" }),
      icon: Briefcase,
    },
    {
      text: t("dashboard.activity.userLogin", { user: "Mark Dude" }),
      time: t("dashboard.activity.timeAgo", { time: "2h" }),
      icon: Users,
    },
    {
      text: t("dashboard.activity.messageReceived", { team: "Support Team", company: "Global Enterprises" }),
      time: t("dashboard.activity.timeAgo", { time: "5h" }),
      icon: MessageSquarePlus,
    },
  ]

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!user || typeof user.companyId === 'undefined' || user.companyId === null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/company?companyId=${user.companyId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch company data');
        }
        const data = await response.json();
        setCompanyData({
          name: data.name || "",
          industry: data.industry || "",
          phone: data.phone || "",
          business_type: data.business_type || "",
          company_type: data.company_type || "",
          city: data.city || "",
          country: data.country || "",
          trade_association_member: Boolean(data.trade_association_member),
          address: data.address || "",
          website: data.website || "",
          company_description: data.company_description || "",
          default_language: data.default_language || "English",
          currency: data.currency || "USD",
        });
        setLogoPreview(data.profile_photo || "");
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching company data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, user?.companyId]);

  if (!user) return null

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {t("dashboard.welcome")}, {user.fullName}!
        </h1>
        <p className="text-muted-foreground">{t("dashboard.overview", { company: user.companyName || "" })}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.total_revenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% {t("dashboard.from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.subscriptions")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% {t("dashboard.from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.sales")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% {t("dashboard.from_last_month")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.active_now")}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 {t("dashboard.since_last_hour")}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
            <CardDescription>{t("dashboard.recentActivity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activities.map((activity, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-1">
                    <activity.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4 w-full">
              {t("dashboard.viewAllActivity")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="outline" className="justify-start text-left h-auto py-3">
              <Link href="/dashboard/products/new">
                <Package className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">{t("dashboard.actions.addProduct")}</p>
                  <p className="font-semibold">{t("dashboard.actions.addProduct")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.actions.addProduct.description")}</p>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start text-left h-auto py-3">
              <Link href="/dashboard/meetings/new">
                <Briefcase className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">{t("dashboard.actions.scheduleMeeting")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.actions.scheduleMeeting.description")}</p>
                </div>
              </Link>
            </Button>
            {user?.role === "Admin" && (
              <Button asChild variant="outline" className="justify-start text-left h-auto py-3">
                <Link href="/dashboard/users/invite">
                  <Users className="mr-3 h-5 w-5" />
                  <div>
                    <p className="font-semibold">{t("dashboard.actions.inviteUser")}</p>
                    <p className="text-xs text-muted-foreground">{t("dashboard.actions.inviteUser.description")}</p>
                  </div>
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="justify-start text-left h-auto py-3">
              <Link href="/dashboard/messages">
                <MessageSquarePlus className="mr-3 h-5 w-5" />
                <div>
                  <p className="font-semibold">{t("dashboard.actions.viewMessages")}</p>
                  <p className="text-xs text-muted-foreground">{t("dashboard.actions.viewMessages.description")}</p>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
