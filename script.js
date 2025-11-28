// Element Selection
const bgMusic = document.getElementById('backgroundMusic');
const landingScreen = document.getElementById('landingScreen');
const mainContent = document.getElementById('mainContent');
const dateTimeElement = document.getElementById('dateTime');
const volumeControl = document.getElementById('volumeControl');
let volumeBars = document.querySelectorAll('.volume-bar');
const progressBar = document.getElementById('progressBar');
const backToTopButton = document.getElementById('backToTop');
const mainTitle = document.getElementById('mainTitle');
const particlesContainer = document.getElementById('matrixParticles');
const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const codingProjectsSection = document.getElementById('codingProjectsSection');
const projectPreview = document.getElementById('projectPreview');
const projectPreviewImage = projectPreview ? projectPreview.querySelector('img') : null;
const projectCards = codingProjectsSection ? codingProjectsSection.querySelectorAll('.project-card') : [];

// Global Variables
const maxMusicVolume = 1;
const defaultVolumeFraction = 0.2;
let isDragging = false;
let currentPlayingVideo = null;
let activeProjectCard = null;

// Carousel Data
const editsData = [
    { id: 'confession', src: 'recent_works/confession.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7577174486793866503', title: 'confession.mp4 // TikTok' },
    { id: 'cyrene', src: 'recent_works/cyrene.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7571472539432586503', title: 'cyrene.mp4 // TikTok' },
    { id: 'dispatch', src: 'recent_works/dispatch.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7575974752636947720', title: 'dispatch.mp4 // TikTok' },
    { id: 'rezedenji', src: 'recent_works/rezedenji.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7568189301809401106', title: 'rezedenji.mp4 // TikTok' },
    { id: 'waguri', src: 'recent_works/waguri.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7564582679925083410', title: 'waguri.mp4 // TikTok' },
];
const inspoData = [
    { id: 'nisekoi', src: 'inspo/nisekoi.mp4', link: 'https://www.tiktok.com/@artori.a/video/7571383570418257183', title: 'nisekoi.mp4 // TikTok' },
    { id: 'kaoruko', src: 'inspo/kaoruko.mp4', link: 'https://www.tiktok.com/@jpegezer/video/7558051207957318919', title: 'kaoruko.mp4 // TikTok' },
    { id: 'kaguya', src: 'inspo/kaguya1.mp4', link: 'https://www.tiktok.com/@dcomics0/video/7547897732103458062', title: 'kaguya1.mp4 // TikTok' },
    { id: 'slowburn', src: 'inspo/slowburn.mp4', link: 'https://www.tiktok.com/@ume4vrr/video/7530769478297193741', title: 'slowburn.mp4 // TikTok' },
    { id: 'fujino', src: 'inspo/fujino.mp4', link: 'https://www.tiktok.com/@.little.plantt/video/7551721368635690271', title: 'fujino.mp4 // TikTok' }
];

// Carousel Elements
const editsCarouselWrapper = document.getElementById('editsCarouselWrapper');
const visibleEditCards = Array.from(editsCarouselWrapper.children);
let currentEditIndex = 0;
const inspoCarouselWrapper = document.getElementById('inspoCarouselWrapper');
const visibleInspoCards = Array.from(inspoCarouselWrapper.children);
let currentInspoIndex = 1;

// Carousel Functions
function updateCarousel(wrapper, visibleCards, dataArray, currentIndex) {
    const totalData = dataArray.length;
    const leftDataIndex = (currentIndex - 1 + totalData) % totalData;
    const rightDataIndex = (currentIndex + 1) % totalData;
    const cardMap = [
        { card: visibleCards[0], dataIndex: leftDataIndex, position: 'side' },
        { card: visibleCards[1], dataIndex: currentIndex, position: 'center' },
        { card: visibleCards[2], dataIndex: rightDataIndex, position: 'side' }
    ];
    cardMap.forEach(item => {
        const data = dataArray[item.dataIndex];
        const videoElement = item.card.querySelector('video');
        const linkElement = item.card.querySelector('.video-tiktok-bottom');
        const sourceElement = videoElement.querySelector('source');
        const currentSrc = sourceElement.getAttribute('src');
        if (currentSrc !== data.src) {
            sourceElement.src = data.src;
            videoElement.load();
        }
        linkElement.href = data.link;
        linkElement.querySelector('span').textContent = data.title;
        item.card.setAttribute('data-position', item.position);
        videoElement.muted = true;
        videoElement.play().catch(e => {
            if (e.name !== 'NotAllowedError') console.log("Background play restriction:", e);
        });
    });
}

