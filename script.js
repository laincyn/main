// --- Element Selection ---
const bgMusic = document.getElementById('backgroundMusic');
const landingScreen = document.getElementById('landingScreen');
const mainContent = document.getElementById('mainContent');
const dateTimeElement = document.getElementById('dateTime');
const volumeControl = document.getElementById('volumeControl');
const volumeBars = document.querySelectorAll('.volume-bar');
const progressBar = document.getElementById('progressBar');
const backToTopButton = document.getElementById('backToTop');
const mainTitle = document.getElementById('mainTitle');
const particlesContainer = document.getElementById('matrixParticles');
const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');

// - GLOBAL VARIABLES , CONSTANTS ARE PLACED HERE
const maxMusicVolume = 1; 
const defaultVolumeFraction = 0.2;
let isDragging = false;
let currentPlayingVideo = null; 

// CAROUSEL 1 . EDITS LOG DATA
const editsData = [
    { id: 'confession', src: 'recent_works/confession.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7577174486793866503', title: 'confession.mp4 // TikTok' },
    { id: 'cyrene', src: 'recent_works/cyrene.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7571472539432586503', title: 'cyrene.mp4 // TikTok' },
    { id: 'dispatch', src: 'recent_works/dispatch.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7575974752636947720', title: 'dispatch.mp4 // TikTok' },
    { id: 'rezedenji', src: 'recent_works/rezedenji.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7568189301809401106', title: 'rezedenji.mp4 // TikTok' },
    { id: 'waguri', src: 'recent_works/waguri.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7564582679925083410', title: 'waguri.mp4 // TikTok' },
];

// CAROUSEL 2: INSPO DATA
const inspoData = [
    { id: 'nisekoi', src: 'inspo/nisekoi.mp4', link: 'https://www.tiktok.com/@artori.a/video/7571383570418257183', title: 'nisekoi.mp4 // TikTok' },
    { id: 'kaoruko', src: 'inspo/kaoruko.mp4', link: 'https://www.tiktok.com/@jpegezer/video/7558051207957318919', title: 'kaoruko.mp4 // TikTok' },
    { id: 'kaguya', src: 'inspo/kaguya1.mp4', link: 'https://www.tiktok.com/@dcomics0/video/7547897732103458062', title: 'kaguya1.mp4 // TikTok' },
    { id: 'slowburn', src: 'inspo/slowburn.mp4', link: 'https://www.tiktok.com/@ume4vrr/video/7530769478297193741', title: 'slowburn.mp4 // TikTok' },
    { id: 'fujino', src: 'inspo/fujino.mp4', link: 'https://www.tiktok.com/@.little.plantt/video/7551721368635690271', title: 'fujino.mp4 // TikTok' }
];

// Elements for Edits Carousel
const editsCarouselWrapper = document.getElementById('editsCarouselWrapper');
const visibleEditCards = Array.from(editsCarouselWrapper.children); 
let currentEditIndex = 0; 

// Elements for Inspo Carousel
const inspoCarouselWrapper = document.getElementById('inspoCarouselWrapper');
const visibleInspoCards = Array.from(inspoCarouselWrapper.children);
let currentInspoIndex = 1; // Start at index 1 (Kaguya) as requested

// -> CAROUSEL FUNCTIONS (GENERIC LOGIC)

/**
 * CAROUSEL FUNCTION < [1], [2], [3]
 */
function updateCarousel(wrapper, visibleCards, dataArray, currentIndex) {
    const totalData = dataArray.length;
    
    // MAP CURRENT INDEX LEFT TO RIGHT [->][<-]
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

        // updates content IF source changed
        // RELOAD IF SOURCE, TO AVOID FLICKERING VID <----
        const currentSrc = sourceElement.getAttribute('src');
        if (currentSrc !== data.src) {
            sourceElement.src = data.src;
            videoElement.load(); 
        }

        linkElement.href = data.link;
        linkElement.querySelector('span').textContent = data.title;
        
        // VISUAL STATE
        item.card.setAttribute('data-position', item.position);
        
        item.card.setAttribute('data-position', item.position)
        videoElement.play().catch


        // --- UPDATED PLAYBACK LOGIC ---
        // Play ALL videos (Center AND Sides)
        videoElement.muted = true; 
        videoElement.play().catch(e => {
            // IF AUTOPLAY FAIL
            if (e.name !== 'NotAllowedError') console.log("Background play restriction:", e);
        });
    });
}

