// --- Element Selection ---
const inspoVideo = document.getElementById('inspoVideo');
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

// --- Global Variables & Constants ---
const maxMusicVolume = 0.65; 
const defaultVolumeFraction = 0.6;
let isDragging = false;
let currentPlayingVideo = null; 

// CAROUSEL DATA 
const editsData = [
    { id: 'cyrene', src: 'recent_works/cyrene.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7571472539432586503', title: 'cyrene.mp4 // TikTok' },
    { id: 'rezedenji', src: 'recent_works/rezedenji.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7568189301809401106', title: 'rezedenji.mp4 // TikTok' },
    { id: 'dispatch', src: 'recent_works/dispatch.mp4', link: 'https://www.tiktok.com/@cynhyo/video/7575974752636947720', title: 'dispatch.mp4 // TikTok' },
    // Add more videos here if needed for the loop!
];

const editsCarouselWrapper = document.getElementById('editsCarouselWrapper');
const visibleCards = Array.from(editsCarouselWrapper.children); // Static array of the 3 DOM elements
let currentDataIndex = 0; // Index of the video data currently displayed in the CENTER card.

// --- CAROUSEL FUNCTIONS (IMPLEMENTED SMOOTHNESS AND LOOPING LOGIC) ---

/**
 * Updates the content (src/link/title) and the visual state (data-position) 
 * of the three visible video cards based on the currentDataIndex.
 */
function updateCarouselContent() {
    const totalData = editsData.length;
    
    // Map the current center index to the indices for left and right
    // Use modular arithmetic for infinite looping
    const leftDataIndex = (currentDataIndex - 1 + totalData) % totalData;
    const rightDataIndex = (currentDataIndex + 1) % totalData;
    
    const cardMap = [
        { card: visibleCards[0], dataIndex: leftDataIndex, position: 'side' },
        { card: visibleCards[1], dataIndex: currentDataIndex, position: 'center' },
        { card: visibleCards[2], dataIndex: rightDataIndex, position: 'side' }
    ];

    // Update content and position attributes
    cardMap.forEach(item => {
        const data = editsData[item.dataIndex];
        const videoElement = item.card.querySelector('video');
        const linkElement = item.card.querySelector('.video-tiktok-bottom');
        const sourceElement = videoElement.querySelector('source');

        // 1. Update data/content (Virtual DOM approach)
        sourceElement.src = data.src;
        videoElement.load(); // Reload video with new source

        linkElement.href = data.link;
        linkElement.querySelector('span').textContent = data.title;
        
        // 2. Update visual state (CSS handles the smooth transition)
        item.card.setAttribute('data-position', item.position);
        
        // 3. Control playback
        if (item.position === 'center') {
            videoElement.play().catch(e => console.error("Video play failed:", e));
        } else {
            videoElement.pause();
            videoElement.currentTime = 0; // Reset side videos
        }
    });
    
    // Ensure all videos play after being loaded/updated to prevent blank frames
    tryPlayingAllVideos();
}


/**
 * Rotates the carousel data index and triggers the content update.
 * @param {number} direction - 1 for right (next), -1 for left (previous).
 */
function rotateCarousel(direction) {
    const totalData = editsData.length;
    
    // Disable buttons temporarily to prevent rapid clicks during animation
    document.getElementById('prevEdit').disabled = true;
    document.getElementById('nextEdit').disabled = true;

    // Calculate new center index (using modular arithmetic for looping)
    currentDataIndex = (currentDataIndex + direction + totalData) % totalData;
    
    // Update the visible cards' content/state. The CSS transition handles the smooth slide/scale.
    updateCarouselContent();
    
    // Re-enable buttons after transition time
    setTimeout(() => {
        document.getElementById('prevEdit').disabled = false;
        document.getElementById('nextEdit').disabled = false;
    }, 600); // Matches the CSS transition time
}

// --- 1. CLOCK & UI FUNCTIONS ---

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

// --- 2. SCROLL LOGIC (Progress Bar and Back to Top) ---

function updateScroll() {
    // Progress Bar
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / totalHeight) * 100;
    progressBar.style.width = scrollPercent + "%";
    
    // Back to Top Visibility
    if (window.scrollY > 400) {
        backToTopButton.style.display = 'flex';
        backToTopButton.style.opacity = 1;
    } else {
        backToTopButton.style.opacity = 0;
        setTimeout(() => {
             if(window.scrollY < 400) backToTopButton.style.display = 'none';
        }, 300);
    }
    
    // Scroll Reveal
    checkSectionsVisibility();
}