function rotateCarousel(direction) {
    const prevBtn = document.getElementById('prevEdit');
    const nextBtn = document.getElementById('nextEdit');
    if (editsCarouselWrapper.classList.contains('transitioning')) return;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    editsCarouselWrapper.classList.add('transitioning');
    const isNext = direction > 0;
    const exitClass = isNext ? 'exiting-next' : 'exiting-prev';
    const enterClass = isNext ? 'entering-next' : 'entering-prev';
    const currentCenter = visibleEditCards.find(card => card.getAttribute('data-position') === 'center');
    if (currentCenter) currentCenter.classList.add(exitClass);
    requestAnimationFrame(() => {
        setTimeout(() => {
            currentEditIndex = (currentEditIndex + direction + editsData.length) % editsData.length;
            updateCarousel(editsCarouselWrapper, visibleEditCards, editsData, currentEditIndex);
            requestAnimationFrame(() => {
                const newCenter = visibleEditCards.find(card => card.getAttribute('data-position') === 'center');
                if (newCenter) newCenter.classList.add(enterClass);
            });
        }, 100);
    });
    setTimeout(() => {
        if (currentCenter) currentCenter.classList.remove(exitClass);
        const newCenter = visibleEditCards.find(card => card.getAttribute('data-position') === 'center');
        if (newCenter) newCenter.classList.remove(enterClass);
        editsCarouselWrapper.classList.remove('transitioning');
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }, 900);
}

function rotateInspoCarousel(direction) {
    const prevBtn = document.getElementById('prevInspo');
    const nextBtn = document.getElementById('nextInspo');
    if (inspoCarouselWrapper.classList.contains('transitioning')) return;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    inspoCarouselWrapper.classList.add('transitioning');
    const isNext = direction > 0;
    const exitClass = isNext ? 'exiting-next' : 'exiting-prev';
    const enterClass = isNext ? 'entering-next' : 'entering-prev';
    const currentCenter = visibleInspoCards.find(card => card.getAttribute('data-position') === 'center');
    if (currentCenter) currentCenter.classList.add(exitClass);
    requestAnimationFrame(() => {
        setTimeout(() => {
            currentInspoIndex = (currentInspoIndex + direction + inspoData.length) % inspoData.length;
            updateCarousel(inspoCarouselWrapper, visibleInspoCards, inspoData, currentInspoIndex);
            requestAnimationFrame(() => {
                const newCenter = visibleInspoCards.find(card => card.getAttribute('data-position') === 'center');
                if (newCenter) newCenter.classList.add(enterClass);
            });
        }, 100);
    });
    setTimeout(() => {
        if (currentCenter) currentCenter.classList.remove(exitClass);
        const newCenter = visibleInspoCards.find(card => card.getAttribute('data-position') === 'center');
        if (newCenter) newCenter.classList.remove(enterClass);
        inspoCarouselWrapper.classList.remove('transitioning');
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }, 900);
}

// Clock & UI
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).toLowerCase().replace(/ /g, '');
    const dateString = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    dateTimeElement.textContent = `[ ${timeString} ] - [ ${dateString} ]`;
}
updateDateTime();
setInterval(updateDateTime, 1000);

// Scroll Logic
function updateScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / totalHeight) * 100 + "%";
    if (window.scrollY > 400) {
        backToTopButton.style.display = 'flex';
        backToTopButton.style.opacity = 1;
    } else {
        backToTopButton.style.opacity = 0;
        setTimeout(() => { if (window.scrollY < 400) backToTopButton.style.display = 'none'; }, 300);
    }
    checkSectionsVisibility();
    if (activeProjectCard) positionProjectPreview(activeProjectCard);
}
window.addEventListener('scroll', updateScroll);
window.addEventListener('resize', updateScroll);
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// Scroll Reveal Animation
const sections = document.querySelectorAll('.section');
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
const delayMap = {
    'About Me': 0.0, 'Skills & Stack': 0.1, 'Coding Projects': 0.2,
    'Inspo': 0.3, 'Edits Log': 0.4, 'Socials': 0.5
};
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const section = entry.target;
            const titleText = section.querySelector('.section-title')?.textContent.trim();
            section.style.transitionDelay = `${delayMap[titleText] || 0.0}s`;
            section.classList.add('is-visible');
            observer.unobserve(section);
        }
    });
}, observerOptions);
function checkSectionsVisibility() { sections.forEach(section => observer.observe(section)); }

