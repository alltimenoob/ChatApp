import { StatusBar } from 'expo-status-bar';
import { StyleSheet,
   Image,
   Pressable,
   Platform, 
   ImageBackground,
   Text,
  View} from 'react-native';
import {useDeviceOrientation, useDimensions} from "@react-native-community/hooks";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import {LogBox} from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {

  LogBox.ignoreAllLogs(true)

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={ {headerShown : false }} name="Login" component={LoginScreen} /> 
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
 
});
