import { registerRootComponent } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { AntDesign, FontAwesome, FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import WebSocketService from "../websocket/websocket";

SplashScreen.preventAutoHideAsync();

// Define the WebSocket URLs for the ESP32-CAM
const WEBSOCKET_CAMERA_URL = "ws://192.168.1.7/Camera";
const WEBSOCKET_CAR_INPUT_URL = "ws://192.168.1.7/ArmInput";

let websocketCamera = null;
let websocketArmInput = null;

export default function camera() {

    // var webSocketCameraUrl = "ws://192.168.1.7:8080/Camera";
    // var webSocketCarInputUrl = "ws://192.168.1.7:8080/CarInput";

    const [getUser, setUser] = useState([]);
    const [getUserAvatar, setUserAvatar] = useState([]);
    // const [getChatArray, setChatArray] = useState([]);

    const [getTheme, setTheme] = useState("");

    const [getColor1, setColor1] = useState(false);
    const [getColor2, setColor2] = useState(false);
    const [getColor3, setColor3] = useState(false);
    const [getColor4, setColor4] = useState(false);

    const [getValue, setValue] = useState(0);

    const [getImageSrc, setImageSrc] = useState("");

    NavigationBar.setBackgroundColorAsync(getTheme == "Light" ? "#5a773b" : "#1e1e1e");
    NavigationBar.setBorderColorAsync(getTheme == "Light" ? "#5a773b" : "#1e1e1e");
    NavigationBar.setButtonStyleAsync("light");

    const [loaded, error] = useFonts(
        {
            'Fredoka-Regular': require("../assets/fonts/Fredoka-Regular.ttf"),
            'Fredoka-Light': require("../assets/fonts/Fredoka-Light.ttf"),
            'Fredoka-SemiBold': require("../assets/fonts/Fredoka-Medium.ttf"),
        }
    );

    //handleMessage
    function handleMessage(message) {
        console.log("Message from WebSocket:", message);

    }

    //use Web Soket
    const { sendMessage, openWebSocket, closeWebSocket } = WebSocketService(handleMessage);

    useEffect(
        () => {
            openWebSocket();
            sendMessage(
                {
                    currentPage: 1
                }
            );
            // closeWebSocket();
        }, []
    );

    // Initialize WebSocket connections for Camera and Car Input
    useEffect(() => {
        initWebSocket();

        // Cleanup function to close WebSockets when component unmounts
        return () => {
            if (websocketCamera) websocketCamera.close();
            if (websocketArmInput) websocketArmInput.close();
        };
    }, []);

    // Initialize camera WebSocket
    function initCameraWebSocket() {
        websocketCamera = new WebSocket(WEBSOCKET_CAMERA_URL);
        websocketCamera.binaryType = "arraybuffer";

        websocketCamera.onopen = () => {
            console.log("Camera WebSocket connected");
        };

        websocketCamera.onclose = () => {
            console.log("Camera WebSocket closed");
            // setTimeout(initCameraWebSocket, 2000); // Retry connection after 2 seconds
        };

        websocketCamera.onmessage = (event) => {
            // setImageSrc(URL.createObjectURL(event.data));

            if (typeof event.data === "string") {
                // Log or handle text data
                console.error("Received non-binary data from WebSocket:", event.data);
                return;
            }

            if (event.data instanceof ArrayBuffer) {
                // Convert binary data to Base64
                const base64String = btoa(
                    new Uint8Array(event.data).reduce((data, byte) => data + String.fromCharCode(byte), "")
                );

                // Set image source in Base64 format
                setImageSrc(`data:image/jpeg;base64,${base64String}`);
            } else {
                console.error("Unexpected data type received from WebSocket");
            }
        };

        websocketCamera.onerror = (error) => {
            console.log("Camera WebSocket error:", error);
        };
    }

    // Initialize car input WebSocket
    function initArmInputWebSocket() {
        websocketArmInput = new WebSocket(WEBSOCKET_CAR_INPUT_URL);

        websocketArmInput.onopen = () => {
            console.log("Car Input WebSocket connected");
        };

        websocketArmInput.onclose = () => {
            console.log("Car Input WebSocket closed");
            // setTimeout(initArmInputWebSocket, 2000); // Retry connection after 2 seconds
        };

        websocketArmInput.onmessage = (event) => {
            console.log("Message from Car Input WebSocket:", event.data);
        };

        websocketArmInput.onerror = (error) => {
            console.log("Car Input WebSocket error:", error);
        };
    }

    function closeWebSockets() {
        websocketCamera.close();
        websocketArmInput.close();
    }

    function initWebSocket() {
        initCameraWebSocket();
        initArmInputWebSocket();
    }

    // Send control input to the arm WebSocket
    function sendButtonInput(key, value) {
        const data = `${key},${value}`;
        if (websocketArmInput && websocketArmInput.readyState === WebSocket.OPEN) {
            websocketArmInput.send(data);
        } else {
            console.warn("Car Input WebSocket is not connected");
        }
    }

    // camera websocket

    useEffect(
        () => {
            // initWebSocket();

            async function setupTheme() {
                setTheme(await AsyncStorage.getItem("theme"));
            }
            setupTheme();
            console.log("theme setup");
        }, []
    );

    useEffect(
        () => {
            if (loaded || error) {
                SplashScreen.hideAsync();
            }
        }, [loaded, error]
    );

    if (!loaded && !error) {
        return null;
    }

    const flashlightL = require("../assets/images/torchLow.png");
    const flashlightM = require("../assets/images/torchMed.png");
    const flashlightH = require("../assets/images/torchHigh.png");

    const bkg1 = require("../assets/images/bkg6.png");
    const borderbkg = require("../assets/images/border2.png");

    return (
        <MenuProvider>
            {/* <LinearGradient colors={getTheme == "Light" ? ['white', 'white', '#206b2a'] : ['#0a131a', '#1e1e1e']} style={stylesheet.view1}> */}

            <View style={stylesheet.view1}>

                <Image source={bkg1} contentFit={"fill"} style={StyleSheet.absoluteFill} />

                <StatusBar backgroundColor={getTheme == "Light" ? "#90b980" : "#101f2b"} style={getTheme == "Light" ? null : "light"} />

                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#90b980', '#566e34', '#6a7d50']} style={[stylesheet.view2]}>

                    <Text style={[stylesheet.headerText, getTheme == "Light" ? null : { color: "white" }]}>Live view</Text>

                    {/* <View style={stylesheet.view3}></View> */}

                    {/* <View style={stylesheet.viewSearch}>
                        <TextInput style={[stylesheet.input1, getTheme == "Light" ? null : { color: "white", backgroundColor: "#1e2b33" }]} value={getSeatchText} cursorColor={getTheme == "Light" ? "black" : "white"} placeholder={"Search a friend..."} placeholderTextColor={getTheme == "Light" ? "#61746a" : "#8e9c94"} onChangeText={
                            (text) => {
                                setSearchText(text);
                            }
                        } />
                        {getSeatchText != "" ?
                            <FontAwesome6 name={"circle-xmark"} size={20} color={"grey"} style={{ position: "absolute", end: 10, marginTop: 9 }} onPress={
                                () => {
                                    setSearchText("");
                                }
                            } /> :
                            null
                        }
                    </View> */}

                    <Menu>
                        <MenuTrigger children={<FontAwesome6 name={"ellipsis-vertical"} size={25} color={"white"} />}
                            style={{ alignSelf: "flex-end", width: 30, alignItems: "center" }}
                        />
                        <MenuOptions optionsContainerStyle={[stylesheet.headerMenuOptionsLight, getTheme == "Dark" ? { backgroundColor: "#1f2c40" } : null]}  >

                            <MenuOption style={stylesheet.menuOptionView} onSelect={
                                async () => {
                                    getTheme == "Light" ?
                                        [setTheme("Dark"),
                                        await AsyncStorage.setItem("theme", "Dark")]
                                        :
                                        [setTheme("Light"),
                                        await AsyncStorage.setItem("theme", "Light")]
                                }
                            }>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>

                                    <Text style={[{ fontSize: 15, color: "#535758", fontWeight: "bold" }, getTheme == "Light" ? null : { color: "white" }]}>  Change Theme To : </Text>
                                    {getTheme == "Light" ?
                                        <FontAwesome6 name={"moon"} size={16} color={"#535758"} /> :
                                        <FontAwesome6 name={"sun"} size={16} color={"white"} />
                                    }

                                </View>
                            </MenuOption>
                            <MenuOption onSelect={
                                async () => {
                                    await AsyncStorage.removeItem("user");

                                    router.replace("/");
                                }
                            }>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingRight: 10 }}>
                                    <Text style={{ fontSize: 15, color: "#a80000", fontWeight: "bold", marginEnd: 10 }}>Log Out</Text>
                                    <FontAwesome6 name={"right-from-bracket"} size={22} color={"#a80000"} />
                                </View>
                            </MenuOption>

                        </MenuOptions>
                    </Menu>

                </LinearGradient>

                <ScrollView>

                    <View style={stylesheet.mainView2}>

                        <ImageBackground source={{}} resizeMode={"stretch"} imageStyle={{ width: "100%" }} style={stylesheet.liveView}>
                            {getImageSrc == "" ?
                                <FontAwesome6 name={"camera"} size={80} color={"rgba(194, 194, 194, 0.56)"} />
                                :
                                <Image source={getImageSrc} contentFit={"cover"} style={stylesheet.cameraImg} />
                            }

                        </ImageBackground>

                        <View style={stylesheet.controllView}>

                            <BlurView intensity={10} style={stylesheet.buttonView}>
                                
                                <View style={{ alignItems: "center", justifyContent: "center", position: "absolute" }}>
                                    <Pressable style={{top: 20, start:215}}
                                        onPress={
                                            () => {

                                                sendMessage(
                                                    {
                                                        arm: 5,
                                                    }
                                                );

                                                // sendButtonInput("Arm",5);
                                            }
                                        } >
                                        <FontAwesome6 name={"arrow-rotate-right"} size={22} color={"grey"} />
                                    </Pressable>
                                </View>


                                <View style={{ alignItems: "center", justifyContent: "center", position: "relative" }}>
                                    <Pressable style={[stylesheet.moveButton, { position: "relative", marginBottom: -20 }, getColor1 ? { backgroundColor: "rgba(76, 145, 83, 1)" } : null]}
                                        onTouchStart={
                                            () => {
                                                setColor1(true);

                                                sendMessage(
                                                    {
                                                        arm: 1,
                                                    }
                                                );

                                                // sendButtonInput("Arm",1);
                                            }
                                        } onTouchEnd={
                                            () => {
                                                setColor1(false);

                                                sendMessage(
                                                    {
                                                        arm: 0,
                                                    }
                                                );

                                                // sendButtonInput("Arm",0);
                                            }
                                        }>
                                        <FontAwesome6 name={"caret-up"} size={40} color={"black"} />
                                    </Pressable>
                                </View>

                                <View style={{ flexDirection: "row", columnGap: 80, justifyContent: "center", alignItems: "center", position: "relative", }}>
                                    <Pressable style={[stylesheet.moveButton, getColor2 ? { backgroundColor: "rgba(76, 145, 83, 1)" } : null]}
                                        onTouchStart={
                                            () => {
                                                setColor2(true);

                                                sendMessage(
                                                    {
                                                        arm: 3,
                                                    }
                                                );

                                                // sendButtonInput("Arm",3);
                                            }
                                        } onTouchEnd={
                                            () => {
                                                setColor2(false);

                                                sendMessage(
                                                    {
                                                        arm: 0,
                                                    }
                                                );

                                                // sendButtonInput("Arm",0);
                                            }
                                        }>
                                        <FontAwesome6 name={"caret-left"} size={40} color={"black"} />
                                    </Pressable>

                                    <Pressable style={[stylesheet.moveButton, getColor3 ? { backgroundColor: "rgba(76, 145, 83, 1)" } : null]}
                                        onTouchStart={
                                            () => {
                                                setColor3(true);

                                                sendMessage(
                                                    {
                                                        arm: 4,
                                                    }
                                                );

                                                // sendButtonInput("Arm",4);
                                            }
                                        } onTouchEnd={
                                            () => {
                                                setColor3(false);

                                                sendMessage(
                                                    {
                                                        arm: 0,
                                                    }
                                                );

                                                // sendButtonInput("Arm",0);
                                            }
                                        }>
                                        <FontAwesome6 name={"caret-right"} size={40} color={"black"} />
                                    </Pressable>
                                </View>

                                <View style={{ alignItems: "center", justifyContent: "center", position: "relative" }}>
                                    <Pressable style={[stylesheet.moveButton, { position: "relative", marginTop: -20 }, getColor4 ? { backgroundColor: "rgba(76, 145, 83, 1)" } : null]}
                                        onTouchStart={
                                            () => {
                                                setColor4(true);

                                                sendMessage(
                                                    {
                                                        arm: 2,
                                                    }
                                                );

                                                // sendButtonInput("Arm",2);
                                            }
                                        } onTouchEnd={
                                            () => {
                                                setColor4(false);

                                                sendMessage(
                                                    {
                                                        arm: 0,
                                                    }
                                                );

                                                // sendButtonInput("Arm",0);
                                            }
                                        }>
                                        <FontAwesome6 name={"caret-down"} size={40} color={"black"} />
                                    </Pressable>
                                </View>
                            </BlurView>

                            <BlurView intensity={10} style={stylesheet.sliderView}>
                                <Slider
                                    style={{ width: 150, height: 50, }}
                                    value={0}
                                    minimumValue={0}
                                    maximumValue={255}
                                    minimumTrackTintColor="#FFFFFF"
                                    maximumTrackTintColor="#000000"
                                    onValueChange={
                                        (value) => {
                                            sendButtonInput("Light", value);
                                            setValue(value);
                                        }
                                    }
                                    thumbImage={getValue == 0 ? flashlightL : getValue > 0 && getValue < 155 ? flashlightM : flashlightH}
                                />

                            </BlurView>

                        </View>

                    </View>

                    {/* <View style={stylesheet.navigateView2}></View> */}

                </ScrollView>

                <BlurView intensity={20} style={stylesheet.navigateView}>
                    <Pressable style={[stylesheet.navigateButton, { backgroundColor: "rgba(255, 255, 255, 1)" }]}>
                        <MaterialCommunityIcons name={"camera-wireless-outline"} size={33} color={"black"} />
                    </Pressable>

                    <Pressable style={stylesheet.navigateButton} onPress={
                        () => {
                            router.push("/home2");
                            closeWebSockets();
                        }
                    }>
                        <AntDesign name={"home"} size={31} color={"white"} />
                    </Pressable>
                    <Pressable style={stylesheet.navigateButton} onPress={
                        () => {
                            router.push("/watering");
                            closeWebSockets();
                        }
                    }>
                        <MaterialCommunityIcons name={"water-plus-outline"} size={35} color={"white"} />
                    </Pressable>
                </BlurView>

            </View>
        </MenuProvider>
    );
}

