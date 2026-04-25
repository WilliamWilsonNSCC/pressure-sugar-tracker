// Summary Screen - displays data for medical professionals
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLOURS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { CONDITIONS, getSafetyStatus, getStatusColour } from '../data/conditions';
import {
  loadBPReadings, loadGlucoseReadings, loadSymptoms,
  formatDate, formatTime, clearAllData,
} from '../utils/storage';

export default function SummaryScreen() {
  const [bpReadings,      setBpReadings]      = useState([]);
  const [glucoseReadings, setGlucoseReadings] = useState([]);
  const [symptoms,        setSymptoms]        = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  async function loadAll() {
    const bp      = await loadBPReadings();
    const glucose = await loadGlucoseReadings();
    const symp    = await loadSymptoms();
    // Last 14 entries of each
    setBpReadings(bp.slice(0, 14));
    setGlucoseReadings(glucose.slice(0, 14));
    setSymptoms(symp.slice(0, 14));
  }

  function confirmClear() {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all readings and symptoms. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await clearAllData();
          loadAll();
        }},
      ]
    );
  }

  const totalReadings = bpReadings.length + glucoseReadings.length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Doctor Summary</Text>
          <Text style={styles.subtitle}>Last 14 days of readings & symptoms</Text>
          <Text style={styles.generated}>Generated: {new Date().toLocaleDateString('en-CA', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</Text>
        </View>

        {/* Overview stats */}
        <View style={styles.overviewRow}>
          <OverviewStat label="BP Readings"      value={bpReadings.length}      colour={CONDITIONS.blood_pressure.colour} />
          <OverviewStat label="Glucose Readings"  value={glucoseReadings.length}  colour={CONDITIONS.blood_glucose.colour}  />
          <OverviewStat label="Symptom Logs"     value={symptoms.length}         colour={COLOURS.primary} />
        </View>

        {/* Blood Pressure Section */}
        <SectionHeader title="🩸 Blood Pressure" condition={CONDITIONS.blood_pressure} readings={bpReadings} valueKey="systolic" />
        {bpReadings.length > 0 ? (
          bpReadings.map((r, i) => (
            <BPRow key={i} reading={r} />
          ))
        ) : (
          <EmptyRow message="No blood pressure readings logged yet" />
        )}

        {/* Blood Glucose Section */}
        <SectionHeader title="💉 Blood Glucose" condition={CONDITIONS.blood_glucose} readings={glucoseReadings} valueKey="glucose" />
        {glucoseReadings.length > 0 ? (
          glucoseReadings.map((r, i) => (
            <GlucoseRow key={i} reading={r} />
          ))
        ) : (
          <EmptyRow message="No blood glucose readings logged yet" />
        )}

        {/* Symptoms Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>😓 Symptoms</Text>
        </View>
        {symptoms.length > 0 ? (
          symptoms.map((s, i) => (
            <SymptomRow key={i} entry={s} />
          ))
        ) : (
          <EmptyRow message="No symptoms logged yet" />
        )}

        {/* Clear data button */}
        <TouchableOpacity style={styles.clearBtn} onPress={confirmClear}>
          <Text style={styles.clearBtnText}>🗑️  Clear All Data</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components

function OverviewStat({ label, value, colour }) {
  return (
    <View style={[styles.overviewCard, { borderTopColor: colour }]}>
      <Text style={[styles.overviewValue, { color: colour }]}>{value}</Text>
      <Text style={styles.overviewLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, condition, readings, valueKey }) {
  if (readings.length === 0) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    );
  }
  const values = readings.map(r => r[valueKey]);
  const avg    = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: condition.colour }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionAvg}>Avg: {avg} {condition.unit}</Text>
    </View>
  );
}

