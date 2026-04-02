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
List<bullEntity> accounts = new ArrayList<>();

bullDatabase db = new bullDatabase();



    @GetMapping("/login")
    public List<bullEntity> accountList() {
        return accounts;
    }//GetMapping END

    @PostMapping("/login")
    public String postAccount(@RequestBody bullEntity body) {
        //Create Object
        bullEntity account = new bullEntity(
                body.getUsername(),
                body.getEmail(),
                body.getPassword()
        );
        //Add to ArrayList;
        accounts.add(account);

        //Call Database
        db.userData(
                account.getUsername(),
                account.getEmail(),
                account.getPassword()
        );
        return "account storage success";
    }//PostMapping END
}