// Glitch Effect
function applyGlitch(element) {
    if (Math.random() < 0.6) element.classList.add('glitch-flicker');
    setTimeout(() => element.classList.remove('glitch-flicker'), 100 + Math.random() * 200);
}
function periodicGlitch() {
    applyGlitch(mainTitle);
    const allTitles = document.querySelectorAll('.section-title');
    if (allTitles.length > 0) applyGlitch(allTitles[Math.floor(Math.random() * allTitles.length)]);
    setTimeout(periodicGlitch, 3000 + Math.random() * 7000);
}

// Matrix Particles
function generateParticles(count) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    particlesContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const x1 = Math.random() * viewportWidth;
        const y1 = Math.random() * viewportHeight;
        const x2 = Math.random() * viewportWidth;
        const y2 = y1 + viewportHeight / 2;
        particle.style.setProperty('--x1', `${x1}px`);
        particle.style.setProperty('--y1', `${y1}px`);
        particle.style.setProperty('--x2', `${x2}px`);
        particle.style.setProperty('--y2', `${y2}px`);
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.left = `${x1}px`;
        particle.style.top = `${y1}px`;
        particlesContainer.appendChild(particle);
    }
}

// Volume Control
function updateVolumeBars(volumeFraction) {
    const totalBars = volumeBars.length;
    const activeBars = Math.round(volumeFraction * totalBars);
    volumeBars.forEach((bar, index) => {
        const isActive = index < activeBars;
        bar.classList.toggle('active', isActive);
        if (index === totalBars - 1 && isActive) {
            bar.style.background = 'white';
            bar.style.boxShadow = '0 0 10px white, 0 0 20px rgba(255, 255, 255, 0.5)';
        } else {
            bar.style.background = isActive ? 'var(--color-red)' : 'rgba(255, 255, 255, 0.1)';
            bar.style.boxShadow = isActive ? '0 0 5px var(--color-red)' : 'none';
        }
    });
}

function handleDrag(event) {
    if (!isDragging) return;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const rect = volumeControl.getBoundingClientRect();
    let volumeFraction = 1 - ((clientY - rect.top) / rect.height);
    volumeFraction = Math.max(0, Math.min(1, volumeFraction));
    bgMusic.volume = volumeFraction * maxMusicVolume;
    updateVolumeBars(volumeFraction);
    event.preventDefault();
}

function startDrag(event) { isDragging = true; volumeControl.classList.add('active'); handleDrag(event); }
function stopDrag() { isDragging = false; volumeControl.classList.remove('active'); }

volumeControl.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', stopDrag);
volumeControl.addEventListener('touchstart', (e) => startDrag(e), { passive: false });
document.addEventListener('touchmove', handleDrag, { passive: false });
document.addEventListener('touchend', stopDrag);

// Project Preview
function positionProjectPreview(card) {
    if (!codingProjectsSection || !projectPreview) return;
    const sectionRect = codingProjectsSection.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const previewWidth = projectPreview.offsetWidth;
    const previewHeight = projectPreview.offsetHeight;
    let top = cardRect.top - sectionRect.top - previewHeight - 20;
    if (top < 20) top = cardRect.bottom - sectionRect.top + 20;
    let left = cardRect.left - sectionRect.left + (cardRect.width / 2) - (previewWidth / 2);
    const maxLeft = codingProjectsSection.clientWidth - previewWidth - 20;
    left = Math.max(20, Math.min(left, maxLeft));
    projectPreview.style.top = `${top}px`;
    projectPreview.style.left = `${left}px`;
}

function updateProjectSectionSpace() {
    if (!codingProjectsSection || !projectPreview || !projectPreview.classList.contains('is-visible')) return;
    const previewHeight = projectPreview.offsetHeight || projectPreview.scrollHeight || 0;
    codingProjectsSection.style.setProperty('--project-preview-space', `${previewHeight + 80}px`);
}

