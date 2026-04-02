package dev.solberg.bullshift.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class bullDatabase {

    //THIS IS THE METHOD FOR THE DATABASE CREDENTIALS
    public Connection databaseConnect() {
         try {
             Connection connection=DriverManager.getConnection(
                     "jdbc:postgresql://localhost:5432/bullshift",
                     "postgres",
                     "pass1pass2@34"
             );
             return connection;
         } catch (Exception e) {
             e.printStackTrace();
             return null;
         }
    }

    /*public void messageData() {
        String sql = "INSERT INTO messages (message) VALUES (?)";
    }*/

    public void userData(String username, String email, String password) {
        String user = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        try (
                Connection connection = databaseConnect();
                PreparedStatement ps = connection.prepareStatement(user)
                ) {
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, password);
            ps.executeUpdate();
        } catch (Exception e) {
            e.printStackTrace();
        }//CATCH END
    }//userData METHOD END


} //class end
