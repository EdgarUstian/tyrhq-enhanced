async function start() {
  const vehicles = await window.TyrEnhanced.loadVehicleData();

  console.log(
    `[Tyr HQ Enhanced] Loaded ${vehicles.length} vehicles`,
    vehicles
  );
}

start();