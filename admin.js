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

    /*
 * ==========================================
 * ADMIN-NAVIGATION
 * ==========================================
 */

const issuesTab =
    document.querySelector("#issues-tab");

const updatesTab =
    document.querySelector("#updates-tab");

const issuesPanel =
    document.querySelector("#issues-panel");

const updatesPanel =
    document.querySelector("#updates-panel");

const adminTab =
    document.querySelector("#admin-tab");

const adminPanel =
    document.querySelector("#admin-panel");

const newUserButton =
    document.querySelector("#new-user-button");

const usersList =
    document.querySelector("#users-list");
    
const userEditor =
    document.querySelector("#user-editor");

const userForm =
    document.querySelector("#user-form");

const userUsernameInput =
    document.querySelector("#user-username");

const userRoleInput =
    document.querySelector("#user-role");

const userPasswordInput =
    document.querySelector("#user-password");

const userPasswordRepeatInput =
    document.querySelector("#user-password-repeat");

const saveUserButton =
    document.querySelector("#save-user-button");

const cancelUserButton =
    document.querySelector("#cancel-user-button");

const userStatus =
    document.querySelector("#user-status");

const temporaryPasswordBox =
    document.querySelector("#temporary-password-box");

const temporaryPasswordUser =
    document.querySelector("#temporary-password-user");

const temporaryPasswordValue =
    document.querySelector("#temporary-password-value");

const closeTemporaryPasswordButton =
    document.querySelector("#close-temporary-password");    


/*
 * ==========================================
 * AKTUELLES & TERMINE
 * ==========================================
 */

const newUpdateButton =
    document.querySelector("#new-update-button");

const updateEditor =
    document.querySelector("#update-editor");

const updateEditorTitle =
    document.querySelector("#update-editor-title");

const updateForm =
    document.querySelector("#update-form");

const updateCategoryInput =
    document.querySelector("#update-category");

const updateTitleInput =
    document.querySelector("#update-title");

const updateDescriptionInput =
    document.querySelector("#update-description");

const updateDateInput =
    document.querySelector("#update-date");

const updatePublishedInput =
    document.querySelector("#update-published");

const saveUpdateButton =
    document.querySelector("#save-update-button");

const cancelUpdateButton =
    document.querySelector("#cancel-update-button");

const updateStatus =
    document.querySelector("#update-status");

const updatesList =
    document.querySelector("#updates-list");


let currentIssues = [];
let editingIssueNumber = null;
let currentUpdates = [];
let editingUpdateId = null;
let currentRole = null;
let currentUsers = [];

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
 * ADMIN-TABS
 * ==========================================
 */

