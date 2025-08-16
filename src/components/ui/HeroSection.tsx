

export default function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          <span className="text-blue-600">Find & List Jobs</span> with{' '}
          <span className="text-purple-600">Impact</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Powered by{' '}
          <span className="font-semibold text-blue-600">PYUSD</span>
          {' • '}
          Milestone-based payments
          {' • '}
          Charity integration
        </p>

        {/* Stats or Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600">Web3 Jobs Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">PYUSD</div>
            <div className="text-gray-600">Stable Payments</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">Impact</div>
            <div className="text-gray-600">Charity Integration</div>
          </div>
        </div>
      </div>
    </div>
  )
}
