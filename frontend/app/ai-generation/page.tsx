'use client'

import { useState } from 'react'

export default function AIGeneration() {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    // TODO: Implement actual AI generation logic
    setTimeout(() => {
      setOutput('Generated content will appear here...')
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI Content Generation
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Generate creative content using advanced AI models
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                Enter your prompt
              </label>
              <div className="mt-1">
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Describe what you want to generate..."
                />
              </div>
            </div>

            <div>
              {isGenerating ? (
                <div className="text-center py-2">
                  <p>Generation in progress...</p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate
                </button>
              )}
            </div>

            {output && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Generated Output
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    {output}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
