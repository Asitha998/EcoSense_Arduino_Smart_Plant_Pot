import { registerRootComponent } from "expo";
import { LinearGradient } from "expo-linear-gradient";
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { AntDesign, FontAwesome, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import WebSocketService from "../websocket/websocket";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { BlurView } from "expo-blur";
// import {GlassView, GlassInput, GlassButton} from "@metafic-co/react-native-glassmorphism";

// import { FilamentScene, FilamentView, DefaultLight, Model, Camera } from "react-native-filament";

// import plant3d from '/Users/User/Documents/ReactNativeProjects/EcoSense/assets/3D/Plant_pot1.glb';

SplashScreen.preventAutoHideAsync();

export default function home() {

    const [getTemperature, setTemperature] = useState("...");
    const [getHumidity, setHumidity] = useState("...");
    const [getMoisture, setMoisture] = useState("...");
    const [getSunlight, setSunlight] = useState("...");

    const [getTemperatureAvg, setTemperatureAvg] = useState("...");
    const [getHumidityAvg, setHumidityAvg] = useState("...");
    const [getMoistureAvg, setMoistureAvg] = useState("...");
    const [getSunlightAvg, setSunlightAvg] = useState("...");

    const [getTheme, setTheme] = useState("");

    NavigationBar.setBackgroundColorAsync(getTheme == "Light" ? "#50643a" : "#1e1e1e");
    NavigationBar.setBorderColorAsync(getTheme == "Light" ? "#50643a" : "#1e1e1e");
    NavigationBar.setButtonStyleAsync("light");

    const [loaded, error] = useFonts(
        {
            'Fredoka-Regular': require("../assets/fonts/Fredoka-Regular.ttf"),
            'Fredoka-Light': require("../assets/fonts/Fredoka-Light.ttf"),
            'Fredoka-SemiBold': require("../assets/fonts/Fredoka-Medium.ttf"),
            'Roboto-Medium': require("../assets/fonts/Roboto-Medium.ttf"),
            'Roboto-Regular': require("../assets/fonts/Roboto-Regular.ttf"),
            'Roboto-Bold': require("../assets/fonts/Roboto-Bold.ttf"),
        }
    );

    //fetch daily average values
    async function fetchDailyAvg() {
        let response = await fetch(process.env.EXPO_PUBLIC_URL + "/DailyAvg");

        if (response.ok) {
            let json = await response.json(); //json means a jsvaScript object, not a java json.

            console.log(json);

            if (json.success) {

                setTemperatureAvg(json.tempAvg);
                setHumidityAvg(json.humiAvg);
                setMoistureAvg(json.moistAvg);
                setSunlightAvg(json.sunAvg);

            } else {
                //problem occured
                Alert.alert("Error", json.message);
            }

        }
    }

    useEffect(
        () => {
            fetchDailyAvg();
            async function setupTheme() {
                setTheme(await AsyncStorage.getItem("theme"));
            }
            setupTheme();
            console.log("theme setup");
        }, []
    );

    //handleMessage
    async function handleMessage(message) {
        // console.log(message);

        if (message == "ESP32") {
            await AsyncStorage.setItem('isAutoWatering', JSON.stringify(false));

        } else {
            const sensorData = JSON.parse(message);
            console.log("Message from WebSocket:", sensorData);

            //update values
            setTemperature(sensorData.temperature);
            setHumidity(sensorData.humidity);
            setMoisture(sensorData.moisture);
            setSunlight(sensorData.sunlight);

            // console.log("done");
        }
    }

    //use Web Soket
    const { sendMessage, openWebSocket } = WebSocketService(handleMessage);

    useEffect(
        () => {
            openWebSocket();
            sendMessage(
                {
                    currentPage: 2
                }
            );
        }, []
    );

    useEffect(
        () => {

            if (getSunlight < 15) {
                setTheme("Dark");
            } else {
                setTheme("Light");
            }

        }, [getSunlight]
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

    const plant = require("../assets/images/plant.png");
    const day = require("../assets/images/day.png");
    const night = require("../assets/images/night2.png");

    const bkg1 = require("../assets/images/bkg9.png");
    const bkg2 = require("../assets/images/bkg11.png");

    // const plant3d = '/Users/User/Documents/ReactNativeProjects/EcoSense/assets/3D/Plant_pot1.glb';

    return (
        <MenuProvider>
            {/* <LinearGradient colors={getTheme == "Light" ? ['white', 'white', '#206b2a'] : ['#0a131a', '#1e1e1e']} style={stylesheet.view1}> */}

            <View style={stylesheet.view1}>

                <Image source={getTheme == "Light" ? bkg1 : bkg2} contentFit={"fill"} style={StyleSheet.absoluteFill} />

                {/* <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                    <Defs>
                        <RadialGradient
                            id="grad"
                            cx="50%"
                            cy="50%"
                            rx="50%"
                            ry="50%"
                            fx="50%"
                            fy="50%"
                            gradientUnits="userSpaceOnUse"
                        >
                            <Stop offset="30%" stopColor="#535852" stopOpacity="1" />
                            <Stop offset="50%" stopColor="#7d8876" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#728556" stopOpacity="1" />
                        </RadialGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
                </Svg> */}

                <StatusBar backgroundColor={getTheme == "Light" ? "#90b980" : "#101f2b"} style={getTheme == "Light" ? null : "light"} />

                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={['#90b980', '#566e34', '#6a7d50']} style={[stylesheet.view2]}>

                    <Text style={stylesheet.headerText}>EcoSense</Text>

                    <Menu>
                        <MenuTrigger children={<FontAwesome6 name={"ellipsis-vertical"} size={25} color={getTheme == "Light" ? "white" : "white"} />}
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

                        <ImageBackground source={getTheme == "Light" ? day : night} resizeMode="stretch" imageStyle={{ borderRadius: 8 }} style={stylesheet.plantView}>

                            <Image source={plant} style={stylesheet.image1} contentFit={"contain"} />

                            {/* <FilamentScene>

                                <FilamentView style={{ flex: 1 }}>

                                    <DefaultLight />

                                    <Model source={{uri:plant3dr}} />

                                    <Camera />

                                </FilamentView>
                            </FilamentScene> */}

                            <View style={stylesheet.tempView}>
                                <BlurView intensity={10} style={stylesheet.tempTextView}>
                                    <Text style={[{ fontSize: 20, fontFamily: "Fredoka-Regular" }, getTheme != "Light" ? { color: "white" } : null]}>{getTemperature}℃</Text>
                                </BlurView>
                                <BlurView intensity={10} style={stylesheet.tempIconView}>
                                    <FontAwesome6 name={"temperature-three-quarters"} size={22} color={"red"} />
                                </BlurView>
                            </View>

                            <View style={stylesheet.humView2}>
                                <BlurView intensity={10} style={stylesheet.tempTextView}>
                                    <Text style={[{ fontSize: 20, fontFamily: "Fredoka-Regular" }, getTheme != "Light" ? { color: "white" } : null]}>{getHumidity}%</Text>
                                </BlurView>
                                <BlurView intensity={10} style={stylesheet.tempIconView}>
                                    <FontAwesome6 name={"water"} size={22} color={"#3f6881"} />
                                </BlurView>
                            </View>

                            <View style={stylesheet.moisView3}>
                                <BlurView intensity={10} style={stylesheet.tempTextView}>
                                    <Text style={[{ fontSize: 20, fontFamily: "Fredoka-Regular" }, getTheme != "Light" ? { color: "white" } : null]}>{getMoisture}%</Text>
                                </BlurView>
                                <BlurView intensity={10} style={stylesheet.tempIconView}>
                                    <FontAwesome6 name={"droplet"} size={22} color={"blue"} />
                                </BlurView>
                            </View>

                            <View style={stylesheet.sunView4}>
                                <BlurView intensity={10} style={stylesheet.tempIconView}>
                                    <FontAwesome6 name={getTheme == "Light" ? "sun" : "moon"} size={22} color={"#bb5e00"} />
                                </BlurView>
                                <BlurView intensity={10} style={stylesheet.tempTextView}>
                                    <Text style={[{ fontSize: 20, fontFamily: "Fredoka-Regular" }, getTheme != "Light" ? { color: "white" } : null]}>{getSunlight}%</Text>
                                </BlurView>
                            </View>

                        </ImageBackground>

                        <BlurView intensity={70} style={stylesheet.dailyView}>
                            <View style={{ flexDirection: "row", borderBottomColor: "#1b3c04", borderBottomWidth: 1, marginBottom: 5 }}>
                                <Text style={{ flex: 1, fontSize: 16, paddingVertical: 3, paddingStart: 5, fontFamily: "Fredoka-SemiBold" }}>Daily Average</Text>
                                <Pressable style={{ end: 5, marginVertical: 5 }} onPress={
                                    () => {
                                        fetchDailyAvg();
                                    }
                                }>
                                    <FontAwesome6 name={"arrow-rotate-right"} size={18} />
                                </Pressable>
                            </View>

                            <View style={{ flexDirection: "row", marginBottom: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={stylesheet.tempIconView2}>
                                    <FontAwesome6 name={"temperature-three-quarters"} size={15} color={"red"} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontFamily: "Fredoka-Regular" }}>Temperature</Text>
                                <Text style={{ fontSize: 15, fontFamily: "Fredoka-SemiBold" }}>{getTemperatureAvg} ℃</Text>
                            </View>

                            <View style={{ flexDirection: "row", marginBottom: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={stylesheet.tempIconView2}>
                                    <FontAwesome6 name={"water"} size={15} color={"#3f6881"} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontFamily: "Fredoka-Regular" }}>Humidity</Text>
                                <Text style={{ fontSize: 15, fontFamily: "Fredoka-SemiBold" }}>{getHumidityAvg} %</Text>
                            </View>

                            <View style={{ flexDirection: "row", marginBottom: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={stylesheet.tempIconView2}>
                                    <FontAwesome6 name={"droplet"} size={15} color={"blue"} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontFamily: "Fredoka-Regular" }}>Moisture</Text>
                                <Text style={{ fontSize: 15, fontFamily: "Fredoka-SemiBold" }}>{getMoistureAvg} %</Text>
                            </View>

                            <View style={{ flexDirection: "row", marginBottom: 10, justifyContent: "center", alignItems: "center" }}>
                                <View style={stylesheet.tempIconView2}>
                                    <FontAwesome6 name={"sun"} size={15} color={"#bb5e00"} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 15, fontFamily: "Fredoka-Regular" }}>Sunlight</Text>
                                <Text style={{ fontSize: 15, fontFamily: "Fredoka-SemiBold" }}>{getSunlightAvg} %</Text>
                            </View>
                        </BlurView>

                    </View>

                    <View style={stylesheet.navigateView2}></View>

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
                        {/* <FontAwesome6 name={"camera"} size={25} color={"white"} /> */}
                    </Pressable>
                    <Pressable style={[stylesheet.navigateButton, { backgroundColor: "rgba(255, 255, 255, 1)" }]}>
                        <AntDesign name={"home"} size={31} />
                        {/* <FontAwesome6 name={"house"} size={25} color={"black"} /> */}
                    </Pressable>
                    <Pressable style={stylesheet.navigateButton} onPress={
                        () => {
                            router.push("/watering");
                        }
                    }>
                        <MaterialCommunityIcons name={"water-plus-outline"} size={35} color={"white"} />
                        {/* <FontAwesome6 name={"shower"} size={25} color={"white"} /> */}
                    </Pressable>
                </BlurView>

            </View>

            {/* </LinearGradient> */}
        </MenuProvider>
    );
}

