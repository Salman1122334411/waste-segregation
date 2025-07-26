// DOM Elements
let loginBtn;
let logoutBtn;
let authModal;
let closeButton;
let loginTab;
let registerTab;
let loginForm;
let registerForm;
let dashboardLink;
let userStatsSection;
let chatbotLink;

// --- Local Storage Functions ---
const USERS_STORAGE_KEY = 'wasteSegregationUsers';
const CURRENT_USER_ID_KEY = 'currentUserId';

const CATEGORY_VALUES = {
    recyclable: { points: 10, co2: 0.5 },
    organic: { points: 8, co2: 0.3 },
    hazardous: { points: 15, co2: 0.8 },
    general: { points: 5, co2: 0.2 }
};

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function setCurrentUserId(userId) {
    localStorage.setItem(CURRENT_USER_ID_KEY, userId);
}

function getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_ID_KEY);
}

function removeCurrentUserId() {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
}

function getUserData(userId) {
    const users = getUsers();
    return users[userId];
}

function updateUserData(userId, data) {
    const users = getUsers();
    let currentUserData = users[userId] || {}; // Initialize if user data doesn't exist

    // Perform a deep merge for specific nested objects
    if (data.dailyWaste) {
        currentUserData.dailyWaste = { ...(currentUserData.dailyWaste || {}), ...data.dailyWaste };
    }
    if (data.dailyCategories) {
        // Need to deep merge dailyCategories as well, as it's date -> category -> weight
        if (!currentUserData.dailyCategories) {
            currentUserData.dailyCategories = {};
        }
        for (const dateKey in data.dailyCategories) {
            if (data.dailyCategories.hasOwnProperty(dateKey)) {
                currentUserData.dailyCategories[dateKey] = {
                    ...(currentUserData.dailyCategories[dateKey] || {}),
                    ...data.dailyCategories[dateKey]
                };
            }
        }
    }
    if (data.categoryCounts) {
        currentUserData.categoryCounts = { ...(currentUserData.categoryCounts || {}), ...data.categoryCounts };
    }
    if (data.achievements) {
        currentUserData.achievements = { ...(currentUserData.achievements || {}), ...data.achievements };
    }

    // Shallow merge for all other top-level properties
    users[userId] = { ...currentUserData, ...data };

    saveUsers(users);
    // Dispatch a custom event to notify listeners (e.g., dashboard.js)
    window.dispatchEvent(new CustomEvent('userDataUpdated'));
    // Re-check auth status to update main UI elements after data update and event dispatch
    checkAuthStatus();
}

// --- UI State Management ---
function updateUIForAuthStatus(isLoggedIn) {
    if (isLoggedIn) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (dashboardLink) {
            dashboardLink.classList.remove('hidden'); /* Always show dashboard link */
        }
        if (userStatsSection) {
        userStatsSection.classList.remove('hidden');
        }
        if (authModal) authModal.classList.add('hidden');
        if (chatbotLink) {
        chatbotLink.href = "chatbot.html";
        chatbotLink.removeEventListener('click', openAuthModalForChatbot);
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (dashboardLink) {
            dashboardLink.classList.remove('hidden'); /* Always show dashboard link */
        }
        if (userStatsSection) {
        userStatsSection.classList.add('hidden');
        }
        if (chatbotLink) {
            chatbotLink.href = "#";
            chatbotLink.removeEventListener('click', openAuthModalForChatbot);
        chatbotLink.addEventListener('click', openAuthModalForChatbot);
        }
    }
}

function checkAuthStatus() {
    const userId = getCurrentUserId();
    if (userId) {
        updateUIForAuthStatus(true);
        loadUserDataToUI(userId);
    } else {
        updateUIForAuthStatus(false);
    }
}

// --- Event Listeners ---
function openAuthModalForChatbot(e) {
    e.preventDefault();
    if (authModal) authModal.classList.remove('hidden');
    if (loginTab) loginTab.click();
}

