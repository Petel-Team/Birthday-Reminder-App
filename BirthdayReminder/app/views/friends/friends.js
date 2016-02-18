var frame = require('ui/frame');
var view = require("ui/core/view");
var vmModule = require("./friends_view_model");

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = vmModule.friends;

    //Trying some stuff with the refresh?
    page.bindingContext.getItems();
    var listview = page.getViewById("friendsList");
    listview.refresh();
}

exports.pageLoaded = pageLoaded;