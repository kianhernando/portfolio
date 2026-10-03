document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const typed = document.getElementById("typed");

if (typed) {
    const words = ["a Developer", "an Engineer", "Kian!"];
    let text = 0;
    let char = 0;
    let typing = true;

    function type() {
        const currentText = words[text];

        if (typing) {
            if (char < currentText.length) {
                char++;
                typed.textContent = currentText.slice(0, char);
                setTimeout(type, 120 + Math.random() * 60);
            } else {
                typing = false;
                if (text === words.length - 1) return;
                setTimeout(type, 1800);
            }
        } else {
            if (char > 0) {
                char--;
                typed.textContent = currentText.slice(0, char);
                setTimeout(type, 55);
            } else {
                typing = true;
                text++;
                setTimeout(type, 450);
            }
        }
    }

    const intro = document.documentElement.classList.contains("intro");

    if (reduceMotion.matches || !intro) {
        typed.textContent = words[words.length - 1];
    } else {
        setTimeout(type, 700);
    }
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
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
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
        button.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
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
            label.textContent = "Copied";
            copyStatus.textContent = "E-mail address copied to clipboard.";
        } catch {
            label.textContent = "Press Ctrl+C";
            copyStatus.textContent = "Couldn't copy automatically. Select the address and copy it.";
            const range = document.createRange();
            range.selectNodeContents(document.querySelector("[data-copy-target]"));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            copyBtn.classList.remove("is-copied");
            label.textContent = "Copy";
        }, 2200);
    });
}

document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
});
