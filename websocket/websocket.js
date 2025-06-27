import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

let ws = null;
let appState = AppState.currentState;

export default function WebSocketService(onMessageCallback) {

    function openWebSocket() {

        if (!ws || ws.readyState !== WebSocket.OPEN) {

            ws = new WebSocket("ws://192.168.43.217:8080/EcoSense/WebSocket");

            ws.onopen = function () {
                console.log("WebSocket Opened: " + ws.readyState);
                if (ws.readyState == 1) {
                    ws.send("App");
                }
            };

            // ws.send("App");

        }
        ws.onmessage = function (e) {
            console.log("Received message: ", e.data);
            onMessageCallback(e.data); // Call the callback function with the message received
        };

        ws.onerror = function (e) {
            console.log("WebSocket Error: ", e.message);
        };

        ws.onclose = function (e) {
            console.log("WebSocket Closed");
        };
    }

    function closeWebSocket() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    }

    // check the AppState and manage web socket
    // useEffect(() => {
    function checkAppState(nextAppState) {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {

            //app opened from background
            console.log("App opened, reopening WebSocket");
            openWebSocket();

        } else if (nextAppState.match(/inactive|background/)) {

            // app closed 
            console.log("App closed, closing WebSocket");
            closeWebSocket();
            // ws = null;

        }

        appState = nextAppState;
    }

    // // Add AppState listener
    useEffect(() => {
        openWebSocket();
        const appStateListener = AppState.addEventListener('change', checkAppState);

        // Cleanup function
        // return () => {
        //     console.log("closing");
        //     closeWebSocket();
        //     appStateListener.remove();
        // };
    }, []);

    //send msg to back end web socket
    function sendMessage(message) {

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
            // console.log("reOpen");
        }
    }

    return { sendMessage, openWebSocket, closeWebSocket };
}
