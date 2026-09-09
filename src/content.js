async function start() {
  const vehicles = await window.TyrEnhanced.loadVehicleData();

  console.log(
    `[Tyr HQ Enhanced] Loaded ${vehicles.length} vehicles`,
    vehicles
  );
}

start();

(async () => {
const vehicles = await window.TyrEnhanced.loadVehicleData();

const filtered = window.TyrEnhanced.filterVehiclesByClasses(
  vehicles,
  ["light", "medium", "heavy"]
);

const sorted = window.TyrEnhanced.sortVehiclesByStat(
  filtered,
  "MaxHealth",
  "desc"
);
console.log(
  "[Tyr HQ Enhanced] Sorted vehicles by MaxHealth:",
  sorted
);
console.table(
  sorted.map((vehicle) => ({
    Tank: vehicle.name,
    Class: vehicle.classId,
    Health: vehicle.stats.MaxHealth
  }))
);
})();