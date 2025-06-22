"use client"
import Link from "next/link"
import { ChevronDown, User } from "lucide-react"

export default function TopHeader() {
  return (
    <div className="bg-[#E00E1B] text-white text-sm py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex space-x-6">
          <Link href="/about" className="hover:underline">
            About us
          </Link>
          <Link href="/returns" className="hover:underline">
            Returns Policy
          </Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <span>Eng</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="flex items-center space-x-1">
            <span>USD</span>
            <ChevronDown className="w-3 h-3" />
          </div>
          <Link href="/login" className="flex items-center space-x-1 hover:underline">
            <User className="w-4 h-4" />
            <span>My Account</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
