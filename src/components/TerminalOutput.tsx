import { useEffect, useState } from 'react'

interface TerminalOutputProps {
  content: string
  animate?: boolean
  typingSpeed?: number
}

export function TerminalOutput({ content, animate = true, typingSpeed = 2 }: TerminalOutputProps) {
  const [displayedContent, setDisplayedContent] = useState(animate ? '' : content)
  const [isTyping, setIsTyping] = useState(animate)
  
  useEffect(() => {
    if (animate && content) {
      setIsTyping(true)
      setDisplayedContent('')
      
      let index = 0
      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, typingSpeed)
      
      return () => {
        clearInterval(interval)
        setIsTyping(false)
      }
    } else {
      setDisplayedContent(content)
      setIsTyping(false)
    }
  }, [content, animate, typingSpeed])

  return (
    <div className="relative">
      <pre className="font-mono text-foreground whitespace-pre overflow-x-auto">
        {displayedContent}
        {isTyping && <span className="cursor-blink text-accent terminal-glow">▐</span>}
      </pre>
    </div>
  )
}
