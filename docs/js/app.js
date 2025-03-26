import { PrayerTimes } from "./index.js";
import { Method, Times } from "./misc.js";

const state = {
    format: '24h',
    date: new Date(),
    lat: -6.200000,
    lng: 106.816666,
    timezone: 7
};

const elements = {
    lat: document.getElementById("latitude"),
    lng: document.getElementById("longitude"),
    timezone: document.getElementById("timezone"),
    method: document.getElementById("methods"),
    tableTitle: document.getElementById("table-title"),
    timetable: document.getElementById("timetable"),
    timeFormat: document.getElementById("time-format"),
    prev: document.getElementById("prev"),
    next: document.getElementById("next"),
};

const prayer = new PrayerTimes({
    lat: state.lat,
    lng: state.lng
});

init();

function init() {
    // Populate method dropdown
    elements.method.innerHTML = Object.entries(Method)
        .map(([k, v]) => `
      <option value="${k}" ${k === prayer.getMethod() ? "selected" : ""}>
        ${v}
      </option>
    `).join('');

    // Set initial values
    elements.lat.value = state.lat;
    elements.lng.value = state.lng;
    elements.timezone.value = state.timezone;

    // Set up event listeners
    elements.method.addEventListener('change', () => update());
    elements.lat.addEventListener('change', () => {
        state.lat = parseFloat(elements.lat.value);
        update();
    });
    elements.lng.addEventListener('change', () => {
        state.lng = parseFloat(elements.lng.value);
        update();
    });
    elements.timezone.addEventListener('change', () => {
        state.timezone = parseInt(elements.timezone.value);
        update();
    });
    elements.timeFormat.addEventListener('click', () => {
        state.format = state.format === '24h' ? '12h' : '24h';
        toggleFormat()
    });
    elements.prev.addEventListener('click', () => update(-1))
    elements.next.addEventListener('click', () => update(1))

    toggleFormat();
}

function update(offset = 0) {
    prayer.setMethod(elements.method.value);
    state.date.setMonth(state.date.getMonth() + offset);

    const month = state.date.getMonth();
    const year = state.date.getFullYear();

    elements.tableTitle.textContent = `${getMonth(month)} ${year}`;
    renderTable({ year, month, ...state });
}

function renderTable({ year, month, lat, lng, timezone }) {
    const tbody = document.createElement("tbody");
    const todayStr = new Date().toLocaleDateString('en-GB');

    // Add header row
    tbody.appendChild(createTableRow({ date: 'Date', ...Times }, "head-row"));

    // Calculate date range
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    // Get prayer times for the month
    const times = prayer.getTimesByDate({
        from: startDate,
        to: endDate,
        lat,
        lng,
        timezone,
        format: state.format
    });

    // Add rows for each day
    Object.entries(times).forEach(([dateStr, dayTimes]) => {
        const isToday = todayStr === dateStr;
        tbody.appendChild(
            createTableRow({ date: dateStr, ...dayTimes }, isToday ? "today-row" : "")
        );
    });

    // Update the table
    clearElement(elements.timetable);
    elements.timetable.appendChild(tbody);
}

function createTableRow(items, className) {
    const row = document.createElement("tr");
    row.className = className;

    Object.entries(items).forEach(([key, value]) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        cell.style.width = key === "date" ? "4.5rem" : "4rem";
        row.appendChild(cell);
    });

    return row;
}

function toggleFormat() {
    elements.timeFormat.textContent =
        state.format === '24h' ? '24-hour' : '12-hour';
    update();
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function getMonth(index) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months[index];
}