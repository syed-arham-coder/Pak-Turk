import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface NotificationProps {
  title: string
  message: string
  type?: "info" | "success" | "warning" | "error"
  onClose?: () => void
  className?: string
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ title, message, type = "info", onClose, className, ...props }, ref) => {
    const getTypeStyles = () => {
      switch (type) {
        case "success":
          return "border-green-200 bg-green-50 text-green-800"
        case "warning":
          return "border-yellow-200 bg-yellow-50 text-yellow-800"
        case "error":
          return "border-red-200 bg-red-50 text-red-800"
        default:
          return "border-blue-200 bg-blue-50 text-blue-800"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border p-4 shadow-sm",
          getTypeStyles(),
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 flex-shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)

Notification.displayName = "Notification"

export { Notification }
