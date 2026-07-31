import * as pdfjsLib from
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.worker.mjs";

const params = new URLSearchParams(window.location.search);

const pdfPath = params.get("pdf");
const title = params.get("title") || "Ausgabe lesen";

const titleElement = document.querySelector("#reader-title");
const statusElement = document.querySelector("#reader-status");
const pagesElement = document.querySelector("#pdf-pages");
const originalLink = document.querySelector("#original-pdf-link");

titleElement.textContent = title;

if (!pdfPath) {
    showError("Es wurde keine PDF angegeben.");
} else {
    originalLink.href = pdfPath;
    loadPdf(pdfPath);
}

async function loadPdf(url) {
    try {
        const loadingTask = pdfjsLib.getDocument({
            url
        });

        const pdf = await loadingTask.promise;

        statusElement.textContent =
            `${pdf.numPages} Seite${pdf.numPages === 1 ? "" : "n"} werden geladen …`;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            await renderPage(pdf, pageNumber);
        }

        statusElement.remove();
    } catch (error) {
        console.error(error);
        showError("Die PDF konnte leider nicht angezeigt werden.");
    }
}

async function renderPage(pdf, pageNumber) {
    const page = await pdf.getPage(pageNumber);

    const baseViewport = page.getViewport({
        scale: 1
    });

    const availableWidth = Math.min(
        window.innerWidth - 28,
        1100
    );

    const displayScale = availableWidth / baseViewport.width;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const viewport = page.getViewport({
        scale: displayScale * pixelRatio
    });

    const wrapper = document.createElement("section");
    wrapper.className = "pdf-page";
    wrapper.setAttribute(
        "aria-label",
        `Seite ${pageNumber}`
    );

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", {
        alpha: false
    });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    wrapper.appendChild(canvas);
    pagesElement.appendChild(wrapper);

    await page.render({
        canvasContext: context,
        viewport
    }).promise;
}

function showError(message) {
    statusElement.textContent = message;
    statusElement.style.color = "#991b1b";
}