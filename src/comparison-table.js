function createComparisonTable(vehicles) {
  if (location.pathname !== "/tools/tanks/compare") {
    return;
  }

  if (document.querySelector("#tyr-enhanced-comparison")) {
    return;
  }

  let direction = "desc";

  const section = document.createElement("section");
  section.id = "tyr-enhanced-comparison";

  section.style.cssText = `
    max-width: 96rem;
    margin: 0 auto 40px;
    padding: 0 24px;
  `;

  section.innerHTML = `
    <div style="
      background: #111;
      border: 1px solid #444;
      padding: 20px;
      color: white;
    ">
      <h2 style="margin: 0 0 16px;">
        Tyr HQ Enhanced — All-Tank Comparison
      </h2>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align:left;">Tank</th>
            <th style="text-align:left;">Class</th>
            <th id="tyr-health-sort" style="text-align:right; cursor:pointer;">
              Health ↓
            </th>
          </tr>
        </thead>

        <tbody id="tyr-comparison-body"></tbody>
      </table>
    </div>
  `;

  const target = document.querySelector("main") ?? document.body;
  target.appendChild(section);

  function render() {
    const sorted = window.TyrEnhanced.sortVehiclesByStat(
      vehicles,
      "MaxHealth",
      direction
    );

    const body = section.querySelector("#tyr-comparison-body");

    body.innerHTML = sorted.map((vehicle) => `
      <tr>
        <td>${vehicle.name}</td>
        <td>${vehicle.classLabel}</td>
        <td style="text-align:right;">
          ${vehicle.stats.MaxHealth ?? "N/A"}
        </td>
      </tr>
    `).join("");

    const header = section.querySelector("#tyr-health-sort");

    header.textContent =
      direction === "desc"
        ? "Health ↓"
        : "Health ↑";
  }

  section
    .querySelector("#tyr-health-sort")
    .addEventListener("click", () => {
      direction = direction === "desc" ? "asc" : "desc";
      render();
    });

  render();
}

window.TyrEnhanced.createComparisonTable = createComparisonTable;