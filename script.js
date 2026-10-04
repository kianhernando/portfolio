const root = document.documentElement;

root.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const JA = window.JA || {};
const RUBY = /\{([^|{}]+)\|([^{}]+)\}/g;
const localized = [];
let lang = root.lang === "ja" ? "ja" : "en";

const ruby = (source) => source.replace(RUBY, "<ruby>$1<rt>$2</rt></ruby>");
const html = (key, en) => (lang === "ja" && key in JA ? ruby(JA[key]) : en);
const text = (key, en) => (lang === "ja" && key in JA ? JA[key].replace(RUBY, "$1") : en);

document.querySelectorAll("body [data-i18n]").forEach((el) => {
    const en = el.innerHTML;
    localized.push(() => (el.innerHTML = html(el.dataset.i18n, en)));
});

["aria-label", "alt"].forEach((attr) => {
    document.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
        const key = el.getAttribute(`data-i18n-${attr}`);
        const en = el.getAttribute(attr);
        localized.push(() => el.setAttribute(attr, text(key, en)));
    });
});

const pageTitle = document.querySelector("title[data-i18n]");

if (pageTitle) {
    const en = document.title;
    localized.push(() => (document.title = text(pageTitle.dataset.i18n, en)));
}

if (lang === "ja") localized.forEach((update) => update());
root.classList.add("i18n-ready");

function savedLang() {
    try {
        return localStorage.getItem("lang") === "ja" ? "ja" : "en";
    } catch {
        return lang;
    }
}

function setLang(next) {
    const probe = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    const anchor = (probe && probe.closest("[data-i18n]")) || probe;
    const top = anchor ? anchor.getBoundingClientRect().top : 0;

    lang = next;
    root.lang = lang;
    try {
        localStorage.setItem("lang", lang);
    } catch {}
    localized.forEach((update) => update());

    if (anchor) {
        window.scrollBy({ top: anchor.getBoundingClientRect().top - top, behavior: "instant" });
    }
}

const langSwitch = document.querySelector("[data-lang-switch]");

if (langSwitch) {
    const sync = () => langSwitch.setAttribute("aria-checked", String(lang === "ja"));

    langSwitch.addEventListener("click", () => setLang(lang === "ja" ? "en" : "ja"));
    localized.push(sync);
    sync();

    const footer = document.querySelector(".site-footer");

    if (footer && "IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            langSwitch.classList.toggle("is-docked", entry.isIntersecting);
        }).observe(footer);
    }
}

window.addEventListener("pageshow", (e) => {
    if (e.persisted && savedLang() !== lang) setLang(savedLang());
});

const typed = document.getElementById("typed");

if (typed) {
    const getWords = () =>
        (lang === "ja" ? JA["hero.typed"] : ["a Developer", "an Engineer", "Kian!"]).map((word) =>
            word.match(/\{[^{}]*\}|./gu).map(ruby)
        );
    let words = getWords();
    let word = 0;
    let char = 0;
    let typing = true;
    let timer;

    const show = (count) => (typed.innerHTML = words[word].slice(0, count).join(""));

    function type() {
        const length = words[word].length;

        if (typing) {
            if (char < length) {
                char++;
                show(char);
                timer = setTimeout(type, 120 + Math.random() * 60);
            } else {
                typing = false;
                if (word === words.length - 1) return;
                timer = setTimeout(type, 1800);
            }
        } else {
            if (char > 0) {
                char--;
                show(char);
                timer = setTimeout(type, 55);
            } else {
                typing = true;
                word++;
                timer = setTimeout(type, 450);
            }
        }
    }

    function finish() {
        clearTimeout(timer);
        words = getWords();
        word = words.length - 1;
        show(words[word].length);
    }

    const intro = root.classList.contains("intro");

    if (reduceMotion.matches || !intro) {
        finish();
    } else {
        timer = setTimeout(type, 700);
    }

    localized.push(finish);
}

const header = document.querySelector("[data-header]");
const sentinel = document.querySelector("[data-scroll-sentinel]");

if (header && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
    }).observe(sentinel);
}

const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("mobile-menu");
const inertTargets = document.querySelectorAll("main, footer");

function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? text("menu.close", "Close menu") : text("menu.open", "Open menu"));
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    inertTargets.forEach((el) => (el.inert = open));
}

if (toggle && menu) {
    toggle.addEventListener("click", () => {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
            setMenu(false);
            toggle.focus();
        }
    });

    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
        if (e.matches) setMenu(false);
    });

    localized.push(() => setMenu(menu.classList.contains("is-open")));
    setMenu(false);
}

function spy(links) {
    const map = new Map();
    links.forEach((link) => {
        const target = document.querySelector(link.hash);
        if (target) map.set(target, link);
    });
    if (!map.size || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const link = map.get(entry.target);
                if (entry.isIntersecting) {
                    links.forEach((l) => l.removeAttribute("aria-current"));
                    link.setAttribute("aria-current", "true");
                } else if (link.getAttribute("aria-current")) {
                    link.removeAttribute("aria-current");
                }
            });
        },
        { rootMargin: "-40% 0px -55% 0px" }
    );

    map.forEach((_, target) => observer.observe(target));
}

spy([...document.querySelectorAll(".nav-links a[href^='#']")]);
spy([...document.querySelectorAll(".case-toc a[href^='#']")]);

const reveals = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealer.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => revealer.observe(el));
} else {
    reveals.forEach((el) => el.classList.add("is-visible"));
}

const videos = document.querySelectorAll("video[data-autoplay]");

if ("IntersectionObserver" in window) {
    const player = new IntersectionObserver(
        (entries) => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting && !reduceMotion.matches && !target.dataset.userPaused) {
                    target.play().catch(() => {});
                } else {
                    target.pause();
                }
            });
        },
        { threshold: 0.25 }
    );
    videos.forEach((video) => player.observe(video));
}

reduceMotion.addEventListener("change", (e) => {
    if (e.matches) videos.forEach((video) => video.pause());
});

document.querySelectorAll("[data-media-toggle]").forEach((button) => {
    const video = button.parentElement.querySelector("video");

    const sync = () => {
        button.classList.toggle("is-paused", video.paused);
        button.setAttribute(
            "aria-label",
            video.paused ? text("video.play", "Play video") : text("video.pause", "Pause video")
        );
    };

    button.addEventListener("click", () => {
        if (video.paused) {
            delete video.dataset.userPaused;
            video.play().catch(() => {});
        } else {
            video.dataset.userPaused = "true";
            video.pause();
        }
    });

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    localized.push(sync);
    sync();
});

const copyBtn = document.querySelector("[data-copy]");
const copyStatus = document.querySelector("[data-copy-status]");

if (copyBtn) {
    const label = copyBtn.querySelector("[data-copy-label]");
    let resetTimer;

    copyBtn.addEventListener("click", async () => {
        const value = copyBtn.dataset.copy;
        try {
            await navigator.clipboard.writeText(value);
            copyBtn.classList.add("is-copied");
            label.innerHTML = html("copy.done", "Copied");
            copyStatus.textContent = text("copy.status.done", "E-mail address copied to clipboard.");
        } catch {
            label.innerHTML = html("copy.manual", "Press Ctrl+C");
            copyStatus.textContent = text(
                "copy.status.failed",
                "Couldn't copy automatically. Select the address and copy it."
            );
            const range = document.createRange();
            range.selectNodeContents(document.querySelector("[data-copy-target]"));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            copyBtn.classList.remove("is-copied");
            label.innerHTML = html("copy", "Copy");
        }, 2200);
    });
}

document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
});
