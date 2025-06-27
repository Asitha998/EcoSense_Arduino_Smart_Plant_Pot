package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Humidity;
import entity.Moisture;
import entity.Sunlight;
import entity.Temperature;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "DailyAvg", urlPatterns = {"/DailyAvg"})
public class DailyAvg extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);

        Session session = HibernateUtil.getSessionFactory().openSession();

//        Date date = new Date();
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
//        String today = sdf.format(date);
        //get today using calender object
        Calendar calendar = Calendar.getInstance();

        // Start of the day
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        Date startOfDay = calendar.getTime();

        // End of the day
        calendar.set(Calendar.HOUR_OF_DAY, 23);
        calendar.set(Calendar.MINUTE, 59);
        calendar.set(Calendar.SECOND, 59);
        calendar.set(Calendar.MILLISECOND, 999);
        Date endOfDay = calendar.getTime();

        //get today all temperature values
        Criteria criteria1 = session.createCriteria(Temperature.class);
        criteria1.add(Restrictions.between("date_time", startOfDay, endOfDay));

        if (!criteria1.list().isEmpty()) {
            List<Temperature> temperatureList = criteria1.list();

            double totalTemp = 0;
            for (Temperature temperature : temperatureList) {
                totalTemp += temperature.getValue();
            }

            responseJson.addProperty("tempAvg", Math.round(totalTemp / temperatureList.size() * 100.0) / 100.0);
        }

        //get today all humidity values
        Criteria criteria2 = session.createCriteria(Humidity.class);
        criteria2.add(Restrictions.between("date_time", startOfDay, endOfDay));

        if (!criteria2.list().isEmpty()) {
            List<Humidity> humidityList = criteria2.list();

            double totalHumi = 0;
            for (Humidity humidity : humidityList) {
                totalHumi += humidity.getValue();
            }

            responseJson.addProperty("humiAvg", Math.round(totalHumi / humidityList.size() * 100.0) / 100.0);
        }

        //get today all moisture values
        Criteria criteria3 = session.createCriteria(Moisture.class);
        criteria3.add(Restrictions.between("date_time", startOfDay, endOfDay));

        if (!criteria3.list().isEmpty()) {
            List<Moisture> moistureList = criteria3.list();

            double totalMois = 0;
            for (Moisture moisture : moistureList) {
                totalMois += moisture.getValue();
            }

            responseJson.addProperty("moistAvg", Math.round(totalMois / moistureList.size() * 100.0) / 100.0);
        }

        //get today all sunlight values
        Criteria criteria4 = session.createCriteria(Sunlight.class);
        criteria4.add(Restrictions.between("date_time", startOfDay, endOfDay));

        if (!criteria4.list().isEmpty()) {
            List<Sunlight> sunlightList = criteria4.list();

            double totalSun = 0;
            for (Sunlight sunlight : sunlightList) {
                totalSun += sunlight.getValue();
            }

            responseJson.addProperty("sunAvg", Math.round(totalSun / sunlightList.size() * 100.0) / 100.0);
        }

        responseJson.addProperty("success", true);

        resp.setContentType("application/json");
        resp.getWriter().write(gson.toJson(responseJson));
    }
}
