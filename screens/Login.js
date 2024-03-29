import React from "react";
import { View } from "react-native";
import { useState, useEffect } from "react";
import {
  Heading,
  Text,
  AlertDialog,
  Button,
  Input,
  VStack,
  Stack,
  Icon,
  Pressable,
  Box,
  NativeBaseProvider
} from "native-base";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../database/firebaseDB";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import {userdata, user_id} from "../store/userSlice";
import { LinearGradient } from 'expo-linear-gradient';


function LoginPage({ navigation }) {
  const config = {
    dependencies: {
      'linear-gradient': LinearGradient
    }
  };

  const [login, setLogin] = useState(false);
  const [show, setShow] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [session, setSession] = useState({
    isLoggedIn: false,
    currentUser: null,
    errorMessage: null,
  });

  const dispatch = useDispatch()

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(userdata({
          email: user.email
        }));

        setSession({
          isLoggedIn: true,
          currentUser: user,
          errorMessage: null,
        });
      }
    });
  }, [])

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      const user = userCredential.user;
      setSession({
        isLoggedIn: true,
        currentUser: user,
      });
      navigation.navigate("ManageLaund");
    })
    .catch((error) =>{
      const errorMessage = error.message;
      console.log(username, password)
      console.log(errorMessage)
      setSession({
        isLoggedIn: false,
        currentUser: null,
      });
      alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    })
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setSession({
        isLoggedIn: false,
        currentUser: null,
      });
      alert("ออกจากระบบสำเร็จ")
    });
  };


  function render() {
    if (session.isLoggedIn) {
      return (
          <Stack space={4} w="75%" maxW="500px" mx="auto" marginTop={20}>
            <Button
              bg="indigo.700"
              h="100%"
              style={{ alignSelf: "center", height: 50, width: 200, elevation: 5}}
              onPress={handleLogout}
            >
              <Text fontSize="xl" color="white">
                ออกจากระบบ
              </Text>
            </Button>

            <Button
              bg="indigo.700"
              h="100%"
              style={{ alignSelf: "center", height: 50, width: 200, elevation: 5}}
              onPress={() => {
                navigation.navigate("ManageLaund");
              }}
            >
              <Text fontSize="xl" color="white">
                จัดการร้าน
              </Text>
            </Button>
          </Stack>
      );
    } else {
      return (
        <Stack space={4} w="75%" maxW="500px" mx="auto" >
          <Text fontSize="2xl">Username</Text>
          <Input w="100%" value={username} placeholder="Username" onChangeText={(txt)=>setUsername(txt)} />
          <Text fontSize="2xl">Password</Text>
          <Input
            value={password}
            w="100%"
            placeholder="Password"
            onChangeText={(txt) => setPassword(txt)}
            type={show ? "text" : "password"}
            InputRightElement={
              <Pressable onPress={() => setShow(!show)}>
                <Icon
                  as={
                    <MaterialIcons
                      name={show ? "visibility" : "visibility-off"}
                    />
                  }
                  size={5}
                  mr="2"
                  color="muted.400"
                />
              </Pressable>
            }
          />

          <Button
            bg="indigo.700"
            h="100%"
            style={{ alignSelf: "center", height: 50, width: 200, elevation: 5 }}
            onPress={handleLogin}
          >
            <Text fontSize="xl" color="white" >
              เข้าสู่ระบบ
            </Text>
          </Button>
        </Stack>
      );
    }
  }
  return (
    <NativeBaseProvider config={config}>
      <Box h={[335, 400, 500]} bg={{
        linearGradient: {
          colors: ['lightBlue.300', 'violet.800'],
          start: [0, 0],
          end: [1, 1]
        }
      }}>
        <VStack space={10} alignItems="center" flex={1} mt="12">
            <FontAwesome name="user-circle" size={250} color="white"/>
            {render()}
        </VStack>
      </Box>
    </NativeBaseProvider>
  );
}

export default LoginPage;
