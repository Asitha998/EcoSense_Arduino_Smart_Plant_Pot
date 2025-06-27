package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.User;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "SignIn", urlPatterns = {"/SignIn"})
public class SignIn extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);

        JsonObject requestJson = gson.fromJson(req.getReader(), JsonObject.class);
        String email = requestJson.get("email").getAsString();
        String password = requestJson.get("password").getAsString();

        if (email.isEmpty()) {
            //mobile number is blank
            responseJson.addProperty("message", "Please enter your email");

        } else if (password.isEmpty()) {
            //password is blank
            responseJson.addProperty("message", "Please enter your Password");

        } else {

            Session session = HibernateUtil.getSessionFactory().openSession();

            //search user
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.eq("email", email));
            criteria1.add(Restrictions.eq("password", password));
            
            if (!criteria1.list().isEmpty()) {
                //user found
                User user = (User) criteria1.uniqueResult();

                responseJson.add("user", gson.toJsonTree(user));
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "Sign In Success");

            } else {
                //user not found
                responseJson.addProperty("message", "Invalid Credentials");

            }
            session.close();
        }

        resp.setContentType("application/json");
        resp.getWriter().write(gson.toJson(responseJson));
    }
}
