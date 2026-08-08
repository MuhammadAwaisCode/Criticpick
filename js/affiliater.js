document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Helper: Show/Hide Error
    const toggleError = (inputEl, show, message = "") => {
        const parent = inputEl.parentElement;
        const errorSpan = parent.querySelector('.error-msg');
        if (show) {
            inputEl.classList.add('border-red-500');
            if (errorSpan) {
                errorSpan.textContent = message;
                errorSpan.classList.remove('hidden');
            }
        } else {
            inputEl.classList.remove('border-red-500');
            if (errorSpan) errorSpan.classList.add('hidden');
        }
    };

    // Validation Rules
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone) => /^\+?[0-9]{10,15}$/.test(phone);

    // --- SIGNUP VALIDATION ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            let isValid = true;

            const fields = {
                firstName: document.getElementById('firstName'),
                phone: document.getElementById('phone'),
                email: document.getElementById('email-input'),
                pass: document.getElementById('password'),
                confirmPass: document.getElementById('confirmPassword'),
                terms: document.getElementById('terms')
            };

            // Check First Name
            if (fields.firstName.value.trim().length < 2) {
                toggleError(fields.firstName, true, "Enter a valid name");
                isValid = false;
            } else { toggleError(fields.firstName, false); }

            // Check Phone
            if (!validatePhone(fields.phone.value)) {
                toggleError(fields.phone, true, "Enter a valid phone number (10+ digits)");
                isValid = false;
            } else { toggleError(fields.phone, false); }

            // Check Email
            if (!validateEmail(fields.email.value)) {
                toggleError(fields.email, true, "Invalid email address");
                isValid = false;
            } else { toggleError(fields.email, false); }

            // Check Password Strength
            if (fields.pass.value.length < 8) {
                toggleError(fields.pass, true, "Password must be at least 8 characters");
                isValid = false;
            } else { toggleError(fields.pass, false); }

            // Check Confirm Password
            if (fields.pass.value !== fields.confirmPass.value) {
                toggleError(fields.confirmPass, true, "Passwords do not match");
                isValid = false;
            } else { toggleError(fields.confirmPass, false); }

            if (!isValid) e.preventDefault();
        });
    }

    // --- LOGIN VALIDATION ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            const iden = document.getElementById('login-identifier');
            const pass = document.getElementById('login-password');
            let isValid = true;

            if (iden.value.trim() === "") {
                toggleError(iden, true, "Email or Username required");
                isValid = false;
            } else { toggleError(iden, false); }

            if (pass.value.length === 0) {
                toggleError(pass, true, "Password required");
                isValid = false;
            } else { toggleError(pass, false); }

            if (!isValid) e.preventDefault();
        });
    }
});