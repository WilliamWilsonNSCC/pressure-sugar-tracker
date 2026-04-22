// LogScreen - input data about bp and bg levels
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLOURS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { CONDITIONS, getSafetyStatus, getStatusColour, getStatusLabel } from '../data/conditions';
import { saveBPReading, saveGlucoseReading } from '../utils/storage';

export default function LogScreen({ route, navigation }) {
  const { conditionKey } = route.params;
  const condition = CONDITIONS[conditionKey];

  // Build initial state from condition's inputFields
  const initialValues = {};
  condition.inputFields.forEach(f => { initialValues[f.key] = ''; });

  const [values, setValues]     = useState(initialValues);
  const [notes,  setNotes]      = useState('');
  const [saving, setSaving]     = useState(false);
  const [preview, setPreview]   = useState(null); // live safety preview

  function handleChange(fieldKey, text) {
    const updated = { ...values, [fieldKey]: text };
    setValues(updated);

    // Live safety preview using the first field as primary value
    const primaryField = condition.inputFields[0].key;
    if (updated[primaryField]) {
      const status = getSafetyStatus(conditionKey, updated[primaryField]);
      setPreview(status);
    } else {
      setPreview(null);
    }
  }

  async function handleSave() {
    // Validate — all fields must be filled
    for (const field of condition.inputFields) {
      if (!values[field.key] || isNaN(parseFloat(values[field.key]))) {
        Alert.alert('Missing Value', `Please enter a valid ${field.label}.`);
        return;
      }
    }

    setSaving(true);
    const timestamp = Date.now();
    let success = false;

    if (conditionKey === 'blood_pressure') {
      success = await saveBPReading({
        systolic:  parseFloat(values.systolic),
        diastolic: parseFloat(values.diastolic),
        notes,
        timestamp,
      });
    } else if (conditionKey === 'blood_glucose') {
      success = await saveGlucoseReading({
        glucose: parseFloat(values.glucose),
        notes,
        timestamp,
      });
    }

    setSaving(false);

    if (success) {
      Alert.alert('Reading Saved ✅', 'Your reading has been logged successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', 'Could not save your reading. Please try again.');
    }
  }

  const previewColour = preview ? getStatusColour(preview) : null;
  const previewLabel  = preview ? getStatusLabel(preview)  : null;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={[styles.header, { backgroundColor: condition.colour }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerIcon}>{condition.icon}</Text>
            <Text style={styles.headerTitle}>Log {condition.label}</Text>
            <Text style={styles.headerSub}>Safe range: {condition.safeMin} – {condition.safeMax} {condition.unit}</Text>
          </View>

          <View style={styles.body}>

            {/* Input fields */}
            {condition.inputFields.map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLOURS.muted}
                  keyboardType="decimal-pad"
                  value={values[field.key]}
                  onChangeText={text => handleChange(field.key, text)}
                />
              </View>
            ))}

            {/* Live safety preview */}
            {preview && (
              <View style={[styles.previewBadge, { backgroundColor: previewColour + '22', borderColor: previewColour }]}>
                <Text style={[styles.previewText, { color: previewColour }]}>{previewLabel}</Text>
              </View>
            )}

            {/* Tips for this condition */}
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Tips</Text>
              {condition.tips.map((tip, i) => (
                <Text key={i} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="e.g. after exercise, feeling stressed..."
                placeholderTextColor={COLOURS.muted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Timestamp notice */}
            <Text style={styles.timestampNote}>
              📅 Timestamp will be saved automatically: {new Date().toLocaleString('en-CA')}
            </Text>

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled, { backgroundColor: condition.colour }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Reading'}</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLOURS.background },
  scroll: { paddingBottom: SPACING.xl },

  header: {
    padding:      SPACING.lg,
    paddingTop:   SPACING.xl,
    alignItems:   'center',
  },
  backBtn:     { alignSelf: 'flex-start', paddingTop: SPACING.md, marginBottom: SPACING.sm },
  backText:    { color: '#fff', fontSize: FONTS.body, opacity: 0.85 },
  headerIcon:  { fontSize: 36, marginBottom: SPACING.xs },
  headerTitle: { fontSize: FONTS.heading, fontWeight: 'bold', color: '#fff' },
  headerSub:   { fontSize: FONTS.small, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  body: { padding: SPACING.md },

  inputGroup:  { marginBottom: SPACING.md },
  label:       { fontSize: FONTS.body, fontWeight: '600', color: COLOURS.primary, marginBottom: SPACING.xs },
  input: {
    backgroundColor:  COLOURS.card,
    borderRadius:     RADIUS.sm,
    borderWidth:      1,
    borderColor:      COLOURS.border,
    padding:          SPACING.md,
    fontSize:         FONTS.title,
    color:            COLOURS.text,
  },
  notesInput:  { height: 80, textAlignVertical: 'top', fontSize: FONTS.body },

  previewBadge: {
    borderWidth:   1,
    borderRadius:  RADIUS.sm,
    padding:       SPACING.sm,
    marginBottom:  SPACING.md,
    alignItems:    'center',
  },
  previewText:  { fontSize: FONTS.body, fontWeight: 'bold' },

  tipsBox: {
    backgroundColor: '#EAF4F4',
    borderRadius:    RADIUS.sm,
    padding:         SPACING.md,
    marginBottom:    SPACING.md,
  },
  tipsTitle:   { fontSize: FONTS.body, fontWeight: 'bold', color: COLOURS.primary, marginBottom: SPACING.xs },
  tipText:     { fontSize: FONTS.small, color: COLOURS.text, marginBottom: 4, lineHeight: 20 },

  timestampNote: { fontSize: FONTS.small, color: COLOURS.muted, marginBottom: SPACING.lg, textAlign: 'center' },

  saveBtn: {
    borderRadius:  RADIUS.md,
    padding:       SPACING.md,
    alignItems:    'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#fff', fontSize: FONTS.title, fontWeight: 'bold' },
});
