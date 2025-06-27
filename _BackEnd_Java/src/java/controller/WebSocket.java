package controller;

//import com.google.gson.Gson;
//import com.google.gson.JsonArray;
//import com.google.gson.JsonObject;
//import entity.User;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Humidity;
import entity.Moisture;
import entity.Sensors;
import entity.Sunlight;
import entity.Temperature;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
//import java.net.URLDecoder;
//import java.nio.charset.StandardCharsets;
//import java.text.SimpleDateFormat;
//import java.util.Date;
//import java.util.List;
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import model.HibernateUtil;
//import model.HibernateUtil;
//import org.hibernate.Criteria;
//import org.hibernate.criterion.Order;
//import org.hibernate.criterion.Restrictions;

@ServerEndpoint("/WebSocket")
public class WebSocket {

    private static Map<Session, String> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void open(Session session) throws IOException {
        // Default type as unknown until identified
        sessions.put(session, "unknown");
        System.out.println("Client connected: " + session.getId());
    }

    @OnClose
    public void close(Session session) throws IOException {
        sessions.remove(session);
        System.out.println("Client disconnected: " + session.getId());

//        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
//            Object key = entry.getKey();
//            Object val = entry.getValue();
//            System.out.println(val);
//        }
    }

    @OnError
    public void onError(Throwable error) {
        error.printStackTrace();
    }

    private ArrayList<Double> temperatureArray = new ArrayList<>();
    private ArrayList<Double> humidityArray = new ArrayList<>();
    private ArrayList<Double> moistureArray = new ArrayList<>();
    private ArrayList<Double> sunlightArray = new ArrayList<>();

    Gson gson = new Gson();

    private static int currentPage = 2;  // 1 = camera view, 2 = home, 3 = watering

    private static Session espSession = null;
    private static Session appSession = null;

    @OnMessage
    public void handleMessage(String message, Session session) throws IOException {
//        System.out.println("Received message: " + message);

        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            Object key = entry.getKey();
            Object val = entry.getValue();
            System.out.println(val);
        }

        // Identify client type based on first message
        if (message.equals("ESP32")) {

            for (Map.Entry<Session, String> entry : sessions.entrySet()) {
                Object key = entry.getKey();
                Object val = entry.getValue();
                
                if (val == "ESP32" || val == "unknown") {
                    sessions.remove(key);
                }
                
            }

            sessions.put(session, "ESP32");
            System.out.println("ESP32 identified");

            espSession = session;

            session.getBasicRemote().sendText("WebSocket Connected Successful");

            sendToApp(message);

            return;
        }

        if (message.equals("App")) {
            sessions.put(session, "App");
            System.out.println("App identified");

//            session.getBasicRemote().sendText("WebSocket Connected Successful");
//            sendToApp(message);
            return;
        }

        // If message from app
        if (!sessions.get(session).equals("ESP32")) {

            System.out.println(message);

            JsonObject messageJson = gson.fromJson(message, JsonObject.class);

            if (messageJson.has("currentPage")) {
                currentPage = messageJson.get("currentPage").getAsInt();

                if (messageJson.get("currentPage").getAsInt() == 3 && espSession != null) {
                    espSession.getBasicRemote().sendText("getWaterLevel");
                }
            }

            if (messageJson.has("autoWatering")) {
                System.out.println(messageJson.get("autoWatering").getAsString());
                if (espSession != null) {
                    espSession.getBasicRemote().sendText(messageJson.get("autoWatering").getAsString());
                    System.out.println(messageJson.get("autoWatering").getAsString());
                }
            }

            if (messageJson.has("manualWatering")) {
                System.out.println(messageJson.get("manualWatering").getAsString());
                if (espSession != null) {
                    espSession.getBasicRemote().sendText(messageJson.get("manualWatering").getAsString());
                    System.out.println(messageJson.get("manualWatering").getAsString());
                }
            }

            if (messageJson.has("arm") && currentPage == 1) {
                System.out.println(messageJson.get("arm").getAsString());
                if (espSession != null) {
                    espSession.getBasicRemote().sendText(messageJson.get("arm").getAsString());
                    System.out.println(messageJson.get("arm").getAsString());
                }
            }

            System.out.println(currentPage);

        }

