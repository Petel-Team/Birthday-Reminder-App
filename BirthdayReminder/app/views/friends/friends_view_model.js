var observable = require("data/observable");
var observableArrayModule = require('data/observable-array');

var FriendsModel = new observable.Observable();
var friendsArray = new observableArrayModule.ObservableArray([]);
var filter = {
    'custom_user_id': global.currUser.id
};

var backEndUserFriends = global.everlive.data('Friends');

backEndUserFriends.get(filter)
    .then(function (data) {

            FriendsModel.set("friendsList",data["result"]);
            console.log(friendsArray);

            console.dir(data);
        },
        function (error) {
            console.dir(JSON.stringify(error));
        });
exports.FriendsModel = FriendsModel;