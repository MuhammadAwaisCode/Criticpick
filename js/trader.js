document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const terms = document.getElementById('terms');
    const regBtn = document.getElementById('registerBtn');
    const emailInput = document.getElementById('email-input');
    const preview = document.getElementById('avatar-preview');
    const upload = document.getElementById('avatar-upload');

    // --- 1. Common UI Logic ---
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

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !preview.querySelector('img')) {
                preview.innerHTML = `<span>${this.value[0].toUpperCase()}</span>`;
            }
        });
    }

    // --- 2. Checkbox Lock ---
    if (terms && regBtn) {
        terms.addEventListener('change', () => {
            regBtn.disabled = !terms.checked;
        });
    }

    // --- 3. Validation Logic ---
    const validateField = (id, condition, msg) => {
        const el = document.getElementById(id);
        if (!el) return true;
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
            if (error && error.classList.contains('error-msg')) error.classList.add('hidden');
            return true;
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            let valid = true;
            valid &= validateField('login-identifier', document.getElementById('login-identifier').value.trim() !== "", "Username/Email required");
            valid &= validateField('login-password', document.getElementById('login-password').value !== "", "Password required");
            if (!valid) e.preventDefault();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            let valid = true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[0-9]{10,15}$/;

            valid &= validateField('firstName', document.getElementById('firstName').value.length > 1, "Required");
            valid &= validateField('phone', phoneRegex.test(document.getElementById('phone').value), "Invalid phone");
            valid &= validateField('email-input', emailRegex.test(emailInput.value), "Invalid email");
            valid &= validateField('password', document.getElementById('password').value.length >= 8, "Min 8 characters");
            valid &= validateField('confirmPassword', document.getElementById('confirmPassword').value === document.getElementById('password').value, "Doesn't match");

            if (!valid) e.preventDefault();
        });
    }
});