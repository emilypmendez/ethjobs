'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi'
import { State, WagmiProvider } from 'wagmi'
import { config, projectId } from '@/lib/wagmi'
import { useEffect } from 'react'

// Setup queryClient
const queryClient = new QueryClient()

// Project ID validation is handled in wagmi.ts

let modalInitialized = false

function initializeModal() {
  if (!modalInitialized && typeof window !== 'undefined') {
    createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: false, // Disable for development
      enableOnramp: false // Disable for development
    })
    modalInitialized = true
  }
}

export default function Web3Provider({
  children,
  initialState
}: {
  children: React.ReactNode
  initialState?: State
}) {
  useEffect(() => {
    initializeModal()
  }, [])

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
