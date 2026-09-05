const API_URL = 'https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec';

// DOM Elements
const svgContainer = document.getElementById('svg-container');
const modal = document.getElementById('locker-modal');
const closeBtn = document.querySelector('.close-button');
const lockerForm = document.getElementById('locker-form');
const lockerStatusSelect = document.getElementById('locker-status');
const occupantSection = document.getElementById('occupant-section');
const occupantUnknownCheckbox = document.getElementById('occupant-unknown');
const occupantNameInput = document.getElementById('occupant-name');
const saveButton = document.getElementById('save-button');
const loadingSpinner = document.getElementById('loading-spinner');
const messageArea = document.getElementById('message-area');
const modalTitle = document.getElementById('modal-title');
const lockerIdInput = document.getElementById('locker-id');
const globalLoadingOverlay = document.getElementById('global-loading-overlay');

const occupiedView = document.getElementById('occupied-view');
const displayOccupantName = document.getElementById('display-occupant-name');
const releaseButton = document.getElementById('release-button');
const editButton = document.getElementById('edit-button');

let lockersData = []; // Store fetched data

// Initialize app
async function init() {
    await loadSVG();
    await fetchLockersData();
    setupEventListeners();
}

// Load SVG content
async function loadSVG() {
    try {
        const response = await fetch('casiers.svg');
        if (!response.ok) throw new Error('Erreur lors du chargement du SVG');
        const svgText = await response.text();
        svgContainer.innerHTML = svgText;

        // Ensure SVG has proper attributes for responsiveness
        const svgElement = svgContainer.querySelector('svg');
        if (svgElement) {
            svgElement.setAttribute('width', '100%');
            if (!svgElement.getAttribute('viewBox')) {
                svgElement.setAttribute('viewBox', '0 0 800 600');
            }
            svgElement.setAttribute('height', '100%');

            // Add click event to all lockers
            const lockers = svgElement.querySelectorAll('.casier');
            lockers.forEach(locker => {
                locker.addEventListener('click', () => openModal(locker.id));
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        svgContainer.innerHTML = '<p>Erreur lors du chargement du plan.</p>';
    }
}

// Fetch data from API
async function fetchLockersData() {
    try {
        // Show initial loading state? (optional, could add a global spinner)
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erreur réseau');

        // Handle CORS/Redirect issues with JSONP/No-cors if needed, but App Script usually handles it if deployed correctly as Web App (Anyone can access)
        const data = await response.json();
        lockersData = data;
        updateSVGColors();
        if (globalLoadingOverlay) {
            globalLoadingOverlay.classList.remove('show');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // Fallback for demo if API fails
        console.log("Utilisation de données simulées ou aucune donnée (API en erreur).");
        // lockersData = []; // empty or mock data
        if (globalLoadingOverlay) {
            globalLoadingOverlay.classList.remove('show');
        }
    }
}

// Update SVG colors based on data
function updateSVGColors() {
    // Default colors based on CSS variables
    const colors = {
        libre: '#10b981',
        occupe: '#ef4444',
        inconnu: '#f59e0b',
        undef: '#ffffff'
    };

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    // Reset all to undef first
    const allLockers = svgElement.querySelectorAll('.casier');
    allLockers.forEach(locker => {
        locker.setAttribute('fill', colors.undef);
    });

    // Reset all texts to black first
    const allTexts = svgElement.querySelectorAll('text');
    allTexts.forEach(text => {
        text.setAttribute('fill', '#000000');
    });

    lockersData.forEach(locker => {
        const lockerElement = document.getElementById(locker.id_casier);
        if (lockerElement) {
            let fillColor = colors.undef;

            if (locker.statut_casier === 'Libre') {
                fillColor = colors.libre;
            } else if (locker.statut_casier === 'Occupé') {
                if (locker.statut_occupant === 'Inconnu') {
                    fillColor = colors.inconnu;
                } else {
                    fillColor = colors.occupe;
                }
            }

            lockerElement.setAttribute('fill', fillColor);

            // Change text color to white if background is red
            if (fillColor === colors.occupe) {
                const lockerNumber = locker.id_casier.replace('casier-', '');
                allTexts.forEach(text => {
                    if (text.textContent.trim() === lockerNumber) {
                        text.setAttribute('fill', '#ffffff');
                    }
                });
            }
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    lockerStatusSelect.addEventListener('change', () => {
        if (lockerStatusSelect.value === 'Occupé') {
            occupantSection.style.display = 'block';
        } else {
            occupantSection.style.display = 'none';
        }
    });

    occupantUnknownCheckbox.addEventListener('change', () => {
        if (occupantUnknownCheckbox.checked) {
            occupantNameInput.value = '';
            occupantNameInput.disabled = true;
        } else {
            occupantNameInput.disabled = false;
        }
    });

    lockerForm.addEventListener('submit', handleFormSubmit);

    releaseButton.addEventListener('click', async () => {
        lockerStatusSelect.value = 'Libre';
        occupantUnknownCheckbox.checked = false;
        occupantNameInput.value = '';
        await saveLockerData();
    });

    editButton.addEventListener('click', () => {
        occupiedView.style.display = 'none';
        lockerForm.style.display = 'block';
    });
}

// Open Modal
function openModal(lockerId) {
    // Find data for this locker
    const lockerData = lockersData.find(l => l.id_casier === lockerId) || {
        id_casier: lockerId,
        statut_casier: '',
        statut_occupant: '',
        nom_occupant: ''
    };

    modalTitle.textContent = `Casier ${lockerId.replace('casier-', '')}`;
    lockerIdInput.value = lockerId;

    // Default to Occupé if undefined
    const isUndefined = !lockerData.statut_casier || lockerData.statut_casier === '';
    lockerStatusSelect.value = isUndefined ? 'Occupé' : lockerData.statut_casier;

    const isUnknown = lockerData.statut_occupant === 'Inconnu';
    occupantUnknownCheckbox.checked = isUnknown;
    occupantNameInput.value = lockerData.nom_occupant || '';
    occupantNameInput.disabled = isUnknown;

    if (lockerStatusSelect.value === 'Occupé') {
        occupantSection.style.display = 'block';
    } else {
        occupantSection.style.display = 'none';
    }

    if (lockerData.statut_casier === 'Occupé' && !isUndefined) {
        occupiedView.style.display = 'block';
        lockerForm.style.display = 'none';
        displayOccupantName.textContent = isUnknown ? 'Inconnu' : (lockerData.nom_occupant || 'Inconnu');
    } else {
        occupiedView.style.display = 'none';
        lockerForm.style.display = 'block';
    }

    messageArea.textContent = '';
    messageArea.className = 'message';
    modal.classList.add('show');
}

// Close Modal
function closeModal() {
    modal.classList.remove('show');
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();
    await saveLockerData();
}

async function saveLockerData() {
    const id = lockerIdInput.value;
    const statut_casier = lockerStatusSelect.value;
    let statut_occupant = '';
    let nom_occupant = '';

    if (statut_casier === 'Occupé') {
        if (occupantUnknownCheckbox.checked) {
            statut_occupant = 'Inconnu';
            nom_occupant = '';
        } else {
            // Simplified status
            statut_occupant = 'Occupé';
            nom_occupant = occupantNameInput.value;
        }
    }

    const payload = {
        id_casier: id,
        statut_casier: statut_casier,
        statut_occupant: statut_occupant,
        nom_occupant: nom_occupant
    };

    // Optimistic UI Update
    const index = lockersData.findIndex(l => l.id_casier === id);
    if (index > -1) {
        lockersData[index] = payload;
    } else {
        lockersData.push(payload);
    }

    updateSVGColors();
    closeModal(); // Close immediately for fast feel

    // Background save
    try {
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        }).catch(error => {
            console.error('Erreur de sauvegarde réseau (arrière-plan):', error);
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Start app
document.addEventListener('DOMContentLoaded', init);

// Legend Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const legendBtn = document.getElementById('legend-btn');
    const legendModal = document.getElementById('legend-modal');
    const legendClose = document.querySelector('.legend-close-button');

    if (legendBtn && legendModal && legendClose) {
        legendBtn.addEventListener('click', () => {
            legendModal.style.display = 'flex';
        });

        legendClose.addEventListener('click', () => {
            legendModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === legendModal) {
                legendModal.style.display = 'none';
            }
        });
    }
});
