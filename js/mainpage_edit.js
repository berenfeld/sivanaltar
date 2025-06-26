// Initialize TinyMCE when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing TinyMCE...');

    // Check if user is admin
    if (!window.isAdmin) {
        // Show notification for non-admin users
        Swal.fire({
            title: 'גישה מוגבלת',
            text: 'רק מנהלים יכולים לערוך את תוכן הדף הראשי',
            icon: 'warning',
            confirmButtonText: 'אישור'
        }).then(() => {
            // Redirect to main page or hide editor
            window.location.href = 'index.php';
        });
        return; // Stop execution
    }

    // Load content from API only if admin
    loadMainpageContent();
});

// Function to load mainpage content from API
function loadMainpageContent() {
    fetch('api/mainpage/mainpage_content.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Content loaded from API');
                initializeTinyMCE(data.content);
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

// Function to initialize TinyMCE with content
function initializeTinyMCE(content) {
    // First, set the content in the div
    const editorDiv = document.getElementById('mainpage-editor');
    if (editorDiv) {
        editorDiv.innerHTML = content;
        console.log('Content set in div');
    }

    // Initialize TinyMCE
    tinymce.init({
        selector: '#mainpage-editor',
        height: 800,
        language: 'he_IL', // Hebrew (Israel)
        language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/he_IL.js',
        directionality: 'rtl',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'textcolor'
        ],
        toolbar: 'undo redo | formatselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview fullscreen | save',
        content_css: [
            'css/base.css',
            'css/mainpage.css'
        ],
        // Custom color palette with website colors
        textcolor_map: [
            '347494', 'Primary Color',
            'eaf5f7', 'Secondary Color',
            '50555c', 'Text Color',
            '1D2023', 'Heading Color',
            'd6d939', 'Highlight Color',
            '000000', 'Black',
            'ffffff', 'White',
            'ff0000', 'Red',
            '00ff00', 'Green',
            '0000ff', 'Blue',
            'ffff00', 'Yellow',
            'ff00ff', 'Magenta',
            '00ffff', 'Cyan',
            '808080', 'Gray',
            'c0c0c0', 'Silver',
            '800000', 'Maroon',
            '808000', 'Olive',
            '008000', 'Green',
            '800080', 'Purple',
            '008080', 'Teal',
            '000080', 'Navy'
        ],
        setup: function(editor) {
            console.log('TinyMCE setup function called');

            // Add custom save button
            editor.ui.registry.addButton('save', {
                text: 'שמור',
                tooltip: 'שמור תוכן',
                onAction: function() {
                    saveContent(editor);
                }
            });
        }
    });
}

// Function to save content to API
function saveContent(editor) {
    const content = editor.getContent();

    // Show loading state
    Swal.fire({
        title: 'שומר תוכן...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Create form data
    const formData = new FormData();
    formData.append('content', content);

    // Send to API
    fetch('api/mainpage/mainpage_update.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            Swal.fire({
                title: 'הצלחה!',
                text: 'התוכן נשמר בהצלחה',
                icon: 'success',
                confirmButtonText: 'אישור'
            });
            console.log('Content saved successfully');
        } else {
            // Show error message
            Swal.fire({
                title: 'שגיאה',
                text: data.message || 'אירעה שגיאה בשמירת התוכן',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
            console.error('Failed to save content:', data.message);
        }
    })
    .catch(error => {
        // Show error message
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בשמירת התוכן. אנא נסו שוב מאוחר יותר.',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
        console.error('Error saving content:', error);
    });
}

// Add some debugging info
console.log('Main page edit script loaded');
console.log('Content length:', mainpageContent.length);