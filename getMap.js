// Define custom icons for start and end points
var startIcon = L.icon({
  iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-green.png", // Green leaf icon
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
});

var endIcon = L.icon({
  iconUrl: "https://leafletjs.com/examples/custom-icons/leaf-red.png", // Red leaf icon
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
});
// Initialize current markers to null
var currentStartMarker = null;
var currentEndMarker = null;
var currentRoutingControl = null;

// Initialize startMarker and endMarker to null
var startMarker = null;
var endMarker = null;

// Initialize the map
var map = L.map("map", {
  zoomSnap: 2,
}).setView([55.70466, 13.191007], 13);

// Add zoom control
L.control
  .zoom({
    position: "topright",
  })
  .addTo(map);

// Add scale control
L.control
  .scale({
    position: "bottomright",
    imperial: false,
  })
  .addTo(map);

// Add the click event listener
map.on("click", function (e) {
  // e.latlng contains the coordinates of the clicked point
  var startPoint = e.latlng;

  // Find the closest pump to the clicked point
  var closestPump = findClosestPump(startPoint, pumpLayer);

  if (closestPump) {
    var endPoint = closestPump.latlng;

    // Create new markers and add them to the map
    currentStartMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
    currentEndMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
    // Log information for debugging
    console.log("Clicked point:", startPoint);
    console.log("Closest pump:", closestPump);

    // Remove current markers and routing control from the map
    if (currentStartMarker) {
      map.removeLayer(currentStartMarker);
      console.log("Removing currentStartMarker");
    }
    if (currentEndMarker) {
      console.log("Removing currentEndMarker");
      map.removeLayer(currentEndMarker);
    }
    if (currentRoutingControl) {
      console.log("Removing currentRoutingControl");
      map.removeControl(currentRoutingControl);
    }

    // Log information for debugging
    console.log("Adding new markers:");
    console.log("Start Marker:", [startPoint.lat, startPoint.lng]);
    console.log("End Marker:", [endPoint.lat, endPoint.lng]);

    // Log information for debugging
    console.log("Calculating and displaying route");

    // Calculate and display the route
    resetRoute(startPoint, endPoint);
  }
});

// Function to load base layer
function loadBaseLayer() {
  var baseLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });

  baseLayer.addTo(map);

  return baseLayer;
}

// Function to load road layer
function loadRoadLayer() {
  var roadLayer = new L.GeoJSON.AJAX(
    "http://geoserver.gis.lu.se/geoserver/KenLund/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=KenLund:bike_path&outputFormat=application%2Fjson",
    {
      attribution: "Road Layer Attribution",
    }
  );

  roadLayer.addTo(map);

  return roadLayer;
}

// Function to load pump layer
function loadPumpLayer() {
  var pumpLayer = new L.GeoJSON.AJAX(
    "pumps.geojson",
    {
      attribution: "Pump Layer Attribution",
      onEachFeature: function (feature, layer) {
        var popupContent = "<h3>Bike Pump Information</h3>";
        for (var key in feature.properties) {
          popupContent += "<strong>" + key + ":</strong> " + feature.properties[key] + "<br>";
        }
        layer.bindPopup(popupContent);
      },
    }
  );

  pumpLayer.addTo(map);

  return pumpLayer;
}

// Call the function to load the base layer
var baseLayer = loadBaseLayer();

// Call the function to load the road layer
var roadLayer = loadRoadLayer();

// Call the function to load the pump layer
var pumpLayer = loadPumpLayer();

// Function to find the closest pump
function findClosestPump(clickedPoint, pumpLayer) {
  var closestPump = null;
  var minDistance = Infinity;

  pumpLayer.eachLayer(function (layer) {
    var pumpLatLng = layer.getLatLng();
    var distance = clickedPoint.distanceTo(pumpLatLng);

    if (distance < minDistance) {
      minDistance = distance;
      closestPump = {
        latlng: pumpLatLng,
        feature: layer.feature,
      };
    }
  });

  return closestPump;
}

// Keep a reference to the routing control outside of the function
var routingControl = null;

