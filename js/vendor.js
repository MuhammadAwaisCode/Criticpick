document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email-input');
    const preview = document.getElementById('avatar-preview');
    const upload = document.getElementById('avatar-upload');

    // --- Avatar Preview Logic ---
    if (upload) {
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

    // --- Validation Helper ---
    const validate = (id, condition, msg) => {
        const el = document.getElementById(id);
        if (!el) return true;
        const error = el.nextElementSibling;
        if (!condition) {
            el.classList.add('border-red-500');
            if (error) { error.innerText = msg; error.classList.remove('hidden'); }
            return false;
        } else {
            el.classList.remove('border-red-500');
            if (error) error.classList.add('hidden');
            return true;
        }
    };

    // --- Login Form Submission ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            let valid = true;
            valid &= validate('login-identifier', document.getElementById('login-identifier').value.trim() !== "", "Required");
            valid &= validate('login-password', document.getElementById('login-password').value !== "", "Required");
            if (!valid) e.preventDefault();
        });
    }

    // --- Signup Form Submission ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            let valid = true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            valid &= validate('storeName', document.getElementById('storeName').value.trim().length >= 2, "Store name too short");
            valid &= validate('email-input', emailRegex.test(emailInput.value), "Invalid email");
            valid &= validate('password', document.getElementById('password').value.length >= 8, "Minimum 8 characters");
            valid &= validate('confirmPassword', document.getElementById('confirmPassword').value === document.getElementById('password').value, "Match failed");

            if (!valid) e.preventDefault();
        });
    }
});