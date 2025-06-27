#include <Arduino_JSON.h>
#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <DHT.h>
#include <L298N.h>
#include <ESP32Servo.h>

// WiFi Credentials
const char* ssid = "wifi_name";
const char* password = "wifi_password";

// WebSocket details
const char* host = "192.168.43.217"; 
const int port = 8080;
const char* url = "/EcoSense/WebSocket";

WebSocketsClient webSocket;

// Timer for sending sensor data
unsigned long lastSendTime = 0;           // Track last time data was sent
const unsigned long sendInterval = 2000;  // 2 seconds

unsigned long lastSendTime2 = 0;
const unsigned long sendInterval2 = 1000;  // 1 seconds

//servo arm control
Servo servo1;
Servo servo2;

static const int servoPin1 = 12;
static const int servoPin2 = 13;

int servo1Angle = 90;      // Current position of servo1
int servo2Angle = 90;      // Current position of servo2
const int servoSpeed = 5;  // Speed of movement

#define UP 1
#define DOWN 2
#define LEFT 3
#define RIGHT 4
#define STOP 0


//motor L298N Pins definition
const unsigned int IN1 = 27;
const unsigned int IN2 = 26;
const unsigned int EN = 14;

// Create one motor instance
L298N motor(EN, IN1, IN2);

// DHT11 Sensor (Humidity and Temparature sensor)
float tempC, humi;
#define DHT_SENSOR_PIN 21  // ESP32 pin GPIO21 connected to DHT11, Humidity,Temp sensor
#define DHT_SENSOR_TYPE DHT11
DHT dht_sensor(DHT_SENSOR_PIN, DHT_SENSOR_TYPE);

//Moisture
int moisture, moistureInverted;
#define m_sensor_pin 36  // GPIO36 pin, (VP pin)

//LDR sunlight sensor
int sunlight, sunlightInverted;
#define LDR_AO_PIN 39

//Water level sensor
int waterLevel, waterLevelAnalog = 0;
#define W_POWER_PIN 17        // GPIO17 connected to sensor's VCC pin
#define water_singnal_pin 34  // GPIO34 (ADC6) connected to sensor's signal pin

//Auto Watering variables
boolean isAutoWatering = false;
boolean isManualWatering = false;
boolean isMoistureLow = false;

static int currentAction = 0;

void moveArm(int input) {
  // static int currentAction = 0;
  currentAction = input;

  switch (currentAction) {
    case 1:  // Move servo1 upward
      if (currentAction == 1 && servo1Angle < 180) {
        servo1Angle += servoSpeed;
        servo1Angle = min(servo1Angle, 180);
        servo1.write(servo1Angle);
        Serial.println(currentAction);
        delay(50);  // Adjust for smoothness
      }
      break;

    case 2:  // Move servo1 downward
      if (currentAction == 2 && servo1Angle > 0) {
        servo1Angle -= servoSpeed;
        servo1Angle = max(servo1Angle, 0);
        servo1.write(servo1Angle);
        Serial.println(currentAction);
        delay(50);  // Adjust for smoothness
      }
      break;

    case 3:  // Move servo2 leftward
      if (currentAction == 3 && servo2Angle > 0) {
        servo2Angle -= servoSpeed;
        servo2Angle = max(servo2Angle, 0);
        servo2.write(servo2Angle);
        Serial.println(currentAction);
        delay(50);  // Adjust for smoothness
      }
      break;

    case 4:  // Move servo2 rightward
      if (currentAction == 4 && servo2Angle < 180) {
        servo2Angle += servoSpeed;
        servo2Angle = min(servo2Angle, 180);
        servo2.write(servo2Angle);
        Serial.println(currentAction);
        delay(50);  // Adjust for smoothness
      }
      break;

    case 5:  // reset
      if (currentAction == 5) {
        servo1.write(90);
        delay(50);
        servo2.write(90);
        currentAction = 0;
        servo2Angle = 90;
        servo1Angle = 90;
      }
      break;

    case 0:  // Stop all movement
      // Serial.println(currentAction);
      break;

    default:
      break;
  }
}

void setup() {

  Serial.begin(115200);

  // set the ADC attenuation to 11 dB (up to ~3.3V input)
  analogSetAttenuation(ADC_11db);

  //attach servo motors
  servo1.attach(servoPin1);
  servo2.attach(servoPin2);

  servo1.write(90);
  Serial.print("servo1");
  servo2.write(90);
  Serial.print("servo2");

  // Initialize DHT sensor
  dht_sensor.begin();

  // water sensor power pin
  pinMode(W_POWER_PIN, OUTPUT);
  digitalWrite(W_POWER_PIN, LOW);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Set initial motor speed
  motor.setSpeed(130);

  Serial.println("Connected");
  Serial.println(WiFi.localIP());

  // server address, port and URL
  webSocket.begin(host, port, url);

  // event handler
  webSocket.onEvent(webSocketEvent);

  // try ever 5000 again if connection has failed
  webSocket.setReconnectInterval(5000);
}

