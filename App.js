import { StyleSheet } from 'react-native';
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
        <Stack.Screen options={ {headerShown : false }} name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
 
});
