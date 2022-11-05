import 'react-native-gesture-handler';
import { styled } from 'nativewind';
import { NativeBaseProvider } from "native-base";
import MainNavigator from './navigations/navigator';


export default function App() {
  return (
    <NativeBaseProvider>
      <MainNavigator></MainNavigator>
    </NativeBaseProvider>
  );
}
