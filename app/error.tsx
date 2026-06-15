'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-sm">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2 font-headline">Something went wrong</h1>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        We apologize for the inconvenience. An unexpected error occurred while processing your request. 
        Our team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-[#0050cb] text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-800 transition-all w-full sm:w-auto justify-center"
        >
          <RefreshCcw className="h-4 w-4" /> Try Again
        </button>
        <Link 
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all w-full sm:w-auto justify-center"
        >
          <Home className="h-4 w-4" /> Go Home
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-red-50/50 border border-red-100 rounded-xl text-left max-w-2xl w-full overflow-auto">
          <p className="text-xs font-bold text-red-800 mb-1">Developer Details:</p>
          <pre className="text-[10px] text-red-600 font-mono whitespace-pre-wrap">{error.message}</pre>
          {error.stack && (
            <pre className="text-[10px] text-red-500 font-mono mt-2 pt-2 border-t border-red-100/50 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
