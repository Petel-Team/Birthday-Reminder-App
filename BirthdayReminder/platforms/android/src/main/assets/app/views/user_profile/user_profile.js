var  frame = require('ui/frame');
var view = require("ui/core/view");
function pageLoaded(args) {
    var page = args.object;

    var username = view.getViewById(page, "username");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var email = view.getViewById(page, "email");
    var birthday = view.getViewById(page, "birthday");
    var viewFriendsButton = view.getViewById(page, "viewFriendsButton");

    username.text = global.currUser.username;
    firstName.text = global.currUser.firstname;
    lastName.text = global.currUser.lastname;
    email.text = global.currUser.email;
    birthday.text = global.currUser.birthday;

    viewFriendsButton.on("Tap",function(){
        frame.topmost().navigate("./views/friends/friends");
    })
}
exports.pageLoaded = pageLoaded;
