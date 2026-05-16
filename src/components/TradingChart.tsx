/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, UTCTimestamp, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { SignalResponse } from '../types';
import { 
  BarChart2, 
  Clock, 
  Settings, 
  Layers, 
  Pencil, 
  Type, 
  Square, 
  Maximize2, 
  TrendingUp as TrendingIcon,
  Activity,
  Box,
  Eraser,
  Crosshair,
  ChevronDown
} from 'lucide-react';

interface Props {
  data: SignalResponse | null;
  symbol: string;
}

type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1mo';
type CandleType = 'Candle' | 'Heiken Ashi';

export function TradingChart({ data, symbol }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorsRef = useRef<Record<string, ISeriesApi<'Line' | 'Area'>>>({});

  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('5m');
  const [candleType, setCandleType] = useState<CandleType>('Candle');
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>('Crosshair');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['EMA 20', 'EMA 50', 'Volume']);

  const timeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '1d', '1w', '1mo'];
  const indicatorList = ['EMA 20', 'EMA 50', 'EMA 100', 'EMA 200', 'VWAP', 'Bollinger Bands', 'Volume', 'RSI', 'MACD'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#020205' },
        textColor: '#525266',
        fontSize: 10,
        fontFamily: 'JetBrains Mono',
      },
      grid: {
        vertLines: { color: '#0A0A12' },
        horzLines: { color: '#0A0A12' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#00E5FF', width: 1, style: 2, labelBackgroundColor: '#00E5FF' },
        horzLine: { color: '#00E5FF', width: 1, style: 2, labelBackgroundColor: '#00E5FF' },
      },
      timeScale: {
        borderColor: '#14141A',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#14141A',
        scaleMargins: { top: 0.1, bottom: 0.3 },
      },
      handleScroll: true,
      handleScale: true,
    });

    // Use a more robust series creation
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00FFA3',
      downColor: '#FF2E5B',
      borderVisible: false,
      wickUpColor: '#00FFA3',
      wickDownColor: '#FF2E5B',
    });

    const vSeries = chart.addSeries(HistogramSeries, {
        color: '#26FF8A33',
        priceFormat: { type: 'volume' },
        priceScaleId: '', 
    });
    
    if (vSeries) {
        vSeries.priceScale().applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        });
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    volumeRef.current = vSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = chartContainerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          chartRef.current.resize(width, height);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(chartContainerRef.current);
    handleResize();

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !seriesRef.current || !data || !data.candles || data.candles.length === 0) return;
    
    try {
        // Clear old indicators safely
        if (indicatorsRef.current) {
            Object.values(indicatorsRef.current).forEach(s => {
                try {
                    if (chartRef.current) chartRef.current.removeSeries(s);
                } catch (e) {
                    console.warn('Failed to remove series', e);
                }
            });
            indicatorsRef.current = {};
        }

        const distinctTimes = new Set<number>();
        let processedCandles = data.candles
            .filter(c => c && c.time !== undefined && c.time !== null)
            .map(c => ({
                time: Math.floor(Number(c.time)) as UTCTimestamp,
                open: Number(c.open),
                high: Number(c.high),
                low: Number(c.low),
                close: Number(c.close),
            }))
            .filter(c => {
                if (isNaN(c.time) || isNaN(c.open) || isNaN(c.high) || isNaN(c.low) || isNaN(c.close)) return false;
                if (distinctTimes.has(c.time as number)) return false;
                distinctTimes.add(c.time as number);
                return true;
            })
            .sort((a, b) => (a.time as number) - (b.time as number));

        if (processedCandles.length === 0) return;

        // Heiken Ashi Transform
        if (candleType === 'Heiken Ashi') {
            const ha: any[] = [];
            processedCandles.forEach((c, i) => {
                if (i === 0) {
                    ha.push(c);
                } else {
                    const prevHa = ha[i-1];
                    const haOpen = (prevHa.open + prevHa.close) / 2;
                    const haClose = (c.open + c.high + c.low + c.close) / 4;
                    const haHigh = Math.max(c.high, haOpen, haClose);
                    const haLow = Math.min(c.low, haOpen, haClose);
                    ha.push({ time: c.time, open: haOpen, high: haHigh, low: haLow, close: haClose });
                }
            });
            processedCandles = ha;
        }

        if (seriesRef.current) {
            seriesRef.current.setData(processedCandles);
        }

        // Indicator Lines helper
        const safeAddLineSeries = (options: any) => {
            if (!chartRef.current) return null;
            try {
                return chartRef.current.addSeries(LineSeries, options);
            } catch (e) {
                return null;
            }
        };

        const addIndicator = (name: string, indicatorDataArray: number[], color: string, style: number = 0) => {
            if (activeIndicators.includes(name) && indicatorDataArray) {
                const series = safeAddLineSeries({ color, lineWidth: 1, priceLineVisible: false, lineStyle: style });
                if (series) {
                    const indicatorData = data.candles.map((c, i) => ({ 
                        time: Math.floor(Number(c.time)) as UTCTimestamp, 
                        value: Number(indicatorDataArray[i]) 
                    }))
                    .filter((d: any) => !isNaN(d.time) && isFinite(d.value));
                    
                    if (indicatorData.length > 0) {
                        series.setData(indicatorData);
                        indicatorsRef.current[name] = series;
                    }
                }
            }
        };

        addIndicator('EMA 20', data.emaFast, '#00E0FF');
        addIndicator('EMA 50', data.emaSlow, '#FF00FF');
        addIndicator('EMA 100', data.ema100 || [], '#FFD700');
        addIndicator('EMA 200', data.ema200 || [], '#FF8C00');
        addIndicator('VWAP', data.vwap || [], '#FFFFFF', 2);

        // Markers
        const markers: any[] = (data.structures || [])
            .filter(s => s && s.time !== undefined && s.time !== null)
            .map(s => ({
                time: Math.floor(Number(s.time)) as UTCTimestamp,
                position: (s.direction === 'bull' ? 'aboveBar' : 'belowBar') as any,
                color: s.direction === 'bull' ? '#00E5FF' : '#FF2E5B',
                shape: (s.direction === 'bull' ? 'arrowDown' : 'arrowUp') as any,
                text: String(s.type || ''),
                size: 1,
            }))
            .filter(m => !isNaN(m.time) && processedCandles.some(c => c.time === m.time));

        if (data.setup && data.setup.direction !== 'WAIT' && processedCandles.length > 0) {
            const lastTime = processedCandles[processedCandles.length - 1].time;
            if (lastTime) {
                markers.push({
                    time: lastTime,
                    position: (data.setup.direction === 'BUY' ? 'belowBar' : 'aboveBar') as any,
                    color: data.setup.direction === 'BUY' ? '#00FFA3' : '#FF2E5B',
                    shape: (data.setup.direction === 'BUY' ? 'arrowUp' : 'arrowDown') as any,
                    text: '⚡ EXECUTE ' + data.setup.direction,
                    size: 2,
                });
            }
        }
        
        if (seriesRef.current && typeof (seriesRef.current as any).setMarkers === 'function') {
            seriesRef.current.setMarkers(markers);
        }

        // Volume
        if (activeIndicators.includes('Volume') && volumeRef.current) {
            volumeRef.current.setData(processedCandles.map(c => ({
                time: c.time,
                value: Math.random() * 100,
                color: c.close >= c.open ? '#26FF8A33' : '#FF3E3E33'
            })));
        } else if (volumeRef.current) {
            volumeRef.current.setData([]);
        }

        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    } catch (err) {
        console.error('Error in TradingChart data effect:', err);
    }
  }, [data, candleType, activeTimeframe, activeIndicators]);

    if (!data || !data.candles || data.candles.length === 0) return null;

    const lastCandle = data.candles[data.candles.length - 1];

    return (
    <div className="flex flex-col h-full bg-[#05050A] group/chart">
      {/* Top Toolbar */}
      <div className="h-10 bg-sleek-header border-b border-sleek-border flex items-center px-4 gap-4 z-20 shrink-0">
        <div className="flex items-center gap-1 border-r border-sleek-border pr-4">
             <span className="text-[11px] font-black text-sleek-muted mr-2">TF:</span>
             {timeframes.map(tf => (
                 <button 
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${activeTimeframe === tf ? 'bg-sleek-aqua text-black shadow-glow-sm' : 'text-sleek-muted hover:text-white hover:bg-white/5'}`}
                 >
                    {tf}
                 </button>
             ))}
        </div>

        <div className="flex items-center gap-2 border-r border-sleek-border pr-4">
             <button 
                onClick={() => setCandleType(candleType === 'Candle' ? 'Heiken Ashi' : 'Candle')}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
             >
                <BarChart2 className="w-3.5 h-3.5 text-sleek-aqua" />
                <span className="text-[10px] font-black text-gray-200">{candleType}</span>
                <ChevronDown className="w-3 h-3 text-sleek-muted" />
             </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[400px]">
             <Layers className="w-3.5 h-3.5 text-sleek-aqua shrink-0" />
             {indicatorList.slice(0, 5).map(ind => (
                 <button 
                  key={ind}
                  onClick={() => setActiveIndicators(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind])}
                  className={`px-2 py-1 rounded text-[10px] font-black whitespace-nowrap transition-all ${activeIndicators.includes(ind) ? 'text-sleek-aqua bg-sleek-aqua/10' : 'text-sleek-muted hover:text-white'}`}
                 >
                    {ind}
                 </button>
             ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
             <Settings className="w-4 h-4 text-sleek-muted hover:text-white cursor-pointer" />
             <Maximize2 className="w-4 h-4 text-sleek-muted hover:text-white cursor-pointer" />
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Left Drawing Toolbar */}
        <div className="w-12 border-r border-sleek-border bg-sleek-header/50 flex flex-col items-center py-4 gap-6 z-20 shrink-0 shadow-2xl">
             <ToolIcon icon={Crosshair} active={activeDrawingTool === 'Crosshair'} onClick={() => setActiveDrawingTool('Crosshair')} />
             <ToolIcon icon={TrendingIcon} active={activeDrawingTool === 'TrendLine'} onClick={() => setActiveDrawingTool('TrendLine')} />
             <ToolIcon icon={Activity} active={activeDrawingTool === 'Fib'} onClick={() => setActiveDrawingTool('Fib')} />
             <ToolIcon icon={Box} active={activeDrawingTool === 'Rect'} onClick={() => setActiveDrawingTool('Rect')} />
             <ToolIcon icon={Type} active={activeDrawingTool === 'Text'} onClick={() => setActiveDrawingTool('Text')} />
             <div className="h-[1px] w-6 bg-sleek-border my-2"></div>
             <ToolIcon icon={Eraser} active={false} onClick={() => {}} />
        </div>

        {/* Chart Viewport */}
        <div className="flex-1 relative overflow-hidden">
            <div ref={chartContainerRef} className="w-full h-full" />
            
            {/* Symbol Identifier Overlay */}
            <div className="absolute top-4 left-6 pointer-events-none z-10 flex flex-col">
                <div className="flex items-center gap-3">
                    <span className="text-white font-black text-2xl tracking-tighter drop-shadow-lg">{symbol}</span>
                    <span className="bg-sleek-aqua/10 text-sleek-aqua px-2 py-0.5 rounded text-[10px] font-black border border-sleek-aqua/20 tracking-widest">{activeTimeframe}</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono mt-1">
                    <span className="text-sleek-muted">O: <span className="text-white font-bold">{(lastCandle?.open ?? 0).toFixed(2)}</span></span>
                    <span className="text-sleek-muted">H: <span className="text-sleek-bull font-bold">{(lastCandle?.high ?? 0).toFixed(2)}</span></span>
                    <span className="text-sleek-muted">L: <span className="text-sleek-bear font-bold">{(lastCandle?.low ?? 0).toFixed(2)}</span></span>
                    <span className="text-sleek-muted">C: <span className="text-white font-bold">{(lastCandle?.close ?? 0).toFixed(2)}</span></span>
                </div>
            </div>

            {/* Drawing Notification */}
            {activeDrawingTool && activeDrawingTool !== 'Crosshair' && (
                <div className="absolute top-4 inset-x-0 flex justify-center z-30">
                    <div className="bg-sleek-aqua text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-glow flex items-center gap-2">
                         DRAWING MODE: {activeDrawingTool}
                         <button onClick={() => setActiveDrawingTool('Crosshair')} className="p-0.5 hover:bg-black/10 rounded-full transition-colors"><Eraser className="w-3 h-3" /></button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ icon: Icon, active, onClick }: { icon: any; active: boolean; onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`p-2.5 rounded-lg transition-all ${active ? 'bg-sleek-aqua text-black shadow-glow-sm scale-110' : 'text-sleek-muted hover:text-white hover:bg-white/5'}`}
        >
            <Icon className="w-5 h-5" />
        </button>
    )
}

