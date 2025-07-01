// Initialize blog edit functionality when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog edit page loaded');

    // Check if user is admin
    if (!window.isAdmin) {
        // Show notification for non-admin users
        Swal.fire({
            title: 'גישה מוגבלת',
            text: 'רק מנהלים יכולים לערוך פוסטים בבלוג',
            icon: 'warning',
            confirmButtonText: 'אישור'
        }).then(() => {
            // Redirect to blog page
            window.location.href = 'blog.php';
        });
        return; // Stop execution
    }

    // Calculate blog ID and isNewBlog from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    window.blogId = urlParams.get('id');
    window.isNewBlog = !window.blogId || window.blogId.trim() === '';

    // Update page title and form based on whether it's new or existing
    if (window.isNewBlog) {
        document.getElementById('blog-edit-title').textContent = 'יצירת פוסט חדש';
        document.querySelector('.save-button').textContent = 'צור פוסט';
        document.getElementById('blog-id').value = '';
    } else {
        document.getElementById('blog-edit-title').textContent = `עריכת פוסט בלוג #${window.blogId}`;
        document.querySelector('.save-button').textContent = 'שמור פוסט';
        document.getElementById('blog-id').value = window.blogId;
    }

    // Initialize image preview functionality
    initializeImagePreview();

    // Initialize date picker
    initializeDatePicker();

    // Check if this is a new blog or editing existing one
    if (window.isNewBlog) {
        // New blog creation - initialize empty editor and set current date
        console.log('Creating new blog post');
        const now = new Date();
        const formattedDate = formatDateForDisplay(now);
        document.getElementById('blog-updated-at').value = formattedDate;
        initializeTinyMCE('');
    } else if (window.blogId) {
        // Editing existing blog - load content
        console.log('Editing existing blog post:', window.blogId);
        loadBlogContent(window.blogId);
    } else {
        // Invalid state
        Swal.fire({
            title: 'שגיאה',
            text: 'מזהה פוסט לא תקין',
            icon: 'error',
            confirmButtonText: 'אישור'
        }).then(() => {
            window.location.href = 'blog.php';
        });
        return;
    }

    // Add form submit event listener
    const form = document.getElementById('blog-edit-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBlogPost();
        });
    }

    // Track form changes for unsaved changes warning
    window.hasUnsavedChanges = false;
    const formElements = ['blog-title', 'blog-category', 'blog-published', 'blog-image', 'blog-updated-at'];

    // Monitor form field changes
    formElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            if (element.type === 'file') {
                element.addEventListener('change', () => {
                    window.hasUnsavedChanges = true;
                });
            } else if (element.type === 'checkbox') {
                element.addEventListener('change', () => {
                    window.hasUnsavedChanges = true;
                });
            } else {
                element.addEventListener('input', () => {
                    window.hasUnsavedChanges = true;
                });
            }
        }
    });

    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (window.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לעזוב?';
            return e.returnValue;
        }
    });

    // Reset unsaved changes flag after successful save
    window.resetUnsavedChanges = function() {
        window.hasUnsavedChanges = false;
    };
});

// Function to initialize image preview
function initializeImagePreview() {
    const imageInput = document.getElementById('blog-image');
    const currentImageContainer = document.getElementById('current-image-container');
    const currentImage = document.getElementById('current-image');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    Swal.fire({
                        title: 'שגיאה',
                        text: 'אנא בחר קובץ תמונה בלבד',
                        icon: 'error',
                        confirmButtonText: 'אישור'
                    });
                    imageInput.value = '';
                    return;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                        title: 'שגיאה',
                        text: 'גודל הקובץ חייב להיות קטן מ-5MB',
                        icon: 'error',
                        confirmButtonText: 'אישור'
                    });
                    imageInput.value = '';
                    return;
                }

                // Show preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    currentImage.src = e.target.result;
                    currentImageContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                currentImageContainer.style.display = 'none';
            }
        });
    }
}

