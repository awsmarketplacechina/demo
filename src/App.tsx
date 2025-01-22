import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TodoTable } from './components/todo-table'
import { mockTodoItems } from './types/todo'
import { Header } from './components/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function App() {
  const [activeTab, setActiveTab] = useState<'todo' | 'api'>('todo')
  const templates = [
    "Parse meeting notes and create follow up actions",
    "Summarize user feedback"
  ]
  const [inputText, setInputText] = useState(templates[0])
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTabSwitch = (tab: 'todo' | 'api') => {
    setActiveTab(tab)
  }

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
        <Header activeTab={activeTab} onTabSwitch={handleTabSwitch} />

        {activeTab === 'todo' ? (
          <div>
            <h1 className="mb-8 text-3xl font-bold">Organization ToDo List</h1>
            <TodoTable data={mockTodoItems} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-center mb-6">Text Input</h1>
            <Select
              value={selectedTemplate}
              onValueChange={(value) => {
                setSelectedTemplate(value);
                setInputText(value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem value={t} key={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
