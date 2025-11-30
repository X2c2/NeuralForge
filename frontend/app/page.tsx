import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-6">
          Welcome to NeuralForge
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Your AI-powered platform for content creation and automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">AI Content Generation</h2>
          <p className="text-gray-600 mb-4">
            Create high-quality content using state-of-the-art AI models
          </p>
          <a
            href="/ai-generation"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Start Creating
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Community</h2>
          <p className="text-gray-600 mb-4">
            Share your creations and connect with other content creators
          </p>
          <a
            href="/community"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            Join Community
          </a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">API Access</h2>
          <p className="text-gray-600 mb-4">
            Integrate NeuralForge's AI capabilities into your own applications
          </p>
          <a
            href="/docs"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <a
          href="/login"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Create Account
        </a>
      </div>
    </main>
  )
}