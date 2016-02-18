'use strict';

var observable = require("data/observable");
var observableArrayModule = require('data/observable-array');

class FriendsModel extends observable.Observable {
  constructor() {
    super();
    this.items = new observableArrayModule.ObservableArray([]);

    //The very ugly lines I mentioned
    // var filter = {
    // 'custom_user_id': global.currUser.id
    // };

    // var backEndUserFriends = global.everlive.data('Friends');
    // var self = this;

    // backEndUserFriends.get(filter)
    //     .then(function (data) {
    //             self.items = data["result"];
    //             console.dir(self.items);
    //         },
    //         function (error) {
    //             console.dir(JSON.stringify(error));
    //         });
  }


  addItem() {
  	console.log('Tapped')
    this.items.push({
      time: 5555
    });
    //console.dir(this.items);
  }

 //Where can we call this ??
  getItems(){
    var filter = {
    'custom_user_id': global.currUser.id
    };

    var backEndUserFriends = global.everlive.data('Friends');
    var self = this;

    backEndUserFriends.get(filter)
        .then(function (data) {
                self.items = data["result"];
                console.dir(self.items);
            },
            function (error) {
                console.dir(JSON.stringify(error));
            });
  }

}

// var FriendsModel = new observable.Observable();
// var friendsArray = new observableArrayModule.ObservableArray([]);

// var filter = {
//     'custom_user_id': global.currUser.id
// };

// var backEndUserFriends = global.everlive.data('Friends');

// backEndUserFriends.get(filter)
//     .then(function (data) {

// 			friendsArray.push({ time: 5});

// 			//FriendsModel.set("friendsList",data["result"]);
//             //FriendsModel.set("friendsArray",array);
//             console.dir(friendsArray);
//             // FriendsModel.set("friendsList",data["result"]);
//             // FriendsModel.set("friendsArray",data["result"]);
           
//             // console.log(data["result"][0].firstname);


//             // console.dir(data);
//         },
//         function (error) {
//             console.dir(JSON.stringify(error));
//         });
exports.FriendsModel = FriendsModel;
exports.friends = new FriendsModel();