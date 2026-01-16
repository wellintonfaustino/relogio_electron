const { ipcRenderer } = require('electron');

// Tabs Logic
const tabs = document.querySelectorAll('.tab-btn[data-target]');
const sections = document.querySelectorAll('.content-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
    });
});

// Close App
document.getElementById('close-btn').addEventListener('click', () => {
    window.close();
});

// Settings Logic
const settingsOpen = document.getElementById('settings-open');
const settingsClose = document.getElementById('settings-close');
const settingsPanel = document.getElementById('settings-panel');
const themeDarkBtn = document.getElementById('theme-dark');
const themeLightBtn = document.getElementById('theme-light');
const opacitySlider = document.getElementById('opacity-slider');
const colorPicker = document.getElementById('color-picker');
const root = document.documentElement;

settingsOpen.addEventListener('click', () => {
    settingsPanel.classList.add('open');
});

settingsClose.addEventListener('click', () => {
    settingsPanel.classList.remove('open');
});

// Load Settings
function loadSettings() {
    const savedOpacity = localStorage.getItem('glass-opacity') || '0.6';
    const savedColor = localStorage.getItem('accent-color') || '#4facfe';
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Apply
    root.style.setProperty('--glass-opacity', savedOpacity);
    root.style.setProperty('--accent-color', savedColor);
    
    opacitySlider.value = savedOpacity;
    colorPicker.value = savedColor;
    
    setTheme(savedTheme);
}

function setTheme(theme) {
    // Save
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
        root.style.setProperty('--bg-color', '20, 20, 30');
        root.style.setProperty('--text-color', '255, 255, 255');
        root.style.setProperty('--border-color', '255, 255, 255');
        themeDarkBtn.classList.add('active');
        themeLightBtn.classList.remove('active');
    } else {
        root.style.setProperty('--bg-color', '240, 240, 250');
        root.style.setProperty('--text-color', '30, 30, 40');
        root.style.setProperty('--border-color', '0, 0, 0');
        themeLightBtn.classList.add('active');
        themeDarkBtn.classList.remove('active');
    }
}

themeDarkBtn.addEventListener('click', () => setTheme('dark'));
themeLightBtn.addEventListener('click', () => setTheme('light'));

opacitySlider.addEventListener('input', (e) => {
    const val = e.target.value;
    root.style.setProperty('--glass-opacity', val);
    localStorage.setItem('glass-opacity', val);
});

colorPicker.addEventListener('input', (e) => {
    const val = e.target.value;
    root.style.setProperty('--accent-color', val);
    localStorage.setItem('accent-color', val);
});

// Initialize Settings
loadSettings();


// --- CLOCK ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById('time-display').textContent = `${hours}:${minutes}:${seconds}`;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').textContent = now.toLocaleDateString('pt-BR', options);
}
setInterval(updateClock, 1000);
updateClock();

// --- STOPWATCH ---
let swInterval = null;
let swStartTime = 0;
let swElapsedTime = 0;

const swDisplay = document.getElementById('sw-display');
const swStartBtn = document.getElementById('sw-start');
const swStopBtn = document.getElementById('sw-stop');
const swResetBtn = document.getElementById('sw-reset');

function formatSwTime(ms) {
    const date = new Date(ms);
    const m = String(date.getUTCHours() * 60 + date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    const msStr = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${m}:${s}.${msStr}`;
}

swStartBtn.addEventListener('click', () => {
    if (swInterval) return;
    swStartTime = Date.now() - swElapsedTime;
    swInterval = setInterval(() => {
        swElapsedTime = Date.now() - swStartTime;
        swDisplay.textContent = formatSwTime(swElapsedTime);
    }, 10);
});

swStopBtn.addEventListener('click', () => {
    if (!swInterval) return;
    clearInterval(swInterval);
    swInterval = null;
});

swResetBtn.addEventListener('click', () => {
    clearInterval(swInterval);
    swInterval = null;
    swElapsedTime = 0;
    swDisplay.textContent = "00:00.00";
});


// --- TIMER ---
let timerInterval = null;
let timerRemaining = 0;

const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start');
const timerStopBtn = document.getElementById('timer-stop');
const timerResetBtn = document.getElementById('timer-reset');
const timerMinInput = document.getElementById('timer-min');
const timerSecInput = document.getElementById('timer-sec');

function updateTimerDisplay() {
    const totalSeconds = Math.ceil(timerRemaining / 1000);
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
}

timerStartBtn.addEventListener('click', () => {
    if (timerInterval) return;
    
    // Only parse inputs if we are starting fresh or reset
    if (timerRemaining === 0) {
        const m = parseInt(timerMinInput.value) || 0;
        const s = parseInt(timerSecInput.value) || 0;
        timerRemaining = (m * 60 + s) * 1000;
    }

    if (timerRemaining <= 0) return;

    let lastTime = Date.now();
    timerInterval = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTime;
        lastTime = now;
        
        timerRemaining -= delta;
        
        if (timerRemaining <= 0) {
            timerRemaining = 0;
            clearInterval(timerInterval);
            timerInterval = null;
            updateTimerDisplay();
            // Simple visual feedback since Notification logic can be complex without setup
            timerDisplay.style.color = '#ff3d00';
            setTimeout(() => timerDisplay.style.color = 'rgb(var(--text-color))', 2000);
            alert("O tempo acabou!");
        } else {
             updateTimerDisplay();
        }
    }, 100);
});

timerStopBtn.addEventListener('click', () => {
    if (!timerInterval) return;
    clearInterval(timerInterval);
    timerInterval = null;
});

timerResetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRemaining = 0;
    updateTimerDisplay();
    timerMinInput.value = '';
    timerSecInput.value = '';
    timerDisplay.style.color = 'rgb(var(--text-color))';
});
