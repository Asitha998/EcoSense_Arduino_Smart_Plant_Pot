import { registerRootComponent } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
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
import WebSocketService from "../websocket/websocket";
import { BlurView } from "expo-blur";

import LottieView from "lottie-react-native";

SplashScreen.preventAutoHideAsync();

export default function watering() {

    const [getTheme, setTheme] = useState("");

    const [isEnabled, setIsEnabled] = useState();

    const [waterHeight, setWaterHeight] = useState(new Animated.Value(0));

    const [level, setLevel] = useState(0);

    const [getStart, setStart] = useState(false);
    const [getStop, setStop] = useState(false);

    NavigationBar.setBackgroundColorAsync(getTheme == "Light" ? "#50643a" : "#1e1e1e");
    NavigationBar.setBorderColorAsync(getTheme == "Light" ? "#50643a" : "#1e1e1e");
    NavigationBar.setButtonStyleAsync("light");

    const [loaded, error] = useFonts(
        {
            'Fredoka-Regular': require("../assets/fonts/Fredoka-Regular.ttf"),
            'Fredoka-Light': require("../assets/fonts/Fredoka-Light.ttf"),
            'Fredoka-SemiBold': require("../assets/fonts/Fredoka-Medium.ttf"),
        }
    );

    useEffect(() => {
        // Animate the water level change smoothly
        Animated.timing(waterHeight, {
            toValue: 88 - level, // dynamic level input
            duration: 500,
            useNativeDriver: false
        }).start();
    }, [level]);

    // Simulate water level updates every few seconds (for testing only)
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setLevel(prev => (prev >= 100 ? 0 : prev + 10)); // Adjust as needed
    //     }, 2000);

    //     return () => clearInterval(interval);
    // }, []);

    useEffect(
        () => {
            // Load the saved switch state
            AsyncStorage.getItem('isAutoWatering').then(value => {
                if (value !== null) {
                    setIsEnabled(JSON.parse(value));
                }
            });

            // set water level
            AsyncStorage.getItem('waterLevel').then(value => {
                if (value !== null) {
                    setLevel(value);
                }
            });

            // async function setupWaterLevel() {
            //     setLevel(await AsyncStorage.getItem("waterLevel"));
            // }

            async function setupTheme() {
                setTheme(await AsyncStorage.getItem("theme"));
            }

            // setupWaterLevel();
            setupTheme();
            console.log("theme and auto watering setup");
        }, []
    );

    //handleMessage
    async function handleMessage(message) {

        if (message == "ESP32") {
            await AsyncStorage.setItem('isAutoWatering', JSON.stringify(false));
            setIsEnabled(false);

        } else {
            let json = JSON.parse(message);

            if (json.waterLevel != null) {
                setLevel(json.waterLevel);
                await AsyncStorage.setItem('waterLevel', JSON.stringify(json.waterLevel));
            }
        }

        console.log("Message from WebSocket:", message);

        // if (message == 1) {
        //     setIsEnabled(true);
        // } else if (message == 0) {
        //     setIsEnabled(false);
        // }

    }

    //use Web Soket
    const { sendMessage, openWebSocket } = WebSocketService(handleMessage);

    useEffect(
        () => {
            openWebSocket();
            sendMessage(
                {
                    currentPage: 3
                }
            );
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

    const bkg1 = require("../assets/images/bkg9.png");
    const bkg2 = require("../assets/images/bkg6.png");

    return (
        <MenuProvider>
            {/* <LinearGradient colors={getTheme == "Light" ? ['white', 'white', '#206b2a'] : ['#0a131a', '#1e1e1e']} style={stylesheet.view1}> */}

            <View style={stylesheet.view1}>

                <Image source={bkg2} contentFit={"fill"} style={StyleSheet.absoluteFill} />

                <StatusBar backgroundColor={"#90b980"} style={getTheme == "Light" ? null : "light"} />

                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#90b980', '#566e34', '#6a7d50']} style={[stylesheet.view2]}>

                    <Text style={stylesheet.headerText}>Water your plant</Text>

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

                        <BlurView intensity={70} style={stylesheet.switchView}>
                            <Text style={{ flex: 1, fontSize: 20, color: "black", fontFamily: "Fredoka-Regular" }}>Auto watering</Text>
                            <Switch
                                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                                trackColor={{ false: '#B0BEC5', true: '#4CAF50' }}
                                thumbColor={isEnabled ? '#FFFFFF' : '#dfe5e8'}
                                value={isEnabled}
                                onValueChange={

                                    async (value) => {
                                        setIsEnabled(value);
                                        await AsyncStorage.setItem('isAutoWatering', JSON.stringify(value));

                                        sendMessage(
                                            {
                                                autoWatering: JSON.stringify(value),
                                            }
                                        );

                                        setStart(false);
                                        setStop(false);

                                    }
                                }
                            />
                        </BlurView>

                        {/* <View style={{ borderBottomColor: "rgba(0, 0, 0, 0.4)", borderBottomWidth: 2, paddingBottom: 10, width: "100%" }}> */}
                        <BlurView intensity={70} style={stylesheet.dailyView}>
                            <Text style={{ fontSize: 14, marginBottom: 15, paddingTop: 5, fontFamily: "Fredoka-Regular" }}>Available water amount:</Text>

                            <BlurView intensity={0} style={stylesheet.waterContainer}>
                                <Animated.View style={[stylesheet.water, {
                                    top: waterHeight.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ["0%", "100%"]
                                    })
                                }]}>

                                    <LottieView
                                        resizeMode="cover"
                                        source={require("../assets/animations/wave6.json")}
                                        autoPlay
                                        loop
                                        style={stylesheet.lottie}
                                        speed={0.5}
                                    />

                                </Animated.View>

                                <View style={stylesheet.levelView}>
                                    <Text style={{ fontSize: 18, fontFamily: "Fredoka-Regular" }}>{level} %</Text>
                                </View>


                            </BlurView>

                        </BlurView>
                        {/* </View> */}

                        <BlurView intensity={40} style={[stylesheet.dailyView, isEnabled ? { opacity: 0.4 } : null]}>
                            <Text style={{ width: "100%", fontSize: 18, paddingVertical: 10, borderBottomWidth: 1, borderColor: "rgba(0, 0, 0, 0.4)", alignSelf: "flex-start", paddingStart: 10, fontFamily: "Fredoka-Regular" }}>Manual Watering</Text>
                            <Text style={{ fontSize: 14, marginBottom: 15, paddingTop: 5, fontFamily: "Fredoka-Regular" }}>Start Watering:</Text>

                            <View style={{ flexDirection: "row", columnGap: 15, alignItems: "center", justifyContent: "center",paddingHorizontal:15,paddingBottom:10 }}>

                                <Pressable style={[stylesheet.waterButton, { backgroundColor: getStart ? "#3d9127" : "white" }]} disabled={isEnabled} onPress={
                                    () => {
                                        sendMessage(
                                            {
                                                manualWatering: "start",
                                            }
                                        );

                                        setStart(true);
                                        setStop(false);
                                    }
                                }>
                                    <Text style={{ fontSize: 25, color: getStart ? "white" : "#3d9127", }}>Start</Text>
                                </Pressable>

                                {/* <TextInput style={{ width: "100%", borderRadius: 15, backgroundColor: "#ffffff", paddingHorizontal: 7, fontSize: 18, height: 50, marginBottom: 15 }}
                                inputMode="numeric" cursorColor={"black"}
                                editable={!isEnabled}
                                /> */}

                                <Pressable style={[stylesheet.waterButton, { backgroundColor: getStop ? "#ba1b26" : "white" }]} disabled={isEnabled} onPress={
                                    () => {
                                        sendMessage(
                                            {
                                                manualWatering: "stop",
                                            }
                                        );

                                        setStart(false);
                                        setStop(true);
                                    }
                                }>
                                    <Text style={{ fontSize: 25, color: getStop ? "white" : "#ba1b26", }}>Stop</Text>
                                </Pressable>
                            </View>

                        </BlurView>

                    </View>

                    {/* <View style={stylesheet.navigateView2}></View> */}

                </ScrollView>

                <BlurView intensity={20} style={stylesheet.navigateView}>
                    <Pressable style={stylesheet.navigateButton} onPress={
                        () => {

                            sendMessage(
                                {
                                    currentPage: 1
                                }
                            );

                            router.push("/camera");
                        }
                    }>
                        <MaterialCommunityIcons name={"camera-wireless-outline"} size={33} color={"white"} />
                    </Pressable>

                    <Pressable style={stylesheet.navigateButton} onPress={
                        () => {
                            router.push("/home2");
                        }
                    }>
                        <AntDesign name={"home"} size={31} color={"white"} />
                    </Pressable>

                    <Pressable style={[stylesheet.navigateButton, { backgroundColor: "rgba(255, 255, 255, 1)" }]}>
                        <MaterialCommunityIcons name={"water-plus-outline"} size={35} color={"black"} />
                    </Pressable>
                </BlurView>

            </View>
        </MenuProvider >
    );
}

