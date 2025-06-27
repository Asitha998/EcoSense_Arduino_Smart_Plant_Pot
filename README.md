# EcoSense Project

## Overview
EcoSense is a smart plant pot system designed to monitor and automate plant care. It includes:

- **Hardware/Arduino (ESP32) Side**: Gathers sensor data (temperature, humidity, soil moisture, sunlight) and controls watering with a mini water pump and motor driver. It also streams live camera feed using the ESP32-CAM module.

- **Backend (Java EE)**: Provides APIs and WebSocket services to handle real-time data, camera streaming relay, and control commands (watering control, auto/manual modes, etc.). Uses MySQL for storing historical sensor data and system configurations.

- **Frontend (React Native App with Expo)**: Mobile app interface to view real-time sensor data, control watering manually or automatically, view water level animations, and watch live camera feed.

---

## Hardware / Arduino (ESP32)

- Gathers sensor data and sends to backend every 5 seconds via HTTP/WebSocket.
- Controls mini water pump via L298N motor driver based on auto/manual watering mode.
- Streams video feed using ESP32-CAM and hosts a local WebSocket server for camera data.
- Listens for WebSocket messages from backend to control watering and LED indicators.

**Main Components:**
- ESP32 board with WiFi capability
- ESP32-CAM module
- DHT11 temperature/humidity sensor
- Soil moisture sensor
- LDR sunlight sensor
- Water level sensor
- Mini submersible water pump
- L298N motor driver
- Optional LED indicator

---

## Backend (Java EE)

- Developed as a Java EE project (EAR structure) deployed on Payara Server.
- Manages WebSocket connections to handle real-time sensor data from ESP32 and broadcast to frontend app.
- Stores daily averages and historical data in MySQL database.
- Provides REST APIs to get/set system configurations (e.g., auto/manual mode, moisture threshold, etc.).
- Uses ActiveMQ for managing sensor data processing and auction-like queueing mechanisms.

---

## Frontend (React Native App with Expo)

- Provides three main screens:
    - **Home:** View live sensor data and daily averages.
    - **Live View:** Stream real-time video from the ESP32-CAM.
    - **Watering:** Manage watering (manual start/stop), toggle auto/manual modes, view animated water level indicator.
- Uses WebSocket to receive real-time data and camera feed.
- AsyncStorage is used to persist local settings.
- Animates water level indicator with React Native Skia.

**Key Libraries Used:**
- `react-native-websocket` (custom service)
- `expo-linear-gradient` for UI backgrounds
- `react-native-svg` / `@shopify/react-native-skia` for animations
- `expo-router` for navigation

---

## Setup Instructions

1. **ESP32/Arduino Code:**
    - Flash the provided `.ino` sketch to ESP32.
    - Update WiFi credentials and backend IP addresses in code.

2. **Backend:**
    - Build and deploy the Java EE EAR project on Payara.
    - Configure database connection (MySQL) in `persistence.xml`.

3. **Frontend App:**
    - Install dependencies with `npm install`.
    - Update WebSocket and API URLs in the app configuration.
    - Run with `npx expo start`.

---

## Notes

- For ESP32-CAM, ensure you power the module with sufficient current (3.3V with external regulator recommended).
- Backend must be reachable from both ESP32 device and mobile app (same local network suggested).
- Future improvements can include authentication, better UI, error handling, and cloud database integration.

---

## Authors

- Asitha Dissanayaka (Developer)


