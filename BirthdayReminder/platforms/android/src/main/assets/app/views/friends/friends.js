var frame = require('ui/frame');
var view = require("ui/core/view");
var listViewModule = require("ui/list-view");
var observableArrayModule = require('data/observable-array');
var friendsArray = new observableArrayModule.ObservableArray([]);

function pageLoaded(args) {
    var page = args.object;

    var filter = {
        'custom_user_id': global.currUser.id
    };

    var backEndUserFriends = global.everlive.data('Friends');
    var listView = page.getViewById("friendsList");
    listView.items = friendsArray;

    backEndUserFriends.get(filter)
        .then(function (data) {
                friendsArray.push(data['result']);
                listView.refresh();
            },
            function (error) {
                console.dir(JSON.stringify(error));
            });

    listView.on(listViewModule.ListView.itemTapEvent, function (args) {
        global.selectedFriend = friendsArray.getItem(args.index);
        frame.topmost().navigate("./views/friend_info/friend_info");
    });


}

exports.pageLoaded = pageLoaded;