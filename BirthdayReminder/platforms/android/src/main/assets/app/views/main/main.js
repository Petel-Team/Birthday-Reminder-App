var  frame = require('ui/frame');
var view = require("ui/core/view");

function pageLoaded(args) {
    var page = args.object;

    global.currUser.id = "67d3b5c0-d64a-11e5-a423-df559cec2fd1";
    global.currUser.username="uuuuuuu";
    global.currUser.email = "eeeeee";
    global.currUser.token="uuuuuuuuuuuuuuuuuuuuu";
    global.currUser.firstname="fffff";
    global.currUser.lastname="llllll";
    global.currUser.birthday="1.1.1950";

    var username = view.getViewById(page, "username");
    var password = view.getViewById(page, "password");
    var logInButton = view.getViewById(page, "logInButton");
    var registerButton = view.getViewById(page, "registerButton");
    var label = view.getViewById(page,"label");

    logInButton.on("Tap",function() {
        // var filter = {
        //     'username': username.text,
        //     'password': password.text
        // };
        // var backendUsers = global.everlive.data('Custom_Users');

        // backendUsers.get(filter)
        //     .then(function(data) {
        //         if(data["count"] == "1"){
        //             console.log("success");
                    frame.topmost().navigate("./views/user_profile/user_profile");
    //             }
    //             else{
    //                 label.text="Username or Password are wrong!"
    //             }
    //     },
    //         function(err) {
    //         console.log(JSON.stringify(err));
    //     });
    });

    registerButton.on("Tap",function(){
        frame.topmost().navigate("./views/register/register");
    });
}
exports.pageLoaded = pageLoaded;
