'use client'

import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect()

  const handleConnect = () => {
    try {
      connect({ connector: injected() })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
    >
      Connect Wallet
    </button>
  )
}
