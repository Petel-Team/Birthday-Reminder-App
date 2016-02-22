var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var enums = require("ui/enums");
var dialogs = require("ui/dialogs");

function pageLoaded(args) {
    var page = args.object;
    var self = this;

    var addFriendButton = view.getViewById(page, "addFriendButton");
    var label = view.getViewById(page, "label");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var ideas = view.getViewById(page, "ideas");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var datepicker = view.getViewById(page, "birthday");
    var userPicture = view.getViewById(page, "picture");
    datepicker.month = 1;
    datepicker.day = 1;
    datepicker.year = 1980;

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
            var firstNameValue = firstName.text.trim();
            var lastNameValue = lastName.text.trim();
            var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;

            if (firstNameValue.length >= 2 && lastNameValue.length >= 2) {
                cameraModule.takePicture().then(function(picture) {
                    userPicture.imageSource = picture;
                    var folder = fs.knownFolders.documents();
                    var path = fs.path.join(folder.path, firstNameValue + lastNameValue + birthday + ".png");
                    console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));
                    self.imagePath = path;
                });
            } else {
                var title = 'Add birthday';
                var msg = 'You must fill all other fields before taking a picture!';
                var okBtnTxt = "Try again";
                dialogs.alert({
                    title: title,
                    message: msg,
                    okButtonText: okBtnTxt
                })
            }
        })
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
        })

        var ideasValue = ideas.text.trim();
        var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;
        var firstNameValue = firstName.text.trim();
        var lastNameValue = lastName.text.trim();
        var userPictureFile = userPicture.imageSource;

        if (firstNameValue.length < 2 || firstNameValue.length > 10) {
            var title = 'Add birthday';
            var msg = 'First name must be between 2 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (lastNameValue.length < 2 || lastNameValue.length > 10) {
            var title = 'Add birthday';
            var msg = 'Last name must be between 2 and 10 characters!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else if (ideasValue.length == 0) {
            var title = 'Add birthday';
            var msg = 'No ideas? Come on!';
            var okBtnTxt = "Try again";
            dialogs.alert({
                title: title,
                message: msg,
                okButtonText: okBtnTxt
            })
        } else {
            var filter = {
                'firstname': firstNameValue,
                'lastname': lastNameValue
            };

            var newBackendFriend = global.everlive.data('Friends');
            global.selectedFriend = {
                'firstname': firstNameValue,
                'lastname': lastNameValue,
                'ideas': ideasValue,
                'birthday': birthday,
                'image': self.imagePath,
                'custom_user_id': global.currUser.Id
            };

            newBackendFriend.get(filter)
                .then(function(data) {
                        if (data["count"] == "0") {
                            console.log("SUCCESS");
                            newBackendFriend.create(global.selectedFriend,
                                function(data) {
                                    // console.log(data);

                                    var title = 'Add birthday';
                                    var msg = 'You successfully added a new birthday!';
                                    dialogs.alert({
                                        title: title,
                                        message: msg
                                    })

                                    global.selectedFriend.Id = data['result']['Id'];
                                    frame.topmost().navigate("./views/friends/friends");
                                },
                                function(error) {
                                    console.log("ERROR ADD USER TO BACKEND", JSON.stringify(error));
                                });
                        } else {
                            console.log("EXISTS");
                            //label.text = "Friend exists exists!"

                            var title = 'Add birthday';
                            var msg = 'This name and birthday already exist!';
                            dialogs.alert({
                                title: title,
                                message: msg
                            })
                        }
                    },
                    function(err) {
                        console.log("ERROR CONNECTING TO BACKEND", JSON.stringify(err));
                    });
        }
    });
}
exports.pageLoaded = pageLoaded;