function showAdminPanel(panel) {
    /*
     * Alle Panels ausblenden
     */
    issuesPanel.classList.add(
        "hidden"
    );

    updatesPanel.classList.add(
        "hidden"
    );

    adminPanel.classList.add(
        "hidden"
    );


    /*
     * Alle Tabs deaktivieren
     */
    issuesTab.classList.remove(
        "active"
    );

    updatesTab.classList.remove(
        "active"
    );

    adminTab.classList.remove(
        "active"
    );


    /*
     * Gewünschtes Panel anzeigen
     */
    panel.classList.remove(
        "hidden"
    );


    /*
     * Passenden Tab aktivieren
     */
    if (
        panel === issuesPanel
    ) {
        issuesTab.classList.add(
            "active"
        );

        return;
    }


    if (
        panel === updatesPanel
    ) {
        updatesTab.classList.add(
            "active"
        );

        loadUpdates();

        return;
    }


    if (
        panel === adminPanel
    ) {
        adminTab.classList.add(
            "active"
        );

        loadUsers();

        return;
    }
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
 * AKTUELLES & TERMINE LADEN
 * ==========================================
 */

async function loadUpdates() {
    try {
        updatesList.innerHTML = `
            <div class="card loading-card">
                Einträge werden geladen …
            </div>
        `;


        const response =
            await fetch(
                `${API_URL}/admin/updates`,
                {
                    method: "GET",
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


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        currentUpdates =
            Array.isArray(
                data.updates
            )
                ? data.updates
                : [];


        renderUpdates();

    } catch (error) {
        console.error(error);

        updatesList.innerHTML = `
            <div class="card empty-state">
                Die Einträge konnten nicht geladen werden.
            </div>
        `;
    }
}


/*
 * ==========================================
 * AKTUELLES RENDERN
 * ==========================================
 */

function renderUpdates() {
    if (
        currentUpdates.length === 0
    ) {
        updatesList.innerHTML = `
            <div class="card empty-state">
                Noch keine Einträge vorhanden.
            </div>
        `;

        return;
    }


    updatesList.innerHTML =
        currentUpdates
            .map(
                update => `
                    <article class="card update-admin-card">

                        <div class="update-admin-info">

                            <span class="update-badge">
                                ${escapeHtml(
                                    getUpdateCategoryLabel(
                                        update.category
                                    )
                                )}
                            </span>

                            ${
                                !update.isPublished
                                    ? `
                                        <span class="update-badge draft">
                                            Entwurf
                                        </span>
                                    `
                                    : ""
                            }

                            <p class="update-admin-meta">
                                ${formatDate(update.date)}
                            </p>

                            <h3>
                                ${escapeHtml(update.title)}
                            </h3>

                            <p class="update-admin-description">
                                ${escapeHtml(
                                    update.description || ""
                                )}
                            </p>

                        </div>


                        <div class="update-admin-actions">

                            <button
                                class="ghost-button edit-update-button"
                                type="button"
                                data-update="${escapeHtml(update.id)}"
                            >
                                Bearbeiten
                            </button>

                            <button
                                class="danger-button delete-update-button"
                                type="button"
                                data-update="${escapeHtml(update.id)}"
                            >
                                Löschen
                            </button>

                        </div>

                    </article>
                `
            )
            .join("");


    bindUpdateButtons();
}


function getUpdateCategoryLabel(
    category
) {
    switch (category) {
        case "school":
            return "Aus der Schule";

        case "external":
            return "Rund um Schule & Bildung";

        case "date":
            return "Wichtiger Termin";

        default:
            return "Sonstiges";
    }
}


/*
 * ==========================================
 * BUTTONS DER EINTRÄGE
 * ==========================================
 */

function bindUpdateButtons() {
    document
        .querySelectorAll(
            ".edit-update-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        openEditUpdate(
                            Number(
                                button.dataset.update
                            )
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".delete-update-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        deleteUpdate(
                            Number(
                                button.dataset.update
                            )
                        );
                    }
                );
            }
        );
}


/*
 * ==========================================
 * NEUER EINTRAG
 * ==========================================
 */

