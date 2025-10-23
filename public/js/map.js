console.log(coordinates);
const lng = parseFloat(coordinates[0]);
const lat = parseFloat(coordinates[1]);
console.log("map initalized with", lat, lng);

const map = L.map('map').setView([lat, lng], 10);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker([lat, lng]).addTo(map);
marker.bindPopup("This is where you'll stay").openPopup();
var popup = L.popup()
    .setLatLng([lat, lng])
    .setContent("location.")
    .openOn(map);



