import { cn } from '@/lib/utils'

interface BlockchainBadgeProps {
  network: string
  className?: string
}

const networkStyles: Record<string, string> = {
  'Ethereum': 'bg-blue-100 text-blue-800 border-blue-200',
  'Polygon': 'bg-purple-100 text-purple-800 border-purple-200',
  'Arbitrum': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Optimism': 'bg-red-100 text-red-800 border-red-200',
  'Multi-chain': 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 border-gray-200',
  'Base': 'bg-blue-50 text-blue-700 border-blue-200',
  'Avalanche': 'bg-red-50 text-red-700 border-red-200',
  'BSC': 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function BlockchainBadge({ network, className }: BlockchainBadgeProps) {
  const style = networkStyles[network] || 'bg-gray-100 text-gray-800 border-gray-200'
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        style,
        className
      )}
    >
      {network}
    </span>
  )
}
