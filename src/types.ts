/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candle {
  time: number | string; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FVG {
  top: number;
  bottom: number;
  startTime: number;
  endTime?: number;
  type: 'bull' | 'bear';
}

export interface Structure {
  time: number;
  price: number;
  type: 'BOS' | 'CHOCH';
  direction: 'bull' | 'bear';
}

export interface ScoreBreakdown {
  trend: number;
  liquidity: number;
  structure: number;
  displacement: number;
  fvgRetest: number;
  volume: number;
}

export interface TradeSetup {
  direction: 'BUY' | 'SELL' | 'WAIT';
  entry: number | null;
  sl: number | null;
  tp1: number | null;
  tp2: number | null;
  rr: number | null;
}

export interface OB {
  price: number;
  type: 'bull' | 'bear';
  time: number;
}

export interface SignalResponse {
  candles: Candle[];
  fvgs: FVG[];
  obs: OB[];
  structures: Structure[];
  score: number;
  grade: 'A+' | 'A' | 'B' | 'WEAK';
  breakdown: ScoreBreakdown;
  setup: TradeSetup;
  confidence: string;
  marketBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  pdh: number | null;
  pdl: number | null;
  emaFast: number[];
  emaSlow: number[];
  ema100: number[];
  ema200: number[];
  vwap: number[];
}
