package dev.solberg.bullshift.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Scanner;

public class bullDatabase {
    //port    : 3306
    //username: root
    //pass    : Blackie2269!
    //hostname: bull-shift-database.cpmsqcaekdpt.us-east-2.rds.amazonaws.com


    static void database() {

        PreparedStatement ps = null;
        Connection connection = null;

        try {
            connection=DriverManager.getConnection(
                    "jdbc:mysql://localhost3306/",
                    "root",
                    "Blackie2269!"
            );
        } catch (Exception e) {
            System.out.println(e);
        }

    }





} //class end
