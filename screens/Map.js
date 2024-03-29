import React, { useState, useEffect, useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import { getDistance } from "geolib";
import { FlatList, Center, Stack, Box, Input, Icon, Text } from "native-base";
import * as Location from "expo-location";
import { db } from "../database/firebaseDB";

import { collection, getDocs } from "firebase/firestore";
import { isEmpty } from "@firebase/util";

const MapPage = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const [laundromats, setLaundromats] = useState([]);
  const [data, setData] = useState([]);

  const cards = ({ item }) => {
    // Ready State
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Select", { laundry: item });
        }}
        style={[styles.card, { width: layout.width }]}
      >
        <Center flex={2} bg="coolGray.300">
          <Icon
            as={MaterialIcons}
            name="local-laundry-service"
            color="black"
            size="20"
          />
        </Center>
        <Box flex={7} p="3">
          <Text fontWeight={"bold"} fontSize="lg">
            {item.name}
          </Text>
          <Text fontWeight={"light"} fontSize="md">
            {distanceLabel(item.distance)}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  };

  const distanceLabel = (dis) => {
    if (dis >= 1000) {
      return dis / 1000 + " กม.";
    } else {
      return dis + " ม.";
    }
  };

  useEffect(() => {
    (async () => {
      // setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        console.log(errorMsg);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      // console.log(location);

      const querySnapshot = await getDocs(collection(db, "laundromat"));
      const dat = querySnapshot.docs.map((doc) => {
        let lat = doc.get("location").latitude;
        let long = doc.get("location").longitude;
        return {
          docId: doc.id,
          name: doc.get("name"),
          latitude: lat,
          longitude: long,
          distance: getDistance(location.coords, {
            latitude: lat,
            longitude: long,
          }),
        };
      });
      setLaundromats(dat);
      setData(dat.sort((a, b) => a.distance - b.distance));
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const handleSearch = (text) => {
    if (isEmpty(text)) {
      setData(laundromats);
      return;
    }
    const data = laundromats.filter((e) => {
      return e.name.toLowerCase().includes(text.toLowerCase());
    });
    setData(data);
  };

  return (
    <Center p={"5"}>
      <Stack direction="column" space="3" w={"100%"}>
        <Input
          placeholder="ค้นหาร้านซักผ้า"
          width="100%"
          onChangeText={handleSearch}
          InputLeftElement={
            <Icon
              m="2"
              ml="3"
              size="6"
              color="gray.400"
              as={<MaterialIcons name="search" />}
            />
          }
        />
        <FlatList
          onLayout={(event) => setLayout(event.nativeEvent.layout)}
          data={data}
          renderItem={cards}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ alignItems: "flex-start" }}
        ></FlatList>
      </Stack>
    </Center>
  );
};

export default MapPage;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",

    display: "flex",
    flexDirection: "row",
    height: 80,
    marginBottom: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },
});
