package dev.solberg.bullshift.Controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

import dev.solberg.bullshift.database.bullDatabase;

@RestController
@RequestMapping("/api")
public class restController {

String message ="";

bullDatabase db = new bullDatabase();


    @GetMapping("/")
    public String pathAPI() {
        return "Follow this pathing to get to the JSON.";
    }

    @GetMapping("/messages")
    public Map<String, String> messageList() {
        return Map.of("message", message);
    }

    @PostMapping("/messages")
    public String postMessage(@RequestBody Map<String, String> body) {
        message = body.get("message");

        //this inserts into the DB class
        db.database(message);
        return "Message received";
    }

}