void loop() {
  //WebSocket loop
  //we dont add delays to this main loop because it will interupt the websocket loop.
  webSocket.loop();

  // Send sensor data every 2 seconds
  unsigned long currentTime = millis();

  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;

    // Read DHT/Humidity,Temperature sensor data
    humi = dht_sensor.readHumidity();
    tempC = dht_sensor.readTemperature();

    // Read Moisture sensor data
    moistureInverted = analogRead(m_sensor_pin);
    moisture = (100 - ((moistureInverted / 4095.00) * 100));

    //is moisture level low
    if (moisture < 30) {
      isMoistureLow = true;
    }

    if (moisture > 65) {
      isMoistureLow = false;
    }

    // Read LDR sunlight sensor value
    sunlightInverted = analogRead(LDR_AO_PIN);
    sunlight = (100 - ((sunlightInverted / 4095.00) * 100));

    // Check if readings are valid
    if (isnan(humi) || isnan(tempC)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      // Format the data as JSON
      // JSONVar jsonObject;

      // jsonObject["temperature"] = (float)tempC;
      // jsonObject["humidity"] = (float)humi;
      // jsonObject["moisture"] = moisture;
      // jsonObject["sunlight"] = sunlight;
      // jsonObject["AutoWatering"] = isAutoWatering;

      // String jsonString = JSON.stringify(jsonObject);
      String sensorData = String("{\"temperature\":") + tempC + ", \"humidity\":" + humi + ", \"moisture\":" + moisture + ", \"sunlight\":" + sunlight + ", \"AutoWatering\":" + isAutoWatering + "}";

      // Send data to WebSocket server
      webSocket.sendTXT(sensorData);
      Serial.println("Data sent: " + sensorData);
    }
  }

  // Auto watering
  if ((isMoistureLow && isAutoWatering) || isManualWatering) {
    motor.forward();

    unsigned long currentTime2 = millis();
    if (currentTime2 - lastSendTime2 >= sendInterval2) {
      lastSendTime2 = currentTime2;

      sendWaterLevel();
    }

  } else {
    motor.stop();
  }

  //arm
  moveArm(currentAction);
  // switch (currentAction) {
  //   case 1:  // Move servo1 upward
  //     while (currentAction == 1 && servo1Angle < 180) {
  //       servo1Angle += servoSpeed;
  //       servo1Angle = min(servo1Angle, 180);
  //       servo1.write(servo1Angle);
  //       Serial.println(currentAction);
  //       delay(50);  // Adjust for smoothness
  //     }
  //     break;

  //   case 2:  // Move servo1 downward
  //     while (currentAction == 2 && servo1Angle > 0) {
  //       servo1Angle -= servoSpeed;
  //       servo1Angle = max(servo1Angle, 0);
  //       servo1.write(servo1Angle);
  //       Serial.println(currentAction);
  //       delay(50);  // Adjust for smoothness
  //     }
  //     break;

  //   case 3:  // Move servo2 leftward
  //     while (currentAction == 3 && servo2Angle > 0) {
  //       servo2Angle -= servoSpeed;
  //       servo2Angle = max(servo2Angle, 0);
  //       servo2.write(servo2Angle);
  //       Serial.println(currentAction);
  //       delay(50);  // Adjust for smoothness
  //     }
  //     break;

  //   case 4:  // Move servo2 rightward
  //     while (currentAction == 4 && servo2Angle < 180) {
  //       servo2Angle += servoSpeed;
  //       servo2Angle = min(servo2Angle, 180);
  //       servo2.write(servo2Angle);
  //       Serial.println(currentAction);
  //       delay(50);  // Adjust for smoothness
  //     }
  //     break;

  //   case 0:  // Stop all movement
  //     break;

  //   default:
  //     break;
  // }
}

// get the water level
void sendWaterLevel() {
  digitalWrite(W_POWER_PIN, HIGH);                   // turn the sensor ON
  delay(20);                                         // wait 10/20 milliseconds
  waterLevelAnalog = analogRead(water_singnal_pin);  // read the analog value from sensor
  waterLevel = (waterLevelAnalog / 1080.00) * 100;
  digitalWrite(W_POWER_PIN, LOW);

  String waterLevelString = String("{\"waterLevel\":") + waterLevel + "}";
  webSocket.sendTXT(waterLevelString);
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {

  String payloadStr;

  switch (type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);

      // send message to server when Connected
      webSocket.sendTXT("ESP32");
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);

      // Convert payload to a String for comparison
      payloadStr = String((char*)payload);

      // Auto watering
      if (payloadStr == "true") {
        isAutoWatering = true;
        isManualWatering = false;

      } else if (payloadStr == "false") {
        isAutoWatering = false;
        isManualWatering = false;

        //get water level
      } else if (payloadStr == "getWaterLevel") {
        sendWaterLevel();

        // Manual Watering
      } else if (payloadStr == "start") {
        isManualWatering = true;

      } else if (payloadStr == "stop") {
        isManualWatering = false;

        //move camera arm
      } else if (payloadStr == "1" | payloadStr == "2" | payloadStr == "3" | payloadStr == "4" | payloadStr == "5" | payloadStr == "0") {
        // moveArm(payloadStr.toInt());
        Serial.printf("Arm controll", payload);
        currentAction = payloadStr.toInt();
      }

      // send message to server
      // webSocket.sendTXT("message here");
      break;
      // case WStype_BIN:
      //   Serial.printf("[WSc] get binary length: %u\n", length);
      //   hexdump(payload, length);

      // send data to server
      // webSocket.sendBIN(payload, length);
      // break;
    case WStype_ERROR:
      Serial.println("WebSocket ERROR..!");

      // case WStype_FRAGMENT_TEXT_START:
      // case WStype_FRAGMENT_BIN_START:
      // case WStype_FRAGMENT:
      // case WStype_FRAGMENT_FIN:
      break;
  }
}
