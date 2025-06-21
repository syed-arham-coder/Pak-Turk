"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, PlusCircle, Edit, Video, CheckCircle, XCircle, LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Meeting {
  id: string
  title: string
  agenda: string
  dateTime: Date
  durationMinutes: number // e.g., 30, 60
  organizerCompanyId: string
  organizerCompanyName: string
  attendeeCompanyIds: string[] // IDs of other companies invited
  attendeeCompanyNames?: string[] // For display
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
  meetingLink?: string // e.g., Jitsi, Zoom link
}

const mockMeetingsData: Meeting[] = [
  {
    id: "meet1",
    title: "Project Alpha Kick-off",
    agenda: "Discuss project milestones and deliverables for Project Alpha.",
    dateTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    durationMinutes: 60,
    organizerCompanyId: "compA",
    organizerCompanyName: "Company A Solutions",
    attendeeCompanyIds: ["compB"],
    attendeeCompanyNames: ["Company B Innovations"],
    status: "Confirmed",
    meetingLink: "https://meet.jit.si/ProjectAlphaKickoff",
  },
  {
    id: "meet2",
    title: "Q3 Strategy Review",
    agenda: "Review Q3 performance and plan for Q4.",
    dateTime: new Date(new Date().setDate(new Date().getDate() + 7)),
    durationMinutes: 90,
    organizerCompanyId: "compB",
    organizerCompanyName: "Company B Innovations",
    attendeeCompanyIds: ["compA"],
    attendeeCompanyNames: ["Company A Solutions"],
    status: "Pending",
  },
  {
    id: "meet3",
    title: "Product Demo - AI Widget",
    agenda: "Demonstrate new features of the AI Widget.",
    dateTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    durationMinutes: 45,
    organizerCompanyId: "compA",
    organizerCompanyName: "Company A Solutions",
    attendeeCompanyIds: ["compC"],
    attendeeCompanyNames: ["Global Solutions Ltd."],
    status: "Completed",
    meetingLink: "https://meet.jit.si/AIWidgetDemo",
  },
  {
    id: "meet4",
    title: "Partnership Discussion",
    agenda: "Explore potential partnership opportunities.",
    dateTime: new Date(new Date().setDate(new Date().getDate() + 5)),
    durationMinutes: 60,
    organizerCompanyId: "compC",
    organizerCompanyName: "Global Solutions Ltd.",
    attendeeCompanyIds: ["compA"],
    attendeeCompanyNames: ["Company A Solutions"],
    status: "Cancelled",
  },
]

// Mock list of other companies for selection
const mockOtherCompanies = [
  { id: "compB", name: "Company B Innovations" },
  { id: "compC", name: "Global Solutions Ltd." },
  { id: "compD", name: "Tech Wizards Inc." },
]

export default function MeetingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meetings</h1>
      {/* Add your meetings content here */}
    </div>
  )
}
