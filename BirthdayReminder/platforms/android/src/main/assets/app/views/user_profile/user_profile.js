var  frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var fs = require("file-system");
var enums = require("ui/enums");
var dialogs = require("ui/dialogs");
var gestures = require("ui/gestures");

function pageLoaded(args) {
    var page = args.object;

    var sv = view.getViewById(page, "sv-profile");

    sv.on(gestures.GestureTypes.swipe, function (args) {
        if(args.direction === 1){
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
    userPicture.src = global.currUser.image;


    // viewFriendsButton.on("Tap",function(){
    //     frame.topmost().navigate("./views/friends/friends");
    // });

    takePictureButton.on("Tap", function(){
        cameraModule.takePicture().then(function(picture) {
            userPicture.imageSource = picture;
            var folder = fs.knownFolders.documents();
            var path = fs.path.join(folder.path, global.currUser.Id + ".png");
            console.log(userPicture.imageSource.saveToFile(path,enums.ImageFormat.png));

            global.currUser.image = path;

            var updateUser = global.everlive.data('Custom_Users');
            updateUser.updateSingle({ Id: global.currUser.Id, 'image': path},
                function(data){
                    console.log(JSON.stringify(data));
                },
                function(error){
                    console.log(JSON.stringify(error));
                });
        });
    });

    changeBirthDay.on("Tap",function(){
        dialogs.prompt({
            title: "Change Birthday",
            message: "Enter your birthday (1.1.1990)",
            okButtonText: "Change",
            cancelButtonText: "Cancel",
            inputType: dialogs.inputType.text
        }).then(function (r) {
            birthday.text = r.text;

            var updateUser = global.everlive.data('Custom_Users');
            updateUser.updateSingle({ Id: global.currUser.Id, 'birthday': r.text},
                function(data){
                    console.log(JSON.stringify(data));
                },
                function(error){
                    console.log(JSON.stringify(error));
                });

            console.log("Dialog result: " + r.result + ", text: " + r.text);
        });
    });

    goToMapsButton.on("Tap", function(){
        frame.topmost().navigate("./views/google_maps/google_maps");
    });
}
exports.pageLoaded = pageLoaded;
