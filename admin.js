"use strict";


const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";

const SESSION_STORAGE_KEY =
    "bwbk_admin_session";


const loadingSection =
    document.querySelector("#loading-section");

const setupSection =
    document.querySelector("#setup-section");

const loginSection =
    document.querySelector("#login-section");

const adminSection =
    document.querySelector("#admin-section");

const headerUser =
    document.querySelector("#header-user");

const currentUser =
    document.querySelector("#current-user");


const setupForm =
    document.querySelector("#setup-form");

const setupStatus =
    document.querySelector("#setup-status");


const loginForm =
    document.querySelector("#login-form");

const loginStatus =
    document.querySelector("#login-status");


const logoutButton =
    document.querySelector("#logout-button");

const newIssueButton =
    document.querySelector("#new-issue-button");


const issueEditor =
    document.querySelector("#issue-editor");

const editorTitle =
    document.querySelector("#editor-title");

const issueForm =
    document.querySelector("#issue-form");

const issueNumberInput =
    document.querySelector("#issue-number");

const issueTitleInput =
    document.querySelector("#issue-title");

const issueDescriptionInput =
    document.querySelector("#issue-description");

const publishedAtInput =
    document.querySelector("#published-at");

const issueCoverInput =
    document.querySelector("#issue-cover");

const issuePdfInput =
    document.querySelector("#issue-pdf");

const coverHint =
    document.querySelector("#cover-hint");

const pdfHint =
    document.querySelector("#pdf-hint");

const saveIssueButton =
    document.querySelector("#save-issue-button");

const cancelEditButton =
    document.querySelector("#cancel-edit-button");

const issueStatus =
    document.querySelector("#issue-status");

const issuesList =
    document.querySelector("#issues-list");


let currentIssues = [];
let editingIssueNumber = null;


/*
 * ==========================================
 * SESSION
 * ==========================================
 */


function getSessionToken() {
    return sessionStorage.getItem(
        SESSION_STORAGE_KEY
    );
}


function saveSessionToken(token) {
    sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        token
    );
}


function removeSessionToken() {
    sessionStorage.removeItem(
        SESSION_STORAGE_KEY
    );
}


/*
 * ==========================================
 * UI
 * ==========================================
 */


function showStatus(
    element,
    message,
    type = ""
) {
    element.textContent = message;

    element.className =
        `status ${type}`.trim();

    element.classList.remove(
        "hidden"
    );
}


function hideStatus(element) {
    element.classList.add(
        "hidden"
    );
}


function showMainSection(section) {
    loadingSection.classList.add(
        "hidden"
    );

    setupSection.classList.add(
        "hidden"
    );

    loginSection.classList.add(
        "hidden"
    );

    adminSection.classList.add(
        "hidden"
    );

    headerUser.classList.add(
        "hidden"
    );

    section.classList.remove(
        "hidden"
    );

    if (
        section === adminSection
    ) {
        headerUser.classList.remove(
            "hidden"
        );
    }
}


