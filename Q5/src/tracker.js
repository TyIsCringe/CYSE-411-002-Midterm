// ============================================================
//  CYSE 411 – Mid-Term Exam V2  |  Q5 Starter File
//  Incident Tracker Application


//  Application State

const ACCEPTED_SEVERITIES = ["low", "medium", "high", "critical"];
const ACCEPTED_FILTERS    = ["all", "low", "medium", "high", "critical"];

// Current filter selection (set during state load, used on save)
let currentFilter = "all";



//  Q5.C  Dashboard State – Load
//  Reads the last selected filter from localStorage.
//  VULNERABILITY: JSON.parse is called without a try/catch.
//  The stored filter value is used without checking whether
//  it belongs to the accepted list.


function loadDashboardState() {
    // ORIGINAL
    // const raw   = localStorage.getItem("dashboardState");
    // const state = JSON.parse(raw);             // No try/catch
    // currentFilter = state.filter;              // No enum validation
    // applyFilter(currentFilter);

    // new
    const safeDefaultState = { filter: "all" };
    const raw = localStorage.getItem("dashboardState");
    let state = safeDefaultState;

    if (raw !== null) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                state = parsed;
            }
        } catch (error) {
            console.warn("Invalid dashboardState in localStorage; using default.", error);
        }
    }

    const storedFilter = typeof state.filter === "string" ? state.filter : "all";
    const validatedFilter = ACCEPTED_FILTERS.includes(storedFilter) ? storedFilter : "all";

    currentFilter = validatedFilter;

    const filterInput = document.getElementById("filter-select");
    if (filterInput) {
        filterInput.value = validatedFilter;
    }

    applyFilter(validatedFilter);
}


//  Q5.C  Dashboard State – Save
//  Writes the selected filter back to localStorage after a fetch.
//  VULNERABILITY: The raw value from the DOM input is written
//  directly to localStorage without validating it against the
//  accepted list.


function saveDashboardState() {
    // ORIGINAL
    // const filterInput = document.getElementById("filter-select");
    // const filter      = filterInput.value;    // Not validated before storing
    // localStorage.setItem("dashboardState", JSON.stringify({ filter: filter }));
    // currentFilter = filter;

    // new
    const filterInput = document.getElementById("filter-select");
    if (!filterInput) {
        return;
    }

    const filter = filterInput.value;
    if (!ACCEPTED_FILTERS.includes(filter)) {
        console.warn("Not saving invalid filter value:", filter);
        return;
    }

    localStorage.setItem("dashboardState", JSON.stringify({ filter: filter }));
    currentFilter = filter;
}



//  Q5.A  Fetch Incidents

// I fixed fetch incidents with the try/catch and checked response.ok
async function fetchIncidents() {
    try {
        const response = await fetch("/api/incidents");
        if (!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("fetchIncidents failed ", error);
        return [];
    }
}



//  Q5.B  Render Incidents
//  Builds the incident list in the dashboard.
//  VULNERABILITY 1: Incident data (title, severity) is inserted
//    via innerHTML – a stored XSS risk if the API returns
//    attacker-controlled content.
//  VULNERABILITY 2: No validation of the incidents array or
//    individual incident fields before rendering.


function renderIncidents(incidents) {
    // ORIGINAL
    // const container = document.getElementById("incident-list");
    // container.innerHTML = "";                  // Clear previous results
    //
    // incidents.forEach(function (incident) {
    //    const item = document.createElement("li");
    //    // UNSAFE – directly inserts API response as HTML
    //    item.innerHTML =
    //        "<strong>" + incident.title + "</strong>" +
    //        " <span class='severity severity-" + incident.severity + "'>" +
    //        incident.severity + "</span>";
    //    container.appendChild(item);
    // });

    // new
    const container = document.getElementById("incident-list");
    container.textContent = "";

    if (!Array.isArray(incidents)) {
        const message = document.createElement("li");
        message.textContent = "Unable to display incidents right now. Please try again later.";
        container.appendChild(message);
        return;
    }

    incidents.forEach(function (incident) {
        const hasValidTitle =
            incident &&
            typeof incident.title === "string" &&
            incident.title.trim().length > 0;
        const hasValidSeverity =
            incident &&
            typeof incident.severity === "string" &&
            ACCEPTED_SEVERITIES.includes(incident.severity);

        if (!hasValidTitle || !hasValidSeverity) {
            console.warn("Skipping invalid incident:", incident);
            return;
        }

        const item = document.createElement("li");
        const title = document.createElement("strong");
        title.textContent = incident.title;

        const spacer = document.createTextNode(" ");
        const severity = document.createElement("span");
        severity.className = "severity severity-" + incident.severity;
        severity.textContent = incident.severity;

        item.appendChild(title);
        item.appendChild(spacer);
        item.appendChild(severity);
        container.appendChild(item);
    });
}



//  Filter Helper (provided – do not modify)
//  Hides/shows rendered items based on selected severity.


function applyFilter(filter) {
    const items = document.querySelectorAll("#incident-list li");
    items.forEach(function (item) {
        const badge = item.querySelector(".severity");
        if (!badge) return;
        const sev = badge.textContent.trim();
        item.style.display = (filter === "all" || sev === filter) ? "" : "none";
    });
    currentFilter = filter;
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", async function () {

    // Q5.C – Load saved filter state
    loadDashboardState();

    // Q5.A – Fetch incident data from the API
    const incidents = await fetchIncidents();

    // Q5.B – Render the incidents
    renderIncidents(incidents);

    // Filter select change handler
    document.getElementById("filter-select").addEventListener("change", function () {
        applyFilter(this.value);
        // Q5.C – Save the new filter choice
        saveDashboardState();
    });

});
