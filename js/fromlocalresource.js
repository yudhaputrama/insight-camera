/* Implementation of AR-Experience (aka "World"). */
var World = {
    /* You may request new data from server periodically, however: in this sample data is only requested once. */
    isRequestingData: false,

    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* Different POI-Marker assets. */
    markerDrawableIdle: null,
    markerDrawableSelected: null,
    markerDrawableDirectionIndicator: null,

    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    markerList: [],

    /* the last selected marker. */
    currentMarker: null,

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker_idle.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
            onError: World.onError
        });
        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
            onError: World.onError
        });

        /* Loop through POI-information and create an AR.GeoObject (=Marker) per POI. */
        for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
            var singlePoi = {
                "id": poiData[currentPlaceNr].id,
                "latitude": parseFloat(poiData[currentPlaceNr].latitude),
                "longitude": parseFloat(poiData[currentPlaceNr].longitude),
                "altitude": parseFloat(poiData[currentPlaceNr].altitude),
                "title": poiData[currentPlaceNr].name,
                "description": poiData[currentPlaceNr].description
            };

            World.markerList.push(new Marker(singlePoi));
        }

        World.updateStatusMessage(currentPlaceNr + ' places loaded');
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

        var themeToUse = isWarning ? "e" : "c";
        var iconToUse = isWarning ? "alert" : "info";

        $("#status-message").html(message);
        $("#popupInfoButton").buttonMarkup({
            theme: themeToUse,
            icon: iconToUse
        });
    },

    setTarget(name, latitude, longitude) {
        var singlePoi = {
            "id": 1,
            "latitude": parseFloat(latitude),
            "longitude": parseFloat(longitude),
            "altitude": parseFloat(10),
            "title": name,
            "description": ""
        };

        let marker = new Marker(singlePoi)
        marker.setSelected(marker)
        World.currentMarker = marker
    },

    

    /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {

        /* Request data if not already present. */
        if (!World.initiallyLoadedData) {
            // World.requestDataFromLocal(lat, lon);
            /* Start loading marker assets. */
            World.markerDrawableIdle = new AR.ImageResource("assets/marker_idle.png", {
                onError: World.onError
            });
            World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
                onError: World.onError
            });
            World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
                onError: World.onError
            });
            
            World.initiallyLoadedData = true;
            
        }
        
    },

    /* Fired when user pressed maker in cam. */
    onMarkerSelected: function onMarkerSelectedFn(marker) {

        /* Deselect previous marker. */
        if (World.currentMarker) {
            if (World.currentMarker.poiData.id === marker.poiData.id) {
                return;
            }
            World.currentMarker.setDeselected(World.currentMarker);
        }

        /* Highlight current one. */
        marker.setSelected(marker);
        World.currentMarker = marker;
    },

    /* Screen was clicked but no geo-object was hit. */
    onScreenClick: function onScreenClickFn() {
        if (World.currentMarker) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
    },

    /*
        In case the data of your ARchitect World is static the content should be stored within the application.
        Create a JavaScript file (e.g. myJsonData.js) where a globally accessible variable is defined.
        Include the JavaScript in the ARchitect Worlds HTML by adding <script src="js/myJsonData.js"/> to make POI
        information available anywhere in your JavaScript.
    */

    /* Request POI data. */
    requestDataFromLocal: function requestDataFromLocalFn(lat, lon) {

        // var poisNearby = Helper.bringPlacesToUser(myJsonData, lat, lon);
        // World.loadPoisFromJsonData(poisNearby);
        World.loadPoisFromJsonData(myJsonData);
    },

    onError: function onErrorFn(error) {
        alert(error)
    },
    log: function(message) {
        console.log(`World : ${message}`)
    }
};

var Helper = {

    
    bringPlacesToUser: function bringPlacesToUserFn(poiData, latitude, longitude) {
        for (var i = 0; i < poiData.length; i++) {
            poiData[i].latitude = latitude + (Math.random() / 5 - 0.1);
            poiData[i].longitude = longitude + (Math.random() / 5 - 0.1);
            /*
                Note: setting altitude to '0' will cause places being shown below / above user, depending on the
                user 's GPS signal altitude. Using this contant will ignore any altitude information and always
                show the places on user-level altitude.
            */
            poiData[i].altitude = AR.CONST.UNKNOWN_ALTITUDE;
        }
        return poiData;
    }
};

console.log(AR)

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;