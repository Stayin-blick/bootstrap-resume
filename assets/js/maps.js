
let map;

async function initMap() {
    const position = {
        lat: 46.619261,
        lng: -33.134766
    };
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 3,
        center: position,
        mapId: "map",
    });
    const markerViewWithText = new AdvancedMarkerElement({
        map,
        position: {
            lat: 40.785091,
            lng: -73.968285
        },
        title: "Title text for the marker at lat: 37.419, lng: -122.03",
    });
    // Adjust the scale.
    const pinScaled = new PinElement({
        scale: 1.5,
    });
    const markerViewScaled = new AdvancedMarkerElement({
        map,
        position: {
            lat: 41.084045,
            lng: -73.874245
        },
        content: pinScaled.element,
    });
    // Change the background color.
    const pinBackground = new PinElement({
        background: "#FBBC04",
    });
    const markerViewBackground = new AdvancedMarkerElement({
        map,
        position: {
            lat: 40.754932,
            lng: -73.984016
        },
        content: pinBackground.element,
    });
}

initMap();