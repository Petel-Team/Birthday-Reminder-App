var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageSource = require("image-source");
var fs = require("file-system");
var enums = require("ui/enums");
var platformModule = require("platform");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");

function pageLoaded(args) {
    var page = args.object;
    var self = this;
    this.isImageBig = false;
    var container = view.getViewById(page, "container");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var ideas = view.getViewById(page, "ideas");
    var birthday = view.getViewById(page, "birthday");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var userPicture = view.getViewById(page, "userpicture");
    var deleteFriendButton = view.getViewById(page, "deleteFriendButton");
    var gridContainer = view.getViewById(page, "gridContainer");

    firstName.text = global.selectedFriend.firstname;
    lastName.text = global.selectedFriend.lastname;
    birthday.text = global.selectedFriend.birthday;
    ideas.text = global.selectedFriend.ideas;
    userPicture.src = global.selectedFriend.image;

    container.height = platformModule.screen.mainScreen.heightPixels;

    takePictureButton.on("Tap", function() {
        takePictureButton.animate({
            opacity: 0.7,
            scale: { x: 1.02, y: 1.02 },
            duration: 300
        }).then(function() {
            return takePictureButton.animate({
                opacity: 1.0,
                scale: { x: 0.98, y: 0.98 },
                duration: 150
            });
        }).then(function() {
            cameraModule.takePicture().then(function(picture) {
                userPicture.imageSource = picture;
                var folder = fs.knownFolders.documents();
                var path = fs.path.join(folder.path, global.selectedFriend.firstname + global.selectedFriend.lastname + global.selectedFriend.birthday + ".png");
                console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));
                global.currUser.image = path;
                var updateUser = global.everlive.data('Friends');
                updateUser.updateSingle({ Id: global.selectedFriend.Id, 'image': path },
                    function(data) {
                        console.log(JSON.stringify(data));
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            });
        })
    });


    deleteFriendButton.on("Tap", function() {

        deleteFriendButton.animate({
            opacity: 0.7,
            scale: { x: 1.02, y: 1.02 },
            duration: 150
        }).then(function() {
            return deleteFriendButton.animate({
                opacity: 1.0,
                scale: { x: 0.98, y: 0.98 },
                duration: 75
            });
        }).then(function() {

            var deleteFriend = global.everlive.data('Friends');

            var options = {
                title: "Birthdays",
                message: "Are you sure you want delete " + selectedFriend.firstname + " birthday?",
                okButtonText: "Yes",
                cancelButtonText: "No",
                neutralButtonText: "Cancel"
            };
            dialogs.confirm(options).then(function(result) {
                if (result === true) {
                    deleteFriend.destroySingle({ Id: global.selectedFriend.Id },
                        function(data) {
                            var title = 'Birthdays';
                            var msg = 'You just deleted ' + selectedFriend.firstname + ' birthday!';
                            dialogs.alert({
                                title: title,
                                message: msg
                            });

                            console.log('Item successfully deleted.');
                            frame.topmost().navigate("./views/friends/friends");
                        },
                        function(error) {
                            console.log(JSON.stringify(error));
                        });
                }

            });
        })
    });

    userPicture.on(gestures.GestureTypes.doubleTap, function() {
        console.log("AAAAAAAAAAAAAAAAAAAAAAA");
        if (!self.isImageBig) {
            gridContainer.visibility = enums.Visibility.collapse;
            deleteFriendButton.visibility = enums.Visibility.collapse;
            takePictureButton.visibility = enums.Visibility.collapse;
            var scale = platformModule.screen.mainScreen.widthPixels / userPicture.getMeasuredWidth();
            var moveY = (platformModule.screen.mainScreen.widthPixels / 2) - (userPicture.getMeasuredHeight() / 2);
            self.isImageBig = true;
            userPicture.animate({
                translate: { x: 0, y: moveY },
                duration: 1000
            }).then(function() {
                userPicture.animate({
                    scale: { x: scale, y: scale },
                    duration: 1500
                });
            });
        } else {
            self.isImageBig = false;
            userPicture.animate({
                scale: { x: 1, y: 1 },
                duration: 1500
            }).then(function() {
                userPicture.animate({
                    translate: { x: 0, y: 0 },
                    duration: 1000
                });
            }).then(function() {
                gridContainer.visibility = enums.Visibility.visible;
                deleteFriendButton.visibility = enums.Visibility.visible;
                takePictureButton.visibility = enums.Visibility.visible;
            });
        }
    });

}
exports.pageLoaded = pageLoaded;
