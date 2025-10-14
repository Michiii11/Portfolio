// === Constants & Initialization ===
const DEFAULT_CATEGORY = "programming";
let activeCategory = localStorage.getItem("activeCategory") || DEFAULT_CATEGORY;

// === Utility Functions ===
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const removeClassFromAll = (elements, className) => elements.forEach(el => el.classList.remove(className));
const addFallbackImage = img => img || "https://via.placeholder.com/150?text=No+Image";

// === Navigation Handling ===
function setupNavigation() {
    $$(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            removeClassFromAll($$(".nav-link"), "active");
            link.classList.add("active");
        });
    });

    window.addEventListener("DOMContentLoaded", () => {
        $$(".nav > div").forEach(div => {
            div.classList.toggle("active",
                (activeCategory === "programming" && div.textContent.includes("Programming")) ||
                (activeCategory === "filming" && div.textContent.includes("Filming"))
            );
        });
        loadProjects();
    });
}

function selectCategory(element, category) {
    removeClassFromAll($$(".nav > div"), "active");
    element.classList.add("active");
    activeCategory = category;
    localStorage.setItem("activeCategory", category);
    loadProjects();
}

// === Project Loading ===
async function loadProjects() {
    try {
        const response = await fetch("projects.json");
        const data = await response.json();
        const projects = data[activeCategory] || [];
        const html = projects.map(project => `
            <div class="project">
                <img src="${addFallbackImage(project.img)}" alt="${project.title}">
                <p>${project.title}${project.short_description ? ` - ${project.short_description}` : ""}</p>
                <div>
                    ${
            Array.isArray(project.links)
                ? project.links.map(link => `<a href="${link.url}" target="_blank">${link.name} →</a>`).join("")
                : `<a href="${project.link?.url || "#"}" target="_blank">${project.link?.name || "See more"} →</a>`
        }
                </div>
            </div>
        `).join("");
        $(".projects").innerHTML = html;
    } catch (error) {
        console.error("Fehler beim Laden der Projekte:", error);
    }
}

// === Skill Handling ===
async function loadSkills() {
    try {
        const response = await fetch("skills.json");
        const skills = await response.json();
        const html = skills.map(skill => `
            <div class="skill" data-started="${skill.started}">
                <div class="skill-inner">
                    <div>
                        <img src="${addFallbackImage(skill.icon)}" title="${skill.name}">
                    </div>
                    <p>${skill.name}</p>
                    <span class="skill-duration" style="display:none;"></span>
                </div>
            </div>
        `).join("");
        $(".skills").innerHTML = html;
    } catch (error) {
        console.error("Fehler beim Laden der Skills:", error);
    }
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
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    window.addEventListener("scroll", () => {
        if (window.scrollY === 0) {
            removeClassFromAll(navLinks, "active");
            navLinks[0]?.classList.add("active");
        }
    });
}

// === Initialization ===
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupGallery();
    setupScrollObserver();
    loadSkills();
    calculateAge();
});
