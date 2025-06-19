// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this, 'newsletter');
        });
    }

    // Contact form
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(this, 'contact');
        });
    }
});

function handleFormSubmission(form, formType) {
    // Get form data
    const formData = new FormData(form);
    formData.append('form_type', formType);

    // Show loading state
    Swal.fire({
        title: formType === 'newsletter' ? 'מרשם לניוזלטר...' : 'שולח הודעה...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send form data
    fetch('backend/contact/contact_handler.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            Swal.fire({
                title: 'הצלחה!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'אישור'
            }).then(() => {
                // Reset form
                form.reset();

                // Redirect to thank you page
                window.location.href = 'thank-you.php';
            });
        } else {
            // Show error message
            Swal.fire({
                title: 'שגיאה',
                text: data.message || 'אירעה שגיאה בשליחת ההודעה',
                icon: 'error',
                confirmButtonText: 'אישור'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בשליחת ההודעה. אנא נסו שוב מאוחר יותר.',
            icon: 'error',
            confirmButtonText: 'אישור'
        });
    });
}