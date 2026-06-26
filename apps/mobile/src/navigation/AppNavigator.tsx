import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Text } from 'react-native'
import { colors } from '../theme/colors'
import SweatHoursScreen from '../screens/SweatHoursScreen'
import AssetRealityScreen from '../screens/AssetRealityScreen'
import JournalScreen from '../screens/JournalScreen'
import ProgressScreen from '../screens/ProgressScreen'
import SettingsScreen from '../screens/SettingsScreen'
import UrgeTimerScreen from '../screens/UrgeTimerScreen'
import CallFriendScreen from '../screens/CallFriendScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 18 }}>{label}</Text>
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tab.Screen name="Sweat" component={SweatHoursScreen} options={{ title: 'Sweat Hours', tabBarIcon: () => <TabIcon label="💧" /> }} />
      <Tab.Screen name="Assets" component={AssetRealityScreen} options={{ title: 'Asset Reality', tabBarIcon: () => <TabIcon label="🔥" /> }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ title: 'Journal', tabBarIcon: () => <TabIcon label="📓" /> }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress', tabBarIcon: () => <TabIcon label="🏆" /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', tabBarIcon: () => <TabIcon label="⚙️" /> }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={Tabs} />
      <Stack.Screen
        name="UrgeTimer"
        component={UrgeTimerScreen}
        options={{
          headerShown: true,
          title: 'Urge Timer',
          presentation: 'modal',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen
        name="CallFriend"
        component={CallFriendScreen}
        options={{
          headerShown: true,
          title: 'Call a Friend',
          presentation: 'modal',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.white,
        }}
      />
    </Stack.Navigator>
  )
}
