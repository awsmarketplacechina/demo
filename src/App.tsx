import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

function App() {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Using a dummy API Gateway endpoint
      const response = await fetch('https://dummy-api-gateway.execute-api.us-east-1.amazonaws.com/prod/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit data')
      }

      // Clear the input after successful submission
      setInputText('')
      alert('Successfully submitted!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">API Gateway Demo</h1>
        <Textarea 
          placeholder="Enter your text here..."
          className="min-h-[200px] w-full p-4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button 
          className="w-full py-6 text-lg font-semibold"
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? 'Submitting...' : 'Super Button'}
        </Button>
      </div>
    </div>
  )
}

export default App
