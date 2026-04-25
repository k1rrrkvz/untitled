import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useKV } from '@github/spark/hooks'
import { TerminalOutput } from './TerminalOutput'
import { executeCommand } from '@/lib/commands'
import { useIsMobile } from '@/hooks/use-mobile'

interface TerminalLine {
  id: string
  type: 'command' | 'output' | 'prompt'
  content: string
  timestamp: number
  animate?: boolean
  prompt?: string
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const commands = ['ls', 'cd', 'pwd', 'cat', 'help', 'clear', 'whoami', 'date', 'stats', 'neofetch']

  useEffect(() => {
    if (!lines || lines.length === 0) {
      const welcomeLines: TerminalLine[] = [
        {
          id: '0',
          type: 'output',
          content: `Last login: ${new Date().toString()} on ttys001
${userData?.login || 'guest'}@github.com:~$ type 'help' for available commands`,
          timestamp: Date.now(),
          animate: false
        }
      ]
      setLines(welcomeLines)
    }
  }, [userData])

  useEffect(() => {
    scrollToBottom()
  }, [lines])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 0)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() && input !== '') return

    const commandLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'command',
      content: input,
      timestamp: Date.now(),
      animate: false,
      prompt: `${userData?.login || 'guest'}@github.com:~$`
    }

    setLines(current => current ? [...current, commandLine] : [commandLine])
    
    const result = await executeCommand(input.trim(), userData, repoData)
    
    if (result === 'CLEAR') {
      setLines([])
    } else if (result) {
      const outputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: result,
        timestamp: Date.now(),
        animate: false
      }
      setLines(current => current ? [...current, outputLine] : [outputLine])
    }

    setInput('')
    setHistoryIndex(-1)
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
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()))
      if (matches.length === 1) {
        setInput(matches[0])
      } else if (matches.length > 1) {
        const outputLine: TerminalLine = {
          id: Date.now().toString(),
          type: 'output',
          content: matches.join('  '),
          timestamp: Date.now(),
          animate: false
        }
        setLines(current => current ? [...current, outputLine] : [outputLine])
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const quickCommand = (cmd: string) => {
    setInput(cmd)
    inputRef.current?.focus()
    setTimeout(() => handleSubmit(), 100)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="scanlines" />
      
      <Card className="relative h-full overflow-hidden border-none bg-background shadow-none rounded-none">
        <div className="flex h-full flex-col">
          <div className="border-b border-primary/20 bg-background px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[oklch(0.6_0.25_30)]"></div>
              <div className="h-3 w-3 rounded-full bg-[oklch(0.7_0.3_80)]"></div>
              <div className="h-3 w-3 rounded-full bg-[oklch(0.65_0.28_140)]"></div>
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                {userData?.login || 'guest'}@github.com — spark-sh
              </span>
            </div>
            {lastUpdate && (
              <div className="text-xs text-muted-foreground font-mono">
                {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>

          {isMobile && (
            <div className="border-b border-primary/20 bg-background p-2">
              <div className="grid grid-cols-3 gap-1">
                {commands.slice(0, 6).map(cmd => (
                  <Button
                    key={cmd}
                    variant="ghost"
                    size="sm"
                    onClick={() => quickCommand(cmd)}
                    className="h-7 text-xs font-mono text-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    {cmd}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 crt-flicker cursor-text" 
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            style={{ minHeight: 0 }}
          >
            <div className="font-mono text-sm leading-relaxed pb-4">
              {lines && lines.map((line) => (
                <div key={line.id} className="mb-1">
                  {line.type === 'command' ? (
                    <div className="flex items-start">
                      <span className="text-accent terminal-glow select-none">{line.prompt} </span>
                      <span className="text-foreground">{line.content}</span>
                    </div>
                  ) : (
                    <TerminalOutput content={line.content} animate={line.animate} />
                  )}
                </div>
              ))}
              
              {loading && !userData && (
                <div className="text-muted-foreground mb-1">
                  Fetching GitHub data...
                </div>
              )}

              <div className="flex items-start">
                <span className="text-accent terminal-glow select-none">{userData?.login || 'guest'}@github.com:~$ </span>
                <div className="flex-1 relative">
                  <span className="text-foreground">{input}</span>
                  <span className="cursor-blink text-accent terminal-glow inline-block">▐</span>
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
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}