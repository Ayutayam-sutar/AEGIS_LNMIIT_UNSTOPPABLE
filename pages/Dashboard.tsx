import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { parseEther, formatEther, getAddress } from 'viem'; 
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Wallet, 
  LogOut,
  ChevronDown,
  Trash2,
  Lock,
  Activity, 
  Sun,
  Moon,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  ArrowRight,
  X
} from 'lucide-react';


import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useConnect,
  useDisconnect,
  useBalance 
} from 'wagmi';
import { AEGIS_CONTRACT_ADDRESS, AEGIS_ABI } from '../constants'; 

interface Transaction {
  id: string;
  recipient: string;
  amount: string;
  currency: string;
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'success' | 'failed';
}

interface ActivityItem {
  type: string;
  hash: string;
  value: string;
  status: string;
  isDanger: boolean;
  date: string;
}

interface WhitelistItem {
  id: string;
  name: string;
  address: string;
}


const INITIAL_TRANSACTION: Transaction = {
  id: 'tx-001',
  recipient: '0xScam...8a92',
  amount: '5.0',
  currency: 'ETH',
  timestamp: Date.now(),
  expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  status: 'pending'
};


const CHAINLINK_PRICE_FEED_ADDRESS = '0x694AA1769357215DE4FAC081bf1f309aDC325306';

