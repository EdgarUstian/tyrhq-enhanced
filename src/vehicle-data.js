let vehiclesCache = null;

async function loadVehicleData() {
  if (vehiclesCache) {
    return vehiclesCache;
  }

  const dataUrl = chrome.runtime.getURL("data/runtime.json");
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`Failed to load game data: ${response.status}`);
  }

  const gameData = await response.json();
  vehiclesCache = gameData.vehicles;

  return vehiclesCache;
}

async function getVehicleById(id) {
  const vehicles = await loadVehicleData();
  return vehicles.find((vehicle) => vehicle.id === id) ?? null;
}

async function getVehicleBySlug(slug) {
  const vehicles = await loadVehicleData();
  return vehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

window.TyrEnhanced = {
  loadVehicleData,
  getVehicleById,
  getVehicleBySlug
};