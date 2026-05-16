/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { InstitutionalDashboard } from './components/InstitutionalDashboard';
import { TradingChart } from './components/TradingChart';
import { TradeHistory } from './components/TradeHistory';
import { Watchlist } from './components/Watchlist';
import { StockDetailsModal } from './components/StockDetailsModal';
import { SignalResponse } from './types';
import { LayoutGrid, Settings, HelpCircle, User, ChevronLeft, ChevronRight, Menu, Maximize2, Minimize2, Calendar, Eye, Activity } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
  const [dashboardCollapsed, setDashboardCollapsed] = useState(false);
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState('NIFTY 50');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async (retries = 3) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch('/api/signals', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'No error details');
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      const json = await res.json();
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid data format received from API');
      }
      setData(json);
      setError(null);
      setLoading(false); // Success - stop loading
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      if (retries > 0) {
        console.log(`Retrying fetch... (${retries} left)`);
        setTimeout(() => fetchData(retries - 1), 2000);
        return;
      }
      let message = 'Unknown error occurred';
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          message = 'Request timed out';
        } else {
          message = err.message;
        }
      }
      setError(message);
      setLoading(false); // All retries failed - stop loading
    }
  };

  useEffect(() => {
    // Initial fetch with a larger delay to allow server to boot Vite middleware
    const startupTimeout = setTimeout(() => {
      fetchData(5); // More retries on startup
    }, 5000); // 5s delay
    
    const interval = setInterval(() => {
        fetchData(0); // Regular intervals don't need heavy retries
    }, 15000); // 15s interval
    
    return () => {
        clearTimeout(startupTimeout);
        clearInterval(interval);
    };
  }, []);

  const handleSymbolSelect = (symbol: string) => {
    setActiveSymbol(symbol);
    setIsModalOpen(true); // Open details modal on click as requested
  };

  if (loading && !data) {
    return (
      <div className="h-screen w-screen bg-terminal-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-terminal-accent font-mono">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-[1px] border-terminal-accent border-t-transparent rounded-none"
          />
          <div className="flex flex-col items-center gap-1">
            <p className="animate-pulse tracking-[0.4em] text-[10px] uppercase font-bold">Alpha Neural Link</p>
            <p className="text-terminal-muted text-[8px] uppercase tracking-widest">Establishing Secure Session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-screen w-screen bg-terminal-bg flex items-center justify-center p-6">
        <div className="bg-terminal-bear/5 border border-terminal-bear/20 p-10 max-w-md w-full">
          <span className="text-terminal-bear font-display font-bold uppercase tracking-[0.3em] block mb-6 text-center">Neural Link Failure</span>
          <p className="text-terminal-muted text-[11px] font-mono mb-8 text-center leading-relaxed italic">"{error}"</p>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="w-full py-4 bg-terminal-bear text-white font-mono font-bold uppercase text-[10px] tracking-widest hover:bg-terminal-bear/80 transition-all"
          >
            Re-Initialize Core
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-terminal-bg text-[#D1D1D6] flex flex-col overflow-hidden select-none font-sans">
      {/* Header */}
      <header className="h-[70px] bg-black border-b border-terminal-border flex items-center justify-between px-8 z-30 shrink-0">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-terminal-accent flex items-center justify-center">
                <Activity className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
                <span className="text-white font-display font-black text-xl tracking-tight leading-none">ALPHA LINK</span>
                <span className="text-terminal-accent/60 font-mono text-[8px] uppercase tracking-[0.3em] mt-0.5">Quant Execution V4.2</span>
            </div>
          </div>
          
          <div className="h-10 w-[1px] bg-terminal-border"></div>
          
          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-terminal-muted text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                <div className="w-1 h-1 bg-terminal-accent rounded-full pulse-accent" /> Active Channel
              </span>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-lg text-white tracking-wide">{activeSymbol}</span>
                <span className="px-2 py-0.5 border border-terminal-border text-terminal-muted text-[8px] font-mono uppercase">LQD: HIGH</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-terminal-muted text-[9px] font-bold uppercase tracking-[0.2em] mb-1.5">Alpha Confidence</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-terminal-bull tabular-nums">{data?.confidence || '0%'}</span>
                <div className="w-12 h-1 bg-terminal-border overflow-hidden">
                    <div className="h-full bg-terminal-bull" style={{ width: data?.confidence }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
            className={`group h-10 px-6 border transition-all flex items-center gap-3 ${
              !historyCollapsed ? 'bg-terminal-accent border-terminal-accent text-black font-bold' : 'bg-transparent border-terminal-border text-terminal-muted hover:border-terminal-accent/50 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Signal Monitor</span>
          </button>

          <div className={`h-10 px-6 border flex items-center gap-3 ${data?.marketBias === 'BULLISH' ? 'border-terminal-bull/30 bg-terminal-bull/5 text-terminal-bull' : 'border-terminal-bear/30 bg-terminal-bear/5 text-terminal-bear'}`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">{data?.marketBias} BIAS</span>
            <div className={`w-1.5 h-1.5 rounded-full ${data?.marketBias === 'BULLISH' ? 'bg-terminal-bull animate-pulse shadow-[0_0_8px_rgba(0,255,163,0.5)]' : 'bg-terminal-bear animate-pulse shadow-[0_0_8px_rgba(255,46,91,0.5)]'}`} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Watchlist */}
        <div 
          style={{ width: watchlistCollapsed ? 0 : 340 }}
          className="bg-terminal-surface border-r border-terminal-border flex flex-col shrink-0 overflow-hidden relative transition-all duration-500 ease-in-out"
        >
          <Watchlist onSelect={handleSymbolSelect} activeSymbol={activeSymbol} />
        </div>

        {/* Trade History Sidebar */}
        <div 
          style={{ width: historyCollapsed ? 0 : 360 }}
          className="bg-terminal-surface border-r border-terminal-border flex flex-col shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
        >
          <TradeHistory />
        </div>

        {/* Center: Chart Area */}
        <div className="flex-1 flex flex-col relative bg-terminal-bg overflow-hidden">
          {/* UI Control Overlays */}
          <div className="absolute top-6 left-6 z-20">
             <button 
                onClick={() => setWatchlistCollapsed(!watchlistCollapsed)}
                className={`p-3 border border-terminal-border bg-black/80 backdrop-blur-md text-terminal-muted hover:text-terminal-accent transition-all ${!watchlistCollapsed ? 'border-terminal-accent/40 text-terminal-accent' : ''}`}
                title="Toggle Watchlist"
             >
                <LayoutGrid className="w-4 h-4" />
             </button>
          </div>

          <div className="absolute top-6 right-6 z-20 flex gap-2">
             <button 
               onClick={() => setFooterCollapsed(!footerCollapsed)}
               className={`p-3 border border-terminal-border bg-black/80 backdrop-blur-md text-terminal-muted hover:text-white transition-all ${footerCollapsed ? 'opacity-50' : ''}`}
             >
               {footerCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
             </button>
             <button 
               onClick={() => setDashboardCollapsed(!dashboardCollapsed)}
               className={`p-3 border border-terminal-border bg-black/80 backdrop-blur-md text-terminal-muted hover:text-white transition-all ${dashboardCollapsed ? 'opacity-50' : ''}`}
             >
                {dashboardCollapsed ? <LayoutGrid className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
             </button>
          </div>

          <div className="flex-1 w-full h-full">
            <TradingChart data={data} symbol={activeSymbol} />
          </div>
        </div>

        {/* Right Sidebar: Execution Dashboard */}
        <div 
          style={{ width: dashboardCollapsed ? 0 : 360 }}
          className="shrink-0 bg-terminal-surface h-full overflow-y-auto scrollbar-hide relative transition-all duration-500 ease-in-out"
        >
          <InstitutionalDashboard data={data} activeSymbol={activeSymbol} />
        </div>
      </main>

      {/* Institutional Execution Footer */}
      <footer 
        style={{ height: footerCollapsed ? 0 : 100 }}
        className="bg-black border-t border-terminal-border flex items-center px-10 z-30 shrink-0 overflow-hidden relative transition-all duration-500 ease-in-out"
      >
        <div className="flex items-center gap-12">
            <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-[0.3em]">Neural Probability Status</span>
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-display font-medium text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        {data?.confidence || '0%'}
                    </span>
                    <div className="flex gap-1.5 h-6 items-end pb-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div 
                                key={i} 
                                className={`w-1 transition-all duration-700 ${i <= 6 ? 'bg-terminal-accent' : 'bg-terminal-border'}`}
                                style={{ height: `${20 + (i * 10)}%` }}
                             />
                        ))}
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex flex-col gap-1 border-l border-terminal-border pl-12">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-widest">Recommended Logic</span>
                <span className={`text-[12px] font-display font-bold uppercase tracking-wider ${data?.setup?.direction === 'BUY' ? 'text-terminal-bull' : 'text-terminal-bear'}`}>
                    High Probability {data?.setup?.direction} Execution
                </span>
                <span className="text-terminal-muted text-[10px] font-mono uppercase">Target: {data?.setup?.tp1?.toFixed(2)} / Risk: {data?.setup?.sl?.toFixed(2)}</span>
            </div>
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="text-terminal-muted text-[8px] font-mono uppercase tracking-[0.2em]">Alpha Signature</span>
            <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-[1px] ${i <= 3 ? 'bg-terminal-accent' : 'bg-terminal-border'}`} />)}
            </div>
          </div>
          
          <button className="group relative">
            <div className="absolute -inset-1 bg-terminal-bull/20 blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-terminal-bull text-black px-16 py-4 font-display font-bold text-[11px] uppercase tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(0,255,163,0.15)]">
                Execute Inst. Position
            </div>
          </button>
        </div>
      </footer>

      {/* Pop-out Modal */}
      <StockDetailsModal 
        symbol={activeSymbol} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

