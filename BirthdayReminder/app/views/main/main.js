var frame = require('ui/frame');
var view = require("ui/core/view");
var gestures = require("ui/gestures");
var labelModule = require("ui/label")
var colorModule = require("color");

function pageLoaded(args) {
    var page = args.object;

    var text = "Welcome to Birthday Reminder!\nPlease log in or register..";
    var textView = page.getViewById("welcome-text");
    textView.text = text;

    var glCurrUser = global.everlive.data('Custom_Users');
    var filter = {
        'Id': "67d3b5c0-d64a-11e5-a423-df559cec2fd1"
    };

    glCurrUser.get(filter)
        .then(function(data) {
                global.currUser = data['result'][0];
            },
            function(error) {
                console.dir(error);
            });

    var username = view.getViewById(page, "username");
    var password = view.getViewById(page, "password");
    var logInButton = view.getViewById(page, "logInButton");
    var registerButton = view.getViewById(page, "registerButton");
    var label = view.getViewById(page, "label");

    logInButton.backgroundColor = "#3f51b5";
    logInButton.on("Tap", function() {
        //page.css = "#logInButton { background-color: #9fa8da; }";
        // var filter = {
        //     'username': username.text,
        //     'password': password.text
        // };
        // var backendUsers = global.everlive.data('Custom_Users');

        // backendUsers.get(filter)
        //     .then(function(data) {
        //         if(data["count"] == "1"){
        //             console.log("success");
        logInButton.animate({
                backgroundColor: new colorModule.Color("#3f51b5"),
                opacity: 0.7,
                scale: { x: 1.02, y: 1.02 },
                duration: 300
            }).then(function() {
                return logInButton.animate({
                    backgroundColor: new colorModule.Color("#3f51b5"),
                    opacity: 1.0,                    
                    scale: { x: 0.98, y: 0.98 },
                    duration: 300
                });
            })
            .then(function() {
                frame.topmost().navigate("./views/friends/friends");
            });
            // frame.topmost().navigate("./views/friends/friends");
            //             }
            //             else{
            //                 label.text="Username or Password are wrong!"
            //             }
            //     },
            //         function(err) {
            //         console.log(JSON.stringify(err));
            //     });
    });

    registerButton.on("Tap", function() {
        frame.topmost().navigate("./views/register/register");
    });
}

function pageNavigatedTo(args) {
    var page = args.object;
    page.bindingContext = page.navigationContext;

    var logInButton = view.getViewById(page, "logInButton");
    logInButton.backgroundColor = new colorModule.Color("#3f51b5");
}

exports.pageLoaded = pageLoaded;
exports.pageNavigatedTo = pageNavigatedTo;
