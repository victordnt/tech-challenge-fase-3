import { Card, HStack, Text } from "@gluestack-ui/themed";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text as SvgText } from "react-native-svg";

export default function CashFlowGraph() {
    return (
                <Card style={[styles.card, styles.largeCard]}>
                    <HStack style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Cash Flow</Text>
                    </HStack>
                    
<View style={styles.barChartContainer}>
                        <Svg width="100%" height={160} viewBox="0 0 340 160">
                            <Defs>
                                <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0%" stopColor="#D2BBFF" />
                                    <Stop offset="100%" stopColor="rgba(210, 187, 255, 0.2)" />
                                </LinearGradient>
                                <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0%" stopColor="#FFB4AB" />
                                    <Stop offset="100%" stopColor="rgba(255, 180, 171, 0.2)" />
                                </LinearGradient>
                            </Defs>

                            {/* Y Axis Grid Lines & Labels */}
                            <SvgText x={35} y={24} fill="#CCC3D8" fontSize={11} textAnchor="end">$10k</SvgText>
                            <Line x1="45" y1="20" x2="330" y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

                            <SvgText x={35} y={84} fill="#CCC3D8" fontSize={11} textAnchor="end">$5k</SvgText>
                            <Line x1="45" y1="80" x2="330" y2="80" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />

                            <SvgText x={35} y={144} fill="#CCC3D8" fontSize={11} textAnchor="end">$0</SvgText>
                            <Line x1="45" y1="140" x2="330" y2="140" stroke="rgba(255, 255, 255, 0.1)" />

                            {/* Week 1 */}
                            <Rect x={60} y={98} width={12} height={42} rx={4} fill="url(#incomeGrad)" />
                            <Rect x={76} y={114} width={12} height={26} rx={4} fill="url(#expenseGrad)" />

                            {/* Week 2 */}
                            <Rect x={120} y={82} width={12} height={58} rx={4} fill="url(#incomeGrad)" />
                            <Rect x={136} y={106} width={12} height={34} rx={4} fill="url(#expenseGrad)" />

                            {/* Week 3 */}
                            <Rect x={180} y={94} width={12} height={46} rx={4} fill="url(#incomeGrad)" />
                            <Rect x={196} y={110} width={12} height={30} rx={4} fill="url(#expenseGrad)" />

                            {/* Week 4 */}
                            <Rect x={240} y={54} width={12} height={86} rx={4} fill="url(#incomeGrad)" />
                            <Rect x={256} y={78} width={12} height={62} rx={4} fill="url(#expenseGrad)" />

                            {/* Week 5 */}
                            <Rect x={300} y={82} width={12} height={58} rx={4} fill="url(#incomeGrad)" />
                            <Rect x={316} y={102} width={12} height={38} rx={4} fill="url(#expenseGrad)" />
                        </Svg>
                        
                        {/* Week labels */}
                        <HStack style={styles.weekLabelsContainer}>
                            <Text style={styles.xAxisLabel}>Week 1</Text>
                            <Text style={styles.xAxisLabel}>Week 2</Text>
                            <Text style={styles.xAxisLabel}>Week 3</Text>
                            <Text style={styles.xAxisLabel}>Week 4</Text>
                            <Text style={styles.xAxisLabel}>Week 5</Text>
                        </HStack>
                    </View>

                    <HStack style={styles.legendContainer}>
                        <HStack style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#D2BBFF' }]} />
                            <Text style={styles.legendText}>Income</Text>
                        </HStack>
                        <HStack style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FFB4AB' }]} />
                            <Text style={styles.legendText}>Expenses</Text>
                        </HStack>
                    </HStack>
                </Card>
    );
}

    const styles = StyleSheet.create({
         card: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        minHeight: 146,
        // Drop shadow for glassmorphism
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 6,
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
            color: '#E0E3E5',
        },
        barChartContainer: {
            width: '100%',
            alignItems: 'center',
            opacity: 0.7,
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
            color: '#CCC3D8',
            width: 50,
            textAlign: 'center',
        },
        legendContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 20,
            marginTop: 20,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
            color: '#CCC3D8',
            fontWeight: '500',
        },
    });
    