// Trends - shows data in graph format for personal tracking

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { COLOURS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { CONDITIONS } from '../data/conditions';
import { loadBPReadings, loadGlucoseReadings, formatDate, getLastN } from '../utils/storage';

export default function TrendsScreen() {
  const [activeTab,     setActiveTab]     = useState('blood_pressure');
  const [bpData,        setBpData]        = useState([]);
  const [glucoseData,   setGlucoseData]   = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadChartData();
    }, [])
  );

  async function loadChartData() {
    // Blood Pressure — use systolic as the chart value
    const bpRaw = await getLastN(loadBPReadings, 7);
    setBpData(bpRaw.map(r => ({
      value: r.systolic,
      label: formatDate(r.timestamp),
      dataPointText: String(r.systolic),
    })));

    // Blood Glucose
    const glRaw = await getLastN(loadGlucoseReadings, 7);
    setGlucoseData(glRaw.map(r => ({
      value: r.glucose,
      label: formatDate(r.timestamp),
      dataPointText: String(r.glucose),
    })));
  }

  const condition  = CONDITIONS[activeTab];
  const chartData  = activeTab === 'blood_pressure' ? bpData : glucoseData;
  const hasData    = chartData.length > 0;

  // Determine y-axis range from condition safe ranges
  const yMin = Math.max(0, condition.safeMin - 20);
  const yMax = condition.warnMax + 20;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.pageTitle}>7-Day Trends</Text>

        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          {Object.values(CONDITIONS).map(c => (
            <TouchableOpacity
              key={c.key}
              style={[
                styles.tab,
                activeTab === c.key && { backgroundColor: c.colour },
              ]}
              onPress={() => setActiveTab(c.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === c.key && styles.tabTextActive,
              ]}>
                {c.icon}  {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: condition.colour }]}>
            {condition.icon}  {condition.label} — Last 7 Readings
          </Text>
          <Text style={styles.chartSub}>
            Safe range: {condition.safeMin} – {condition.safeMax} {condition.unit}
          </Text>

          {hasData ? (
            <View style={{ marginTop: SPACING.md }}>
              <LineChart
                data={chartData}
                width={300}
                height={180}
                color={condition.colour}
                thickness={2.5}
                dataPointsColor={condition.colour}
                dataPointsRadius={5}
                textColor={COLOURS.text}
                textFontSize={10}
                showTextOnTop
                yAxisTextStyle={{ color: COLOURS.muted, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: COLOURS.muted, fontSize: 9 }}
                yAxisColor={COLOURS.border}
                xAxisColor={COLOURS.border}
                rulesColor={COLOURS.border}
                rulesType="solid"
                // Safe zone reference line
                showReferenceLine1
                referenceLine1Position={condition.safeMax}
                referenceLine1Config={{ color: COLOURS.safe, dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                showReferenceLine2
                referenceLine2Position={condition.safeMin}
                referenceLine2Config={{ color: COLOURS.safe, dashWidth: 4, dashGap: 4, thickness: 1.5 }}
                initialSpacing={20}
                spacing={42}
                curved
              />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: condition.colour }]} />
                  <Text style={styles.legendText}>{condition.label}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: COLOURS.safe }]} />
                  <Text style={styles.legendText}>Safe zone boundaries</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No readings yet</Text>
              <Text style={styles.emptySub}>Log at least one {condition.label} reading to see your trend</Text>
            </View>
          )}
        </View>

        {/* Stats summary */}
        {hasData && <StatsSummary data={chartData} condition={condition} />}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Stats Summary ─────────────────────────────────────────────────────────────

function StatsSummary({ data, condition }) {
  const values = data.map(d => d.value);
  const avg    = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  const min    = Math.min(...values).toFixed(1);
  const max    = Math.max(...values).toFixed(1);

  const stats = [
    { label: 'Average', value: avg },
    { label: 'Lowest',  value: min },
    { label: 'Highest', value: max },
    { label: 'Readings', value: String(values.length) },
  ];

  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Last 7 Days Summary</Text>
      <View style={styles.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: condition.colour }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLOURS.background },
  scroll:    { padding: SPACING.md, paddingBottom: SPACING.xl },
  pageTitle: { fontSize: FONTS.heading, fontWeight: 'bold', color: COLOURS.primary, paddingTop: SPACING.lg, marginBottom: SPACING.md },

  tabRow: {
    flexDirection:  'row',
    gap:            SPACING.sm,
    marginBottom:   SPACING.md,
  },
  tab: {
    flex:             1,
    paddingVertical:  SPACING.sm,
    borderRadius:     RADIUS.sm,
    backgroundColor:  COLOURS.card,
    borderWidth:      1,
    borderColor:      COLOURS.border,
    alignItems:       'center',
  },
  tabText:       { fontSize: FONTS.small, color: COLOURS.muted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  chartCard: {
    backgroundColor: COLOURS.card,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
    shadowColor:     '#000',
    shadowOpacity:   0.07,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },
  chartTitle: { fontSize: FONTS.title, fontWeight: 'bold' },
  chartSub:   { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 2 },

  legend:     { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendLine: { width: 18, height: 2 },
  legendText: { fontSize: FONTS.small, color: COLOURS.muted },

  emptyState: { alignItems: 'center', padding: SPACING.xl },
  emptyIcon:  { fontSize: 40, marginBottom: SPACING.sm },
  emptyText:  { fontSize: FONTS.title, color: COLOURS.muted, fontWeight: 'bold' },
  emptySub:   { fontSize: FONTS.small, color: COLOURS.muted, textAlign: 'center', marginTop: 4 },

  statsCard: {
    backgroundColor: COLOURS.card,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    shadowColor:     '#000',
    shadowOpacity:   0.07,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },
  statsTitle: { fontSize: FONTS.body, fontWeight: 'bold', color: COLOURS.primary, marginBottom: SPACING.md },
  statsRow:   { flexDirection: 'row', justifyContent: 'space-around' },
  statItem:   { alignItems: 'center' },
  statValue:  { fontSize: FONTS.title, fontWeight: 'bold' },
  statLabel:  { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 2 },
});
