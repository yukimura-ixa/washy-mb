import React, { useState } from 'react';

import {
  Text, Button,View,Icon
} from "native-base";
import { StyleSheet} from "react-native";
import { Camera, CameraType, PermissionStatus } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from '@react-navigation/native';

function QRcodePage({navigation, route}) {
  const {machineId, laundId,laundName,queueId} = route.params
  const [scanned, setScanned] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const isFocused = useIsFocused()

  if(!isFocused){
    return null;
  }
  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission}  >{"grant permission".toUpperCase()}</Button>
      </View>
    );
  }

  const handleBarCodeScanned = ({type, data }) => {
    setScanned(true);
    try{
      let _data = JSON.parse(data)
      console.log(_data.machineId, _data.laundId)
      console.log("send ",machineId,laundId)
      if(machineId == _data.machineId && laundId == _data.laundId){
        navigation.navigate("Payment",{machineId:_data.machineId,laundId:_data.laundId,queueId:queueId
      })  
      }else{
        alert(`machine not matched(select:${laundId}#${machineId}, scan:${_data.laundId}#${_data.machineId})`)
      }

    }catch(error){
      console.log("Unable to parse: ",error)
    }
    

    setTimeout(()=>{
      setScanned(false)
    },3000)
  };


  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        ratio="16:9"
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.text, {}]}>แสกน QR Code</Text>
          <Icon
            as={MaterialCommunityIcons}
            name="scan-helper"
            color="white"
            size="200"
          />
          <Text style={[styles.text, {}]}>
            ไปที่เครื่องซักผ้าที่คุณเลือกแล้วสแกน QR Code หน้าเครื่อง
          </Text>
        </View>
      </Camera>
    </View>
  );
}

export default QRcodePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    margin: 64,
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"transparent"


  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign:'center',
    paddingVertical:20,
  },
});
