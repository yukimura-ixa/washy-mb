import React from "react";

import {
  Center,
  Box,
  Text,
  FlatList,
  Icon,
  Button,
  IconButton,
  Modal
} from "native-base";
import { AntDesign ,FontAwesome5 } from "@expo/vector-icons";
import { useState,useEffect } from "react";
import { StyleSheet ,ActivityIndicator } from "react-native";
import { db } from "../database/firebaseDB";
import {
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";



function QueuePage({route}) {
    const [layout, setLayout] = useState({width: 0,height: 0})
    const [modalVisible,setModalVisible] = useState(false)
    const [chooseItem, setChooseItem] = useState(null)
    const {machineId, laundId} = route.params

    const [queues, setQueues] = useState([])
    const [machine, setMachine] = useState(null)
    const [wmachines, setWmachines] = useState([])
    useEffect(() => {
        // onSnapshot(collection(db, "laundromat"), (snapshot) => {
        //   setWmachines(...snapshot.docs.map((doc) => doc.get("wmachines")));
        // });
        onSnapshot(doc(db, "laundromat",laundId), (snapshot) => {
            if(!snapshot.data()){return}
            const wmachine = snapshot.data().wmachines.filter((item)=>{return item.id == machineId})[0]
            setQueues(wmachine.queue)
            setMachine(wmachine)
            setWmachines(snapshot.data().wmachines)
          });
      }, []);

    const getTimeFromDate = (date)=>{
        return date.getHours().toString().padStart(2,"0")+":"+date.getMinutes().toString().padStart(2,"0")
    }
    const onDelete = async (id)=>{

        const storeRef = doc(db, "laundromat",laundId)
        const tempmachines = wmachines.filter(val=>{
            if(val.id != machineId){
                return val
            }
        })
        const tempqueues = queues.filter(val=>{
                if(val.id != id){
                    return val
                }
        })
        function filterQueue(queues=[]){
            let whitelist = {"washing":0,"in queue":0}
            return queues.filter((val)=>{return whitelist[val.status] != undefined})
          }
        const temp2machines = [...tempmachines,{
            id:machine.id, 
            capacity:machine.capacity,
            duration:machine.duration, 
            price:{cold:machine.price.cold,hot:machine.price.hot},
            name:machine.name,
            status:filterQueue(tempqueues).length>0?"queue":"ok",
            queue:tempqueues
        }]
        temp2machines.sort((a,b)=>{
            let sweight = {"ok":0,"notok":2,"queue":1}
            let minus = sweight[a.status] - sweight[b.status]  
            let minus2 = b.capacity - a.capacity
            return isNaN(minus)?0:minus==0?minus2:minus
          })
        await updateDoc(storeRef, {
            "wmachines":temp2machines
        });
    }
    const cards = ({item})=>{
        // Ready State
        if(item.status=="washing"){
            return <Box style={[styles.card, {width:layout.width}]}>
            <Center flex={2} bg="blue.500">
                <Icon as={AntDesign} name="checkcircle" color="#00f710" size="9"/>
            </Center>
            <Box flex={5} p="3">
                <Text fontWeight={"bold"} fontSize={{base: "sm", md: "md", lg: "lg"}}>{item.user_id}</Text>
                <Text fontSize={"sm"} color="#454545">เวลาจอง: {getTimeFromDate(item.reserve_time.toDate())} น.</Text>
            </Box>
            <Box flex={2}>
                <IconButton colorScheme="red"  onPress={()=>{setChooseItem(item);setModalVisible(true)}} variant="ghost" _icon={{
                    as: FontAwesome5,
                    name: "trash"
                }} flex={1}/>
            </Box>
            </Box>

        // queue State
        }else if(item.status=="in queue"){
            return <Box style={[styles.card, {width:layout.width}]}>
                <Center flex={2} bg="blue.500">
                    {/* <Icon as={MaterialCommunityIcons } name="washing-machine" color="black" size="7"/> */}
                    <ActivityIndicator size="large" color="#6fade1" />
                </Center>
                <Box flex={5} p="3">
                    <Text fontWeight={"bold"} fontSize={{base: "sm", md: "md", lg: "lg"}}>{item.user_id}</Text>
                    <Text fontSize={"sm"} color="#454545">เวลาจอง: {getTimeFromDate(item.reserve_time.toDate())} น.</Text>
                    
                </Box>
                <Box flex={2}>
                    <IconButton colorScheme="red" onPress={()=>{setChooseItem(item);setModalVisible(true)}} variant="ghost" _icon={{
                    as: FontAwesome5,
                    name: "trash"
                    }} flex={1}/>
                </Box>     
            </Box>
        }
    }
  return (
    <Box bg="primary.400" h="full">
        <Box bg="primary.200" mx="3" flex={1} display={"flex"} flexDirection="column">
            <Box py="5" flex={8} padding={2} onLayout={(event) => setLayout(event.nativeEvent.layout)}>
                <Text fontWeight="bold" fontSize={{base: "4xl", md: "5xl", lg: "6xl"}}>คิว</Text>
                <FlatList 
                    data={queues} 
                    renderItem={cards} 
                    keyExtractor={item=>item.id} 
                    contentContainerStyle={{alignItems:"flex-start"}}
                ></FlatList>
            </Box>
        </Box>



        {/* Modal */}
        <Modal isOpen={modalVisible} onClose={setModalVisible} size={"xl"}>
        <Modal.Content maxH="212">
          <Modal.CloseButton />
          <Modal.Header>{"คุณต้องการที่จะนำ "+(!chooseItem?"None":chooseItem.user_id)+" ออกจากคิว?"}</Modal.Header>
          <Modal.Footer justifyContent={"flex-start"}>
            <Button.Group space={2}>
                <Button colorScheme={"red"} onPress={() => {
                  setModalVisible(false);onDelete(chooseItem.id)
                }}>
                    นำคิวออก
                </Button>
                <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                    setModalVisible(false);setChooseItem(null)
                }}>
                    ยกเลิก
                </Button>
              
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
        </Modal>
        
    </Box>
  );
}

export default QueuePage;

const styles = StyleSheet.create({
    card: {
        backgroundColor:"#fff", 
        borderRadius:8, 
        overflow:"hidden",

        display:"flex",
        flexDirection:"row",
        height:80,
        marginBottom:8,


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