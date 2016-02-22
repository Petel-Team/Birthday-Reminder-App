var frame = require('ui/frame');
var view = require("ui/core/view");
var listViewModule = require("ui/list-view");
var observableArrayModule = require('data/observable-array');
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");



function pageLoaded(args) {
    var page = args.object;

    page.on(gestures.GestureTypes.swipe, function(args) {
        if (args.direction === 2) {
            console.log("Page Swipe Direction: " + args.direction);
            frame.topmost().navigate("./views/user_profile/user_profile");
        }
    });

    var self = this;

    var filter = {
        'custom_user_id': global.currUser.Id
    };


    this.friendsArray = new observableArrayModule.ObservableArray([]);
    var backEndUserFriends = global.everlive.data('Friends');
    var listView = page.getViewById("friendsList");

    var addFriendButton = view.getViewById(page, "addFriendButton");
    listView.items = this.friendsArray;

    backEndUserFriends.get(filter)
        .then(function(data) {
                self.friendsArray.push(data['result']);

                var number = self.friendsArray.length;
                for (var i = 0; i < number; i++) {
                    if (self.friendsArray.getItem(i).image == undefined) {
                        self.friendsArray.getItem(i).image = "~/img/Alien-256.png";
                    }
                }

                listView.refresh();
            },
            function(error) {
                console.dir(JSON.stringify(error));
            });

    // var sortBday = page.getViewById(page,"sortBday");
    // console.log(sortBday);
    // function onSortBday()({
    //     var result = self.friendsArray.sort(function (a, b) { return a.birthday - b.birthday; });
    //     console.dir(result);
    // });

    listView.on(gestures.GestureTypes.swipe, function(args) {
        if (args.direction === 2) {
            console.log("Page Swipe Direction: " + args.direction);
            frame.topmost().navigate("./views/user_profile/user_profile");
        }
    });

    listView.on(listViewModule.ListView.itemTapEvent, function(args) {
        global.selectedFriend = self.friendsArray.getItem(args.index);
        frame.topmost().navigate("./views/friend_info/friend_info");
    });

    addFriendButton.on("Tap", function() {
        addFriendButton.animate({
            opacity: 0.7,
            scale: { x: 1.02, y: 1.02 },
            duration: 300
        }).then(function() {
            return addFriendButton.animate({
                opacity: 1.0,
                scale: { x: 0.98, y: 0.98 },
                duration: 150
            });
        }).then(function() {
            frame.topmost().navigate("./views/add_friend/add_friend");
        });

    });
}

exports.pageLoaded = pageLoaded;