function formatDate(dateString) {
    return new Intl.DateTimeFormat(
        "de-DE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(
        new Date(
            `${dateString}T00:00:00`
        )
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


/*
 * ==========================================
 * API HELFER
 * ==========================================
 */


function getAuthHeaders() {
    const token =
        getSessionToken();

    if (!token) {
        return {};
    }

    return {
        "Authorization":
            `Bearer ${token}`
    };
}


async function handleUnauthorized(
    response
) {
    if (
        response.status !== 401
    ) {
        return false;
    }

    removeSessionToken();

    showMainSection(
        loginSection
    );

    showStatus(
        loginStatus,
        "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
        "error"
    );

    return true;
}


/*
 * ==========================================
 * AUSGABEN LADEN
 * ==========================================
 */


async function loadIssues() {
    try {
        issuesList.innerHTML = `
            <div class="card loading-card">
                Ausgaben werden geladen …
            </div>
        `;

        const response =
            await fetch(
                `${API_URL}/issues`
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        currentIssues =
            Array.isArray(
                data.issues
            )
                ? data.issues
                : [];

        renderIssues();
    } catch (error) {
        console.error(error);

        issuesList.innerHTML = `
            <div class="card empty-state">
                Die Ausgaben konnten nicht geladen werden.
            </div>
        `;
    }
}


function renderIssues() {
    if (
        currentIssues.length === 0
    ) {
        issuesList.innerHTML = `
            <div class="card empty-state">
                Noch keine Ausgabe veröffentlicht.
            </div>
        `;

        return;
    }

    issuesList.innerHTML =
        currentIssues
            .map(
                issue => `
                    <article class="card issue-card">

                        <img
                            class="issue-cover"
                            src="${escapeHtml(issue.cover)}"
                            alt="Cover von ${escapeHtml(issue.title)}"
                        >

                        <div class="issue-info">

                            <p class="issue-number">
                                Ausgabe ${escapeHtml(issue.number)}
                            </p>

                            <h3>
                                ${escapeHtml(issue.title)}
                            </h3>

                            <p class="issue-date">
                                ${formatDate(issue.publishedAt)}
                            </p>

                            <p class="issue-description">
                                ${escapeHtml(issue.description || "")}
                            </p>

                        </div>

                        <div class="issue-actions">

                            <a
                                class="ghost-button"
                                href="${escapeHtml(issue.pdf)}"
                                target="_blank"
                                rel="noopener"
                            >
                                PDF ansehen
                            </a>

                            <button
                                class="ghost-button edit-issue-button"
                                type="button"
                                data-issue="${escapeHtml(issue.number)}"
                            >
                                Bearbeiten
                            </button>

                            <button
                                class="danger-button delete-issue-button"
                                type="button"
                                data-issue="${escapeHtml(issue.number)}"
                            >
                                Löschen
                            </button>

                        </div>

                    </article>
                `
            )
            .join("");

    bindIssueButtons();
}


function bindIssueButtons() {
    document
        .querySelectorAll(
            ".edit-issue-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        const issueNumber =
                            Number(
                                button.dataset.issue
                            );

                        openEditIssue(
                            issueNumber
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".delete-issue-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        const issueNumber =
                            Number(
                                button.dataset.issue
                            );

                        deleteIssue(
                            issueNumber
                        );
                    }
                );
            }
        );
}


/*
 * ==========================================
 * NEUE AUSGABE
 * ==========================================
 */


function openNewIssue() {
    editingIssueNumber = null;

    issueForm.reset();

    issueNumberInput.disabled =
        false;

    issueCoverInput.required =
        true;

    issuePdfInput.required =
        true;

    editorTitle.textContent =
        "Neue Ausgabe";

    saveIssueButton.textContent =
        "Ausgabe veröffentlichen";

    coverHint.textContent =
        "Cover auswählen.";

    pdfHint.textContent =
        "PDF auswählen.";

    hideStatus(
        issueStatus
    );

    issueEditor.classList.remove(
        "hidden"
    );

    issueNumberInput.focus();

    issueEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
 * ==========================================
 * AUSGABE BEARBEITEN
 * ==========================================
 */


function openEditIssue(
    issueNumber
) {
    const issue =
        currentIssues.find(
            item =>
                Number(
                    item.number
                ) === issueNumber
        );

    if (!issue) {
        return;
    }

    editingIssueNumber =
        issueNumber;

    issueForm.reset();

    issueNumberInput.value =
        issue.number;

    issueNumberInput.disabled =
        true;

    issueTitleInput.value =
        issue.title ?? "";

    issueDescriptionInput.value =
        issue.description ?? "";

    publishedAtInput.value =
        issue.publishedAt ?? "";

    issueCoverInput.required =
        false;

    issuePdfInput.required =
        false;

    editorTitle.textContent =
        `Ausgabe ${issue.number} bearbeiten`;

    saveIssueButton.textContent =
        "Änderungen speichern";

    coverHint.textContent =
        "Optional: neues Cover auswählen. Ohne Auswahl bleibt das aktuelle Cover bestehen.";

    pdfHint.textContent =
        "Optional: neue PDF auswählen. Ohne Auswahl bleibt die aktuelle PDF bestehen.";

    hideStatus(
        issueStatus
    );

    issueEditor.classList.remove(
        "hidden"
    );

    issueTitleInput.focus();

    issueEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closeIssueEditor() {
    editingIssueNumber = null;

    issueForm.reset();

    issueEditor.classList.add(
        "hidden"
    );

    hideStatus(
        issueStatus
    );
}


/*
 * ==========================================
 * SPEICHERN
 * ==========================================
 */


issueForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(
            issueStatus
        );

        const token =
            getSessionToken();

        if (!token) {
            showMainSection(
                loginSection
            );

            return;
        }

        saveIssueButton.disabled =
            true;

        saveIssueButton.textContent =
            editingIssueNumber === null
                ? "Wird veröffentlicht …"
                : "Wird gespeichert …";

        try {
            const formData =
                new FormData(
                    issueForm
                );


            let response;


            /*
             * NEU
             */
            if (
                editingIssueNumber ===
                null
            ) {
                response =
                    await fetch(
                        `${API_URL}/admin/issues`,
                        {
                            method:
                                "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                formData
                        }
                    );
            }


            /*
             * BEARBEITEN
             */
            else {
                response =
                    await fetch(
                        `${API_URL}/admin/issues/${editingIssueNumber}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                formData
                        }
                    );
            }


            if (
                await handleUnauthorized(
                    response
                )
            ) {
                return;
            }


            const data =
                await response.json();


            if (!response.ok) {
                showStatus(
                    issueStatus,
                    data.error ??
                        "Speichern fehlgeschlagen.",
                    "error"
                );

                return;
            }


            showStatus(
                issueStatus,
                editingIssueNumber === null
                    ? `Ausgabe ${data.issue.number} wurde erfolgreich veröffentlicht.`
                    : `Ausgabe ${data.issue.number} wurde erfolgreich aktualisiert.`,
                "success"
            );


            await loadIssues();


            setTimeout(
                () => {
                    closeIssueEditor();
                },
                900
            );

        } catch (error) {
            console.error(error);

            showStatus(
                issueStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );
        } finally {
            saveIssueButton.disabled =
                false;

            saveIssueButton.textContent =
                editingIssueNumber === null
                    ? "Ausgabe veröffentlichen"
                    : "Änderungen speichern";
        }
    }
);


/*
 * ==========================================
 * LÖSCHEN
 * ==========================================
 */


async function deleteIssue(
    issueNumber
) {
    const issue =
        currentIssues.find(
            item =>
                Number(
                    item.number
                ) === issueNumber
        );

    if (!issue) {
        return;
    }


    const confirmed =
        window.confirm(
            `Ausgabe ${issue.number} – "${issue.title}" wirklich löschen?\n\nPDF, Cover und Ausgabedaten werden dauerhaft entfernt.`
        );


    if (!confirmed) {
        return;
    }


    try {
        const response =
            await fetch(
                `${API_URL}/admin/issues/${issueNumber}`,
                {
                    method:
                        "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        if (
            await handleUnauthorized(
                response
            )
        ) {
            return;
        }


        const data =
            await response.json();


        if (!response.ok) {
            window.alert(
                data.error ??
                    "Die Ausgabe konnte nicht gelöscht werden."
            );

            return;
        }


        if (
            editingIssueNumber ===
            issueNumber
        ) {
            closeIssueEditor();
        }


        await loadIssues();

    } catch (error) {
        console.error(error);

        window.alert(
            "Die Verbindung zum Server ist fehlgeschlagen."
        );
    }
}


/*
 * ==========================================
 * LOGIN
 * ==========================================
 */


loginForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(
            loginStatus
        );

        const formData =
            new FormData(
                loginForm
            );

        const username =
            String(
                formData.get(
                    "username"
                ) ?? ""
            ).trim();

        const password =
            String(
                formData.get(
                    "password"
                ) ?? ""
            );


        try {
            const response =
                await fetch(
                    `${API_URL}/admin/login`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                showStatus(
                    loginStatus,
                    data.error ??
                        "Anmeldung fehlgeschlagen.",
                    "error"
                );

                return;
            }


            if (
                !data.sessionToken
            ) {
                showStatus(
                    loginStatus,
                    "Der Server hat keine Sitzung erstellt.",
                    "error"
                );

                return;
            }


            saveSessionToken(
                data.sessionToken
            );


            currentUser.textContent =
                data.username;


            loginForm.reset();


            showMainSection(
                adminSection
            );


            await loadIssues();

        } catch (error) {
            console.error(error);

            showStatus(
                loginStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );
        }
    }
);


/*
 * ==========================================
 * LOGOUT
 * ==========================================
 */


logoutButton.addEventListener(
    "click",
    async () => {
        const token =
            getSessionToken();


        if (token) {
            try {
                await fetch(
                    `${API_URL}/admin/logout`,
                    {
                        method:
                            "POST",

                        headers:
                            getAuthHeaders()
                    }
                );
            } catch (error) {
                console.error(error);
            }
        }


        removeSessionToken();

        currentUser.textContent =
            "";

        closeIssueEditor();

        showMainSection(
            loginSection
        );


        showStatus(
            loginStatus,
            "Du wurdest abgemeldet.",
            "success"
        );
    }
);


/*
 * ==========================================
 * SETUP
 * ==========================================
 */


setupForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(
            setupStatus
        );

        const formData =
            new FormData(
                setupForm
            );

        const username =
            String(
                formData.get(
                    "username"
                ) ?? ""
            ).trim();

        const password =
            String(
                formData.get(
                    "password"
                ) ?? ""
            );

        const passwordRepeat =
            String(
                formData.get(
                    "password_repeat"
                ) ?? ""
            );

        const adminToken =
            String(
                formData.get(
                    "admin_token"
                ) ?? ""
            );


        if (
            password !==
            passwordRepeat
        ) {
            showStatus(
                setupStatus,
                "Die Passwörter stimmen nicht überein.",
                "error"
            );

            return;
        }


        try {
            const response =
                await fetch(
                    `${API_URL}/admin/setup`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body:
                            JSON.stringify({
                                username,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {
                showStatus(
                    setupStatus,
                    data.error ??
                        "Einrichtung fehlgeschlagen.",
                    "error"
                );

                return;
            }


            setupForm.reset();


            showMainSection(
                loginSection
            );


            showStatus(
                loginStatus,
                "Admin-Zugang erstellt. Du kannst dich jetzt anmelden.",
                "success"
            );

        } catch (error) {
            console.error(error);

            showStatus(
                setupStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );
        }
    }
);


/*
 * ==========================================
 * BUTTONS
 * ==========================================
 */


newIssueButton.addEventListener(
    "click",
    openNewIssue
);


cancelEditButton.addEventListener(
    "click",
    closeIssueEditor
);


/*
 * ==========================================
 * START
 * ==========================================
 */


async function checkSession() {
    const token =
        getSessionToken();

    if (!token) {
        showMainSection(
            loginSection
        );

        return;
    }


    try {
        const response =
            await fetch(
                `${API_URL}/admin/me`,
                {
                    method:
                        "GET",

                    headers:
                        getAuthHeaders()
                }
            );


        if (!response.ok) {
            removeSessionToken();

            showMainSection(
                loginSection
            );

            return;
        }


        const data =
            await response.json();


        currentUser.textContent =
            data.username;


        showMainSection(
            adminSection
        );


        await loadIssues();

    } catch (error) {
        console.error(error);

        showMainSection(
            loginSection
        );


        showStatus(
            loginStatus,
            "Der Redaktionsbereich konnte nicht geladen werden.",
            "error"
        );
    }
}


async function initializeAdminPage() {
    try {
        const response =
            await fetch(
                `${API_URL}/admin/setup-status`
            );


        const data =
            await response.json();


        if (
            data.setupRequired
        ) {
            removeSessionToken();

            showMainSection(
                setupSection
            );

            return;
        }


        await checkSession();

    } catch (error) {
        console.error(error);

        showMainSection(
            loginSection
        );


        showStatus(
            loginStatus,
            "Der Redaktionsbereich konnte nicht geladen werden.",
            "error"
        );
    }
}


initializeAdminPage();