let activeCategory = localStorage.getItem('activeCategory') || "programming";

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

window.addEventListener('DOMContentLoaded', () => {
    // Alle Kategorien durchgehen und die richtige aktiv setzen
    document.querySelectorAll('.nav > div').forEach(div => {
        div.classList.remove('active');
        if (
            (activeCategory === "programming" && div.textContent.includes("Programming")) ||
            (activeCategory === "filming" && div.textContent.includes("Filming"))
        ) {
            div.classList.add('active');
        }
    });
    loadProjects();
});

function selectCategory(element, category) {
    document.querySelectorAll('.nav > div').forEach(div => {
        div.classList.remove('active');
    });
    element.classList.add('active');
    activeCategory = category;
    localStorage.setItem('activeCategory', category);
    loadProjects();
}

function loadProjects() {
    let projects = []
    fetch('projects.json')
        .then(response => response.json())
        .then(json => {
            if (activeCategory === "programming") {
                projects = json.programming
            } else {
                projects = json.filming
            }

            let html = ""
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                html += `
                <div class="project">
                    <img src="${project.img ? project.img : 'https://via.placeholder.com/150?text=No+Image'}">
                                        
                    <p>${project.title} ${project.short_description ? " - " : ""} ${project.short_description ? project.short_description : ""}</p>
                    <a href="${project.link}" target="_blank">See more -></a>
                </div>
                `
            }

            document.querySelector('.projects').innerHTML = html
        })
        .catch(error => console.error('Fehler beim Laden:', error));
}

loadSkills()
function formatDuration(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    return years > 0
        ? `${years} Jahr${years > 1 ? 'e' : ''}${months > 0 ? `, ${months} Monat${months > 1 ? 'e' : ''}` : ''}`
        : `${months} Monat${months > 1 ? 'e' : ''}`;
}

function loadSkills(){
    fetch('skills.json')
        .then(response => response.json())
        .then(json => {
            let html = "";
            for (let i = 0; i < json.length; i++) {
                const skill = json[i];
                html += `
                <div class="skill" data-started="${skill.started}">
                    <img src="${skill.icon ? skill.icon : 'https://via.placeholder.com/150?text=No+Image'}" title="${skill.name}">
                    <p>${skill.name}</p>
                    <span class="skill-tooltip" style="display:none;position:absolute;"></span>
                </div>
                `;
            }
            document.querySelector('.skills').innerHTML = html;

            document.querySelectorAll('.skill').forEach(el => {
                el.addEventListener('mouseenter', function(e) {
                    const started = el.getAttribute('data-started');
                    if (started) {
                        const tooltip = el.querySelector('.skill-tooltip');
                        tooltip.textContent = `Seit ${formatDuration(started)}`;
                        tooltip.style.display = 'block';
                        tooltip.style.left = '0';
                        tooltip.style.top = '100%';
                    }
                });
                el.addEventListener('mouseleave', function(e) {
                    const tooltip = el.querySelector('.skill-tooltip');
                    tooltip.style.display = 'none';
                });
            });
        })
        .catch(error => console.error('Fehler beim Laden:', error));
}

let activeGalleryCategory = localStorage.getItem('activeGalleryCategory') || "photos";
document.querySelectorAll('.gallery-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.gallery-nav .nav-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectCategory(this, this.dataset.category);
    });
});