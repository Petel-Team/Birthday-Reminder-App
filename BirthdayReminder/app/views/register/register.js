var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var enums = require("ui/enums");
function pageLoaded(args) {
    var page = args.object;
    var self = this;

    var username = view.getViewById(page, "username");
    var password = view.getViewById(page, "password");
    var confirmPassword = view.getViewById(page, "confirmPassword");
    var registerButton = view.getViewById(page, "registerButton");
    var label = view.getViewById(page, "label");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var email = view.getViewById(page, "email");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var datepicker = view.getViewById(page, "birthday");
    var userPicture = view.getViewById(page, "picture");
    datepicker.month = 1;
    datepicker.day = 1;
    datepicker.year = 1950;

    takePictureButton.on("Tap", function () {
        var usernameValue = username.text.trim();
        var emailValue = email.text.trim();
        var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;

        if (usernameValue.length >= 5 && usernameValue.length <= 10 && emailValue.length >0 ) {
            cameraModule.takePicture().then(function (picture) {
                userPicture.imageSource = picture;
                var folder = fs.knownFolders.documents();
                var path = fs.path.join(folder.path, usernameValue + emailValue + birthday + ".png");
                console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));
                self.imagePath = path;
            });
        }
        else {
            label.text = "Fill in all fields before take picture!";
        }
    });
    registerButton.on("Tap", function () {
        var usernameValue = username.text.trim();
        var emailValue = email.text.trim();
        var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;
        var passwordValue = password.text.trim();
        var confirmPasswordValue = confirmPassword.text.trim();
        var firstNameValue = firstName.text.trim();
        var lastNameValue = lastName.text.trim();
        //var userPictureFile = userPicture.imageSource;

        if (usernameValue.length < 5 || usernameValue.length > 10) {
            label.text = "Username must be between 5 and 10 characters!";
        }
        else if (passwordValue.length < 5 || passwordValue.length > 10) {
            label.text = "Password must be between 5 and 10 characters!";
        }
        else if (passwordValue != confirmPasswordValue) {
            label.text = "Passwords do not match!";
        }
        else if (firstNameValue.length < 5 || firstNameValue.length > 10) {
            label.text = "First Name must be between 5 and 10 characters!";
        }
        else if (lastNameValue.length < 5 || lastNameValue.length > 10) {
            label.text = "Last Name must be between 5 and 10 characters!";
        }
        else if (emailValue.length == 0) {
            label.text = "Email cannot be empty!";
        }
        else {
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
                'email': emailValue,
                'birthday': birthday,
                'image': self.imagePath
            };

            newBackendUser.get(filter)
                .then(function (data) {
                        if (data["count"] == "0") {
                            console.log("SUCCESS");

                            newBackendUser.create(global.currUser,
                                function (data) {
                                    var db_promise = new global.Sqlite("user_token.db", function (err, db) {
                                        if (err) {
                                            console.error("OPEN DATABASE FAILED", err);
                                        } else {
                                            // This should ALWAYS be true, db object is open in the "Callback" if no errors occurred
                                            console.log("DATABASE OPEN"); // Yes

                                            db.execSQL("DELETE FROM user_token_table", function (err) {
                                                if (err) {
                                                    console.error("DELETE ERROR: ", err);
                                                }
                                                else {
                                                    console.log("SUCCESS DELETE!");
                                                }
                                            });

                                            db.execSQL("INSERT INTO user_token_table (token) VALUES (?)", [token], function (err, id) {
                                                if (err) {
                                                    console.error("INSERT FAILED", err);
                                                } else {
                                                    console.log("The new record id is:", id);
                                                }
                                            });

                                            db.all("SELECT * FROM user_token_table", function (err, resultSet) {
                                                if (err) {
                                                    console.error("SELECT FAILED: ", err);
                                                } else {
                                                    console.log("Result set is: ", resultSet);
                                                }
                                            });
                                            db.close;
                                        }
                                    });
                                    global.currUser.Id = data['result']['Id'];
                                    frame.topmost().navigate("./views/user_profile/user_profile");
                                },
                                function (error) {
                                    console.log("ERROR ADD USER TO BACKEND", JSON.stringify(error));
                                });
                        }
                        else {
                            console.log("EXISTS");
                            label.text = "Username exists!"
                        }
                    },
                    function (err) {
                        console.log("ERROR CONNECTING TO BACKEND", JSON.stringify(err));
                    });
        }
    });
}
exports.pageLoaded = pageLoaded;