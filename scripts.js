// Fonction pour lister les fichiers YAML dans le dossier projects
async function listProjectFiles() {
    try {
        const response = await fetch('/projects/');
        if (!response.ok) {
            console.error('Failed to list project files');
            return ['project1.yaml', 'project2.yaml']; // Fallback
        }
        const files = await response.json();
        return files.filter(file => file.endsWith('.yaml'));
    } catch (error) {
        console.error('Error listing project files:', error);
        return ['project1.yaml', 'project2.yaml']; // Fallback
    }
}

// Fonction pour charger un fichier YAML
async function loadYamlFile(filename) {
    try {
        const response = await fetch(`./projects/${filename}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
}

// Fonction pour charger tous les projets
async function loadProjects() {
    try {
        // Liste statique des projets
        const projectFiles = [
            'project1.yaml',
            'project2.yaml',
            'project3.yaml',
            'project4.yaml',
            'project5.yaml',
            'project6.yaml',
            'project7.yaml'
        ];
        
        const projects = [];
        
        for (const file of projectFiles) {
            const project = await loadYamlFile(file);
            if (project) {
                projects.push(project);
            }
        }
        
        // Trier les projets par date (du plus récent au plus ancien)
        projects.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return projects;
    } catch (error) {
        console.error('Error loading projects:', error);
        return [];
    }
}

// Fonction pour charger la configuration
async function loadConfig() {
    try {
        const response = await fetch('./config.yaml');
        const yamlText = await response.text();
        return jsyaml.load(yamlText);
    } catch (error) {
        console.error('Error loading config:', error);
        return null;
    }
}

// Fonction pour créer les liens sociaux
function createSocialLinks(config) {
    const container = document.querySelector('.social-links');
    if (!container || !config.social_links) return;

    const links = config.social_links.map(link => `
        <a href="${link.url}" 
           class="social-link" 
           target="_blank" 
           rel="noopener noreferrer"
           title="${link.name}">
            <img src="${link.icon}" alt="${link.name}">
        </a>
    `).join('');

    container.innerHTML = links;
}

// Création des sections de projet
function createProjectSections(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    
    projects.forEach((project, index) => {
        const section = `
            <section id="${project.id}" 
                     class="parallax-section project-section" 
                     data-scroll-section
                     data-scroll
                     data-scroll-snap-type="proximity"
                     data-scroll-call="inview">
                <div class="parallax-bg" data-scroll data-scroll-speed="-4" 
                     style="background-image: url('${project.bgImage}');">
                    <div class="overlay"></div>
                </div>
                <div class="project-content">
                    <div class="project-info">
                        <h2 class="text-5xl font-bold mb-6">${project.title}</h2>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${project.categories.map(cat => `
                                <span class="category-badge ${cat.color}">
                                    ${cat.name}
                                </span>
                            `).join('')}
                        </div>

                        <p class="text-gray-300 text-lg mb-8">${project.description}</p>
                        
                        <div class="mb-6">
                            <p class="text-gray-400">
                                ${project.date} • ${project.duration}
                            </p>
                        </div>

                        <div class="tech-icons mb-8">
                            ${project.technologies.map(tech => `
                                <div class="tech-item" title="${tech.name}">
                                    <div class="tech-icon">
                                        <img src="${tech.icon}" alt="${tech.name}">
                                    </div>
                                    <span class="tech-name">${tech.name}</span>
                                </div>
                            `).join('')}
                        </div>

                        <a href="${project.link}" class="view-project-btn">
                            View Project
                        </a>
                    </div>

                    <div class="project-gallery">
                        <div class="swiper project-swiper-${index}">
                            <div class="swiper-wrapper">
                                ${project.images.map(img => `
                                    <div class="swiper-slide">
                                        <a href="${img.url}" 
                                           class="glightbox" 
                                           data-gallery="gallery-${project.id}"
                                           data-glightbox="type: image; effect: fade;">
                                            <img src="${img.thumb}" 
                                                 alt="${project.title}" 
                                                 class="project-image"
                                                 loading="lazy">
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="swiper-pagination"></div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-button-next"></div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        container.insertAdjacentHTML('beforeend', section);
    });
}

// Initialisation des Swipers
function initSwipers(projectsCount) {
    for (let i = 0; i < projectsCount; i++) {
        new Swiper(`.project-swiper-${i}`, {
            slidesPerView: 1,
            spaceBetween: 30,
            grabCursor: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            }
        });
    }
}

// Initialisation de la Lightbox
function initLightbox() {
    GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: true,
        preload: true,
        moreLength: 0,
        cssEfects: {
            fade: {
                in: 'fadeIn',
                out: 'fadeOut'
            }
        },
        touchFollowAxis: true,
        keyboardNavigation: true,
        closeOnOutsideClick: true,
        openEffect: 'fade',
        closeEffect: 'fade',
        draggable: true,
        dragToleranceX: 50,
        dragToleranceY: 50
    });
}

// Variable globale pour garder la progression maximale
let maxProgressHeight = 0;

// Fonction pour créer la timeline
function createTimeline(projects) {
    const timelineTrack = document.querySelector('.timeline-track');
    if (!timelineTrack) return;

    // Trouver la plage de dates
    const dates = projects.map(p => new Date(p.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Reculer de 6 mois avant le premier projet
    minDate.setMonth(minDate.getMonth() - 6);
    
    // Créer les marqueurs de mois
    const monthMarkersContainer = document.querySelector('.year-markers');
    const months = [];
    let currentDate = new Date(minDate);
    const totalMonths = monthsBetween(minDate, maxDate);
    
    while (currentDate <= maxDate) {
        const position = 100 - ((monthsBetween(minDate, currentDate)) / totalMonths) * 100;
        months.push({
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
            isYearStart: currentDate.getMonth() === 0 || 
                        currentDate.getTime() === minDate.getTime(),
            position: position
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Créer les marqueurs
    monthMarkersContainer.innerHTML = months.map(({year, month, isYearStart, position}) => `
        <div class="time-marker ${isYearStart ? 'year-marker' : 'month-marker'}"
             style="top: ${position}%">
            ${isYearStart ? year : ''}
        </div>
    `).join('');

    // Créer les marqueurs de projet
    const projectMarkersContainer = document.querySelector('.project-markers');

    projects.forEach(project => {
        const projectDate = new Date(project.date);
        const position = 100 - (monthsBetween(minDate, projectDate) / totalMonths) * 100;

        const marker = document.createElement('div');
        marker.className = 'project-marker';
        marker.setAttribute('data-section', project.id);
        marker.style.top = `${position}%`;
        marker.style.background = project.color || '#FF6B6B';

        // Créer la carte de prévisualisation
        const preview = document.createElement('div');
        preview.className = 'project-preview';
        preview.innerHTML = `
            <div class="project-preview-image" 
                 style="background-image: url('${project.images[0].thumb}')">
            </div>
            <div class="project-preview-title">${project.title}</div>
            <div class="project-preview-techs">
                ${project.technologies.map(tech => `
                    <span class="project-preview-tech">${tech.name}</span>
                `).join('')}
            </div>
        `;
        marker.appendChild(preview);

        marker.addEventListener('click', () => {
            const scroll = window._locomotiveScroll;
            const target = document.getElementById(project.id);
            if (target && scroll) {
                scroll.scrollTo(target, {
                    duration: 1000,
                    easing: [0.16, 1, 0.3, 1]
                });
            }
        });

        projectMarkersContainer.appendChild(marker);
    });
}

// Fonction utilitaire pour calculer le nombre de mois entre deux dates
function monthsBetween(d1, d2) {
    return (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
}

// Fonction utilitaire pour obtenir l'abréviation du mois
function getMonthAbbreviation(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month];
}

// Fonction pour formater la date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${getMonthAbbreviation(date.getMonth())} ${date.getFullYear()}`;
}

// Modifier la fonction de mise à jour de la progression
function updateTimelineProgress(currentSection) {
    const progressBar = document.querySelector('.timeline-progress');
    const markers = document.querySelectorAll('.project-marker');

    // Si on est sur l'intro, garder la progression actuelle
    if (currentSection === 'intro') {
        markers.forEach(marker => {
            marker.classList.remove('active');
        });
        return;
    }

    // Trouver le point actif et calculer la progression
    markers.forEach(marker => {
        const position = parseFloat(marker.style.top);
        
        if (marker.dataset.section === currentSection) {
            marker.classList.add('active');
            marker.classList.remove('scrolled');
            // Mettre à jour la progression maximale si on monte plus haut
            maxProgressHeight = Math.max(maxProgressHeight, position);
        } else if (position <= maxProgressHeight) {
            // Les points déjà passés
            marker.classList.add('scrolled');
            marker.classList.remove('active');
        } else {
            // Les points pas encore atteints
            marker.classList.remove('scrolled', 'active');
        }
    });

    // Toujours garder la hauteur maximale atteinte
    progressBar.style.height = `${maxProgressHeight}%`;

    // Mettre à jour l'attribut sur le body pour le scroll indicator
    document.body.setAttribute('data-current-section', currentSection);
}

// Ajouter une variable pour suivre l'animation en cours
let isScrolling = false;

function initSmoothScroll() {
    const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]'),
        smooth: true,
        multiplier: 1,
        lerp: 0.05,
        smartphone: { smooth: true },
        tablet: { smooth: true },
        direction: 'vertical',
        scrollFromAnywhere: false,
        getDirection: true
    });

    window._locomotiveScroll = scroll;
    
    let currentSectionIndex = 0;
    const sections = document.querySelectorAll('section');
    
    function scrollToSection(index) {
        if (isScrolling || index < 0 || index >= sections.length) return;
        
        isScrolling = true;
        currentSectionIndex = index;
        const currentSection = sections[index].id;
        
        scroll.scrollTo(sections[index], {
            duration: 1500,
            offset: 0,
            easing: [0.645, 0.045, 0.355, 1],
            disableLerp: false,
            callback: () => {
                updateTimelineProgress(currentSection);
                setTimeout(() => {
                    isScrolling = false;
                }, 150);
            }
        });
    }

    let touchStartY = 0;
    let lastScrollTime = 0;
    const scrollCooldown = 100;

    window.addEventListener('wheel', (e) => {
        if (isScrolling || Date.now() - lastScrollTime < scrollCooldown) {
            e.preventDefault();
            return;
        }

        lastScrollTime = Date.now();
        if (Math.abs(e.deltaY) > 10) {
            if (e.deltaY > 0) {
                scrollToSection(currentSectionIndex + 1);
            } else {
                scrollToSection(currentSectionIndex - 1);
            }
        }
    }, { passive: false });

    // Gérer les touches du clavier
    window.addEventListener('keydown', (e) => {
        if (isScrolling) return;
        
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            scrollToSection(currentSectionIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            scrollToSection(currentSectionIndex - 1);
        }
    });

    // Gérer le scroll tactile
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isScrolling) {
            e.preventDefault();
            return;
        }

        const touchEndY = e.touches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 50) { // Seuil de défilement
            if (diff > 0) {
                scrollToSection(currentSectionIndex + 1);
            } else {
                scrollToSection(currentSectionIndex - 1);
            }
        }
    }, { passive: false });

    return scroll;
}

