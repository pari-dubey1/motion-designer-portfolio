// --- Tailwind Configuration ---
tailwind.config = {
    darkMode: 'class', 
    theme: {
        extend: {
            fontFamily: {
                'satoshi': ['Satoshi', 'sans-serif'],
            },
            aspectRatio: {
                '9/16': '9 / 16',
            },
            animation: {
                scroll: 'scroll 70s linear infinite',
            },
            keyframes: {
                scroll: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                }
            }
        },
    },
};

// --- Updated Video Control Logic (YouTube API) ---
function toggleMute(event) {
    event.stopPropagation();
    
    const currentButton = event.currentTarget;
    const currentContainer = currentButton.closest('.reel-item-inner');
    const currentVideo = currentContainer.querySelector('video');
    const currentIframe = currentContainer.querySelector('iframe');
    
    // Check current state
    const isCurrentlyMuted = currentButton.getAttribute('data-muted') !== 'false';

    if (isCurrentlyMuted) {
        // --- STEP 1: MUTE EVERYTHING ELSE FIRST ---
        document.querySelectorAll('.reel-item-inner').forEach(container => {
            // Mute local HTML5 videos
            const v = container.querySelector('video');
            if (v) v.muted = true;

            // Mute YouTube iframes
            const f = container.querySelector('iframe');
            if (f) f.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');

            // Reset all buttons to "muted" visual state
            const btn = container.querySelector('button[onclick^="toggleMute"]');
            if (btn) {
                btn.setAttribute('data-muted', 'true');
                const mIcon = btn.querySelector('.icon-muted');
                const uIcon = btn.querySelector('.icon-unmuted');
                if (mIcon) mIcon.classList.remove('hidden');
                if (uIcon) uIcon.classList.add('hidden');
            }
        });

        // --- STEP 2: UNMUTE THE SELECTED VIDEO ---
        if (currentVideo) {
            currentVideo.muted = false;
        } else if (currentIframe) {
            currentIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        }

        // Update current button state
        currentButton.setAttribute('data-muted', 'false');
        currentButton.querySelector('.icon-muted')?.classList.add('hidden');
        currentButton.querySelector('.icon-unmuted')?.classList.remove('hidden');

    } else {
        // --- STEP 3: MANUALLY MUTE IF ALREADY UNMUTED ---
        if (currentVideo) currentVideo.muted = true;
        if (currentIframe) currentIframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');

        currentButton.setAttribute('data-muted', 'true');
        currentButton.querySelector('.icon-muted')?.classList.remove('hidden');
        currentButton.querySelector('.icon-unmuted')?.classList.add('hidden');
    }
}

// --- Mobile Menu Logic ---
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const menuOpenIcon = document.getElementById('menu-open-icon');
const menuCloseIcon = document.getElementById('menu-close-icon');

if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('hidden');
        menuOpenIcon.classList.toggle('block');
        menuCloseIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('block');
    });
}

function closeMobileMenu() {
    mobileMenu.classList.add('hidden');
    menuOpenIcon.classList.add('block');
    menuOpenIcon.classList.remove('hidden');
    menuCloseIcon.classList.add('hidden');
    menuCloseIcon.classList.remove('block');
}

// --- Updated Modal Logic ---
const modal = document.getElementById('project-modal');
const modalVideoContainer = document.getElementById('modal-video-container');
const modalVideoIframe = document.getElementById('modal-video-iframe');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');

function openModal(title, description, videoUrl) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    modalVideoContainer.classList.add('aspect-9/16');
    modalVideoContainer.style.maxWidth = '360px'; 
    modalVideoContainer.style.margin = '0 auto'; 

    if (videoUrl) {
        // Ensure YouTube API is enabled and autoplay is on for modal
        const connector = videoUrl.includes('?') ? '&' : '?';
        const finalUrl = `${videoUrl}${connector}autoplay=1&enablejsapi=1`;
        modalVideoIframe.src = finalUrl;
    }

    modal.classList.remove('hidden');
    modal.addEventListener('click', closeModal);
    
    // Pause all gallery videos when modal opens
    document.querySelectorAll('#reel-gallery iframe').forEach(frame => {
        frame.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    });
}

function closeModal() {
    modalVideoIframe.src = ''; 
    modal.classList.add('hidden');
    modal.removeEventListener('click', closeModal);
    
    // Resume gallery videos when modal closes
    document.querySelectorAll('#reel-gallery iframe').forEach(frame => {
        frame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    });
}

// --- Form Logic ---
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const formSuccess = document.getElementById('form-success');

    fetch(form.action, {
        method: form.method,
        body: data,
        headers: { 'Accept': 'application/json' }
    }).then(response => {
        if (response.ok) {
            formSuccess.textContent = "Thank you! Your message has been sent.";
            formSuccess.classList.remove('hidden');
            form.reset(); 
            setTimeout(() => { formSuccess.classList.add('hidden'); }, 4000);
        } else {
            alert("Oops! There was a problem submitting your form.");
        }
    }).catch(() => {
        alert("Oops! There was a network error.");
    });
}

// --- Theme Toggle Logic ---
const sunIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
const moonIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;

const body = document.body;
const desktopToggle = document.getElementById('theme-toggle-desktop');
const mobileToggle = document.getElementById('theme-toggle-mobile');

function updateIcons(isDark) {
    if (desktopToggle) desktopToggle.innerHTML = isDark ? sunIcon : moonIcon;
    if (mobileToggle) mobileToggle.innerHTML = isDark ? sunIcon : moonIcon;
}

function enableDarkMode() {
    body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    updateIcons(true);
}

function enableLightMode() {
    body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    updateIcons(false);
}

function toggleTheme() {
    if (body.classList.contains('dark')) { enableLightMode(); } else { enableDarkMode(); }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') { enableLightMode(); } else { enableDarkMode(); }
    if (desktopToggle) desktopToggle.addEventListener('click', toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener('click', toggleTheme);
}

// --- Observers ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    const reelGallery = document.getElementById('reel-gallery');
    const reelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    if (reelGallery) reelObserver.observe(reelGallery);

    // Observe individual reel items for entrance animations
    document.querySelectorAll('.reel-item-stagger').forEach(item => reelObserver.observe(item));

    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.2 });

    testimonialCards.forEach(card => testimonialObserver.observe(card));
});

