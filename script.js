const API_URL = 'https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec';

// DOM Elements
const svgContainer = document.getElementById('svg-container');
const modal = document.getElementById('locker-modal');
const closeBtn = document.querySelector('.close-button');
const lockerForm = document.getElementById('locker-form');
const lockerStatusSelect = document.getElementById('locker-status');
const occupantSection = document.getElementById('occupant-section');
const occupantStatusSelect = document.getElementById('occupant-status');
const occupantNameInput = document.getElementById('occupant-name');
const saveButton = document.getElementById('save-button');
const loadingSpinner = document.getElementById('loading-spinner');
const messageArea = document.getElementById('message-area');
const modalTitle = document.getElementById('modal-title');
const lockerIdInput = document.getElementById('locker-id');

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
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // Fallback for demo if API fails
        console.log("Utilisation de données simulées ou aucune donnée (API en erreur).");
        // lockersData = []; // empty or mock data
    }
}

// Update SVG colors based on data
function updateSVGColors() {
    // Default colors based on CSS variables
    const colors = {
        libre: '#28a745',
        pro_etudiant: '#dc3545',
        inconnu: '#fd7e14',
        undef: '#ffffff'
    };

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    // Reset all to undef first
    const allLockers = svgElement.querySelectorAll('.casier');
    allLockers.forEach(locker => {
        locker.setAttribute('fill', colors.undef);
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
                    // Professionnel ou Etudiant ou vide
                    fillColor = colors.pro_etudiant;
                }
            }

            lockerElement.setAttribute('fill', fillColor);
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

    lockerForm.addEventListener('submit', handleFormSubmit);
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

    modalTitle.textContent = `Modifier le ${lockerId.replace('-', ' ')}`;
    lockerIdInput.value = lockerId;
    lockerStatusSelect.value = lockerData.statut_casier || '';

    if (lockerData.statut_casier === 'Occupé') {
        occupantSection.style.display = 'block';
        occupantStatusSelect.value = lockerData.statut_occupant || '';
        occupantNameInput.value = lockerData.nom_occupant || '';
    } else {
        occupantSection.style.display = 'none';
        occupantStatusSelect.value = '';
        occupantNameInput.value = '';
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

    const id = lockerIdInput.value;
    const statut_casier = lockerStatusSelect.value;
    const statut_occupant = statut_casier === 'Occupé' ? occupantStatusSelect.value : '';
    const nom_occupant = statut_casier === 'Occupé' ? occupantNameInput.value : '';

    const payload = {
        id_casier: id,
        statut_casier: statut_casier,
        statut_occupant: statut_occupant,
        nom_occupant: nom_occupant
    };

    saveButton.disabled = true;
    loadingSpinner.style.display = 'block';
    messageArea.textContent = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            // Important for Google Apps Script to not preflight sometimes or just use text/plain
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });

        // Note: Google Apps Script with POST usually returns a CORS error or opaque response if not configured perfectly.
        // If it throws, we catch it.
        // We will assume success for the UI logic if no error is thrown, or update local state directly.

        // Update local data
        const index = lockersData.findIndex(l => l.id_casier === id);
        if (index > -1) {
            lockersData[index] = payload;
        } else {
            lockersData.push(payload);
        }

        updateSVGColors();

        messageArea.textContent = 'Enregistré avec succès !';
        messageArea.className = 'message success';

        setTimeout(() => {
            closeModal();
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        messageArea.textContent = 'Erreur lors de la sauvegarde. (Note: l\'API peut nécessiter un nouveau déploiement).';
        messageArea.className = 'message error';
    } finally {
        saveButton.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
