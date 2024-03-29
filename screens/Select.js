import React, { useRef } from "react";
import { db } from "../database/firebaseDB";
import { doc, onSnapshot } from "firebase/firestore";
import { Center, Box, Text, Image, FlatList, Icon, Link } from "native-base";
import { AntDesign, Octicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";

function SelectPage({ route, navigation }) {
  const { laundry } = route.params;
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const [wmachines, setWmachines] = useState([]);
  const [timelist, setTimelist] = useState([]);

  const refwmachines = useRef([]);
  useEffect(() => {
    // onSnapshot(collection(db, "laundromat"), (snapshot) => {
    //   setWmachines(...snapshot.docs.map((doc) => {console.log(doc.id);return doc.get("wmachines")}));
    // });
    onSnapshot(doc(db, "laundromat", laundry.docId), (snapshot) => {
      if (!snapshot.data()) {
        return;
      }
      setWmachines(snapshot.data().wmachines);
      refwmachines.current = snapshot.data().wmachines;
    });
  }, []);
  useEffect(() => {
    setInterval(() => {
      let arr = [];
      refwmachines.current.forEach((val, ind) => {
        if (val.status == "queue") {
          let estimate = 0;
          let filterqueue = val.queue.filter(
            (val2, ind2) =>
              val2.status == "washing" || val2.status == "in queue"
          );
          if (filterqueue[0].status == "washing") {
            estimate =
              filterqueue[0].finish_time.toDate().getTime() +
              val.duration * (filterqueue.length - 1) * 60 * 1000;
          } else {
            estimate =
              new Date().getTime() +
              val.duration * filterqueue.length * 60 * 1000;
          }

          arr.push({
            machine: val,
            time: estimate - new Date().getTime(),
            count: filterqueue.length,
          });
        }
      });
      setTimelist(arr);
    }, 1000);
  }, []);

  function displayTime(millis) {
    let out = "";
    let milli = (((millis % 1000) % 60) % 60) % 24;
    let sec = Math.floor((millis / 1000) % 60);
    let min = Math.floor((millis / 1000 / 60) % 60);
    let hour = Math.floor(millis / 1000 / 60 / 60);
    if (hour >= 1) {
      out += hour + " ชั่วโมง ";
    }
    out += min + " นาที";
    return out;
  }

  let distanceLabel;
  if (laundry.distance >= 1000) {
    distanceLabel = laundry.distance / 1000 + " กม.";
  } else {
    distanceLabel = laundry.distance + " ม.";
  }

  const cards = ({ item }) => {
    // Ready State
    if (item.status == "ok") {
      return (
        <TouchableOpacity
          style={[styles.card, { width: layout.width }]}
          onPress={() => {
            navigation.navigate("Reserve", {
              laundId: laundry.docId,
              machineId: item.id,
            });
          }}
        >
          <Center flex={2} bg="coolGray.300">
            <Icon as={AntDesign} name="checkcircle" color="#00f710" size="9" />
          </Center>
          <Box flex={7} p="3">
            <Text fontWeight={"bold"} fontSize="lg">
              {item.name}
            </Text>
            <Text fontSize={"sm"} color="#454545">
              {item.capacity} กิโลกรัม
            </Text>
          </Box>
        </TouchableOpacity>
      );

      // InUse State
    } else if (item.status == "queue") {
      return (
        <TouchableOpacity
          style={[styles.card, { width: layout.width }]}
          onPress={() => {
            navigation.navigate("Reserve", {
              laundId: laundry.docId,
              machineId: item.id,
            });
          }}
        >
          <Center flex={2} bg="coolGray.300">
            {/* <Icon as={MaterialCommunityIcons } name="washing-machine" color="black" size="7"/> */}
            <ActivityIndicator size="large" color="#6fade1" />
          </Center>
          <Box flex={7} p="3">
            <Text fontWeight={"bold"} fontSize="lg">
              {item.name}
            </Text>
            <Text fontSize={"sm"} color="#454545">
              อีก &nbsp;
              {timelist.filter((val, ind) => val.machine.id == item.id)[0]
                ? displayTime(
                    timelist.filter((val, ind) => val.machine.id == item.id)[0]
                      .time
                  )
                : "0 นาที"}
              (
              {timelist.filter((val, ind) => val.machine.id == item.id)[0]
                ? timelist.filter((val, ind) => val.machine.id == item.id)[0]
                    .count
                : "0 คิว"}{" "}
              คิว)
            </Text>
          </Box>
        </TouchableOpacity>
      );

      //NotReady State
    } else if (item.status == "notok") {
      return (
        <Box style={[styles.card, { width: layout.width }]}>
          <Center flex={2} bg="coolGray.300">
            <Icon as={Octicons} name="x-circle-fill" color="#fa1616" size="9" />
          </Center>
          <Box flex={7} p="3">
            <Text fontWeight={"bold"} fontSize="lg">
              {item.name}
            </Text>
            <Text fontSize={"sm"} color="#454545">
              งดให้บริการชั่วคราว
            </Text>
          </Box>
        </Box>
      );
    }
  };
  return (
    <Box bg="primary.400" h="full">
      <Image
        source={{
          uri: "https://images.samsung.com/is/image/samsung/assets/th/members/whats-new/samsung-launches-washing-machine-and-dryers-with-ai-control-system/WM_white-shirt-mobile-668x518px-min.jpg?$FB_TYPE_B_JPG$",
        }}
        alt="Alternate Text"
        width="100%"
        height="40%"
      />

      <Box
        bg="primary.200"
        mx="3%"
        h="60%"
        p="4"
        display={"flex"}
        flexDirection="column"
      >
        <Text
          fontWeight="bold"
          fontSize={{
            base: "3xl",
            md: "4xl",
            lg: "5xl",
          }}
          flex={1}
        >
          {laundry.name}
        </Text>
        <Text fontSize="md" flex={1}>
          {distanceLabel}
        </Text>
        <Link
          mb={"3"}
          alignSelf={"flex-end"}
          onPress={() => {
            const scheme = Platform.select({
              ios: "maps:0,0?q=",
              android: "geo:0,0?q=",
            });
            const latLng = `${laundry.latitude},${laundry.longitude}`;
            const label = laundry.name;
            const url = Platform.select({
              ios: `${scheme}${label}@${latLng}`,
              android: `${scheme}${latLng}(${label})`,
            });
            Linking.openURL(url);
          }}
        >
          ดูในแผนที่
        </Link>

        <Box flex={8} onLayout={(event) => setLayout(event.nativeEvent.layout)}>
          <FlatList
            data={wmachines.sort((a, b) => a.name.localeCompare(b.name))}
            renderItem={cards}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ alignItems: "flex-start" }}
          ></FlatList>
        </Box>
      </Box>
    </Box>
  );
}

export default SelectPage;
// display="flex" flexDirection="row" h="24" w={layout.width} my="2%"
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