        // If message is sensor data, broadcast it only to non-ESP32 clients
        if (sessions.get(session).equals("ESP32")) {

            JsonObject messageJson = gson.fromJson(message, JsonObject.class);

            if (currentPage == 2 && !messageJson.has("waterLevel")) {
                sendToApp(message);
//                System.out.println("Received message sensor data: " + message);

            } else if (currentPage == 3) {

                if (messageJson.has("waterLevel")) {
                    sendToApp(message);
//                    System.out.println("Received message water level: " + message);
                }
            }

            if (temperatureArray.size() >= 150) {

                //database session
                org.hibernate.Session dbSession = HibernateUtil.getSessionFactory().openSession();

                Date date = new Date();

                Sensors sensorTemp = (Sensors) dbSession.get(Sensors.class, 1);
                Sensors sensorHumi = (Sensors) dbSession.get(Sensors.class, 2);
                Sensors sensorMois = (Sensors) dbSession.get(Sensors.class, 3);
                Sensors sensorSun = (Sensors) dbSession.get(Sensors.class, 4);

                //Temperature to db
                double tempSum = 0.0;
                for (Double temp : temperatureArray) {
                    tempSum += temp;
                }
                double tempAvg = tempSum / temperatureArray.size();

                Temperature temperature = new Temperature();
                temperature.setSensor(sensorTemp);
                temperature.setValue(Math.round(tempAvg * 100.0) / 100.0);
                temperature.setDate_time(date);

                dbSession.save(temperature);

                //Humidity to db
                double HumiSum = 0.0;
                for (Double humi : humidityArray) {
                    HumiSum += humi;
                }
                double HumiAvg = HumiSum / humidityArray.size();

                Humidity humidity = new Humidity();
                humidity.setSensor(sensorHumi);
                humidity.setValue(Math.round(HumiAvg * 100.0) / 100.0);
                humidity.setDate_time(date);

                dbSession.save(humidity);

                //Moisture to db
                double MoisSum = 0.0;
                for (Double mois : moistureArray) {
                    MoisSum += mois;
                }
                double MoisAvg = MoisSum / moistureArray.size();

                Moisture moisture = new Moisture();
                moisture.setSensor(sensorMois);
                moisture.setValue(Math.round(MoisAvg * 100.0) / 100.0);
                moisture.setDate_time(date);

                dbSession.save(moisture);

                //Sunlight to db
                double SunSum = 0.0;
                for (Double sun : sunlightArray) {
                    SunSum += sun;
                }
                double SunAvg = SunSum / sunlightArray.size();

                Sunlight sunlight = new Sunlight();
                sunlight.setSensor(sensorSun);
                sunlight.setValue(Math.round(SunAvg * 100.0) / 100.0);
                sunlight.setDate_time(date);

                dbSession.save(sunlight);

                dbSession.beginTransaction().commit();
                dbSession.close();

                //clear sensor data from arrays
                temperatureArray.clear();
                humidityArray.clear();
                moistureArray.clear();
                sunlightArray.clear();

            }

            if (!messageJson.has("waterLevel")) {

                //add sensor data to arrays
                temperatureArray.add(messageJson.get("temperature").getAsDouble());
                humidityArray.add(messageJson.get("humidity").getAsDouble());
                moistureArray.add(messageJson.get("moisture").getAsDouble());
                sunlightArray.add(messageJson.get("sunlight").getAsDouble());
            }
        }
    }

    // Broadcast message only to app clients
    private void sendToApp(String message) {
        for (Map.Entry<Session, String> entry : sessions.entrySet()) {
            if (entry.getValue().equals("App")) { // Send only to non-ESP32 clients
                try {
                    entry.getKey().getBasicRemote().sendText(message);
                    System.out.println("data sent...");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
