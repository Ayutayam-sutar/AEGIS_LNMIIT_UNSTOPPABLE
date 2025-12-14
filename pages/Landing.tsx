import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Activity, Github, Send, Sun, Moon, Loader2, Wallet } from 'lucide-react';
import ShieldCanvas from '../components/ShieldCanvas';
import FeatureCard from '../components/FeatureCard';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleConnect = async () => {

    if (isWalletConnected) return;

    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    setIsConnecting(true);

    try {

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });


      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]); 
        setIsWalletConnected(true);    
      }
    } catch (error) {
      console.error("User rejected connection or error occurred:", error);
    } finally {
      setIsConnecting(false);
    }
  };


  const formatAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-aegis-dark transition-colors duration-500">
      <div className="fixed inset-0 bg-mesh opacity-30 dark:opacity-100 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="w-full py-4 md:py-6 px-4 md:px-8 flex justify-between items-center backdrop-blur-md fixed top-0 z-50 border-b border-gray-200 dark:border-white/5 bg-white/70 dark:bg-transparent transition-colors">
        <motion.div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer" 
          onClick={() => window.scrollTo(0, 0)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-aegis-accent" />
          <span className="text-lg md:text-xl font-bold tracking-wider text-gray-900 dark:text-white">AEGIS<span className="text-blue-600 dark:text-aegis-accent font-light">PROTOCOL</span></span>
        </motion.div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <motion.button 
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          <motion.button 
            onClick={handleConnect}
            disabled={isConnecting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 md:px-6 py-2 rounded-full border transition-all flex items-center gap-2 ${
              isWalletConnected 
                ? 'bg-green-100/10 border-green-500/30 text-green-600 dark:text-green-400'
                : 'border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-aegis-accent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isWalletConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {/* 4. Display the Actual Connected Address */}
                <span className="font-mono text-sm hidden sm:inline">{formatAddress(walletAddress)}</span>
                <span className="font-mono text-sm sm:hidden">{walletAddress.slice(0, 4)}...</span>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 ml-1" />
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Connect Wallet</span>
                <span className="text-sm font-medium sm:hidden">Connect</span>
              </>
            )}
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4 md:gap-6 order-2 lg:order-1"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-gray-900 dark:text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 dark:from-blue-400 dark:via-cyan-400 dark:to-white">
                Aegis Protocol
              </span>
            </h1>
            <h2 className="text-xl md:text-3xl text-gray-600 dark:text-gray-300 font-light">
              The Unstoppable Guardian for Sovereign Wealth.
            </h2>
            <h3 className="text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-lg border-l-2 border-blue-500 dark:border-aegis-accent pl-4">
              The first on-chain 'Undo Button' for blockchain transactions. 
              <br/>
              <span className="text-blue-600 dark:text-aegis-accent font-mono">100% Serverless. Zero Trust.</span>
            </h3>

            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 md:mt-8 w-fit group relative px-6 md:px-8 py-3 md:py-4 bg-blue-600 dark:bg-aegis-primary hover:bg-blue-700 rounded-lg overflow-hidden transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] dark:shadow-[0_0_20px_rgba(37,99,235,0.5)] dark:hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative text-white font-bold tracking-widest uppercase flex items-center gap-2 text-sm md:text-base">
                Launch App <Zap className="w-4 h-4" />
              </span>
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center items-center h-[300px] md:h-[500px] order-1 lg:order-2"
          >
            <ShieldCanvas />
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard 
            icon={<Activity className="w-6 h-6" />}
            title="The Time-Lock Vault"
            description="Mistakes happen. Reverse transactions to unknown addresses within 24 hours via our optimistic rollup smart contracts."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Trusted Speed Lane"
            description="Instant, unlimited transfers to your whitelisted family and cold storage addresses without delay."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6" />}
            title="Inheritance Pulse"
            description="Autonomous Dead Man's Switch ensures wealth passes to your kin if your wallet remains inactive."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-gray-200 dark:border-white/5 bg-white/80 dark:bg-aegis-dark/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500 font-mono tracking-widest uppercase text-center md:text-left">
            stable order by juggernaut 2025 all rights reserved
          </p>
          <div className="flex items-center gap-6">
            <motion.a 
              href="https://github.com" 
              whileHover={{ scale: 1.1, color: '#000000' }}
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.a 
              href="https://discord.com" 
              whileHover={{ scale: 1.1, color: '#5865F2' }}
              className="text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 2.382 2.382 0 0 0-.332.677 19.21 19.21 0 0 0-7.045 0 2.39 2.39 0 0 0-.332-.677.074.074 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.127 10.2 10.2 0 0 0 .729-.574.084.084 0 0 1 .085-.012c4.211 1.923 8.766 1.923 12.923 0a.083.083 0 0 1 .085.012 10.264 10.264 0 0 0 .73.574.077.077 0 0 1-.006.127 13.568 13.568 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/></svg>
            </motion.a>
            <motion.a 
              href="https://telegram.org" 
              whileHover={{ scale: 1.1, color: '#0088cc' }}
              className="text-gray-400 transition-colors"
            >
              <Send className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;