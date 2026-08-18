"use strict";


const THEME_STORAGE_KEY =
    "bwbk-theme";


const systemTheme =
    window.matchMedia(
        "(prefers-color-scheme: dark)"
    );


const availableThemes = [
    "system",
    "light",
    "dark"
];


let selectedTheme =
    getSavedTheme();


function getSavedTheme() {
    const savedTheme =
        localStorage.getItem(
            THEME_STORAGE_KEY
        );


    return availableThemes.includes(
        savedTheme
    )
        ? savedTheme
        : "system";
}


function getEffectiveTheme() {
    if (
        selectedTheme === "dark"
    ) {
        return "dark";
    }


    if (
        selectedTheme === "light"
    ) {
        return "light";
    }


    return systemTheme.matches
        ? "dark"
        : "light";
}


function applyTheme() {
    const effectiveTheme =
        getEffectiveTheme();


    document.documentElement
        .setAttribute(
            "data-theme",
            effectiveTheme
        );


    updateThemeButton();
}


function updateThemeButton() {
    const button =
        document.querySelector(
            "#theme-toggle-button"
        );

    const icon =
        document.querySelector(
            "#theme-toggle-icon"
        );

    const label =
        document.querySelector(
            "#theme-toggle-label"
        );


    if (
        !button ||
        !icon ||
        !label
    ) {
        return;
    }


    if (
        selectedTheme === "light"
    ) {
        icon.textContent =
            "☀️";

        label.textContent =
            "Hell";

        button.title =
            "Darstellung: Hell";

        return;
    }


    if (
        selectedTheme === "dark"
    ) {
        icon.textContent =
            "🌙";

        label.textContent =
            "Dunkel";

        button.title =
            "Darstellung: Dunkel";

        return;
    }


    icon.textContent =
        "🖥️";

    label.textContent =
        "System";

    button.title =
        "Darstellung: Systemeinstellung";
}


function cycleTheme() {
    const currentIndex =
        availableThemes.indexOf(
            selectedTheme
        );


    const nextIndex =
        (
            currentIndex + 1
        ) %
        availableThemes.length;


    selectedTheme =
        availableThemes[
            nextIndex
        ];


    localStorage.setItem(
        THEME_STORAGE_KEY,
        selectedTheme
    );


    applyTheme();
}


/*
 * Systemänderungen automatisch übernehmen,
 * solange "System" gewählt wurde.
 */

systemTheme.addEventListener(
    "change",
    () => {
        if (
            selectedTheme === "system"
        ) {
            applyTheme();
        }
    }
);


document.addEventListener(
    "DOMContentLoaded",
    () => {
        const button =
            document.querySelector(
                "#theme-toggle-button"
            );


        if (button) {
            button.addEventListener(
                "click",
                cycleTheme
            );
        }


        applyTheme();
    }
);


/*
 * Theme so früh wie möglich setzen.
 */

applyTheme();