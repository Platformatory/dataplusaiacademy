// Courses collection helpers. courses.json is generated at build time from the _courses
// Jekyll collection (see that file's front matter + Liquid loop) — _courses/*.md is the
// actual source of truth (facts + curriculum, rendered as its own detail page); this fetch
// just reads the generated snapshot client-side to populate the compare-at-a-glance table.
// Note: cohort start dates are intentionally not shown — the coordinator (Acyra) confirms
// the next batch during the enrolment conversation.

async function fetchCourses() {
    const timestamp = new Date().getTime();
    const response = await fetch(`courses.json?v=${timestamp}`);
    if (!response.ok) throw new Error("Failed to load courses");
    return response.json();
}

async function initCourses() {
    try {
        const courses = await fetchCourses();

        courses.forEach(course => {
            // Compare-at-a-glance table (cells tagged by both course id and field)
            const setCompareField = (field, value) => {
                const el = document.querySelector(`[data-course='${course.id}'][data-field='${field}']`);
                if (el) el.textContent = value;
            };
            const setCompareLink = (field, value) => {
                const el = document.querySelector(`[data-course='${course.id}'][data-field='${field}']`);
                if (el && value) el.href = value;
            };

            setCompareField("duration", course.duration_label);
            setCompareField("delivery", course.delivery_label);
            setCompareField("price", course.price_label);
            setCompareLink("curriculum-link", course.curriculum_link);
        });
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}

// "Talk to a Coordinator" links point at Acyra (our coordinator & training operations
// partner) with context in the query string — which course, and where on this site the
// learner clicked from. coordinator.json is generated at build time (see that file);
// if it fails to load, links keep their build-time URLs with course-free context.
async function initCoordinatorLinks() {
    try {
        const response = await fetch(`coordinator.json?v=${new Date().getTime()}`);
        if (!response.ok) return;
        const config = await response.json();

        // Enrolment source context: this page, plus a section hint when it's the home page.
        // Build-time URLs already carry utm_source/medium/campaign — appending a second
        // utm_source below would break Acyra's analytics, so source rides as its own param.
        const context = new URLSearchParams();
        context.set("source", config.source || window.location.origin);

        document.querySelectorAll("[data-coordinator-link]").forEach(link => {
            const key = link.getAttribute("data-coordinator-link");
            const sep = config.base.includes("?") ? "&" : "?";
            let url = config.base + sep + context.toString();
            let label = null;

            if (key === "course" && window.COURSE) {
                // Course detail page: window.COURSE is set inline by _layouts/course.html.
                url += `&course=${encodeURIComponent(window.COURSE.name)}`;
                label = `Talk to a Coordinator about ${window.COURSE.name}`;
            } else if (key === "") {
                // Compare-table CTAs: identify the column from this cell's header link.
                const cell = link.closest("td");
                const colIndex = cell ? [...cell.parentNode.children].indexOf(cell) : -1;
                // nth-child is 1-based and the sticky Compare cell is cell 0, so a data
                // cell at index N lines up with header nth-child(N+1). [href^="/courses"]
                // skips the Curriculum link inside each header cell.
                const header = colIndex >= 0 ? document.querySelector(
                    `#courses thead tr > *:nth-child(${colIndex + 1}) a[href^="/courses"]`) : null;
                const courseName = header ? header.textContent.replace(/\s+/g, " ").trim() : null;
                if (courseName) {
                    url += `&course=${encodeURIComponent(courseName)}`;
                    label = `Talk to a Coordinator about ${courseName}`;
                }
            }

            link.href = url;
            if (label) link.setAttribute("aria-label", label);
            const labelSpan = link.querySelector(".coordinator-label");
            if (labelSpan && label) labelSpan.textContent = label;
        });
    } catch (error) {
        console.error("Error loading coordinator config:", error);
    }
}
