document.addEventListener('DOMContentLoaded', () => {
    // Select both possible forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // UI Elements shared by both
    const upload = document.getElementById('avatar-upload');
    const preview = document.getElementById('avatar-preview');
    const emailInput = document.getElementById('email-input');

    // --- 1. COMMON UI LOGIC (Avatar) ---
    if (upload && preview) {
        upload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                reader.readAsDataURL(file);
            }
        });
    }

    if (emailInput && preview) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !preview.querySelector('img')) {
                preview.innerHTML = `<span>${this.value[0].toUpperCase()}</span>`;
            }
        });
    }

    // --- 2. VALIDATION HELPERS ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const toggleError = (id, condition, msg) => {
        const el = document.getElementById(id);
        if (!el) return;
        const error = el.nextElementSibling;
        if (!condition) {
            el.classList.add('border-red-500');
            if (error && error.classList.contains('error-msg')) {
                error.innerText = msg;
                error.classList.remove('hidden');
            }
            return false;
        } else {
            el.classList.remove('border-red-500');
            if (error && error.classList.contains('error-msg')) {
                error.classList.add('hidden');
            }
            return true;
        }
    };

    // --- 3. LOGIN VALIDATION ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            let isValid = true;
            
            // Check Email/Username field
            if (!toggleError('email-input', emailInput.value.trim().length > 0, "Email or Username is required")) {
                isValid = false;
            }

            // Check Password field
            const pass = document.getElementById('password');
            if (!toggleError('password', pass.value.length > 0, "Password is required")) {
                isValid = false;
            }

            if (!isValid) e.preventDefault();
        });
    }

    // --- 4. SIGNUP VALIDATION ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            let isValid = true;

            // Email Validation
            if (!toggleError('email-input', emailRegex.test(emailInput.value), "Enter a valid email address")) {
                isValid = false;
            }

            // Password Validation (Min 8 chars)
            const pass = document.getElementById('password');
            if (!toggleError('password', pass.value.length >= 8, "Password must be at least 8 characters")) {
                isValid = false;
            }

            // Confirm Password Validation
            const confirmPass = document.getElementById('confirmPassword');
            if (!toggleError('confirmPassword', confirmPass.value === pass.value, "Passwords do not match")) {
                isValid = false;
            }

            if (!isValid) e.preventDefault();
        });
    }
});