/**
 * NetKit v8 - Material Design 3 (strict baseline)
 * Navigation: Stack + Bottom Tabs (React Navigation, smooth + animated)
 * Back gesture: pops stack (not closes app)
 */

import React from 'react';
import { StatusBar, View, StyleSheet, useColorScheme, Animated, Easing } from 'react-native';
import { PaperProvider, FAB, useTheme, MD3Theme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { md3Theme, md3DarkTheme } from './src/ui/md3theme';

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
import { SessionFormScreenMD3 } from './src/screens/SessionFormScreenMD3';
import { SshTerminalScreenMD3 } from './src/screens/SshTerminalScreenMD3';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Material Design 3 Fade-Through Scene Transition (scale 0.96 -> 1.0 + cross-fade)
const forFadeThrough = ({ current }: { current: { progress: any } }) => ({
  sceneStyle: {
    opacity: current.progress.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        scale: current.progress.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.96, 1, 0.96],
          extrapolate: 'clamp',
        }),
      },
    ],
  },
});

const tabTransitionSpec = {
  animation: 'timing' as const,
  config: {
    duration: 220,
    easing: Easing.out(Easing.cubic),
  },
};

// M3 Active Tab Indicator Pill with animated scaleX & opacity
const TabIconItem = React.memo(function TabIconItem({
  routeName,
  focused,
  color,
  size,
  theme,
}: {
  routeName: string;
  focused: boolean;
  color: string;
  size: number;
  theme: MD3Theme;
}) {
  const anim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused, anim]);

  const icons: Record<string, [string, string]> = {
    KlienTab: ['bank', 'bank-outline'],
    ToolsTab: ['wrench', 'wrench-outline'],
    SSHTab: ['console', 'console-line'],
    SFTPTab: ['folder', 'folder-outline'],
  };
  const [f, u] = icons[routeName] || ['circle', 'circle-outline'];

  return (
    <View style={styles.tabIconWrapper}>
      <Animated.View
        style={[
          styles.tabIndicatorPill,
          {
            backgroundColor: theme.colors.secondaryContainer,
            opacity: anim,
            transform: [
              {
                scaleX: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      />
      <MaterialCommunityIcons name={focused ? f : u} color={color} size={size} />
    </View>
  );
});

// Bottom tabs — MD3 styled, smooth animated transitions + FAB
function MainTabs({ navigation }: any) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState('KlienTab');
  const insets = useSafeAreaInsets();
  const fabAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: activeTab === 'ToolsTab' ? 0 : 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, fabAnim]);

  const handleFabPress = () => {
    if (activeTab === 'KlienTab') {
      navigation.navigate('ClientForm', {});
    } else if (activeTab === 'SSHTab' || activeTab === 'SFTPTab') {
      navigation.navigate('SessionForm', {});
    }
  };

  return (
    <View style={styles.tabsContainer}>
      <Tab.Navigator
        screenOptions={({ route }: { route: any }) => ({
          headerShown: false,
          // M3 Navigation Bar: active icon = onSecondaryContainer, inactive = onSurfaceVariant
          tabBarActiveTintColor: theme.colors.onSecondaryContainer,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            // M3 Navigation Bar: 80dp height, elevation.level2 background, no divider
            height: 80,
            backgroundColor: theme.colors.elevation.level2,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarLabelStyle: {
            // M3 labelMedium: 12sp / 500
            fontSize: 12,
            fontWeight: '500',
            marginBottom: 8,
          },
          tabBarItemStyle: {
            borderRadius: 16,
          },
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
            <TabIconItem
              routeName={route.name}
              focused={focused}
              color={color}
              size={size}
              theme={theme}
            />
          ),
          sceneStyleInterpolator: forFadeThrough,
          transitionSpec: tabTransitionSpec,
          freezeOnBlur: true,
          lazy: true,
        })}
        screenListeners={{
          state: (e: any) => {
            const routes = e.data?.state?.routes;
            const index = e.data?.state?.index;
            if (routes && typeof index === 'number') {
              setActiveTab(routes[index].name);
            }
          },
        }}
      >
        <Tab.Screen name="KlienTab" component={KlienScreenMD3} options={{ title: 'Klien' }} />
        <Tab.Screen name="ToolsTab" component={ToolsScreenMD3} options={{ title: 'Tools' }} />
        <Tab.Screen name="SSHTab" component={SshScreenMD3} options={{ title: 'SSH' }} />
        <Tab.Screen name="SFTPTab" component={SftpScreenMD3} options={{ title: 'SFTP' }} />
      </Tab.Navigator>
      <Animated.View
        style={[
          styles.fabWrapper,
          {
            bottom: 80 + insets.bottom,
            opacity: fabAnim,
            transform: [{ scale: fabAnim }],
          },
        ]}
        pointerEvents={activeTab === 'ToolsTab' ? 'none' : 'auto'}
      >
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
          color={theme.colors.onPrimaryContainer}
          onPress={handleFabPress}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: { flex: 1 },
  tabIconWrapper: {
    width: 64,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabIndicatorPill: {
    position: 'absolute',
    width: 64,
    height: 32,
    borderRadius: 16,
  },
  fabWrapper: {
    position: 'absolute',
    right: 16,
  },
  fab: {
    borderRadius: 16,
  },
});

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? md3DarkTheme : md3Theme;
  const navTheme = isDark ? NavDarkTheme : NavLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <NavigationContainer theme={navTheme}>
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
            <Stack.Screen name="SessionForm" component={SessionFormScreenMD3} />
            <Stack.Screen name="SshTerminal" component={SshTerminalScreenMD3} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
