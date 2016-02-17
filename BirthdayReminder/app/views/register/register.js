var frame = require('ui/frame');
var view = require("ui/core/view");
function pageLoaded(args) {
    var page = args.object;

    var username = view.getViewById(page, "username");
    var password = view.getViewById(page, "password");
    var confirmPassword = view.getViewById(page, "confirmPassword");
    var registerButton = view.getViewById(page, "registerButton");
    var label = view.getViewById(page, "label");

    registerButton.on("Tap", function () {
        var usernameValue = username.text.trim();
        var passwordValue = password.text.trim();
        var confirmPasswordValue = confirmPassword.text.trim();

        if (usernameValue.length == 0 || usernameValue.length < 5 || usernameValue.length > 10) {
            label.text = "Username cannot be empty and must be between 5 and 10 characters!";
        }
        else if (passwordValue.length == 0 || passwordValue.length < 5 || passwordValue.length > 10) {
            label.text = "Password cannot be empty and must be between 5 and 10 characters!";
        }
        else if (passwordValue != confirmPasswordValue) {
            label.text = "Passwords do not match!";
        }
        else {
            var token = usernameValue + usernameValue + usernameValue;
            var filter = {
                'username': usernameValue
            };

            var newBackendUser = global.everlive.data('Custom_Users');

            newBackendUser.get(filter)
                .then(function (data) {
                    if (data["count"] == "0") {
                        console.log("SUCCESS");

                        newBackendUser.create({
                                'username': usernameValue,
                                'password': passwordValue,
                                'token': token
                            },
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

                                        /*db.all("SELECT * FROM user_token_table",function(err, resultSet) {
                                         if (err) {
                                         console.error("SELECT FAILED: ", err);
                                         } else {
                                         console.log("Result set is: ", resultSet);
                                         }
                                         });*/
                                        db.close;
                                    }
                                });
                                console.log("111111",JSON.stringify(data));
                            },
                            function (error) {
                                console.log("222222",JSON.stringify(error));
                            });
                        console.log("333333",JSON.stringify(data));
                        frame.topmost().navigate("./views/user_profile/user_profile");
                    }
                    else {
                        console.log("EXISTS");
                        label.text = "Username exists!"
                    }
                },
                function (err) {
                    console.log(JSON.stringify(err));
                });
        }
    });
}
exports.pageLoaded = pageLoaded;