import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl">NeuralForge</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/ai-generation"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                AI Generation
              </Link>
              <Link 
                href="/community"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Community
              </Link>
              <Link 
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
