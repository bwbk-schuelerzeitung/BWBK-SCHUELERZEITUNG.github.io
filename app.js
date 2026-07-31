"use strict";

const DATA_URL = "./data/ausgaben.json";

async function loadIssues() {
    const currentContainer = document.querySelector("#current-issue");
    const archiveContainer = document.querySelector("#archive");

    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `Ausgaben konnten nicht geladen werden: ${response.status}`
            );
        }

        const issues = await response.json();

        if (!Array.isArray(issues) || issues.length === 0) {
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

        const sortedIssues = [...issues].sort(
            (first, second) =>
                new Date(second.publishedAt) -
                new Date(first.publishedAt)
        );

        renderCurrentIssue(
            sortedIssues[0],
            currentContainer
        );

        renderArchive(
            sortedIssues.slice(1),
            archiveContainer
        );
    } catch (error) {
        console.error(error);

        currentContainer.innerHTML = `
            <p class="error-message">
                Die Ausgaben konnten leider nicht geladen werden.
            </p>
        `;

        archiveContainer.innerHTML = "";
    }
}

function renderCurrentIssue(issue, container) {
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
                    Ausgabe ${escapeHtml(String(issue.number))}
                </p>

                <h3 class="issue-title">
                    ${escapeHtml(issue.title)}
                </h3>

                <p class="issue-date">
                    ${formatDate(issue.publishedAt)}
                </p>

                <p class="issue-description">
                    ${escapeHtml(issue.description)}
                </p>

                <a
                    class="primary-button"
                    href="${createReaderUrl(issue)}"
                >
                    Ausgabe lesen
                </a>
            </div>
        </article>
    `;
}

function renderArchive(issues, container) {
    if (issues.length === 0) {
        container.innerHTML = `
            <p class="status-message">
                Das Archiv ist noch leer.
            </p>
        `;

        return;
    }

    container.innerHTML = issues
        .map(
            (issue) => `
                <article class="archive-card">
                    <div class="archive-cover">
                        <img
                            src="${escapeHtml(issue.cover)}"
                            alt="Titelbild: ${escapeHtml(issue.title)}"
                            loading="lazy"
                        >
                    </div>

                    <div class="archive-content">
                        <h3>
                            ${escapeHtml(issue.title)}
                        </h3>

                        <p>
                            Ausgabe ${escapeHtml(String(issue.number))}
                            · ${formatDate(issue.publishedAt)}
                        </p>

                        <a
                            class="archive-button"
                            href="${createReaderUrl(issue)}"
                        >
                            Ausgabe öffnen →
                        </a>
                    </div>
                </article>
            `
        )
        .join("");
}

function createReaderUrl(issue) {
    const params = new URLSearchParams({
        pdf: issue.pdf,
        title: issue.title
    });

    return `lesen.html?${params.toString()}`;
}

function formatDate(dateString) {
    return new Intl.DateTimeFormat("de-DE", {
        month: "long",
        year: "numeric"
    }).format(new Date(dateString));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadIssues();