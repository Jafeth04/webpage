// Inicializar mapa
const universidad = [12.125624119685705, -86.27082560564708];
const map = L.map("map").setView(universidad, 17);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Edificios
const edificios = {
  "Edificio P": [12.1262, -86.2708],
  "Edificio J": [12.1259, -86.2713],
  "Edificio O": [12.1255, -86.2703],
  "Edificio Q": [12.1266, -86.2710],
};

// Crear marcadores
for (const [nombre, coords] of Object.entries(edificios)) {
  L.marker(coords).addTo(map).bindPopup(`<b>${nombre}</b>`);
}

let destinoSeleccionado = null;
let rutaActual = null;
let marcadorUsuario = null;
let watchId = null;

// Buscar edificio
document.getElementById("buscarBtn").addEventListener("click", () => {
  const nombre = document.getElementById("buscar").value.trim();
  const coords = edificios[nombre];
  if (!coords) return alert("No se encontró ese edificio.");
  destinoSeleccionado = coords;
  map.setView(coords, 19);
  L.popup().setLatLng(coords).setContent(`<b>${nombre}</b>`).openOn(map);
});

// Comenzar viaje con alta precisión
document.getElementById("viajeBtn").addEventListener("click", () => {
  if (!destinoSeleccionado) return alert("Primero busca un edificio.");

  if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización.");

  // Limpiar rutas anteriores
  if (rutaActual) map.removeControl(rutaActual);
  if (marcadorUsuario) map.removeLayer(marcadorUsuario);
  if (watchId) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const origen = [lat, lng];

      // Marcador animado
      if (!marcadorUsuario) {
        const userIcon = L.divIcon({ html: '<div class="user-marker"></div>', className: '', iconSize: [25, 25] });
        marcadorUsuario = L.marker(origen, { icon: userIcon }).addTo(map).bindPopup("Tu ubicación").openPopup();
      } else {
        marcadorUsuario.setLatLng(origen);
      }

      // Ruta
      if (rutaActual) map.removeControl(rutaActual);
      rutaActual = L.Routing.control({
        waypoints: [L.latLng(origen[0], origen[1]), L.latLng(destinoSeleccionado[0], destinoSeleccionado[1])],
        routeWhileDragging: true,
        draggableWaypoints: false,
        addWaypoints: false,
        lineOptions: { styles: [{ color: "#00b894", opacity: 0.9, weight: 6, dashArray: "6,10" }] },
        createMarker: () => null,
      }).addTo(map);

      // Centrar mapa
      map.setView(origen, 18);
    },
    (err) => {
      alert("No se pudo obtener tu ubicación. Permite el acceso al GPS y usa señal fuerte.");
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
});

// Menú móvil
document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.querySelector(".nav");
  const expanded = nav.classList.toggle("active");
  document.getElementById("menuToggle").setAttribute("aria-expanded", expanded);
});
