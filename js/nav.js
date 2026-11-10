// Site-wide nav helper. Two jobs:
//
// 1. Page-aware anchors. Every page renders the same menu from _includes/nav.html. On the
//    home page the menu links are plain in-page anchors (#courses, #contact). On any other
//    page those anchors have no target, so we rewrite [data-home-anchor] links to point at
//    the home page's sections — the menu stays identical everywhere ("menu context on all
//    sub-pages" instead of a Back-to-Home bar).
// 2. The mobile hamburger. The toggle logic lived inline in _layouts/default.html; sub-page
//    layouts call initNav() to get the same behavior.

function initNav() {
    initHomeAnchors();
    initNavMenuToggle();
}

function initHomeAnchors() {
    // Home page is "/" (no baseurl); matches "", "/" and "/index.html".
    const path = window.location.pathname.replace(/index\.html$/, "").replace(/\/+$/, "");
    if (path === "") return; // Anchors already work here.

    document.querySelectorAll("[data-home-anchor]").forEach(link => {
        const base = link.getAttribute("data-home-anchor"); // e.g. "#courses"
        const target = link.getAttribute("href");
        // Only rewrite while the href is still the plain anchor (idempotent re-runs).
        if (target === base || target === "") {
            link.setAttribute("href", "/" + base);
        }
    });
}

function initNavMenuToggle() {
    const navToggle = document.getElementById("nav-menu-toggle");
    const navPanel = document.getElementById("nav-menu-panel");
    if (!navToggle || !navPanel) return;
    if (navToggle.dataset.navBound) return;
    navToggle.dataset.navBound = "1";

    const closeNavPanel = () => {
        navPanel.classList.add("hidden");
        navPanel.classList.remove("flex");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.querySelector("i").className = "fas fa-bars text-lg";
    };
    navToggle.addEventListener("click", () => {
        const isOpen = !navPanel.classList.contains("hidden");
        if (isOpen) {
            closeNavPanel();
        } else {
            navPanel.classList.remove("hidden");
            navPanel.classList.add("flex");
            navToggle.setAttribute("aria-expanded", "true");
            navToggle.querySelector("i").className = "fas fa-times text-lg";
        }
    });
    navPanel.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeNavPanel);
    });
}
