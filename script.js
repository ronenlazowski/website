document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    body.classList.add(savedTheme);
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark-mode');
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
            }
        });
    }
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const messageField = document.getElementById('message');
    const characterCounter = document.querySelector('.character-counter');
    if (messageField && characterCounter) {
        messageField.addEventListener('input', function() {
            const length = this.value.length;
            const maxLength = 1000;
            characterCounter.textContent = `${length}/${maxLength}`;
            if (length > 950) {
                characterCounter.style.color = '#ef4444';
            } else if (length > 800) {
                characterCounter.style.color = '#f59e0b';
            } else {
                characterCounter.style.color = '';
            }
        });
    }
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearFormStatus();
            clearAllErrors();
            if (!validateForm()) {
                return;
            }
            setLoadingState(true);
            try {
                const formData = new FormData(contactForm);
                formData.append('_replyto', formData.get('email'));
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                if (response.ok) {
                    showSuccessMessage();
                    contactForm.reset();
                    if (characterCounter) {
                        characterCounter.textContent = '0/1000';
                        characterCounter.style.color = '';
                    }
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        showErrorMessage('Please check your form data and try again.');
                    } else {
                        showErrorMessage('Something went wrong. Please try again or contact me directly at me@ronenlaz.com');
                    }
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showErrorMessage('Network error. Please check your connection and try again.');
            } finally {
                setLoadingState(false);
            }
        });
    }
    function validateForm() {
        let isValid = true;
        
        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');
        
        if (!nameField || !emailField || !messageField) {
            console.error('Required form fields not found');
            return false;
        }
        
        const name = nameField.value.trim();
        if (!name) {
            showFieldError('name', 'Name is required');
            isValid = false;
        }
        
        const email = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        const message = messageField.value.trim();
        if (!message) {
            showFieldError('message', 'Message is required');
            isValid = false;
        } else if (message.length > 1000) {
            showFieldError('message', 'Message must be 1000 characters or less');
            isValid = false;
        }
        
        return isValid;
    }
    function showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    function clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }
    function setLoadingState(loading) {
        if (!submitBtn) return;
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span>Sending...</span>
            `;
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="btn-text">Send Message</span>
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m22 2-7 20-4-9-9-4z"/>
                    <path d="M22 2 11 13"/>
                </svg>
            `;
        }
    }
    function showSuccessMessage() {
        if (!formStatus) return;
        
        formStatus.innerHTML = `
            <div class="success-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span>Message sent successfully! I'll get back to you soon.</span>
            </div>
        `;
        formStatus.style.display = 'block';
        setTimeout(() => {
            clearFormStatus();
        }, 5000);
    }
    function showErrorMessage(message) {
        if (!formStatus) return;
        
        formStatus.innerHTML = `
            <div class="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
        formStatus.style.display = 'block';
        setTimeout(() => {
            clearFormStatus();
        }, 8000);
    }
    function clearFormStatus() {
        if (!formStatus) return;
        
        formStatus.innerHTML = '';
        formStatus.style.display = 'none';
    }
});