// Initialisation principale
async function init() {
    try {
        // Charger la configuration
        const config = await loadConfig();
        if (config) {
            // Mettre à jour le titre et sous-titre
            document.querySelector('h1.gradient-text').textContent = config.title;
            document.querySelector('p.text-2xl').textContent = config.subtitle;
            
            createSocialLinks(config);
        }

        // Charger les projets depuis les fichiers YAML
        const projects = await loadProjects();
        if (!projects.length) {
            throw new Error('No projects loaded');
        }

        // Créer les sections
        createProjectSections(projects);
        
        // Initialiser Locomotive Scroll
        const scroll = initSmoothScroll();
        
        // Initialiser les composants après un court délai
        setTimeout(() => {
            initSwipers(projects.length);
            initLightbox();
            scroll.update();
        }, 500); // Augmenté le délai à 500ms

        // Navigation fluide
        document.querySelector('.nav-link').addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(e.target.getAttribute('href'));
            scroll.scrollTo(target, {
                offset: 0,
                duration: 1000,
                easing: [0.16, 1, 0.3, 1]
            });
        });

        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            scroll.update();
        });

        // Créer la timeline
        createTimeline(projects);

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Fonction de débogage
function debugProjectLoading() {
    console.log('DOM Content Loaded');
    console.log('Projects directory structure:', {
        projectsDir: '/projects',
        files: ['project1.yaml', 'project2.yaml']
    });
    
    // Tester l'accès aux fichiers YAML
    fetch('/projects/project1.yaml')
        .then(response => {
            console.log('Project1 YAML response:', response);
            return response.text();
        })
        .then(text => {
            console.log('Project1 YAML content:', text);
        })
        .catch(error => {
            console.error('Error accessing project1.yaml:', error);
        });
}

// Ajouter à l'initialisation
document.addEventListener('DOMContentLoaded', () => {
    debugProjectLoading();
    init();
}); 