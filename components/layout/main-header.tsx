"use client"
import Link from "next/link"
import Image from "next/image"
import { Phone } from "lucide-react"

export default function MainHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image src="assets/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-1">
              <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">
                Home
              </Link>
            </div>
            <div className="flex items-center space-x-1 relative">
              <Link href="/shop" className="text-gray-700 hover:text-green-600 font-medium">
                Marketplace
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/pages" className="text-gray-700 hover:text-green-600 font-medium">
                Pages
              </Link>
            </div>
            <div className="flex items-center space-x-1 relative">
              <Link href="/vendors" className="text-gray-700 hover:text-green-600 font-medium">
                Companies
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/blog" className="text-gray-700 hover:text-green-600 font-medium">
                Blog
              </Link>
            </div>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 font-medium">
              Contact Us
            </Link>
          </nav>

          {/* Phone Number */}
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">01- 234 567 890</span>
          </div>
        </div>
      </div>
    </header>
  )
} 