// WRAPPER FUNC for (EDITS LOG)
function rotateCarousel(direction) {
    document.getElementById('prevEdit').disabled = true;
    document.getElementById('nextEdit').disabled = true;

    currentEditIndex = (currentEditIndex + direction + editsData.length) % editsData.length;
    
    updateCarousel(editsCarouselWrapper, visibleEditCards, editsData, currentEditIndex);
    
    setTimeout(() => {
        document.getElementById('prevEdit').disabled = false;
        document.getElementById('nextEdit').disabled = false;
    }, 600); 
}

// WRAPPER FUNC for (INSPO)
function rotateInspoCarousel(direction) {
    document.getElementById('prevInspo').disabled = true;
    document.getElementById('nextInspo').disabled = true;

    currentInspoIndex = (currentInspoIndex + direction + inspoData.length) % inspoData.length;
    
    updateCarousel(inspoCarouselWrapper, visibleInspoCards, inspoData, currentInspoIndex);
    
    setTimeout(() => {
        document.getElementById('prevInspo').disabled = false;
        document.getElementById('nextInspo').disabled = false;
    }, 600); 
}

// CLOCK AND UI FUNCTION LAYER

function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
    const dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    
    const timeString = now.toLocaleTimeString('en-US', timeOptions)
                         .toLowerCase()
                         .replace(/ /g, ''); 

    const dateString = now.toLocaleDateString('en-US', dateOptions);

    dateTimeElement.textContent = `[ ${timeString} ] - [ ${dateString} ]`;
}
updateDateTime();
setInterval(updateDateTime, 1000); 

// SCROLL LOGIC (top screen / progress logic)

function updateScroll() {
    // progress bar 
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = scrollPercent + "%";
    
    // BACK TO TOP? (click to work)
    if (window.scrollY > 400) {
        backToTopButton.style.display = 'flex';
        backToTopButton.style.opacity = 1;
    } else {
        backToTopButton.style.opacity = 0;
        setTimeout(() => {
             if(window.scrollY < 400) backToTopButton.style.display = 'none';
        }, 300);
    }
    
    // scroll REVEAL
    checkSectionsVisibility();
}

window.addEventListener('scroll', updateScroll);
window.addEventListener('resize', updateScroll);

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. SCROLL REVEAL ANIMATION (root: null)

const sections = document.querySelectorAll('.section');
const observerOptions = {
    root: null, 
    rootMargin: '0px', 
    threshold: 0.1 
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const section = entry.target;
            
            // LOGIC ASSIGNS DELAY TO THE ( CORRECT ORDER LOGIC )
            let newDelay = 0.0;
            if (section.querySelector('.section-title')) {
                 const titleText = section.querySelector('.section-title').textContent.trim();
                 const delayMap = {
                    'About Me': 0.0,
                    'Skills & Stack': 0.1,
                    'Coding Projects': 0.2,
                    'Inspo': 0.3,
                    'Edits Log': 0.4,
                    'Socials': 0.5
                };
                 newDelay = delayMap[titleText] !== undefined ? delayMap[titleText] : 0.0;
            } 
            
            section.style.transitionDelay = `${newDelay}s`;
            section.classList.add('is-visible');
            observer.unobserve(section);
        }
    });
}, observerOptions);

function checkSectionsVisibility() {
    sections.forEach(section => {
        observer.observe(section);
    });
}

// 4. GLITCH EFFECT LOGIC (goes here)

function applyGlitch(element) {
    if (Math.random() < 0.6) {
        element.classList.add('glitch-flicker');
    }
    
    const duration = 100 + Math.random() * 200; 
    setTimeout(() => {
        element.classList.remove('glitch-flicker');
    }, duration);
}

function periodicGlitch() {
    applyGlitch(mainTitle);
    
    const allTitles = document.querySelectorAll('.section-title');
    if (allTitles.length > 0) {
        const randomTitle = allTitles[Math.floor(Math.random() * allTitles.length)];
        applyGlitch(randomTitle);
    }

    const nextGlitchTime = 3000 + Math.random() * 7000;
    setTimeout(periodicGlitch, nextGlitchTime);
}

// 5. MATRIX PARTICLE GEN

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

// 6. vol control logic (INSTANT DRAG) ---

