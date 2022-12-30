var new_circle;
let map;


window.addEventListener("load", function() {
    init_map();
    get_bus_locations(map);
});


/**
 * Initialize LeafLet map 
 * @returns Return map object
 */
function init_map() {
    // Set view to Jyväskylä center
    map = L.map('map').setView([62.242603, 25.747257], 13);
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
}


/**
 * Function handles fetching bus and rendering locations
 */
function get_bus_locations() {
    // Set interval to fetch bus location data every 3 seconds
    setInterval(function() {
    // Fetch bus location data from the server
    fetch('http://127.0.0.1:5000/bus_locations')
        // Return promise
        .then(function(response) {
            return (response.json());
        })
        // Render bus locations
        .then(function(data) {
            map.eachLayer(function (layer) {
                if (layer._url != "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png") {
                    console.log(layer);
                    map.removeLayer(layer);
            }
            });
            // Create tileLayer for the map
            L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            // Iterate through data keys and render a circle on the map
            for (let y = 0; y<Object.keys(data).length; y++) {
                // Set the color of the circle depending on status of the bus
                var color = 'grey';
                if (data[y]['status'] == 0) {
                    color = 'yellow';
                }
                if (data[y]['status'] == 1) {
                    color = 'red';
                }
                else if (data[y]['status'] == 2) {
                    color = 'green';
                }
                // Create circle object and add to map
                new_circle = L.circle([data[y]['latitude'], data[y]['longitude']], {
                    color: color,
                    radius: 6,
                    id: data[y]['id']
                }).addTo(map);
                new_circle.bindPopup("LINJA: " + data[y]['label']);
            }
        })
        .catch(error => console.log('Virhe', error));
    }, 3000);
}