"use strict";


/*
 * VORLÄUFIGE TESTDATEN
 *
 * Diese Daten werden später durch die API ersetzt.
 * Der Redaktionsbereich wird die Einträge dann
 * erstellen, bearbeiten und löschen können.
 */

const updates = [
    {
        id: 1,
        category: "school",
        title: "Willkommen bei BWBK Aktuell",
        description:
            "Hier erscheinen künftig wichtige Informationen und Neuigkeiten aus unserem Schulalltag.",
        date: "2026-08-12"
    },

    {
        id: 2,
        category: "external",
        title: "Informationen aus Wuppertal",
        description:
            "An dieser Stelle können später externe Veranstaltungen, Bildungsangebote und weitere interessante Hinweise veröffentlicht werden.",
        date: "2026-08-15"
    },

    {
        id: 3,
        category: "date",
        title: "Beispieltermin",
        description:
            "Dieser Termin dient zunächst als Beispiel für die neue Terminübersicht.",
        date: "2026-09-01"
    }
];


function loadUpdates() {
    const schoolContainer =
        document.querySelector("#school-updates");

    const externalContainer =
        document.querySelector("#external-updates");

    const datesContainer =
        document.querySelector("#important-dates");


    const schoolUpdates = updates
        .filter(
            (update) =>
                update.category === "school"
        )
        .sort(sortNewestFirst);


    const externalUpdates = updates
        .filter(
            (update) =>
                update.category === "external"
        )
        .sort(sortNewestFirst);


    const importantDates = updates
        .filter(
            (update) =>
                update.category === "date"
        )
        .sort(sortOldestFirst);


    renderUpdates(
        schoolUpdates,
        schoolContainer
    );

    renderUpdates(
        externalUpdates,
        externalContainer
    );

    renderDates(
        importantDates,
        datesContainer
    );
}


function renderUpdates(updatesToRender, container) {
    if (updatesToRender.length === 0) {
        container.innerHTML = `
            <p class="status-message">
                Momentan gibt es hier
                keine neuen Informationen.
            </p>
        `;

        return;
    }


    container.innerHTML = updatesToRender
        .map((update) => {
            return `
                <article class="update-card">

                    <p class="update-date">
                        ${formatDate(update.date)}
                    </p>

                    <h3 class="update-title">
                        ${escapeHtml(update.title)}
                    </h3>

                    <p class="update-description">
                        ${escapeHtml(update.description)}
                    </p>

                </article>
            `;
        })
        .join("");
}


function renderDates(dates, container) {
    if (dates.length === 0) {
        container.innerHTML = `
            <p class="status-message">
                Momentan sind keine wichtigen
                Termine eingetragen.
            </p>
        `;

        return;
    }


    container.innerHTML = dates
        .map((date) => {
            return `
                <article class="date-row">

                    <div class="date-calendar">
                        <span class="date-day">
                            ${formatDay(date.date)}
                        </span>

                        <span class="date-month">
                            ${formatMonth(date.date)}
                        </span>
                    </div>


                    <div class="date-content">

                        <h3>
                            ${escapeHtml(date.title)}
                        </h3>

                        ${
                            date.description
                                ? `
                                    <p>
                                        ${escapeHtml(date.description)}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                </article>
            `;
        })
        .join("");
}


function sortNewestFirst(first, second) {
    return (
        new Date(second.date) -
        new Date(first.date)
    );
}


function sortOldestFirst(first, second) {
    return (
        new Date(first.date) -
        new Date(second.date)
    );
}


function formatDate(dateString) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        new Date(dateString)
    );
}


function formatDay(dateString) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit"
        }
    ).format(
        new Date(dateString)
    );
}


function formatMonth(dateString) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            month: "short"
        }
    )
        .format(new Date(dateString))
        .replace(".", "")
        .toUpperCase();
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadUpdates();