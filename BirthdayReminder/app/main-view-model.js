var observable = require("data/observable");
var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel() {
        _super.call(this);
        this.counter = 42;
        this.set("message", this.counter + " taps left");
        this.set("ms",'Data taken!');
        var places = global.everlive.data('Custom_Users');

        places.get(null, function(data) {
            console.log(JSON.stringify(data));
             this.set("ms",'In function!');
        }, function(err) {
            console.log(err.message);
        });
    }

    HelloWorldModel.prototype.tapAction = function () {
        var places = global.everlive.data('Custom_Users');

        places.get(null, function(data) {
            console.log(JSON.stringify(data));
             this.set("ms",JSON.stringify(data));
        }, function(err) {
            console.log(err.message);
        });

        this.counter--;
        if (this.counter <= 0) {
            this.set("message", "Hoorraaay! You unlocked the NativeScript clicker achievement!");
        }
        else {
            this.set("message", this.counter + " taps left");
        }
    };
    return HelloWorldModel;
})(observable.Observable);
exports.HelloWorldModel = HelloWorldModel;
exports.mainViewModel = new HelloWorldModel();
