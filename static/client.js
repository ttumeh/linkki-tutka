var new_circle;
let map;


window.addEventListener("load", function() {
    init_map();
    set_theme();
    get_bus_locations();
});


/**
 * Function to handle changing theme from light to dark mode
 */
function set_theme() {
    const checkbox = document.getElementById('checkbox');
    checkbox.addEventListener('change', () => {
        document.body.classList.toggle('dark');
        map.eachLayer(function (layer) {
            if (layer.id == 'map-light') {
                map.removeLayer(layer);
                let tileLayer_dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });
                tileLayer_dark.id = "map-dark";
                tileLayer_dark.addTo(map);
                localStorage.setItem("theme", "dark");
            }
            else if (layer.id == 'map-dark') { 
                map.removeLayer(layer);
                let tileLayer_light = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });
                tileLayer_light.id = "map-light";
                tileLayer_light.addTo(map);
                localStorage.setItem("theme", "light");
            }
        });
    });
}


/**
 * Initialize LeafLet map 
 * @returns Return map object
 */
function init_map() {
    // Set view to Jyväskylä center
    map = L.map('map').setView([62.242603, 25.747257], 13);
    if (localStorage.getItem("theme") == 'light') {
        let tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        tileLayer.id="map-light";
        tileLayer.addTo(map);
    }
    else {
        document.body.classList.toggle('dark');
        let tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });
        tileLayer.id="map-dark";
        tileLayer.addTo(map);
    }    
    return map;
}


/**
 * Function handles fetching bus data and rendering locations
 */
async function get_bus_locations() {
    let params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
    // Get the value of "city"
    var city = params.city;
    var coordinates = await city_coords(city);
    map.panTo(new L.LatLng(coordinates[0], coordinates[1]));
    // Set interval to fetch bus location data every 3 seconds
    setInterval(function() {
    // Fetch bus location data from the server. pass city
    fetch('https://artful-athlete-381513.ew.r.appspot.com/bus_locations/' + city)
        // Return promise
        .then(function(response) {
            return (response.json());
        })
        // Render bus locations
        .then(function(data) {
            map.eachLayer(function (layer) {
                if (layer.id!='map-dark' && layer.id != 'map-light') {
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
                new_circle = L.marker([data[y]['latitude'], data[y]['longitude']], {
                    icon: L.divIcon({
                        className: 'bus-icon',
                        html: data[y]['route_short_name'],
                        id: data[y]['id']
                    })
                }).addTo(map);
                // Create a popup
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
    setTimeout(() => {
        const loader = document.querySelector('#loader');
        const map = document.querySelector('#map');
        loader.style.opacity = '0'; // add opacity style to fade out loader
        map.style.filter = 'none';
        map.style.transition = 'filter 0.5s ease-in-out'; // add transition effect to map
        loader.style.transition = 'opacity 0.5s ease-in-out'; // add transition effect to loader
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // hide loader after it has faded out
    }, "4000");
}


/**
 * Function to pass coordinates of selected city
 * @param {*} city selected city
 * @returns returns array of coordinates for the selected city [lat,lon]
 */
async function city_coords(city) {
    const response = await fetch("static/coords.json");
    const data = await response.json();
    coord_list = [];
    for (let x = 0; x < Object.keys(data[0]).length; x++) {
        if (data[0][x]['city'] == city) {
            coord_list.push(data[0][x]['lat']);
            coord_list.push(data[0][x]['lon']);
        }
    }
    return coord_list;
}