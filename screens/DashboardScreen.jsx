// DashboardScreen(Home) - displays data inputed over set period of time

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLOURS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { CONDITIONS, getSafetyStatus, getStatusColour, getStatusLabel } from '../data/conditions';
import { loadBPReadings, loadGlucoseReadings, formatDate, formatTime } from '../utils/storage';

export default function DashboardScreen({ navigation }) {
  const [latestBP,      setLatestBP]      = useState(null);
  const [latestGlucose, setLatestGlucose] = useState(null);
  const [refreshing,    setRefreshing]    = useState(false);

  // Reload data every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const bp      = await loadBPReadings();
    const glucose = await loadGlucoseReadings();
    setLatestBP(bp[0]      || null);
    setLatestGlucose(glucose[0] || null);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.title}>Your Health Today</Text>
        </View>

        {/* Blood Pressure Card */}
        <ReadingCard
          condition={CONDITIONS.blood_pressure}
          reading={latestBP}
          displayValue={latestBP ? `${latestBP.systolic} / ${latestBP.diastolic}` : null}
          primaryValue={latestBP?.systolic}
          onLog={() => navigation.navigate('LogReading', { conditionKey: 'blood_pressure' })}
        />

        {/* Blood Glucose Card */}
        <ReadingCard
          condition={CONDITIONS.blood_glucose}
          reading={latestGlucose}
          displayValue={latestGlucose ? `${latestGlucose.glucose} mmol/L` : null}
          primaryValue={latestGlucose?.glucose}
          onLog={() => navigation.navigate('LogReading', { conditionKey: 'blood_glucose' })}
        />

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Today's Reminders</Text>
          <Text style={styles.tipText}>• Log your blood pressure before breakfast</Text>
          <Text style={styles.tipText}>• Log your fasting glucose first thing in the morning</Text>
          <Text style={styles.tipText}>• Note any symptoms you are experiencing</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ReadingCard ───────────────────────────────────────────────────────────────

function ReadingCard({ condition, reading, displayValue, primaryValue, onLog }) {
  const status = primaryValue
    ? getSafetyStatus(condition.key, primaryValue)
    : null;
  const statusColour = status ? getStatusColour(status) : COLOURS.muted;
  const statusLabel  = status ? getStatusLabel(status)  : 'No reading yet today';

  return (
    <View style={[styles.card, { borderLeftColor: condition.colour }]}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{condition.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{condition.label}</Text>
          <Text style={styles.cardUnit}>{condition.unit}</Text>
        </View>
        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: condition.colour }]}
          onPress={onLog}
        >
          <Text style={styles.logBtnText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Reading Value */}
      {displayValue ? (
        <View style={styles.valueRow}>
          <Text style={[styles.valueText, { color: statusColour }]}>{displayValue}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColour + '22' }]}>
            <Text style={[styles.statusText, { color: statusColour }]}>{statusLabel}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noReading}>No reading logged today</Text>
      )}

      {/* Timestamp */}
      {reading && (
        <Text style={styles.timestamp}>
          Last logged: {formatDate(reading.timestamp)} at {formatTime(reading.timestamp)}
        </Text>
      )}

      {/* Safe Range Reference */}
      <Text style={styles.safeRange}>
        Safe range: {condition.safeMin} – {condition.safeMax} {condition.unit}
      </Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: COLOURS.background },
  scroll:      { padding: SPACING.md, paddingBottom: SPACING.xl },
  header:      { paddingTop: SPACING.xl, marginBottom: SPACING.lg },
  greeting:    { fontSize: FONTS.body, color: COLOURS.muted },
  title:       { fontSize: FONTS.heading, fontWeight: 'bold', color: COLOURS.primary },

  card: {
    backgroundColor: COLOURS.card,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
    borderLeftWidth: 5,
    shadowColor:     '#000',
    shadowOpacity:   0.07,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       3,
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardIcon:    { fontSize: 28, marginRight: SPACING.sm },
  cardTitle:   { fontSize: FONTS.title, fontWeight: 'bold', color: COLOURS.primary },
  cardUnit:    { fontSize: FONTS.small, color: COLOURS.muted },

  logBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.xs,
    borderRadius:      RADIUS.sm,
  },
  logBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: FONTS.body },

  valueRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs, flexWrap: 'wrap', gap: 8 },
  valueText:   { fontSize: 32, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:  { fontSize: FONTS.small, fontWeight: '600' },

  noReading:   { fontSize: FONTS.body, color: COLOURS.muted, marginBottom: SPACING.xs },
  timestamp:   { fontSize: FONTS.small, color: COLOURS.muted },
  safeRange:   { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 4 },

  tipsCard: {
    backgroundColor: '#EAF4F4',
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    marginTop:       SPACING.sm,
  },
  tipsTitle:   { fontSize: FONTS.body, fontWeight: 'bold', color: COLOURS.primary, marginBottom: SPACING.sm },
  tipText:     { fontSize: FONTS.small, color: COLOURS.text, marginBottom: 4, lineHeight: 20 },
});