const stylesheet = StyleSheet.create(
    {

        mainView2: {
            paddingHorizontal: 15,
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            rowGap: 10,
        },

        plantView: {
            justifyContent: "center",
            alignItems: "center",
            height: 370,
            width: "100%",
            // backgroundColor: "green",
            borderRadius: 50,
            // borderWidth: 1,
            // borderColor: "grey",
            position: "relative",
        },

        dailyView: {
            height: 180,
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 20,
            // borderWidth: 1,
            // borderColor: "grey",
            paddingHorizontal: 10,
            // elevation: 60,
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
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: 50,
            paddingHorizontal: 5,
            elevation: 5,
            overflow: "hidden",
            height: 40,
            justifyContent: "center",
            alignItems: "center"
        },

        tempIconView: {
            width: 35,
            borderRadius: 50,
            backgroundColor: "rgba(255, 255, 255, 1)",
            padding: 5,
            alignItems: "center",
            overflow: "hidden",
            elevation: 5,
        },

        tempIconView2: {
            width: 30,
            borderRadius: 50,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            padding: 5,
            alignItems: "center",
            marginEnd: 10,
        },

        humView2: {
            position: "absolute",
            zIndex: 2,
            top: 90,
            right: 5,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        moisView3: {
            position: "absolute",
            zIndex: 2,
            bottom: 40,
            right: 10,
            flexDirection: "row",
            alignItems: "center",
            columnGap: 5
        },

        sunView4: {
            position: "absolute",
            zIndex: 2,
            top: 120,
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
            paddingTop: 10,
            paddingBottom: 20,
            // paddingVertical: 10,
            flexDirection: "row",
            columnGap: 20,
            alignItems: "center",
            marginBottom: 10,
            // borderBottomColor: "grey",
            // borderBottomWidth: 1,
            // backgroundColor: "#556c33",
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