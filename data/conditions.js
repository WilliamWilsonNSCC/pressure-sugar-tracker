export const CONDITIONS = {
    blood_pressure: {
        key: 'blood_pressure',
        label: 'Blood Pressure',
        unit: 'mmHg',
        safeMin: 90,
        safeMax: 130,
        warnMax: 140,
        inputFields: [
            {key: 'systolic', label: 'Systolic (top)', placeholder: 'e.g. 120'},
            {key: 'diastolic', label: 'Diastolic (bottom)', placeholder: 'e.g. 80'},
        ],
        icon: '🩸',
        colour: '#E74C3C',
        tips:[
            'Measure at the same time everyday',
            'Sit quietly 5 minutes before taking reading',
            'Avoid caffeine 30 minutes prior to reading',
        ],
    },

    blood_glucose: {
        key: 'blood_glucose',
        label: 'Blood Glucose',
        unit: 'mmol/L',
        safeMin: 4.0,
        safeMax: 7.0,
        warnMax: 10.0,
        inputFields: [
            {key: 'glucose', label: 'Glucose Reading', placeholder: 'e.g. 5.5'},
        ],
        icon: '💉',
        colour: '#2A7D7B',
        tips:[
            'Log fasting readings before breakfast',
            'Also log 2 hours after meals',
            'Note if you exercised before the reading (exercise can cause sugars to fluctuate)',
        ],
    },
};

export function getSafetyStatus(conditionKey, value){
    const cond = CONDITIONS[conditionKey];
    if(!cond) return 'safe';
    const v = parseFloat(value);
    if(isNaN(v)) return 'safe';
    if(v >= cond.safeMin && v <= cond.safeMax) return 'safe';
    if(v > cond.safeMax && v <= cond.warnMax) return 'warning';
    return 'danger';
}

export function getStatusColour(status){
    switch(status){
        case 'safe': return '#27AE60';
        case 'warning': return '#F39C12';
        case 'danger': return '#E74C3C';
        default: return '#888888 ';
    }
}

export function getStatusLabel(status){
    switch(status){
        case 'safe': return '✅ In Safe Range';
        case 'warning': return '⚠️ Borderline';
        case 'danger': return '🔴 Out of Range';
        default: return '-';
    }
}