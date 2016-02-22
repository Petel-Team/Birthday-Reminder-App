var frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var fs = require("file-system");
var enums = require("ui/enums");
var dialogs = require("ui/dialogs");
var gestures = require("ui/gestures");

function pageLoaded(args) {
    var page = args.object;

    var sv = view.getViewById(page, "sv-profile");

    sv.on(gestures.GestureTypes.swipe, function(args) {
        if (args.direction === 1) {
            console.log("Page Swipe Direction: " + args.direction);
            frame.topmost().navigate("./views/friends/friends");
        }
    });

    var username = view.getViewById(page, "username");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var email = view.getViewById(page, "email");
    var birthday = view.getViewById(page, "birthday");
    var viewFriendsButton = view.getViewById(page, "viewFriendsButton");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var goToMapsButton = view.getViewById(page, "goToMapsButton");
    var changeBirthDay = view.getViewById(page, "changeBirthDay");
    var userPicture = view.getViewById(page, "userpicture");

    username.text = global.currUser.username;
    firstName.text = global.currUser.firstname;
    lastName.text = global.currUser.lastname;
    email.text = global.currUser.email;
    birthday.text = global.currUser.birthday;


    if (global.currUser.image == "" || global.currUser.image == undefined) {
        global.currUser.image = "~/img/you.jpg";
    }

    userPicture.src = global.currUser.image;

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
                var path = fs.path.join(folder.path, global.currUser.Id + ".png");
                console.log(userPicture.imageSource.saveToFile(path, enums.ImageFormat.png));

                global.currUser.image = path;

                var updateUser = global.everlive.data('Custom_Users');
                updateUser.updateSingle({ Id: global.currUser.Id, 'image': path },
                    function(data) {
                        console.log(JSON.stringify(data));
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            });
        });
    });

    changeBirthDay.on("Tap", function() {
        changeBirthDay.animate({
            opacity: 0.7,
            scale: { x: 1.02, y: 1.02 },
            duration: 150
        }).then(function() {
            return changeBirthDay.animate({
                opacity: 1.0,
                scale: { x: 0.98, y: 0.98 },
                duration: 75
            });
        }).then(function() {

            dialogs.prompt({
                title: "Change Birthday",
                message: "Enter your birthday (1.1.1990)",
                okButtonText: "Change",
                cancelButtonText: "Cancel",
                inputType: dialogs.inputType.text
            }).then(function(r) {
                birthday.text = r.text;

                var updateUser = global.everlive.data('Custom_Users');
                updateUser.updateSingle({ Id: global.currUser.Id, 'birthday': r.text },
                    function(data) {
                        console.log(JSON.stringify(data));
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });

                console.log("Dialog result: " + r.result + ", text: " + r.text);
            });
        })
    });

    //LogOut Button to logout?
    //     var options = {
    //     title: "Log put",
    //     message: "Are you sure you want to log out?",
    //     okButtonText: "Yes",
    //     cancelButtonText: "No",
    //     neutralButtonText: "Cancel"
    // };
    // dialogs.confirm(options).then(function(result) {
    //     if (result === true) {

    //     } 

    //     // result can be true/false/undefined
    //     //console.log(result);
    // });
}
exports.pageLoaded = pageLoaded;
