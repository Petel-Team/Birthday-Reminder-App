var  frame = require('ui/frame');
var view = require("ui/core/view");

function pageLoaded(args) {
    var page = args.object;

    /*var db = new global.Sqlite("user_token_table", function(err, db) {
        if (err) {
            console.error("We failed to open database", err);
        } else
        {
        // This should ALWAYS be true, db object is open in the "Callback" if no errors occurred
            console.log("Are we open yet (Inside Callback)? ", db.isOpen() ? "Yes" : "No"); // Yes
    }
});

    db.close;*/

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