function openNewUpdate() {
    editingUpdateId = null;

    updateForm.reset();

    updateCategoryInput.value =
        "school";

    updatePublishedInput.checked =
        true;

    updateEditorTitle.textContent =
        "Neuer Eintrag";

    saveUpdateButton.textContent =
        "Eintrag veröffentlichen";

    hideStatus(
        updateStatus
    );

    updateEditor.classList.remove(
        "hidden"
    );

    updateTitleInput.focus();


    updateEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
 * ==========================================
 * EINTRAG BEARBEITEN
 * ==========================================
 */

function openEditUpdate(
    updateId
) {
    const update =
        currentUpdates.find(
            item =>
                Number(item.id) ===
                updateId
        );


    if (!update) {
        return;
    }


    editingUpdateId =
        updateId;


    updateForm.reset();


    updateCategoryInput.value =
        update.category;

    updateTitleInput.value =
        update.title ?? "";

    updateDescriptionInput.value =
        update.description ?? "";

    updateDateInput.value =
        update.date ?? "";

    updatePublishedInput.checked =
        Boolean(
            update.isPublished
        );


    updateEditorTitle.textContent =
        "Eintrag bearbeiten";


    saveUpdateButton.textContent =
        "Änderungen speichern";


    hideStatus(
        updateStatus
    );


    updateEditor.classList.remove(
        "hidden"
    );


    updateTitleInput.focus();


    updateEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closeUpdateEditor() {
    editingUpdateId = null;

    updateForm.reset();

    updateEditor.classList.add(
        "hidden"
    );

    hideStatus(
        updateStatus
    );
}


/*
 * ==========================================
 * EINTRAG SPEICHERN
 * ==========================================
 */

updateForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();


        hideStatus(
            updateStatus
        );


        const token =
            getSessionToken();


        if (!token) {
            showMainSection(
                loginSection
            );

            return;
        }


        const payload = {
            category:
                updateCategoryInput.value,

            title:
                updateTitleInput.value
                    .trim(),

            description:
                updateDescriptionInput.value
                    .trim(),

            date:
                updateDateInput.value,

            isPublished:
                updatePublishedInput.checked
        };


        saveUpdateButton.disabled =
            true;


        saveUpdateButton.textContent =
            editingUpdateId === null
                ? "Wird veröffentlicht …"
                : "Wird gespeichert …";


        try {
            let response;


            if (
                editingUpdateId === null
            ) {
                response =
                    await fetch(
                        `${API_URL}/admin/updates`,
                        {
                            method:
                                "POST",

                            headers: {
                                ...getAuthHeaders(),

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );
            } else {
                response =
                    await fetch(
                        `${API_URL}/admin/updates/${editingUpdateId}`,
                        {
                            method:
                                "PUT",

                            headers: {
                                ...getAuthHeaders(),

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
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
                    updateStatus,
                    data.error ??
                        "Speichern fehlgeschlagen.",
                    "error"
                );

                return;
            }


            showStatus(
                updateStatus,
                editingUpdateId === null
                    ? "Eintrag wurde erfolgreich erstellt."
                    : "Eintrag wurde erfolgreich aktualisiert.",
                "success"
            );


            await loadUpdates();


            setTimeout(
                () => {
                    closeUpdateEditor();
                },
                900
            );

        } catch (error) {
            console.error(error);


            showStatus(
                updateStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );

        } finally {
            saveUpdateButton.disabled =
                false;


            saveUpdateButton.textContent =
                editingUpdateId === null
                    ? "Eintrag veröffentlichen"
                    : "Änderungen speichern";
        }
    }
);


/*
 * ==========================================
 * EINTRAG LÖSCHEN
 * ==========================================
 */

async function deleteUpdate(
    updateId
) {
    const update =
        currentUpdates.find(
            item =>
                Number(item.id) ===
                updateId
        );


    if (!update) {
        return;
    }


    const confirmed =
        window.confirm(
            `"${update.title}" wirklich löschen?\n\nDer Eintrag wird dauerhaft entfernt.`
        );


    if (!confirmed) {
        return;
    }


    try {
        const response =
            await fetch(
                `${API_URL}/admin/updates/${updateId}`,
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
                    "Der Eintrag konnte nicht gelöscht werden."
            );

            return;
        }


        if (
            editingUpdateId ===
            updateId
        ) {
            closeUpdateEditor();
        }


        await loadUpdates();

    } catch (error) {
        console.error(error);


        window.alert(
            "Die Verbindung zum Server ist fehlgeschlagen."
        );
    }
}

/*
 * ==========================================
 * BENUTZERVERWALTUNG
 * ==========================================
 */


/*
 * BENUTZER LADEN
 */

async function loadUsers() {
    if (
        currentRole !== "admin"
    ) {
        return;
    }

    try {
        usersList.innerHTML = `
            <div class="card loading-card">
                Benutzer werden geladen …
            </div>
        `;

        const response =
            await fetch(
                `${API_URL}/admin/users`,
                {
                    method: "GET",
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
            usersList.innerHTML = `
                <div class="card empty-state">
                    ${escapeHtml(
                        data.error ??
                        "Benutzer konnten nicht geladen werden."
                    )}
                </div>
            `;

            return;
        }

        currentUsers =
            Array.isArray(
                data.users
            )
                ? data.users
                : [];

        renderUsers();

    } catch (error) {
        console.error(error);

        usersList.innerHTML = `
            <div class="card empty-state">
                Benutzer konnten nicht geladen werden.
            </div>
        `;
    }
}


/*
 * BENUTZER ANZEIGEN
 */

function renderUsers() {
    if (
        currentUsers.length === 0
    ) {
        usersList.innerHTML = `
            <div class="card empty-state">
                Noch keine Benutzer vorhanden.
            </div>
        `;

        return;
    }

    usersList.innerHTML =
        currentUsers
            .map(
                user => `
                    <article class="card user-admin-card">

                        <div class="user-admin-info">

                            <h3>
                                ${escapeHtml(
                                    user.username
                                )}
                            </h3>

                            <p class="user-admin-meta">
                                Benutzer-ID:
                                ${escapeHtml(
                                    user.id
                                )}
                            </p>

                            <span
                                class="user-role-badge ${
                                    user.role === "admin"
                                        ? "admin"
                                        : ""
                                }"
                            >
                                ${
                                    user.role === "admin"
                                        ? "Administrator"
                                        : "Projektteilnehmer"
                                }
                            </span>

                        </div>


                        <div class="user-admin-actions">

                            <button
                                class="ghost-button change-role-button"
                                type="button"
                                data-user="${escapeHtml(user.id)}"
                            >
                                Rolle ändern
                            </button>

                            <button
                                class="ghost-button reset-password-button"
                                type="button"
                                data-user="${escapeHtml(user.id)}"
                            >
                                Passwort zurücksetzen
                            </button>

                            <button
                                class="danger-button delete-user-button"
                                type="button"
                                data-user="${escapeHtml(user.id)}"
                            >
                                Löschen
                            </button>

                        </div>

                    </article>
                `
            )
            .join("");

    bindUserButtons();
}


/*
 * BENUTZER-BUTTONS VERKNÜPFEN
 */

function bindUserButtons() {
    document
        .querySelectorAll(
            ".change-role-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        changeUserRole(
                            Number(
                                button.dataset.user
                            )
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            ".reset-password-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        resetUserPassword(
                            Number(
                                button.dataset.user
                            )
                        );
                    }
                );
            }
        );

    document
        .querySelectorAll(
            ".delete-user-button"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {
                        deleteUser(
                            Number(
                                button.dataset.user
                            )
                        );
                    }
                );
            }
        );
}


