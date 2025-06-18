/**
 * Gallery specific functionality - lightbox and image navigation
 */
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentDeleteItem = null;  // Moved to top level scope
    let currentEditItem = null;
    let currentImageIndex = 0;
    let galleryImages = [];
    let isSubmitting = false; // Add submission flag

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

            // Create caption container for image text
            const lightboxCaption = document.createElement('div');
            lightboxCaption.className = 'lightbox-caption';
            lightboxContent.appendChild(lightboxCaption);

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
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeButton = lightbox.querySelector('.lightbox-close');
        const prevButton = lightbox.querySelector('.lightbox-nav button:first-child');
        const nextButton = lightbox.querySelector('.lightbox-nav button:last-child');

        // Variables to track current image
        currentImageIndex = 0;
        galleryImages = Array.from(galleryItems)
            .filter(item => !item.classList.contains('add-new-item')) // Exclude the add-new-item
            .map(item => item.querySelector('img').src);

        // Add click event to gallery items
        galleryItems.forEach((item, index) => {
            // Skip the add-new-item
            if (item.classList.contains('add-new-item')) return;

            const galleryImage = item.querySelector('.gallery-image');
            if (galleryImage) {
                galleryImage.addEventListener('click', () => {
                    currentImageIndex = index;
                    updateLightboxImage(currentImageIndex);
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is active
                });
            }
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
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightboxImage(currentImageIndex);
        });

        nextButton.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateLightboxImage(currentImageIndex);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateLightboxImage(currentImageIndex);
            } else if (e.key === 'ArrowRight') {
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateLightboxImage(currentImageIndex);
            }
        });

        // Update lightbox image with caption
        function updateLightboxImage(index) {
            const imgSrc = galleryImages[index];
            const currentItem = galleryItems[index];

            // Get title and description from the gallery item
            const title = currentItem.querySelector('.gallery-info h3').textContent;
            const description = currentItem.querySelector('.gallery-info p').textContent;

            // Fade out current image
            lightboxImage.style.opacity = '0';
            lightboxCaption.style.opacity = '0';

            // Change source after a brief delay
            setTimeout(() => {
                lightboxImage.src = imgSrc;

                // Update caption with title and description
                lightboxCaption.innerHTML = `
                    <h3>${title}</h3>
                    <p>${description}</p>
                `;

                // Fade in new image once it's loaded
                lightboxImage.onload = function() {
                    lightboxImage.style.opacity = '1';
                    lightboxCaption.style.opacity = '1';
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

            // Reset opacity of caption for next opening
            if (lightboxCaption) {
                lightboxCaption.style.opacity = '0';
            }
        }
    }

    // Admin functionality
    const editModal = document.getElementById('editModal');
    if (editModal) {
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target === editModal) {
                closeEditModal();
            }
        }
    }

    // Initialize upload form
    const uploadForm = document.getElementById('uploadForm');
    const uploadSubmitButton = document.getElementById('uploadSubmitButton');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (uploadForm && uploadSubmitButton) {
        uploadSubmitButton.addEventListener('click', async () => {
            // Prevent double submission
            if (isSubmitting) {
                return;
            }

            // Validate form
            if (!uploadForm.checkValidity()) {
                uploadForm.reportValidity();
                return;
            }

            // Disable submit button and set submitting flag
            isSubmitting = true;
            uploadSubmitButton.disabled = true;
            uploadSubmitButton.textContent = 'מעלה...';

            const formData = new FormData(uploadForm);

            try {
                const response = await fetch('backend/gallery/gallery_upload.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('התמונה הועלתה בהצלחה');

                    // Add the new image to the gallery
                    const galleryGrid = document.querySelector('.gallery-grid');
                    const newItem = createGalleryItem(result.item);
                    galleryGrid.insertBefore(newItem, galleryGrid.firstChild.nextSibling);

                    // Reset the form and close modal
                    uploadForm.reset();
                    document.getElementById('imagePreview').innerHTML = '';
                    closeUploadModal();
                } else {
                    showAlert(result.error || 'אירעה שגיאה בהעלאת התמונה', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('אירעה שגיאה בהעלאת התמונה', 'error');
            } finally {
                // Re-enable submit button and reset submitting flag
                isSubmitting = false;
                uploadSubmitButton.disabled = false;
                uploadSubmitButton.textContent = 'העלה';
            }
        });
    }
});

// Add event listener for edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent traditional form submission

            const formData = {
                id: document.getElementById('edit_id').value,
                title: document.getElementById('edit_title').value,
                description: document.getElementById('edit_description').value
            };

            try {
                const response = await fetch('backend/gallery/gallery_update.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('התמונה עודכנה בהצלחה', 'success');
                    closeEditModal();
                    // Optionally reload the page to show updated data
                    location.reload();
                } else {
                    showAlert(result.message || 'אירעה שגיאה בעדכון התמונה', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('אירעה שגיאה בעדכון התמונה', 'error');
            }
        });
    }
});

// Admin functions
function openEditModal(item) {
    document.getElementById('edit_id').value = item.id;
    document.getElementById('edit_title').value = item.title;
    document.getElementById('edit_description').value = item.description;
    document.getElementById('edit_display_order').value = item.display_order;
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Upload functions
function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is active
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling

        // Reset form and preview when closing
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.reset();
            document.getElementById('imagePreview').innerHTML = '';
        }

        // Reset submitting flag and re-enable submit button
        isSubmitting = false;
        const uploadSubmitButton = document.getElementById('uploadSubmitButton');
        if (uploadSubmitButton) {
            uploadSubmitButton.disabled = false;
            uploadSubmitButton.textContent = 'העלה';
        }
    }
}

// Delete functions
function openDeleteModal(item) {
    currentDeleteItem = item;
    document.getElementById('delete-title').textContent = item.title;
    document.getElementById('deleteModal').style.display = 'block';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteItem = null;
}

function deleteImage() {
    if (!currentDeleteItem) return;

    fetch('backend/gallery/gallery_delete.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: currentDeleteItem.id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the gallery item from the DOM
            const item = document.querySelector(`[data-id="${currentDeleteItem.id}"]`);
            if (item) {
                item.remove();
            }
            closeDeleteModal();
            // Show success message
            showAlert('התמונה נמחקה בהצלחה', 'success');
        } else {
            showAlert('שגיאה במחיקת התמונה', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('שגיאה במחיקת התמונה', 'error');
    });
}

// Create gallery item element
function createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.setAttribute('data-id', item.id);

    div.innerHTML = `
        <div class="gallery-image">
            <img src="${item.image_path}" alt="${item.title}" loading="lazy">
        </div>
        <div class="gallery-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
        ${isAdmin ? `
        <div class="gallery-admin-controls">
            <button class="edit-button" onclick="openEditModal(${JSON.stringify(item)})">
                <i class="fas fa-edit"></i> ערוך
            </button>
            <button class="delete-button" onclick="openDeleteModal(${JSON.stringify(item)})">
                <i class="fas fa-trash"></i> מחק
            </button>
        </div>
        ` : ''}
    `;

    return div;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const uploadModal = document.getElementById('uploadModal');

    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    if (event.target === uploadModal) {
        closeUploadModal();
    }
}

// Alert function
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insert at the top of the gallery section
    const gallerySection = document.querySelector('.gallery-section .container');
    gallerySection.insertBefore(alertDiv, gallerySection.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}