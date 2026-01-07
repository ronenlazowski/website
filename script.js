document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    
    body.classList.add(savedTheme);
    
    themeToggle?.addEventListener('click', () => {
        const isLight = body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark-mode' : 'light-mode';
        body.classList.replace(isLight ? 'light-mode' : 'dark-mode', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const formStatus = document.getElementById('form-status');
    const messageField = document.getElementById('message');
    const characterCounter = document.querySelector('.character-counter');
    const MAX_MESSAGE_LENGTH = 1000;
    
    if (messageField && characterCounter) {
        messageField.addEventListener('input', () => {
            const length = messageField.value.length;
            characterCounter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
            characterCounter.style.color = length > 950 ? '#ef4444' : length > 800 ? '#f59e0b' : '';
        });
    }
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormStatus();
        clearAllErrors();
        
        if (!validateForm()) return;
        
        setLoadingState(true);
        
        try {
            const formData = new FormData(contactForm);
            formData.append('_replyto', formData.get('email'));
            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            
            if (response.ok) {
                showSuccessMessage();
                contactForm.reset();
                if (characterCounter) {
                    characterCounter.textContent = `0/${MAX_MESSAGE_LENGTH}`;
                    characterCounter.style.color = '';
                }
            } else {
                const data = await response.json();
                showErrorMessage(data.errors 
                    ? 'Please check your form data and try again.'
                    : 'Something went wrong. Please try again or contact me directly at me@ronenlaz.com'
                );
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showErrorMessage('Network error. Please check your connection and try again.');
        } finally {
            setLoadingState(false);
        }
    });
    function validateForm() {
        const fields = {
            name: document.getElementById('name'),
            email: document.getElementById('email'),
            message: document.getElementById('message')
        };
        
        if (!fields.name || !fields.email || !fields.message) {
            console.error('Required form fields not found');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const validations = [
            { field: 'name', value: fields.name.value.trim(), check: v => !v, msg: 'Name is required' },
            { field: 'email', value: fields.email.value.trim(), check: v => !v, msg: 'Email is required' },
            { field: 'email', value: fields.email.value.trim(), check: v => v && !emailRegex.test(v), msg: 'Please enter a valid email address' },
            { field: 'message', value: fields.message.value.trim(), check: v => !v, msg: 'Message is required' },
            { field: 'message', value: fields.message.value.trim(), check: v => v.length > MAX_MESSAGE_LENGTH, msg: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` }
        ];
        
        let isValid = true;
        for (const { field, value, check, msg } of validations) {
            if (check(value)) {
                showFieldError(field, msg);
                isValid = false;
                break;
            }
        }
        
        return isValid;
    }
    function showFieldError(fieldName, message) {
        const el = document.getElementById(`${fieldName}-error`);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
    const SUBMIT_BTN_DEFAULT = `
        <span class="btn-text">Send Message</span>
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m22 2-7 20-4-9-9-4z"/>
            <path d="M22 2 11 13"/>
        </svg>`;
    
    const SUBMIT_BTN_LOADING = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>Sending...</span>`;
    
    function setLoadingState(loading) {
        if (!submitBtn) return;
        submitBtn.disabled = loading;
        submitBtn.innerHTML = loading ? SUBMIT_BTN_LOADING : SUBMIT_BTN_DEFAULT;
    }
    function showFormMessage(type, message, duration) {
        if (!formStatus) return;
        
        const icons = {
            success: '<path d="M20 6L9 17l-5-5"/>',
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        };
        
        formStatus.innerHTML = `
            <div class="${type}-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[type]}
                </svg>
                <span>${message}</span>
            </div>`;
        formStatus.style.display = 'block';
        setTimeout(clearFormStatus, duration);
    }
    
    function showSuccessMessage() {
        showFormMessage('success', "Message sent successfully! I'll get back to you soon.", 5000);
    }
    
    function showErrorMessage(message) {
        showFormMessage('error', message, 8000);
    }
    
    function clearFormStatus() {
        if (!formStatus) return;
        formStatus.innerHTML = '';
        formStatus.style.display = 'none';
    }

    // Projects Carousel - Transform-based for smooth performance
    const projectsGrid = document.querySelector('.projects-grid');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const progressBar = document.querySelector('.carousel-progress-bar');
    const swipeHint = document.querySelector('.swipe-hint');
    
    if (projectsGrid && dotsContainer) {
        const items = Array.from(projectsGrid.querySelectorAll('.project-item'));
        const totalSlides = items.length;
        
        if (totalSlides === 0) return;
        
        // Configuration
        const CONFIG = {
            autoplayDuration: 5000,
            transitionDuration: 400,
            swipeThreshold: 50,
            velocityThreshold: 0.3
        };
        
        // State
        let currentIndex = 0;
        let isTransitioning = false;
        let autoplayTimer = null;
        let progressTimer = null;
        let progress = 0;
        
        // Create dots
        items.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
        
        const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
        
        // Update active states
        function updateActiveStates() {
            items.forEach((item, i) => {
                item.classList.toggle('active', i === currentIndex);
                item.style.opacity = i === currentIndex ? '1' : '0.4';
                item.style.transform = i === currentIndex ? 'scale(1)' : 'scale(0.9)';
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
                dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
            });
        }
        
        // Smooth scroll to slide
        function scrollToSlide(index, smooth = true) {
            const item = items[index];
            if (!item) return;
            
            const containerWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const itemLeft = item.offsetLeft;
            const targetScroll = itemLeft - (containerWidth - itemWidth) / 2;
            
            if (smooth) {
                projectsGrid.scrollTo({
                    left: targetScroll,
                    behavior: 'smooth'
                });
            } else {
                projectsGrid.scrollLeft = targetScroll;
            }
        }
        
        // Go to specific slide
        function goToSlide(index, smooth = true) {
            if (isTransitioning && smooth) return;
            
            currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
            
            if (smooth) {
                isTransitioning = true;
                setTimeout(() => { isTransitioning = false; }, CONFIG.transitionDuration);
            }
            
            scrollToSlide(currentIndex, smooth);
            updateActiveStates();
            resetAutoplay();
        }
        
        // Navigation
        function nextSlide() {
            goToSlide(currentIndex + 1);
        }
        
        function prevSlide() {
            goToSlide(currentIndex - 1);
        }
        
        // Autoplay
        function startAutoplay() {
            stopAutoplay();
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
            
            progressTimer = setInterval(() => {
                progress += 2;
                if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
                
                if (progress >= 100) {
                    progress = 0;
                    nextSlide();
                }
            }, CONFIG.autoplayDuration / 50);
        }
        
        function stopAutoplay() {
            if (progressTimer) {
                clearInterval(progressTimer);
                progressTimer = null;
            }
            if (autoplayTimer) {
                clearTimeout(autoplayTimer);
                autoplayTimer = null;
            }
        }
        
        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
        
        function pauseAutoplay() {
            stopAutoplay();
            if (progressBar) progressBar.style.opacity = '0.3';
        }
        
        function resumeAutoplay() {
            if (progressBar) progressBar.style.opacity = '1';
            startAutoplay();
        }
        
        // Button handlers
        prevBtn?.addEventListener('click', prevSlide);
        nextBtn?.addEventListener('click', nextSlide);
        
        // Touch/swipe handling
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isSwiping = false;
        
        projectsGrid.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isSwiping = true;
            pauseAutoplay();
            
            // Hide swipe hint
            if (swipeHint) {
                swipeHint.style.opacity = '0';
                setTimeout(() => swipeHint.remove(), 300);
            }
        }, { passive: true });
        
        projectsGrid.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchStartX - touchEndX;
            const diffY = touchStartY - touchEndY;
            const elapsed = Date.now() - touchStartTime;
            const velocity = Math.abs(diffX) / elapsed;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                const shouldSwipe = Math.abs(diffX) > CONFIG.swipeThreshold || velocity > CONFIG.velocityThreshold;
                
                if (shouldSwipe) {
                    if (diffX > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                } else {
                    // Snap back to current
                    scrollToSlide(currentIndex);
                    resumeAutoplay();
                }
            } else {
                resumeAutoplay();
            }
        }, { passive: true });
        
        // Mouse drag for desktop
        let isDragging = false;
        let dragStartX = 0;
        let dragScrollLeft = 0;
        
        projectsGrid.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragStartX = e.pageX;
            dragScrollLeft = projectsGrid.scrollLeft;
            projectsGrid.style.cursor = 'grabbing';
            pauseAutoplay();
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diff = e.pageX - dragStartX;
            projectsGrid.scrollLeft = dragScrollLeft - diff;
        });
        
        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            projectsGrid.style.cursor = 'grab';
            
            const diff = dragStartX - e.pageX;
            if (Math.abs(diff) > CONFIG.swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                scrollToSlide(currentIndex);
                resumeAutoplay();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const section = document.getElementById('projects');
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nextSlide();
                }
            }
        });
        
        // Set initial cursor
        projectsGrid.style.cursor = 'grab';
        
        // Scroll sync - detect when user scrolls manually and update current index
        let scrollTimeout;
        projectsGrid.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (isDragging || isSwiping || isTransitioning) return;
                
                // Find closest slide to center
                const containerCenter = projectsGrid.scrollLeft + projectsGrid.offsetWidth / 2;
                let closestIndex = 0;
                let closestDistance = Infinity;
                
                items.forEach((item, i) => {
                    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                    const distance = Math.abs(containerCenter - itemCenter);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = i;
                    }
                });
                
                if (closestIndex !== currentIndex) {
                    currentIndex = closestIndex;
                    updateActiveStates();
                }
            }, 100);
        }, { passive: true });
        
        // Initialize
        function init() {
            // Apply initial styles
            items.forEach((item, i) => {
                item.style.transition = `opacity ${CONFIG.transitionDuration}ms ease, transform ${CONFIG.transitionDuration}ms ease`;
            });
            
            // Scroll to first slide
            scrollToSlide(0, false);
            updateActiveStates();
            
            // Start autoplay
            setTimeout(startAutoplay, 500);
        }
        
        // Wait for layout
        if (document.readyState === 'complete') {
            requestAnimationFrame(init);
        } else {
            window.addEventListener('load', () => requestAnimationFrame(init));
        }
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                scrollToSlide(currentIndex, false);
            }, 150);
        });
        
        // Visibility handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                resumeAutoplay();
            }
        });
        
        // Intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    resumeAutoplay();
                } else {
                    stopAutoplay();
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(projectsGrid);
    }
});
