// Events collection helpers. events.json is generated at build time from the _events
// Jekyll collection (see that file's front matter + Liquid loop) — _events/*.md is the
// actual source of truth; this fetch just reads the generated snapshot client-side.
// Shared by the homepage announcement banner, individual event pages, and events.html.

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDateOnly(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatShortDate(isoDate) {
    const d = parseDateOnly(isoDate);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// Returns the earliest session date (as a Date) that is today or later, or null if the series has ended.
function nextSessionDate(event) {
    const today = startOfToday();
    const upcoming = event.sessions
        .map(parseDateOnly)
        .filter(d => d >= today)
        .sort((a, b) => a - b);
    return upcoming.length ? upcoming[0] : null;
}

async function fetchEvents() {
    const timestamp = new Date().getTime();
    const response = await fetch(`events.json?v=${timestamp}`);
    if (!response.ok) throw new Error("Failed to load events");
    return response.json();
}

// The event with the soonest still-upcoming session, or null if nothing is upcoming.
function pickUpcomingEvent(events) {
    const withNext = events
        .map(event => ({ event, next: nextSessionDate(event) }))
        .filter(entry => entry.next !== null)
        .sort((a, b) => a.next - b.next);
    return withNext.length ? withNext[0].event : null;
}

// Human-readable session range, e.g. "16 May, 23 May, 6 Jun & 13 Jun" or "16 May – 13 Jun".
function formatSessionRange(sessions) {
    const sorted = [...sessions].sort();
    if (sorted.length === 1) return formatShortDate(sorted[0]);
    if (sorted.length <= 4) {
        const parts = sorted.map(formatShortDate);
        return parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1];
    }
    return `${formatShortDate(sorted[0])} – ${formatShortDate(sorted[sorted.length - 1])}`;
}

function monthSpan(sessions) {
    const sorted = [...sessions].sort();
    const first = parseDateOnly(sorted[0]);
    const last = parseDateOnly(sorted[sorted.length - 1]);
    const firstMonth = MONTH_NAMES[first.getMonth()];
    const lastMonth = MONTH_NAMES[last.getMonth()];
    return firstMonth === lastMonth ? firstMonth : `${firstMonth} & ${lastMonth}`;
}

// Populates the homepage announcement banner (#announcement-banner) with the soonest upcoming event.
// Hides the banner entirely when no event has a session left to attend.
async function initAnnouncementBanner() {
    const banner = document.getElementById("announcement-banner");
    if (!banner) return;

    try {
        const events = await fetchEvents();
        const event = pickUpcomingEvent(events);

        if (!event) {
            banner.remove();
            return;
        }

        banner.href = event.url;
        banner.querySelectorAll("[data-field='badge']").forEach(el => el.textContent = event.badge);
        banner.querySelectorAll("[data-field='short-title']").forEach(el => el.textContent = event.short_title);
        banner.querySelectorAll("[data-field='summary']").forEach(el => {
            el.textContent = `${event.price_label} · ${event.format} · ${monthSpan(event.sessions)}`;
        });
        banner.querySelectorAll("[data-field='desktop-detail']").forEach(el => {
            el.textContent = `${event.topics} — ${event.price_label}, ${event.format} · ${monthSpan(event.sessions)}`;
        });
        banner.querySelectorAll("[data-field='cta']").forEach(el => el.textContent = event.cta_label);
    } catch (error) {
        console.error("Error loading events for announcement banner:", error);
        banner.remove();
    }
}

// Populates an event detail page (elements tagged data-field) from its matching entry in
// data/events.json, keyed off document.body.dataset.eventSlug. Also renders the Google Form
// as an iframe into #event-form-embed when a form URL is configured.
async function initEventDetail() {
    const slug = document.body.dataset.eventSlug;
    if (!slug) return;

    try {
        const events = await fetchEvents();
        const event = events.find(e => e.slug === slug);
        if (!event) return;

        document.querySelectorAll("[data-field='title']").forEach(el => el.textContent = event.title);
        document.querySelectorAll("[data-field='topics']").forEach(el => el.textContent = event.topics);
        document.querySelectorAll("[data-field='format']").forEach(el => el.textContent = event.format);
        document.querySelectorAll("[data-field='location']").forEach(el => el.textContent = event.location);
        document.querySelectorAll("[data-field='price']").forEach(el => el.textContent = event.price_label);
        document.querySelectorAll("[data-field='time']").forEach(el => el.textContent = event.time_label);
        document.querySelectorAll("[data-field='session-range']").forEach(el => el.textContent = formatSessionRange(event.sessions));
        document.querySelectorAll("[data-field='cta-label']").forEach(el => el.textContent = event.cta_label);
        document.querySelectorAll("[data-field='cta-link']").forEach(el => el.href = event.form_url);

        const sessionGrid = document.querySelector("[data-field='session-grid']");
        if (sessionGrid) {
            sessionGrid.innerHTML = [...event.sessions].sort().map(iso => {
                const d = parseDateOnly(iso);
                return `
                    <div class="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:border-green-200 hover:shadow-md transition-all duration-300">
                        <p class="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">${MONTH_NAMES[d.getMonth()]}</p>
                        <p class="text-4xl font-bold text-green-600 mb-1">${String(d.getDate()).padStart(2, "0")}</p>
                        <p class="text-sm text-gray-500">(${event.time_label})</p>
                    </div>`;
            }).join("");
        }

        const formContainer = document.getElementById("event-form-embed");
        const embedUrl = event.form_embed_url || event.form_url;
        if (formContainer && embedUrl) {
            formContainer.innerHTML = `
                <div class="relative w-full bg-gray-50 rounded-xl overflow-hidden" style="height: ${event.form_height || 1200}px;">
                    <iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" marginheight="0"
                        marginwidth="0" class="absolute inset-0 w-full h-full" scrolling="auto">
                        Loading…
                    </iframe>
                </div>`;
        }
    } catch (error) {
        console.error("Error loading event detail:", error);
    }
}

function eventCardHtml(event, isUpcoming) {
    const dateLabel = formatSessionRange(event.sessions);
    return `
        <a href="${event.url}"
            class="group block bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div class="p-6 md:p-8">
                <div class="flex flex-wrap items-center gap-2 mb-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isUpcoming ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }">
                        ${isUpcoming ? "Upcoming" : "Past"}
                    </span>
                    <span class="text-xs font-semibold text-gray-500">${event.format} · ${event.price_label}</span>
                </div>
                <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    ${event.title}
                </h2>
                <p class="text-gray-600 mb-4">${event.topics}</p>
                <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                    <span><i class="fas fa-calendar-alt text-green-600 mr-1.5"></i>${dateLabel}</span>
                    <span><i class="fas fa-map-marker-alt text-green-600 mr-1.5"></i>${event.location}</span>
                    <span class="ml-auto text-green-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                        Details <i class="fas fa-arrow-right text-xs"></i>
                    </span>
                </div>
            </div>
        </a>`;
}

// Populates the /events.html listing page: splits events into Upcoming / Past based on
// whether they still have a session left, using the same date logic as the announcement banner.
async function initEventsListing() {
    const upcomingContainer = document.getElementById("upcoming-events");
    const pastContainer = document.getElementById("past-events");
    const emptyState = document.getElementById("events-empty");
    if (!upcomingContainer && !pastContainer) return;

    try {
        const events = await fetchEvents();
        const upcoming = events.filter(e => nextSessionDate(e) !== null)
            .sort((a, b) => nextSessionDate(a) - nextSessionDate(b));
        const past = events.filter(e => nextSessionDate(e) === null)
            .sort((a, b) => new Date(b.sessions.slice().sort().pop()) - new Date(a.sessions.slice().sort().pop()));

        if (upcomingContainer) {
            upcomingContainer.innerHTML = upcoming.map(e => eventCardHtml(e, true)).join("");
            upcomingContainer.closest("[data-section='upcoming']")?.classList.toggle("hidden", upcoming.length === 0);
        }
        if (pastContainer) {
            pastContainer.innerHTML = past.map(e => eventCardHtml(e, false)).join("");
            pastContainer.closest("[data-section='past']")?.classList.toggle("hidden", past.length === 0);
        }
        if (emptyState) emptyState.classList.toggle("hidden", events.length > 0);
    } catch (error) {
        console.error("Error loading events listing:", error);
        if (emptyState) emptyState.classList.remove("hidden");
    }
}