function showProjectPreview(card) {
    if (!projectPreview || !projectPreviewImage) return;
    const previewSrc = card.getAttribute('data-preview');
    if (!previewSrc) return;
    const titleElement = card.querySelector('.project-title');
    const projectTitle = titleElement ? titleElement.textContent.trim() : 'Project';
    if (projectPreviewImage.dataset.currentPreview !== previewSrc) {
        projectPreviewImage.src = previewSrc;
        projectPreviewImage.dataset.currentPreview = previewSrc;
        projectPreviewImage.onload = () => { if (activeProjectCard === card) updateProjectSectionSpace(); };
    }
    projectPreviewImage.alt = `${projectTitle} preview screenshot`;
    requestAnimationFrame(() => {
        positionProjectPreview(card);
        projectPreview.classList.add('is-visible');
        projectPreview.setAttribute('aria-hidden', 'false');
        if (codingProjectsSection) {
            codingProjectsSection.classList.add('preview-active');
            updateProjectSectionSpace();
        }
    });
    if (projectPreviewImage.complete && projectPreviewImage.naturalHeight !== 0) updateProjectSectionSpace();
}

function hideProjectPreview() {
    if (!projectPreview) return;
    projectPreview.classList.remove('is-visible');
    projectPreview.setAttribute('aria-hidden', 'true');
    activeProjectCard = null;
    if (codingProjectsSection) {
        codingProjectsSection.classList.remove('preview-active');
        codingProjectsSection.style.setProperty('--project-preview-space', '0px');
    }
}

projectCards.forEach(card => {
    const showPreview = () => { activeProjectCard = card; showProjectPreview(card); };
    card.addEventListener('mouseenter', showPreview);
    card.addEventListener('focus', showPreview);
    card.addEventListener('mousemove', () => { if (activeProjectCard === card) positionProjectPreview(card); });
    card.addEventListener('mouseleave', hideProjectPreview);
    card.addEventListener('blur', hideProjectPreview);
    card.addEventListener('touchstart', showPreview, { passive: true });
    card.addEventListener('touchend', hideProjectPreview);
});

window.addEventListener('resize', () => {
    if (activeProjectCard) {
        positionProjectPreview(activeProjectCard);
        updateProjectSectionSpace();
    }
});

// Site Transition
function tryPlayingAllVideos() {
    const videosToPlay = [...visibleEditCards, ...visibleInspoCards].map(card => card.querySelector('video'));
    videosToPlay.forEach(video => {
        if (video && mainContent.classList.contains('fade-in-content')) {
            video.play().catch(e => {
                if (e.name !== 'NotAllowedError') console.error(`Video autoplay failed:`, e);
            });
        }
    });
}

function enterSite() {
    bgMusic.volume = defaultVolumeFraction * maxMusicVolume;
    bgMusic.currentTime = 58;
    bgMusic.play().catch(e => console.error("Audio play failed on site entry click:", e));
    landingScreen.classList.add('fade-out-landing');
    particlesContainer.classList.add('active');
    setTimeout(() => {
        mainContent.classList.add('fade-in-content');
        tryPlayingAllVideos();
        checkSectionsVisibility();
        periodicGlitch();
    }, 500);
    setTimeout(() => { landingScreen.style.display = 'none'; landingScreen.remove(); }, 1500);
}

window.onload = () => {
    // Generate volume bars
    for (let i = 0; i < 10; i++) {
        const bar = document.createElement('div');
        bar.className = 'volume-bar';
        bar.setAttribute('data-index', i);
        volumeControl.appendChild(bar);
    }
    volumeBars = document.querySelectorAll('.volume-bar');
    generateParticles(100);
    updateScroll();
    updateVolumeBars(defaultVolumeFraction);
    updateCarousel(editsCarouselWrapper, visibleEditCards, editsData, currentEditIndex);
    updateCarousel(inspoCarouselWrapper, visibleInspoCards, inspoData, currentInspoIndex);
};

// Modal Functions
function openModal(videoElement) {
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.play().catch(e => {
        if (e.name !== 'NotAllowedError') console.error(`Video play failed on click (reset):`, e);
    });
    bgMusic.pause();
    currentPlayingVideo = videoElement;
    modalVideo.querySelector('source').src = videoElement.querySelector('source').src;
    modalVideo.load();
    modalVideo.currentTime = 0;
    modalVideo.muted = false;
    modal.style.display = "flex";
    modalVideo.play();
}

function closeModal() {
    modalVideo.pause();
    if (currentPlayingVideo) {
        currentPlayingVideo.currentTime = modalVideo.currentTime;
        currentPlayingVideo.play();
    }
    modal.style.display = "none";
    modalVideo.querySelector('source').src = "";
    modalVideo.load();
    bgMusic.play().catch(e => console.error("Audio play failed on modal close:", e));
}

document.addEventListener('keydown', (event) => {
    if (event.key === "Escape" && modal.style.display === "flex") closeModal();
});
