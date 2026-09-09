async function start() {
  const vehicles = await window.TyrEnhanced.loadVehicleData();

  console.log(
    `[Tyr HQ Enhanced] Loaded ${vehicles.length} vehicles`
  );

  window.TyrEnhanced.createComparisonTable(vehicles);
}

function startAfterTyrLoads() {
  if (document.readyState === "complete") {
    setTimeout(start, 250);
    return;
  }

  window.addEventListener(
    "load",
    () => {
      setTimeout(start, 250);
    },
    { once: true }
  );
}

startAfterTyrLoads();