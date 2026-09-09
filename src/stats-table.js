function createStatsTable(vehicles) {
  if (location.pathname !== "/tools/tanks/compare") {
    return;
  }

  if (document.querySelector("#tyr-enhanced-stats")) {
    return;
  }

  const allStatKeys = [
    ...new Set(vehicles.flatMap((vehicle) => Object.keys(vehicle.stats ?? {}))),
  ];

  let activeStat = null;
  let direction = "desc";
  let showAllStats = false;

  function getLabel(statKey) {
    return (
      window.TyrEnhanced.statDefinitions?.[statKey]?.label ??
      statKey.replace(/([a-z])([A-Z])/g, "$1 $2")
    );
  }

  function getDefaultDirection(statKey) {
    if (statKey === "__class__") {
      return "asc";
    }

    const better = window.TyrEnhanced.statDefinitions?.[statKey]?.better;

    return better === "lower" ? "asc" : "desc";
  }

  function formatValue(value) {
    if (typeof value !== "number") {
      return "N/A";
    }

    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, {
          maximumFractionDigits: 3,
        });
  }

  function hasVariation(statKey) {
    const values = vehicles.map((vehicle) => {
      const value = window.TyrEnhanced.getStatValue(vehicle, statKey);

      return value === null ? "--" : value;
    });

    return new Set(values).size > 1;
  }

  function getVisibleStatKeys() {
    if (showAllStats) {
      return allStatKeys;
    }

    return allStatKeys.filter(hasVariation);
  }

  const section = document.createElement("section");
  section.id = "tyr-enhanced-stats";

  section.innerHTML = `
    <div class="tyr-enhanced-panel">
      <div class="tyr-enhanced-header">
        <h2 class="tyr-enhanced-title">
          Tyr HQ Enhanced · All-Tank Stats
        </h2>

        <label class="tyr-enhanced-show-all">
          <input
            type="checkbox"
            id="tyr-enhanced-show-all"
          >
          Show all stats
        </label>
      </div>

      <div class="tyr-enhanced-table-scroll">
        <table class="tyr-enhanced-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  const target = document.querySelector("main") ?? document.body;
  target.appendChild(section);

  function render() {
    const statKeys = getVisibleStatKeys();

    let displayedVehicles = [...vehicles];

    if (activeStat === "__class__") {
      const classOrder = {
        light: 0,
        medium: 1,
        heavy: 2,
      };

      displayedVehicles.sort((a, b) => {
        const difference = classOrder[a.classId] - classOrder[b.classId];

        if (difference === 0) {
          return a.name.localeCompare(b.name);
        }

        return direction === "asc" ? difference : -difference;
      });
    } else if (activeStat) {
      displayedVehicles = window.TyrEnhanced.sortVehiclesByStat(
        displayedVehicles,
        activeStat,
        direction,
      );
    } else {
      displayedVehicles.sort((a, b) => a.name.localeCompare(b.name));
    }

    const head = section.querySelector("thead");

    head.innerHTML = `
      <tr>
        <th>Tank</th>
        <th
  class="tyr-enhanced-sort"
  data-stat="__class__"
  data-sort-direction="${activeStat === "__class__" ? direction : "none"}"
>
  <span class="tyr-enhanced-sort-label">
    Class
  </span>

  <span
    class="tyr-enhanced-sort-indicator"
    aria-hidden="true"
  >
    ${activeStat === "__class__" ? (direction === "asc" ? "▲" : "▼") : "↕"}
  </span>
</th>

        ${statKeys
          .map((statKey) => {
            const active = activeStat === statKey;

            const sortDirection = active ? direction : "none";

            const indicator =
              sortDirection === "asc"
                ? "▲"
                : sortDirection === "desc"
                  ? "▼"
                  : "↕";

            return `
      <th
        class="numeric tyr-enhanced-sort"
        data-stat="${statKey}"
        data-sort-direction="${sortDirection}"
      >
        <span class="tyr-enhanced-sort-label">
          ${getLabel(statKey)}
        </span>

        <span
          class="tyr-enhanced-sort-indicator"
          aria-hidden="true"
        >
          ${indicator}
        </span>
      </th>
    `;
          })
          .join("")}
      </tr>
    `;

    const body = section.querySelector("tbody");

    body.innerHTML = displayedVehicles
      .map(
        (vehicle) => `
      <tr>
        <td>${vehicle.name}</td>
        <td>${vehicle.classLabel}</td>

        ${statKeys
          .map(
            (statKey) => `
          <td class="numeric">
            ${window.TyrEnhanced.formatStatValue(vehicle, statKey)}
          </td>
        `,
          )
          .join("")}
      </tr>
    `,
      )
      .join("");
  }

  section.querySelector("thead").addEventListener("click", (event) => {
    const header = event.target.closest("[data-stat]");

    if (!header) {
      return;
    }

    const statKey = header.dataset.stat;

    if (activeStat === statKey) {
      direction = direction === "desc" ? "asc" : "desc";
    } else {
      activeStat = statKey;
      direction = getDefaultDirection(statKey);
    }

    render();
  });

  section
    .querySelector("#tyr-enhanced-show-all")
    .addEventListener("change", (event) => {
      showAllStats = event.target.checked;
      render();
    });

  render();
}

window.TyrEnhanced.createStatsTable = createStatsTable;
