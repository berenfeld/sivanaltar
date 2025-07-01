// Global function to delete blog post
function deleteBlogPost(postId, postTitle) {
    Swal.fire({
        title: 'מחיקת פוסט',
        text: `האם אתה בטוח שברצונך למחוק את הפוסט "${postTitle}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'כן, מחק',
        cancelButtonText: 'ביטול'
    }).then((result) => {
        if (result.isConfirmed) {
            // Show loading state
            Swal.fire({
                title: 'מוחק פוסט...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Send delete request
            fetch('api/blog/delete.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: postId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'הצלחה!',
                        text: 'הפוסט נמחק בהצלחה',
                        icon: 'success',
                        confirmButtonText: 'אישור'
                    }).then(() => {
                        // Redirect to blog page
                        window.location.href = 'blog.php';
                    });
                } else {
                    Swal.fire({
                        title: 'שגיאה',
                        text: data.message || 'אירעה שגיאה במחיקת הפוסט',
                        icon: 'error',
                        confirmButtonText: 'אישור'
                    });
                }
            })
            .catch(error => {
                console.error('Error deleting blog post:', error);
                Swal.fire({
                    title: 'שגיאה',
                    text: 'אירעה שגיאה במחיקת הפוסט. אנא נסו שוב מאוחר יותר.',
                    icon: 'error',
                    confirmButtonText: 'אישור'
                });
            });
        }
    });
}

// Global function to edit blog post
function editBlogPost(postId) {
    console.log('Edit blog post:', postId);
    // Redirect to blog edit page
    window.location.href = `blog_edit.php?id=${postId}`;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog post page loaded');

    // Get blog ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('id');

    if (!blogId) {
        showError('מזהה פוסט לא תקין');
        return;
    }

    // Load blog post content
    loadBlogPost(blogId);
});

// Function to load blog post content
function loadBlogPost(blogId) {
    const blogPostContainer = document.getElementById('blog-post-container');

    fetch(`api/content/blog.php?id=${blogId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                displayBlogPost(data.data);
            } else {
                showError(data.message || 'אירעה שגיאה בטעינת הפוסט');
            }
        })
        .catch(error => {
            console.error('Error loading blog post:', error);
            showError('אירעה שגיאה בטעינת הפוסט. אנא נסו שוב מאוחר יותר.');
        });
}

// Function to display blog post
function displayBlogPost(post) {
    const blogPostContainer = document.getElementById('blog-post-container');
    const loadingContainer = document.querySelector('.loading-container');
    const blogPostTemplate = document.getElementById('blog-post-template');
    const errorContainer = document.getElementById('error-container');

    // Hide loading and error containers
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (errorContainer) errorContainer.style.display = 'none';

    // Update page title
    setBlogPageTitle(post.title);

    // Populate the template with data
    document.getElementById('blog-post-title').textContent = post.title;

    // Format date
    const updatedDate = new Date(post.updated_at);
    const formattedDate = updatedDate.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('blog-post-date').textContent = `עודכן בתאריך: ${formattedDate}`;
    document.getElementById('blog-post-category').textContent = post.category;

    // Handle image
    const imageContainer = document.getElementById('blog-post-image');
    const imageSrc = document.getElementById('blog-post-image-src');
    if (post.image_path) {
        imageSrc.src = post.image_path;
        imageSrc.alt = post.title;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }

    // Decode and set content
    let decodedContent = '';
    if (post.content) {
        decodedContent = decodeContent(post.content);
    }
    document.getElementById('blog-post-content').innerHTML = decodedContent;

    // Show admin controls if user is admin
    const adminControls = document.getElementById('blog-post-admin-controls');
    if (adminControls && window.isAdmin) {
        adminControls.style.display = 'flex';

        // Set up edit button
        const editButton = document.getElementById('blog-edit-button');
        if (editButton) {
            editButton.onclick = () => editBlogPost(post.id);
        }

        // Set up delete button
        const deleteButton = document.getElementById('blog-delete-button');
        if (deleteButton) {
            deleteButton.onclick = () => deleteBlogPost(post.id, post.title);
        }
    }

    // Show the blog post template
    blogPostTemplate.style.display = 'block';
}

// Function to show error
function showError(message) {
    const loadingContainer = document.querySelector('.loading-container');
    const blogPostTemplate = document.getElementById('blog-post-template');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    // Hide loading and blog post containers
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (blogPostTemplate) blogPostTemplate.style.display = 'none';

    // Set error message and show error container
    if (errorMessage) errorMessage.textContent = message;
    if (errorContainer) errorContainer.style.display = 'block';
}