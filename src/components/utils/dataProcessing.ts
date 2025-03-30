interface Trade {
    quantity: string;
    side: 'buy' | 'sell';
    price: string;
    time: number;
}

interface TradeData {
    [strategy: string]: string;
}

interface PerformanceData {
    candle_topics: string[];
    initial_capital: number;
    trades: TradeData;
}

interface ProcessedTrade {
    id: number;
    date: string;
    type: 'buy' | 'sell';
    price: number;
    size: number;
    pnl: number;
    runningPnl: number;
    runningCapital: number;
}

interface EquityPoint {
    date: string;
    value: number;
}

interface MonthlyReturn {
    month: string;
    return: number;
}

interface DrawdownPoint {
    name: string;
    value: number;
}

interface TradeCluster {
    x: number; // trade duration
    y: number; // return %
    z: number; // trade size
    cluster: number; // cluster id
}

interface ProcessedData {
    strategyName: string;
    strategyParams: string;
    initialCapital: number;
    totalReturn: number;
    annualReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    avgProfit: number;
    winRate: number;
    profitFactor: number;
    winLossRatio: number;
    trades: ProcessedTrade[];
    equityCurve: EquityPoint[];
    monthlyReturns: MonthlyReturn[];
    drawdowns: DrawdownPoint[];
    tradeClusters: TradeCluster[];
}

// Extract and parse trades from the JSON string in the performance data
export const extractTrades = (performanceData: PerformanceData): Trade[] => {
    console.log('Extracting trades from:', performanceData);

    try {
        // Check if trades object exists
        if (!performanceData.trades || Object.keys(performanceData.trades).length === 0) {
            console.error('No trades found in performance data');
            return [];
        }

        // Get the first strategy key
        const strategyKey = Object.keys(performanceData.trades)[0];
        console.log('Strategy key:', strategyKey);

        if (!performanceData.trades[strategyKey]) {
            console.error('No data found for strategy key:', strategyKey);
            return [];
        }

        // Handle the case where trades might already be an object (not a JSON string)
        let strategyData;
        if (typeof performanceData.trades[strategyKey] === 'string') {
            try {
                // Parse the JSON string
                strategyData = JSON.parse(performanceData.trades[strategyKey]);
            } catch (parseError) {
                console.error('Error parsing strategy data JSON string:', parseError);
                return [];
            }
        } else {
            // Already an object
            strategyData = performanceData.trades[strategyKey];
        }

        console.log('Strategy data:', strategyData);

        // Validate the parsed data structure
        if (!strategyData.trades) {
            console.error('No trades property found in strategy data');
            return [];
        }

        // Get the first symbol key (e.g., "BTCUSDT")
        const symbolKeys = Object.keys(strategyData.trades);
        if (symbolKeys.length === 0) {
            console.error('No symbols found in strategy data');
            return [];
        }

        const symbolKey = symbolKeys[0];
        console.log('Symbol key:', symbolKey);

        if (!Array.isArray(strategyData.trades[symbolKey])) {
            console.error('Trades for symbol is not an array:', symbolKey);
            return [];
        }

        const trades = strategyData.trades[symbolKey] as Trade[];
        console.log(`Found ${trades.length} trades for symbol ${symbolKey}`);

        return trades;
    } catch (error) {
        console.error('Error extracting trades:', error);
        return [];
    }
};

