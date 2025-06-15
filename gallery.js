// Initialize Sortable for gallery items
document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        new Sortable(galleryGrid, {
            animation: 150,
            handle: '.gallery-item:not(.add-new-item)',
            ghostClass: 'sortable-ghost',
            filter: '.add-new-item',
            draggable: '.gallery-item:not(.add-new-item)',
            onEnd: function(evt) {
                const items = Array.from(galleryGrid.querySelectorAll('.gallery-item:not(.add-new-item)'));
                const newOrder = items.map((item, index) => ({
                    id: item.dataset.id,
                    order: index + 1
                }));

                // Send the new order to the server
                fetch('update_gallery_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newOrder)
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        alert('אירעה שגיאה בעדכון סדר התמונות');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('אירעה שגיאה בעדכון סדר התמונות');
                });
            }
        });
    }

    // Setup file upload preview
    const fileInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');

    if (fileInput && imagePreview) {
        // Hide the file input
        fileInput.style.display = 'none';

        // Make the preview area clickable
        imagePreview.style.cursor = 'pointer';
        imagePreview.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle file selection
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" alt="Preview">
                            <div class="preview-overlay">
                                <i class="fas fa-camera"></i>
                                <span>לחץ לבחירת תמונה</span>
                            </div>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Initialize upload form
    const uploadForm = document.getElementById('uploadForm');
    const uploadSubmitButton = document.getElementById('uploadSubmitButton');

    if (uploadForm && uploadSubmitButton) {
        uploadSubmitButton.addEventListener('click', async () => {
            // Prevent double submission
            if (uploadSubmitButton.disabled) {
                return;
            }

            // Validate form
            if (!uploadForm.checkValidity()) {
                uploadForm.reportValidity();
                return;
            }

            // Disable submit button and set submitting flag
            uploadSubmitButton.disabled = true;
            uploadSubmitButton.textContent = 'מעלה...';

            const formData = new FormData(uploadForm);

            try {
                const response = await fetch('upload_gallery.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    // Add the new image to the gallery
                    const galleryGrid = document.querySelector('.gallery-grid');
                    const newItem = createGalleryItem(result.item);
                    galleryGrid.insertBefore(newItem, galleryGrid.firstChild.nextSibling);

                    // Reset the form and close modal
                    uploadForm.reset();
                    imagePreview.innerHTML = '';
                    closeUploadModal();

                    // Show success message
                    showAlert('התמונה הועלתה בהצלחה');
                } else {
                    showAlert(result.message || 'אירעה שגיאה בהעלאת התמונה', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showAlert('אירעה שגיאה בהעלאת התמונה', 'error');
            } finally {
                // Re-enable submit button
                uploadSubmitButton.disabled = false;
                uploadSubmitButton.textContent = 'העלה';
            }
        });
    }
});

// Helper function to create a gallery item element
function createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.dataset.id = item.id;
    div.draggable = true;

    div.innerHTML = `
        <div class="gallery-image">
            <img src="${item.image_path}" alt="${item.title}" loading="lazy">
        </div>
        <div class="gallery-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
        <div class="gallery-admin-controls">
            <button class="edit-button" onclick="openEditModal(${JSON.stringify(item)})">
                <i class="fas fa-edit"></i> ערוך
            </button>
            <button class="delete-button" onclick="openDeleteModal(${JSON.stringify(item)})">
                <i class="fas fa-trash"></i> מחק
            </button>
        </div>
    `;

    return div;
}

// Modal functions
function openEditModal(item) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');

    // Set form values
    form.querySelector('#edit_id').value = item.id;
    form.querySelector('#edit_title').value = item.title;
    form.querySelector('#edit_description').value = item.description;

    // Show modal
    modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
}

function openDeleteModal(item) {
    const modal = document.getElementById('deleteModal');
    const titleSpan = document.getElementById('delete-title');

    // Set the title in the confirmation message
    titleSpan.textContent = item.title;

    // Store the item ID for deletion
    modal.dataset.itemId = item.id;

    // Show modal
    modal.classList.add('active');
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
}

function deleteImage() {
    const modal = document.getElementById('deleteModal');
    const itemId = modal.dataset.itemId;

    // Send delete request
    fetch('delete_gallery.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove the item from the DOM
            const item = document.querySelector(`.gallery-item[data-id="${itemId}"]`);
            if (item) {
                item.remove();
            }
            // Close the modal
            closeDeleteModal();
            // Show success message
            showAlert('התמונה נמחקה בהצלחה');
        } else {
            showAlert('אירעה שגיאה במחיקת התמונה', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('אירעה שגיאה במחיקת התמונה', 'error');
    });
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
        const uploadSubmitButton = document.getElementById('uploadSubmitButton');
        if (uploadSubmitButton) {
            uploadSubmitButton.disabled = false;
            uploadSubmitButton.textContent = 'העלה';
        }
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
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
});

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