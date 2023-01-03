var new_circle;
let map;


window.addEventListener("load", function() {
    init_map();
    const checkbox = document.getElementById('checkbox');
    checkbox.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        map.eachLayer(function (layer) {
            if (layer._url == 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png') {
                map.removeLayer(layer);
                L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
            }
            else if (layer._url == 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png') { 
                map.removeLayer(layer);
                L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);
            }
        });
    });
    get_bus_locations();
});


/**
 * Initialize LeafLet map 
 * @returns Return map object
 */
function init_map() {
    // Set view to Jyväskylä center
    map = L.map('map').setView([62.242603, 25.747257], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
}
//https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png

/**
 * Function handles fetching bus and rendering locations
 */
async function get_bus_locations() {
    let params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
    // Get the value of "city"
    var city = params.city;
    var coordinates = await city_coords(city);
    console.log(coordinates);
    map.panTo(new L.LatLng(coordinates[0], coordinates[1]));
    // Set interval to fetch bus location data every 3 seconds
    setInterval(function() {
    // Fetch bus location data from the server. pass city
    fetch('http://127.0.0.1:5000/bus_locations/' + city)
        // Return promise
        .then(function(response) {
            return (response.json());
        })
        // Render bus locations
        .then(function(data) {
            map.eachLayer(function (layer) {
                if (layer._url != "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" && layer._url != "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png") {
                    map.removeLayer(layer);
            }
            });
            // Iterate through data keys and render a circle on the map
            for (let y = 0; y<Object.keys(data).length; y++) {
                // Set the color of the circle depending on status of the bus
                var color = 'grey';
                if (data[y]['status'] == 0) {
                    color = 'orange';
                    data[y]['status'] = 'LÄHESTYY PYSÄKKIÄ';
                }
                if (data[y]['status'] == 1) {
                    color = 'red';
                    data[y]['status'] = 'PYSÄKILLÄ';
                }
                else if (data[y]['status'] == 2) {
                    color = 'green';
                    data[y]['status'] = "AJOSSA";
                }
                // Create circle object and add to map
                new_circle = L.circle([data[y]['latitude'], data[y]['longitude']], {
                    color: color,
                    radius: 6,
                    id: data[y]['id']
                }).addTo(map);
                var new_popup = L.popup({
                    closeOnClick: false,
                    autoClose: false
                  }).setContent("Linjanumero: " + data[y]['route_short_name'] + "<br>" +
                  "Linjan nimi: " + data[y]['route_long_name'] + "<br>" +
                  "Status: " + data[y]['status']);
                // Bind pop up to the circle
                new_circle.bindPopup(new_popup);
                new_circle.on('mouseover', function (e) {
                    this.openPopup();
                });
                new_circle.on('mouseout', function (e) {
                    this.closePopup();
                });
            }
        })
        .catch(error => console.log('Virhe', error));
    }, 3000);
}


async function city_coords(city) {
    return fetch("static/coords.json")
    .then(response => response.json())
    .then(function(data) {
        coord_list = [];
        for (let x = 0; x<Object.keys(data[0]).length; x++) {
            console.log(data[0][x]['city'], city);
            if (data[0][x]['city'] == city) {
                coord_list.push(data[0][x]['lat']);
                coord_list.push(data[0][x]['lon']);
            }
        }
        return coord_list;
    });
}