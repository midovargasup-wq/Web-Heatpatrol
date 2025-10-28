// -------------------- WebSocket Connection --------------------
// ⚠️ Replace this IP with your ESP32’s actual IP from Serial Monitor
const socket = new WebSocket('ws://172.20.10.5:81/');

socket.onopen = () => console.log("✅ Connected to ESP32 WebSocket");
socket.onclose = () => console.log("❌ Disconnected from ESP32");
socket.onerror = (err) => console.error("WebSocket error:", err);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};

// -------------------- Dashboard Update --------------------
function updateDashboard(data) {
  document.getElementById("tempValue").textContent = data.temperature.toFixed(2);
  document.getElementById("humValue").textContent = data.humidity.toFixed(2);
  document.getElementById("hiValue").textContent = data.heatIndex.toFixed(2);
  document.getElementById("latValue").textContent = data.lat.toFixed(6);
  document.getElementById("lonValue").textContent = data.lon.toFixed(6);
  document.getElementById("altValue").textContent = data.alt.toFixed(2);

  const statusBadge = document.getElementById("statusBadge");
  statusBadge.textContent = data.status;

  // Color code by status
  statusBadge.className = "status";
  if (data.status === "SAFE") statusBadge.classList.add("safe");
  else if (data.status === "EXTREME CAUTION") statusBadge.classList.add("caution");
  else if (data.status === "DANGER") statusBadge.classList.add("danger");
  else statusBadge.classList.add("extreme");

  addToChart(data.heatIndex);
  updateMap(data.lat, data.lon);

  document.getElementById("lastUpdated").textContent =
    "Last updated: " + new Date().toLocaleTimeString();
}

// -------------------- Chart --------------------
const ctx = document.getElementById("trendChart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Heat Index (°C)",
      data: [],
      borderColor: "#00d0ff",
      tension: 0.3,
    }],
  },
  options: {
    responsive: true,
    scales: { x: { display: false } }
  },
});

function addToChart(value) {
  if (chart.data.labels.length >= 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push("");
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// -------------------- Map --------------------
const map = L.map("map").setView([14.5995, 120.9842], 12); // default: Manila
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
const marker = L.marker([14.5995, 120.9842]).addTo(map);

function updateMap(lat, lon) {
  if (!isNaN(lat) && !isNaN(lon)) {
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 13);
  }
}
