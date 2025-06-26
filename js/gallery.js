// Initialize Sortable for gallery items
document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.querySelector('.gallery-grid');

    // Only initialize Sortable on desktop devices
    if (galleryGrid && !isMobile()) {
        galleryGrid.sortable = new Sortable(galleryGrid, {
            animation: 150,
            handle: '.gallery-item:not(.add-new-item)',
            ghostClass: 'sortable-ghost',
            filter: '.add-new-item',
            draggable: '.gallery-item:not(.add-new-item)',
            onMove: function(evt) {
                // Prevent move if user is not admin
                if (!window.isAdmin) {
                    return false; // This prevents the move
                }
                return true; // Allow move for admin users
            },
            onEnd: function(evt) {
                // Check if user is admin before allowing reorder
                if (!window.isAdmin) {
                    return;
                }

                const items = Array.from(galleryGrid.querySelectorAll('.gallery-item:not(.add-new-item)'));
                const newOrder = items.map((item, index) => ({
                    id: item.dataset.id,
                    order: index + 1
                }));

                // Send the new order to the server
                fetch('backend/gallery/gallery_order.php', {
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
        console.log('Sortable initialized for desktop');
    } else if (isMobile()) {
        console.log('Sortable disabled on mobile device');
    }

    // Setup file upload preview
    const fileInput = document.getElementById('gallery_image');
    const imagePreview = document.getElementById('gallery_imagePreview');

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
});

// Helper function to create a gallery item element
function createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item admin-item';
    div.dataset.id = item.id;
    div.draggable = true;

    div.innerHTML = `
        <div class="gallery-image-container">
            <div class="gallery-image">
                <img src="${item.image_path}" alt="${item.title}" loading="lazy">
            </div>
            <div class="gallery-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
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
    // Check if user is admin
    if (!window.isAdmin) {
        console.warn('Non-admin user attempted to edit image');
        return;
    }

    // Get the HTML from the original form
    const formHtml = document.getElementById('gallery_swalEditForm').innerHTML;

    Swal.fire({
        title: 'עריכת תמונה',
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: 'שמור',
        cancelButtonText: 'ביטול',
        customClass: {
            popup: 'swal-rtl',
            title: 'swal-title-rtl',
            content: 'swal-content-rtl'
        },
        didOpen: () => {
            // Set values on the cloned form elements that SweetAlert created
            const modalContent = Swal.getHtmlContainer();
            const titleField = modalContent.querySelector('[name="gallery_swal_edit_title"]');
            const descriptionField = modalContent.querySelector('[name="gallery_swal_edit_description"]');

            if (titleField && descriptionField) {
                titleField.value = item.title;
                descriptionField.value = item.description;
            }
        },
        preConfirm: () => {
            const modalContent = Swal.getHtmlContainer();
            const title = modalContent.querySelector('[name="gallery_swal_edit_title"]').value;
            const description = modalContent.querySelector('[name="gallery_swal_edit_description"]').value;

            return {
                id: item.id,
                title: title,
                description: description
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            updateImage(result.value);
        }
    });
}

function updateImage(data) {
    // Show loading state
    Swal.fire({
        title: 'מעדכן תמונה...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('backend/gallery/gallery_update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        if (responseData.success) {
            // Update the gallery item in the DOM using the original data
            const item = document.querySelector(`[data-id="${data.id}"]`);
            if (item) {
                const titleElement = item.querySelector('.gallery-info h3');
                const descriptionElement = item.querySelector('.gallery-info p');

                if (titleElement) titleElement.textContent = data.title;
                if (descriptionElement) descriptionElement.textContent = data.description;
            }

            // Show success message
            Swal.fire({
                title: 'הצלחה!',
                text: 'התמונה עודכנה בהצלחה',
                icon: 'success',
                confirmButtonText: 'אישור'
            });
        } else {
            Swal.fire({
                title: 'שגיאה',
                text: responseData.message || 'אירעה שגיאה בעדכון התמונה',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בעדכון התמונה',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
    });
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
}

function openDeleteModal(item) {
    // Check if user is admin
    if (!window.isAdmin) {
        console.warn('Non-admin user attempted to delete image');
        return;
    }

    currentDeleteItem = item;

    Swal.fire({
        title: 'מחיקת תמונה',
        text: `האם אתה בטוח שברצונך למחוק את התמונה "${item.title}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'מחק',
        cancelButtonText: 'ביטול',
        customClass: {
            popup: 'swal-rtl',
            title: 'swal-title-rtl',
            content: 'swal-content-rtl'
        }
    }).then((result) => {
        console.log('SweetAlert result:', result); // Debug log
        if (result.isConfirmed === true) {
            deleteImage();
        } else {
            // User clicked cancel or dismissed the modal
            currentDeleteItem = null;
        }
    });
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('active');
}

