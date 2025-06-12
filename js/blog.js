/**
 * Blog functionality for show/hide content and category filtering
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Blog.js loaded');

    // Blog expand/collapse functionality
    const expandButtons = document.querySelectorAll('.blog-expand-button');

    if (expandButtons.length > 0) {
        console.log('Found', expandButtons.length, 'expand buttons');

        expandButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // Prevent any default behavior
                e.preventDefault();
                e.stopPropagation();

                console.log('Expand button clicked');

                const card = this.closest('.blog-card');
                const fullContent = card.querySelector('.blog-full-content');
                const excerpt = card.querySelector('.blog-card-excerpt');

                console.log('Full content element:', fullContent);
                console.log('Excerpt element:', excerpt);
                console.log('Current state - hidden?', fullContent.classList.contains('hidden'));

                if (fullContent.classList.contains('hidden')) {
                    // Expand content
                    console.log('Expanding content');
                    fullContent.classList.remove('hidden');
                    if (excerpt) excerpt.classList.add('hidden');
                    this.textContent = 'קרא פחות';
                    card.classList.add('expanded');
                } else {
                    // Collapse content
                    console.log('Collapsing content');
                    fullContent.classList.add('hidden');
                    if (excerpt) excerpt.classList.remove('hidden');
                    this.textContent = 'קרא עוד';
                    card.classList.remove('expanded');
                }
            });
        });
    } else {
        console.log('No expand buttons found on this page');
    }

    // Blog category filtering (if needed)
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
});