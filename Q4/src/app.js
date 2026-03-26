// ============================================================
//  CYSE 411 Q4 Starter Code
//  Employee Directory Application


function loadSession() {
    // ORIGINAL
    // const raw = sessionStorage.getItem("session");
    // const session = JSON.parse(raw);          // No try/catch
    // return session;                            // No field validation

    //new
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
//  Displays an employee's status message on their profile card.
//  VULNERABILITY: The message is inserted via innerHTML,
//  allowing any HTML or script tags in the message to
//  execute in the viewer's browser (stored XSS).


function renderStatusMessage(containerElement, message) {
    // ORIGINAL
    // containerElement.innerHTML = "<p>" + message + "</p>";   // UNSAFE

    // new
    const paragraph = document.createElement("p");
    paragraph.textContent = String(message ?? "");
    containerElement.textContent = "";
    containerElement.appendChild(paragraph);
}



//  Q4.B  Search Query Sanitization
//  Builds a display label from the user's search input.
//  VULNERABILITY: The raw input is used directly with no
//  character filtering, no length limit, and no trimming.


function sanitizeSearchQuery(input) {
    // TODO: Implement sanitization.
    // Requirements:
    //   - Allow only letters, digits, spaces, hyphens, underscores
    //   - Trim leading/trailing whitespace before processing
    //   - Max 40 characters
    //   - Return null if the result is empty after sanitization

    //ORIGINAL
    // return input;   // UNSAFE – returns raw input unchanged

    // new
    const trimmed = String(input ?? "").trim();
    const filtered = trimmed.replace(/[^A-Za-z0-9 _-]/g, "");
    const limited = filtered.slice(0, 40);

    return limited.length > 0 ? limited : null;
}

function performSearch(query) {
    //ORIGINAL
    // label.innerHTML = "Showing results for: " + sanitized;  // UNSAFE

    // new
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
