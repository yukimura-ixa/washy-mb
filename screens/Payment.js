import React from "react";

import {
  Center,
  Box,
  Text,
  Flex,
  Switch,
  IconButton,
  Modal,
  Icon
} from "native-base";
import { AntDesign,FontAwesome,Entypo   } from "@expo/vector-icons";
import { View } from "react-native";
import { useState, useEffect } from "react";
import { db, auth } from "../database/firebaseDB";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { async } from "@firebase/util";
import { getData } from "../App";

function PaymentPage({route,navigation}) {
    const {machineId, laundId,queueId} = route.params

    const [queues, setQueues] = useState([])
    const [machine,setMachine] = useState({})
    const [wmachines, setWmachines] = useState([])
    const [laundInfo, setLaundInfo] = useState({})
    const [isCool, setIsCool] = useState(false)
    const [showModal, setShowModal] = useState(false)
    useEffect(() => {
        onSnapshot(doc(db, "laundromat",laundId), (snapshot) => {
            if(!snapshot.data()){return}
            const wmachine = snapshot.data().wmachines.filter((item)=>{return item.id == machineId})[0]
          
            setMachine(wmachine)
            setLaundInfo(snapshot.data())
            setQueues(wmachine.queue)
            setWmachines(snapshot.data().wmachines)
        });
    }, []);

    const onPaySuccess = async(method)=>{
        console.log("queue"+queueId, queueId==null)
        const storeRef = doc(db, "laundromat",laundId)
        const tempmachines = wmachines.filter(val=>{
            if(val.id != machineId){
                return val
            }
        })
        const myqueue = queues.filter(val=>{
            if(val.id == queueId){
                return val
            }
        })
        function filterQueue(queues=[]){
            let whitelist = {"washing":0,"in queue":0}
            return queues.filter((val)=>{return whitelist[val.status] != undefined})
        }
        let tempqueues = []
        let temp2queues = []
        let ranNum = Math.floor(Math.random()*99999)
        let curDate = new Date()
        let userid = await getData()
        if(queueId == null){
            tempqueues = [...queues,{
                user_id:userid,
                id:ranNum.toString(),
                reserve_time:curDate,
                // finish_time:new Date(curDate.getTime()+(120*1000)),
                finish_time:new Date(curDate.getTime()+(machine.duration*60*1000)),
                status:"washing"
            }]
            tempqueues.sort((a,b)=>{
                let sweight = {"washing":0,"in queue":1,"cancel":2,"paid":3}
                let minus = sweight[a.status] - sweight[b.status]  
                return isNaN(minus)?0:minus
            })
            const temp2machines = [...tempmachines,{
                id:machine.id, 
                capacity:machine.capacity,
                duration:machine.duration, 
                price:{cold:machine.price.cold,hot:machine.price.hot},
                name:machine.name,
                status: filterQueue(tempqueues).length>0?"queue":"ok",
                queue:tempqueues
            }]
            temp2machines.sort((a,b)=>{
                let sweight = {"ok":0,"notok":2,"queue":1}
                let minus = sweight[a.status] - sweight[b.status]  
                let minus2 = b.capacity - a.capacity
                return isNaN(minus)?0:minus==0?minus2:minus
            })
            updateDoc(storeRef, {
                "wmachines":temp2machines
            });
            addDoc(collection(db, "payment"), {
                user_id:userid,
                id:ranNum.toString(),
                pay_time:curDate,
                pay_price:isCool?machine.price.cold:machine.price.hot,
                pay_method:method
            });
            setShowModal(true)

        }else{
            tempqueues = queues.filter(val=>{
                if(val.id != queueId){
                    return val
                }
            })
            temp2queues = [...tempqueues,{
            id:myqueue[0].id,
            reserve_time:myqueue[0].reserve_time,
            finish_time:new Date(curDate.getTime()+(machine.duration*60*1000)),
            user_id:myqueue[0].user_id,
            status:"washing"
            }]
            temp2queues.sort((a,b)=>{
            let sweight = {"washing":0,"in queue":1,"cancel":2,"paid":3}
            let minus = sweight[a.status] - sweight[b.status]  
            return isNaN(minus)?0:minus
            })

            const temp2machines = [...tempmachines,{
                id:machine.id, 
                capacity:machine.capacity,
                duration:machine.duration, 
                price:{cold:machine.price.cold,hot:machine.price.hot},
                name:machine.name,
                status: filterQueue(temp2queues).length>0?"queue":"ok",
                queue:temp2queues
            }]
            temp2machines.sort((a,b)=>{
                let sweight = {"ok":0,"notok":2,"queue":1}
                let minus = sweight[a.status] - sweight[b.status]  
                let minus2 = b.capacity - a.capacity
                return isNaN(minus)?0:minus==0?minus2:minus
            })
            updateDoc(storeRef, {
                "wmachines":temp2machines
            });
            addDoc(collection(db, "payment"), {
                user_id:myqueue[0].user_id,
                id:myqueue[0].id,
                pay_time:curDate,
                pay_price:isCool?machine.price.cold:machine.price.hot,
                pay_method:method
            });
            setShowModal(true)
        }
    }
    return (
    <Box bg="primary.400" h="full">
        <Flex bg="primary.200" mx="5%" h="2/5" direction="row" flexWrap="wrap" justifyContent="space-around" alignItems="stretch" textAlign={"center"}>
            <Center w="100%" h="20%"  display="flex" flexDirection="row" justifyContent="space-around" pt="3%">
                <Text>{machine.name}</Text>
                <Text>{machine.capacity} กิโลกรัม</Text>
            </Center>
            <Center w="100%" display="flex" flexDirection="row" h="50%">
                <Text>น้ำร้อน</Text>
                <Switch size="lg" mx="5%" offTrackColor="#fa5a5a" onTrackColor="#6a84f7" onThumbColor="#1742ff"  offThumbColor="#fc2323" value={isCool} onValueChange={(val)=>{setIsCool(val)}}/>
                <Text>น้ำเย็น</Text>
            </Center>
            <Center w="100%" h="30%"  display="flex" flexDirection="row" justifyContent="space-around" pb="3%">
                <Text>ยอดชำระ</Text>
                <Text fontWeight="bold" fontSize="20">{machine.price?(isCool?machine.price.cold:machine.price.hot):""} บาท</Text>
            </Center>
        </Flex>
        <Flex direction="column" w="100%" h="3/5" alignItems="center">
            <View style={{borderWidth: 0.5,borderColor:'black',width:"94%"}}></View>
            <Text mx="5%" mt="2%" alignSelf="flex-start" flex="1">เลือกวิธีชำระเงิน</Text>
            <Center width="100%" display="flex" flexDirection="row" flex="4" justifyContent='space-evenly'>
                <IconButton colorScheme="trueGray"  variant="solid" _icon={{
                    as: Entypo  ,
                    name: "credit-card"
                }} w="38%" h="80%" onPress={()=>{onPaySuccess("creditcard")}}/>
                <IconButton colorScheme="trueGray"  variant="solid" _icon={{
                    as: FontAwesome ,
                    name: "bitcoin"
                }} w="38%" h="80%"  onPress={()=>{onPaySuccess("bitcoin")}}/>
            </Center>
            <Center width="100%" display="flex" flexDirection="row" flex="4" justifyContent='space-evenly'>
                <IconButton colorScheme="trueGray"  variant="solid" _icon={{
                    as: FontAwesome ,
                    name: "bank"
                }} w="38%" h="80%" onPress={()=>{onPaySuccess("bank")}}/>
                <IconButton colorScheme="trueGray"  variant="solid" _icon={{
                    as: FontAwesome ,
                    name: "qrcode"
                }} w="38%" h="80%"  onPress={()=>{onPaySuccess("qrcode????")}}/>
            </Center>
          </Flex>



          {/* Pay success modal */}
          <Modal isOpen={showModal} onClose={() => {setShowModal(false);navigation.popToTop()}} size="lg">
                <Modal.Content maxWidth="350">
                <Modal.Body alignItems={"center"}>
                    <Icon as={AntDesign} name="checkcircle" color="#00f710" size="9"/>
                    <Text fontSize={"2xl"}>ชำระเงินสำเร็จ</Text>
                </Modal.Body>
                </Modal.Content>
        </Modal>
    </Box>
  );
}

export default PaymentPage;
