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

  let sortCriteria = [];
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

  function getSortCriterion(statKey) {
    const index = sortCriteria.findIndex(
      (criterion) => criterion.key === statKey,
    );

    if (index === -1) {
      return null;
    }

    return {
      ...sortCriteria[index],
      priority: index + 1,
    };
  }

  function renderSortHeader(statKey, label, numeric = false) {
    const criterion = getSortCriterion(statKey);

    const sortDirection = criterion?.direction ?? "none";

    const indicator = criterion
      ? `${criterion.direction === "asc" ? "▲" : "▼"}${criterion.priority}`
      : "↕";

    return `
      <th
        class="${numeric ? "numeric " : ""}tyr-enhanced-sort"
        data-stat="${statKey}"
        data-sort-direction="${sortDirection}"
      >
        <span class="tyr-enhanced-sort-label">
          ${label}
        </span>

        <span
          class="tyr-enhanced-sort-indicator"
          aria-hidden="true"
        >
          ${indicator}
        </span>
      </th>
    `;
  }

  function compareVehicles(a, b) {
    const classOrder = {
      light: 0,
      medium: 1,
      heavy: 2,
    };

    for (const criterion of sortCriteria) {
      const { key, direction } = criterion;

      if (key === "__class__") {
        const aValue = classOrder[a.classId] ?? 99;
        const bValue = classOrder[b.classId] ?? 99;

        if (aValue !== bValue) {
          return direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        continue;
      }

      const aValue = window.TyrEnhanced.getStatValue(a, key);

      const bValue = window.TyrEnhanced.getStatValue(b, key);

      // N/A values always remain at the bottom.
      if (aValue === null && bValue === null) {
        continue;
      }

      if (aValue === null) {
        return 1;
      }

      if (bValue === null) {
        return -1;
      }

      if (aValue !== bValue) {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
    }

    // Final tie-breaker.
    return a.name.localeCompare(b.name);
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

  <div class="tyr-enhanced-header-actions">
    <button
      type="button"
      class="tyr-enhanced-reset-sort"
      id="tyr-enhanced-reset-sort"
      hidden
    >
      Reset sort
    </button>

    <label class="tyr-enhanced-show-all">
      <input
        type="checkbox"
        id="tyr-enhanced-show-all"
      >
      Show all stats
    </label>
  </div>
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

    const displayedVehicles = [...vehicles];

    if (sortCriteria.length > 0) {
      displayedVehicles.sort(compareVehicles);
    } else {
      displayedVehicles.sort((a, b) => a.name.localeCompare(b.name));
    }
    const resetSortButton = section.querySelector("#tyr-enhanced-reset-sort");

    resetSortButton.hidden = sortCriteria.length === 0;
    const head = section.querySelector("thead");

    head.innerHTML = `
      <tr>
        <th>Tank</th>

        ${renderSortHeader("__class__", "Class")}

        ${statKeys
          .map((statKey) => renderSortHeader(statKey, getLabel(statKey), true))
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

    const existingIndex = sortCriteria.findIndex(
      (criterion) => criterion.key === statKey,
    );

    // Shift + Click:
    // add another sorting level,
    // or toggle that level's direction.
    if (event.shiftKey) {
      if (existingIndex === -1) {
        sortCriteria.push({
          key: statKey,
          direction: getDefaultDirection(statKey),
        });
      } else {
        sortCriteria[existingIndex].direction =
          sortCriteria[existingIndex].direction === "asc" ? "desc" : "asc";
      }

      render();
      return;
    }

    // Clicking the current primary
    // toggles its direction.
    if (existingIndex === 0) {
      sortCriteria[0].direction =
        sortCriteria[0].direction === "asc" ? "desc" : "asc";

      render();
      return;
    }

    // Normal click on another column:
    // make it primary while preserving
    // the remaining sort criteria.
    let criterion;

    if (existingIndex >= 0) {
      criterion = sortCriteria.splice(existingIndex, 1)[0];
    } else {
      criterion = {
        key: statKey,
        direction: getDefaultDirection(statKey),
      };
    }

    sortCriteria.unshift(criterion);

    render();
  });

  section
    .querySelector("#tyr-enhanced-reset-sort")
    .addEventListener("click", () => {
      sortCriteria = [];
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
