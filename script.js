// === Utility Functions ===
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const removeClassFromAll = (elements, className) => elements.forEach(el => el.classList.remove(className));
const addFallbackImage = img => img || "https://via.placeholder.com/150?text=No+Image";
const hexToRgb = hex => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
    const num = parseInt(hex, 16);
    return `${(num >> 16) & 255},${(num >> 8) & 255},${num & 255}`;
};

// === Navigation Handling ===
function setupNavigation() {
    $$(".nav-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetSection = $(link.getAttribute("href"));
            targetSection?.scrollIntoView({ behavior: "smooth" });
        });
    });
}

// === Projects ===
const maxVisibleDefault = 100;
let maxVisible = maxVisibleDefault;

const getMaxVisible = () => {
    // TODO: Falls du wieder responsive willst, kannst du hier zurückstellen
    return maxVisibleDefault;
};

const updateMaxVisible = () => {
    const newValue = getMaxVisible();
    if (newValue !== maxVisible) maxVisible = newValue;
};

window.addEventListener("resize", updateMaxVisible);
new ResizeObserver(updateMaxVisible).observe(document.documentElement);

function handleProjectClick(event, url) {
    if (event.target.tagName.toLowerCase() === "a") return;
    window.open(url, "_blank");
}

function renderProjects(projects) {
    return projects.map(project => {
        const { color, img, title, short_description, links, link } = project;
        const rgbaColor = color ? `rgba(${hexToRgb(color)}, 0.5)` : `rgba(240,240,240,0.18)`;
        const targetUrl = Array.isArray(links) && links.length
            ? links[links.length - 1].url
            : link?.url || "#";

        const linkHTML = Array.isArray(links)
            ? links.map(l => `<a href="${l.url}" target="_blank">${l.name}</a>`).join("")
            : `<a href="${link?.url || "#"}" target="_blank">${link?.name || "See more →"}</a>`;

        return `
            <div class="project" 
                 data-color="${color || ''}" 
                 style="--project-shadow: ${rgbaColor};"
                 onclick="handleProjectClick(event, '${targetUrl}')">
                <img src="${addFallbackImage(img)}" loading="lazy" alt="${title}">
                <div>
                    <p>${title}</p>
                    <p class="description">- ${short_description}</p>
                </div>
                <div>${linkHTML}</div>
            </div>
        `;
    }).join("");
}

function renderLimitedProjects(projects, container, button) {
    let isExpanded = false;

    const updateProjects = () => {
        button.style.display = projects.length <= maxVisible ? "none" : "block";
        const visible = isExpanded ? projects : projects.slice(0, maxVisible);
        container.innerHTML = renderProjects(visible);
        button.textContent = isExpanded ? "Weniger anzeigen" : "Mehr anzeigen";
    };

    button.addEventListener("click", () => {
        isExpanded = !isExpanded;
        updateProjects();
    });

    updateProjects();
}

async function loadProjects() {
    try {
        const data = await (await fetch("projects.json")).json();
        const sections = [
            { key: "programming", selector: ".programming", buttonId: "show-all-programming" },
            { key: "filming", selector: ".filming", buttonId: "show-all-filming" }
        ];

        sections.forEach(({ key, selector, buttonId }) => {
            const container = $(`${selector} .content`);
            const button = $(`#${buttonId}`);
            renderLimitedProjects(data[key], container, button);
        });
    } catch (err) {
        console.error("Fehler beim Laden der Projekte:", err);
    }
}

// === Skills ===
async function loadSkills() {
    try {
        const categories = await (await fetch("skills.json")).json();
        const html = categories.map(cat => `
            <div class="skill-category">
                <div class="header1"><p>${cat.categorie}</p></div>
                <div class="skills">
                    ${cat.skills
            .sort((a, b) => b.skills - a.skills)
            .map(skill => renderSkill(skill))
            .join("")}
                </div>
            </div>
        `).join("");
        $(".skills-container").innerHTML = html;
    } catch (err) {
        console.error("Fehler beim Laden der Skills:", err);
    }
}

function renderSkill(skill) {
    const { icon, name, skills, started } = skill;
    return `
        <div class="skill" data-started="${started}">
            <div class="skill-inner">
                <div><img src="${addFallbackImage(icon)}" title="${name}" loading="lazy"></div>
                <p>${name}</p>
                <div class="stars">${renderStars(skills, started)}</div>
            </div>
        </div>
    `;
}

function renderStars(rating, started) {
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    const empty = 5 - full - (half ? 1 : 0);

    const ranks = [
        "★ Basic Knowledge",
        "★★ Beginner",
        "★★★ Intermediate",
        "★★★★ Advanced",
        "★★★★★ Professional"
    ];
    const desc = ranks[full + (half ? 1 : 0) - 1] || "";

    return `
        <div class="stars" data-tooltip="${formatDuration(started)}\n${desc}">
            ${'★'.repeat(full)}
            ${half ? '<span class="star half">★</span>' : ''}
            ${'☆'.repeat(empty)}
        </div>
    `;
}

function formatDuration(startDate) {
    const [month, year] = startDate.split("-").map(Number);
    const start = new Date(year, month - 1);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) { years--; months += 12; }
    return years > 0 ? `${years} Jahr${years > 1 ? "e" : ""}` : `${months} Monat${months > 1 ? "e" : ""}`;
}

// === Age ===
function calculateAge(birthDateStr = "2006-02-17") {
    const birth = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
    $("#alter").textContent = age;
}

// === Gallery ===
async function loadGallery(category) {
    try {
        const images = await (await fetch("gallery/photos.json")).json();
        const gallery = $(".gallery");
        gallery.innerHTML = "";
        (images[category] || []).forEach(filename => {
            const img = document.createElement("img");
            Object.assign(img, {
                src: `gallery/${filename}`,
                alt: `${category} Photo`,
                className: "gallery-photo",
                loading: "lazy"
            });
            gallery.appendChild(img);
        });
    } catch (err) {
        console.error("Fehler beim Laden der Galerie:", err);
    }
}

function setupGallery() {
    window.addEventListener("DOMContentLoaded", () => {
        const active = localStorage.getItem("activeGalleryCategory") || "photography";
        updateGalleryButtons(active);
        loadGallery(active);
    });

    $$(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            removeClassFromAll($$(".nav-btn"), "selected");
            btn.classList.add("selected");
            const cat = btn.dataset.category;
            localStorage.setItem("activeGalleryCategory", cat);
            loadGallery(cat);
        });
    });
}

function updateGalleryButtons(activeCategory) {
    $$(".nav-btn").forEach(btn =>
        btn.classList.toggle("selected", btn.dataset.category === activeCategory)
    );
}

// === Scroll Spy & Progress ===
function setupScrollObserver() {
    const navLinks = $$(".nav-link");
    const sections = $$("section");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = `#${entry.target.id}`;
                navLinks.forEach(link =>
                    link.classList.toggle("active", link.getAttribute("href") === id)
                );
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));

    window.addEventListener("scroll", () => {
        if (window.scrollY === 0) {
            removeClassFromAll(navLinks, "active");
            navLinks[0]?.classList.add("active");
        }
        const scrollBar = $("#scroll-progress");
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        scrollBar.style.width = `${scrollPercent || 0}%`;
    });
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupGallery();
    setupScrollObserver();
    loadProjects();
    loadSkills();
    calculateAge();
});
