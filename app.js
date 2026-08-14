"use strict";


const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";

const ISSUES_URL =
    `${API_URL}/issues`;

const GALLERY_URL =
    `${API_URL}/gallery`;


/*
 * ==========================================
 * AUSGABEN LADEN
 * ==========================================
 */

async function loadIssues() {
    const currentContainer =
        document.querySelector(
            "#current-issue"
        );

    const archiveContainer =
        document.querySelector(
            "#archive"
        );


    if (
        !currentContainer ||
        !archiveContainer
    ) {
        return;
    }


    try {
        const response =
            await fetch(
                ISSUES_URL
            );


        if (!response.ok) {
            throw new Error(
                `Ausgaben konnten nicht geladen werden: ${response.status}`
            );
        }


        const data =
            await response.json();


        const issues =
            Array.isArray(
                data.issues
            )
                ? data.issues
                : [];


        if (
            issues.length === 0
        ) {
            currentContainer.innerHTML = `
                <p class="status-message">
                    Momentan ist noch keine Ausgabe veröffentlicht.
                </p>
            `;


            archiveContainer.innerHTML = `
                <p class="status-message">
                    Das Archiv ist noch leer.
                </p>
            `;

            return;
        }


        const sortedIssues =
            [...issues].sort(
                (
                    first,
                    second
                ) =>
                    new Date(
                        second.publishedAt
                    ) -
                    new Date(
                        first.publishedAt
                    )
            );


        renderCurrentIssue(
            sortedIssues[0],
            currentContainer
        );


        renderArchive(
            sortedIssues.slice(
                1,
                4
            ),
            archiveContainer
        );


        /*
         * Meldet views.js,
         * dass die dynamischen Ausgaben
         * jetzt im HTML vorhanden sind.
         */

        document.dispatchEvent(
            new CustomEvent(
                "issuesRendered"
            )
        );

    } catch (error) {
        console.error(
            error
        );


        currentContainer.innerHTML = `
            <p class="error-message">
                Die Ausgaben konnten leider nicht geladen werden.
            </p>
        `;


        archiveContainer.innerHTML =
            "";
    }
}


/*
 * ==========================================
 * AKTUELLE AUSGABE
 * ==========================================
 */

function renderCurrentIssue(
    issue,
    container
) {
    const issueNumber =
        escapeHtml(
            String(
                issue.number
            )
        );


    container.innerHTML = `
        <article class="current-card">

            <div class="cover-wrapper">

                <img
                    class="cover-image"
                    src="${escapeHtml(issue.cover)}"
                    alt="Titelbild: ${escapeHtml(issue.title)}"
                >

            </div>


            <div class="issue-content">

                <p class="issue-number">
                    Ausgabe ${issueNumber}
                </p>

                <h3 class="issue-title">
                    ${escapeHtml(issue.title)}
                </h3>

                <p class="issue-date">
                    ${formatDate(issue.publishedAt)}
                </p>

                <p
                    class="issue-views"
                    data-view-count="${issueNumber}"
                    hidden
                ></p>

                <p class="issue-description">
                    ${escapeHtml(
                        issue.description || ""
                    )}
                </p>

                <a
                    class="primary-button"
                    href="${createReaderUrl(issue)}"
                    data-count-view="${issueNumber}"
                >
                    Ausgabe lesen
                </a>

            </div>

        </article>
    `;
}


/*
 * ==========================================
 * ARCHIV-VORSCHAU
 * ==========================================
 */

function renderArchive(
    issues,
    container
) {
    if (
        issues.length === 0
    ) {
        container.innerHTML = `
            <p class="status-message">
                Das Archiv ist noch leer.
            </p>
        `;

        return;
    }


    container.innerHTML =
        issues
            .map(
                issue => {
                    const issueNumber =
                        escapeHtml(
                            String(
                                issue.number
                            )
                        );


                    const readerUrl =
                        createReaderUrl(
                            issue
                        );


                    return `
                        <a
                            class="archive-row"
                            href="${readerUrl}"
                            data-count-view="${issueNumber}"
                        >

                            <div class="archive-row-cover">

                                <img
                                    src="${escapeHtml(issue.cover)}"
                                    alt="Titelbild: ${escapeHtml(issue.title)}"
                                    loading="lazy"
                                >

                            </div>


                            <div class="archive-row-content">

                                <p class="archive-row-number">
                                    Ausgabe ${issueNumber}
                                </p>

                                <h3>
                                    ${escapeHtml(issue.title)}
                                </h3>

                                <p class="archive-row-meta">
                                    ${formatDate(issue.publishedAt)}
                                </p>

                                <p
                                    class="archive-views"
                                    data-view-count="${issueNumber}"
                                    hidden
                                ></p>

                            </div>


                            <div
                                class="archive-row-arrow"
                                aria-hidden="true"
                            >
                                →
                            </div>

                        </a>
                    `;
                }
            )
            .join("");


    container.insertAdjacentHTML(
        "beforeend",
        `
            <div class="archive-all-link-wrapper">

                <a
                    class="archive-all-link"
                    href="assets/html/archiv.html"
                >
                    Alle Ausgaben ansehen →
                </a>

            </div>
        `
    );
}


/*
 * ==========================================
 * GALERIE-VORSCHAU
 * ==========================================
 */

async function loadHomeGalleryPreview() {
    const container =
        document.querySelector(
            "#home-gallery-preview"
        );


    if (!container) {
        return;
    }


    try {
        const response =
            await fetch(
                GALLERY_URL
            );


        if (!response.ok) {
            throw new Error(
                `Galerie konnte nicht geladen werden: ${response.status}`
            );
        }


        const data =
            await response.json();


        const gallery =
            Array.isArray(
                data.gallery
            )
                ? data.gallery.slice(
                    0,
                    3
                )
                : [];


        if (
            gallery.length === 0
        ) {
            container.innerHTML = `
                <p class="status-message">
                    Momentan sind noch keine Bilder veröffentlicht.
                </p>
            `;

            return;
        }


        container.innerHTML =
            gallery
                .map(
                    item => `
                        <a
                            class="home-gallery-card"
                            href="assets/html/galerie.html"
                            aria-label="Galerie öffnen: ${escapeHtml(item.title)}"
                        >

                            <img
                                src="${escapeHtml(item.image)}"
                                alt="${escapeHtml(item.title)}"
                                loading="lazy"
                            >

                            <div class="home-gallery-card-overlay">

                                <span>
                                    ${escapeHtml(item.title)}
                                </span>

                            </div>

                        </a>
                    `
                )
                .join("");

    } catch (error) {
        console.error(
            error
        );


        container.innerHTML = `
            <p class="error-message">
                Die Galerie konnte leider nicht geladen werden.
            </p>
        `;
    }
}


/*
 * ==========================================
 * READER
 * ==========================================
 */

function createReaderUrl(
    issue
) {
    const params =
        new URLSearchParams({
            pdf:
                issue.pdf,

            title:
                issue.title
        });


    return (
        `lesen.html?${params.toString()}`
    );
}


/*
 * ==========================================
 * DATUM
 * ==========================================
 */

function formatDate(
    dateString
) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            month:
                "long",

            year:
                "numeric"
        }
    ).format(
        new Date(
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
    return String(
        value
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/*
 * ==========================================
 * START
 * ==========================================
 */

loadIssues();

loadHomeGalleryPreview();