const stylesheet = StyleSheet.create(
    {

        waterButton: {
            // width: "45%",
            flex: 1,
            borderRadius: 100,
            height: 90,
            justifyContent: "center",
            alignItems: "center",
            elevation: 15,
            shadowColor: "#8001cb",
            opacity:0.8
        },

        waterContainer: {
            width: "85%",
            height: 220,
            // borderWidth: 2,
            // borderColor: '#3a6ea5',
            borderRadius: 30,
            // borderTopWidth: 0,
            overflow: 'hidden',
            alignSelf: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
        },
        water: {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: 250
            // backgroundColor: 'rgba(0, 2, 149, 0.6)', // Water color
        },

        levelView: {
            position: 'absolute',
            width: '20%',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: 50,
            paddingVertical: 5,
            alignItems: "center",
            justifyContent: "center",
        },

        mainView2: {
            paddingHorizontal: 15,
            paddingVertical: 5,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            rowGap: 10,
        },

        switchView: {
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            height: 60,
            width: "100%",
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255, 0.2)",
            paddingHorizontal: 15,
            // elevation: 2,
            overflow: "hidden",
        },

        dailyView: {
            // height: 200,
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 20,
            // borderWidth: 2,
            // borderColor: "#8d8d8d",
            paddingHorizontal: 10,
            paddingBottom: 15,
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

        menuOptionView: {
            borderBottomWidth: 1,
            borderBottomColor: "#535758",
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

        lottie: {
            width: "100%",
            height: "100%",
        },

    }
);