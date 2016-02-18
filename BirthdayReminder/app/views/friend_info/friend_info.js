var  frame = require('ui/frame');
var view = require("ui/core/view");
function pageLoaded(args) {
    var page = args.object;
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var ideas = view.getViewById(page, "ideas");
    var birthday = view.getViewById(page, "birthday");

    firstName.text= global.selectedFriend.firstname;
    lastName.text = global.selectedFriend.lastname;
    birthday.text = global.selectedFriend.birthday;
    ideas.text = global.selectedFriend.ideas;

}
exports.pageLoaded = pageLoaded;