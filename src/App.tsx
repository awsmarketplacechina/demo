import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TodoTable } from './components/todo-table'
import { mockTodoItems } from './types/todo'

function App() {
  const [activeTab, setActiveTab] = useState<'api' | 'todo'>('todo')
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
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex space-x-4 border-b border-zinc-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'todo'
                ? 'border-b-2 border-zinc-900 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
            onClick={() => setActiveTab('todo')}
          >
            ToDo List
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'api'
                ? 'border-b-2 border-zinc-900 text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
            onClick={() => setActiveTab('api')}
          >
            API Gateway Demo
          </button>
        </div>

        {activeTab === 'todo' ? (
          <div>
            <h1 className="mb-8 text-3xl font-bold">Organization ToDo List</h1>
            <TodoTable data={mockTodoItems} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
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
        )}
      </div>
    </div>
  )
}

export default App
