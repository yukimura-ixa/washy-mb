import "react-native-gesture-handler";
import { NativeBaseProvider } from "native-base";
import MainNavigator from "./navigations/navigator";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uuidv4 } from "@firebase/util";
import { LogBox } from "react-native";
LogBox.ignoreAllLogs();
async function storeData(value) {
  try {
    await AsyncStorage.setItem("user_id", value);
  } catch (e) {
    console.error(e);
  }
}
export async function getData() {
  try {
    const value = await AsyncStorage.getItem("user_id");
    // console.log("AsyncStorage value: ");
    if (value !== null) {
      // storeData("abcdef");
      // console.log(value);
      return value;
    } else {
      storeData(uuidv4());
      setSwitch("near", "false");
      setSwitch("qready", "false");
      return getData();
    }
    console.log(first);
    // return value;
  } catch (e) {
    console.error(e);
  }
}
export async function setSwitch(mode, value) {
  //mode: near(ใกล้ซักเสร็จ)    qready(ถึงคิวแล้ว)
  try {
    await AsyncStorage.setItem(mode, value);
  } catch (e) {
    console.error(e);
  }
}
export async function getSwitch(mode) {
  try {
    const value = await AsyncStorage.getItem(mode);
    if (value !== null) {
      return value;
    } else {
      setSwitch(mode, "false");
      return getSwitch(mode);
    }
    // return value;
  } catch (e) {
    console.error(e);
  }
}
function initData() {
  getSwitch("near");
  getSwitch("qready");
  getData();
}

export default function App() {
  initData();
  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <MainNavigator></MainNavigator>
        <StatusBar />
      </NativeBaseProvider>
    </Provider>
  );
}
