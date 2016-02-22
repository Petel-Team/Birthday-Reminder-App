var frame = require('ui/frame');
var view = require("ui/core/view");
var enums = require("ui/enums");
var dialogs = require("ui/dialogs");

function pageLoaded(args) {
    var page = args.object;

    var username = view.getViewById(page, "username");
    var password = view.getViewById(page, "password");
    var confirmPassword = view.getViewById(page, "confirmPassword");
    var registerButton = view.getViewById(page, "registerButton");
    var label = view.getViewById(page, "label");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var email = view.getViewById(page, "email");
    var takePictureButton = view.getViewById(page, "takePictureButton");

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

        var usernameValue = username.text.trim();
        var emailValue = email.text.trim();
        var passwordValue = password.text.trim();
        var confirmPasswordValue = confirmPassword.text.trim();
        var firstNameValue = firstName.text.trim();
        var lastNameValue = lastName.text.trim();

        if (usernameValue.length < 5 || usernameValue.length > 10) {
            var title = 'Invalid username';
            var msg = 'Username must be between 5 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (passwordValue.length < 5 || passwordValue.length > 10) {
            var title = 'Invalid password';
            var msg = 'Password must be between 5 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (passwordValue != confirmPasswordValue) {
            var title = 'Invalid password';
            var msg = "Passwords do not match!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (firstNameValue.length < 2 || firstNameValue.length > 10) {
            var title = 'Invalid name';
            var msg = "First name must be between 2 and 10 characters!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (lastNameValue.length < 2 || lastNameValue.length > 10) {
            var title = 'Invalid name';
            var msg = "Last name must be between 2 and 10 characters!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (emailValue.length == 0 || emailValue.indexOf('@') < 0) {
            var title = 'Invalid e-mail';
            var msg = "E-mail must be a valid e-mail address!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else {
            var token = usernameValue + usernameValue + usernameValue;
            var filter = {
                'username': usernameValue
            };

            var newBackendUser = global.everlive.data('Custom_Users');
            global.currUser = {
                'username': usernameValue,
                'password': passwordValue,
                'token': token,
                'firstname': firstNameValue,
                'lastname': lastNameValue,
                'email': emailValue
            };

            newBackendUser.get(filter)
                .then(function(data) {
                        if (data["count"] == "0") {
                            console.log("SUCCESS");

                            newBackendUser.create(global.currUser,
                                function(data) {
                                    var title = 'Registration';
                                    var msg = "You have registered successfully!";

                                    dialogs.alert({
                                        title: title,
                                        message: msg
                                    });

                                    global.currUser.Id = data['result']['Id'];
                                    frame.topmost().navigate("./views/user_profile/user_profile");
                                },
                                function(error) {
                                    console.log("ERROR ADD USER TO BACKEND", JSON.stringify(error));
                                });
                        } else {
                            console.log("EXISTS");

                            var title = 'Registration';
                            var msg = "The username already exists!";
                            var okBtnTxt = "Try again";

                            dialogs.alert({
                                title: title,
                                message: msg,
                                okButtonText: okBtnTxt
                            });
                            //label.text = "Username exists!"
                        }
                    },
                    function(err) {
                        console.log("ERROR CONNECTING TO BACKEND", JSON.stringify(err));
                    });
        }
    });
}
exports.pageLoaded = pageLoaded;
