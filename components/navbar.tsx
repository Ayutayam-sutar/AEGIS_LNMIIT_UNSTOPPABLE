// src/components/Navbar.tsx
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <nav className="fixed top-0 w-full h-20 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex justify-between items-center px-6">
      {/* Logo */}
      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent cursor-pointer">
        Aegis Protocol
      </div>

      {/* Connect Button */}
      <div>
        {isConnected ? (
          <button 
            onClick={() => disconnect()}
            className="flex items-center gap-2 bg-green-500/10 text-green-400 px-5 py-2 rounded-full border border-green-500/50 hover:bg-green-500/20 transition-all font-mono"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {address?.slice(0,6)}...{address?.slice(-4)}
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  )
}