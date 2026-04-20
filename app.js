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

// Initialize
async function init() {
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
            <img src="${kb.thumbnail}" alt="${kb.name}">
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

    // Use / for public assets
    stepMedia.src = `${step.media}`;
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
