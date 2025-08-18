const defaultCoords = [17.385044, 78.486671]; // Hyderabad fallback

const mapContainer = document.getElementById("map");

if (mapContainer) {
  const lat = parseFloat(mapContainer.dataset.lat) || defaultCoords[0];
  const lng = parseFloat(mapContainer.dataset.lng) || defaultCoords[1];
  const locationName = mapContainer.dataset.location || "Location";

  const map = L.map("map").setView([lat, lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const houseIcon = L.icon({
    iconUrl: '/icons/house-icon.png', // Make sure the path is correct
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -30]
  });

  L.marker([lat, lng], { icon: houseIcon })
    .addTo(map)
    .bindPopup(`<b>${locationName}</b>`)
    .openPopup();
}
