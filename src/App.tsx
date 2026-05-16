/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
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

  const fetchData = async () => {
    try {
      const res = await fetch('/api/signals');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      if (!json || typeof json !== 'object' || !json.candles) {
        throw new Error('Invalid data format received from API');
      }
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSymbolSelect = (symbol: string) => {
    setActiveSymbol(symbol);
    setIsModalOpen(true); // Open details modal on click as requested
  };

  if (loading && !data) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#00ffff] font-mono">
          <div className="w-12 h-12 border-4 border-[#00ffff] border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse tracking-widest text-xs uppercase">Initializing Alpha Link Engine...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="bg-red-950/20 border border-red-500/50 p-8 rounded-lg max-w-md text-center">
          <span className="text-red-500 font-black uppercase tracking-widest block mb-4">Neural Link Failure</span>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="px-6 py-2 bg-red-500 text-black font-black uppercase text-xs tracking-widest rounded hover:bg-red-400 transition-colors"
          >
            Re-Initialize
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-sleek-bg text-[#E0E0E0] flex flex-col overflow-hidden select-none font-sans">
      {/* Header */}
      <header className="h-[60px] bg-sleek-header border-b border-sleek-border flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <span className="text-sleek-aqua font-black text-2xl tracking-tighter uppercase">NN-SMC</span>
            <span className="text-[#FF00FF] font-black text-xs ml-1 opacity-80 uppercase tracking-widest bg-[#FF00FF]/10 px-2 py-0.5 rounded">Inst. Pro++</span>
          </div>
          
          <div className="h-4 w-[1px] bg-sleek-border mx-2"></div>
          
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
              <span className="text-sleek-muted text-[12px] font-extrabold uppercase tracking-widest leading-none mb-1">Active Asset</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight">{activeSymbol}</span>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 rounded bg-sleek-aqua/10 text-sleek-aqua hover:bg-sleek-aqua/20 transition-all border border-sleek-aqua/20"
                >
                  <Activity className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setHistoryCollapsed(!historyCollapsed)}
            className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
              !historyCollapsed ? 'bg-sleek-aqua text-black border-sleek-aqua shadow-[0_0_15px_rgba(38,255,138,0.3)]' : 'bg-transparent border-sleek-border text-sleek-muted hover:border-sleek-aqua hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[12px] font-black uppercase tracking-wider">Signals History</span>
          </button>

          <div className={`status-pill ${data?.marketBias === 'BULLISH' ? 'pill-bull' : 'pill-bear'}`}>
            Bias: {data?.marketBias}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Watchlist */}
        <div 
          style={{ width: watchlistCollapsed ? 0 : 320 }}
          className="bg-sleek-sidebar border-r border-sleek-border flex flex-col shrink-0 overflow-hidden relative transition-all duration-300"
        >
          <Watchlist onSelect={handleSymbolSelect} activeSymbol={activeSymbol} />
        </div>

        {/* Trade History Sidebar */}
        <div 
          style={{ width: historyCollapsed ? 0 : 300 }}
          className="bg-sleek-sidebar border-r border-sleek-border flex flex-col shrink-0 overflow-hidden transition-all duration-300"
        >
          <TradeHistory />
        </div>

        {/* Center: Chart Area */}
        <div className="flex-1 flex flex-col relative bg-sleek-bg overflow-hidden border-r border-sleek-border">
          {/* Internal Side Toolbar */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
             <div className="bg-sleek-sidebar/90 p-1 rounded border border-sleek-border flex flex-col gap-1 shadow-2xl backdrop-blur-md">
                <button 
                  onClick={() => setWatchlistCollapsed(!watchlistCollapsed)}
                  className={`p-2 rounded transition-colors ${!watchlistCollapsed ? 'bg-sleek-aqua/20 text-sleek-aqua' : 'text-sleek-muted hover:text-white'}`}
                  title="Toggle Watchlist"
                >
                  <Menu className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
             <button 
               onClick={() => setFooterCollapsed(!footerCollapsed)}
               className="bg-sleek-sidebar/80 p-2 rounded border border-sleek-border text-sleek-muted hover:text-white shadow-lg backdrop-blur-sm"
               title="Toggle Confidence"
             >
               {footerCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
             </button>
             <button 
               onClick={() => setDashboardCollapsed(!dashboardCollapsed)}
               className="bg-sleek-sidebar/80 p-2 rounded border border-sleek-border text-sleek-muted hover:text-white shadow-lg backdrop-blur-sm"
               title="Toggle Intelligence"
             >
               {dashboardCollapsed ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
             </button>
          </div>

          <div className="flex-1 w-full h-full">
            <TradingChart data={data} symbol={activeSymbol} />
          </div>
        </div>

        {/* Right Sidebar: Stats Dashboard */}
        <div 
          style={{ width: dashboardCollapsed ? 0 : 320 }}
          className="shrink-0 bg-sleek-sidebar h-full overflow-y-auto scrollbar-hide relative transition-all duration-300"
        >
          <InstitutionalDashboard data={data} activeSymbol={activeSymbol} />
        </div>
      </main>

      {/* Confidence Footer */}
      <footer 
        style={{ height: footerCollapsed ? 0 : 80 }}
        className="bg-sleek-header border-t border-sleek-border flex items-center px-6 gap-8 z-30 shrink-0 overflow-hidden relative transition-all duration-300"
      >
        <div className="flex flex-col w-48 text-sleek-aqua">
          <span className="text-sleek-muted text-[10px] font-extrabold uppercase tracking-widest mb-2">Alpha Precision Engine</span>
          <div className="h-1.5 w-full bg-sleek-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-sleek-aqua transition-all duration-500"
              style={{ width: data?.confidence || '0%' }}
            />
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{data?.confidence || '0%'}</span>
          <span className="text-sleek-muted text-[10px] font-bold uppercase tracking-wider">Confidence Level</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button className="bg-sleek-bull text-black px-12 py-3 rounded font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(38,255,138,0.2)]">
            Institutional Entry
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

