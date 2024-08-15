function init() {
    let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

    d3.json(url).then(function(data) {
        createMap(data);
    });
}

function markerSize(mag) {
    let radius = 1;


    if (mag > 0) {
        radius = mag ** 7;
    }

    return radius;
}

  // function to create color
function chooseColor(depth) {
    let color = "black";

    // Switch on depth
    if (depth <= 10) {
        color = "#98EE00";
    } else if (depth <= 30) {
        color = "#D4EE00";
    } else if (depth <= 50) {
        color = "#EECC00";
    } else if (depth <= 70) {
        color = "#EE9C00";
    } else if (depth <= 90) {
        color = "#EA822C";
    } else {
        color = "#EA2C2C";
    }

    // return color
    return (color);
}


function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let markers = L.markerClusterGroup();
    let heatArray = [];
    let circleArray = [];

    // Loop through earthquake array
    for (let i = 0; i < earthquakes.features.length; i++) {
        let row = earthquakes.features[i];
        let location = row.geometry;

        if (location) {
            // Extract location
            let point = [location.coordinates[1], location.coordinates[0]];

            // make marker
            let marker = L.marker(point);
            let popup = `<h1>${row.properties.title}</h1>`;
            marker.bindPopup(popup);
            markers.addLayer(marker);

            // add to heatmap
            heatArray.push(point);

            // Create circle
            // define marker (in this case a circle)
            let circleMarker = L.circle(point, {
                fillOpacity: 0.75,
                color: chooseColor(location.coordinates[2]),
                fillColor: chooseColor(location.coordinates[2]),
                radius: markerSize(row.properties.mag)
            }).bindPopup(popup);

            circleArray.push(circleMarker);
        }
    }

    // create Heat layer
    let heatLayer = L.heatLayer(heatArray, {
        radius: 25,
        blur: 20
    });

    // create circle layer
    let circleLayer = L.layerGroup(circleArray);

    // create base layers object
    let baseLayers = {
        "Street Map": street,
        "Topographic Map": topo
    };

    // create overlay object
    let overlayLayers = {
        Markers: markers,
        Heatmap: heatLayer,
        Circles: circleLayer
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 5,
    layers: [street, markers]
    });

    // Create a layer control.
    // Pass it our base and overlay layers.
    // Add the layer control to the map.
    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    // Add legend
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");

        let legendInfo = "<h4>Legend</h4>"
        legendInfo += "<i style='background: #98EE00'></i>-10-10<br/>";
        legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
        legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
        legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
        legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
        legendInfo += "<i style='background: #EA2C2C'></i>90+";

        div.innerHTML = legendInfo;
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}

init();