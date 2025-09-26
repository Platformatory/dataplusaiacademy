/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize WOW.js Scrolling Animations
    new WOW().init();

    // Testimonial Video Custom Play Button Control
    $('.play-button').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $videoContainer = $(this).closest('.video-container');
        var $video = $videoContainer.find('.testimonial-video');
        var $playButton = $(this);
        
        // Pause all other videos first
        $('.testimonial-video').each(function() {
            if (this !== $video[0]) {
                this.pause();
                $(this).siblings('.play-button').show();
            }
        });
        
        // Play the video and hide the play button
        $video[0].play();
        $playButton.hide();
        
        // Show play button again when video ends
        $video.off('ended').on('ended', function() {
            $playButton.show();
        });
    });

    // Click anywhere on video to pause
    $('.testimonial-video').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var $video = $(this);
        var $playButton = $video.siblings('.play-button');
        
        if (!$video[0].paused) {
            // Pause the video and show play button
            $video[0].pause();
            $playButton.show();
        }
    });

    // Pure CSS Carousel Functionality
    let currentSlideIndex = 0;
    let totalSlides = 0;
    let autoSlideInterval;

    // Initialize carousel
    function initCarousel() {
        const carousel = document.querySelector('.css-carousel');
        if (!carousel) return;
        
        // Wait for dynamic content to load
        setTimeout(() => {
            const slides = document.querySelectorAll('.carousel-slide');
            totalSlides = slides.length;
            
            if (totalSlides === 0) return; // No slides loaded yet
            
            const duration = parseInt(carousel.getAttribute('data-duration')) || 8;
            
            // Start auto-slide
            startAutoSlide(duration);
            
            // Pause on hover
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', () => startAutoSlide(duration));
        }, 100);
    }

    // Auto-slide functionality
    function startAutoSlide(duration) {
        stopAutoSlide(); // Clear any existing interval
        autoSlideInterval = setInterval(() => {
            changeSlide(1);
        }, duration * 1000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Change slide function
    window.changeSlide = function(direction) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        if (!slides.length) return;
        
        // Update totalSlides in case it changed
        totalSlides = slides.length;
        
        // Remove active class from current slide and indicator
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.remove('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.remove('active');
        }
        
        // Calculate new slide index
        currentSlideIndex += direction;
        
        // Handle wrapping
        if (currentSlideIndex >= totalSlides) {
            currentSlideIndex = 0;
        } else if (currentSlideIndex < 0) {
            currentSlideIndex = totalSlides - 1;
        }
        
        // Add active class to new slide and indicator
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.add('active');
        }
    };

    // Go to specific slide
    window.currentSlide = function(slideNumber) {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        if (!slides.length) return;
        
        // Update totalSlides in case it changed
        totalSlides = slides.length;
        
        if (slideNumber < 1 || slideNumber > totalSlides) return;
        
        // Remove active class from current slide and indicator
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.remove('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.remove('active');
        }
        
        // Set new slide index
        currentSlideIndex = slideNumber - 1;
        
        // Add active class to new slide and indicator
        if (slides[currentSlideIndex]) {
            slides[currentSlideIndex].classList.add('active');
        }
        if (indicators[currentSlideIndex]) {
            indicators[currentSlideIndex].classList.add('active');
        }
    };

    // Initialize carousel when document is ready
    $(document).ready(function() {
        initCarousel();
    });

})(jQuery); // End of use strict
