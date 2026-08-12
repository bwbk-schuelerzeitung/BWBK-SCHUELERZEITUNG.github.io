"use strict";


const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";


const galleryContainer =
    document.querySelector("#public-gallery");


const lightbox =
    document.querySelector("#gallery-lightbox");

const lightboxImage =
    document.querySelector("#gallery-lightbox-image");

const lightboxTitle =
    document.querySelector("#gallery-lightbox-title");

const lightboxDescription =
    document.querySelector("#gallery-lightbox-description");

const lightboxCloseButton =
    document.querySelector("#gallery-lightbox-close");

const lightboxPreviousButton =
    document.querySelector("#gallery-lightbox-previous");

const lightboxNextButton =
    document.querySelector("#gallery-lightbox-next");


let galleryItems = [];
let currentGalleryIndex = 0;


/*
 * ==========================================
 * GALERIE LADEN
 * ==========================================
 */

async function loadGallery() {
    try {
        const response =
            await fetch(
                `${API_URL}/gallery`
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        galleryItems =
            Array.isArray(
                data.gallery
            )
                ? data.gallery
                : [];


        renderGallery();

    } catch (error) {
        console.error(error);


        galleryContainer.innerHTML = `
            <p class="error-message">
                Die Galerie konnte leider nicht geladen werden.
            </p>
        `;
    }
}


/*
 * ==========================================
 * GALERIE ANZEIGEN
 * ==========================================
 */

function renderGallery() {
    if (
        galleryItems.length === 0
    ) {
        galleryContainer.innerHTML = `
            <p class="status-message">
                Momentan sind noch keine Bilder
                in der Galerie veröffentlicht.
            </p>
        `;

        return;
    }


    galleryContainer.innerHTML =
        galleryItems
            .map(
                (item, index) => `
                    <article
                        class="public-gallery-card"
                        data-gallery-index="${index}"
                        tabindex="0"
                        role="button"
                        aria-label="${escapeHtml(item.title)} öffnen"
                    >

                        <div class="public-gallery-image-wrapper">

                            <img
                                class="public-gallery-image"
                                src="${escapeHtml(item.image)}"
                                alt="${escapeHtml(item.title)}"
                                loading="lazy"
                            >

                        </div>


                        <div class="public-gallery-content">

                            <h2>
                                ${escapeHtml(item.title)}
                            </h2>

                            ${
                                item.description
                                    ? `
                                        <p>
                                            ${escapeHtml(
                                                item.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </article>
                `
            )
            .join("");


    bindGalleryCards();
}


/*
 * ==========================================
 * GALERIE-KARTEN
 * ==========================================
 */

function bindGalleryCards() {
    document
        .querySelectorAll(
            ".public-gallery-card"
        )
        .forEach(
            card => {

                const openCard =
                    () => {
                        openLightbox(
                            Number(
                                card.dataset.galleryIndex
                            )
                        );
                    };


                card.addEventListener(
                    "click",
                    openCard
                );


                card.addEventListener(
                    "keydown",
                    event => {
                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {
                            event.preventDefault();

                            openCard();
                        }
                    }
                );
            }
        );
}


/*
 * ==========================================
 * LIGHTBOX
 * ==========================================
 */

function openLightbox(index) {
    if (
        !galleryItems[index]
    ) {
        return;
    }


    currentGalleryIndex =
        index;


    updateLightbox();


    lightbox.classList.remove(
        "hidden"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "lightbox-open"
    );


    lightboxCloseButton.focus();
}


function closeLightbox() {
    lightbox.classList.add(
        "hidden"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "lightbox-open"
    );


    lightboxImage.src =
        "";
}


function updateLightbox() {
    const item =
        galleryItems[
            currentGalleryIndex
        ];


    if (!item) {
        return;
    }


    lightboxImage.src =
        item.image;


    lightboxImage.alt =
        item.title;


    lightboxTitle.textContent =
        item.title;


    lightboxDescription.textContent =
        item.description || "";


    /*
     * Bei nur einem Bild brauchen wir
     * keine Pfeile.
     */
    const multipleImages =
        galleryItems.length > 1;


    lightboxPreviousButton.classList.toggle(
        "hidden",
        !multipleImages
    );


    lightboxNextButton.classList.toggle(
        "hidden",
        !multipleImages
    );
}


function showPreviousImage() {
    currentGalleryIndex =
        (
            currentGalleryIndex -
            1 +
            galleryItems.length
        ) %
        galleryItems.length;


    updateLightbox();
}


function showNextImage() {
    currentGalleryIndex =
        (
            currentGalleryIndex +
            1
        ) %
        galleryItems.length;


    updateLightbox();
}


/*
 * ==========================================
 * LIGHTBOX-BUTTONS
 * ==========================================
 */

lightboxCloseButton.addEventListener(
    "click",
    closeLightbox
);


lightboxPreviousButton.addEventListener(
    "click",
    showPreviousImage
);


lightboxNextButton.addEventListener(
    "click",
    showNextImage
);


/*
 * Hintergrund anklicken
 */

lightbox.addEventListener(
    "click",
    event => {
        if (
            event.target === lightbox
        ) {
            closeLightbox();
        }
    }
);


/*
 * Tastatur
 */

document.addEventListener(
    "keydown",
    event => {

        if (
            lightbox.classList.contains(
                "hidden"
            )
        ) {
            return;
        }


        if (
            event.key === "Escape"
        ) {
            closeLightbox();
        }


        if (
            event.key === "ArrowLeft" &&
            galleryItems.length > 1
        ) {
            showPreviousImage();
        }


        if (
            event.key === "ArrowRight" &&
            galleryItems.length > 1
        ) {
            showNextImage();
        }
    }
);


/*
 * ==========================================
 * SICHERE HTML-AUSGABE
 * ==========================================
 */

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
 * START
 * ==========================================
 */

loadGallery();