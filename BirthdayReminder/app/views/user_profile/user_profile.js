var  frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageSource = require("image-source");
var fs = require("file-system");
var enums = require("ui/enums");
function pageLoaded(args) {
    var page = args.object;

    var username = view.getViewById(page, "username");
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var email = view.getViewById(page, "email");
    var birthday = view.getViewById(page, "birthday");
    var viewFriendsButton = view.getViewById(page, "viewFriendsButton");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var userPicture = view.getViewById(page, "userpicture");

    username.text = global.currUser.username;
    firstName.text = global.currUser.firstname;
    lastName.text = global.currUser.lastname;
    email.text = global.currUser.email;
    birthday.text = global.currUser.birthday;
    userPicture.src = global.currUser.image;

    viewFriendsButton.on("Tap",function(){
        frame.topmost().navigate("./views/friends/friends");
    });

    takePictureButton.on("Tap", function(){
        cameraModule.takePicture().then(function(picture) {
            userPicture.imageSource = picture;
            var folder = fs.knownFolders.documents();
            var path = fs.path.join(folder.path, global.currUser.name + global.currUser.email + global.currUser.birthday + ".png");
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
}
exports.pageLoaded = pageLoaded;
