README

There are files in this iteration that need to be moved from localStorage to 
the database, but some also do NOT need to move. The following are to either
be removed or unchanged.

SOME THINGS NEED ALTERATION IN THE DATABASE AS WELL

User creation currently does not look for users with the same name. This will
need to be changed so that if user "bigdavid22" is already in the database,
there cannot be another "bigdavid22". I did not implement this on the front end
as I figured it would need to be handled between the middle tier and back end.



#login-script.js
1. Lines 40-42 deal with user creation and pushing that user into localStorage.
   This needs to be moved into the database so that when a user is created, it
   is then placed into the database.

2. Lines 51-83 (NOT THE WHOLE SECTION) has areas where localStorage is needed
   and things that need to be adjusted. Lines 60-63 are used to call the user
   from localStorage to be able to sign in, this needs to change to call the 
   login information from the database. Line 71 stores the user in localStorage
   SO THAT you stay logged in when going to the next few pages (I'm unsure if 
   there's another way to do this currently, so leave this as is).

3. Lines 86-101 are just used for the localStorage table that is rendered after
   a user is created. Once everything is moved into the database, this section
   can be fully removed (line 104 can also be removed at that time).


#chat.js
1. Line 23 calls on the user that has been logged into localStorage. This is 
   technically connected to Line 71 in login-script.js so I am unsure if it
   can be removed.

2. Lines 105-109 save messages into localStorage. This function will be altered 
   to save messages to the database. 
   
3. Lines 112-125 load messages from localStorage. This function will be altered
   to load messages from the database.

4. Lines 128-134 is a handler for logging out, and should not need to be changed
   if the current logged in user information is saved in localStorage.