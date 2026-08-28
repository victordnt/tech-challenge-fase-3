import { Card, HStack, VStack } from "@gluestack-ui/themed";
import { SymbolView } from "expo-symbols";
import { StyleSheet,Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

export default function CategoriesGraph() {
    return (
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