/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SignalResponse } from '../types';
import { TrendingUp, TrendingDown, Zap, BarChart3, Target, ShieldAlert, Cpu } from 'lucide-react';

interface Props {
  data: SignalResponse | null;
  activeSymbol: string;
}

export function InstitutionalDashboard({ data, activeSymbol }: Props) {
  if (!data) return null;

  return (
    <div className="flex flex-col p-4 gap-6 text-sm font-sans leading-relaxed h-full overflow-y-auto scrollbar-hide pb-20">
      <div className="flex items-center justify-between">
        <span className="text-[12px] uppercase text-sleek-muted tracking-[0.2em] font-extrabold">Institutional Sentiment</span>
        <span className="text-[10px] font-black text-sleek-aqua border border-sleek-aqua/30 px-2 py-0.5 rounded">{activeSymbol}</span>
      </div>

      {/* Signal Quality Card */}
      <div className="bg-sleek-aqua/5 border border-sleek-aqua/20 p-5 rounded-lg shadow-inner">
        <label className="text-sleek-muted text-[10px] uppercase tracking-widest mb-2 block font-bold">SMC Confirmation Score</label>
        <div className="flex justify-between items-end">
          <div 
             className="text-4xl font-black text-sleek-bull leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(38,255,138,0.4)] transition-all"
          >
            {data.grade}
          </div>
          <div className="text-lg font-bold text-sleek-bull opacity-90">{data.score} / 100</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase text-sleek-muted tracking-[0.2em] font-extrabold mb-2 block">Alpha Factors</span>
        <BreakdownRow label="Trend Alignment" score={data?.breakdown?.trend ?? 0} max={20} />
        <BreakdownRow label="Liquidity Sweep" score={data?.breakdown?.liquidity ?? 0} max={20} />
        <BreakdownRow label="Structure (CHOCH)" score={data?.breakdown?.structure ?? 0} max={20} />
        <BreakdownRow label="Displacement" score={data?.breakdown?.displacement ?? 0} max={15} />
        <BreakdownRow label="FVG (Retest)" score={data?.breakdown?.fvgRetest ?? 0} max={15} />
        <BreakdownRow label="Volume Profile" score={data?.breakdown?.volume ?? 0} max={10} />
      </div>

      {/* Trade Parameters Section */}
      <div className="flex flex-col gap-4 border-t border-sleek-border pt-6">
        <span className="text-[12px] uppercase text-white tracking-[0.2em] font-extrabold underline underline-offset-8 decoration-sleek-aqua/30">Execution Logic</span>
        <div className="space-y-0.5 mt-2">
          <SetupRow label="Signal Direction" value={data?.setup?.direction ?? 'WAIT'} color={data?.setup?.direction === 'BUY' ? 'text-sleek-bull' : 'text-sleek-bear'} />
          <SetupRow label="Institutional Entry" value={data?.setup?.entry?.toFixed(2) || '-'} color="text-sleek-aqua" />
          <SetupRow label="Safety Stop (SL)" value={data?.setup?.sl?.toFixed(2) || '-'} color="text-sleek-bear" />
          <SetupRow label="Primary Target (T1)" value={data?.setup?.tp1?.toFixed(2) || '-'} color="text-sleek-bull" />
          <SetupRow label="Risk / Reward" value={`1 : ${data?.setup?.rr?.toFixed(2) || '-'}`} color="text-sleek-aqua" />
        </div>
      </div>

      {/* Bias Meter */}
      <div className="mt-4 p-4 bg-sleek-header/50 border border-sleek-border rounded-lg relative overflow-hidden">
        <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-sleek-muted uppercase">Market Bias</span>
            <span className="text-[14px] font-black text-sleek-bull">{data.score > 50 ? 'STRONGLY BULLISH' : 'NEUTRAL'}</span>
        </div>
        <div 
          className="absolute top-0 left-0 h-1 bg-sleek-bull transition-all duration-1000"
          style={{ width: `${data.score}%` }}
        ></div>
      </div>
    </div>
  );
}


function DepthRow({ price, size, color }: { price: string; size: string; color: string }) {
    return (
        <div className="flex justify-between px-2 py-1 bg-white/[0.02] rounded">
            <span className={`${color} font-bold`}>{price}</span>
            <span className="text-gray-500">{size}</span>
        </div>
    )
}

function KpiBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-sleek-header/50 border border-sleek-border p-2 rounded flex flex-col">
            <span className="text-[9px] text-sleek-muted font-black uppercase text-center">{label}</span>
            <span className="text-[12px] font-mono font-bold text-center text-white">{value}</span>
        </div>
    )
}

function Level({ label, val, color }: { label: string; val: string; color: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[8px] text-sleek-muted font-black">{label}</span>
            <span className={`text-[11px] font-black ${color}`}>{val}</span>
        </div>
    )
}

function ChainRow({ calls, strike, puts, highlight }: { calls: string; strike: string; puts: string; highlight?: boolean }) {
    return (
        <div className={`flex justify-between items-center text-[11px] px-2 py-1 rounded ${highlight ? 'bg-sleek-aqua/10 border border-sleek-aqua/20 shadow-glow-sm' : ''}`}>
            <span className="text-sleek-bear font-bold">{calls}</span>
            <span className="font-black text-white">{strike}</span>
            <span className="text-sleek-bull font-bold">{puts}</span>
        </div>
    )
}

function BreakdownRow({ label, score, max }: { label: string; score: number; max: number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-sleek-border/50 text-[15px]">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className={score > 0 ? "text-sleek-bull font-black" : "text-gray-700"}>
        {score}/{max}
      </span>
    </div>
  );
}

function SetupRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-sleek-border/50 text-[15px]">
      <span className="text-gray-200 font-medium">{label}</span>
      <span className={`${color} font-black uppercase`}>{value}</span>
    </div>
  );
}

function TrendUp(props: any) {
  return <TrendingUp {...props} />;
}

function TrendDown(props: any) {
  return <TrendingDown {...props} />;
}