// Function to load blog content from API
function loadBlogContent(blogId) {
    // Set the page title with blog ID
    document.getElementById('blog-edit-title').textContent = `עריכת פוסט בלוג #${blogId}`;

    // Show loading indicator
    const editorLoading = document.getElementById('editor-loading');
    if (editorLoading) {
        editorLoading.style.display = 'flex';
    }

    fetch(`api/content/blog.php?id=${blogId}`)
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            if (editorLoading) {
                editorLoading.style.display = 'none';
            }

            if (data.success && data.data) {
                const blog = data.data;

                // Populate form fields
                document.getElementById('blog-title').value = blog.title;
                document.getElementById('blog-category').value = blog.category;
                document.getElementById('blog-published').checked = blog.is_published == 1;

                // Format the date for display (date only, no time)
                const updatedDate = new Date(blog.updated_at);
                const formattedDate = formatDateForDisplay(updatedDate);
                document.getElementById('blog-updated-at').value = formattedDate;

                // Show current image if exists
                if (blog.image_path) {
                    document.getElementById('current-image').src = blog.image_path;
                    document.getElementById('current-image-container').style.display = 'block';
                }

                // Decode base64 content and initialize TinyMCE
                if (blog.content) {
                    const decodedContent = decodeContent(blog.content);
                    initializeTinyMCE(decodedContent);
                } else {
                    initializeTinyMCE('');
                }

                console.log('Blog content loaded from API');
            } else {
                console.error('Failed to load blog content:', data.message);
                Swal.fire({
                    title: 'שגיאה',
                    text: data.message || 'אירעה שגיאה בטעינת הפוסט',
                    icon: 'error',
                    confirmButtonText: 'אישור'
                });
            }
        })
        .catch(error => {
            // Hide loading indicator
            if (editorLoading) {
                editorLoading.style.display = 'none';
            }

            console.error('Error loading blog content:', error);
            Swal.fire({
                title: 'שגיאה',
                text: 'אירעה שגיאה בטעינת הפוסט. אנא נסו שוב מאוחר יותר.',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
        });
}

// Function to initialize TinyMCE with content
function initializeTinyMCE(content) {
    // First, set the content in the div
    const editorDiv = document.getElementById('blog-editor');
    if (editorDiv) {
        editorDiv.innerHTML = content;
        console.log('Content set in div');
    }

    // Initialize TinyMCE with exact same settings as main page
    tinymce.init({
        selector: '#blog-editor',
        height: 800,
        language: 'he_IL', // Hebrew (Israel)
        language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/he_IL.js',
        directionality: 'rtl',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'textcolor'
        ],
        toolbar: 'undo redo | formatselect fontselect fontsizeselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview fullscreen | save',
        content_css: [
            'css/base.css',
            'css/blog.css'
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
                    saveBlogPost();
                }
            });

            // Add save to file menu
            editor.ui.registry.addMenuItem('save', {
                text: 'שמור',
                icon: 'save',
                onAction: function() {
                    saveBlogPost();
                }
            });

            // Handle editor ready event
            editor.on('init', function() {
                console.log('TinyMCE editor initialized');
                updateCharacterCount();
            });

            // Update character count on content change
            editor.on('keyup', function() {
                updateCharacterCount();
            });

            // Update character count on paste
            editor.on('paste', function() {
                setTimeout(updateCharacterCount, 100);
            });

            // Monitor editor changes for unsaved changes
            editor.on('change', function() {
                window.hasUnsavedChanges = true;
            });

            // Add keyboard shortcuts
            editor.addShortcut('ctrl+s', 'Save', function() {
                saveBlogPost();
            });
        },
        // Add file menu with save option
        menubar: 'file edit view insert format tools table help',
        menu: {
            file: { title: 'קובץ', items: 'save | print' }
        }
    });
}

// Function to update character and word count
function updateCharacterCount() {
    const editor = tinymce.get('blog-editor');
    if (editor) {
        const content = editor.getContent();
        const textContent = editor.getContent({format: 'text'});

        // Count characters (excluding HTML tags)
        const charCount = textContent.length;

        // Count words (split by whitespace and filter empty strings)
        const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;

        // Update display
        const charCountElement = document.getElementById('char-count');
        const wordCountElement = document.getElementById('word-count');

        if (charCountElement) {
            charCountElement.textContent = `${charCount} תווים`;
        }

        if (wordCountElement) {
            wordCountElement.textContent = `${wordCount} מילים`;
        }
    }
}

