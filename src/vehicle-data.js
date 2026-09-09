async function loadVehicleData() {
  const dataUrl = chrome.runtime.getURL("data/runtime.json");
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`Failed to load game data: ${response.status}`);
  }

  const gameData = await response.json();

  return gameData.vehicles;
}

window.TyrEnhanced = {
  loadVehicleData
};