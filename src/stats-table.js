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

  const statRanges = new Map(
    allStatKeys.map((statKey) => {
      const values = vehicles
        .map((vehicle) => window.TyrEnhanced.getStatValue(vehicle, statKey))
        .filter((value) => value !== null);

      if (values.length === 0) {
        return [statKey, null];
      }

      return [
        statKey,
        {
          min: Math.min(...values),
          max: Math.max(...values),
        },
      ];
    }),
  );

  let sortCriteria = [];
  let showAllStats = false;

  let selectedClasses = new Set(["light", "medium", "heavy"]);

  function getLabel(statKey) {
    return (
      window.TyrEnhanced.statDefinitions?.[statKey]?.label ??
      statKey.replace(/([a-z])([A-Z])/g, "$1 $2")
    );
  }

  function getDefaultDirection() {
    return "desc";
  }

  function getStatQuality(vehicle, statKey) {
    const definition = window.TyrEnhanced.statDefinitions?.[statKey];

    if (definition?.better !== "higher" && definition?.better !== "lower") {
      return null;
    }

    const value = window.TyrEnhanced.getStatValue(vehicle, statKey);

    if (value === null) {
      return null;
    }

    const range = statRanges.get(statKey);

    if (!range) {
      return null;
    }

    if (range.min === range.max) {
      return 0.5;
    }

    let quality = (value - range.min) / (range.max - range.min);

    if (definition.better === "lower") {
      quality = 1 - quality;
    }

    return Math.max(0, Math.min(1, quality));
  }

  function getQualityBackground(quality) {
    if (quality === null) {
      return null;
    }

    const distanceFromNeutral = Math.abs(quality - 0.5) * 2;

    if (distanceFromNeutral === 0) {
      return null;
    }

    const opacity = 0.45 * distanceFromNeutral;

    const color = quality < 0.5 ? [255, 161, 153] : [153, 247, 255];

    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity.toFixed(3)})`;
  }

  function renderStatCell(vehicle, statKey) {
    const quality = getStatQuality(vehicle, statKey);
    const background = getQualityBackground(quality);

    const gradientStyle = background
      ? ` style="--tyr-quality-bg: ${background};"`
      : "";

    const isPrimary = sortCriteria[0]?.key === statKey;

    return `
    <td
      class="numeric tyr-enhanced-stat-cell${
        isPrimary ? " tyr-enhanced-primary-column" : ""
      }"
      data-stat="${statKey}"
      ${gradientStyle}
    >
      ${window.TyrEnhanced.formatStatValue(vehicle, statKey)}
    </td>
  `;
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
    const isPrimary = criterion?.priority === 1;

    const sortDirection = criterion?.direction ?? "none";

    const indicator = criterion
      ? `${criterion.direction === "asc" ? "▲" : "▼"}${criterion.priority}`
      : "↕";

    return `
      <th
        class="${numeric ? "numeric " : ""}tyr-enhanced-sort${
          isPrimary ? " tyr-enhanced-primary-column" : ""
        }"
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
          return direction === "desc" ? aValue - bValue : bValue - aValue;
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

<div class="tyr-enhanced-filters">
  <span class="tyr-enhanced-filter-label">Class</span>

  <label class="tyr-enhanced-class-filter">
    <input
      type="checkbox"
      data-class="light"
      checked
    >
    Light
  </label>

  <label class="tyr-enhanced-class-filter">
    <input
      type="checkbox"
      data-class="medium"
      checked
    >
    Medium
  </label>

  <label class="tyr-enhanced-class-filter">
    <input
      type="checkbox"
      data-class="heavy"
      checked
    >
    Heavy
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

  function updatePinnedColumnOffsets() {
    const tankHeader = section.querySelector("thead .tyr-enhanced-pinned-tank");

    if (!tankHeader) {
      return;
    }

    section.style.setProperty(
      "--tyr-pinned-tank-width",
      `${tankHeader.offsetWidth}px`,
    );
  }

  function render() {
    const statKeys = getVisibleStatKeys();

    const displayedVehicles = vehicles.filter((vehicle) =>
      selectedClasses.has(vehicle.classId),
    );

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
        <th class="tyr-enhanced-pinned-tank">Tank</th>

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
            <td class="tyr-enhanced-pinned-tank">
              ${vehicle.name}
            </td>
            <td
              data-stat="__class__"
              class="${
                sortCriteria[0]?.key === "__class__"
                  ? "tyr-enhanced-primary-column"
                  : ""
              }"
            >
              ${vehicle.classLabel}
            </td>

            ${statKeys
              .map((statKey) => renderStatCell(vehicle, statKey))
              .join("")}
          </tr>
        `,
      )
      .join("");

    requestAnimationFrame(updatePinnedColumnOffsets);
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
    // neutral -> descending -> ascending -> neutral
    // while preserving the other sort priorities.
    if (event.shiftKey) {
      if (existingIndex === -1) {
        sortCriteria.push({
          key: statKey,
          direction: "desc",
        });
      } else if (sortCriteria[existingIndex].direction === "desc") {
        sortCriteria[existingIndex].direction = "asc";
      } else {
        sortCriteria.splice(existingIndex, 1);
      }

      render();
      return;
    }

    // Normal click on the current primary:
    // descending -> ascending -> neutral.
    if (existingIndex === 0) {
      if (sortCriteria[0].direction === "desc") {
        sortCriteria = [
          {
            key: statKey,
            direction: "asc",
          },
        ];
      } else {
        sortCriteria = [];
      }

      render();
      return;
    }

    // Normal click on any other header:
    // clear all previous sorting and make this
    // the descending primary sorter.
    sortCriteria = [
      {
        key: statKey,
        direction: "desc",
      },
    ];

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
  section
    .querySelector(".tyr-enhanced-filters")
    .addEventListener("change", (event) => {
      const input = event.target.closest("[data-class]");

      if (!input) {
        return;
      }

      const classId = input.dataset.class;

      if (input.checked) {
        selectedClasses.add(classId);
      } else {
        selectedClasses.delete(classId);
      }

      render();
    });

  const tableScroll = section.querySelector(".tyr-enhanced-table-scroll");

  const tableResizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updatePinnedColumnOffsets);
  });

  tableResizeObserver.observe(tableScroll);
  render();
}

window.TyrEnhanced.createStatsTable = createStatsTable;