function deleteImage() {
    console.log('deleteImage called, currentDeleteItem:', currentDeleteItem); // Debug log

    if (!currentDeleteItem) {
        console.warn('No item selected for deletion');
        return;
    }

    // Show loading state
    Swal.fire({
        title: 'מוחק תמונה...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

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

            // Show success message
            Swal.fire({
                title: 'הצלחה!',
                text: 'התמונה נמחקה בהצלחה',
                icon: 'success',
                confirmButtonText: 'אישור'
            });
        } else {
            Swal.fire({
                title: 'שגיאה',
                text: data.message || 'שגיאה במחיקת התמונה',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'שגיאה',
            text: 'שגיאה במחיקת התמונה',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
    });
}

// Upload functions
function openUploadModalSwal() {
    // Get the form HTML from the original form
    const formHtml = document.getElementById('gallery_swalUploadForm').innerHTML;

    Swal.fire({
        title: 'העלאת תמונה חדשה',
        html: formHtml,
        showCancelButton: true,
        confirmButtonText: 'העלה',
        cancelButtonText: 'ביטול',
        customClass: {
            popup: 'swal-rtl',
            title: 'swal-title-rtl',
            content: 'swal-content-rtl'
        },
        didOpen: () => {
            // Setup file upload preview for the cloned form
            const modalContent = Swal.getHtmlContainer();
            const fileInput = modalContent.querySelector('[name="gallery_swal_upload_image"]');
            const imagePreview = modalContent.querySelector('#gallery_swal_imagePreview');

            if (fileInput && imagePreview) {
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
        },
        preConfirm: () => {
            const modalContent = Swal.getHtmlContainer();
            const fileInput = modalContent.querySelector('[name="gallery_swal_upload_image"]');
            const titleField = modalContent.querySelector('[name="gallery_swal_upload_title"]');
            const descriptionField = modalContent.querySelector('[name="gallery_swal_upload_description"]');

            if (!fileInput.files[0] || !titleField.value || !descriptionField.value) {
                Swal.showValidationMessage('נא למלא את כל השדות');
                return false;
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            formData.append('title', titleField.value);
            formData.append('description', descriptionField.value);

            return formData;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            uploadImage(result.value);
        }
    });
}

function uploadImage(formData) {
    // Show loading state
    Swal.fire({
        title: 'מעלה תמונה...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('backend/gallery/gallery_upload.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add the new image to the gallery
            const galleryGrid = document.querySelector('.gallery-grid');
            const newItem = createGalleryItem(data.item);
            galleryGrid.insertBefore(newItem, galleryGrid.firstChild.nextSibling);

            // Show success message
            Swal.fire({
                title: 'הצלחה!',
                text: 'התמונה הועלתה בהצלחה',
                icon: 'success',
                confirmButtonText: 'אישור'
            });
        } else {
            Swal.fire({
                title: 'שגיאה',
                text: data.message || 'אירעה שגיאה בהעלאת התמונה',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בהעלאת התמונה',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
    });
}

// Keep the old function for backward compatibility but redirect to new one
function openUploadModal() {
    openUploadModalSwal();
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');

    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

// Lightbox functionality
let currentImageIndex = 0;
let galleryImages = [];

// Initialize lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get all gallery images for lightbox
    const galleryItems = document.querySelectorAll('.gallery-item:not(.add-new-item)');
    galleryImages = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;
        return {
            src: img.src,
            alt: img.alt,
            title: title,
            description: description
        };
    });

    // Add click event listeners to gallery images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        img.addEventListener('click', () => openLightbox(index));
    });

    // Close lightbox when clicking on the background
    const lightbox = document.getElementById('lightbox');
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (document.getElementById('lightbox').classList.contains('active')) {
            switch(event.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    previousImage();
                    break;
                case 'ArrowRight':
                    nextImage();
                    break;
            }
        }
    });
});

function openLightbox(index) {
    currentImageIndex = index;
    const image = galleryImages[index];

    document.getElementById('lightbox-image').src = image.src;
    document.getElementById('lightbox-image').alt = image.alt;
    document.getElementById('lightbox-title').textContent = image.title;
    document.getElementById('lightbox-description').textContent = image.description;

    document.getElementById('lightbox').classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    const image = galleryImages[currentImageIndex];

    document.getElementById('lightbox-image').src = image.src;
    document.getElementById('lightbox-image').alt = image.alt;
    document.getElementById('lightbox-title').textContent = image.title;
    document.getElementById('lightbox-description').textContent = image.description;
}

function previousImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const image = galleryImages[currentImageIndex];

    document.getElementById('lightbox-image').src = image.src;
    document.getElementById('lightbox-image').alt = image.alt;
    document.getElementById('lightbox-title').textContent = image.title;
    document.getElementById('lightbox-description').textContent = image.description;
}
