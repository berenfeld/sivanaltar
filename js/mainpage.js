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
    fetch('api/content/main.php')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data && data.data.content) {
                console.log('Mainpage content loaded successfully');
                // Decode base64 content and convert UTF-8 to UTF-16
                const base64Content = atob(data.data.content);
                const bytes = new Uint8Array(base64Content.length);
                for (let i = 0; i < base64Content.length; i++) {
                    bytes[i] = base64Content.charCodeAt(i);
                }
                const decodedContent = new TextDecoder('utf-8').decode(bytes);
                mainpageDiv.innerHTML = decodedContent;
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