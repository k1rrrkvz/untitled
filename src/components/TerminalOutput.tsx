import { useEffect, useState } from 'react'

interface TerminalOutputProps {
  content: string
  animate?: boolean
}

export function TerminalOutput({ content, animate = false }: TerminalOutputProps) {
  const [displayedContent, setDisplayedContent] = useState(animate ? '' : content)
  
  useEffect(() => {
    if (animate && content) {
      let index = 0
      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
        }
      }, 10)
      
      return () => clearInterval(interval)
    }
  }, [content, animate])

  const lines = (animate ? displayedContent : content).split('\n')

  return (
    <div className="whitespace-pre-wrap font-mono text-foreground">
      {lines.map((line, i) => (
        <div key={i} className="leading-relaxed">
          {line || ' '}
        </div>
      ))}
    </div>
  )
}
