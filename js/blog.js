/**
 * Blog functionality for loading content from API and show/hide content
 */

// Function to create new blog post
function createNewBlog() {
    window.location.href = 'blog_edit.php';
}

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
                    // Dynamically remove the blog post from the page
                    const blogPostElement = document.getElementById(`blog-post-${postId}`);
                    if (blogPostElement) {
                        // Add fade out animation
                        blogPostElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        blogPostElement.style.opacity = '0';
                        blogPostElement.style.transform = 'translateX(100px)';

                        // Remove element after animation
                        setTimeout(() => {
                            blogPostElement.remove();

                            // Check if no more blog posts
                            const remainingPosts = document.querySelectorAll('#blog-posts-container .blog-card');
                            if (remainingPosts.length === 0) {
                                const blogPostsContainer = document.querySelector('#blog-posts-container');
                                blogPostsContainer.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>אין פוסטים זמינים כרגע</h2></div>';
                            }
                        }, 500);
                    }

                    Swal.fire({
                        title: 'הצלחה!',
                        text: 'הפוסט נמחק בהצלחה',
                        icon: 'success',
                        confirmButtonText: 'אישור'
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

// Global function to read blog post
function readBlogPost(postId) {
    console.log('Read blog post:', postId);
    // Navigate to blog post page
    window.location.href = `blog_post.php?id=${postId}`;
}

// Global function to edit blog post
function editBlogPost(postId) {
    console.log('Edit blog post:', postId);
    // Redirect to blog edit page
    window.location.href = `blog_edit.php?id=${postId}`;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog.js loaded');

    // Load blog content from API
    loadBlogContent();

    // Blog category filtering
    function setupCategoryFiltering() {
        const categoryLinks = document.querySelectorAll('.blog-categories a');
        if (categoryLinks.length > 0) {
            categoryLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Remove active class from all links
                    categoryLinks.forEach(catLink => catLink.classList.remove('active'));

                    // Add active class to clicked link
                    this.classList.add('active');

                    // Get category value
                    const category = this.getAttribute('data-category');

                    // Filter posts if needed
                    // This would be expanded with actual filtering logic
                    console.log('Category selected:', category);
                });
            });
        }
    }

    // Function to load blog content from API
    function loadBlogContent() {
        const blogPostsContainer = document.querySelector('#blog-posts-container');

        if (!blogPostsContainer) {
            console.error('Blog posts container not found');
            return;
        }

        // Show loading state
        blogPostsContainer.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>טוען תוכן הבלוג...</h2></div>';

        // Fetch content from API
        fetch('api/content/blog.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data && data.data.posts) {
                    console.log('Blog content loaded successfully');
                    displayBlogPosts(data.data.posts);
                } else {
                    console.error('Failed to load blog content:', data.message);
                    showFallbackContent(blogPostsContainer);
                }
            })
            .catch(error => {
                console.error('Error loading blog content:', error);
                showFallbackContent(blogPostsContainer);
            });
    }

    // Function to display blog posts
    function displayBlogPosts(posts) {
        const blogPostsContainer = document.querySelector('#blog-posts-container');
        const blogPostTemplate = document.getElementById('blog-post-template');

        if (posts.length === 0) {
            blogPostsContainer.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>אין פוסטים זמינים כרגע</h2></div>';
            return;
        }

        // Clear container
        blogPostsContainer.innerHTML = '';

        posts.forEach(post => {
            const updatedDate = new Date(post.updated_at);
            const formattedDate = updatedDate.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Decode base64 content and convert UTF-8 to UTF-16
            let decodedContent = '';
            if (post.content) {
                const base64Content = atob(post.content);
                const bytes = new Uint8Array(base64Content.length);
                for (let i = 0; i < base64Content.length; i++) {
                    bytes[i] = base64Content.charCodeAt(i);
                }
                decodedContent = new TextDecoder('utf-8').decode(bytes);
            }

            // Calculate excerpt from first 100 words of content
            let excerpt = '';
            if (decodedContent && decodedContent.length > 0) {
                // Create a temporary div to parse the HTML content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = decodedContent;

                // Get all text content
                const fullText = tempDiv.textContent || tempDiv.innerText || '';

                // Split into words and take first 100
                const words = fullText.trim().split(/\s+/);
                const first100Words = words.slice(0, 100).join(' ');

                // Add ellipsis if there are more words
                excerpt = first100Words + (words.length > 100 ? '...' : '');
            }

            // Clone the template
            const blogCard = blogPostTemplate.cloneNode(true);
            blogCard.id = `blog-post-${post.id}`;
            blogCard.style.display = 'block';

            // Populate the template
            blogCard.querySelector('#blog-post-image').src = post.image_path || 'images/blog-post-image.jpeg';
            blogCard.querySelector('#blog-post-image').alt = post.title;

            // Make title clickable
            const titleElement = blogCard.querySelector('#blog-post-title');
            titleElement.innerHTML = `<a href="blog_post.php?id=${post.id}">${post.title}</a>`;

            blogCard.querySelector('#blog-post-date').textContent = `עודכן בתאריך: ${formattedDate}`;

            // Make excerpt clickable with "קרא עוד" link
            const excerptElement = blogCard.querySelector('#blog-post-excerpt');
            excerptElement.innerHTML = `<p>${excerpt} <a href="blog_post.php?id=${post.id}">... קרא עוד</a></p>`;

            blogCard.querySelector('#blog-post-category').textContent = post.category;

            // Show unpublished label for unpublished posts
            const statusElement = blogCard.querySelector('#blog-post-status');
            if (post.is_published === false || post.is_published === 0) {
                statusElement.style.display = 'block';
            }

            // Show admin controls if user is admin
            const adminControls = blogCard.querySelector('#blog-admin-controls');
            if (window.isAdmin && adminControls) {
                adminControls.style.display = 'flex';

                // Set up edit button
                const editButton = blogCard.querySelector('#blog-edit-button');
                if (editButton) {
                    editButton.onclick = () => editBlogPost(post.id);
                }

                // Set up delete button
                const deleteButton = blogCard.querySelector('#blog-delete-button');
                if (deleteButton) {
                    deleteButton.onclick = () => deleteBlogPost(post.id, post.title);
                }
            }

            // Add to container
            blogPostsContainer.appendChild(blogCard);
        });
    }

    // Function to show fallback content
    function showFallbackContent(blogPostsContainer) {
        blogPostsContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h2>שגיאה בטעינת הבלוג</h2>
                <p>אנא נסו שוב מאוחר יותר</p>
            </div>
        `;
    }

    // Setup category filtering after content is loaded
    setupCategoryFiltering();
});