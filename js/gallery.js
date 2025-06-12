/**
 * Gallery specific functionality - lightbox and image navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length) {
        // Create lightbox elements if they don't already exist
        let lightbox = document.querySelector('.lightbox');

        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';

            const lightboxContent = document.createElement('div');
            lightboxContent.className = 'lightbox-content';

            const lightboxImage = document.createElement('img');
            lightboxContent.appendChild(lightboxImage);

            const closeButton = document.createElement('button');
            closeButton.className = 'lightbox-close';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'סגור');

            const navButtons = document.createElement('div');
            navButtons.className = 'lightbox-nav';

            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&#10094;';
            prevButton.setAttribute('aria-label', 'התמונה הקודמת');

            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&#10095;';
            nextButton.setAttribute('aria-label', 'התמונה הבאה');

            navButtons.appendChild(prevButton);
            navButtons.appendChild(nextButton);

            lightbox.appendChild(lightboxContent);
            lightbox.appendChild(closeButton);
            lightbox.appendChild(navButtons);

            document.body.appendChild(lightbox);
        }

        // Get references to elements
        const lightboxImage = lightbox.querySelector('.lightbox-content img');
        const closeButton = lightbox.querySelector('.lightbox-close');
        const prevButton = lightbox.querySelector('.lightbox-nav button:first-child');
        const nextButton = lightbox.querySelector('.lightbox-nav button:last-child');

        // Variables to track current image
        let currentIndex = 0;
        const galleryImages = Array.from(galleryItems).map(item => item.querySelector('img').src);

        // Add click event to gallery items
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                currentIndex = index;
                updateLightboxImage(currentIndex);
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is active
            });
        });

        // Close lightbox
        closeButton.addEventListener('click', () => {
            closeLightbox();
        });

        // Click outside to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Navigation buttons
        prevButton.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightboxImage(currentIndex);
        });

        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateLightboxImage(currentIndex);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                updateLightboxImage(currentIndex);
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                updateLightboxImage(currentIndex);
            }
        });

        // Update lightbox image
        function updateLightboxImage(index) {
            const imgSrc = galleryImages[index];

            // Fade out current image
            lightboxImage.style.opacity = '0';

            // Change source after a brief delay
            setTimeout(() => {
                lightboxImage.src = imgSrc;

                // Fade in new image once it's loaded
                lightboxImage.onload = function() {
                    lightboxImage.style.opacity = '1';
                };
            }, 300);

            // Preload adjacent images for smoother transitions
            const nextIndex = (index + 1) % galleryImages.length;
            const prevIndex = (index - 1 + galleryImages.length) % galleryImages.length;

            const nextImage = new Image();
            nextImage.src = galleryImages[nextIndex];

            const prevImage = new Image();
            prevImage.src = galleryImages[prevIndex];
        }

        // Close lightbox and restore scrolling
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
});