const state = {
    keyboards: [],
    currentKeyboard: null,
    currentTutorial: [],
    currentStepIndex: 0
};

// UI Elements
const landingView = document.getElementById('landing-view');
const tutorialView = document.getElementById('tutorial-view');
const keyboardGrid = document.getElementById('keyboard-grid');
const stepsList = document.getElementById('steps-list');
const stepMedia = document.getElementById('step-media');
const stepTitle = document.getElementById('step-title');
const stepContent = document.getElementById('step-content');
const stepCounter = document.getElementById('step-counter');
const prevBtn = document.getElementById('prev-step');
const nextBtn = document.getElementById('next-step');
const backToHomeBtn = document.getElementById('back-to-home');

// Theme Management
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        document.body.classList.add('dark-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    themeToggle.onclick = () => {
        const isDark = document.body.classList.contains('dark-mode');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isDark || (!localStorage.getItem('theme') && systemDark)) {
            // Switch to Light
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            // Switch to Dark
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    };
}

// Initialize
async function init() {
    initTheme();
    try {
        const response = await fetch('data/keyboards.json');
        state.keyboards = await response.json();
        renderLandingPage();
        handleRouting();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function renderLandingPage() {
    keyboardGrid.innerHTML = '';
    state.keyboards.forEach(kb => {
        const card = document.createElement('div');
        card.className = 'kb-card';
        card.innerHTML = `
            <div class="blur-container">
                <img src="${kb.thumbnail}" class="blur-bg" alt="">
                <img src="${kb.thumbnail}" class="main-img" alt="${kb.name}">
            </div>
            <div class="kb-card-content">
                <h3>${kb.name}</h3>
                <p>${kb.description}</p>
            </div>
        `;
        card.onclick = () => {
            window.location.hash = kb.id;
        };
        keyboardGrid.appendChild(card);
    });
}

async function loadTutorial(kbId) {
    const keyboard = state.keyboards.find(k => k.id === kbId);
    if (!keyboard) {
        window.location.hash = '';
        return;
    }

    state.currentKeyboard = keyboard;

    try {
        const response = await fetch(`data/tutorials/${kbId}.json`);
        state.currentTutorial = await response.json();
        state.currentStepIndex = 0;
        
        renderSidebar();
        renderCurrentStep();
        
        landingView.classList.add('hidden');
        tutorialView.classList.remove('hidden');
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading tutorial:', error);
    }
}

function renderSidebar() {
    stepsList.innerHTML = '';
    state.currentTutorial.forEach((step, index) => {
        const li = document.createElement('li');
        li.textContent = step.title;
        li.className = index === state.currentStepIndex ? 'active' : '';
        li.onclick = () => {
            state.currentStepIndex = index;
            renderCurrentStep();
            updateSidebarActive();
        };
        stepsList.appendChild(li);
    });
}

function updateSidebarActive() {
    const items = stepsList.querySelectorAll('li');
    items.forEach((item, index) => {
        item.className = index === state.currentStepIndex ? 'active' : '';
    });
}

function renderCurrentStep() {
    const step = state.currentTutorial[state.currentStepIndex];
    if (!step) return;

    // Media container structure
    const mediaContainer = document.querySelector('.media-container');
    mediaContainer.innerHTML = `
        <div class="blur-container">
            <img src="${step.media}" class="blur-bg" alt="">
            <img src="${step.media}" class="main-img" id="step-media" alt="${step.title}">
        </div>
    `;
    
    stepTitle.textContent = step.title;
    stepContent.textContent = step.content;
    stepCounter.textContent = `${state.currentStepIndex + 1} / ${state.currentTutorial.length}`;
    
    prevBtn.disabled = state.currentStepIndex === 0;
    nextBtn.textContent = state.currentStepIndex === state.currentTutorial.length - 1 ? 'Finish' : 'Next';
}

// Navigation
prevBtn.onclick = () => {
    if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
        renderCurrentStep();
        updateSidebarActive();
    }
};

nextBtn.onclick = () => {
    if (state.currentStepIndex < state.currentTutorial.length - 1) {
        state.currentStepIndex++;
        renderCurrentStep();
        updateSidebarActive();
    } else {
        window.location.hash = '';
    }
};

backToHomeBtn.onclick = () => {
    window.location.hash = '';
};

function handleRouting() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        loadTutorial(hash);
    } else {
        landingView.classList.remove('hidden');
        tutorialView.classList.add('hidden');
    }
}

window.addEventListener('hashchange', handleRouting);

init();
