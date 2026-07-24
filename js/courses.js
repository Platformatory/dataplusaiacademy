// Courses collection helpers (data/courses.json)
// Populates the compare-at-a-glance table in sections/courses.html so those figures
// live in one editable file instead of being hand-copied per column.

const COURSE_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

// Cohorts always kick off on the 1st of the next calendar month, computed from today —
// never a hand-typed date that goes stale.
function nextCohortLabel() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${COURSE_MONTH_NAMES[next.getMonth()]} 1, ${next.getFullYear()}`;
}

async function fetchCourses() {
    const timestamp = new Date().getTime();
    const response = await fetch(`data/courses.json?v=${timestamp}`);
    if (!response.ok) throw new Error("Failed to load courses");
    return response.json();
}

async function initCourses() {
    try {
        const courses = await fetchCourses();
        const cohortDate = nextCohortLabel();

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
            setCompareField("upcoming-batch", cohortDate);
            setCompareField("price", course.price_label);
            setCompareLink("payment-link", course.payment_link);
            setCompareLink("curriculum-link", course.curriculum_link);
        });
    } catch (error) {
        console.error("Error loading courses:", error);
    }
}