// Function to save blog post
function saveBlogPost() {
    // Get form values
    const title = document.getElementById('blog-title').value.trim();
    const category = document.getElementById('blog-category').value;
    const isPublished = document.getElementById('blog-published').checked;

    // Get TinyMCE content
    const editor = tinymce.get('blog-editor');
    const content = editor ? editor.getContent().trim() : '';

    // Client-side validation
    if (!title) {
        Swal.fire({
            title: 'שגיאה',
            text: 'כותרת הפוסט היא שדה חובה',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
        return;
    }

    if (!content) {
        Swal.fire({
            title: 'שגיאה',
            text: 'תוכן הפוסט הוא שדה חובה',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
        return;
    }

    // Show confirmation dialog
    Swal.fire({
        title: window.isNewBlog ? 'צור פוסט חדש?' : 'שמור שינויים?',
        text: window.isNewBlog ? 'האם אתה בטוח שברצונך ליצור פוסט חדש?' : 'האם אתה בטוח שברצונך לשמור את השינויים?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'כן, שמור',
        cancelButtonText: 'ביטול',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
    // Prepare JSON data
    const blogData = {
        title: title,
        content: encodeContent(content), // Encode content to base64
        category: category,
        is_published: isPublished,
        updated_at: parseDisplayDate(document.getElementById('blog-updated-at').value)
    };

    // Add ID only if editing existing blog (not for new blog creation)
    if (window.blogId) {
        blogData.id = window.blogId;
    }

    // Handle image if selected
    const imageFile = document.getElementById('blog-image').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            blogData.image = e.target.result; // Base64 encoded image
            sendBlogData(blogData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        sendBlogData(blogData);
    }
        }
    });
}

// Function to send blog data to API
function sendBlogData(blogData) {
    // Show loading state
    Swal.fire({
        title: window.isNewBlog ? 'יוצר פוסט חדש...' : 'שומר פוסט...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send to API
    fetch('api/blog/update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reset unsaved changes flag
            if (window.resetUnsavedChanges) {
                window.resetUnsavedChanges();
            }

            // Show success message
            Swal.fire({
                icon: 'success',
                title: window.isNewBlog ? 'הבלוג נוצר בהצלחה!' : 'הפוסט נשמר!',
                showConfirmButton: true,
                confirmButtonText: 'אישור'
            }).then(() => {
                // Use the returned blog ID from the API response
                const redirectId = data.data && data.data.id ? data.data.id : window.blogId;
                if (redirectId) {
                    window.location.href = `blog_post.php?id=${redirectId}`;
                } else {
                    window.location.href = 'blog.php';
                }
            });
            console.log('Blog post saved successfully');
        } else {
            // Show error message
            Swal.fire({
                title: 'שגיאה',
                text: data.message || 'אירעה שגיאה בשמירת הפוסט',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
            console.error('Failed to save blog post:', data.message);
        }
    })
    .catch(error => {
        // Show error message
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בשמירת הפוסט. אנא נסו שוב מאוחר יותר.',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
        console.error('Error saving blog post:', error);
    });
}

// Function to handle cancel button click
function handleCancel() {
    // Check if there are unsaved changes
    if (window.hasUnsavedChanges) {
        Swal.fire({
            title: 'ביטול עריכה',
            text: 'יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לעזוב?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'כן, עזוב',
            cancelButtonText: 'המשך עריכה',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'blog.php';
            }
        });
    } else {
        window.location.href = 'blog.php';
    }
}

// Function to initialize date picker
function initializeDatePicker() {
    const dateInput = document.getElementById('blog-updated-at');

    // Initialize jQuery UI datepicker
    $(dateInput).datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        yearRange: '-10:+10',
        showButtonPanel: true,
        showTime: false,
        constrainInput: true,
        closeText: 'סגור',
        currentText: 'היום',
        monthNames: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
        monthNamesShort: ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'],
        dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
        dayNamesMin: ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''],
        dayNamesShort: ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
    });

}

// Function to format date for display (date only)
function formatDateForDisplay(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

// Function to parse display date back to MySQL datetime format for API (date only)
function parseDisplayDate(dateString) {
    // Parse dd/mm/yyyy format
    const dateParts = dateString.split('/');

    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const year = parseInt(dateParts[2]);

    // Set time to current time when saving
    const now = new Date();
    const date = new Date(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds());

    // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const mysqlDate = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0') + ':' +
        String(date.getSeconds()).padStart(2, '0');

    return mysqlDate;
}