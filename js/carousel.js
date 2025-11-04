// Bootcamp Carousel JavaScript
(function() {
    'use strict';
    
    let currentSlideIndex = 0;
    let slides = [];
    let indicators = [];
    let totalSlidesElement = null;
    let currentSlideElement = null;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function initCarousel() {
        slides = document.querySelectorAll('.carousel-slide');
        indicators = document.querySelectorAll('.indicator-dot');
        totalSlidesElement = document.getElementById('totalSlides');
        currentSlideElement = document.getElementById('currentSlide');
        
        if (slides.length === 0) {
            return; // No slides found, exit
        }
        
        // Initialize first slide
        showSlide(0);
        
        // Add touch event listeners for swipe
        const carouselWrapper = document.querySelector('.bootcamp-carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
            carouselWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleKeyPress);
        
        // Prevent context menu on long press (mobile)
        if (carouselWrapper) {
            carouselWrapper.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        }
    }
    
    function showSlide(index) {
        // Wrap around
        if (index >= slides.length) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = slides.length - 1;
        } else {
            currentSlideIndex = index;
        }
        
        // Hide all slides
        slides.forEach(function(slide) {
            slide.classList.remove('active');
        });
        
        // Remove active from all indicators
        indicators.forEach(function(indicator) {
            indicator.classList.remove('active');
        });
        
        // Show current slide
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.add('active');
        }
        
        // Update counter
        if (currentSlideElement) {
            currentSlideElement.textContent = currentSlideIndex + 1;
        }
        
        // Announce to screen readers
        announceSlideChange();
    }
    
    function changeSlide(direction) {
        showSlide(currentSlideIndex + direction);
    }
    
    function goToSlide(index) {
        showSlide(index);
    }
    
    function handleKeyPress(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
            e.preventDefault();
        } else if (e.key === 'Home') {
            goToSlide(0);
            e.preventDefault();
        } else if (e.key === 'End') {
            goToSlide(slides.length - 1);
            e.preventDefault();
        }
    }
    
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
    }
    
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left, go to next slide
            changeSlide(1);
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right, go to previous slide
            changeSlide(-1);
        }
    }
    
    function announceSlideChange() {
        // For screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = 'Slide ' + (currentSlideIndex + 1) + ' of ' + slides.length;
        
        document.body.appendChild(announcement);
        
        setTimeout(function() {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Make functions globally accessible
    window.changeSlide = changeSlide;
    window.goToSlide = goToSlide;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCarousel);
    } else {
        initCarousel();
    }
    
    // Reinitialize if window is resized (for responsive adjustments)
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Refresh current slide display after resize
            if (slides[currentSlideIndex]) {
                showSlide(currentSlideIndex);
            }
        }, 250);
    });
})();

