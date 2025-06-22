"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Search, Users, UserPlus, Mail, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type UserRole = "Admin" | "Manager" | "User"
interface PlatformUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: "Active" | "Invited" | "Inactive"
  avatarUrl?: string
  lastLogin?: string
  phone: string
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

export default function UserManagementPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUserToEdit, setCurrentUserToEdit] = useState<PlatformUser | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<PlatformUser | null>(null)

  // Form states for dialogs
  const [addEmail, setAddEmail] = useState("")
  const [addFullName, setAddFullName] = useState("")
  const [addPhone, setAddPhone] = useState("")
  const [addRole, setAddRole] = useState<UserRole>("User")
  const [editName, setEditName] = useState("")
  const [editRole, setEditRole] = useState<UserRole>("User")
  const [editStatus, setEditStatus] = useState<PlatformUser["status"]>("Active")
  const [addPassword, setAddPassword] = useState("")

  // Fetch users for the current company on mount
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.companyId) {
        console.log("No companyId available:", currentUser)
        return
      }
      try {
        console.log("Fetching users for companyId:", currentUser.companyId)
        const res = await fetch(`/api/company/users?companyId=${currentUser.companyId}`)
        if (!res.ok) {
          const errorData = await res.json()
          console.error("Failed to fetch users:", errorData)
          throw new Error(errorData.error || "Failed to fetch users")
        }
        const data = await res.json()
        console.log("Fetched users data:", data)
        setUsers(
          data.map((u: any) => ({
            id: u.id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status || "Active",
            avatarUrl: u.profile_photo || undefined,
            lastLogin: u.last_login || "-",
            phone: u.phone,
          }))
        )
      } catch (err: any) {
        console.error("Error in fetchUsers:", err)
        toast({ title: "Error", description: err.message || "Could not load users", variant: "destructive" })
      }
    }
    fetchUsers()
  }, [currentUser?.companyId, toast])

  if (currentUser?.role !== "Admin") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to manage users.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name && u.email && (
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const handleAddUser = async () => {
    if (!addEmail || !addFullName || !addPhone) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch("/api/company/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail,
          fullName: addFullName,
          phone: addPhone,
          role: addRole,
          companyId: currentUser.companyId,
          password: addPassword,
        }),
      })
      if (!res.ok) throw new Error("Failed to add user")
      const newUser = await res.json()
      setUsers((prev) => [
        ...prev,
        {
          id: newUser.id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status || "Active",
          avatarUrl: undefined,
          lastLogin: "-",
          phone: newUser.phone,
        },
      ])
      toast({ title: "User Added", description: `${addEmail} has been added.` })
      setIsAddDialogOpen(false)
      setAddEmail("")
      setAddFullName("")
      setAddPhone("")
      setAddRole("User")
      setAddPassword("")
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not add user", variant: "destructive" })
    }
  }

  const openEditDialog = (userToEdit: PlatformUser) => {
    setCurrentUserToEdit(userToEdit)
    setEditName(userToEdit.name)
    setEditRole(userToEdit.role)
    setEditStatus(userToEdit.status)
    setIsEditDialogOpen(true)
  }

  const handleEditUser = async () => {
    if (!currentUserToEdit) return
    try {
      const res = await fetch("/api/company/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUserToEdit.id,
          fullName: editName,
          email: currentUserToEdit.email,
          phone: currentUserToEdit.phone,
          role: editRole,
          status: editStatus,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to update user")
      }
      
      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUserToEdit.id
            ? {
                ...u,
                name: editName,
                role: editRole,
                status: editStatus,
              }
            : u
        )
      )
      toast({ title: "User Updated", description: `${editName}'s details have been updated.` })
      setIsEditDialogOpen(false)
      setCurrentUserToEdit(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not update user", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch("/api/company/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to delete user")
      }
      
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId))
      toast({ title: "User Deleted", description: "The user has been removed.", variant: "destructive" })
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not delete user", variant: "destructive" })
    }
  }

  const openDeleteDialog = (user: PlatformUser) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto py-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Users className="mr-2 h-6 w-6 text-primary" /> User Management
              </CardTitle>
              <CardDescription>Invite, edit, and manage users within your company.</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Enter the details for the new user.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="addEmail">Email<span className="text-destructive">*</span></Label>
                    <Input
                      id="addEmail"
                      type="email"
                      placeholder="user@example.com"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="addFullName">Full Name<span className="text-destructive">*</span></Label>
                      <Input
                        id="addFullName"
                        value={addFullName}
                        onChange={(e) => setAddFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="addPhone">Phone<span className="text-destructive">*</span></Label>
                    <Input
                      id="addPhone"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPassword">Password<span className="text-destructive">*</span></Label>
                    <Input
                      id="addPassword"
                      type="password"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="addRole">User Role<span className="text-destructive">*</span></Label>
                    <Select value={addRole} onValueChange={(value) => setAddRole(value as UserRole)}>
                      <SelectTrigger id="addRole">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">User</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-8 w-full md:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatarUrl || "/placeholder.svg"} alt={u.name} />
                        <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={u.role === "Admin" ? "default" : u.role === "Manager" ? "secondary" : "outline"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === "Active" ? "default" : u.status === "Invited" ? "outline" : "destructive"}
                      className={
                        u.status === "Active"
                          ? "bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30"
                          : u.status === "Invited"
                            ? "bg-amber-500/20 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-500/30"
                            : "bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30"
                      }
                    >
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    {currentUser && String(u.id) !== String(currentUser.id) && (
                      <>
                        <Dialog
                          open={isEditDialogOpen && currentUserToEdit?.id === u.id}
                          onOpenChange={(open) => {
                            if (!open) setCurrentUserToEdit(null)
                            setIsEditDialogOpen(open)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(u)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit User</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User: {currentUserToEdit?.name}</DialogTitle>
                              <DialogDescription>Update the user's details and permissions.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="editName">Full Name</Label>
                                <Input
                                  id="editName"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="editRole">Role</Label>
                                <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                                  <SelectTrigger id="editRole">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="User">User</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="editStatus">Status</Label>
                                <Select
                                  value={editStatus}
                                  onValueChange={(value) => setEditStatus(value as PlatformUser["status"])}
                                >
                                  <SelectTrigger id="editStatus">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false)
                                  setCurrentUserToEdit(null)
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleEditUser}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(u)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete User</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete user</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDeleteDialogOpen(false)
                                  setUserToDelete(null)
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
                              >
                                Delete User
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                    {currentUser && String(u.id) === String(currentUser.id) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              className="opacity-50 cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete User</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You cannot delete your own account</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">No users found.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
