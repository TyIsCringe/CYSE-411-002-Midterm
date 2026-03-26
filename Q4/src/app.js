// ============================================================
//  CYSE 411 Q4 Starter Code
//  Employee Directory Application

// Q 4.C Session Data Integrity on Load

// I fixed load session to use try/catch, have strings ahead of time, and to return nothing and not authenticate if something is missing or invalid.
function loadSession() {
    const raw = sessionStorage.getItem("session");
    if (!raw) {
        return null;
    }

    try {
        const session = JSON.parse(raw);

        const hasValidFields =
            typeof session?.userId === "string" && session.userId.trim() !== "" &&
            typeof session?.role === "string" && session.role.trim() !== "" &&
            typeof session?.displayName === "string" && session.displayName.trim() !== "";

        return hasValidFields ? session : null;
    } catch (error) {
        return null;
    }
}


//  Q4.A  Status Message Rendering

// I fixed the status message rendering according to the requirements

function renderStatusMessage(containerElement, message) {
    const paragraph = document.createElement("p");
    paragraph.textContent = String(message ?? "");
    containerElement.textContent = "";
    containerElement.appendChild(paragraph);
}



//  Q4.B  Search Query Sanitization

// I fixed the search sanitaization to fit the requirements to prevent malicious commands from executing
function sanitizeSearchQuery(input) {
    const trimmed = String(input ?? "").trim();
    const filtered = trimmed.replace(/[^A-Za-z0-9 _-]/g, "");
    const limited = filtered.slice(0, 40);

    return limited.length > 0 ? limited : null;
}

function performSearch(query) {
    const sanitized = sanitizeSearchQuery(query);
    const label = document.getElementById("search-label");

    if (sanitized === null) {
        label.textContent = "Please enter a valid search query.";
        return;
    }

    label.textContent = "Showing results for: " + sanitized;
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", function () {

    // Load session
    const session = loadSession();
    if (session) {
        document.getElementById("welcome-msg").textContent =
            "Welcome, " + session.displayName;
    }

    // Simulate receiving a profile card with a status message
    // In production this would come from an API response.
    const simulatedProfiles = [
        {
            name: "Alice Johnson",
            department: "Engineering",
            status: "Working from home today"
        },
        {
            name: "Bob Martinez",
            department: "Security",
            // Attacker-controlled payload – should NOT execute
            status: "<img src=x onerror=\"alert('XSS: session stolen')\">"
        },
        {
            name: "Carol Lee",
            department: "HR",
            status: "Out of office until Friday"
        }
    ];

    const directory = document.getElementById("directory");

    simulatedProfiles.forEach(function (profile) {
        const card = document.createElement("div");
        card.className = "profile-card";

        const nameEl = document.createElement("h3");
        nameEl.textContent = profile.name;

        const deptEl = document.createElement("p");
        deptEl.textContent = "Department: " + profile.department;

        const statusContainer = document.createElement("div");
        statusContainer.className = "status";

        // Q4.A – fix this call
        renderStatusMessage(statusContainer, profile.status);

        card.appendChild(nameEl);
        card.appendChild(deptEl);
        card.appendChild(statusContainer);
        directory.appendChild(card);
    });

    // Search button handler
    document.getElementById("search-btn").addEventListener("click", function () {
        const query = document.getElementById("search-input").value;
        performSearch(query);
    });

});
