// public/js/map.js

// 'listing' variable is passed from EJS using inline script in show.ejs
const map = L.map('map').setView([listing.geometry.coordinates[1], listing.geometry.coordinates[0]], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Marker
const marker = L.marker([listing.geometry.coordinates[1], listing.geometry.coordinates[0]]).addTo(map);

// Popup
marker.bindPopup(`This is where you'd stay<br> 
   <h5><b>${listing.title}</b></h5><br>${listing.location}`).openPopup();
