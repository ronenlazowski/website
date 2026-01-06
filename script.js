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

    // Projects Carousel with Infinite Auto-Rotation
    const projectsGrid = document.querySelector('.projects-grid');
    const prevBtn = document.querySelector('.carousel-btn-prev');
    const nextBtn = document.querySelector('.carousel-btn-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    const progressBar = document.querySelector('.carousel-progress-bar');
    const swipeHint = document.querySelector('.swipe-hint');
    
    if (projectsGrid && dotsContainer) {
        const originalItems = Array.from(projectsGrid.querySelectorAll('.project-item'));
        const totalProjects = originalItems.length;
        
        if (totalProjects === 0) return;
        
        // Carousel state
        const AUTOPLAY_DURATION = 5000;
        const PROGRESS_STEP = 50;
        const ANIMATION_DELAY = 400;
        
        let currentIndex = 0;
        let progressInterval = null;
        let progress = 0;
        let isPaused = false;
        let isAnimating = false;
        
        // Clone items for infinite scroll - clones before (reversed) and after (in order)
        for (let i = totalProjects - 1; i >= 0; i--) {
            const clone = originalItems[i].cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('aria-hidden', 'true');
            projectsGrid.insertBefore(clone, projectsGrid.firstChild);
        }
        
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            clone.classList.add('clone');
            clone.setAttribute('aria-hidden', 'true');
            projectsGrid.appendChild(clone);
        });
        
        const allItems = Array.from(projectsGrid.querySelectorAll('.project-item'));
        
        // Create navigation dots
        originalItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to project ${index + 1}`);
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetAutoplay();
            });
            dotsContainer.appendChild(dot);
        });
        
        const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
        
        // Check if we're on mobile
        function isMobile() {
            return window.innerWidth <= 768;
        }
        
        // Get the scroll position to center a specific original item
        function getScrollPosition(index) {
            const actualIndex = index + totalProjects; // Account for clones before
            const item = allItems[actualIndex];
            if (!item) return 0;
            
            const gridWidth = projectsGrid.offsetWidth;
            const itemWidth = item.offsetWidth;
            const itemLeft = item.offsetLeft;
            
            // Center the item in the viewport
            const centerOffset = (gridWidth - itemWidth) / 2;
            return itemLeft - centerOffset;
        }
        
        // Update which dot is active
        function updateDots(index) {
            const normalizedIndex = ((index % totalProjects) + totalProjects) % totalProjects;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === normalizedIndex);
            });
        }
        
        // Detect which item is currently centered
        function getCurrentCenteredIndex() {
            const gridRect = projectsGrid.getBoundingClientRect();
            const centerX = gridRect.left + gridRect.width / 2;
            
            let closestIndex = 0;
            let minDistance = Infinity;
            
            allItems.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const itemCenterX = itemRect.left + itemRect.width / 2;
                const distance = Math.abs(centerX - itemCenterX);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });
            
            return closestIndex;
        }
        
        // Go to a specific slide with animation
        function goToSlide(index, smooth = true) {
            if (isAnimating) return;
            
            currentIndex = index;
            const scrollPos = getScrollPosition(index);
            
            projectsGrid.style.scrollBehavior = smooth ? 'smooth' : 'auto';
            projectsGrid.scrollLeft = scrollPos;
            
            updateDots(index);
        }
        
        // Move to next slide
        function nextSlide() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex++;
            const scrollPos = getScrollPosition(currentIndex);
            
            projectsGrid.style.scrollBehavior = 'smooth';
            projectsGrid.scrollLeft = scrollPos;
            
            updateDots(currentIndex);
            
            // Check if we need to loop back
            setTimeout(() => {
                if (currentIndex >= totalProjects) {
                    currentIndex = 0;
                    projectsGrid.style.scrollBehavior = 'auto';
                    projectsGrid.scrollLeft = getScrollPosition(0);
                }
                isAnimating = false;
            }, ANIMATION_DELAY);
        }
        
        // Move to previous slide
        function prevSlide() {
            if (isAnimating) return;
            isAnimating = true;
            
            currentIndex--;
            const scrollPos = getScrollPosition(currentIndex);
            
            projectsGrid.style.scrollBehavior = 'smooth';
            projectsGrid.scrollLeft = scrollPos;
            
            updateDots(currentIndex);
            
            // Check if we need to loop back
            setTimeout(() => {
                if (currentIndex < 0) {
                    currentIndex = totalProjects - 1;
                    projectsGrid.style.scrollBehavior = 'auto';
                    projectsGrid.scrollLeft = getScrollPosition(totalProjects - 1);
                }
                isAnimating = false;
            }, ANIMATION_DELAY);
        }
        
        // Autoplay functions
        function updateProgress() {
            if (isPaused || isAnimating) return;
            
            progress += (PROGRESS_STEP / AUTOPLAY_DURATION) * 100;
            if (progressBar) progressBar.style.width = `${Math.min(progress, 100)}%`;
            
            if (progress >= 100) {
                progress = 0;
                nextSlide();
            }
        }
        
        function stopAutoplay() {
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
        }
        
        function startAutoplay() {
            stopAutoplay();
            if (isPaused) return;
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
            progressInterval = setInterval(updateProgress, PROGRESS_STEP);
        }
        
        function resetAutoplay() {
            progress = 0;
            if (progressBar) progressBar.style.width = '0%';
            startAutoplay();
        }
        
        function pauseAutoplay() {
            isPaused = true;
            stopAutoplay();
            if (progressBar) progressBar.style.opacity = '0.3';
        }
        
        function resumeAutoplay() {
            isPaused = false;
            if (progressBar) progressBar.style.opacity = '1';
            startAutoplay();
        }
        
        // Button click handlers
        prevBtn?.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
        nextBtn?.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
        
        // Handle scroll end to sync dots and handle infinite loop
        let scrollEndTimer;
        projectsGrid.addEventListener('scroll', () => {
            clearTimeout(scrollEndTimer);
            
            scrollEndTimer = setTimeout(() => {
                if (isAnimating) return;
                
                const centeredIndex = getCurrentCenteredIndex();
                const originalIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
                
                // Check if we're on a clone
                const isOnCloneBefore = centeredIndex < totalProjects;
                const isOnCloneAfter = centeredIndex >= totalProjects * 2;
                
                if (isOnCloneBefore || isOnCloneAfter) {
                    // Jump to the real item instantly
                    isAnimating = true;
                    projectsGrid.style.scrollBehavior = 'auto';
                    projectsGrid.scrollLeft = getScrollPosition(originalIndex);
                    currentIndex = originalIndex;
                    updateDots(currentIndex);
                    setTimeout(() => { isAnimating = false; }, 50);
                } else {
                    currentIndex = originalIndex;
                    updateDots(currentIndex);
                }
            }, 150);
        }, { passive: true });
        
        // Touch handling for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouching = false;
        let isHorizontalSwipe = null;
        
        projectsGrid.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isTouching = true;
            isHorizontalSwipe = null;
            pauseAutoplay();
            
            // Hide swipe hint on first touch
            if (swipeHint) {
                swipeHint.style.opacity = '0';
                setTimeout(() => { if (swipeHint) swipeHint.style.display = 'none'; }, 300);
            }
        }, { passive: true });
        
        projectsGrid.addEventListener('touchmove', (e) => {
            if (!isTouching || isHorizontalSwipe !== null) return;
            
            const diffX = Math.abs(e.touches[0].clientX - touchStartX);
            const diffY = Math.abs(e.touches[0].clientY - touchStartY);
            
            // Determine if horizontal or vertical swipe
            if (diffX > 10 || diffY > 10) {
                isHorizontalSwipe = diffX > diffY;
            }
        }, { passive: true });
        
        projectsGrid.addEventListener('touchend', (e) => {
            if (!isTouching) return;
            isTouching = false;
            
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            // Only handle horizontal swipes
            if (isHorizontalSwipe && Math.abs(diff) > 40) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                // Snap to nearest slide if no significant swipe
                const centeredIndex = getCurrentCenteredIndex();
                const originalIndex = ((centeredIndex - totalProjects) % totalProjects + totalProjects) % totalProjects;
                goToSlide(originalIndex, true);
            }
            
            setTimeout(resumeAutoplay, 2000);
        }, { passive: true });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const projectsSection = document.getElementById('projects');
            if (!projectsSection) return;
            
            const rect = projectsSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                    resetAutoplay();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                    resetAutoplay();
                }
            }
        });
        
        // Initialize carousel
        function init() {
            projectsGrid.style.scrollBehavior = 'auto';
            projectsGrid.scrollLeft = getScrollPosition(0);
            updateDots(0);
            
            // Start autoplay after a brief delay
            setTimeout(startAutoplay, 500);
        }
        
        // Wait for layout
        if (document.readyState === 'complete') {
            setTimeout(init, 100);
        } else {
            window.addEventListener('load', () => setTimeout(init, 100));
        }
        
        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                projectsGrid.style.scrollBehavior = 'auto';
                projectsGrid.scrollLeft = getScrollPosition(currentIndex);
            }, 200);
        });
        
        // Pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else if (!isPaused) {
                startAutoplay();
            }
        });
    }
});
