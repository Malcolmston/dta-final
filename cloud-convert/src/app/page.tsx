import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cloud Convert
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional file conversion and processing API
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/products"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View Plans
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Fast Conversion</h3>
            <p className="text-gray-600">
              Convert files in seconds with our optimized processing engine
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
            <p className="text-gray-600">
              Enterprise-grade security with 99.9% uptime guarantee
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Developer Friendly</h3>
            <p className="text-gray-600">
              Simple REST API with comprehensive documentation
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