/*
 * FORMULAR FÜR NEUEN BENUTZER ÖFFNEN
 */

function openNewUser() {
    userForm.reset();

    userRoleInput.value =
        "member";

    hideStatus(
        userStatus
    );

    temporaryPasswordBox.classList.add(
        "hidden"
    );

    userEditor.classList.remove(
        "hidden"
    );

    userUsernameInput.focus();

    userEditor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
 * BENUTZERFORMULAR SCHLIESSEN
 */

function closeUserEditor() {
    userForm.reset();

    userEditor.classList.add(
        "hidden"
    );

    hideStatus(
        userStatus
    );
}


/*
 * BENUTZER ERSTELLEN
 */

userForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(
            userStatus
        );

        const username =
            userUsernameInput.value
                .trim();

        const role =
            userRoleInput.value;

        const password =
            userPasswordInput.value;

        const passwordRepeat =
            userPasswordRepeatInput.value;

        if (
            password !==
            passwordRepeat
        ) {
            showStatus(
                userStatus,
                "Die Passwörter stimmen nicht überein.",
                "error"
            );

            return;
        }

        saveUserButton.disabled =
            true;

        saveUserButton.textContent =
            "Wird erstellt …";

        try {
            const response =
                await fetch(
                    `${API_URL}/admin/users`,
                    {
                        method: "POST",

                        headers: {
                            ...getAuthHeaders(),

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                password,
                                role
                            })
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
                showStatus(
                    userStatus,
                    data.error ??
                        "Benutzer konnte nicht erstellt werden.",
                    "error"
                );

                return;
            }

            showStatus(
                userStatus,
                `Benutzer "${data.user.username}" wurde erstellt.`,
                "success"
            );

            await loadUsers();

            setTimeout(
                () => {
                    closeUserEditor();
                },
                900
            );

        } catch (error) {
            console.error(error);

            showStatus(
                userStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );

        } finally {
            saveUserButton.disabled =
                false;

            saveUserButton.textContent =
                "Benutzer erstellen";
        }
    }
);


