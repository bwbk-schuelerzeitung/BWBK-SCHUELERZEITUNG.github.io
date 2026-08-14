"use strict";


const API_URL =
    "https://bwbk-api.roniiminimal.workers.dev";


const teamList =
    document.querySelector(
        "#team-list"
    );


async function loadTeam() {
    try {
        const response =
            await fetch(
                `${API_URL}/team`
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const team =
            Array.isArray(
                data.team
            )
                ? data.team
                : [];

        renderTeam(
            team
        );

    } catch (error) {
        console.error(error);

        teamList.innerHTML = `
            <p class="error-message">
                Das Team konnte nicht geladen werden.
            </p>
        `;
    }
}


function renderTeam(team) {
    if (
        team.length === 0
    ) {
        teamList.innerHTML = `
            <p class="status-message">
                Aktuell sind keine öffentlichen
                Teamprofile vorhanden.
            </p>
        `;

        return;
    }

    teamList.innerHTML =
        team
            .map(
                member => `
                    <article class="team-card">

                        ${
                            member.image
                                ? `
                                    <img
                                        class="team-profile-image"
                                        src="${escapeHtml(member.image)}"
                                        alt="${escapeHtml(member.displayName)}"
                                        loading="lazy"
                                    >
                                `
                                : `
                                    <div class="team-profile-placeholder">
                                        ${escapeHtml(
                                            getInitials(
                                                member.displayName
                                            )
                                        )}
                                    </div>
                                `
                        }

                        <div class="team-card-content">

                            <h2>
                                ${escapeHtml(
                                    member.displayName
                                )}
                            </h2>

                            ${
                                member.info
                                    ? `
                                        <p>
                                            ${escapeHtml(
                                                member.info
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
}


function getInitials(name) {
    return String(name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part.charAt(0)
                    .toUpperCase()
        )
        .join("");
}


function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


loadTeam();