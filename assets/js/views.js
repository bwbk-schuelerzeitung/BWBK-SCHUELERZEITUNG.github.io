const VIEWS_API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";

async function loadIssueViews() {
    try {
        const response = await fetch(
            `${VIEWS_API_URL}/views`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Aufrufzahlen konnten nicht geladen werden: ${response.status}`
            );
        }

        const views = await response.json();

        document
            .querySelectorAll("[data-view-count]")
            .forEach((element) => {
                const issueNumber =
                    element.dataset.viewCount;

                const count =
                    Number(views[issueNumber]) || 0;

                element.textContent =
                    formatViewCount(count);

                element.hidden = false;
            });
    } catch (error) {
        console.warn(error);

        /*
         * Wenn der Zähler ausfällt, bleibt die Seite
         * trotzdem vollständig benutzbar.
         */
        document
            .querySelectorAll("[data-view-count]")
            .forEach((element) => {
                element.hidden = true;
            });
    }
}

function formatViewCount(count) {
    const formattedCount =
        new Intl.NumberFormat("de-DE").format(count);

    return `${formattedCount} ${
        count === 1 ? "Aufruf" : "Aufrufe"
    }`;
}

function countIssueView(issueNumber) {
    if (!issueNumber) {
        return;
    }

    /*
     * keepalive sorgt dafür, dass der Browser die
     * Anfrage beim direkten Wechsel zum Reader
     * möglichst noch zu Ende sendet.
     */
    fetch(
        `${VIEWS_API_URL}/views/${issueNumber}`,
        {
            method: "POST",
            keepalive: true
        }
    ).catch((error) => {
        console.warn(
            "Aufruf konnte nicht gezählt werden:",
            error
        );
    });
}

document.addEventListener("click", (event) => {
    const issueLink =
        event.target.closest("[data-count-view]");

    if (!issueLink) {
        return;
    }

    const issueNumber =
        issueLink.dataset.countView;

    countIssueView(issueNumber);
});

document.addEventListener(
    "issuesRendered",
    loadIssueViews
);