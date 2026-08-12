"use strict";


const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";


async function loadUpdates() {
    const schoolContainer =
        document.querySelector("#school-updates");

    const externalContainer =
        document.querySelector("#external-updates");

    const datesContainer =
        document.querySelector("#important-dates");


    /*
     * Während die Daten geladen werden,
     * zeigen wir einen kurzen Status an.
     */

    schoolContainer.innerHTML = `
        <p class="status-message">
            Informationen werden geladen …
        </p>
    `;

    externalContainer.innerHTML = `
        <p class="status-message">
            Informationen werden geladen …
        </p>
    `;

    datesContainer.innerHTML = `
        <p class="status-message">
            Termine werden geladen …
        </p>
    `;


    try {
        const response =
            await fetch(
                `${API_URL}/updates`
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        const updates =
            Array.isArray(
                data.updates
            )
                ? data.updates
                : [];


        /*
         * Die Einträge werden anhand ihrer
         * Kategorie auf die drei Bereiche
         * der Seite verteilt.
         */

        const schoolUpdates =
            updates
                .filter(
                    update =>
                        update.category ===
                        "school"
                )
                .sort(
                    sortNewestFirst
                );


        const externalUpdates =
            updates
                .filter(
                    update =>
                        update.category ===
                        "external"
                )
                .sort(
                    sortNewestFirst
                );


        const importantDates =
            updates
                .filter(
                    update =>
                        update.category ===
                        "date"
                )
                .sort(
                    sortOldestFirst
                );


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

    } catch (error) {
        console.error(error);


        schoolContainer.innerHTML = `
            <p class="error-message">
                Die Informationen konnten
                leider nicht geladen werden.
            </p>
        `;


        externalContainer.innerHTML = `
            <p class="error-message">
                Die Informationen konnten
                leider nicht geladen werden.
            </p>
        `;


        datesContainer.innerHTML = `
            <p class="error-message">
                Die Termine konnten
                leider nicht geladen werden.
            </p>
        `;
    }
}


function renderUpdates(
    updatesToRender,
    container
) {
    if (
        updatesToRender.length === 0
    ) {
        container.innerHTML = `
            <p class="status-message">
                Momentan gibt es hier
                keine neuen Informationen.
            </p>
        `;

        return;
    }


    container.innerHTML =
        updatesToRender
            .map(
                update => `
                    <article class="update-card">

                        <div class="update-card-date">
                            <span class="update-card-day">
                                ${formatDay(update.date)}
                            </span>

                            <span class="update-card-month">
                                ${formatMonth(update.date)}
                            </span>

                            <span class="update-card-year">
                                ${formatYear(update.date)}
                            </span>
                        </div>

                        <div class="update-card-content">

                            <h3 class="update-title">
                                ${escapeHtml(update.title)}
                            </h3>

                            ${
                                update.description
                                    ? `
                                        <p class="update-description">
                                            ${escapeHtml(
                                                update.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </article>
                `
            )
            .join("");
}

function renderDates(
    dates,
    container
) {
    if (
        dates.length === 0
    ) {
        container.innerHTML = `
            <p class="status-message">
                Momentan sind keine wichtigen
                Termine eingetragen.
            </p>
        `;

        return;
    }


    container.innerHTML =
        dates
            .map(
                date => `
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
                                            ${escapeHtml(
                                                date.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </article>
                `
            )
            .join("");
}


/*
 * ==========================================
 * SORTIERUNG
 * ==========================================
 */


function sortNewestFirst(
    first,
    second
) {
    return (
        new Date(second.date) -
        new Date(first.date)
    );
}


function sortOldestFirst(
    first,
    second
) {
    return (
        new Date(first.date) -
        new Date(second.date)
    );
}


/*
 * ==========================================
 * DATUM
 * ==========================================
 */


function createLocalDate(
    dateString
) {
    return new Date(
        `${dateString}T00:00:00`
    );
}


function formatDate(
    dateString
) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(
        createLocalDate(
            dateString
        )
    );
}


function formatDay(
    dateString
) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit"
        }
    ).format(
        createLocalDate(
            dateString
        )
    );
}


function formatMonth(
    dateString
) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            month: "short"
        }
    )
        .format(
            createLocalDate(
                dateString
            )
        )
        .replace(".", "")
        .toUpperCase();
}

function formatYear(
    dateString
) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            year: "numeric"
        }
    ).format(
        createLocalDate(
            dateString
        )
    );
}

/*
 * ==========================================
 * SICHERE HTML-AUSGABE
 * ==========================================
 */


function escapeHtml(
    value
) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/*
 * ==========================================
 * START
 * ==========================================
 */


loadUpdates();