// Calculate metrics from trade data
export const calculateMetrics = (
    trades: Trade[],
    initialCapital: number,
    performanceData?: PerformanceData
): ProcessedData => {
    const processedTrades: ProcessedTrade[] = [];
    const equityCurve: EquityPoint[] = [];
    const monthlyPnLs: { [key: string]: number } = {};

    // Initialize with starting capital
    let runningCapital = initialCapital;
    let runningPnl = 0;
    let peakCapital = initialCapital;
    let maxDrawdown = 0;

    // Metrics
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;

    // Initialize equity curve with starting capital
    const startDate = new Date(trades[0]?.time || Date.now());
    equityCurve.push({
        date: formatDate(startDate),
        value: runningCapital
    });

    // Process each trade
    trades.forEach((trade, index) => {
        if (index % 2 === 0 && index < trades.length - 1) {
            // Process a trade pair (entry and exit)
            const entryTrade = trade;
            const exitTrade = trades[index + 1];

            const entryPrice = parseFloat(entryTrade.price);
            const exitPrice = parseFloat(exitTrade.price);
            const quantity = parseFloat(entryTrade.quantity);

            // Calculate PnL based on trade side
            let pnl = 0;
            if (entryTrade.side === 'buy') {
                // Long position: (sell price - buy price) * quantity
                pnl = (exitPrice - entryPrice) * quantity;
            } else {
                // Short position: (buy price - sell price) * quantity
                pnl = (entryPrice - exitPrice) * quantity;
            }

            // Update running metrics
            runningPnl += pnl;
            runningCapital += pnl;
            totalPnl += pnl;

            // Update win/loss metrics
            if (pnl > 0) {
                winCount++;
                totalWinAmount += pnl;
            } else if (pnl < 0) {
                lossCount++;
                totalLossAmount += Math.abs(pnl);
            }

            // Track drawdown
            if (runningCapital > peakCapital) {
                peakCapital = runningCapital;
            } else {
                const currentDrawdown = (peakCapital - runningCapital) / peakCapital;
                if (currentDrawdown > maxDrawdown) {
                    maxDrawdown = currentDrawdown;
                }
            }

            // Add to processed trades
            processedTrades.push({
                id: processedTrades.length + 1,
                date: formatDate(new Date(exitTrade.time)),
                type: entryTrade.side,
                price: entryPrice,
                size: quantity,
                pnl: pnl,
                runningPnl: runningPnl,
                runningCapital: runningCapital
            });

            // Update equity curve
            equityCurve.push({
                date: formatDate(new Date(exitTrade.time)),
                value: runningCapital
            });

            // Update monthly PnL
            const monthYear = formatDate(new Date(exitTrade.time), 'MMM yyyy');
            monthlyPnLs[monthYear] = (monthlyPnLs[monthYear] || 0) + pnl;
        }
    });

    // Calculate monthly returns as percentages
    const monthlyReturns: MonthlyReturn[] = Object.entries(monthlyPnLs).map(([month, pnl]) => {
        return {
            month,
            return: pnl / initialCapital // Simplified monthly return calculation
        };
    });

    // Calculate drawdowns
    const drawdowns: DrawdownPoint[] = calculateDrawdowns(equityCurve);

    // Generate trade clusters (simplified)
    const tradeClusters = generateTradeClusters(processedTrades);

    // Calculate performance metrics
    const totalReturn = (runningCapital - initialCapital) / initialCapital;
    const tradingDays = Math.ceil((trades[trades.length - 1].time - trades[0].time) / (24 * 60 * 60 * 1000));
    const annualReturn = totalReturn * (365 / tradingDays);
    const avgProfit = processedTrades.length > 0 ? totalPnl / processedTrades.length : 0;
    const winRate = (winCount + lossCount) > 0 ? winCount / (winCount + lossCount) : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 1;
    const avgWin = winCount > 0 ? totalWinAmount / winCount : 0;
    const avgLoss = lossCount > 0 ? totalLossAmount / lossCount : 1;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 1;

    // Estimated Sharpe Ratio (simplified)
    const returns = processedTrades.map(t => t.pnl / initialCapital);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0; // Annualized Sharpe

    // Extract strategy name and parameters
    let strategyName = "BTC/USDT Strategy";
    let strategyParams = "";

    if (performanceData && performanceData.trades) {
        const strategyKey = Object.keys(performanceData.trades)[0];
        strategyParams = strategyKey;
    }

    return {
        strategyName,
        strategyParams,
        initialCapital,
        totalReturn,
        annualReturn,
        sharpeRatio,
        maxDrawdown,
        avgProfit,
        winRate,
        profitFactor,
        winLossRatio,
        trades: processedTrades,
        equityCurve,
        monthlyReturns,
        drawdowns,
        tradeClusters
    };
};

// Helper to calculate drawdowns
const calculateDrawdowns = (equityCurve: EquityPoint[]): DrawdownPoint[] => {
    const drawdowns: DrawdownPoint[] = [];

    if (equityCurve.length < 2) return drawdowns;

    let peak = equityCurve[0].value;

    equityCurve.forEach((point, i) => {
        if (point.value > peak) {
            peak = point.value;
        } else {
            // Calculate drawdown percentage
            const drawdown = (peak - point.value) / peak;

            // Only add significant drawdowns
            if (drawdown > 0.02) { // 2% drawdown threshold
                drawdowns.push({
                    name: point.date,
                    value: -drawdown // Negative to show going down
                });
            }
        }
    });

    return drawdowns;
};

// Helper to generate trade clusters (simplified)
const generateTradeClusters = (trades: ProcessedTrade[]): TradeCluster[] => {
    return trades.map((trade, index) => {
        // Calculate days held (simplified)
        const daysHeld = Math.max(1, index % 5); // Simplified for demo

        // Assign to clusters based on PnL
        let cluster = 0;
        if (trade.pnl > 0) {
            cluster = 0; // Winning trades
        } else if (trade.pnl < 0) {
            cluster = 1; // Losing trades
        } else {
            cluster = 2; // Breakeven trades
        }

        return {
            x: daysHeld,
            y: trade.pnl / trade.price, // Return in percentage
            z: Math.abs(trade.pnl * 10), // Trade size scaled up for visibility
            cluster
        };
    });
};

// Helper function to format dates
const formatDate = (date: Date, format: string = 'yyyy-MM-dd'): string => {
    const options: Intl.DateTimeFormatOptions = {};

    if (format === 'MMM yyyy') {
        options.month = 'short';
        options.year = 'numeric';
    } else {
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export interface PerformanceDataObject extends PerformanceData { }
export interface ProcessedDataObject extends ProcessedData { } 