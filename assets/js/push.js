"use strict";

window.OneSignalDeferred =
    window.OneSignalDeferred || [];

OneSignalDeferred.push(async function (OneSignal) {
    await OneSignal.init({
        appId: "264f05a0-58fc-4611-9f11-189078fac630"
    });

    const button =
        document.querySelector("#enable-push-button");

    const status =
        document.querySelector("#push-status");

    if (!button) {
        return;
    }

    const supported =
        OneSignal.Notifications.isPushSupported();

    if (!supported) {
        button.hidden = true;

        if (status) {
            status.textContent =
                "Benachrichtigungen werden auf diesem Gerät nicht unterstützt.";
        }

        return;
    }

    function updatePushStatus() {
        const permission =
            OneSignal.Notifications.permission;

        const optedIn =
            OneSignal.User.PushSubscription.optedIn;

        if (permission && optedIn) {
            button.textContent =
                "Benachrichtigungen aktiviert";

            button.disabled = true;

            if (status) {
                status.textContent =
                    "Du erhältst eine Benachrichtigung bei neuen Ausgaben und wichtigen Terminen.";
            }

            return;
        }

        button.textContent =
            "Benachrichtigungen aktivieren";

        button.disabled = false;

        if (status) {
            status.textContent =
                "Erhalte Benachrichtigungen bei neuen Ausgaben und wichtigen Terminen.";
        }
    }

    button.addEventListener("click", async () => {
        button.disabled = true;

        try {
            await OneSignal.Notifications.requestPermission();

            if (
                OneSignal.Notifications.permission &&
                !OneSignal.User.PushSubscription.optedIn
            ) {
                await OneSignal.User.PushSubscription.optIn();
            }
        } catch (error) {
            console.error(
                "Push-Benachrichtigungen konnten nicht aktiviert werden:",
                error
            );
        }

        updatePushStatus();
    });

    OneSignal.Notifications.addEventListener(
        "permissionChange",
        updatePushStatus
    );

    OneSignal.User.PushSubscription.addEventListener(
        "change",
        updatePushStatus
    );

    updatePushStatus();
});