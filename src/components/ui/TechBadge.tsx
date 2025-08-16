import { cn } from '@/lib/utils'

interface TechBadgeProps {
  tech: string
  className?: string
}

export default function TechBadge({ tech, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200',
        className
      )}
    >
      {tech}
    </span>
  )
}
