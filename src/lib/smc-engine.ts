/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Candle, FVG, Structure, ScoreBreakdown, TradeSetup, SignalResponse } from '../types';

export class SMCEngine {
  static calculateEMA(data: number[], length: number): number[] {
    const ema: number[] = [];
    if (data.length === 0) return ema;
    
    let prevEMA = data[0];
    const k = 2 / (length + 1);
    
    for (let i = 0; i < data.length; i++) {
      const val = data[i] * k + prevEMA * (1 - k);
      ema.push(val);
      prevEMA = val;
    }
    return ema;
  }

  static calculateVWAP(candles: Candle[]): number[] {
    let cumVolPrice = 0;
    let cumVol = 0;
    const vwap: number[] = [];
    
    for (const c of candles) {
      const tp = (c.high + c.low + c.close) / 3;
      cumVolPrice += tp * c.volume;
      cumVol += c.volume;
      vwap.push(cumVolPrice / cumVol);
    }
    return vwap;
  }

  static calculateATR(candles: Candle[], length: number = 14): number[] {
    const tr: number[] = [];
    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        tr.push(candles[i].high - candles[i].low);
      } else {
        const h_l = candles[i].high - candles[i].low;
        const h_pc = Math.abs(candles[i].high - candles[i-1].close);
        const l_pc = Math.abs(candles[i].low - candles[i-1].close);
        tr.push(Math.max(h_l, h_pc, l_pc));
      }
    }
    
    const atr: number[] = [];
    let sum = 0;
    for (let i = 0; i < tr.length; i++) {
      sum += tr[i];
      if (i >= length) sum -= tr[i - length];
      
      if (i >= length - 1) {
        if (i === length - 1) {
          atr.push(sum / length);
        } else {
          atr.push((atr[atr.length - 1] * (length - 1) + tr[i]) / length);
        }
      } else {
        atr.push(NaN);
      }
    }
    // Pad start
    while(atr.length < candles.length) atr.unshift(NaN);
    return atr;
  }

  static analyze(candles: Candle[]): SignalResponse {
    const closes = candles.map(c => c.close);
    const opens = candles.map(c => c.open);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);
    
    const emaFast = this.calculateEMA(closes, 20);
    const emaSlow = this.calculateEMA(closes, 50);
    const ema100 = this.calculateEMA(closes, 100);
    const ema200 = this.calculateEMA(closes, 200);
    const vwap = this.calculateVWAP(candles);
    const atr = this.calculateATR(candles);
    
    const lastIdx = candles.length - 1;
    const currentClose = closes[lastIdx];
    const currentHigh = highs[lastIdx];
    const currentLow = lows[lastIdx];
    const currentVol = volumes[lastIdx];
    
    // Trend
    const bullTrend = currentClose > emaFast[lastIdx] && emaFast[lastIdx] > emaSlow[lastIdx] && currentClose > vwap[lastIdx];
    const bearTrend = currentClose < emaFast[lastIdx] && emaFast[lastIdx] < emaSlow[lastIdx] && currentClose < vwap[lastIdx];
    const marketBias = bullTrend ? 'BULLISH' : bearTrend ? 'BEARISH' : 'NEUTRAL';

    // Market Structure (Simplified for this turn)
    // In real app we would scan for pivot points. 
    // Let's implement a simple pivot high/low detection.
    const structures: Structure[] = [];
    const swingLen = 6;
    for (let i = swingLen; i < lastIdx - swingLen; i++) {
        let isPH = true;
        let isPL = true;
        for (let j = -swingLen; j <= swingLen; j++) {
            if (j === 0) continue;
            if (highs[i + j] >= highs[i]) isPH = false;
            if (lows[i + j] <= lows[i]) isPL = false;
        }
        if (isPH) structures.push({ time: Number(candles[i].time), price: highs[i], type: 'BOS', direction: 'bull' });
        if (isPL) structures.push({ time: Number(candles[i].time), price: lows[i], type: 'BOS', direction: 'bear' });
    }
    
    // FVG
    const fvgs: FVG[] = [];
    for (let i = 2; i <= lastIdx; i++) {
        if (lows[i] > highs[i-2]) {
            fvgs.push({ top: lows[i], bottom: highs[i-2], startTime: Number(candles[i-1].time), type: 'bull' });
        } else if (highs[i] < lows[i-2]) {
            fvgs.push({ top: lows[i-2], bottom: highs[i], startTime: Number(candles[i-1].time), type: 'bear' });
        }
    }
    const lastFVG = fvgs[fvgs.length - 1];

    // Order Blocks (OB)
    const obs: any[] = [];
    for (let i = 2; i < lastIdx; i++) {
        // Bullish OB: Last down candle before an upward move that breaks structure
        if (closes[i] > highs[i-1] && closes[i-1] < opens[i-1]) {
            obs.push({ price: lows[i-1], type: 'bull', time: Number(candles[i-1].time) });
        }
        // Bearish OB: Last up candle before a downward move that breaks structure
        if (closes[i] < lows[i-1] && closes[i-1] > opens[i-1]) {
            obs.push({ price: highs[i-1], type: 'bear', time: Number(candles[i-1].time) });
        }
    }

    // Score Calculations
    let bullScore = 0;
    let bearScore = 0;
    
    if (bullTrend) bullScore += 20;
    if (bearTrend) bearScore += 20;
    
    // CHOCH Detection (Simplification: if we broke last swing high/low with trend change)
    const bullCHOCH = bullTrend && structures.some(s => s.direction === 'bear' && currentClose > s.price);
    const bearCHOCH = bearTrend && structures.some(s => s.direction === 'bull' && currentClose < s.price);
    
    if (bullCHOCH) bullScore += 20;
    if (bearCHOCH) bearScore += 20;
    
    // Displacement (Body Size)
    const bodySize = Math.abs(candles[lastIdx].close - candles[lastIdx].open);
    const avgBody = closes.slice(-20).reduce((a, b, i) => a + Math.abs(b - candles[lastIdx - 20 + i]?.open || 0), 0) / 20;
    const displacement = bodySize > avgBody * 1.8;
    
    if (displacement && candles[lastIdx].close > candles[lastIdx].open) bullScore += 15;
    if (displacement && candles[lastIdx].close < candles[lastIdx].open) bearScore += 15;
    
    // FVG Retest
    const bullRetest = lastFVG?.type === 'bull' && currentLow <= lastFVG.top && currentLow >= lastFVG.bottom;
    const bearRetest = lastFVG?.type === 'bear' && currentHigh >= lastFVG.bottom && currentHigh <= lastFVG.top;
    
    if (bullRetest) bullScore += 15;
    if (bearRetest) bearScore += 15;
    
    // Volume
    const volMA = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volSpike = currentVol > volMA * 1.3;
    
    if (volSpike) {
        bullScore += 10;
        bearScore += 10;
    }

    const finalScore = Math.max(bullScore, bearScore);
    const grade = finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 65 ? 'B' : 'WEAK';
    const confidence = finalScore >= 90 && volSpike ? "95%" : finalScore >= 85 ? "90%" : finalScore >= 80 ? "85%" : finalScore >= 75 ? "75%" : "40%";

    // Breakdown
    const breakdown: ScoreBreakdown = {
        trend: bullTrend || bearTrend ? 20 : 0,
        liquidity: 0, // Simplified
        structure: bullCHOCH || bearCHOCH ? 20 : 0,
        displacement: displacement ? 15 : 0,
        fvgRetest: bullRetest || bearRetest ? 15 : 0,
        volume: volSpike ? 10 : 0
    };

    // Trade Setup
    const setup: TradeSetup = {
        direction: bullScore >= 80 ? 'BUY' : bearScore >= 80 ? 'SELL' : 'WAIT',
        entry: currentClose,
        sl: bullScore >= 80 ? currentLow - (atr[lastIdx] || 0) : currentHigh + (atr[lastIdx] || 0),
        tp1: 0,
        tp2: 0,
        rr: 0
    };
    
    if (setup.direction === 'BUY' && setup.sl) {
        const risk = setup.entry! - setup.sl;
        setup.tp1 = setup.entry! + risk * 1.5;
        setup.tp2 = setup.entry! + risk * 2.5;
        setup.rr = (setup.tp2 - setup.entry!) / risk;
    } else if (setup.direction === 'SELL' && setup.sl) {
        const risk = setup.sl - setup.entry!;
        setup.tp1 = setup.entry! - risk * 1.5;
        setup.tp2 = setup.entry! - risk * 2.5;
        setup.rr = (setup.entry! - setup.tp2) / risk;
    }

    return {
        candles,
        fvgs,
        obs,
        structures,
        score: finalScore,
        grade,
        breakdown,
        setup,
        confidence,
        marketBias,
        pdh: Math.max(...highs.slice(-100, -1)), // Simplified
        pdl: Math.min(...lows.slice(-100, -1)), // Simplified
        emaFast,
        emaSlow,
        ema100,
        ema200,
        vwap
    };
  }

  static generateMockData(count: number = 200): Candle[] {
    const candles: Candle[] = [];
    const basePrice = 68000;
    const now = Math.floor(Date.now() / 60000) * 60; // Start of current minute
    let time = now - count * 60;
    
    // Deterministic random using a simple LCG-like function based on time
    const seededRandom = (t: number) => {
        const x = Math.sin(t) * 10000;
        return x - Math.floor(x);
    };

    let prevClose = basePrice;
    
    for (let i = 0; i < count; i++) {
        const t = time;
        // Use a function that drifts but is stable for a given 't'
        const seed = seededRandom(t / 3600); // stable for hour
        const noise = seededRandom(t) - 0.49;
        
        const open = prevClose;
        const change = noise * 40; 
        const close = open + change;
        const high = Math.max(open, close) + seededRandom(t + 1) * 15;
        const low = Math.min(open, close) - seededRandom(t + 2) * 15;
        const volume = seededRandom(t + 3) * 1000 + 500;
        
        candles.push({ time, open, high, low, close, volume });
        
        prevClose = close;
        time += 60;
    }
    return candles;
  }
}
