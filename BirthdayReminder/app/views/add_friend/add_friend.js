var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageModule = require("ui/image");
var fs = require("file-system");
var enums = require("ui/enums");
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
    datepicker.year = 1950;

    takePictureButton.on("Tap", function () {
        var firstNameValue = firstName.text.trim();
        var lastNameValue = lastName.text.trim();
        var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;

        if (firstNameValue.length >= 5 && lastNameValue.length <= 10) {
            cameraModule.takePicture().then(function (picture) {
                userPicture.imageSource = picture;
                var folder = fs.knownFolders.documents();
                var path = fs.path.join(folder.path, firstNameValue + lastNameValue + birthday + ".png");
                console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));
                self.imagePath = path;
            });
        }
        else {
            label.text = "Fill in all fields before take picture!";
        }
    });

    addFriendButton.on("Tap", function () {
        var ideasValue = ideas.text.trim();
        var birthday = datepicker.month + "." + datepicker.day + "." + datepicker.year;
        var firstNameValue = firstName.text.trim();
        var lastNameValue = lastName.text.trim();
        //var userPictureFile = userPicture.imageSource;

        if (firstNameValue.length < 5 || firstNameValue.length > 10) {
            label.text = "First Name must be between 5 and 10 characters!";
        }
        else if (lastNameValue.length < 5 || lastNameValue.length > 10) {
            label.text = "Last Name must be between 5 and 10 characters!";
        }
        else if (ideasValue.length == 0) {
            label.text = "Ideas cannot be empty!";
        }
        else {
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
                .then(function (data) {
                        if (data["count"] == "0") {
                            console.log("SUCCESS");

                            newBackendFriend.create(global.selectedFriend,
                                function (data) {
                                    global.selectedFriend.Id = data['result']['Id'];
                                    frame.topmost().navigate("./views/friends/friends");
                                },
                                function (error) {
                                    console.log("ERROR ADD USER TO BACKEND", JSON.stringify(error));
                                });
                        }
                        else {
                            console.log("EXISTS");
                            label.text = "Friend exists exists!"
                        }
                    },
                    function (err) {
                        console.log("ERROR CONNECTING TO BACKEND", JSON.stringify(err));
                    });
        }
    });
}
exports.pageLoaded = pageLoaded;