var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var enums = require("ui/enums");
var dialogs = require("ui/dialogs");

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

        if (usernameValue.length >= 2 && usernameValue.length <= 10 && emailValue.length >0 ) {
            cameraModule.takePicture().then(function (picture) {
                userPicture.imageSource = picture;                
                var folder = fs.knownFolders.documents();
                var path = fs.path.join(folder.path, usernameValue + emailValue + birthday + ".png");
                console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));
                self.imagePath = path;

               // global.currUser.image = path;
            });
        }
        else {
            //label.text = "Fill in all fields before take picture!";
            var title = 'Registration';
            var msg = 'You must fill all other fields before taking a picture!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
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
            var title = 'Invalid username';
            var msg = 'Username must be between 5 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
        }
        else if (passwordValue.length < 5 || passwordValue.length > 10) {
            var title = 'Invalid password';
            var msg = 'Password must be between 5 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
        }
        else if (passwordValue != confirmPasswordValue) {
            var title = 'Invalid password';
            var msg = "Passwords do not match!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
        }
        else if (firstNameValue.length < 2 || firstNameValue.length > 10) {
            var title = 'Invalid name';
            var msg = "First name must be between 2 and 10 characters!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
        }
        else if (lastNameValue.length < 2 || lastNameValue.length > 10) {
            var title = 'Invalid name';
            var msg = "Last name must be between 2 and 10 characters!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
        }
        else if (emailValue.length == 0 || emailValue.indexOf('@') < 0) {
            var title = 'Invalid e-mail';
            var msg = "E-mail must be a valid e-mail address!";
            var okBtnTxt = "Try again";
            dialogs.alert({
                  title: title,
                  message: msg,
                  okButtonText: okBtnTxt
            })
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
                                    

                                    var title = 'Registration';
                                    var msg = "You have registered successfully!";
                                    
                                    dialogs.alert({
                                          title: title,
                                          message: msg                                          
                                    })

                                    global.currUser.Id = data['result']['Id'];
                                    frame.topmost().navigate("./views/user_profile/user_profile");
                                },
                                function (error) {
                                    console.log("ERROR ADD USER TO BACKEND", JSON.stringify(error));
                                });
                        }
                        else {
                            console.log("EXISTS");

                            var title = 'Registration';
                            var msg = "The username already exists!";
                            var okBtnTxt = "Try again";       

                            dialogs.alert({
                                          title: title,
                                          message: msg,
                                          okButtonText: okBtnTxt                                          
                                    })
                            //label.text = "Username exists!"
                        }
                    },
                    function (err) {
                        console.log("ERROR CONNECTING TO BACKEND", JSON.stringify(err));
                    });
        }
    });
}
exports.pageLoaded = pageLoaded;