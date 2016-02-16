var application = require("application");
var Sqlite = require( "nativescript-sqlite" );
var Everlive = require("./libs/everlive.all.min");
global.everlive = new Everlive({
        appId: "o6q19y3asj4cc4oe",
        scheme: "https"
    });
application.mainModule = "main-page";
application.cssFile = "./app.css";
application.start();
