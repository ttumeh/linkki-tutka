"use strict";


window.addEventListener("load", function() {
    get_bus_locations();
});

/**
 * Function handles fetching bus locations
 */
function get_bus_locations() {
    // Set interval to fetch bus location data every 3 seconds
    setInterval(async function() {
    // Fetch bus location data from the server
    fetch('http://127.0.0.1:5000/bus_locations')
        // Return promise
        .then(function(response) {
            return response.json();
        })
        // Render bus locations
        .then(async function(data) {
            let vehicle_div = document.getElementById("vehicle_div");
            for (let y = 0; y<Object.keys(data).length; y++) {
                let found = false;
                let vehicles = document.getElementsByClassName('vehicle');
                // Check if certain bus is already rendered
                for (let x= 0; x<vehicles.length; x++) {
                    if (vehicles[x].id==data[y]['id']) {
                        vehicles[x].textContent=[data[y]['id'], data[y]['latitude'], data[y]['longitude']];
                        found = true;
                    }
                }
                // If bus not rendered, create new object
                if (found == false) {
                    let longitude = document.createElement('div');
                    longitude.className="vehicle";
                    longitude.id=data[y]['id'];
                    longitude.textContent = [data[y]['id'], data[y]['latitude'], data[y]['longitude']];
                    vehicle_div.append(longitude);
                }
            }
        })
        .catch(error => console.log('Virhe', error));
    }, 3000);
}