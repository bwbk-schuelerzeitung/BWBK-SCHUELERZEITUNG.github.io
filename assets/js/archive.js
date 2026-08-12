"use strict";

const DATA_URL =
    "https://bwbk-api.roniiminimal.workers.dev/issues";


async function loadArchive() {
    const archiveContainer =
        document.querySelector("#archive");

    try {
        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `Ausgaben konnten nicht geladen werden: ${response.status}`
            );
        }

        const data = await response.json();
        const issues = data.issues;

        if (
            !Array.isArray(issues) ||
            issues.length === 0
        ) {
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

        renderArchive(
            sortedIssues,
            archiveContainer
        );

        /*
         * Meldet views.js, dass die dynamischen
         * Ausgaben jetzt im HTML vorhanden sind.
         */
        document.dispatchEvent(
            new CustomEvent("issuesRendered")
        );

    } catch (error) {
        console.error(error);

        archiveContainer.innerHTML = `
            <p class="error-message">
                Die Ausgaben konnten leider
                nicht geladen werden.
            </p>
        `;
    }
}


function renderArchive(issues, container) {
    container.innerHTML = issues
        .map((issue) => {

            const issueNumber = escapeHtml(
                String(issue.number)
            );

            const readerUrl =
                createReaderUrl(issue);

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
        })
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
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            month: "long",
            year: "numeric"
        }
    ).format(
        new Date(dateString)
    );
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadArchive();