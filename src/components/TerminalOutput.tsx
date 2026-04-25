import { useEffect, useState } from 'react'

interface TerminalOutputProps {
  content: string
  animate?: boolean
}

export function TerminalOutput({ content, animate = false }: TerminalOutputProps) {
  const [displayedContent, setDisplayedContent] = useState(content)
  
  useEffect(() => {
    setDisplayedContent(content)
  }, [content])

  const renderContent = () => {
    const parts = displayedContent.split(/(\x1b\[[0-9;]*m)/g)
    let currentColor = ''
    
    return parts.map((part, index) => {
      if (part.match(/\x1b\[34m/)) {
        currentColor = 'text-[oklch(0.6_0.25_240)]'
        return null
      } else if (part.match(/\x1b\[0m/)) {
        currentColor = ''
        return null
      } else if (part) {
        return (
          <span key={index} className={currentColor}>
            {part}
          </span>
        )
      }
      return null
    })
  }

  return (
    <pre className="font-mono text-foreground whitespace-pre-wrap break-words" style={{ fontVariantLigatures: 'none', fontFeatureSettings: 'normal' }}>
      {renderContent()}
    </pre>
  )
}
