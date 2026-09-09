const STAT_DEFINITIONS = {
  MaxHealth: {
    label: "Health",
    better: "higher"
  },

  ShellDamage: {
    label: "Shell Damage",
    better: "higher"
  },

  ShellPenetration: {
    label: "Shell Penetration",
    better: "higher"
  },

  ReloadTime: {
    label: "Reload Time",
    better: "lower"
  },

  MaxSpeed: {
    label: "Max Speed",
    better: "higher"
  },

  AccelerationTime: {
    label: "Acceleration Time",
    better: "lower"
  },

  BaseDispersionPenalty: {
    label: "Base Dispersion",
    better: "lower"
  }
};

window.TyrEnhanced.statDefinitions = STAT_DEFINITIONS;

function sortVehiclesByStat(vehicles, statKey, direction = "desc") {
  return [...vehicles].sort((a, b) => {
    const aValue = a.stats?.[statKey];
    const bValue = b.stats?.[statKey];

    const aMissing = typeof aValue !== "number";
    const bMissing = typeof bValue !== "number";

    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;

    return direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });
}

window.TyrEnhanced.sortVehiclesByStat = sortVehiclesByStat;

function filterVehiclesByClasses(vehicles, classIds = []) {
  if (classIds.length === 0) {
    return [...vehicles];
  }

  return vehicles.filter(
    (vehicle) => classIds.includes(vehicle.classId)
  );
}

window.TyrEnhanced.filterVehiclesByClasses = filterVehiclesByClasses;