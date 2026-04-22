// Symptoms Screen - displaying symptoms related to high/low sugars and blood pressure
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, TextInput, } from 'react-native';
import { COLOURS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { saveSymptoms } from '../utils/storage';

const SYMPTOM_LIST = [
    { key: 'none', label: '✅ None - Feeling Fine'},
    { key: 'fatigue', label: '😴 Fatigue'},
    { key: 'dizziness', label: '💫 Dizziness'},
    { key: 'headache', label: '🤕 Headache'},
    { key: 'chest_pain', label: '💔 Chest Pain'},
    { key: 'shortness', label: '😮‍💨 Shortness of Breath'},
    { key: 'blurred_vision', label: '👁️ Blurred Vision'},
    { key: 'nausea', label: '🤢 Nausea'},
    { key: 'swelling', label: '🦵 Swelling'},
    { key: 'sweating', label: '💧 Sweating'},
    { key: 'palpitations', label: '💓 Palpitations'},
    { key: 'numbness', label: '🖐️ Numbness / Tingling'},
    { key: 'thirst', label: '🥤 Excessive Thirst'},
];

export default function SymptomScreen(){
    const [selected, setSelected] = useState([]);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    function toggleSymptom(key){
        // If none selected, clears everything else and selects none
        if(key === 'none'){
            setSelected(['none']);
        }else{
            // If any other symptom is selected, none is removed from selection list
            setSelected(prev => {
                const withoutNone = prev.filter(k => k !== 'none');
                return withoutNone.includes(key) ? withoutNone.filter(k => k !== key) : [...withoutNone, key];
            });
        }
    }

    async function handleSave() {
        if(selected.length === 0){
            Alert.alert('No Symptoms Selected', 'Please tap at least one symptom to log.');
            return;
        }
        setSaving(true);
        const success = await saveSymptoms({
            symptoms: selected, 
            notes,
            timestamp: Date.now(),
        });
        setSaving(false);
        if(success){
            Alert.alert('Symptoms Logged ✅', 'Your symptoms have been saved.', [
                { text: 'OK', onPress: () => { setSelected([]); setNotes(''); } },
            ]);
        }else {
            Alert.alert('Error', 'Could not save symptoms. Please try again.');
        }
    }

    return(
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.header}>
                    <Text style={styles.title}>Symptom Logger</Text>
                    <Text style={styles.subtitle}>Tap everything you are currently experiencing</Text>
                </View>

                {/* Symptom Grid */}
                <View style={styles.grid}>
                    {SYMPTOM_LIST.map(s => {
                        const active = selected.includes(s.key);
                        return (
                            <TouchableOpacity
                                key={s.key}
                                style={[styles.chip, active && styles.chipActive]}
                                onPress={() => toggleSymptom(s.key)}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Selected count */}
                {selected.length > 0 && (
                    <Text style={styles.selectedCount}>
                        {selected.length} symptom{selected.length > 1 ? 's' : ''} selected
                    </Text>
                )}

                {/* Notes */}
                <View style={styles.notesGroup}>
                    <Text style={styles.label}>Additional Notes (optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="e.g. started after lunch, mild discomfort..."
                        placeholderTextColor={COLOURS.muted}
                        multiline
                        numberOfLines={3}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Log Symptoms'}</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLOURS.background },
  scroll: { padding: SPACING.md, paddingBottom: SPACING.xl },

  header:   { paddingTop: SPACING.lg, marginBottom: SPACING.lg },
  title:    { fontSize: FONTS.heading, fontWeight: 'bold', color: COLOURS.primary },
  subtitle: { fontSize: FONTS.body, color: COLOURS.muted, marginTop: 4 },

  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           SPACING.sm,
    marginBottom:  SPACING.lg,
  },
  chip: {
    backgroundColor: COLOURS.card,
    borderRadius:    RADIUS.lg,
    paddingVertical:   SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth:     1,
    borderColor:     COLOURS.border,
  },
  chipActive: {
    backgroundColor: COLOURS.secondary,
    borderColor:     COLOURS.secondary,
  },
  chipText:       { fontSize: FONTS.body, color: COLOURS.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  selectedCount: {
    fontSize:     FONTS.body,
    color:        COLOURS.secondary,
    fontWeight:   '600',
    marginBottom: SPACING.md,
    textAlign:    'center',
  },

  notesGroup:  { marginBottom: SPACING.lg },
  label:       { fontSize: FONTS.body, fontWeight: '600', color: COLOURS.primary, marginBottom: SPACING.xs },
  notesInput: {
    backgroundColor:   COLOURS.card,
    borderRadius:      RADIUS.sm,
    borderWidth:       1,
    borderColor:       COLOURS.border,
    padding:           SPACING.md,
    fontSize:          FONTS.body,
    color:             COLOURS.text,
    height:            90,
    textAlignVertical: 'top',
  },

  saveBtn: {
    backgroundColor: COLOURS.secondary,
    borderRadius:    RADIUS.md,
    padding:         SPACING.md,
    alignItems:      'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: '#fff', fontSize: FONTS.title, fontWeight: 'bold' },
});