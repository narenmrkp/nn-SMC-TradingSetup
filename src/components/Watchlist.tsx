/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ChevronRight, ChevronLeft, Clock, AlertCircle } from 'lucide-react';

const WATCHLIST_GROUPS = [1, 2, 3, 4, 5];

interface Props {
  onSelect: (symbol: string) => void;
  activeSymbol: string;
}

export function Watchlist({ onSelect, activeSymbol }: Props) {
  const [activeGroup, setActiveGroup] = useState(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Real-world focused scripts as requested (Sensex, Nifty, BankNifty, High Beta, etc.)
  const [scripts] = useState<Record<number, string[]>>({
    1: [
      'NIFTY 50', 'BANK NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'NIFTY IT', 'NIFTY AUTO',
      'NIFTY FMCG', 'NIFTY METAL', 'NIFTY PHARMA', 'NIFTY PSU BANK', 'NIFTY REALTY', 'NIFTY MEDIA',
      'INDIA VIX', 'NIFTY 100', 'NIFTY 500', 'BANKEX', 'SENSEX 50', 'FIN SERVICE', 'CPSE',
      'NIFTY ENERGY', 'NIFTY INFRA', 'NIFTY PSE', 'NIFTY MIDSML 400', 'NIFTY LARGEMID 250'
    ],
    2: [
      'OFSS', 'DIXON', 'NETWEB', 'DATAPATTERN', 'FORCEMOT', 'POLYCAB', 'BSE', 'APARIND', 
      'MAZDOCK', 'RVNL', 'IRFC', 'HAL', 'BEL', 'RELIANCE', 'HDFCBANK', 'ICICIBANK',
      'TCS', 'INFY', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'LT', 'AXISBANK'
    ],
    3: [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 
      'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'LTCUSDT', 'BCHUSDT', 'UNIUSDT', 'NEARUSDT', 
      'ICPUSDT', 'FILUSDT', 'ARBUSDT', 'APTUSDT', 'OPUSDT', 'STXUSDT', 'RENDERUSDT', 'GRTUSDT', 'RNDRUSDT', 'FETUSDT'
    ],
    4: [
      'XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF',
      'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'NZDUSD', 'EURCAD', 'EURAUD', 
      'GBPAUD', 'GBPCAD', 'CHFJPY', 'CADJPY', 'AUDNZD', 'EURNZD', 'GBPNZD', 'USDSGD', 'USDHKD', 'USDTRY'
    ],
    5: [
      'CRUDEOIL', 'NATGAS', 'SILVER', 'COPPER', 'ZINC', 'ALUMINIUM', 'LEAD', 'NICKEL',
      'GOLDGUINEA', 'MENTHAOIL', 'COTTON', 'RUBBER', 'WHEAT', 'CORN', 'SOYBEAN',
      'SUGAR', 'COFFEE', 'COCOA', 'PLATINUM', 'PALLADIUM', 'COAL', 'IRONORE', 'LITHIUM', 'BRENT', 'HEATINGOIL'
    ]
  });

  // Check if market is open
  const isMarketOpen = (groupIdx: number) => {
    const now = new Date();
    const day = now.getDay(); // 0-6 (Sun-Sat)
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentTime = hours * 100 + mins;

    if (groupIdx <= 2) { // Indian Markets NSE/BSE (9:15 AM - 3:30 PM IST simulated as local)
        return day >= 1 && day <= 5 && currentTime >= 915 && currentTime <= 1530;
    }
    if (groupIdx === 3) return true; // Crypto 24/7
    if (groupIdx === 4) return day >= 1 && day <= 5; // Forex (M-F)
    return true; 
  };

  const getGroupName = (idx: number) => {
    switch(idx) {
        case 1: return 'NIFTY';
        case 2: return 'STOCKS';
        case 3: return 'CRYPTO';
        case 4: return 'FOREX';
        case 5: return 'COMM';
        default: return `WL ${idx}`;
    }
  }

  // Simulate Live Price Updates
  useEffect(() => {
    const interval = setInterval(() => {
        setPrices(prev => {
            const next = {...prev};
            const currentScripts = scripts[activeGroup] || [];
            currentScripts.forEach(s => {
                const base = prev[s] || (Math.random() * 1000 + 100);
                const drift = (Math.random() - 0.5) * (base * 0.0005);
                next[s] = base + drift;
            });
            return next;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeGroup, scripts]);

  const activeScripts = scripts[activeGroup] || [];
  const marketStatus = isMarketOpen(activeGroup);

  return (
    <div className="flex flex-col h-full bg-terminal-surface border-r border-terminal-border font-sans">
      {/* Groups Tabs - Minimal Terminal Style */}
      <div className="flex border-b border-terminal-border bg-black/40">
        {WATCHLIST_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`flex-1 py-4 text-[9px] font-mono font-bold transition-all relative ${
              activeGroup === group
                ? 'text-terminal-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-terminal-accent after:shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                : 'text-terminal-muted hover:text-white'
            }`}
          >
            {getGroupName(group)}
          </button>
        ))}
      </div>

      {/* Market Status Bar */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-[9px] font-mono font-bold uppercase tracking-widest bg-black/60 border-b border-terminal-border/30`}>
        <div className={`flex items-center gap-1.5 ${marketStatus ? 'text-terminal-bull' : 'text-terminal-bear'}`}>
            <div className={`w-1 h-1 rounded-full ${marketStatus ? 'bg-terminal-bull animate-pulse' : 'bg-terminal-bear'}`} />
            <span>MKT: {marketStatus ? 'ACTIVE' : 'HIBERNATED'}</span>
        </div>
        <div className="text-terminal-muted opacity-50 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="tabular-nums">18:05:22 UTC</span>
        </div>
      </div>

      {/* Search - Integrated look */}
      <div className="relative border-b border-terminal-border/30">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-terminal-muted" />
          <input
            type="text"
            placeholder="FILTER ASSETS..."
            className="w-full bg-transparent px-10 py-4 text-[11px] font-mono text-white placeholder:text-terminal-muted/40 focus:outline-none focus:bg-terminal-accent/5 transition-all"
          />
      </div>

      {/* Scripts List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeScripts.map((symbol) => (
            <div
              key={symbol}
              onClick={() => onSelect(symbol)}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer transition-all border-b border-terminal-border/20 relative group ${
                activeSymbol === symbol ? 'bg-terminal-accent/[0.04] border-l border-l-terminal-accent shadow-[inset_4px_0_10px_rgba(0,229,255,0.05)]' : 'hover:bg-terminal-accent/[0.02]'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`text-[13px] font-display font-medium tracking-wide ${activeSymbol === symbol ? 'text-terminal-accent glow-text-accent' : 'text-white group-hover:text-terminal-accent/80'}`}>{symbol}</span>
                <span className="text-[9px] text-terminal-muted/60 font-mono uppercase tracking-widest font-medium">
                  {activeGroup <= 2 ? 'CORE • NSE' : activeGroup === 3 ? 'EXCHANGE' : activeGroup === 4 ? 'LIQUIDITY' : 'GLOBAL'}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-[13px] font-mono font-medium tabular-nums ${activeSymbol === symbol ? 'text-white' : 'text-terminal-muted group-hover:text-white'}`}>
                    {(prices[symbol] || 0).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                      <div className="w-0.5 h-0.5 rounded-full bg-terminal-bull opacity-50 pulse-accent" />
                      <span className="text-[9px] font-mono text-terminal-muted/40 uppercase font-medium">Live Feed</span>
                  </div>
              </div>
            </div>
          ))}
      </div>

      {/* Prop Detail Row */}
      <div className="p-4 bg-black/40 border-t border-terminal-border flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-tighter italic">Alpha Prop Desk V2.4</span>
                <span className="text-[8px] font-mono text-terminal-accent/60 uppercase">Institutional Access Granted</span>
            </div>
            <div className="flex items-center gap-1">
                {[1,2,3,4].map(i => <div key={i} className={`w-1 h-1 rounded-sm ${i <= 3 ? 'bg-terminal-accent/40' : 'bg-terminal-border'}`} />)}
            </div>
      </div>
    </div>
  );
}
