import type { Transaction } from "@/features/TransactionsList/types/finance";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import { useTheme } from "@/hooks/use-theme";

interface CashFlowGraphProps {
    transactions?: Transaction[];
}

export default function CashFlowGraph({ transactions = [] }: CashFlowGraphProps) {
    const theme = useTheme();

    // Processar transações em 5 períodos (barras)
    const data = useMemo(() => {
        const buckets = Array.from({ length: 5 }, (_, i) => ({
            label: `P${i + 1}`,
            income: 0,
            expense: 0,
        }));

        if (transactions.length === 0) {
            return buckets;
        }

        const sorted = [...transactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const minTime = new Date(sorted[0].date).getTime();
        const maxTime = new Date(sorted[sorted.length - 1].date).getTime();
        const range = Math.max(1, maxTime - minTime);

        sorted.forEach((t) => {
            const time = new Date(t.date).getTime();
            let bucketIndex = Math.floor(((time - minTime) / range) * 5);
            if (bucketIndex >= 5) bucketIndex = 4;
            if (bucketIndex < 0) bucketIndex = 0;

            const amt = Number(t.amount) || 0;
            if (t.type === 'income') {
                buckets[bucketIndex].income += amt;
            } else if (t.type === 'expense') {
                buckets[bucketIndex].expense += amt;
            }
        });

        return buckets;
    }, [transactions]);

    const maxVal = useMemo(() => {
        let max = 1;
        data.forEach((b) => {
            if (b.income > max) max = b.income;
            if (b.expense > max) max = b.expense;
        });
        return max;
    }, [data]);

    const baseLineY = 130;

    return (
        <View style={[styles.card, styles.largeCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <View style={styles.chartHeader}>
                <Text style={[styles.chartTitle, { color: theme.text }]}>Fluxo de caixa</Text>
            </View>

            <View style={styles.barChartContainer}>
                <Svg width="100%" height={160} viewBox="0 0 340 160">
                    <Defs>
                        <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={theme.income} />
                            <Stop offset="100%" stopColor={theme.incomeGlow} />
                        </LinearGradient>
                        <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor={theme.expense} />
                            <Stop offset="100%" stopColor={theme.expenseGlow} />
                        </LinearGradient>
                    </Defs>

                    {/* Y Axis Grid Lines & Labels */}
                    <SvgText x={35} y={24} fill={theme.textSecondary} fontSize={10} textAnchor="end">
                        R$ {Math.round(maxVal)}
                    </SvgText>
                    <Line x1="45" y1="20" x2="330" y2="20" stroke={theme.cardBorderSubtle} strokeDasharray="3 3" />

                    <SvgText x={35} y={79} fill={theme.textSecondary} fontSize={10} textAnchor="end">
                        R$ {Math.round(maxVal / 2)}
                    </SvgText>
                    <Line x1="45" y1="75" x2="330" y2="75" stroke={theme.cardBorderSubtle} strokeDasharray="3 3" />

                    <SvgText x={35} y={134} fill={theme.textSecondary} fontSize={10} textAnchor="end">
                        R$ 0
                    </SvgText>
                    <Line x1="45" y1="130" x2="330" y2="130" stroke={theme.cardBorder} />

                    {/* Render Dynamic Bars for 5 Periods */}
                    {data.map((b, i) => {
                        const startX = 60 + i * 54;
                        const incHeight = (b.income / maxVal) * 90;
                        const expHeight = (b.expense / maxVal) * 90;

                        const incY = baseLineY - Math.max(4, incHeight);
                        const expY = baseLineY - Math.max(4, expHeight);

                        return (
                            <React.Fragment key={i}>
                                {/* Entrada Bar */}
                                <Rect
                                    x={startX}
                                    y={incY}
                                    width={14}
                                    height={Math.max(4, incHeight)}
                                    rx={4}
                                    fill="url(#incomeGrad)"
                                />
                                {/* Saída Bar */}
                                <Rect
                                    x={startX + 18}
                                    y={expY}
                                    width={14}
                                    height={Math.max(4, expHeight)}
                                    rx={4}
                                    fill="url(#expenseGrad)"
                                />
                            </React.Fragment>
                        );
                    })}
                </Svg>

                {/* Week/Period labels */}
                <View style={styles.weekLabelsContainer}>
                    <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>P1</Text>
                    <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>P2</Text>
                    <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>P3</Text>
                    <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>P4</Text>
                    <Text style={[styles.xAxisLabel, { color: theme.textSecondary }]}>P5</Text>
                </View>
            </View>

            <View style={[styles.legendContainer, { borderTopColor: theme.cardSeparator }]}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.income }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Entradas</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.expense }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Saídas</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        minHeight: 146,
    },
    largeCard: {
        width: '100%',
        justifyContent: 'flex-start',
        minHeight: 'auto',
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    barChartContainer: {
        width: '100%',
        alignItems: 'center',
        opacity: 0.9,
    },
    weekLabelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingLeft: 45,
        paddingRight: 10,
        marginTop: 8,
    },
    xAxisLabel: {
        fontSize: 11,
        width: 50,
        textAlign: 'center',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 20,
        borderTopWidth: 1,
        paddingTop: 16,
        width: '100%',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});