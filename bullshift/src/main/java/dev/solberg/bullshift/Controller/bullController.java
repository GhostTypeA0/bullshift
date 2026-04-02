// Assignment: Bull-Shift App | Controller - Java
// Author: Addison Solberg
//THIS IS A CONTROLLER. NOT A REST CONTROLLER
package dev.solberg.bullshift.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller

public class bullController {

    @RequestMapping({"/login", "/login/"})
    public String log() {
        return "forward:/messages/login.html";
    }


    @RequestMapping({"/messages", "/messages/"})
    public String mes() {
        return "forward:/messages/chat.html";
    }
}
