import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { TerminalOutput } from './TerminalOutput'
import { executeCommand } from '@/lib/commands'
import { useIsMobile } from '@/hooks/use-mobile'

interface TerminalLine {
  id: string
  type: 'command' | 'output'
  content: string
  timestamp: number
  animate?: boolean
}

interface TerminalProps {
  userData: any
  repoData: any
  loading: boolean
  lastUpdate: Date | null
}

export function Terminal({ userData, repoData, loading, lastUpdate }: TerminalProps) {
  const [input, setInput] = useState('')
  const [lines, setLines] = useKV<TerminalLine[]>('terminal-history', [])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const commands = ['help', 'about', 'skills', 'projects', 'stats', 'contact', 'clear']

  useEffect(() => {
    if (!lines || lines.length === 0) {
      const welcomeLines: TerminalLine[] = [
        {
          id: '0',
          type: 'output',
          content: '┌────────────────────────────────────────────────────────────────┐\n  DEVELOPER TERMINAL v2.4.1                                     \n  System initialized. Type "help" for available commands.       \n└────────────────────────────────────────────────────────────────┘',
          timestamp: Date.now(),
          animate: false
        }
      ]
      setLines(welcomeLines)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [lines])

  useEffect(() => {
    if (input) {
      const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()))
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }, [input])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim()) return

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: input,
      timestamp: Date.now(),
      animate: false
    }

    setLines(current => current ? [...current, commandLine] : [commandLine])
    
    const result = await executeCommand(input.trim(), userData, repoData)
    
    if (result === 'CLEAR') {
      setLines([])
    } else {
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: result,
        timestamp: Date.now(),
        animate: true
      }
      setLines(current => current ? [...current, outputLine] : [outputLine])
    }

    setInput('')
    setHistoryIndex(-1)
    setSuggestions([])
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const commandHistory = lines ? lines.filter(l => l.type === 'command').map(l => l.content) : []
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault()
      setInput(suggestions[0])
      setSuggestions([])
    }
  }

  const quickCommand = (cmd: string) => {
    setInput(cmd)
    inputRef.current?.focus()
    setTimeout(() => handleSubmit(), 100)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background p-2 sm:p-4">
      <div className="scanlines" />
      
      <Card className="relative h-full overflow-hidden border-2 border-primary/30 bg-card shadow-[0_0_30px_rgba(255,0,0,0.15)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-primary/30 bg-card/50 px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive"></div>
                <div className="h-3 w-3 rounded-full bg-secondary"></div>
                <div className="h-3 w-3 rounded-full bg-accent"></div>
                <span className="ml-4 text-sm text-muted-foreground">
                  {userData ? `${userData.login}@github` : 'guest@terminal'} ~ %
                </span>
              </div>
              {lastUpdate && (
                <div className="text-xs text-muted-foreground">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {isMobile && (
            <div className="border-b border-primary/30 bg-card/30 p-2">
              <div className="grid grid-cols-2 gap-2">
                {commands.slice(0, 6).map(cmd => (
                  <Button
                    key={cmd}
                    variant="outline"
                    size="sm"
                    onClick={() => quickCommand(cmd)}
                    className="border-primary/50 bg-background/50 text-xs text-foreground hover:bg-primary/20"
                  >
                    [ {cmd} ]
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div 
            className="flex-1 overflow-y-auto p-4 crt-flicker cursor-text" 
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
          >
            <div className="space-y-2 font-mono text-sm sm:text-base">
              {lines && lines.map((line) => (
                <div key={line.id}>
                  {line.type === 'command' ? (
                    <div className="flex items-start gap-2">
                      <span className="text-accent terminal-glow">$</span>
                      <span className="text-primary">{line.content}</span>
                    </div>
                  ) : (
                    <TerminalOutput content={line.content} animate={line.animate} />
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="text-secondary">
                  <span className="cursor-blink">▐</span> Loading data from GitHub...
                </div>
              )}

              <div className="flex items-start gap-2">
                <span className="text-accent terminal-glow">$</span>
                <div className="flex-1 relative" onClick={() => inputRef.current?.focus()}>
                  <span className="text-primary">{input}</span>
                  <span className="cursor-blink text-accent terminal-glow">▐</span>
                </div>
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="sr-only"
                autoFocus
                autoComplete="off"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
              />

              {suggestions.length > 0 && (
                <div className="text-xs text-muted-foreground pl-6">
                  Suggestions: {suggestions.join(', ')} (press Tab)
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}