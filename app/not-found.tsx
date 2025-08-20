'use client'

import Link from 'next/link'

import { Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pf-black to-pf-surface dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-pf-surface dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pf-surface dark:bg-blue-900 mb-4">
            <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="space-y-3">
            <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </button>
            
            <Link href="/" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                <Home className="h-4 w-4 mr-2" />
                Go home
              </button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