/*
 * ROLLE ÄNDERN
 */

async function changeUserRole(
    userId
) {
    const user =
        currentUsers.find(
            item =>
                Number(item.id) ===
                userId
        );

    if (!user) {
        return;
    }

    const newRole =
        user.role === "admin"
            ? "member"
            : "admin";

    const roleLabel =
        newRole === "admin"
            ? "Administrator"
            : "Projektteilnehmer";

    const confirmed =
        window.confirm(
            `"${user.username}" wirklich zu "${roleLabel}" ändern?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/admin/users/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        ...getAuthHeaders(),

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            role:
                                newRole
                        })
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
                    "Die Rolle konnte nicht geändert werden."
            );

            return;
        }

        await loadUsers();

    } catch (error) {
        console.error(error);

        window.alert(
            "Die Verbindung zum Server ist fehlgeschlagen."
        );
    }
}


/*
 * PASSWORT ZURÜCKSETZEN
 */

async function resetUserPassword(
    userId
) {
    const user =
        currentUsers.find(
            item =>
                Number(item.id) ===
                userId
        );

    if (!user) {
        return;
    }

    const confirmed =
        window.confirm(
            `Passwort von "${user.username}" wirklich zurücksetzen?`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/admin/users/${userId}/reset-password`,
                {
                    method: "POST",
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
                    "Das Passwort konnte nicht zurückgesetzt werden."
            );

            return;
        }

        temporaryPasswordUser.textContent =
            data.username;

        temporaryPasswordValue.textContent =
            data.temporaryPassword;

        temporaryPasswordBox.classList.remove(
            "hidden"
        );

        temporaryPasswordBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {
        console.error(error);

        window.alert(
            "Die Verbindung zum Server ist fehlgeschlagen."
        );
    }
}


/*
 * BENUTZER LÖSCHEN
 */

async function deleteUser(
    userId
) {
    const user =
        currentUsers.find(
            item =>
                Number(item.id) ===
                userId
        );

    if (!user) {
        return;
    }

    const confirmed =
        window.confirm(
            `Benutzer "${user.username}" wirklich löschen?\n\nDer Zugang wird dauerhaft entfernt.`
        );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/admin/users/${userId}`,
                {
                    method: "DELETE",
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
                    "Der Benutzer konnte nicht gelöscht werden."
            );

            return;
        }

        await loadUsers();

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

        currentRole = null;

        adminTab.classList.add(
            "hidden"
        );    

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

issuesTab.addEventListener(
    "click",
    () => {
        showAdminPanel(
            issuesPanel
        );
    }
);


updatesTab.addEventListener(
    "click",
    () => {
        showAdminPanel(
            updatesPanel
        );
    }
);


newUpdateButton.addEventListener(
    "click",
    openNewUpdate
);


cancelUpdateButton.addEventListener(
    "click",
    closeUpdateEditor
);

adminTab.addEventListener(
    "click",
    () => {
        if (
            currentRole !== "admin"
        ) {
            return;
        }

        showAdminPanel(
            adminPanel
        );
    }
);

newUserButton.addEventListener(
    "click",
    openNewUser
);


cancelUserButton.addEventListener(
    "click",
    closeUserEditor
);


closeTemporaryPasswordButton.addEventListener(
    "click",
    () => {
        temporaryPasswordBox.classList.add(
            "hidden"
        );

        temporaryPasswordUser.textContent =
            "";

        temporaryPasswordValue.textContent =
            "";
    }
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
            currentRole = data.role;

            if (
    currentRole === "admin"
) {
    adminTab.classList.remove(
        "hidden"
    );
} else {
    adminTab.classList.add(
        "hidden"
    );
}


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