package dev.solberg.bullshift.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class bullDatabase {

    public void database(String message) {

        String sql = "INSERT INTO messages (message) VALUES (?)";

        PreparedStatement ps = null;
        Connection connection = null;

        //CONNECTING TO THE DATABASE
        try {
            connection=DriverManager.getConnection(
                    "jdbc:postgresql://localhost:5432/bullshift",
                    "postgres",
                    "pass1pass2@34"
            );

            if(connection!=null)
                System.out.println("Connection Success");
            else
                System.out.println("Connection Fail");


            ps = connection.prepareStatement(sql);

            ps.setString(1, message);
            ps.executeUpdate();

                System.out.println("Successful Update");

        } catch (Exception e) {
            System.out.println(e);
        } finally {
            try {
                if (ps != null)
                    ps.close();
            } catch (Exception e) {}

            try {
                if (connection != null)
                    connection.close();
            } catch (Exception e) {}
        } //FINALLY END


    } //databases method end





} //class end
