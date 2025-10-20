// === Constants & Initialization ===
// === Utility Functions ===
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const removeClassFromAll = (elements, className) => elements.forEach(el => el.classList.remove(className));
const addFallbackImage = img => img || "https://via.placeholder.com/150?text=No+Image";

// === Navigation Handling ===
function setupNavigation() {
    $$(".nav-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

// === Project Loading ===
function renderProjects(projects) {
    return projects.map(project => `
        <div class="project">
            <img src="${addFallbackImage(project.img)}" alt="${project.title}">
            <p>${project.title}${project.short_description ? ` - ${project.short_description}` : ""}</p>
            <div>
                ${
                    Array.isArray(project.links)
                        ? project.links.map(link => `<a href="${link.url}" target="_blank">${link.name}</a>`).join("")
                        : `<a href="${project.link?.url || "#"}" target="_blank">${project.link?.name || "See more ->"}</a>`
                }
            </div>
        </div>
    `).join("");
}

let maxVisible = 6;

function getMaxVisible() {
    const width = window.innerWidth;
    if (width <= 650) return 2;
    if (width <= 1200) return 4;
    return 6;
}

function updateMaxVisible() {
    const newValue = getMaxVisible();
    if (newValue !== maxVisible) {
        maxVisible = newValue;
    }
}

updateMaxVisible();

window.addEventListener("resize", updateMaxVisible);

const ro = new ResizeObserver(updateMaxVisible);
ro.observe(document.documentElement);


function renderLimitedProjects(projects, container, button) {
    let isExpanded = false;

    const updateProjects = () => {
        if(projects.length <= maxVisible) {
            button.style.display = "none";
        } else {
            button.style.display = "block";
        }

        const visibleProjects = isExpanded ? projects : projects.slice(0, maxVisible);
        container.innerHTML = renderProjects(visibleProjects);

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
        const response = await fetch("projects.json");
        const data = await response.json();

        // Projekte für jede Kategorie laden
        const programmingContainer = document.querySelector(".programming .content");
        const programmingButton = document.getElementById("show-all-programming");
        renderLimitedProjects(data.programming, programmingContainer, programmingButton);

        const filmingContainer = document.querySelector(".filming .content");
        const filmingButton = document.getElementById("show-all-filming");
        renderLimitedProjects(data.filming, filmingContainer, filmingButton);
    } catch (error) {
        console.error("Fehler beim Laden der Projekte:", error);
    }
}

// === Skill Handling ===
async function loadSkills() {
    try {
        const response = await fetch("skills.json");
        const categories = await response.json();

        const html = categories.map(category => `
            <div class="skill-category">
                <div class="header1">
                    <p>${category.categorie}</p>
                </div>
                <div class="skills">
                    ${category.skills.sort((a, b) => b.skills - a.skills).map(skill => `
                        <div class="skill" data-started="${skill.started}">
                            <div class="skill-inner">
                                <div>
                                    <img src="${addFallbackImage(skill.icon)}" title="${skill.name}">
                                </div>
                                <p>${skill.name}</p>
                                <div class="stars">
                                    ${renderStars(skill.skills, skill.started)}
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `).join("");

        $(".skills-container").innerHTML = html;
    } catch (error) {
        console.error("Fehler beim Laden der Skills:", error);
    }
}

function renderStars(rating, started) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return `
        <div class="stars" data-tooltip="Seit ${formatDuration(started)}">
            ${'<span class="star full">★</span>'.repeat(fullStars)}
            ${halfStar ? '<span class="star half">★</span>' : ''}
            ${'<span class="star empty">☆</span>'.repeat(emptyStars)}
        </div>
    `;
}

function formatDuration(startDate) {
    const [month, year] = startDate.split("-").map(Number);
    const start = new Date(year, month - 1);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    return years > 0
        ? `${years} Jahr${years > 1 ? "e" : ""}`
        : `${months} Monat${months > 1 ? "e" : ""}`;
}

// === Age Calculation ===
function calculateAge(birthDateStr = "2006-02-17") {
    const birth = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
    $("#alter").textContent = age;
}

// === Gallery Handling ===
async function loadGallery(category) {
    try {
        const response = await fetch("gallery/photos.json");
        const images = await response.json();
        const gallery = $(".gallery");
        gallery.innerHTML = "";

        const selectedImages = images[category] || [];
        selectedImages.forEach(filename => {
            const img = document.createElement("img");
            img.src = `gallery/${filename}`;
            img.alt = `${category} Photo`;
            img.className = "gallery-photo";
            gallery.appendChild(img);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Galerie:", error);
    }
}

function setupGallery() {
    window.addEventListener("DOMContentLoaded", () => {
        const activeGallery = localStorage.getItem("activeGalleryCategory") || "photography";
        updateGalleryButtons(activeGallery);
        loadGallery(activeGallery);
    });

    $$(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            removeClassFromAll($$(".nav-btn"), "selected");
            btn.classList.add("selected");
            const category = btn.dataset.category;
            localStorage.setItem("activeGalleryCategory", category);
            loadGallery(category);
        });
    });
}

function updateGalleryButtons(activeCategory) {
    $$(".nav-btn").forEach(btn =>
        btn.classList.toggle("selected", btn.dataset.category === activeCategory)
    );
}

// === Section Highlighting on Scroll ===
function setupScrollObserver() {
    const navLinks = $$(".nav-link");
    const sections = $$("section");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = `#${entry.target.id}`;
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === id);
                });
            }
        });
    }, { threshold: 0.1 }); // Kleinerer Schwellenwert für Mobile

    sections.forEach(section => observer.observe(section));

    window.addEventListener("scroll", () => {
        if (window.scrollY === 0) {
            removeClassFromAll(navLinks, "active");
            navLinks[0]?.classList.add("active");
        }

        const scrollBar = document.getElementById('scroll-progress');
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollBar.style.width = scrollPercent + '%';
    });
}

// === Initialization ===
document.addEventListener("DOMContentLoaded", () => {
    loadProjects()
    setupNavigation();
    setupGallery();
    setupScrollObserver();
    loadSkills();
    calculateAge();
});
