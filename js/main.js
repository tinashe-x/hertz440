// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let isMenuOpen = false;

menuToggle.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenu.style.height = isMenuOpen ? 'auto' : '0';
    mobileMenu.classList.toggle('hidden');
    menuToggle.innerHTML = isMenuOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        isMenuOpen = false;
        mobileMenu.style.height = '0';
        mobileMenu.classList.add('hidden');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            isMenuOpen = false;
            mobileMenu.style.height = '0';
            mobileMenu.classList.add('hidden');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Grid animation
const grid = document.querySelector('.grid');
const gridLinesX = document.querySelector('.grid-lines-x');
const gridLinesY = document.querySelector('.grid-lines-y');

let mouseX = 0;
let mouseY = 0;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

function updateGridPosition() {
    const moveX = (mouseX - windowWidth / 2) * 0.01;
    const moveY = (mouseY - windowHeight / 2) * 0.01;
    
    gridLinesX.style.transform = `perspective(500px) rotateX(60deg) translateX(${moveX}px)`;
    gridLinesY.style.transform = `perspective(500px) rotateX(60deg) translateY(${moveY}px)`;
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    requestAnimationFrame(updateGridPosition);
});

window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
});

// Floating elements animation
const floatingElements = document.querySelectorAll('.floating-element');
floatingElements.forEach(element => {
    element.style.animation = `float ${6 + Math.random() * 4}s ease-in-out infinite`;
    element.style.animationDelay = `${Math.random() * 2}s`;
});

// Holo Player
const holoPlayer = document.querySelector('.holo-player');
const minimizeBtn = document.querySelector('.minimize-btn');
const closeBtn = document.querySelector('.holo-player-close');
const playBtn = document.querySelector('.holo-player-btn.play');
const prevBtn = document.querySelector('.holo-player-btn:first-child');
const nextBtn = document.querySelector('.holo-player-btn:last-child');
const playerTitle = document.querySelector('.holo-player-title');
const visualizerBars = document.querySelector('.visualizer-bars');

let currentTrackIndex = 0;
let isMinimized = false;
let isPlaying = false;

// Create visualizer bars
for (let i = 0; i < 20; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    bar.style.animationDelay = `${i * 0.05}s`;
    visualizerBars.appendChild(bar);
}

const tracks = [
    {
        title: 'Just Watch',
        audio: document.getElementById('track1')
    },
    {
        title: 'Break From Madness',
        audio: document.getElementById('track2')
    },
    {
        title: 'The Devil Wears Prada',
        audio: document.getElementById('track3')
    },
    {
        title: 'Piece Of Me',
        audio: document.getElementById('track4')
    }
];

// Prevent autoplay
tracks.forEach(track => {
    track.audio.pause();
    track.audio.currentTime = 0;
});

function playTrack(index) {
    // Stop all other tracks
    tracks.forEach(track => {
        track.audio.pause();
        track.audio.currentTime = 0;
    });

    const track = tracks[index];
    playerTitle.textContent = track.title;
    currentTrackIndex = index;
    
    // Show loading state
    playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Load and play the track
    track.audio.load();
    track.audio.oncanplaythrough = () => {
        track.audio.play()
            .then(() => {
                isPlaying = true;
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                alert('Error playing audio. Please try again.');
            });
    };
    
    track.audio.onerror = () => {
        console.error('Error loading audio');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        alert('Error loading audio. Please try again.');
    };
}

function togglePlay() {
    const currentTrack = tracks[currentTrackIndex].audio;
    if (currentTrack.paused) {
        currentTrack.play()
            .then(() => {
                isPlaying = true;
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                alert('Error playing audio. Please try again.');
            });
    } else {
        currentTrack.pause();
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function playNext() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(currentTrackIndex);
}

function playPrev() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(currentTrackIndex);
}

function toggleMinimize() {
    isMinimized = !isMinimized;
    holoPlayer.classList.toggle('minimized');
    minimizeBtn.innerHTML = isMinimized ? '<i class="fas fa-expand"></i>' : '<i class="fas fa-minus"></i>';
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrev);
nextBtn.addEventListener('click', playNext);
minimizeBtn.addEventListener('click', toggleMinimize);
closeBtn.addEventListener('click', () => {
    holoPlayer.classList.remove('active');
    tracks[currentTrackIndex].audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// Audio ended event
tracks.forEach(track => {
    track.audio.addEventListener('ended', () => {
        playNext();
    });
});

// Add click handlers for folder icons
document.querySelectorAll('.float-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        const trackNumber = icon.getAttribute('data-track');
        const trackIndex = parseInt(trackNumber) - 1; // Convert to 0-based index
        
        // Show holo player
        const holoPlayer = document.querySelector('.holo-player');
        if (holoPlayer) {
            holoPlayer.classList.add('active');
            // Update the title in the holo player
            const titleElement = holoPlayer.querySelector('.holo-player-title');
            if (titleElement) {
                titleElement.textContent = tracks[trackIndex].title;
            }
            // Load and play the track
            playTrack(trackIndex);
        }
    });
});

// API endpoint - update this with your Render.com URL after deployment
const API_URL = 'https://hertz440-backend.onrender.com';

// Email form submission
const emailForm = document.querySelector('form');
const emailInput = document.querySelector('input[type="email"]');
const submitBtn = document.querySelector('button[type="submit"]');

// Test API connection
async function testAPI() {
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        console.log('API test response:', data);
    } catch (error) {
        console.error('API test failed:', error);
    }
}

// Run API test when page loads
testAPI();

emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const email = emailInput.value.trim();
    console.log('Email value:', email);
    
    if (!email) {
        console.log('No email provided');
        showFormMessage('Please enter your email address', 'error');
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        console.log('Sending subscription request...');
        
        // Send subscription request
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            console.log('Subscription successful');
            showFormMessage(data.message, 'success');
            emailInput.value = '';
        } else {
            console.log('Subscription failed:', data.message);
            showFormMessage(data.message || 'An error occurred', 'error');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showFormMessage('An error occurred. Please try again later.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'SUBSCRIBE';
    }
});

function showFormMessage(message, type) {
    console.log('Showing message:', { message, type });
    
    // Remove any existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create and show new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Insert message after the form
    emailForm.parentNode.insertBefore(messageElement, emailForm.nextSibling);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
} 