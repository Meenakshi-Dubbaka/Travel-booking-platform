const defaultCoords = {
  lat: 17.385044,
  lng: 78.486671
};

const mapContainer = document.getElementById("map");

if (mapContainer) {
  const lat = parseFloat(mapContainer.dataset.lat);
  const lng = parseFloat(mapContainer.dataset.lng);

  const finalLat = isNaN(lat) ? defaultCoords.lat : lat;
  const finalLng = isNaN(lng) ? defaultCoords.lng : lng;

  const locationName = mapContainer.dataset.location || "Location";

  const map = L.map("map").setView([finalLat, finalLng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const houseIcon = L.icon({
    iconUrl: "/icons/house-icon.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -30],
  });

  L.marker([finalLat, finalLng], { icon: houseIcon })
    .addTo(map)
    .bindPopup(`<b>${locationName}</b>`)
    .openPopup();
}