/**
 * NetKit v8 - Material Design 3 (strict baseline)
 * Navigation: Stack + Bottom Tabs (React Navigation, smooth + animated)
 * Back gesture: pops stack (not closes app)
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { md3Theme } from './src/ui/md3theme';

// Screens
import { KlienScreenMD3 } from './src/screens/KlienScreenMD3';
import { ToolsScreenMD3 } from './src/screens/ToolsScreenMD3';
import { SshScreenMD3 } from './src/screens/SshScreenMD3';
import { SftpScreenMD3 } from './src/screens/SftpScreenMD3';
import { ClientDetailScreenMD3 } from './src/screens/ClientDetailScreenMD3';
import { ClientFormScreenMD3 } from './src/screens/ClientFormScreenMD3';
import { ToolDetailScreenMD3 } from './src/screens/ToolDetailScreenMD3';
import { ToolRunnerScreenMD3 } from './src/screens/ToolRunnerScreenMD3';
import { PengaturanScreenMD3 } from './src/screens/PengaturanScreenMD3';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabIcon(routeName: string, focused: boolean, color: string, size: number) {
  const icons: Record<string, [string, string]> = {
    KlienTab: ['bank', 'bank-outline'],
    ToolsTab: ['wrench', 'wrench-outline'],
    SSHTab: ['console', 'console-line'],
    SFTPTab: ['folder', 'folder-outline'],
  };
  const [f, u] = icons[routeName] || ['circle', 'circle-outline'];
  return <MaterialCommunityIcons name={focused ? f : u} color={color} size={size} />;
}

// Bottom tabs — MD3 styled, smooth animated transitions
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: md3Theme.colors.primary,
        tabBarInactiveTintColor: md3Theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: md3Theme.colors.surfaceVariant,
          borderTopWidth: 0,
          elevation: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => tabIcon(route.name, focused, color, size),
        // Smooth animation
        animation: 'shift',
        lazy: false,
      })}
    >
      <Tab.Screen name="KlienTab" component={KlienScreenMD3} options={{ title: 'Klien' }} />
      <Tab.Screen name="ToolsTab" component={ToolsScreenMD3} options={{ title: 'Tools' }} />
      <Tab.Screen name="SSHTab" component={SshScreenMD3} options={{ title: 'SSH' }} />
      <Tab.Screen name="SFTPTab" component={SftpScreenMD3} options={{ title: 'SFTP' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={md3Theme}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="MainTabs"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreenMD3} />
            <Stack.Screen name="ClientForm" component={ClientFormScreenMD3} />
            <Stack.Screen name="ToolDetail" component={ToolDetailScreenMD3} />
            <Stack.Screen name="ToolRunner" component={ToolRunnerScreenMD3} />
            <Stack.Screen name="Settings" component={PengaturanScreenMD3} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
