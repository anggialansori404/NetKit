/**
 * NetKit v8 - Material Design 3
 * Navigation: React Navigation Stack + Paper BottomNavigation
 * Back gesture: pops stack (not closes app)
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { PaperProvider, BottomNavigation, FAB } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

// Main tabs with MD3 BottomNavigation + FAB
function MainTabs({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'klien', title: 'Klien', focusedIcon: 'bank', unfocusedIcon: 'bank-outline' },
    { key: 'tools', title: 'Tools', focusedIcon: 'wrench', unfocusedIcon: 'wrench-outline' },
    { key: 'ssh', title: 'SSH', focusedIcon: 'console', unfocusedIcon: 'console-line' },
    { key: 'sftp', title: 'SFTP', focusedIcon: 'folder', unfocusedIcon: 'folder-outline' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    klien: () => <KlienScreenMD3 navigation={navigation} />,
    tools: () => <ToolsScreenMD3 navigation={navigation} />,
    ssh: () => <SshScreenMD3 navigation={navigation} />,
    sftp: () => <SftpScreenMD3 navigation={navigation} />,
  });

  const handleFabPress = () => {
    const route = routes[index].key;
    if (route === 'klien') {
      navigation.navigate('ClientForm', {});
    } else if (route === 'ssh') {
      // TODO: new SSH session
    }
  };

  return (
    <>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        compact={true}
      />
      <FAB
        icon="plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 80 }}
        onPress={handleFabPress}
      />
    </>
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
              // Android back gesture pops stack automatically
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