// --- Data Loading & Achievement Logic ---
function loadUserDataToUI(userId) {
    const userData = getUserData(userId);
    if (userData) {
        if (document.getElementById('userPoints')) document.getElementById('userPoints').textContent = userData.points;
        if (document.getElementById('todayWaste')) document.getElementById('todayWaste').textContent = userData.totalWaste.toFixed(1);
        if (document.getElementById('todayCO2')) document.getElementById('todayCO2').textContent = userData.co2Saved.toFixed(1);
        checkAchievements(userData);
    }
}

function checkAchievements(userData) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const updatedAchievements = {
        recyclingMaster: userData.points >= 1000,
        greenWarrior: userData.co2Saved >= 50,
        consistencyKing: userData.streak >= 7
    };

    // Only update if there's a change to prevent infinite loops
    const storedAchievements = getUserData(currentUserId).achievements;
    let changed = false;
    for (const key in updatedAchievements) {
        if (updatedAchievements[key] !== storedAchievements[key]) {
            changed = true;
            break;
        }
    }

    if (changed) {
        updateUserData(currentUserId, { achievements: updatedAchievements });
    }
}

// Public function for script.js to update user stats
function updateUserStats(category, weight) {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const user = getUserData(currentUserId);
    if (!user) return;

    const values = CATEGORY_VALUES[category.toLowerCase()];

    // Create a new object to store the updates
    const updates = {
        points: (user.points || 0) + values.points,
        totalWaste: (user.totalWaste || 0) + weight,
        co2Saved: (user.co2Saved || 0) + (values.co2 * weight)
    };

    // Update daily waste
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    updates.dailyWaste = { ...(user.dailyWaste || {}) };
    updates.dailyWaste[todayKey] = (updates.dailyWaste[todayKey] || 0) + weight;

    // Update daily categories
    updates.dailyCategories = { ...(user.dailyCategories || {}) };
    if (!updates.dailyCategories[todayKey]) {
        updates.dailyCategories[todayKey] = {};
    }
    updates.dailyCategories[todayKey][category.toLowerCase()] = 
        (updates.dailyCategories[todayKey][category.toLowerCase()] || 0) + weight;

    // Update category counts to store cumulative weight
    updates.categoryCounts = { ...(user.categoryCounts || { recyclable: 0, organic: 0, hazardous: 0, general: 0 }) };
    updates.categoryCounts[category.toLowerCase()] = 
        (updates.categoryCounts[category.toLowerCase()] || 0) + weight;

    // Update streak logic
    const lastActive = user.lastActive ? new Date(user.lastActive) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    if (lastActive) {
        lastActive.setHours(0, 0, 0, 0); // Normalize to start of day
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            updates.streak = (user.streak || 0) + 1;
        } else if (diffDays > 1) {
            updates.streak = 1; // Streak broken
        } else {
            updates.streak = user.streak || 0; // Same day, no change to streak
        }
    } else {
        updates.streak = 1; // First activity, start streak
    }
    updates.lastActive = new Date().toISOString();

    // Finally, call the central updateUserData function to save and dispatch event
    updateUserData(currentUserId, updates);
}

