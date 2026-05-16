/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SignalResponse } from '../types';
import { motion } from 'motion/react';
import { Target, ShieldAlert, Cpu, Zap, Activity, Info } from 'lucide-react';

interface Props {
  data: SignalResponse | null;
  activeSymbol: string;
}

export function InstitutionalDashboard({ data, activeSymbol }: Props) {
  if (!data) return null;

  const biasColor = data.marketBias === 'BULLISH' ? 'text-terminal-bull' : 'text-terminal-bear';
  const biasGlow = data.marketBias === 'BULLISH' ? 'glow-text-bull' : 'glow-text-bear';

  return (
    <div className="flex flex-col h-full bg-terminal-surface border-l border-terminal-border">
      {/* 1. MARKET BIAS - THE DOMINANT HIERARCHY START */}
      <div className="p-6 border-b border-terminal-border/50">
        <span className="text-xs-mono text-terminal-muted mb-4 block">Institutional Bias</span>
        <div className="flex flex-col gap-1">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className={`text-4xl font-display font-bold ${biasColor} ${biasGlow} tracking-tight`}
            >
                {data.marketBias}
            </motion.div>
            <div className="flex items-center gap-2">
                <div className={`h-1 w-1 rounded-full animate-pulse ${data.marketBias === 'BULLISH' ? 'bg-terminal-bull' : 'bg-terminal-bear'}`}></div>
                <span className="text-[10px] font-mono text-terminal-muted uppercase tracking-[0.2em]">Live Neural Sentiment</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8 pb-12">
        
        {/* 2. SIGNAL QUALITY & CONFIDENCE - THE CORE INTELLIGENCE */}
        <div className="grid grid-cols-2 gap-4">
            {/* A+ BADGE AREA */}
            <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">Quality</span>
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className={`relative h-20 w-full flex items-center justify-center border ${data.grade === 'A+' ? 'border-terminal-accent shadow-[0_0_20px_rgba(0,229,255,0.1)] bg-terminal-accent/5' : 'border-terminal-border'} transition-all`}
                >
                    <span className={`text-4xl font-display font-black ${data.grade === 'A+' ? 'text-terminal-accent glow-text-accent' : 'text-white'}`}>
                        {data.grade}
                    </span>
                    {data.grade === 'A+' && (
                        <motion.div 
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-terminal-accent/5" 
                        />
                    )}
                </motion.div>
            </div>

            {/* CONFIDENCE RING */}
            <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase font-bold text-terminal-muted tracking-widest">Confidence</span>
                <div className="relative h-20 w-full flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            className="text-terminal-border"
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            strokeDasharray="176"
                            initial={{ strokeDashoffset: 176 }}
                            animate={{ strokeDashoffset: 176 - (176 * parseInt(data.confidence)) / 100 }}
                            className="text-terminal-accent"
                            style={{ strokeLinecap: 'round' }}
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] font-mono font-bold text-white">
                        {data.confidence}
                    </span>
                </div>
            </div>
        </div>

        {/* 3. EXECUTION PARAMETERS - HEDGE FUND STYLE */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-3.5 h-3.5 text-terminal-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Execution Engine</span>
                <div className="flex-1 h-[1px] bg-terminal-border"></div>
            </div>

            <div className="space-y-1">
                <ExecutionRow label="Institutional Entry" value={data?.setup?.entry?.toFixed(2)} active />
                <ExecutionRow label="Protective SL" value={data?.setup?.sl?.toFixed(2)} color="text-terminal-bear" />
                <ExecutionRow label="Target Objective" value={data?.setup?.tp1?.toFixed(2)} color="text-terminal-bull" />
                <ExecutionRow label="Risk Ratio" value={`1 : ${data?.setup?.rr?.toFixed(2)}`} accent />
            </div>
        </div>

        {/* 4. ALPHA BREAKDOWN - DECISION HIERARCHY */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-3.5 h-3.5 text-terminal-accent" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Decision Factors</span>
                <div className="flex-1 h-[1px] bg-terminal-border"></div>
            </div>

            <div className="space-y-2">
                <FactorRow label="Order Flow Alignment" score={data?.breakdown?.trend} max={20} />
                <FactorRow label="Liquidity Engineering" score={data?.breakdown?.liquidity} max={20} />
                <FactorRow label="Structural Shift" score={data?.breakdown?.structure} max={20} />
                <FactorRow label="Displacement (Fair Value)" score={data?.breakdown?.displacement} max={15} />
                <FactorRow label="Volume Anomalies" score={data?.breakdown?.volume} max={10} />
            </div>
        </div>

        {/* 5. SYSTEM STATUS */}
        <div className="mt-8 pt-8 border-t border-terminal-border/30">
            <div className="bg-black/40 p-4 border border-terminal-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-terminal-muted uppercase">Terminal Status</span>
                    <span className="text-[9px] font-mono text-terminal-bull uppercase flex items-center gap-1">
                        <div className="w-1 h-1 bg-terminal-bull rounded-full" /> Operational
                    </span>
                </div>
                <p className="text-[11px] text-terminal-muted leading-relaxed">
                    Alpha-Link Neural Engine processing real-time SMC structures for {activeSymbol}. Probability calculated via multi-timeframe liquidity sweeps.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function ExecutionRow({ label, value, active, color, accent }: { 
    label: string, 
    value: string | undefined, 
    active?: boolean,
    color?: string,
    accent?: boolean
}) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-none border-b border-terminal-border/30 transition-all hover:bg-terminal-accent/5 group ${active ? 'bg-terminal-accent/[0.03] border-l-2 border-l-terminal-accent' : ''}`}>
      <span className="text-[11px] text-terminal-muted uppercase font-medium">{label}</span>
      <span className={`font-mono text-sm font-bold ${color || (accent ? 'text-terminal-accent' : 'text-white')}`}>
        {value || '--'}
      </span>
    </div>
  );
}

function FactorRow({ label, score, max }: { label: string, score: number, max: number }) {
  const percentage = (score / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[11px] text-terminal-muted/80">{label}</span>
        <span className="text-[10px] font-mono text-terminal-bull">{score}/{max}</span>
      </div>
      <div className="h-1 w-full bg-terminal-border rounded-full overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-full ${percentage > 70 ? 'bg-terminal-bull' : percentage > 40 ? 'bg-terminal-accent' : 'bg-terminal-muted'}`}
        />
      </div>
    </div>
  );
}
