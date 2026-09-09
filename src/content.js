let vehicles = null;
let lastPath = location.pathname;
let pageCheckTimer = null;

function removeStatsTable() {
  document.querySelector("#tyr-enhanced-stats")?.remove();
}

async function runForCurrentPage() {
  const path = location.pathname;

  if (path !== "/tools/tanks/compare") {
    removeStatsTable();
    return;
  }

  if (!vehicles) {
    vehicles = await window.TyrEnhanced.loadVehicleData();

    console.log(
      `[Tyr HQ Enhanced] Loaded ${vehicles.length} vehicles`
    );
  }

  window.TyrEnhanced.createStatsTable(vehicles);
}

function schedulePageCheck() {
  clearTimeout(pageCheckTimer);

  pageCheckTimer = setTimeout(() => {
    runForCurrentPage();
  }, 250);
}

function startAfterTyrLoads() {
  if (document.readyState === "complete") {
    schedulePageCheck();
  } else {
    window.addEventListener("load", schedulePageCheck, {
      once: true
    });
  }

  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      schedulePageCheck();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

startAfterTyrLoads();