import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors } from '../theme/colors'
import { GlassCard } from '../components/ui'
import { getUserCases } from '../api/cases'

const STATUS_COLORS: Record<string, string> = {
  active: colors.primary,
  resolved: colors.success,
  escalated: colors.warning,
}

const FILTERS = ['All', 'Active', 'Won', 'Escalated']

const CATEGORY_LABELS: Record<string, string> = {
  deposit: '🏠 Security Deposit',
  charges: '💳 Unauthorized Charges',
  travel: '✈️ Flight / Travel',
  invoice: '💼 Unpaid Invoice',
  product: '📦 Defective Product',
}

export default function MyCasesScreen({ navigation }: any) {
  const [cases, setCases] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const loadCases = async () => {
    try {
      const data = await getUserCases()
      setCases(data || [])
    } catch (_e) {}
  }

  useFocusEffect(useCallback(() => { loadCases() }, []))

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const filtered = cases.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Active') return c.status === 'active'
    if (filter === 'Won') return c.outcome === 'won'
    if (filter === 'Escalated') return c.status === 'escalated'
    return true
  })

  const totalRecovered = cases
    .filter(c => c.outcome === 'won' && c.amount_disputed)
    .reduce((sum, c) => sum + (c.amount_disputed || 0), 0)

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Cases</Text>
      {totalRecovered > 0 && (
        <GlassCard style={styles.recoveredBanner} glow={colors.goldPrimary} gold>
          <Text style={styles.recoveredText}>🏆 Total Recovered: ${totalRecovered.toLocaleString()}</Text>
        </GlassCard>
      )}

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={filter === f ? undefined : styles.filter}
            onPress={() => setFilter(f)}
          >
            {filter === f ? (
              <LinearGradient colors={colors.gradientGold as [string,string,string]} style={styles.filterPillActive} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Text style={styles.filterTextActive}>{f}</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.filterText}>{f}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const categoryColor = STATUS_COLORS[item.status] || colors.primary
          return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OutcomeTracker', { caseId: item.id, analysis: null })}
          >
            <View style={{ width: 4, backgroundColor: categoryColor, borderRadius: 4, position: 'absolute', left: 0, top: 0, bottom: 0 }} />
            <View style={styles.cardHeader}>
              <Text style={styles.cardCategory}>
                {CATEGORY_LABELS[item.category] || item.category}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || colors.border) + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || colors.textSecondary }]}>
                  {item.outcome === 'won' ? '🏆 Won' : item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            {item.amount_disputed && (
              <Text style={styles.cardAmount}>${item.amount_disputed.toLocaleString()} disputed</Text>
            )}
          </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No cases found</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, paddingHorizontal: 24, paddingTop: 8, marginBottom: 16 },
  recoveredBanner: {
    marginHorizontal: 24, padding: 12, marginBottom: 16,
  },
  recoveredText: { fontSize: 14, fontWeight: '700', color: colors.goldBright, textAlign: 'center' },
  filters: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 8 },
  filter: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  filterPillActive: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { fontSize: 13, fontWeight: '600', color: '#FFF' },
  list: { paddingHorizontal: 24, paddingBottom: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', paddingLeft: 22,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardCategory: { fontSize: 13, fontWeight: '700', color: colors.primary },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  cardAmount: { fontSize: 15, fontWeight: '700', color: colors.text },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: colors.textSecondary, fontSize: 16 },
})
