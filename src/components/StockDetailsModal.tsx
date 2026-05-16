/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, TrendingUp, TrendingDown, Clock, BarChart3, Shield, Zap } from 'lucide-react';

interface Props {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StockDetailsModal({ symbol, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
         className="w-full max-w-2xl bg-sleek-sidebar border border-sleek-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sleek-border bg-sleek-header/50">
          <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tighter">{symbol}</span>
              <span className="text-[10px] uppercase font-black text-sleek-aqua tracking-[0.2em]">Asset Intelligence Hub</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-sleek-muted hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Live Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <StatBox label="LTP" value="68,432.10" sub="-12.5 (0.02%)" color="text-sleek-bear" />
                <StatBox label="Volume" value="1.2M" sub="Above Avg" color="text-sleek-aqua" />
                <StatBox label="Open Interest" value="45.1M" sub="+5.2% Today" color="text-sleek-bull" />
            </div>

            {/* Market Depth */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sleek-aqua" />
                    <span className="text-[12px] uppercase font-black text-sleek-muted tracking-widest">Real-Time Market Depth</span>
                </div>
                <div className="grid grid-cols-2 gap-8 p-4 bg-sleek-bg/50 rounded-lg border border-sleek-border/50">
                    <div className="space-y-2">
                         <div className="flex justify-between text-[10px] text-sleek-muted font-black border-b border-sleek-border pb-1">
                            <span>BID PRICE</span>
                            <span>QTY</span>
                         </div>
                         <DepthRow price="68440.5" qty="450" color="text-sleek-bear" total={100} current={45} />
                         <DepthRow price="68438.0" qty="1,200" color="text-sleek-bear" total={100} current={85} />
                         <DepthRow price="68435.2" qty="88" color="text-sleek-bear" total={100} current={10} />
                    </div>
                    <div className="space-y-2">
                         <div className="flex justify-between text-[10px] text-sleek-muted font-black border-b border-sleek-border pb-1">
                            <span>ASK PRICE</span>
                            <span>QTY</span>
                         </div>
                         <DepthRow price="68432.1" qty="210" color="text-sleek-bull" total={100} current={25} />
                         <DepthRow price="68430.5" qty="3,400" color="text-sleek-bull" total={100} current={95} />
                         <DepthRow price="68428.0" qty="150" color="text-sleek-bull" total={100} current={20} />
                    </div>
                </div>
            </div>

            {/* Technical Matrix */}
            <div className="grid grid-cols-2 gap-8">
                {/* Pivot Levels */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sleek-aqua" />
                    <span className="text-[12px] uppercase font-black text-sleek-muted tracking-widest">Pivot Strategy Levels</span>
                  </div>
                  <div className="bg-sleek-header/30 rounded-lg p-4 border border-sleek-border space-y-3">
                    <LevelRow label="Resistance 2" value="68,900.0" color="text-sleek-bear" />
                    <LevelRow label="Resistance 1" value="68,700.0" color="text-sleek-bear" opacity />
                    <LevelRow label="Pivot Point" value="68,400.0" color="text-sleek-aqua" active />
                    <LevelRow label="Support 1" value="68,100.0" color="text-sleek-bull" opacity />
                    <LevelRow label="Support 2" value="67,800.0" color="text-sleek-bull" />
                  </div>
                </div>

                {/* EMAs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sleek-aqua" />
                    <span className="text-[12px] uppercase font-black text-sleek-muted tracking-widest">Moving Averages (EMA)</span>
                  </div>
                  <div className="bg-sleek-header/30 rounded-lg p-4 border border-sleek-border space-y-3">
                    <LevelRow label="EMA 20" value="68,412.5" color="text-white" />
                    <LevelRow label="EMA 50" value="68,380.1" color="text-white" />
                    <LevelRow label="EMA 100" value="68,320.4" color="text-white" />
                    <LevelRow label="EMA 200" value="68,100.9" color="text-white" />
                    <div className="pt-2 border-t border-sleek-border/50 text-[10px] text-sleek-muted font-bold text-center">
                        BULLISH TREND IDENTIFIED
                    </div>
                  </div>
                </div>
            </div>

            {/* Option Chain */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sleek-aqua" />
                    <span className="text-[12px] uppercase font-black text-sleek-muted tracking-widest">Institutional Option Chain Summary</span>
                </div>
                <div className="bg-sleek-header rounded-xl border border-sleek-border overflow-hidden">
                    <div className="grid grid-cols-3 text-[10px] font-black uppercase tracking-widest bg-sleek-aqua/10 text-sleek-aqua p-3 text-center">
                        <span>Calls (OI)</span>
                        <span>Strike Price</span>
                        <span>Puts (OI)</span>
                    </div>
                    <div className="divide-y divide-sleek-border/50">
                         <ChainRow calls="1.2M" strike="68,000" puts="14.5M" pcr="12.0" />
                         <ChainRow calls="8.4M" strike="68,500" puts="2.1M" pcr="0.25" active />
                         <ChainRow calls="15.2M" strike="69,000" puts="0.8M" pcr="0.05" />
                    </div>
                </div>
            </div>
          </div>

          {/* Footer Footer */}
          <div className="p-4 bg-sleek-aqua/5 border-t border-sleek-border flex justify-between items-center text-[11px] text-sleek-muted font-bold">
            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Last Synced: {new Date().toLocaleTimeString()}</span>
            <span className="text-sleek-aqua">NSE • LIVE FEED ACTIVE</span>
          </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
    return (
        <div className="bg-sleek-header/50 border border-sleek-border p-4 rounded-lg flex flex-col items-center">
            <span className="text-[10px] uppercase font-black text-sleek-muted tracking-widest mb-1">{label}</span>
            <span className="text-xl font-black text-white">{value}</span>
            <span className={`text-[10px] font-bold ${color}`}>{sub}</span>
        </div>
    )
}

function DepthRow({ price, qty, color, total, current }: { price: string; qty: string; color: string; total: number; current: number }) {
    return (
        <div className="relative h-8 flex items-center justify-between px-3 overflow-hidden rounded bg-white/[0.02]">
            <div 
                className={`absolute inset-0 opacity-10 ${color === 'text-sleek-bull' ? 'bg-sleek-bull' : 'bg-sleek-bear'}`}
                style={{ width: `${(current/total) * 100}%` }}
            />
            <span className={`relative text-[12px] font-black ${color}`}>{price}</span>
            <span className="relative text-[11px] font-mono text-gray-300">{qty}</span>
        </div>
    )
}

function LevelRow({ label, value, color, active, opacity }: { label: string; value: string; color: string; active?: boolean; opacity?: boolean }) {
    return (
        <div className={`flex justify-between items-center px-3 py-2 rounded ${active ? 'bg-sleek-aqua/10 border border-sleek-aqua/30' : ''} ${opacity ? 'opacity-60' : ''}`}>
            <span className="text-[11px] font-bold text-gray-400 capitalize">{label}</span>
            <span className={`text-[13px] font-black font-mono ${active ? 'text-sleek-aqua' : color}`}>{value}</span>
        </div>
    )
}

function ChainRow({ calls, strike, puts, pcr, active }: { calls: string; strike: string; puts: string; pcr: string; active?: boolean }) {
    return (
        <div className={`grid grid-cols-3 p-3 text-center items-center ${active ? 'bg-white/5' : ''}`}>
            <span className="text-[12px] font-bold text-sleek-bear">{calls}</span>
            <div className="flex flex-col">
                <span className="text-[14px] font-black text-white">{strike}</span>
                <span className="text-[9px] text-sleek-muted font-black">PCR: {pcr}</span>
            </div>
            <span className="text-[12px] font-bold text-sleek-bull">{puts}</span>
        </div>
    )
}
