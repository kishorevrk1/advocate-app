import React from 'react'
import { View, StyleSheet } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import HomeScreen from '../screens/HomeScreen'
import MyCasesScreen from '../screens/MyCasesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import AdvisorScreen from '../screens/AdvisorScreen'
import NewCaseScreen from '../screens/NewCaseScreen'
import CaseAnalysisScreen from '../screens/CaseAnalysisScreen'
import DemandLetterScreen from '../screens/DemandLetterScreen'
import PhoneScriptScreen from '../screens/PhoneScriptScreen'
import OutcomeTrackerScreen from '../screens/OutcomeTrackerScreen'
import { colors } from '../theme/colors'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

type IoniconName = React.ComponentProps<typeof Ionicons>['name']
type TabName = 'Home' | 'MyCases' | 'Advisor' | 'Settings'

const TAB_ICONS: Record<TabName, { active: IoniconName; inactive: IoniconName }> = {
  Home:     { active: 'home',                    inactive: 'home-outline' },
  MyCases:  { active: 'briefcase',               inactive: 'briefcase-outline' },
  Advisor:  { active: 'chatbubble-ellipses',      inactive: 'chatbubble-ellipses-outline' },
  Settings: { active: 'settings',                inactive: 'settings-outline' },
}

const tabScreenOptions = ({ route }: { route: { name: string } }) => ({
  headerShown: false,
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor:   colors.goldPrimary,
  tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
  tabBarLabelStyle: styles.tabLabel,
  tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
    const icons = TAB_ICONS[route.name as TabName]
    if (!icons) return null
    const name = focused ? icons.active : icons.inactive
    return (
      <View style={styles.iconWrap}>
        {focused && <View style={styles.activeIndicator} />}
        <Ionicons name={name} size={size} color={color} />
      </View>
    )
  },
})

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyCases"  component={MyCasesScreen}  options={{ tabBarLabel: 'My Cases' }} />
      <Tab.Screen name="Advisor"  component={AdvisorScreen}  options={{ tabBarLabel: 'Advisor' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"           component={HomeTabs} />
      <Stack.Screen name="NewCase"        component={NewCaseScreen} />
      <Stack.Screen name="CaseAnalysis"   component={CaseAnalysisScreen} />
      <Stack.Screen name="DemandLetter"   component={DemandLetterScreen} />
      <Stack.Screen name="PhoneScript"    component={PhoneScriptScreen} />
      <Stack.Screen name="OutcomeTracker" component={OutcomeTrackerScreen} />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(8,12,20,0.97)',
    borderTopColor:  'rgba(201,168,76,0.20)',
    borderTopWidth:  1,
    height:          68,
    paddingBottom:   10,
    paddingTop:      6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  activeIndicator: {
    position:        'absolute',
    top:             0,
    width:           32,
    height:          3,
    borderRadius:    2,
    backgroundColor: colors.goldPrimary,
  },
  tabLabel: {
    fontSize:   11,
    fontWeight: '600' as const,
  },
})
