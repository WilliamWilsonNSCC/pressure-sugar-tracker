// saves and loads data to local storage
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    BP_READINGS: 'bp_readings',
    GLUCOSE_READINGS: 'glucose_readings',
    SYMPTOMS: 'symptoms',
};

// Blood Pressure

export async function saveBPReading(reading){
    // reading = { systolic, diastolic, notes, timestamp }
    try{
        const existing = await loadBPReadings();
        const updated = [reading, ...existing];
        await AsyncStorage.setItem(KEYS.BP_READINGS, JSON.stringify(updated));
        return true;
    }catch(e){
        console.error('saveBPReading error:', e);
        return false;
    }
}

export async function loadBPReadings(){
    try{
        const data = await AsyncStorage.getItem(KEYS.BP_READINGS);
        return data ? JSON.parse(data) : [];
    }catch(e){
        console.error('loadingBPReadings error:', e);
        return [];
    }
}

// Blood Glucose

export async function saveGlucoseReading(reading){
    // reading = { systolic, diastolic, notes, timestamp }
    try{
        const existing = await loadGlucoseReadings();
        const updated = [reading, ...existing];
        await AsyncStorage.setItem(KEYS.GLUCOSE_READINGS, JSON.stringify(updated));
        return true;
    }catch(e){
        console.error('saveGlucoseReading error:', e);
        return false;
    }
}

export async function loadGlucoseReadings(){
    try{
        const data = await AsyncStorage.getItem(KEYS.GLUCOSE_READINGS);
        return data ? JSON.parse(data) : [];
    }catch(e){
        console.error('loadingGlucoseReadings error:', e);
        return [];
    }
}

// Symptoms 

export async function saveSymptoms(entry){
    // reading = { systolic, diastolic, notes, timestamp }
    try{
        const existing = await loadSymptoms();
        const updated = [entry, ...existing];
        await AsyncStorage.setItem(KEYS.SYMPTOMS, JSON.stringify(updated));
        return true;
    }catch(e){
        console.error('saveSymptoms error:', e);
        return false;
    }
}

export async function loadSymptoms(){
    try{
        const data = await AsyncStorage.getItem(KEYS.SYMPTOMS);
        return data ? JSON.parse(data) : [];
    }catch(e){
        console.error('loadingSymptoms error:', e);
        return [];
    }
}

// Shared helpers

// Return alst N readings for a given loader function
export async function getLastN(loaderFn, n = 7){
    const all = await loaderFn();
    return all.slice(0, n).reverse(); // Oldest first for chart
}

// Formats a timestamp to a short date string e.g. "Apr 18"
export function formatDate(timestamp){
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

// Formats a timestamp to a time string e.g. "2:30 PM"
export function formatTime(timestamp){
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
}

// Clears all stored data (usedful for testing / reset)
export async function clearAllData() {
    try{
        await AsyncStorage.multiRemove(Object.values(KEYS));
        return true;
    }catch(e){
        console.error('clearAllData error:', e);
        return false;
    }
}