"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserPlus } from "lucide-react"

const teamMemberSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  fullName: z.string().min(1, { message: "Full name is required." }),
  phone: z.string().min(7, { message: "Phone is required." }),
  role: z.enum(['Manager', 'User'], { message: "Please select a role." }),
})

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>

interface TeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  onMemberAdded: (userId: number) => void
}

export function TeamMemberDialog({ open, onOpenChange, companyId, onMemberAdded }: TeamMemberDialogProps) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phone: "",
      role: "User",
    },
  })

  const onSubmit = async (data: TeamMemberFormValues) => {
    setFormError(null)
    setIsCreating(true)

    try {
      const response = await fetch('/api/company/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          companyId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add team member');
      }

      toast({
        title: "Team Member Added",
        description: `${data.fullName} has been added to your company successfully. They will receive an invitation to join.`,
      })

      form.reset()
      onMemberAdded(result.userId)
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add team member. Please try again.";
      setFormError(errorMessage)
      toast({
        title: "Failed to Add Member",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Add a new team member to your company. They will receive an invitation to join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name*</Label>
            <Input 
              id="fullName" 
              placeholder="Mark Dude" 
              {...form.register("fullName")} 
              disabled={isCreating}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="example@company.com" 
              {...form.register("email")} 
              disabled={isCreating}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone*</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+1234567890" 
              {...form.register("phone")} 
              disabled={isCreating}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role*</Label>
            <Select 
              value={form.watch("role")} 
              onValueChange={val => form.setValue("role", val)}
              disabled={isCreating}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="User">User</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 