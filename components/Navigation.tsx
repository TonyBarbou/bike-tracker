import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            🚴‍♂️ Bike Tracker
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
              About
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
