// Компонент для безопасного рендеринга HTML с suppressHydrationWarning
export interface HtmlContentProps {
  html: string
  className?: string
}

export function HtmlContent({ html, className }: HtmlContentProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
      suppressHydrationWarning
    />
  )
}
