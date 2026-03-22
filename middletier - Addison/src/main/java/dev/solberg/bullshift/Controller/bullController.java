// Assignment: Bull-Shift App | Controller - Java
// Author: Addison Solberg
//THIS IS A CONTROLLER. NOT A REST CONTROLLER
package dev.solberg.bullshift.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller

public class bullController {

    @RequestMapping({"/messages", "/messages/"})
    public String ui() {
        return "forward:/messages/index.html";
    }

}
