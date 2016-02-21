var frame = require('ui/frame');
var view = require("ui/core/view");
var listViewModule = require("ui/list-view");
var observableArrayModule = require('data/observable-array');

function pageLoaded(args) {
    var page = args.object;
    var self=this;

    var filter = {
        'custom_user_id': global.currUser.Id
    };

    this.friendsArray = new observableArrayModule.ObservableArray([]);
    var backEndUserFriends = global.everlive.data('Friends');
    var listView = page.getViewById("friendsList");
    var addFriendButton = view.getViewById(page, "addFriendButton");
    listView.items = this.friendsArray;

    backEndUserFriends.get(filter)
        .then(function (data) {
                self.friendsArray.push(data['result']);
                listView.refresh();
            },
            function (error) {
                console.dir(JSON.stringify(error));
            });

    listView.on(listViewModule.ListView.itemTapEvent, function (args) {
        global.selectedFriend = self.friendsArray.getItem(args.index);
        frame.topmost().navigate("./views/friend_info/friend_info");
    });

    addFriendButton.on("Tap",function(){
        frame.topmost().navigate("./views/add_friend/add_friend");
    });


}

exports.pageLoaded = pageLoaded;