document.getElementById("locate").addEventListener("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
      var pumpLayer = loadPumpLayer();
      var closestPump = findClosestPump(userLocation, pumpLayer);
      // Calculate the path to the closest pump here
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
/*// Function to calculate and display the route with custom icons
function calculateAndDisplayRoute(startPoint, endPoint) {
    // If a routing control already exists, remove it from the map
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // Define custom icons for start and end points
    var startIcon = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',  // Green leaf icon
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });

    var endIcon = L.icon({
        iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',  // Red leaf icon
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });

    // Create a new routing control with custom icons
    routingControl = L.Routing.control({
        waypoints: [
            L.Routing.waypoint(startPoint.lat, startPoint.lng, '<b>Start</b>', { icon: startIcon }),
            L.Routing.waypoint(endPoint.lat, endPoint.lng, '<b>End</b>', { icon: endIcon })
        ],
    }).addTo(map);
}

// Call the function to load the base layer
var baseLayer = loadBaseLayer();

// Call the function to load the road layer
var roadLayer = loadRoadLayer();

// Call the function to load the pump layer
var pumpLayer = loadPumpLayer();

// Event handler for a click on the road layer
roadLayer.on('click', function (e) {
    console.log('roadLayer clicked');
    var roadClickedPoint = e.latlng;
    var closestPump = findClosestPump(roadClickedPoint, pumpLayer);
    console.log(closestPump);
    calculateAndDisplayRoute(roadClickedPoint, closestPump.latlng);
});
*/
// Declare routePolyline globally
var routePolyline = null;

// Function to calculate and display the route with custom markers
function resetRoute(startPoint, endPoint) {
  // If a routing control already exists, remove it from the map
  if (routingControl) {
    map.removeControl(routingControl);
  }
  // Clear existing markers from the map
  if (startMarker) {
    map.removeLayer(startMarker);
  }
  if (endMarker) {
    map.removeLayer(endMarker);
  }
  if (routePolyline) {
    map.removeLayer(routePolyline);
  }

  // Create markers with custom colors for start and end points
  startMarker = L.marker([startPoint.lat, startPoint.lng], { icon: startIcon }).addTo(map);
  endMarker = L.marker([endPoint.lat, endPoint.lng], { icon: endIcon }).addTo(map);
  var instructions;
  // Define the OpenRouteService API URL
  var orsAPI =
    "https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=5b3ce3597851110001cf624833a08186c127419f986c3d1af4433daf&start=" +
    startPoint.lng +
    "," +
    startPoint.lat +
    "&end=" +
    endPoint.lng +
    "," +
    endPoint.lat;

  // Make a GET request to the OpenRouteService API
  fetch(orsAPI)
    .then((response) => response.json())
    .then((data) => {
      // The coordinates of the route are in the 'geometry' property of the first feature
      var routeCoordinates = data.features[0].geometry.coordinates;

      // The coordinates are in [longitude, latitude] format, but Leaflet expects [latitude, longitude] format, so we need to reverse them
      routeCoordinates = routeCoordinates.map((coordinate) => coordinate.reverse());
      // Remove the previous route from the map
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }
      // Create a polyline for the route and add it to the map
      routePolyline = L.polyline(routeCoordinates, { color: "blue" }).addTo(map);

      // Extract route instructions from the response
      var instructions = data.features[0].properties.segments[0].steps.map((step) => {
        return {
          instruction: step.instruction,
          maneuver: step.maneuver,
          distance: step.distance,
          duration: step.duration,
          type: step.type,
          streetName: step.name,
        };
      });

      // Log or display the route instructions
      console.log("Route Instructions:", instructions);

      // Calculate the middle point of the routePolyline
      var middlePoint = routePolyline.getCenter();

      // Create a popup with the route instructions and attach it to the middlePoint
      var popupContent = "<h2>Route instructions from user click to nearest bike pump</h2><ul>";
      instructions.forEach((step) => {
        popupContent += "<li>" + step.instruction + "</li>";
      });
      popupContent += "</ul>";

      popupContent +=
        "<p><strong>Start:</strong> " +
        startPoint.lat.toFixed(6) +
        ", " +
        startPoint.lng.toFixed(6) +
        "</p>";
      popupContent +=
        "<p><strong>End:</strong> " +
        endPoint.lat.toFixed(6) +
        ", " +
        endPoint.lng.toFixed(6) +
        "</p>";

      var popup = L.popup().setLatLng(middlePoint).setContent(popupContent).openOn(map);

      // Add the route polyline to the routing control
      routingControl = L.Routing.control({
        lineOptions: {
          styles: [{ color: "blue", opacity: 1, weight: 5 }],
        },
        createMarker: function (i, waypoint, n) {
          // Use custom markers for the start and end points
          return i === 0 ? startMarker : endMarker;
        },
        addWaypoints: false,
        serviceUrl: "https://api.openrouteservice.org/directions", // Set OpenRouteService as the service URL
        routeWhileDragging: true,
        language: "en", // Specify the language for route instructions
        instructions: instructions,
      }).addTo(map);
    })
    .catch((error) => console.error("Error:", error));
}

// Get references to map container and reveal slider
var mapContainer = document.getElementById("mapContainer");
var revealSlider = document.getElementById("revealSlider");

// Add event listener to reveal slider
revealSlider.addEventListener("input", function () {
  var revealPercentage = 100 - revealSlider.value + "%"; // Calculate percentage of map to reveal
  mapContainer.style.clipPath = "inset(0% " + revealPercentage + " 0% 0%)"; // Apply clip path to reveal map layer
});
