// contain all navigation links for the applications
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLOURS } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import SymptomScreen from '../screens/SymptomScreen';
import TrendsScreen from '../screens/TrendsScreen';
import SummaryScreen from '../screens/SummaryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack(){
    return(
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={DashboardScreen} />
            <Stack.Screen name="Logging" component={LogScreen} />
        </Stack.Navigator>
    );
}

export default function Navigator(){
    return (
        <Tab.Navigator screenOptions = { ({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: COLOURS.secondary,
            tabBarInactiveTintColor: COLOURS.muted,
            tabBarStyle: {
                backgroundColor: COLOURS.card,
                borderTopColor: COLOURS.border,
                paddingBottom: 6,
                paddingTop: 6,
                height: 60,
            },
            tabBarIcon: ({ focused, color, size }) => {
                const icons = {
                    Dashboard: focused ? 'home' : 'home-outline',
                    Symptoms: focused? 'body' : 'body-outline',
                    Trends: focused ? 'stats-chart' : 'stats-charted-outline',
                    Summary: focused ? 'document-text' : 'document-text-outline',
                };
                return <Ionicons name={icons[route.name]} size={size} color={color} />;
            },
        })}
        >
            <Tab.Screen name="Dashboard" components={DashboardStack} options={{ title: 'Home' }} />
            <Tab.Screen name="Symptoms" components={SymptomScreen} options={{ title: 'Symptoms' }} />
            <Tab.Screen name="Trends" components={TrendsScreen} options={{ title: 'Trends' }} />
            <Tab.Screen name="Summary" components={SummaryScreen} options={{ title: 'Summary' }} />
        </Tab.Navigator>
    );
}