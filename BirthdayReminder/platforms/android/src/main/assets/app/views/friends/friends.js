var frame = require('ui/frame');
var view = require("ui/core/view");
var vmModule = require("./friends_view_model");

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = vmModule.friends;
}

exports.pageLoaded = pageLoaded;