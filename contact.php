<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <?php include 'head.php'; ?>
</head>
<body>

    <?php include 'nav.php'; ?>

    <!-- Newsletter Section -->
    <section class="newsletter-section" style="background-image: url(images/contact-background.jpeg)">
        <div class="overlay"></div>
        <div class="container">
            <h2>הישארו מעודכנים</h2>
            <p>הירשמו לניוזלטר שלי כדי לקבל תובנות ותוכן בלעדי ישירות לתיבת הדואר שלכם</p>
            <form class="newsletter-form" action="https://formsubmit.co/sivanaltar@gmail.com" method="POST">
                <input type="hidden" name="_subject" value="הרשמה חדשה לניוזלטר">
                <input type="hidden" name="_next" value="https://sivanaltar.com/thank-you.php">
                <input type="hidden" name="_template" value="table">
                <div class="form-group">
                    <div class="form-row">
                        <div class="form-input">
                            <label for="name">שם</label>
                            <input type="text" id="name" name="name" placeholder="השם שלך" required>
                        </div>
                        <div class="form-input">
                            <label for="email">אימייל</label>
                            <input type="email" id="email" name="email" placeholder="האימייל שלך" required>
                        </div>
                    </div>
                    <input type="hidden" name="_subject" value="הרשמה לניוזלטר">
                    <button type="submit">הרשם</button>
                </div>
            </form>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
        <div class="container">
            <div class="section-header">
                <h2>בואו לבקר</h2>
                <p>פגשו את סיון וגלו את הזמנים המתאימים לכם לתחילת המסע האישי שלכם</p>
            </div>
            <div class="contact-layout">
                <div class="contact-info">
                    <div class="info-item">
                        <div class="icon"><i class="fas fa-map-marker-alt"></i></div>
                        <div class="text">רמת השרון או פגישות אונליין</div>
                    </div>
                    <div class="info-item">
                        <div class="icon"><i class="far fa-clock"></i></div>
                        <div class="text">תיאום מראש</div>
                    </div>
                    <div class="info-item">
                        <div class="icon"><i class="fas fa-phone-alt"></i></div>
                        <div class="text"><a href="tel:+972545999671">054-5999671</a></div>
                    </div>
                    <div class="info-item">
                        <div class="icon"><i class="far fa-envelope"></i></div>
                        <div class="text"><a href="mailto:sivanaltar@gmail.com">sivanaltar@gmail.com</a></div>
                    </div>
                </div>
                <div class="map-container">
                    <div id="map">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27035.81476906677!2d34.83271062623091!3d32.14620088612077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d47f2cdeb98e1%3A0x3cdb435f4b12b983!2sRamat%20HaSharon!5e0!3m2!1sen!2sil!4v1686471370322!5m2!1sen!2sil" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
                <div class="contact-form">
                    <form action="https://formsubmit.co/sivanaltar@gmail.com" method="POST">
                        <input type="hidden" name="_subject" value="פנייה חדשה מהאתר">
                        <input type="hidden" name="_next" value="https://sivanaltar.com/thank-you.php">
                        <input type="hidden" name="_template" value="table">
                        <input type="hidden" name="_captcha" value="true">
                        <div class="form-group">
                            <div class="form-row">
                                <div class="form-input">
                                    <label for="contact-name">שם</label>
                                    <input type="text" id="contact-name" name="name" placeholder="השם המלא שלך" required>
                                </div>
                                <div class="form-input">
                                    <label for="contact-email">אימייל</label>
                                    <input type="email" id="contact-email" name="email" placeholder="כתובת האימייל שלך" required>
                                </div>
                            </div>
                            <div class="form-input">
                                <label for="message">הודעה</label>
                                <textarea id="message" name="message" rows="5" placeholder="איך אני יכולה לעזור לך?" required></textarea>
                            </div>
                            <button type="submit">שלח הודעה</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <?php include 'footer.php'; ?>
</body>
</html>