const stylesheet = StyleSheet.create(
    {
        cameraImg: {
            width: "100%",
            height: "100%",
            alignSelf: "center",
            zIndex: 100,
        },

        mainView2: {
            padding: 15,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            rowGap: 10,
        },

        liveView: {
            justifyContent: "center",
            alignItems: "center",
            height: 320,
            width: "90%",
            // backgroundColor: "#617f3c1",
            // borderTopLeftRadius: 35,
            borderBottomRightRadius: 35,
            // borderRadius:35,
            // borderTopRightRadius: 35,
            borderBottomLeftRadius: 35,
            // borderWidth: 3,
            // borderColor: "rgba(194, 194, 194, 0.56)",
            position: "relative",
            marginBottom: 15,
            overflow: "hidden",
            elevation: 8,
            shadowColor: "#5c5c5c"
        },

        controllView: {
            height: 200,
            width: "100%",
            paddingHorizontal: 10,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            flexDirection: "row",
            // columnGap:20,
            paddingStart: 80,
        },

        buttonView: {
            borderRadius: 35,
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            padding: 20,
            overflow: "hidden",
            // borderTopLeftRadius: 35,
            // borderBottomRightRadius: 35,
            // borderTopRightRadius: 35,
            // borderBottomLeftRadius: 35,
        },

        moveButton: {
            width: 70,
            height: 70,
            borderRadius: 100,
            backgroundColor: "rgba(103, 199, 113, 0.6)",
            elevation: 30,
            justifyContent: "center",
            alignItems: "center",
        },

        sliderView: {
            transform: [{ rotate: "-90deg" }],
            marginStart: -30,
            borderRadius: 50,
            backgroundColor: "rgba(255,255,255,0.3)",
            paddingHorizontal: 10,
            overflow: "hidden",
        },

        navigateView: {
            alignSelf: "center",
            justifyContent: "center",
            height: 75,
            width: "55%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: 50,
            flexDirection: "row",
            position: "absolute",
            bottom: 12,
            padding: 5,
            elevation: 20,
            overflow: "hidden",
        },

        navigateView2: {
            height: 95,
            width: "100%",
        },

        navigateButton: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            borderRadius: 50,
        },

        // navigateView: {
        //     alignSelf: "center",
        //     justifyContent: "center",
        //     height: 70,
        //     width: "93%",
        //     backgroundColor: "rgba(255, 255, 255, 0.56)",
        //     borderRadius: 10,
        //     flexDirection: "row",
        //     position: "absolute",
        //     bottom: 12,
        //     padding: 10
        // },

        // navigateView2: {
        //     height: 70,
        //     width: "100%",
        // },

        image1: {
            marginTop: 50,
            width: "100%",
            height: "85%",
            alignSelf: "center",
            zIndex: 1,
            // borderRadius: 40,
        },

        tempView: {
            position: "absolute",
            zIndex: 2,
            top: 40,
            right: 5,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        tempTextView: {
            backgroundColor: "white",
            borderRadius: 50,
            paddingHorizontal: 5,
        },

        tempIconView: {
            width: 35,
            borderRadius: 50,
            backgroundColor: "white",
            padding: 5,
            alignItems: "center"
        },

        tempIconView2: {
            width: 30,
            borderRadius: 50,
            backgroundColor: "white",
            padding: 5,
            alignItems: "center",
            marginEnd: 10,
        },

        tempView2: {
            position: "absolute",
            zIndex: 2,
            top: 90,
            right: 5,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        tempView3: {
            position: "absolute",
            zIndex: 2,
            bottom: 40,
            right: 10,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        tempView4: {
            position: "absolute",
            zIndex: 2,
            top: 100,
            left: 10,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        menuName: {
            fontFamily: "Fredoka-SemiBold",
            fontSize: 20,
            color: "#535758",
            marginBottom: 2
        },

        menuOptionView: {
            borderBottomWidth: 1,
            borderBottomColor: "#535758",
        },

        newMessages: {
            width: 25,
            height: 25,
            borderRadius: 20,
            backgroundColor: "#09a639",
            zIndex: 100,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            end: 1
        },

        dot1: {
            width: 20,
            height: 20,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: "white",
            backgroundColor: "#09a639",
            position: "absolute",
            zIndex: 100,
            start: -1,
            top: -1,
        },

        view1: {
            flex: 1,
            // paddingVertical: 10,
            // paddingHorizontal: 20,
        },

        view2: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            flexDirection: "row",
            columnGap: 20,
            alignItems: "center",
            marginBottom: 10,
            // borderBottomColor: "grey",
            // borderBottomWidth: 1,
            backgroundColor: "#c7edda",
            elevation: 10,
        },

        headerText: {
            fontFamily: "Roboto-Medium",
            fontSize: 35,
            width: "90%",
            color: "white",
        },

        view3: {
            width: 80,
            height: 80,
            backgroundColor: "purple",
            borderRadius: 40,
        },

        view4: {
            flex: 1,
        },

        viewSearch: {
            flex: 1,
            flexDirection: "row",
        },

        input1: {
            height: 40,
            // borderStyle: "solid",
            // borderWidth: 1,
            width: "100%",
            borderRadius: 40,
            fontSize: 20,
            // color: "grey",
            paddingLeft: 15,
            paddingHorizontal: 15,
            // borderColor: "grey",
            elevation: 0.1,
        },

        menuView: {
            position: "absolute",
            alignSelf: "flex-end",
            marginTop: 15,
            width: "100%",
        },

        avatar: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#d8d8d8",
            justifyContent: "center",
            alignItems: "center",
        },

        imageAvatar: {
            width: 50,
            height: 50,
            justifyContent: "center",
            alignSelf: "center",
            borderRadius: 25,
        },

        headerMenuOptionsLight: {
            width: "auto",
            minWidth: 200,
            marginTop: 40,
            marginLeft: 15,
            backgroundColor: "#d9fceb",
            borderRadius: 10,
            shadowColor: "black",
            elevation: 50,
        },
        headerMenuOptionsDark: {
            width: 250,
            marginTop: 40,
            backgroundColor: "#1e1e1e",
            borderWidth: 1,
            borderColor: "#1e1e1e",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderTopLeftRadius: 20,
            shadowColor: "#2d2d2d",
            elevation: 8,
        },

        text1: {
            fontFamily: "Fredoka-SemiBold",
            fontSize: 22,
        },

        text2: {
            fontFamily: "Fredoka-Regular",
            fontSize: 18,
        },
        text3: {
            fontFamily: "Fredoka-Regular",
            fontSize: 14,
            alignSelf: "flex-end",
        },

        view5: {
            paddingHorizontal: 20,
            flexDirection: "row",
            alignContent: "center",
            columnGap: 20,
            marginVertical: 8,
        },

        // view5: {
        //     paddingBottom:10,
        //     flexDirection: "row",
        //     alignContent: "center",
        //     columnGap: 20,
        //     marginHorizontal:25,
        //     marginVertical: 5,
        //     borderBottomWidth:1,
        //     borderBottomColor:"#9dbbab"
        // },

        // view5: {
        //     padding: 10,
        //     flexDirection: "row",
        //     alignContent: "center",
        //     columnGap: 20,
        //     marginVertical: 8,
        //     marginHorizontal:20,
        //     borderRadius:20,
        //     elevation:15,
        //     backgroundColor:"#d5eff4",
        // },

        view6: {
            width: 70,
            height: 70,
            borderRadius: 40,
            // backgroundColor: "white",
            // borderWidth: 3,
            // borderColor: "#b1b1b1",
            justifyContent: "center",
            alignItems: "center",
        },

        text4: {
            fontFamily: "Fredoka-Regular",
            fontSize: 16,
        },

        text5: {
            fontFamily: "Fredoka-Regular",
            fontSize: 13,
            alignSelf: "flex-end",
        },

        view7: {
            flexDirection: "row",
            columnGap: 10,
            alignSelf: "flex-end",
            alignItems: "center",
        },

        text6: {
            fontFamily: "Fredoka-Regular",
            fontSize: 30,
            color: "white",
        },

        text7: {
            fontFamily: "Fredoka-Regular",
            fontSize: 20,
            color: "white",
        },

    }
);