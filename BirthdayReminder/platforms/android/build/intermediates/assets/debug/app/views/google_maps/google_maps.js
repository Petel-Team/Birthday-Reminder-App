var mapsModule = require("nativescript-google-maps-sdk");
var geolocation = require("nativescript-geolocation");

// function enableLocationTap(args) {
//     if (!geolocation.isEnabled()) {
//         console.log(geolocation.isEnabled());
//         geolocation.enableLocationRequest();
//     }
// }
// exports.enableLocationTap = enableLocationTap;

// function buttonGetLocationTap(args) {
//     if (!geolocation.isEnabled()) {
//         console.log(geolocation.isEnabled());
//         geolocation.enableLocationRequest();
//     }
//     var location = geolocation.getCurrentLocation({desiredAccuracy: 3, updateDistance: 10, maximumAge: 20000, timeout: 20000}).
//     then(function(loc) {
//         if (loc) {
//             model.locations.push(loc);
//         }
//     }, function(e){
//         console.log("Error: " + e.message);
//     });
// }
// exports.buttonGetLocationTap = buttonGetLocationTap;


function OnMapReady(args) {
    var mapView = args.object;
    var latitude = -33.86;
    var longitude = 151.20;
    var zoom = 5;
    

    console.log("Setting a marker...");
    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.86, 151.20);
    marker.title = "Sydney";
    marker.snippet = "Australia";
    marker.userData = { index : 1};
    mapView.addMarker(marker);
}

function onMarkerSelect(args) {
    console.log("Clicked on " +args.marker.title);
}
 
function onCameraChanged(args) {
    console.log("Camera changed: " + JSON.stringify(args.camera));

}

exports.onMapReady = OnMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;