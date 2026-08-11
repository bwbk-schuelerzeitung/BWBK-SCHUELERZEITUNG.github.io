"use strict";

const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";

const loadingSection =
    document.querySelector("#loading-section");

const loginSection =
    document.querySelector("#login-section");

const adminSection =
    document.querySelector("#admin-section");

const loginForm =
    document.querySelector("#login-form");

const loginStatus =
    document.querySelector("#login-status");

const issueForm =
    document.querySelector("#issue-form");

const issueStatus =
    document.querySelector("#issue-status");

const currentUser =
    document.querySelector("#current-user");

const publishButton =
    document.querySelector("#publish-button");

const logoutButton =
    document.querySelector("#logout-button");

const setupSection =
    document.querySelector("#setup-section");

const setupForm =
    document.querySelector("#setup-form");

const setupStatus =
    document.querySelector("#setup-status");


function showSection(section) {
    loadingSection.classList.add("hidden");
    setupSection.classList.add("hidden");
    loginSection.classList.add("hidden");
    adminSection.classList.add("hidden");

    section.classList.remove("hidden");
}


function showStatus(element, message, type = "") {
    element.textContent = message;

    element.className =
        `status ${type}`.trim();

    element.classList.remove("hidden");
}


function hideStatus(element) {
    element.classList.add("hidden");
}


async function checkSession() {
    try {
        const response =
            await fetch(
                `${API_URL}/admin/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {
            showSection(loginSection);
            return;
        }

        const data =
            await response.json();

        currentUser.textContent =
            data.username;

        showSection(adminSection);
    } catch (error) {
        console.error(error);

        showSection(loginSection);

        showStatus(
            loginStatus,
            "Die Verbindung zum Server ist fehlgeschlagen.",
            "error"
        );
    }
}


loginForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(loginStatus);

        const formData =
            new FormData(loginForm);

        const username =
            String(
                formData.get("username") ?? ""
            ).trim();

        const password =
            String(
                formData.get("password") ?? ""
            );

        try {
            const response =
                await fetch(
                    `${API_URL}/admin/login`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
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

            loginForm.reset();

            currentUser.textContent =
                data.username;

            showSection(adminSection);
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


issueForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(issueStatus);

        publishButton.disabled = true;
        publishButton.textContent =
            "Wird veröffentlicht …";

        try {
            const formData =
                new FormData(issueForm);

            const response =
                await fetch(
                    `${API_URL}/admin/issues`,
                    {
                        method: "POST",

                        credentials: "include",

                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                showStatus(
                    issueStatus,
                    data.error ??
                        "Veröffentlichung fehlgeschlagen.",
                    "error"
                );

                return;
            }

            showStatus(
                issueStatus,
                `Ausgabe ${data.issue.number} wurde erfolgreich veröffentlicht.`,
                "success"
            );

            issueForm.reset();
        } catch (error) {
            console.error(error);

            showStatus(
                issueStatus,
                "Die Verbindung zum Server ist fehlgeschlagen.",
                "error"
            );
        } finally {
            publishButton.disabled = false;
            publishButton.textContent =
                "Ausgabe veröffentlichen";
        }
    }
);


logoutButton.addEventListener(
    "click",
    () => {
        /*
         * Eine richtige Logout-Route bauen wir
         * als nächsten Schritt.
         */
        showSection(loginSection);
    }
);

setupForm.addEventListener(
    "submit",
    async event => {
        event.preventDefault();

        hideStatus(setupStatus);

        const formData =
            new FormData(setupForm);

        const username =
            String(
                formData.get("username") ?? ""
            ).trim();

        const password =
            String(
                formData.get("password") ?? ""
            );

        const passwordRepeat =
            String(
                formData.get("password_repeat") ?? ""
            );

        const adminToken =
            String(
                formData.get("admin_token") ?? ""
            );

        if (password !== passwordRepeat) {
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
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminToken}`
                        },

                        body: JSON.stringify({
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

            showSection(loginSection);

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

async function initializeAdminPage() {
    try {
        const response =
            await fetch(
                `${API_URL}/admin/setup-status`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (data.setupRequired) {
            showSection(setupSection);
            return;
        }

        await checkSession();
    } catch (error) {
        console.error(error);

        showSection(loginSection);

        showStatus(
            loginStatus,
            "Der Redaktionsbereich konnte nicht geladen werden.",
            "error"
        );
    }
}

initializeAdminPage();