const CHAINLINK_ABI = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();


  const { address: walletAddress, isConnected: isWalletConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect(); 
  const { disconnect } = useDisconnect();       
 
  const { data: userBalance } = useBalance({ 
    address: walletAddress 
  });


  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract({
    mutation: {
      onError: (error) => {
        console.error("Transaction Failed:", error);
        alert(`Transaction Failed: ${error.message}`);
      }
    }
  });
  

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });


  const { data: queueCount } = useReadContract({
    address: AEGIS_CONTRACT_ADDRESS,
    abi: AEGIS_ABI,
    functionName: 'queueCount',
  });


  const { data: latestQueueItem } = useReadContract({
    address: AEGIS_CONTRACT_ADDRESS,
    abi: AEGIS_ABI,
    functionName: 'getQueueItem',
    args: [queueCount || BigInt(0)], 
    query: {
        enabled: !!queueCount,
    }
  });


  const { data: priceData } = useReadContract({
    address: CHAINLINK_PRICE_FEED_ADDRESS,
    abi: CHAINLINK_ABI,
    functionName: 'latestRoundData',
    query: {
        refetchInterval: 20000, 
    }
  });


  const ethPrice = priceData ? Number(priceData[1]) / 1e8 : 0;


  const [transaction, setTransaction] = useState<Transaction | null>(INITIAL_TRANSACTION);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([
    { id: '1', name: 'Family Vault', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { id: '2', name: 'Cold Storage Ledger', address: '0x1234567890123456789012345678901234567890' }
  ]);
  
  const [newAddress, setNewAddress] = useState('');
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState<'whitelist' | 'inheritance'>('whitelist');
  const [notification, setNotification] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState('23h 55m 00s');

  const [isDeadMansSwitchActive, setIsDeadMansSwitchActive] = useState(true);
  const [beneficiary, setBeneficiary] = useState("Son's Wallet");
  const beneficiaries = ["Son's Wallet", "Lawyer's Multi-sig", "Charity Vault"];

  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [isDownloading, setIsDownloading] = useState(false);

  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<'idle' | 'valid-trusted' | 'valid-unknown' | 'invalid'>('idle');


  useEffect(() => {

    if (latestQueueItem && latestQueueItem[3] === true) {
        setTransaction({
            id: `tx-${queueCount?.toString()}`,
        
            recipient: latestQueueItem[0],
      
            amount: formatEther(latestQueueItem[1]),
            currency: 'ETH',
            timestamp: Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            status: 'pending'
        });
    } else {
        if (!transaction?.id.startsWith('tx-pending')) {
            setTransaction(null);
        }
    }
  }, [latestQueueItem, queueCount]);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeLeft(`23h ${59 - now.getMinutes()}m ${59 - now.getSeconds()}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const savedWhitelist = localStorage.getItem('aegis_whitelist');
    if (savedWhitelist) {
      setWhitelist(JSON.parse(savedWhitelist));
    }

    const savedHistory = localStorage.getItem('aegis_history');
    if (savedHistory) {
      setRecentActivity(JSON.parse(savedHistory));
    }

    const savedDMS = localStorage.getItem('aegis_dms_active');
    if (savedDMS !== null) {
        setIsDeadMansSwitchActive(savedDMS === 'true');
    }

    const savedBeneficiary = localStorage.getItem('aegis_beneficiary');
    if (savedBeneficiary && beneficiaries.includes(savedBeneficiary)) {
        setBeneficiary(savedBeneficiary);
    }
  }, []);


  useEffect(() => {
    if (isPending || isConfirming) {
      setIsProcessingTransfer(true);
    } else {
      setIsProcessingTransfer(false);
    }
    
    if (isConfirmed && hash) {
       setNotification("✅ Transaction Confirmed On-Chain!");
       setIsReviewModalOpen(false);
       
       const newActivityItem: ActivityItem = {
         type: 'Transfer', 
         hash: hash, 
         value: `${sendAmount} ETH`, 
         status: 'Success', 
         isDanger: recipientStatus === 'valid-unknown',
         date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
       };

       setRecentActivity(prev => {
         const updatedHistory = [newActivityItem, ...prev];
         const trimmedHistory = updatedHistory.slice(0, 5);
         localStorage.setItem('aegis_history', JSON.stringify(trimmedHistory));
         return trimmedHistory;
       });

       if (recipientStatus === 'valid-unknown') {
           setTransaction({
               id: `tx-pending-${Date.now()}`,
               recipient: sendRecipient,
               amount: sendAmount,
               currency: 'ETH',
               timestamp: Date.now(),
               expiresAt: Date.now() + 24 * 60 * 60 * 1000,
               status: 'pending'
           });
       }
       
       setSendAmount('');
       setSendRecipient('');
       
       setTimeout(() => setNotification(null), 5000);
    }
  
  }, [isPending, isConfirming, isConfirmed, hash]);



  const formatAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
  };


  const handlePing = () => {

    setNotification("💓 Heartbeat Sent! (Simulation Mode)");
 
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEmergencyUndo = () => {
    if (!queueCount) {
        setNotification("⚠️ No active transactions to undo.");
        return;
    }

    writeContract({
      address: AEGIS_CONTRACT_ADDRESS,
      abi: AEGIS_ABI as any,
      functionName: 'undoTransfer',
      args: [queueCount],
      account: walletAddress,
      chainId: chainId,
    } as any);
    
    setNotification("🛑 Attempting to Revert Transaction...");
  };

  const handleCancelTransaction = () => {
    if (!transaction) return;

    const isOnChainTransaction = !transaction.id.startsWith('tx-pending');

    if (isOnChainTransaction) {
        setNotification("⚠️ Initiating Blockchain Cancellation...");
        handleEmergencyUndo(); 
    } else {
        setTransaction(null);
        setNotification('Pending View Dismissed.');
        setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleAddWhitelist = () => {
    if (!newAddress.trim()) return;
    
    writeContract({
      address: AEGIS_CONTRACT_ADDRESS,
      abi: AEGIS_ABI as any,
      functionName: 'addToWhitelist',
      args: [newAddress],
      account: walletAddress,
      chainId: chainId,
    } as any);
    
    const name = newName.trim() || 'Trusted Contact';
    const newItem = { id: Date.now().toString(), name: name, address: newAddress };
    const updatedList = [newItem, ...whitelist];
    
    setWhitelist(updatedList);
    localStorage.setItem('aegis_whitelist', JSON.stringify(updatedList));
    
    setNewAddress('');
    setNewName('');
    setNotification("⏳ Saving to Blockchain & Local Storage...");
  };

  const toggleDeadMansSwitch = () => {
    const newState = !isDeadMansSwitchActive;
    setIsDeadMansSwitchActive(newState);
    localStorage.setItem('aegis_dms_active', String(newState));
    setNotification(newState ? "Dead Man's Switch Activated" : "Dead Man's Switch Deactivated");
    setTimeout(() => setNotification(null), 2000);
  };


  const handleClaimInheritance = () => {
    writeContract({
      address: AEGIS_CONTRACT_ADDRESS,
      abi: AEGIS_ABI as any,
      functionName: 'claimInheritance', 
      args: [],
    } as any);
    setNotification("💸 Claiming Inheritance...");
  };

  const cycleBeneficiary = () => {
    const currentIndex = beneficiaries.indexOf(beneficiary);
    const nextIndex = (currentIndex + 1) % beneficiaries.length;
    const nextBeneficiary = beneficiaries[nextIndex];
    setBeneficiary(nextBeneficiary);
    localStorage.setItem('aegis_beneficiary', nextBeneficiary);
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    setNotification("Generating PDF Report...");

    try {
    
      const doc = new jsPDF();
      
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(0, 240, 255);
      doc.text("AEGIS PROTOCOL", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("Secure Transaction History Report", 14, 30);
      
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 150, 20);
      doc.text(`Wallet: ${walletAddress || 'Not Connected'}`, 150, 25);

      autoTable(doc, {
        startY: 50,
        head: [['Date', 'Type', 'Tx Hash', 'Value', 'Status']],
        body: recentActivity.map(item => [
            item.date, 
            item.type, 
            item.hash, 
            item.value, 
            item.status
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        styles: {
          font: "helvetica",
          fontSize: 9
        }
      });

      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
     
        doc.text('Aegis Protocol - Secure Transaction Log', 105, 290, { align: 'center' });
      }

      doc.save('Aegis_History_Log.pdf');
      setNotification("Report Downloaded Successfully");
    } catch (error) {
      console.error(error);
      setNotification("Error generating report");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const validateRecipient = (address: string) => {
    setSendRecipient(address);
    if (!address) {
      setRecipientStatus('idle');
      return;
    }
    const isValidFormat = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isValidFormat) {
      setRecipientStatus('invalid');
    } else {
      const isTrusted = whitelist.some(item => item.address.toLowerCase() === address.toLowerCase());
      setRecipientStatus(isTrusted ? 'valid-trusted' : 'valid-unknown');
    }
  };

  const handleReviewTransaction = () => {
 
    if (!sendAmount || !sendRecipient) {
        setNotification("⚠️ Please enter both an amount and a recipient.");
        setTimeout(() => setNotification(null), 3000);
        return;
    }

    if (recipientStatus === 'invalid') {
        setNotification("⚠️ Invalid Recipient Address.");
        setTimeout(() => setNotification(null), 3000);
        return;
    }


    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
        setNotification("⚠️ Amount must be greater than 0.");
        setTimeout(() => setNotification(null), 3000);
        return;
    }


    if (userBalance) {
       
        const balance = parseFloat(formatEther(userBalance.value));
        if (amount > balance) {
            setNotification("⚠️ Insufficient Balance.");
            setTimeout(() => setNotification(null), 3000);
            return;
        }
    }

    
    setIsReviewModalOpen(true);
  };

  const executeTransfer = () => {
    if (!sendAmount || !sendRecipient) return;

    try {
        const cleanAddress = getAddress(sendRecipient.trim());

        writeContract({
          address: AEGIS_CONTRACT_ADDRESS,
          abi: AEGIS_ABI as any,
          functionName: 'execute',
          args: [
            cleanAddress,                   
            parseEther(sendAmount),         
            "0x",                           
            BigInt(0)                       
          ],
          value: parseEther(sendAmount),    
        } as any);

    } catch (error) {
        alert("Invalid Address! Please check the recipient address.");
        console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-aegis-dark text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 dark:selection:bg-aegis-accent/30 transition-colors duration-500 relative">
      
      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsReviewModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-aegis-panel border border-gray-200 dark:border-aegis-accent/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Review Transaction</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                   <div className="text-4xl font-mono font-bold text-blue-600 dark:text-aegis-accent mb-1">
                     {sendAmount} ETH
                   </div>
                   <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                     <ArrowRight className="w-4 h-4" />
                     <span className="font-mono truncate max-w-[200px]">{sendRecipient}</span>
                   </div>
                </div>

                <div className={`p-4 rounded-xl mb-6 border ${
                  recipientStatus === 'valid-trusted' 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30' 
                  : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30'
                }`}>
                   <div className="flex items-start gap-3">
                     {recipientStatus === 'valid-trusted' ? (
                       <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                     ) : (
                       <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                     )}
                     <div>
                       <h4 className={`font-bold text-sm mb-1 ${
                         recipientStatus === 'valid-trusted' ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
                       }`}>
                         {recipientStatus === 'valid-trusted' ? 'Verified Trusted Address' : 'Unknown Recipient Detected'}
                       </h4>
                       <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                         {recipientStatus === 'valid-trusted' 
                          ? 'This address is in your whitelist. The transfer will be executed instantly.' 
                          : 'This transaction will be LOCKED for 24 hours in the Aegis Vault. You can Undo it if this was a mistake.'}
                       </p>
                     </div>
                   </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={executeTransfer}
                  disabled={isProcessingTransfer}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 dark:from-aegis-primary dark:to-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessingTransfer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                  {isProcessingTransfer ? 'Processing...' : 'Confirm & Send'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <header className="h-16 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-aegis-panel/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 backdrop-blur-md transition-colors">
        <motion.div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer" 
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-aegis-accent" />
          <span className="font-bold tracking-widest text-gray-900 dark:text-white text-sm md:text-base">AEGIS<span className="text-gray-500 text-xs ml-1 hidden sm:inline">DASHBOARD</span></span>
        </motion.div>

        <div className="flex items-center gap-2 md:gap-4">
          <motion.button 
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {/* Connect/Disconnect Logic */}
          {isWalletConnected ? (
             <motion.button 
               onClick={() => disconnect()}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-3 md:px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 bg-green-100 dark:bg-black/40 border-green-200 dark:border-aegis-success/30"
             >
                <div className="w-2 h-2 bg-green-500 dark:bg-aegis-success rounded-full animate-pulse" />
                <span className="text-xs font-mono text-green-700 dark:text-aegis-success hidden md:inline">Protected</span>
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400 border-l border-gray-300 dark:border-gray-700 pl-0 md:pl-2">
                  {formatAddress(walletAddress || '')}
                </span>
             </motion.button>
          ) : (
            <motion.button 
              onClick={() => connect({ connector: connectors[0] })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 md:px-4 py-1.5 rounded-full border transition-all flex items-center gap-2 bg-blue-600 dark:bg-aegis-primary text-white border-transparent"
            >
               <span className="text-sm font-medium">Connect Wallet</span>
            </motion.button>
          )}

          <motion.button 
            onClick={() => navigate('/')} 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-gray-200 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* Panel A: Status Overview */}
        <section className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gradient-to-br dark:from-aegis-panel dark:to-aegis-dark border border-gray-200 dark:border-aegis-success/20 p-6 rounded-2xl shadow-lg dark:shadow-none relative overflow-hidden group cursor-default"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 dark:bg-aegis-success/5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            {/* --- HEARTBEAT BUTTON --- */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePing}
                className="absolute top-0 right-0 m-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/10 transition-colors group/ping z-20"
                title="I'm Alive (Reset Timer)"
            >
                <Activity className="w-5 h-5 text-green-400 group-hover/ping:text-green-300 animate-pulse" />
            </motion.button>

            <div className="flex flex-col items-center text-center gap-4 relative z-10">
              <div className="w-16 h-16 bg-green-50 dark:bg-aegis-success/10 rounded-full flex items-center justify-center border border-green-100 dark:border-aegis-success/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-8 h-8 text-green-600 dark:text-aegis-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Active</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All Assets Protected</p>
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-white/5 my-2" />
              <div className="grid grid-cols-2 w-full gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Protection Level</p>
                  <p className="font-mono text-blue-600 dark:text-aegis-accent">MAXIMUM</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Queue</p>
                  <p className="font-mono text-green-600 dark:text-aegis-success">{queueCount ? queueCount.toString() : '0'}</p>
                </div>
              </div>
              
              {/* Chainlink Price Display */}
              <div className="text-center w-full mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
                  <p className="text-xs text-gray-500 uppercase mb-1">Vault Balance</p>
                  
                  <p className="font-mono text-xl font-bold text-gray-900 dark:text-white">
                    {userBalance ? parseFloat(formatEther(userBalance.value)).toFixed(4) : '0.00'} ETH
                  </p>
                  
                  <div className="flex flex-col items-center justify-center gap-1 mt-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-aegis-accent bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/30">
                        1 ETH = ${ethPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                      
                      <p className="text-xs text-gray-400">
                        Total: ${(userBalance && ethPrice) ? (parseFloat(formatEther(userBalance.value)) * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'} USD
                      </p>
                  </div>
              </div>
            </div>
          </motion.div>

          {/* Panel C: Security Settings */}
          <div className="flex-grow bg-white dark:bg-aegis-panel border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col shadow-lg dark:shadow-none transition-colors">
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/5 pb-4 mb-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('whitelist')}
                className={`text-sm font-medium transition-colors ${activeTab === 'whitelist' ? 'text-blue-600 dark:text-aegis-accent' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
              >
                Whitelist
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('inheritance')}
                className={`text-sm font-medium transition-colors ${activeTab === 'inheritance' ? 'text-blue-600 dark:text-aegis-accent' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
              >
                Inheritance
              </motion.button>
            </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Beneficiary Actions</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <Wallet className="w-5 h-5 text-blue-600 dark:text-aegis-primary mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Claim Vault Funds</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 mb-3">
                                    If the owner has been inactive for the set duration (e.g. 365 days), you can claim the funds here.
                                </p>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClaimInheritance}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Claim Inheritance
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

            {activeTab === 'whitelist' ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Label (e.g. Family)" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-aegis-accent/50 font-mono text-gray-900 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 w-full"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Address (0x...)" 
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="flex-grow bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-aegis-accent/50 font-mono text-gray-900 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 w-full"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddWhitelist}
                      className="bg-blue-600 dark:bg-aegis-primary hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm border border-transparent transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {whitelist.map(addr => (
                      <motion.div 
                        key={addr.id} 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => validateRecipient(addr.address)} 
                        className="flex items-center justify-between bg-gray-50 dark:bg-black/20 p-3 rounded-lg border border-gray-200 dark:border-white/5 group transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{addr.name}</p>
                          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 truncate">{addr.address}</p>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                            <ArrowRight className="w-4 h-4 text-blue-500 dark:text-aegis-primary flex-shrink-0 -rotate-45 group-hover:rotate-0 transition-transform" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 10 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500 dark:text-aegis-gold" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Dead Man's Switch</span>
                    </div>
                    <motion.div 
                      onClick={toggleDeadMansSwitch}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-12 h-6 rounded-full relative cursor-pointer border transition-colors ${isDeadMansSwitchActive ? 'bg-green-200 dark:bg-aegis-success/20 border-green-300 dark:border-aegis-success/50' : 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600'}`}
                    >
                      <motion.div 
                        layout
                        animate={{ x: isDeadMansSwitchActive ? 24 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`absolute top-1 w-4 h-4 rounded-full shadow-lg ${isDeadMansSwitchActive ? 'bg-green-500 dark:bg-aegis-success' : 'bg-gray-500 dark:bg-gray-400'}`} 
                      />
                    </motion.div>
                </div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cycleBeneficiary}
                  className="bg-gray-50 dark:bg-black/20 p-4 rounded-lg border border-gray-200 dark:border-white/5 cursor-pointer select-none"
                >
                  <p className="text-xs text-gray-500 mb-1">Beneficiary (Tap to cycle)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{beneficiary}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Right Column: Secure Transfer & Undo Queue */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Panel B: Secure Transfer */}
          <section className="bg-white dark:bg-aegis-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg dark:shadow-none transition-colors">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-aegis-primary" />
              </div>
              Secure Transfer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex flex-col gap-2 relative">
                 <label className="text-xs font-bold text-gray-500 uppercase">Recipient Address</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     value={sendRecipient}
                     onChange={(e) => validateRecipient(e.target.value)}
                     placeholder="0x..."
                     className={`w-full bg-gray-50 dark:bg-black/30 border rounded-xl py-3 pl-4 pr-10 font-mono text-sm focus:outline-none transition-all ${
                       recipientStatus === 'invalid' 
                       ? 'border-red-400 focus:border-red-500' 
                       : recipientStatus === 'valid-trusted'
                       ? 'border-green-400 focus:border-green-500'
                       : recipientStatus === 'valid-unknown'
                       ? 'border-amber-400 focus:border-amber-500'
                       : 'border-gray-200 dark:border-white/10 focus:border-blue-500 dark:focus:border-aegis-accent'
                     }`}
                   />
                   <div className="absolute right-3 top-3">
                     {recipientStatus === 'valid-trusted' && <ShieldCheck className="w-5 h-5 text-green-500" />}
                     {recipientStatus === 'valid-unknown' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                     {recipientStatus === 'invalid' && <XCircle className="w-5 h-5 text-red-500" />}
                   </div>
                 </div>
                 <div className="h-4">
                   {recipientStatus === 'valid-trusted' && <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Whitelisted Trusted Address</span>}
                   {recipientStatus === 'valid-unknown' && <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><Lock className="w-3 h-3"/> Unknown - TimeLock will apply</span>}
                 </div>
               </div>

               <div className="flex flex-col gap-2">
                 <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                   <span>Amount (ETH)</span>
                   <span 
                    onClick={() => setSendAmount(userBalance ? formatEther(userBalance.value) : '0')}
                    className="text-blue-600 dark:text-aegis-accent cursor-pointer hover:underline"
                   >
                     Max: {userBalance ? parseFloat(formatEther(userBalance.value)).toFixed(4) : '0.00'}
                   </span>
                 </label>
                 <div className="relative">
                   <input 
                     type="text"
                     value={sendAmount}
                     onChange={(e) => {
                       if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) {
                         setSendAmount(e.target.value);
                       }
                     }}
                     placeholder="0.00"
                     className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-16 font-mono text-sm focus:outline-none focus:border-blue-500 dark:focus:border-aegis-accent transition-all"
                   />
                   <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold pointer-events-none">
                     ETH
                   </span>
                 </div>
               </div>
            </div>

            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReviewTransaction}
                disabled={recipientStatus === 'invalid' || !sendRecipient || !sendAmount}
                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Review Transaction <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </section>

          {/* Panel B (Lower): The Undo Queue */}
          <section className="bg-white dark:bg-aegis-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg dark:shadow-none transition-colors flex-grow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sm:gap-0">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Clock className="w-5 h-5 text-blue-600 dark:text-aegis-accent" />
                Pending Time-Locked Transactions
              </h2>
              {transaction && (
                <span className="bg-red-50 dark:bg-aegis-danger/10 text-red-600 dark:text-aegis-danger text-xs px-2 py-1 rounded border border-red-200 dark:border-aegis-danger/20 animate-pulse">
                  Live Monitoring
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {transaction ? (
                <motion.div
                  key="transaction-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100, transition: { duration: 0.3 } }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-50 dark:bg-black/40 border border-red-200 dark:border-aegis-danger/30 rounded-xl p-6 relative overflow-hidden group hover:border-red-400 dark:hover:border-aegis-danger/60 transition-colors shadow-sm"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 dark:bg-aegis-danger" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-grow w-full md:w-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-600 dark:text-aegis-danger font-bold text-sm tracking-wider uppercase flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> Unknown Recipient
                        </span>
                      </div>
                      <h3 className="text-2xl font-mono text-gray-900 dark:text-white mb-1">
                        Sending <span className="text-amber-600 dark:text-aegis-gold">{transaction.amount} {transaction.currency}</span>
                      </h3>
                      <p className="font-mono text-gray-500 dark:text-gray-400 text-sm break-all">
                        To: {transaction.recipient}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 md:gap-1">
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-xs text-gray-500 uppercase">Auto-Execute In</span>
                        <span className="text-xl md:text-2xl font-mono text-gray-900 dark:text-white tracking-widest">{timeLeft}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <motion.button
                        onClick={handleCancelTransaction}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-auto bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 md:py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Cancel
                      </motion.button>

                      <motion.button
                        onClick={handleEmergencyUndo}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-3 md:py-4 px-6 rounded-lg shadow-lg dark:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        EMERGENCY UNDO
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-40 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-xl"
                >
                  <ShieldCheck className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-lg text-center px-4">No pending risks detected.</p>
                  <p className="text-sm">Your assets are secure.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-6 right-6 left-6 md:left-auto bg-green-500 dark:bg-aegis-success text-white dark:text-black px-6 py-4 rounded-lg font-bold shadow-xl flex items-center justify-center gap-3 z-50 text-sm md:text-base"
                >
                  <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                  {notification}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Panel C: Transaction History */}
        <section className="lg:col-span-12">
            <div className="bg-white dark:bg-aegis-panel border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-lg dark:shadow-none transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-aegis-primary" />
                  Recent Activity
                </h3>
                
                <motion.button
                  onClick={handleDownloadReport}
                  disabled={isDownloading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Report
                </motion.button>
              </div>
              
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-sm text-left min-w-[600px]">
                  <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-black/20 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg">Type</th>
                      <th className="px-6 py-3">Hash</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {recentActivity.map((row, idx) => (
                      <motion.tr 
                        key={idx}
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.99 }}
                        className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                           {row.isDanger ? <ShieldCheck className="w-4 h-4 text-red-500" /> : <Wallet className="w-4 h-4 text-blue-500" />}
                           {row.type}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-500">{row.hash}</td>
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-300">{row.value}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            row.isDanger 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50'
                          }`}>
                            {row.isDanger ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {row.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;