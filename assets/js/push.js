"use strict";


window.OneSignalDeferred =
    window.OneSignalDeferred || [];


OneSignalDeferred.push(
    async function (OneSignal) {

        await OneSignal.init({
            appId:
                "264f05a0-58fc-4611-9f11-189078fac630"
        });


        const button =
            document.querySelector(
                "#enable-push-button"
            );

        const status =
            document.querySelector(
                "#push-status"
            );


        if (!button) {
            return;
        }


        const supported =
            OneSignal.Notifications
                .isPushSupported();


        /*
         * ==========================================
         * PUSH NICHT UNTERSTÜTZT
         * ==========================================
         */

        if (!supported) {
            button.hidden =
                true;

            if (status) {
                status.textContent =
                    "Benachrichtigungen werden auf diesem Gerät nicht unterstützt.";
            }

            return;
        }


        /*
         * ==========================================
         * ANZEIGE AKTUALISIEREN
         * ==========================================
         */

        function updatePushStatus() {
            const permission =
                OneSignal.Notifications
                    .permission;

            const optedIn =
                OneSignal.User
                    .PushSubscription
                    .optedIn;


            /*
             * Push ist aktiviert
             */

            if (
                permission &&
                optedIn
            ) {
                button.innerHTML = `
                    <span
                        class="push-floating-icon"
                        aria-hidden="true"
                    >
                        🔔
                    </span>

                    <span class="push-floating-label">
                        Benachrichtigungen an
                    </span>
                `;


                button.classList.add(
                    "push-active"
                );


                button.setAttribute(
                    "aria-label",
                    "Benachrichtigungen deaktivieren"
                );


                button.setAttribute(
                    "title",
                    "Benachrichtigungen deaktivieren"
                );


                if (status) {
                    status.textContent =
                        "Benachrichtigungen für neue Ausgaben und wichtige Termine sind aktiviert.";
                }

                return;
            }


            /*
             * Push ist deaktiviert
             */

            button.innerHTML = `
                <span
                    class="push-floating-icon"
                    aria-hidden="true"
                >
                    🔕
                </span>

                <span class="push-floating-label">
                    Benachrichtigungen aus
                </span>
            `;


            button.classList.remove(
                "push-active"
            );


            button.setAttribute(
                "aria-label",
                "Benachrichtigungen aktivieren"
            );


            button.setAttribute(
                "title",
                "Benachrichtigungen aktivieren"
            );


            if (status) {
                status.textContent =
                    "Benachrichtigungen für neue Ausgaben und wichtige Termine sind deaktiviert.";
            }
        }


        /*
         * ==========================================
         * EIN / AUS
         * ==========================================
         */

        button.addEventListener(
            "click",
            async () => {

                button.disabled =
                    true;


                try {
                    const optedIn =
                        OneSignal.User
                            .PushSubscription
                            .optedIn;


                    /*
                     * Aktuell AN
                     * → ausschalten
                     */

                    if (optedIn) {
                        await OneSignal.User
                            .PushSubscription
                            .optOut();

                        updatePushStatus();

                        return;
                    }


                    /*
                     * Browser-Berechtigung
                     * noch nicht vorhanden
                     */

                    if (
                        !OneSignal.Notifications
                            .permission
                    ) {
                        await OneSignal
                            .Notifications
                            .requestPermission();
                    }


                    /*
                     * Nur abonnieren,
                     * wenn Berechtigung vorhanden.
                     */

                    if (
                        OneSignal.Notifications
                            .permission
                    ) {
                        await OneSignal.User
                            .PushSubscription
                            .optIn();
                    }


                    updatePushStatus();

                } catch (error) {
                    console.error(
                        "Push-Einstellung konnte nicht geändert werden:",
                        error
                    );


                    if (status) {
                        status.textContent =
                            "Die Benachrichtigungseinstellung konnte nicht geändert werden.";
                    }

                } finally {
                    button.disabled =
                        false;
                }
            }
        );


        /*
         * ==========================================
         * ÄNDERUNGEN BEOBACHTEN
         * ==========================================
         */

        OneSignal.Notifications
            .addEventListener(
                "permissionChange",
                updatePushStatus
            );


        OneSignal.User
            .PushSubscription
            .addEventListener(
                "change",
                updatePushStatus
            );


        /*
         * ==========================================
         * START
         * ==========================================
         */

        updatePushStatus();
    }
);