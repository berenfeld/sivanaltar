// Load mainpage content from API and display it
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading mainpage content...');
    loadMainpageContent();
    checkAdminStatus();
});

function loadMainpageContent() {
    const mainpageDiv = document.querySelector('.mainpage_main_div');

    if (!mainpageDiv) {
        console.error('Mainpage div not found');
        return;
    }

    // Show loading state
    mainpageDiv.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>טוען תוכן...</h2></div>';

    // Fetch content from API
    fetch('backend/mainpage/mainpage_get.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.content) {
                console.log('Mainpage content loaded successfully');
                mainpageDiv.innerHTML = data.content;
            } else {
                console.error('Failed to load content:', data.message);
                showFallbackContent(mainpageDiv);
            }
        })
        .catch(error => {
            console.error('Error loading mainpage content:', error);
            showFallbackContent(mainpageDiv);
        });
}

function showFallbackContent(mainpageDiv) {
    mainpageDiv.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <h2>תוכן הדף הראשי</h2>
            <p>לא ניתן לטעון את התוכן כרגע. אנא נסו שוב מאוחר יותר.</p>
        </div>
    `;
}

function checkAdminStatus() {
    const adminEditLink = document.getElementById('admin-edit-link');
    // Check if isAdmin variable is available (set by google_login.js)
    if (window.isAdmin) {
        adminEditLink.style.display = 'block';
    } else {
        adminEditLink.style.display = 'none';
    }
}