function updateVolumeBars(volumeFraction) {
    const totalBars = volumeBars.length;
    const activeBars = Math.round(volumeFraction * totalBars); 

    volumeBars.forEach((bar, index) => {
        const isActive = index < activeBars;
        bar.classList.toggle('active', isActive);

        // STYLED BARS BASED ON ACTIVE STATE
        const baseColor = isActive ? 'var(--color-red)' : 'rgba(255, 255, 255, 0.1)';
        const glow = isActive ? `0 0 5px var(--color-red)` : 'none';
        
        // FINAL BAR (index 9) bright effects
        if (index === totalBars - 1 && isActive) {
            bar.style.background = 'white';
            bar.style.boxShadow = '0 0 10px white, 0 0 20px rgba(255, 255, 255, 0.5)';
        } else {
             bar.style.background = baseColor;
             bar.style.boxShadow = glow;
        }
    });
}


function handleDrag(event) {
    if (!isDragging) return;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const rect = volumeControl.getBoundingClientRect();
    
    // volumeFraction VAR (NOTE: 0 to 1) drag position
    let y = clientY - rect.top;
    let volumeFraction = 1 - (y / rect.height); // 1 at top, 0 at bottom
    volumeFraction = Math.max(0, Math.min(1, volumeFraction));
    
    // SET actual audio volume (relative maxMusicVolume, 0.65)
    bgMusic.volume = volumeFraction * maxMusicVolume; 
    
    // UPDATE visual bars
    updateVolumeBars(volumeFraction);
    event.preventDefault(); 
}

function startDrag(event) {
    isDragging = true;
    volumeControl.classList.add('active');
    handleDrag(event); 
}

function stopDrag() {
    isDragging = false;
    volumeControl.classList.remove('active');
}

volumeControl.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', stopDrag);
volumeControl.addEventListener('touchstart', (e) => startDrag(e), { passive: false });
document.addEventListener('touchmove', handleDrag, { passive: false });
document.addEventListener('touchend', stopDrag);

// 7. CORE SITE TRANSITION LOGIC

function tryPlayingAllVideos() {
    const videosToPlay = [];
    
    // ADD EDIT LOGS CAROUSEL VID
    visibleEditCards.forEach(card => {
        videosToPlay.push(card.querySelector('video'));
    });

    // ADD INSPO CAROUSEL VID
    visibleInspoCards.forEach(card => {
        videosToPlay.push(card.querySelector('video'));
    });

    videosToPlay.forEach(video => {
        if(video) { 
            // ATTEMPT TO PLAY, if site already active (AVOID double play attempts on LOAD)
            if (mainContent.classList.contains('fade-in-content')) {
                video.play().catch(e => {
                    if (e.name !== 'NotAllowedError') {
                         console.error(`Video autoplay failed:`, e);
                    }
                });
            }
        }
    });
}


function enterSite() { 
    // 60% of the VOL range
    bgMusic.volume = defaultVolumeFraction * maxMusicVolume; // Set initial volume (0.6 * 0.65)
    bgMusic.currentTime = 58; // bg music start time here
    bgMusic.play().catch(e => console.error("Audio play failed on site entry click:", e));

    // VISUAL TRANSITIONS SECTION
    landingScreen.classList.add('fade-out-landing');
    particlesContainer.classList.add('active'); 

    setTimeout(() => {
        mainContent.classList.add('fade-in-content');
        tryPlayingAllVideos(); 
        checkSectionsVisibility(); 
        periodicGlitch(); 
    }, 500); 
    
    setTimeout(() => {
        landingScreen.style.display = 'none';
        landingScreen.remove(); 
    }, 1500);
}

window.onload = () => {
     generateParticles(100); 
     updateScroll(); 
     // INITIAL 60% volume state on load visual bars
     updateVolumeBars(defaultVolumeFraction);
     
     // SETUP CAROUSEL
     updateCarousel(editsCarouselWrapper, visibleEditCards, editsData, currentEditIndex); 
     updateCarousel(inspoCarouselWrapper, visibleInspoCards, inspoData, currentInspoIndex); 
}

// MODAL FUNCTIONS

function openModal(videoElement) {
    videoElement.pause();
    videoElement.currentTime = 0; 
    videoElement.play().catch(e => {
        if (e.name !== 'NotAllowedError') {
             console.error(`Video play failed on click (reset):`, e);
        }
    });
    
    // STOP BG background temporarily func
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

    // resumes background music at its current setting [logic (play[samevol] -> enter video [bg stops] ->exit-> (samevol)still)
    bgMusic.play().catch(e => console.error("Audio play failed on modal close:", e));
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
    }
});
