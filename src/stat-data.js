const STAT_DEFINITIONS = {
  MaxHealth: {
    label: "Health",
    better: "higher"
  },

  MaxAbilityResource: {
    label: "Max Energy",
    better: "higher"
  },

  VisionRadius: {
    label: "Vision Radius",
    better: "higher",
    unit: "m"
  },

  DetectionRadius: {
    label: "Detection Radius",
    better: "lower",
    unit: "m"
  },

  ReloadTime: {
    label: "Full Reload",
    better: "lower",
    unit: "s"
  },

  ClipSize: {
    label: "Clip Size",
    better: "higher"
  },

  IntraClipReloadTime: {
    label: "Intra Reload",
    better: "lower",
    unit: "s"
  },

  AbilityWindUpTime: {
    label: "Ability Windup",
    better: "lower",
    unit: "s"
  },

  AbilityWindDownTime: {
    label: "Ability Winddown",
    better: "lower",
    unit: "s"
  },

  AbilityCost: {
    label: "Energy Cost",
    better: "lower"
  },

  AbilityCooldown: {
    label: "Cooldown",
    better: "lower",
    unit: "s"
  },

  ShellDamage: {
    label: "Avg. Damage/Shot",
    better: "higher"
  },

  ShellPenetration: {
    label: "Penetration",
    better: "higher",
    unit: "mm"
  },

  MaxSpeed: {
    label: "Top Speed",
    better: "higher",
    unit: "km/h"
  },

  MaxReverseSpeed: {
    label: "Top Reverse Speed",
    better: "higher",
    unit: "km/h"
  },

  MaxStrafingSpeed: {
    label: "Top Strafing Speed",
    better: "higher",
    unit: "km/h"
  },

  AccelerationTime: {
    label: "Acceleration",
    better: "lower",
    unit: "s"
  },

  HullTraverseSpeed: {
    label: "Hull Rotation",
    better: "higher",
    unit: "°/s"
  },

  TurretTraverseSpeed: {
    label: "Turret Rotation",
    better: "higher",
    unit: "°/s"
  },

  GunTraverseSpeed: {
    label: "Gun Rotation",
    better: "higher",
    unit: "°/s"
  },

  GunMaxDepression: {
    label: "Gun Depression",
    better: "lower",
    unit: "°"
  },

  GunMaxElevation: {
    label: "Gun Elevation",
    better: "higher",
    unit: "°"
  },

  GunMaxHoverTilt: {
    label: "Hover Tilt",
    unit: "°"
  },

  Mass: {
    label: "Mass",
    better: "lower",
    unit: "kg"
  },

  ShellVelocity: {
    label: "Shell Velocity",
    better: "higher",
    unit: "m/s"
  },

  BaseDispersionPenalty: {
    label: "Base Dispersion",
    better: "lower",
    unit: "°"
  },

  MovementDispersionPenalty: {
    label: "Movement Dispersion",
    better: "lower",
    unit: "°",
    signed: true
  },

  HullTraverseDispersionPenalty: {
    label: "Hull Rotation Dispersion",
    better: "lower",
    unit: "°",
    signed: true
  },

  TurretTraverseDispersionPenalty: {
    label: "Turret Rotation Dispersion",
    better: "lower",
    unit: "°",
    signed: true
  },

  FiringDispersionPenalty: {
    label: "Firing Dispersion",
    better: "lower",
    unit: "°",
    signed: true
  },

  DispersionReductionSpeed: {
    label: "Aim Speed",
    better: "higher",
    unit: "°/s",
    invertDisplay: true
  },

  InitialAbilityResource: {
    label: "Starting Energy",
    better: "higher"
  },

  AltAmmoCountOne: {
    label: "Alt Ammo 1"
  },

  AltAmmoCountTwo: {
    label: "Alt Ammo 2"
  },

  AltAmmoCountThree: {
    label: "Alt Ammo 3"
  },

  ProxyVisionRadius: {
    label: "Proxy Vision Radius",
    better: "higher",
    unit: "m"
  },

  CamoPercentage: {
    label: "Camouflage",
    better: "higher",
    unit: "%"
  },

  DifficultyRating: {
    label: "Difficulty"
  },

  FirepowerRating: {
    label: "Firepower"
  },

  DurabilityRating: {
    label: "Durability"
  },

  AbilityRating: {
    label: "Ability"
  },

  ScoutingRating: {
    label: "Scouting"
  },

  AbilityDuration: {
    label: "Duration",
    better: "higher",
    unit: "s"
  },

  NumAmmunitionSlots: {
    label: "Ammo Slots"
  },

  SpottedTime: {
    label: "Spotted Time",
    better: "lower",
    unit: "s"
  },

  ShellSwapTime: {
    label: "Shell Swap Time",
    better: "lower",
    unit: "s"
  },

  PreciseDispersionTime: {
    label: "Precise Dispersion Time",
    better: "lower",
    unit: "s"
  }
};

function getStatValue(vehicle, statKey) {
  const value = vehicle.stats?.[statKey];

  if (typeof value !== "number") {
    return null;
  }

  // A speed of zero means this vehicle cannot strafe.
  if (statKey === "MaxStrafingSpeed" && value === 0) {
    return null;
  }

  // Single-shot guns have no intra-clip reload.
  if (
    statKey === "IntraClipReloadTime" &&
    (vehicle.stats?.ClipSize ?? 1) <= 1
  ) {
    return null;
  }

  return value;
}

function formatStatValue(vehicle, statKey) {
  let value = getStatValue(vehicle, statKey);

  if (value === null) {
    return "--";
  }

  const definition = STAT_DEFINITIONS[statKey] ?? {};

  // The game displays aim/recovery speed as a negative dispersion change.
  if (definition.invertDisplay) {
    value = -Math.abs(value);
  }

  const formattedNumber = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  let prefix = "";

  if (definition.signed && value >= 0) {
    prefix = "+";
  }

  return `${prefix}${formattedNumber}${definition.unit ?? ""}`;
}

function sortVehiclesByStat(
  vehicles,
  statKey,
  direction = "desc"
) {
  return [...vehicles].sort((a, b) => {
    const aValue = getStatValue(a, statKey);
    const bValue = getStatValue(b, statKey);

    const aMissing = aValue === null;
    const bMissing = bValue === null;

    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;

    return direction === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });
}

function filterVehiclesByClasses(
  vehicles,
  classIds = []
) {
  if (classIds.length === 0) {
    return [...vehicles];
  }

  return vehicles.filter(
    (vehicle) => classIds.includes(vehicle.classId)
  );
}

window.TyrEnhanced.statDefinitions = STAT_DEFINITIONS;
window.TyrEnhanced.getStatValue = getStatValue;
window.TyrEnhanced.formatStatValue = formatStatValue;
window.TyrEnhanced.sortVehiclesByStat = sortVehiclesByStat;
window.TyrEnhanced.filterVehiclesByClasses =
  filterVehiclesByClasses;