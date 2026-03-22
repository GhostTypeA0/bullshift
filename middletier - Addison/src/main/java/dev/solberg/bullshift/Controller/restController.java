package dev.solberg.bullshift.Controller;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

import dev.solberg.bullshift.database.bullDatabase;
import dev.solberg.bullshift.entity.bullEntity;

@RestController
@RequestMapping("/api")
public class restController {

List<bullEntity> messages = new ArrayList<>();

bullDatabase db = new bullDatabase();


    @GetMapping("/")
    public String pathAPI() {
        return "Follow this pathing to get to the JSON.";
    }


    //THIS GET MAPPING PATH IS WHERE THE JSON IS FORMED
    @GetMapping("/messages")
    public List<bullEntity> messageList() {
        return messages;
    }

    @PostMapping("/messages")
    public String postMessage(@RequestBody bullEntity body) {
        bullEntity msg = new bullEntity(
                //body.getUser(),
                body.getMessage()
                //body.getTime()
        );

        messages.add(msg);

        //this inserts into the DB class
        db.database(msg.getMessage());
        return "Message received";
    }

}
