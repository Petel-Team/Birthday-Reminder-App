var vmModule = require("./main-view-model");
var Everlive = require("./libs/everlive.all.min");
var Parse = require("./libs/parse/node");
/*Parse.initialize("vd9nYPK90MRx761UU8TMgWv2Sz8TS5qU4klSG753", "y7fjE3y4jmebCKhLqsh12Ep7yGSprmxmdjyM1pRF");

var TestObject = Parse.Object.extend("TestObject");
var testObject = new TestObject();
testObject.save({foo: "bar"}).then(function(object) {
  alert("it worked");
});
*/
function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = vmModule.mainViewModel;
}
exports.pageLoaded = pageLoaded;
