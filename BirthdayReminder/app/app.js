var application = require("application");
global.Sqlite = require("nativescript-sqlite");
var Everlive = require("./libs/everlive.all.min");

global.everlive = new Everlive({
    appId: "o6q19y3asj4cc4oe",
    scheme: "https"
});

new global.Sqlite("user_token.db", function(err, db) {
            db.execSQL("Create table user_token_table (token varchar(255))");
            db.version(1);
});

global.currUser={
    'username': "",
    'token': "",
    'firstname': "",
    'lastname': "",
    'email': "",
    'birthday': ""
};

application.mainModule = "/views/main/main";
application.cssFile = "./app.css";
application.start();