window.addEventListener('scroll', updateScroll);
window.addEventListener('resize', updateScroll);

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 3. SCROLL REVEAL ANIMATION (Staggered) ---

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
            
            // Logic to assign delays based on the new, correct order
            let newDelay = 0.0;
            if (section.querySelector('.section-title')) {
                 const titleText = section.querySelector('.section-title').textContent.trim();
                 // Updated delay map to include Skills & Stack
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

// --- 4. GLITCH EFFECT LOGIC ---

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

// --- 5. MATRIX PARTICLE GENERATOR ---

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

// --- 6. VOLUME CONTROL LOGIC (Instantaneous drag) ---

function updateVolumeBars(volumeFraction) {
    const totalBars = volumeBars.length;
    const activeBars = Math.round(volumeFraction * totalBars); 

    volumeBars.forEach((bar, index) => {
        const isActive = index < activeBars;
        bar.classList.toggle('active', isActive);

        // Style the bars dynamically based on active state
        const baseColor = isActive ? 'var(--color-red)' : 'rgba(255, 255, 255, 0.1)';
        const glow = isActive ? `0 0 5px var(--color-red)` : 'none';
        
        // Final bar (index 9) gets the bright white effect
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
    
    // Calculate volumeFraction (0 to 1) based on drag position
    let y = clientY - rect.top;
    let volumeFraction = 1 - (y / rect.height); // 1 at top, 0 at bottom
    volumeFraction = Math.max(0, Math.min(1, volumeFraction));
    
    // Set actual audio volume (relative to maxMusicVolume, 0.65)
    bgMusic.volume = volumeFraction * maxMusicVolume; 
    
    // Update visual bars
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

// --- 7. CORE SITE TRANSITION LOGIC ---

function tryPlayingAllVideos() {
    // Include Inspo video
    const videosToPlay = [inspoVideo]; 
    // Include the three visible carousel videos
    visibleCards.forEach(card => {
        videosToPlay.push(card.querySelector('video'));
    });

    videosToPlay.forEach(video => {
        if(video) { 
            // Attempt to play only if the site is already active (to avoid double play attempts on load)
            if (mainContent.classList.contains('fade-in-content')) {
                video.play().catch(e => {
                    if (e.name !== 'NotAllowedError') {
                         console.error(`Video autoplay failed for ${video.id || 'carousel'}:`, e);
                    }
                });
            }
        }
    });
}


function enterSite() {
    // 1. Audio setup: Start at 60% of the volume range
    bgMusic.volume = defaultVolumeFraction * maxMusicVolume; // Set initial volume (0.6 * 0.65)
    bgMusic.currentTime = 70; 
    bgMusic.play().catch(e => console.error("Audio play failed on site entry click:", e));

    // 2. Visual Transitions
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
     // Set the initial 60% volume state on load for the visual bars
     updateVolumeBars(defaultVolumeFraction);
     
     // Initial setup for the carousel
     updateCarouselContent(); 
}

// --- 8. MODAL FUNCTIONS ---

function openModal(videoElement) {
    /* CHANGED: Start: Pause, reset time, and play the clicked video before opening the modal. */
    videoElement.pause();
    videoElement.currentTime = 0; 
    videoElement.play().catch(e => {
        // Safely ignore promise rejection if autoplay is blocked
        if (e.name !== 'NotAllowedError') {
             console.error(`Video play failed on click (reset):`, e);
        }
    });
    /* CHANGED: End */
    
    // Stop background music temporarily
    bgMusic.pause();
    
    currentPlayingVideo = videoElement; 
    // videoElement.pause(); // Removed, as it is done above
    
    modalVideo.querySelector('source').src = videoElement.querySelector('source').src;
    modalVideo.load(); 
    // Since we reset the background video to 0, the modal should also start at 0
    modalVideo.currentTime = 0; // Changed from original logic to 0 for consistency
    modalVideo.muted = false; 
    
    modal.style.display = "flex"; 
    modalVideo.play();
}

function closeModal() {
    modalVideo.pause();
    
    if (currentPlayingVideo) {
        // Background video resumes its loop/current time
        currentPlayingVideo.currentTime = modalVideo.currentTime; // Sync time back
        currentPlayingVideo.play();
    }
    
    modal.style.display = "none";
    
    modalVideo.querySelector('source').src = "";
    modalVideo.load();

    // Resume background music at its current volume setting
    bgMusic.play().catch(e => console.error("Audio play failed on modal close:", e));
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape" && modal.style.display === "flex") {
        closeModal();
    }
    // Accessibility: Add keyboard navigation for carousel
    if (mainContent.classList.contains('fade-in-content')) {
         if (event.key === "ArrowRight") {
            document.getElementById('nextEdit').click();
         } else if (event.key === "ArrowLeft") {
            document.getElementById('prevEdit').click();
         }
    }
});