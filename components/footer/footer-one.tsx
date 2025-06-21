import { Facebook, Twitter, Youtube } from "lucide-react"
import Link from "next/link"

const FooterOne = () => {
  return (
    <footer className="bg-slate-800 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex flex-wrap justify-between items-start">
          {/* Left: Logo & Contact */}
          <div className="flex-1 min-w-80 mb-8 flex flex-col items-start">
            <div className="flex items-center">
              <img src="/assets/logo-white.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </div>
            <br />
            <div className="flex items-center mb-6 text-lg">
              <span className="text-xl mr-2">✉️</span>
              <span>support@pakturktrade.com</span>
            </div>
            <div className="flex gap-7 mt-2 ml-1 text-xl">
              <Link href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Facebook">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Twitter">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href="#" className="text-white hover:text-green-400 transition-colors" aria-label="Google">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.81 10.04H12.79v2.48h5.03c-.33 2.59-2.71 4.06-5.03 4.06-2.79 0-5.05-2.26-5.05-5.01s2.26-5.05 5.05-5.05c1.41 0 2.67.54 3.62 1.45l1.89-1.88C16.84 4.66 14.93 3.82 12.79 3.82c-4.25 0-7.67 3.45-7.67 7.7s3.42 7.7 7.67 7.7c3.97 0 7.32-2.89 7.32-7.7 0-.49-.05-.99-.16-1.48z" />
                </svg>
              </Link>
              <Link href="#" className="text-white hover:text-green-400 transition-colors" aria-label="YouTube">
                <Youtube className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 min-w-45 mb-8">
            <h3 className="font-bold mb-4 text-white">Links</h3>
            <ul className="list-none p-0 m-0 leading-8 text-lg space-y-2">
              <li>
                <Link href="/about" className="text-white hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-green-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-white hover:text-green-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/policy" className="text-white hover:text-green-400 transition-colors">
                  Policy
                </Link>
              </li>
            </ul>
          </div>
          {/* Navigate */}
          <div className="flex-1 min-w-45 mb-8">
            <h3 className="font-bold mb-4 text-white">Navigate</h3>
            <ul className="list-none p-0 m-0 leading-8 text-lg space-y-2">
              <li>
                <Link href="/webinar" className="text-white hover:text-green-400 transition-colors">
                  Webinar
                </Link>
              </li>
              <li>
                <Link href="/expo" className="text-white hover:text-green-400 transition-colors">
                  Virtual Expo
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="text-white hover:text-green-400 transition-colors">
                  Suppliers
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white hover:text-green-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="flex-2 min-w-80 mb-8 max-w-lg">
            <h3 className="font-bold mb-4 text-white">About</h3>
            <p className="text-white text-base leading-7">
              Pak-Turk Trade is a B2B platform, which enables registered, verified companies in Pakistan and global
              markets to buy and sell from each other. This platform houses features and services to promote
              international trade in a trusted ecosystem e.g. smart company profiles, storefronts; RFPs & proposal
              management, virtual tours, online expos, webinar, built-in messaging, videocon system, social media
              marketing and a lot more.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-700 mt-8 pt-4 text-center text-lg text-white">
        Copyright {new Date().getFullYear()} Made in Pakistan. All Right Reserved
      </div>
    </footer>
  )
}

export default FooterOne
