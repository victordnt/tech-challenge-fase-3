import { StyleSheet, ScrollView, View, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { Badge, BadgeText, HStack, VStack, Text, Card } from '@gluestack-ui/themed';
import { SymbolView } from 'expo-symbols';
import Svg, { Rect, Circle, G, Text as SvgText, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { cardData } from '../schemas/MockStats';

export default function StatsScreen() {
    const colorScheme = useColorScheme();
    const validColorScheme = colorScheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[validColorScheme];
    const [selectedFilter, setSelectedFilter] = useState('All');
    const filterOptions = ['Week', 'Month', 'Year'];


    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Análises financeiras</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        Seu panorama financeiro
                    </ThemedText>
                </View>

                {/* Filters */}
                <View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        {filterOptions.map((option) => (
                            <TouchableOpacity key={option} onPress={() => setSelectedFilter(option)} activeOpacity={0.8}>
                                <Badge
                                    style={[
                                        styles.badge,
                                        selectedFilter === option
                                            ? { backgroundColor: '#7C3AED', borderColor: 'transparent' }
                                            : { backgroundColor: '#272A2C', borderColor: '#2E2E33', borderWidth: 1 }
                                    ]}
                                >
                                    <BadgeText
                                        style={[
                                            styles.badgeText,
                                            selectedFilter === option
                                                ? { color: '#FFFFFF' }
                                                : { color: '#94A3B8' }
                                        ]}
                                    >
                                        {option === 'Week' ? 'Week' : option}
                                    </BadgeText>
                                </Badge>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Stats Cards Grid */}
                <VStack style={styles.gridContainer}>
                    <HStack style={styles.row}>
                        {/* Card 1 */}
                        <Card style={styles.card}>
                            <HStack style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: cardData[0].iconBg }]}>
                                    <SymbolView
                                        name={cardData[0].iconName as any}
                                        size={14}
                                        tintColor={cardData[0].iconColor}
                                        weight="bold"
                                    />
                                </View>
                                <Text style={styles.cardLabel}>{cardData[0].title}</Text>
                            </HStack>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{cardData[0].value}</Text>
                                <Text style={[styles.cardSubtext, { color: cardData[0].subtextColor }]}>
                                    {cardData[0].subtext}
                                </Text>
                            </View>
                        </Card>

                        {/* Card 2 */}
                        <Card style={styles.card}>
                            <HStack style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: cardData[1].iconBg }]}>
                                    <SymbolView
                                        name={cardData[1].iconName as any}
                                        size={14}
                                        tintColor={cardData[1].iconColor}
                                        weight="bold"
                                    />
                                </View>
                                <Text style={styles.cardLabel}>{cardData[1].title}</Text>
                            </HStack>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{cardData[1].value}</Text>
                                <Text style={[styles.cardSubtext, { color: cardData[1].subtextColor }]}>
                                    {cardData[1].subtext}
                                </Text>
                            </View>
                        </Card>
                    </HStack>

                    <HStack style={styles.row}>
                        {/* Card 3 */}
                        <Card style={styles.card}>
                            <HStack style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: cardData[2].iconBg }]}>
                                    <SymbolView
                                        name={cardData[2].iconName as any}
                                        size={14}
                                        tintColor={cardData[2].iconColor}
                                        weight="bold"
                                    />
                                </View>
                                <Text style={styles.cardLabel}>{cardData[2].title}</Text>
                            </HStack>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{cardData[2].value}</Text>
                                <Text style={[styles.cardSubtext, { color: cardData[2].subtextColor, opacity: 0.7 }]}>
                                    {cardData[2].subtext}
                                </Text>
                            </View>
                        </Card>

                        {/* Card 4 */}
                        <Card style={styles.card}>
                            <HStack style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: cardData[3].iconBg }]}>
                                    <SymbolView
                                        name={cardData[3].iconName as any}
                                        size={14}
                                        tintColor={cardData[3].iconColor}
                                        weight="bold"
                                    />
                                </View>
                                <Text style={styles.cardLabel}>{cardData[3].title}</Text>
                            </HStack>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{cardData[3].value}</Text>
                                <Text style={[styles.cardSubtext, { color: cardData[3].subtextColor, opacity: 0.7 }]}>
                                    {cardData[3].subtext}
                                </Text>
                            </View>
                        </Card>
                    </HStack>
                </VStack>

                {/* Cash Flow Card */}
                <Card style={[styles.card, styles.largeCard]}>
                    <HStack style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Cash Flow</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <SymbolView
                                name={{ ios: 'ellipsis', android: 'more_horiz', web: 'more_horiz' }}
                                size={20}
                                tintColor="#E0E3E5"
                            />
                        </TouchableOpacity>
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

                {/* Categories Card */}
                <Card style={[styles.card, styles.largeCard]}>
                    <HStack style={styles.chartHeader}>
                        <Text style={styles.chartTitle}>Categories</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                            <SymbolView
                                name={{ ios: 'line.3.horizontal.decrease', android: 'filter_list', web: 'filter_list' }}
                                size={20}
                                tintColor="#E0E3E5"
                            />
                        </TouchableOpacity>
                    </HStack>

                    <View style={styles.donutContainer}>
                        <Svg width={160} height={160} viewBox="0 0 160 160">
                 
                            <Circle
                                cx="80"
                                cy="80"
                                r="50"
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeWidth="12"
                                fill="none"
                            />
                           
                            <G transform="rotate(-90 80 80)">
                                <Circle
                                    cx="80"
                                    cy="80"
                                    r="50"
                                    stroke="#D2BBFF"
                                    strokeWidth="12"
                                    strokeDasharray="139.37 314.16"
                                    strokeDashoffset="0"
                                    fill="none"
                                />
                                <Circle
                                    cx="80"
                                    cy="80"
                                    r="50"
                                    stroke="#FFB4AB"
                                    strokeWidth="12"
                                    strokeDasharray="76.54 314.16"
                                    strokeDashoffset="-141.37"
                                    fill="none"
                                />
                                <Circle
                                    cx="80"
                                    cy="80"
                                    r="50"
                                    stroke="#B9C5F2"
                                    strokeWidth="12"
                                    strokeDasharray="45.12 314.16"
                                    strokeDashoffset="-219.91"
                                    fill="none"
                                />
                                <Circle
                                    cx="80"
                                    cy="80"
                                    r="50"
                                    stroke="#FFB4A3"
                                    strokeWidth="12"
                                    strokeDasharray="45.12 314.16"
                                    strokeDashoffset="-267.03"
                                    fill="none"
                                />
                            </G>
             
                            <SvgText x="80" y="74" textAnchor="middle" fill="#CCC3D8" fontSize="13" fontWeight="500">
                                Total
                            </SvgText>
                            <SvgText x="80" y="100" textAnchor="middle" fill="#E0E3E5" fontSize="24" fontWeight="700">
                                $4.2k
                            </SvgText>
                        </Svg>
                    </View>

                    {/* Categories List */}
                    <VStack style={styles.categoriesList}>
                        <HStack style={styles.categoryRow}>
                            <HStack style={styles.categoryLeft}>
                                <View style={[
                                    styles.categoryColorDot,
                                    {
                                        backgroundColor: '#D2BBFF',
                                        shadowColor: '#D2BBFF',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 6,
                                    }
                                ]} />
                                <Text style={styles.categoryName}>Housing</Text>
                            </HStack>
                            <Text style={styles.categoryValue}>45%</Text>
                        </HStack>

                        {/* Food & Dining */}
                        <HStack style={styles.categoryRow}>
                            <HStack style={styles.categoryLeft}>
                                <View style={[styles.categoryColorDot, { backgroundColor: '#FFB4AB' }]} />
                                <Text style={styles.categoryName}>Food & Dining</Text>
                            </HStack>
                            <Text style={styles.categoryValue}>25%</Text>
                        </HStack>

                        {/* Transportation */}
                        <HStack style={styles.categoryRow}>
                            <HStack style={styles.categoryLeft}>
                                <View style={[styles.categoryColorDot, { backgroundColor: '#B9C5F2' }]} />
                                <Text style={styles.categoryName}>Transportation</Text>
                            </HStack>
                            <Text style={styles.categoryValue}>15%</Text>
                        </HStack>

                        {/* Entertainment */}
                        <HStack style={styles.categoryRow}>
                            <HStack style={styles.categoryLeft}>
                                <View style={[styles.categoryColorDot, { backgroundColor: '#FFB4A3' }]} />
                                <Text style={styles.categoryName}>Entertainment</Text>
                            </HStack>
                            <Text style={styles.categoryValue}>15%</Text>
                        </HStack>
                    </VStack>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
        gap: 20,
    },
    header: {
        gap: 4,
    },
    title: {
        fontSize: 28,
    },
    filterContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 38,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'none',
    },
    gridContainer: {
        marginTop: 8,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardContent: {
        marginTop: 16,
        gap: 4,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#CCC3D8',
    },
    cardValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#E0E3E5',
    },
    cardSubtext: {
        fontSize: 13,
        fontWeight: '500',
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
    donutContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
    },
    categoriesList: {
        gap: 14,
        marginTop: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    categoryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    categoryColorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#E0E3E5',
    },
    categoryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CCC3D8',
    },
});
