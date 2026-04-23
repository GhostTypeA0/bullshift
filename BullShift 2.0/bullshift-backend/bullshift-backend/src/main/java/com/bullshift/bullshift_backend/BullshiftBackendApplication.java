package com.bullshift.bullshift_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BullshiftBackendApplication {

    public static void main(String[] args) {
        // This is the entry point of the entire Spring Boot backend.
        // SpringApplication.run(...) starts:
        // - the embedded web server (Tomcat)
        // - component scanning (controllers, services, repositories)
        // - auto-configuration (DB, WebSockets, REST, etc.)
        // Once this runs, your backend is fully bootstrapped and ready.
        SpringApplication.run(BullshiftBackendApplication.class, args);
    }
}
