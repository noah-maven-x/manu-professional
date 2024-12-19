// <------> Sign Up Page Functions <------>
// Plan selection logic
        document.addEventListener('DOMContentLoaded', () => {
            const planGrid = document.getElementById('plan-grid');
            const planCards = planGrid.querySelectorAll('.product-card');
            const selectedPlanInput = document.getElementById('selectedPlan');

            // Set default selected plan to "Better"
            selectedPlanInput.value = "Essential Plan";

            planCards.forEach(card => {
                card.addEventListener('click', () => {
                    // Remove 'selected' class from all cards
                    planCards.forEach(c => c.classList.remove('selected'));

                    // Add 'selected' class to clicked card
                    card.classList.add('selected');

                    // Set hidden input value
                    selectedPlanInput.value = card.getAttribute('data-plan');
                });
            });
        });
        
    document.addEventListener('DOMContentLoaded', () => {
    const billingCycleInputs = document.querySelectorAll('input[name="billingCycle"]');
    const planCards = document.querySelectorAll('.product-card');

    // Initialize prices based on pre-selected "Annual"
    updatePlanPrices("Annual");

    // Event listener for billing cycle changes
    billingCycleInputs.forEach(input => {
        input.addEventListener('change', (event) => {
            const billingCycle = event.target.value;
            updatePlanPrices(billingCycle);
        });
    });

    // Function to update prices and total billed amounts
    function updatePlanPrices(billingCycle) {
        planCards.forEach(card => {
            const monthlyPrice = parseFloat(card.getAttribute('data-monthly'));
            const annualPrice = parseFloat(card.getAttribute('data-annual'));
            const priceElement = card.querySelector('.plan-price');
            const totalBilledElement = card.querySelector('.total-billed');

            if (billingCycle === "Monthly") {
                priceElement.textContent = `$${monthlyPrice}/month`;
                totalBilledElement.style.display = "none"; // Hide total billed for monthly
            } else {
                priceElement.textContent = `$${annualPrice}/year`;
                totalBilledElement.style.display = "block";
                const totalBilled = (annualPrice * 12).toLocaleString();
                totalBilledElement.textContent = `Total billed now: $${totalBilled}`;
            }
        });
    }
});
        
        // Regex patterns for basic validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\-\(\)\s]{7,20}$/;

// Turnstile: Ensure we have a callback to store the token
let turnstileToken = null;
function onTurnstileVerified(token) {
    turnstileToken = token;
}

// Sanitize function to remove dangerous characters (basic XSS protection)
function sanitizeInput(value) {
    // Remove <, >, and other potentially dangerous characters
    return value.replace(/[<>]/g, "").trim();
}

// Validate form fields
function validateForm(formData) {
    const requiredFields = ["practiceName", "contactFirstName", "contactLastName", "contactEmail", "contactPhone", "plan", "billingCycle"];
    for (let field of requiredFields) {
        const val = formData.get(field);
        if (!val || val.trim() === "") {
            return { valid: false, message: `Please fill out the ${field} field.` };
        }
    }

    // Check email format
    const email = formData.get("contactEmail");
    if (!emailPattern.test(email)) {
        return { valid: false, message: "Please enter a valid email address." };
    }

    // Check phone format (very basic)
    const phone = formData.get("contactPhone");
    if (!phonePattern.test(phone)) {
        return { valid: false, message: "Please enter a valid phone number." };
    }

    // Check turnstile token
    if (!turnstileToken) {
        return { valid: false, message: "Please complete the security check (Turnstile)." };
    }

    return { valid: true };
}

// Handle signup submission
async function handleSignup(event) {
    event.preventDefault();
    
    const loadingMessage = document.getElementById('loading-message');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    // Hide previous messages
    loadingMessage.style.display = 'none';
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    const form = event.target;
    const formData = new FormData(form);

    // Sanitize inputs
    for (let pair of formData.entries()) {
        formData.set(pair[0], sanitizeInput(pair[1]));
    }

    // Validate form
    const validation = validateForm(formData);
    if (!validation.valid) {
        errorMessage.textContent = validation.message;
        errorMessage.style.display = 'block';
        return;
    }

    // Add turnstile token to formData
    formData.append("turnstileToken", turnstileToken);

    // Show loading state
    loadingMessage.style.display = 'block';

    try {
        // Post to Make.com webhook
        const response = await fetch("https://hook.us1.make.com/pied2mdzfx9tq1gs0vxwta5al8i19w9q", {
            method: 'POST',
            body: formData
        });

        loadingMessage.style.display = 'none';

        if (response.ok) {
            successMessage.textContent = "Success! Redirecting to payment...";
            successMessage.style.display = 'block';
            
            // Assuming the Make scenario returns a JSON with { redirectUrl: "..." }
            const data = await response.json();
            if (data.redirectUrl) {
                setTimeout(() => {
                    window.location.href = data.redirectUrl;
                }, 2000);
            } else {
                // If no redirectUrl was returned, show some default success behavior
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }
        } else {
            // If server responds with an error
            errorMessage.textContent = "An error occurred. Please try again.";
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        loadingMessage.style.display = 'none';
        console.error('Error submitting form:', error);
        errorMessage.textContent = "A network error occurred. Please try again.";
        errorMessage.style.display = 'block';
    }
}

// Attach event listener to the form
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

// Expose onTurnstileVerified so Turnstile can call it
window.onTurnstileVerified = onTurnstileVerified;
// <------> END OF Sign Up Page Functions <------>