function BPRow({ reading }) {
  const status = getSafetyStatus('blood_pressure', reading.systolic);
  const colour = getStatusColour(status);
  return (
    <View style={styles.row}>
      <View style={[styles.statusDot, { backgroundColor: colour }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowValue}>{reading.systolic} / {reading.diastolic} <Text style={styles.rowUnit}>mmHg</Text></Text>
        <Text style={styles.rowMeta}>{formatDate(reading.timestamp)} at {formatTime(reading.timestamp)}</Text>
        {reading.notes ? <Text style={styles.rowNotes}>📝 {reading.notes}</Text> : null}
      </View>
    </View>
  );
}

function GlucoseRow({ reading }) {
  const status = getSafetyStatus('blood_glucose', reading.glucose);
  const colour = getStatusColour(status);
  return (
    <View style={styles.row}>
      <View style={[styles.statusDot, { backgroundColor: colour }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowValue}>{reading.glucose} <Text style={styles.rowUnit}>mmol/L</Text></Text>
        <Text style={styles.rowMeta}>{formatDate(reading.timestamp)} at {formatTime(reading.timestamp)}</Text>
        {reading.notes ? <Text style={styles.rowNotes}>📝 {reading.notes}</Text> : null}
      </View>
    </View>
  );
}

function SymptomRow({ entry }) {
  return (
    <View style={styles.row}>
      <View style={[styles.statusDot, { backgroundColor: COLOURS.primary }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowValue}>{entry.symptoms.join(', ')}</Text>
        <Text style={styles.rowMeta}>{formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}</Text>
        {entry.notes ? <Text style={styles.rowNotes}>📝 {entry.notes}</Text> : null}
      </View>
    </View>
  );
}

function EmptyRow({ message }) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: COLOURS.background },
  scroll:   { padding: SPACING.md, paddingBottom: SPACING.xl },

  header:    { paddingTop: SPACING.lg, marginBottom: SPACING.lg },
  title:     { fontSize: FONTS.heading, fontWeight: 'bold', color: COLOURS.primary },
  subtitle:  { fontSize: FONTS.body, color: COLOURS.muted, marginTop: 2 },
  generated: { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 4 },

  overviewRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  overviewCard: {
    flex:         1,
    backgroundColor: COLOURS.card,
    borderRadius: RADIUS.sm,
    padding:      SPACING.sm,
    alignItems:   'center',
    borderTopWidth: 3,
    shadowColor:  '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  overviewValue: { fontSize: FONTS.heading, fontWeight: 'bold' },
  overviewLabel: { fontSize: 10, color: COLOURS.muted, textAlign: 'center', marginTop: 2 },

  sectionHeader: {
    backgroundColor:  COLOURS.primary,
    borderRadius:     RADIUS.sm,
    padding:          SPACING.sm,
    marginTop:        SPACING.md,
    marginBottom:     SPACING.xs,
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    borderLeftWidth:  4,
    borderLeftColor:  COLOURS.secondary,
  },
  sectionTitle: { fontSize: FONTS.body, fontWeight: 'bold', color: '#fff' },
  sectionAvg:   { fontSize: FONTS.small, color: 'rgba(255,255,255,0.8)' },

  row: {
    backgroundColor: COLOURS.card,
    borderRadius:    RADIUS.sm,
    padding:         SPACING.sm,
    marginBottom:    SPACING.xs,
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             SPACING.sm,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  rowValue:  { fontSize: FONTS.body, fontWeight: '600', color: COLOURS.text },
  rowUnit:   { fontSize: FONTS.small, color: COLOURS.muted, fontWeight: 'normal' },
  rowMeta:   { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 2 },
  rowNotes:  { fontSize: FONTS.small, color: COLOURS.muted, marginTop: 2, fontStyle: 'italic' },

  emptyRow:  { padding: SPACING.md, alignItems: 'center' },
  emptyText: { color: COLOURS.muted, fontSize: FONTS.body },

  clearBtn: {
    marginTop:    SPACING.xl,
    borderRadius: RADIUS.sm,
    padding:      SPACING.md,
    alignItems:   'center',
    borderWidth:  1,
    borderColor:  COLOURS.danger,
  },
  clearBtnText: { color: COLOURS.danger, fontSize: FONTS.body, fontWeight: '600' },
});
