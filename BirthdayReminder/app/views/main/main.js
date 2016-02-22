var frame = require('ui/frame');
var view = require("ui/core/view");
var gestures = require("ui/gestures");
var labelModule = require("ui/label")
var colorModule = require("color");
var dialogs = require("ui/dialogs");

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

    logInButton.on("Tap", function() {
        logInButton.animate({
                opacity: 0.7,
                scale: { x: 1.02, y: 1.02 },
                duration: 300
            }).then(function() {
                return logInButton.animate({
                    opacity: 1.0,
                    scale: { x: 0.98, y: 0.98 },
                    duration: 150
                });
            })
            .then(function() {
                var usernameValue = username.text.trim();
                var passwordValue = password.text.trim()
                if (usernameValue.length > 0 && passwordValue.length > 0) {

                    var glCurrUser = global.everlive.data('Custom_Users');
                    var filter = {
                        'username': usernameValue,
                        'password': passwordValue
                    };

                    glCurrUser.get(filter)
                        .then(function(data) {
                                if (data['count'] == '1') {
                                    global.currUser = data['result'][0];
                                    frame.topmost().navigate("./views/friends/friends");
                                } else {
                                    var title = 'Log in';
                                    var msg = 'Username and/or password do not exist!';
                                    var okBtnTxt = "Try again";
                                    dialogs.alert({
                                        title: title,
                                        message: msg,
                                        okButtonText: okBtnTxt
                                    })
                                }
                            },
                            function(error) {
                                console.dir(error);
                            });

                } else {
                    var title = 'Log in';
                    var msg = 'Username and/or password do not exist!';
                    var okBtnTxt = "Try again";
                    dialogs.alert({
                        title: title,
                        message: msg,
                        okButtonText: okBtnTxt
                    })
                }
            });
    });

    registerButton.on("Tap", function() {
        registerButton.animate({
                opacity: 0.7,
                scale: { x: 1.02, y: 1.02 },
                duration: 300
            }).then(function() {
                return registerButton.animate({
                    opacity: 1.0,
                    scale: { x: 0.98, y: 0.98 },
                    duration: 150
                });
            })
            .then(function() {
                frame.topmost().navigate("./views/register/register");
            });
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
