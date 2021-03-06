var  frame = require('ui/frame');
var view = require("ui/core/view");
var cameraModule = require("camera");
var imageSource = require("image-source");
var fs = require("file-system");
var enums = require("ui/enums");
function pageLoaded(args) {
    var page = args.object;
    var firstName = view.getViewById(page, "firstname");
    var lastName = view.getViewById(page, "lastname");
    var ideas = view.getViewById(page, "ideas");
    var birthday = view.getViewById(page, "birthday");
    var takePictureButton = view.getViewById(page, "takePictureButton");
    var userPicture = view.getViewById(page, "userpicture");
    var deleteFriendButton = view.getViewById(page, "deleteFriendButton");

    firstName.text= global.selectedFriend.firstname;
    lastName.text = global.selectedFriend.lastname;
    birthday.text = global.selectedFriend.birthday;
    ideas.text = global.selectedFriend.ideas;
    userPicture.src=global.selectedFriend.image;
    console.dir(global.selectedFriend);

    takePictureButton.on("Tap", function(){
        cameraModule.takePicture().then(function(picture) {


            userPicture.imageSource = picture;
            var folder = fs.knownFolders.documents();
            var path = fs.path.join(folder.path, global.selectedFriend.firstname + global.selectedFriend.lastname + global.selectedFriend.birthday + ".png");
            console.log(userPicture.imageSource.saveToFile(path,enums.ImageFormat.png));
            global.currUser.image = path;
            var updateUser = global.everlive.data('Friends');
            updateUser.updateSingle({ Id: global.selectedFriend.Id, 'image': path},
                function(data){
                    console.log(JSON.stringify(data));
                },
                function(error){
                    console.log(JSON.stringify(error));
                });
        });
    });


    deleteFriendButton.on("Tap", function(){
        var deleteFriend = global.everlive.data('Friends');

        deleteFriend.destroySingle({ Id: global.selectedFriend.Id },
            function(data){
                // var title = 'Friends';
                // var msg = 'You just deleted ' + selectedFriend.firstname + ' :(';                
                // dialogs.alert({
                //       title: title,
                //       message: msg                      
                // })

                console.log('Item successfully deleted.');
                frame.topmost().navigate("./views/friends/friends");
            },
            function(error){               
                console.log(JSON.stringify(error));
            });
    });

}
exports.pageLoaded = pageLoaded;