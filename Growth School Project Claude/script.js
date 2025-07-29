// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const uploadContent = document.getElementById('uploadContent');
const resultSection = document.getElementById('resultSection');
const categoryResult = document.getElementById('categoryResult');
const confidenceResult = document.getElementById('confidenceResult');
const pointsEarned = document.getElementById('pointsEarned');
const co2Saved = document.getElementById('co2Saved');
const disposalInstructions = document.getElementById('disposalInstructions');

// Event Listeners
uploadBox.addEventListener('click', () => fileInput.click());
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// Handle Image Upload
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        uploadContent.classList.add('hidden');
        
        // Simulate AI classification (replace with actual API call)
        setTimeout(() => {
            classifyImage(file);
        }, 1000);
    };
    reader.readAsDataURL(file);
}

// Classify Image
async function classifyImage(file) {
    try {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target.result;
            
            // Send to API
            const response = await fetch('/api/classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image
                })
            });
            
            if (!response.ok) {
                throw new Error('Classification failed');
            }
            
            const result = await response.json();
            
            // Update UI with results
            categoryResult.textContent = result.category;
            confidenceResult.textContent = `${(result.confidence * 100).toFixed(1)}%`;
            
            // Get disposal instructions
            disposalInstructions.textContent = result.disposal_instructions;
            
            // Show results
            resultSection.classList.remove('hidden');
            
            // Calculate points and CO2 for this specific item only
            const weight = (Math.random() * 2 + 0.5); // Random weight between 0.5-2.5 kg
            const categoryValues = CATEGORY_VALUES[result.category.toLowerCase()];
            const pointsForThisItem = categoryValues.points;
            const co2ForThisItem = categoryValues.co2 * weight;
            
            // Show ONLY the current item's contribution in the result section
            if (pointsEarned) {
                pointsEarned.textContent = `${pointsForThisItem} points`;
            }
            if (co2Saved) {
                co2Saved.textContent = `${co2ForThisItem.toFixed(1)} kg`;
            }
            
            // Update user stats if logged in using the public function from auth.js
            if (typeof updateUserStats === 'function' && getCurrentUserId()) {
                updateUserStats(result.category, weight); // Pass numerical weight
            }
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error classifying image:', error);
        // Fallback to simulation if API fails
        const categories = ['Recyclable', 'Organic', 'Hazardous', 'General'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const confidence = (Math.random() * 20 + 80).toFixed(1);
        
        categoryResult.textContent = randomCategory;
        confidenceResult.textContent = `${confidence}%`;
        
        const instructions = getDisposalInstructions(randomCategory);
        disposalInstructions.textContent = instructions;
        
        resultSection.classList.remove('hidden');
    }
}

// Get Disposal Instructions
function getDisposalInstructions(category) {
    const instructions = {
        recyclable: "Clean and dry the item before placing it in the recycling bin. Remove any non-recyclable parts.",
        organic: "Place in the compost bin or organic waste container. Make sure it's free from plastic or other contaminants.",
        hazardous: "Do not mix with regular waste. Take to a hazardous waste collection center or follow local disposal guidelines.",
        general: "Place in the general waste bin. Make sure the item is properly contained to prevent spills or leaks."
    };
    return instructions[category.toLowerCase()];
}

// Update Homepage Stats - This function is now purely reactive to userDataUpdated event
function updateHomepageStats(userData) {
    if (!userData) return; // Ensure userData is available

    const today = new Date().toISOString().slice(0, 10);
    const todayWaste = userData.dailyWaste?.[today] || 0; // Use optional chaining for safety
    
    // Update UI elements based on the fresh userData (showing cumulative totals)
    document.getElementById('todayWaste').textContent = todayWaste.toFixed(1);
    document.getElementById('todayCO2').textContent = userData.co2Saved.toFixed(1); // Use total CO2 from userData
    document.getElementById('userPoints').textContent = userData.points;
    document.getElementById('userStreak').textContent = userData.streak;
}

// Initial check to disable upload if not logged in
document.addEventListener('DOMContentLoaded', () => {
    if (!getCurrentUserId()) {
        if (uploadBox) uploadBox.classList.add('disabled');
        if (uploadBtn) uploadBtn.classList.add('disabled');
        if (resultSection) resultSection.classList.add('hidden');
    } else {
        const userData = getUserData(getCurrentUserId());
        if (userData) {
            updateHomepageStats(userData);
        }
    }
});

// Listen for user data updates to refresh homepage stats
window.addEventListener('userDataUpdated', () => {
    const currentUserId = getCurrentUserId();
    if (currentUserId) {
        const userData = getUserData(currentUserId);
        if (userData) {
            updateHomepageStats(userData);
        }
    }
}); 