// Initial check on load and attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM Elements here to ensure they are loaded and guard against null
    loginBtn = document.getElementById('loginBtn');
    logoutBtn = document.getElementById('logoutBtn');
    authModal = document.getElementById('authModal');
    closeButton = document.querySelector('.close-button');
    loginTab = document.getElementById('loginTab');
    registerTab = document.getElementById('registerTab');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    // dashboardLink and userStatsSection are dynamically added, so their initial state may be null on some pages.
    dashboardLink = document.getElementById('dashboardLink');
    userStatsSection = document.getElementById('userStats');
    chatbotLink = document.querySelector('a[href="chatbot.html"]');

    // Attach event listeners now that elements are surely loaded, with robust null checks
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (authModal) authModal.classList.remove('hidden');
            if (loginTab) loginTab.click(); // Default to login tab
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (authModal) authModal.classList.add('hidden');
        });
    }

    if (loginTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            if (registerTab) registerTab.classList.remove('active');
            if (loginForm) loginForm.classList.remove('hidden');
            if (registerForm) registerForm.classList.add('hidden');
        });
    }

    if (registerTab) {
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            if (loginTab) loginTab.classList.remove('active');
            if (registerForm) registerForm.classList.remove('hidden');
            if (loginForm) loginForm.classList.add('hidden');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            if (!emailInput || !passwordInput) {
                console.error('Login email or password input not found.');
                return;
            }
            const email = emailInput.value;
            const password = passwordInput.value;

            const users = getUsers();
            const userId = Object.keys(users).find(key => users[key].email === email && users[key].password === password);

            if (userId) {
                setCurrentUserId(userId);
                checkAuthStatus();
                alert('Login successful!');
                if (authModal) authModal.classList.add('hidden'); // Hide modal on successful login
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('registerEmail');
            const passwordInput = document.getElementById('registerPassword');

            if (!emailInput || !passwordInput) {
                console.error('Register email or password input not found.');
                return;
            }
            const email = emailInput.value;
            const password = passwordInput.value;

            const users = getUsers();
            if (Object.keys(users).some(key => users[key].email === email)) {
                alert('User with this email already exists.');
                return;
            }

            const newUserId = `user_${Date.now()}`;
            users[newUserId] = {
                email: email,
                password: password, // In a real app, never store passwords in plaintext!
                points: 0,
                totalWaste: 0,
                co2Saved: 0,
                achievements: {
                    recyclingMaster: false,
                    greenWarrior: false,
                    consistencyKing: false
                },
                streak: 0,
                lastActive: new Date().toISOString(),
                dailyWaste: {}, // Stores waste segregated per day
                dailyCategories: {}, // Stores categories and their weights per day
                categoryCounts: { // Stores counts for each category
                    recyclable: 0,
                    organic: 0,
                    hazardous: 0,
                    general: 0
                }
            };
            saveUsers(users);
            setCurrentUserId(newUserId);
            checkAuthStatus();
            alert('Registration successful! You are now logged in.');
            if (authModal) authModal.classList.add('hidden'); // Hide modal on successful registration
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            removeCurrentUserId();
            checkAuthStatus();
            alert('Logged out successfully.');
        });
    }

    // Re-attach openAuthModalForChatbot if chatbotLink exists
    if (chatbotLink) {
        // Ensure the event listener for opening the modal is added (if not already there)
        chatbotLink.removeEventListener('click', openAuthModalForChatbot); // Remove any existing first
        chatbotLink.addEventListener('click', openAuthModalForChatbot);
    }

    checkAuthStatus();
    // Add dashboard link to all navigation menus if not present
    const navs = document.querySelectorAll('nav .menu-items');
    navs.forEach(nav => {
        // Check if a dashboard link already exists to prevent duplication
        if (!nav.querySelector('a[href="dashboard.html"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="dashboard.html" id="dashboardLink" class="hidden">Dashboard</a>';
            // Find a suitable position, e.g., before login/logout buttons
            const loginLogoutBtnParent = nav.querySelector('#loginBtn') || nav.querySelector('#logoutBtn');
            if (loginLogoutBtnParent) {
                nav.insertBefore(li, loginLogoutBtnParent.parentNode); // Insert before the parent of the button
            } else {
                nav.appendChild(li); // Fallback if no login/logout buttons
            }
            // Re-select dashboardLink after it might have been added dynamically
            dashboardLink = document.getElementById('dashboardLink'); 
            // Ensure its visibility is correctly set by checkAuthStatus immediately after addition
            if (dashboardLink) {
                checkAuthStatus(); 
            }
        }
    });
});

