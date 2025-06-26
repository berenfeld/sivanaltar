<?php
// Load environment variables first
require_once 'env_loader.php';

// Get initialization token and admin email
$valid_init_token = $GLOBALS['INIT_DB_TOKEN'] ?: 'setup_sivanaltar_2023';
$admin_email = $GLOBALS['ADMIN_EMAIL'] ?: 'berenfeldran@gmail.com';

// Get table parameter for selective operations
$specific_table = $_GET['table'] ?? null;

// Check if token is provided and valid
if (!isset($_GET['init_token']) || $_GET['init_token'] !== $valid_init_token) {
    header('HTTP/1.0 403 Forbidden');
    echo "<h1>Access Denied</h1>";
    echo "<p>You need to provide a valid initialization token.</p>";
    exit;
}

// Get database configuration
$db_host = $GLOBALS['DB_HOST'] ?: '127.0.0.1';
$db_user = $GLOBALS['DB_USER'] ?: '';
$db_pass = $GLOBALS['DB_PASS'] ?: '';
$db_name = $GLOBALS['DB_NAME'] ?: '';

echo "<h1>Database Initialization Script</h1>";

// Add confirmation check for safety
if (!isset($_GET['confirm']) || $_GET['confirm'] !== 'yes') {
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Database Initialization</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .warning { color: #721c24; background-color: #f8d7da; padding: 15px; border-radius: 5px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white;
                     text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .button.cancel { background-color: #6c757d; margin-left: 10px; }
            h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .info { background-color: #e2f0fb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>Database Initialization</h1>

        <div class='warning'>
            <strong>Warning!</strong> This will reset your database and delete all existing data" . ($specific_table ? " for table: <strong>$specific_table</strong>" : "") . "!
        </div>

        <div class='info'>
            <p>This script will perform the following actions:</p>
            <ul>";

    if ($specific_table) {
        echo "<li>Drop and recreate the <strong>$specific_table</strong> table</li>";
        if ($specific_table === 'mainpage') {
            echo "<li>Add initial mainpage content</li>";
        } elseif ($specific_table === 'gallery') {
            echo "<li>Add initial gallery items</li>";
        } elseif ($specific_table === 'users') {
            echo "<li>Add initial admin user: <strong>" . htmlspecialchars($admin_email) . "</strong></li>";
        }
    } else {
        echo "<li>Create database if it doesn't exist</li>
                <li>Drop any existing tables with foreign keys to users</li>
                <li>Drop the users table</li>
                <li>Create a new users table</li>
                <li>Add initial admin user: <strong>" . htmlspecialchars($admin_email) . "</strong></li>";
    }

    echo "</ul>
        </div>

        <p>Are you sure you want to proceed?</p>

        <a href='?confirm=yes&init_token=" . htmlspecialchars($valid_init_token) . ($specific_table ? "&table=" . urlencode($specific_table) : "") . "' class='button'>Yes, Initialize Database</a>
        <a href='index.php' class='button cancel'>Cancel</a>
    </body>
    </html>";
    exit;
}

// Environment information
echo "<p>Environment: <strong>" . $GLOBALS['DEPLOYMENT'] . "</strong></p>";
echo "<p>Admin email: <strong>" . htmlspecialchars($admin_email) . "</strong></p>";

try {
    // Get database connection without database name
    $conn = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if it doesn't exist
    echo "<h2>Creating Database</h2>";
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "<p style='color:green;'>✓ Database created or already exists</p>";

    // Select the database
    $conn->exec("USE `$db_name`");
    echo "<p style='color:green;'>✓ Database selected</p>";

    // Set connection charset
    $conn->exec("SET NAMES utf8mb4");
    $conn->exec("SET CHARACTER SET utf8mb4");
    $conn->exec("SET character_set_connection=utf8mb4");

    // Define table operations
    $table_operations = [
        'users' => [
            'create_sql' => "
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    name VARCHAR(255) NOT NULL,
                    profile_picture VARCHAR(255),
                    is_admin BOOLEAN DEFAULT FALSE,
                    last_login DATETIME,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'insert_data' => function($conn, $admin_email) {
                $admin_name = explode('@', $admin_email)[0];
                $sql_admin = "INSERT INTO users (email, name, is_admin) VALUES (:email, :name, TRUE)";
                $stmt = $conn->prepare($sql_admin);
                $stmt->execute([
                    'email' => $admin_email,
                    'name' => $admin_name
                ]);
                echo "<p style='color:green;'>✓ Admin user <strong>" . htmlspecialchars($admin_email) . "</strong> added successfully</p>";
            }
        ],
        'gallery' => [
            'create_sql' => "
                CREATE TABLE gallery (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    image_path VARCHAR(255) NOT NULL,
                    display_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'insert_data' => function($conn) {
                $gallery_data = [
                    ['title' => 'רגע של התבוננות', 'description' => 'צילום מיוחד שלכד רגע של שלווה פנימית', 'image_path' => 'images/gallery-1.jpeg', 'display_order' => 1],
                    ['title' => 'דרך חדשה', 'description' => 'תחילתו של מסע אישי', 'image_path' => 'images/gallery-2.jpeg', 'display_order' => 2],
                    ['title' => 'שקיעה מרהיבה', 'description' => 'סוף יום מלא השראה', 'image_path' => 'images/gallery-3.jpeg', 'display_order' => 3],
                    ['title' => 'טבע פראי', 'description' => 'החיבור לטבע כחלק מתהליך ההתפתחות', 'image_path' => 'images/gallery-4.jpeg', 'display_order' => 4],
                    ['title' => 'אור בקצה המנהרה', 'description' => 'תקווה והתחדשות', 'image_path' => 'images/gallery-5.jpeg', 'display_order' => 5],
                    ['title' => 'מבט אל האופק', 'description' => 'לראות מעבר למה שנמצא כעת', 'image_path' => 'images/gallery-6.jpeg', 'display_order' => 6],
                    ['title' => 'צבעי החיים', 'description' => 'הדרך שבה אנו רואים את העולם', 'image_path' => 'images/gallery-7.jpeg', 'display_order' => 7],
                    ['title' => 'דרכים מתפצלות', 'description' => 'בחירות שמעצבות את המסע שלנו', 'image_path' => 'images/gallery-8.jpeg', 'display_order' => 8],
                    ['title' => 'שקט פנימי', 'description' => 'רגע של מדיטציה והתבוננות', 'image_path' => 'images/gallery-9.jpeg', 'display_order' => 9],
                    ['title' => 'מרחבים פתוחים', 'description' => 'האפשרויות האינסופיות שלפנינו', 'image_path' => 'images/gallery-10.jpeg', 'display_order' => 10]
                ];

                $sql_insert = "INSERT INTO gallery (title, description, image_path, display_order) VALUES (:title, :description, :image_path, :display_order)";
                $stmt = $conn->prepare($sql_insert);
                $inserted_count = 0;

                foreach ($gallery_data as $item) {
                    try {
                        $stmt->execute($item);
                        $inserted_count++;
                    } catch (PDOException $e) {
                        echo "<p style='color:orange;'>Warning inserting gallery item: " . $e->getMessage() . "</p>";
                    }
                }
                echo "<p style='color:green;'>✓ Successfully inserted $inserted_count gallery items</p>";
            }
        ],
        'mainpage' => [
            'create_sql' => "
                CREATE TABLE mainpage (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    content LONGTEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            'insert_data' => function($conn) {
                $mainpage_content = '<div class="mainpage_main_div">
                    <!-- Hero Section -->
                    <section class="mainpage_hero-section">
                        <div class="mainpage_hero-background">
                            <div class="mainpage_hero-overlay"></div>
                            <div class="container">
                                <div class="mainpage_hero-content">
                                    <div class="mainpage_quote-box">
                                        <blockquote>
                                            <p>"מי שמביט החוצה חולם, מי שמביט פנימה מתעורר"</p>
                                            <cite>קרל יונג</cite>
                                        </blockquote>
                                    </div>
                                    <div class="mainpage_hero-text">
                                        <p>גלה את הפוטנציאל הטמון בך וחווה חיים מלאים ומשמעותיים בעזרת אימון רגשי</p>
                                        <p>דרך מפגשי אימון אישיים המותאמים לצרכים שלך, ובשיתוף פעולה מלא, נתווה דרך להשגת המטרות האישיות והמקצועיות שלך</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- About Me Section -->
                    <section class="mainpage_about-section">
                        <div class="container">
                            <div class="mainpage_about-content">
                                <div class="mainpage_about-image">
                                    <img src="images/main-1.jpeg" alt="סיון אלטרוביץ">
                                </div>
                                <div class="mainpage_about-text">
                                    <h3>בקצרה עלי</h3>
                                    <p>נעים מאוד, אני סיון, מנהלת משאבי אנוש ומאמנת רגשית בשיטת סאטיה, המלווה בתהליכי צמיחה אישית</p>
                                    <p>אמא גאה לשלושה ילדים. את חיי אני חולקת עם רן, בן זוגי ושותפי לחיים</p>

                                    <p>בהשכלתי תואר ראשון בפסיכולוגיה וחינוך מהאוניברסיטה הפתוחה, תואר שני בהתנהגות ארגונית וניהול משאבי אנוש מאוניברסיטת תל אביב</p>
                                    <p>אני גם חשבת שכר מוסמכת ובעלת הכשרה בגישור</p>
                                    <p>תחומי העניין שלי כוללים הכרות עם אנשים חדשים, תרבויות מגוונות, טיולים בטבע, יוגה, שנורקלינג, צילום, אופנה וקיימות</p>

                                    <p>במשך יותר מעשור שאני מנחה עובדים ומנהלים בתהליכי צמיחה ושינוי. יש לי הבנה עמוקה באתגרים העומדים בפני אנשים במקום העבודה המודרני, בהתפתחות קריירה ובאיזון החיוני בין החיים המקצועיים והאישיים</p>

                                    <p>אני מאמינה שלכל אחד יש נושא או תחום שמעסיק אותו. שהוא היה רוצה לשפר בחיים, להתבונן להעמיק ו/או לפעול אחרת. עבורי, בעקבות משבר שעברתי בחיים, פניתי לאימון רגשי</p>

                                    <p>בחרתי לעשות זאת בשיטת סאטיה, שפועלת בגישה של חקירה עצמית, הכרות עם מנגנוני ההגנה ותרגול פרקטי</p>

                                    <p>אימון ותרגול השיטה איפשר לי לפתח נינוחות ושמחה בחיי ולדייק את הבחירות שלי</p>
                                    <p>באמצעות אימון אישי, מצאתי כוח וחוסן</p>
                                    <p>חוויה זו הניעה אותי להעמיק בשיטה ולהפוך בעצמי למאמנת רגשית</p>

                                    <p>המטרה שלי היא להעניק לאחרים כלים נוספים למסעותיהם האישיים, בדומה למסע שלי</p>

                                    <p>אני משלבת את הידע והכלים שרכשתי משני התחומים ומציעה את כישורי ההקשבה שלי כדי לעזור למתאמנים שלי לקבל בהירות, להתחבר מחדש לעצמם ולקבל החלטות טובות יותר הן בחיים האישיים והן בקריירה</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Method Section -->
                    <section class="mainpage_method-section">
                        <div class="container">
                            <div class="mainpage_method-content">
                                <div class="mainpage_method-image">
                                    <img src="images/main-2.png" alt="שיטת סאטיה">
                                </div>
                                <div class="mainpage_method-text">
                                    <h3>מהי שיטת סאטיה</h3>
                                    <p>שיטת סאטיה היא שיטת עבודה הממוקדת במתן קשב עמוק וחומל לגוף ולנפש האדם</p>
                                    <p>מדובר על דרך אינטגרטיבית המבוססת על כלים מהפילוסופיה הבודהיסטית, הפילוסופיה האקזיסטנציאליסטית, ותרפיה מבוססת גוף, בשילוב עם כלים מעולם האימון המודרני</p>

                                    <p>מטרתה של שיטת סאטיה ללמד את האדם להיות ער לעצמו ולהכיר את האופן שבו הוא חי ופועל בחייו על מנת שיוכל לפתח חוסן נפשי, חמלה, שמחה ולהיות שלם עם בחירותיו תוך לקיחת אחריות אישית</p>

                                    <p>המפגשים מתנהלים במרחב בטוח וקשוב, תוך התמקדות בתחושות הגופניות, ברגשות ובתפיסות עולם המרכיבות את חוויות החיים של הלקוח</p>

                                    <p>באמצעות חקירה משותפת, הפניית תשומת הלב דרך הגוף תוך כדי התבוננות ומיקוד במקומות שנחווים כקשים ומאתגרים, ישנה הסתכלות עמוקה על האופן שבו מקומות אלו מעצבים את המציאות שלנו בחיי היומיום ובמערכות היחסים בחיינו</p>

                                    <p>שיטת סאטיה מציעה דרך חומלת, מכבדת וטרנספורמטיבית לריפוי, כך שתתפתח גישה לחופש פנימי ויצירה של אפשרויות חדשות</p>

                                    <p>שיטת סאטיה פותחה על ידי נטאלי בן דוד אלחנן העוסקת בהתפתחותו האפשרית של האדם וביצירת דרכי גישה וכלים להפחתת סבל על כל גווניו מתוך חזון ליצור עולם מיטיב יותר</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- How It Works Section -->
                    <section class="mainpage_how-it-works-section">
                        <div class="container">
                            <div class="mainpage_how-it-works-content">
                                <div class="mainpage_how-it-works-image">
                                    <img src="images/main-4.jpeg" alt="תהליך האימון">
                                </div>
                                <div class="mainpage_how-it-works-text">
                                    <h3>איך זה עובד בעצם</h3>
                                    <p>אז מה קורה בחדר האימון ואיך זה עובד בעצם ?</p>

                                    <h4>השלב הראשון: פגישת ההיכרות – מי אני ? 🧭</h4>
                                    <p>הכל מתחיל בשיחה אישית, מעמיקה ופתוחה בינינו. זו לא שיחת "פסיכולוג", אלא שיחה של הקשבה, הבנה והתבוננות משותפת. דרך סדרת שאלות מדויקות. אנחנו יוצאים יחד למסע גילוי שבו נבין:</p>
                                    <p>מה עיצב אתכם? נבחן אירועים, חוויות ורגעים משמעותיים בחייכם שהפכו אתכם למי שאתם היום, עם כל החוזקות והעוצמות הייחודיות לכם.</p>
                                    <p>מה באמת חשוב לכם בחיים? מהם הערכים שמניעים אתכם? מהם הרצונות העמוקים, השאיפות והחלומות שלכם לעתיד?</p>
                                    <p>זוהי פגישה עוצמתית ונדירה, שתהווה את היסודות לכל העבודה המשותפת שלנו.</p>

                                    <h4>השלב השני: מיפוי ותכנון הצמיחה האישית  🗺️</h4>
                                    <p>אחרי שהכרנו לעומק, נמפה ונתכנן יחד את הצמיחה האישית באמצעות כלי עבודה יחודי שפותח למטה זאת. חשבו עליו כמפה אישית שמציגה את החזון שלכם לעתיד ואת התחומים המרכזיים בחייכם שבהם תרצו ליצור שינוי ושיפור. הוא הופך את הרצונות והשאיפות שלכם למסלול פעולה ברור וממוקד.</p>

                                    <h4>השלב השלישי: עבודה מעשית וצמיחה – צעד אחר צעד 👣</h4>
                                    <p>במפגשים הבאים, נרד לעבודה קונקרטית על הנושאים שבחרתם בתכנון הצמיחה האישית. אתם מוזמנים להביא איתכם כל אתגר, דילמה, קושי רגשי או רצון לשינוי שעולה בכם. בחדר שלנו (פיזית או וירטואלית בוידאו), תמצאו:</p>
                                    <ul>
                                        <li>הקשבה מלאה ונוכחת: אני שם לכל מילה, לכל תחושה ולכל מה שעולה בכם.</li>
                                        <li>הבנה עניינית וממוקדת: נדייק ונבין יחד את שורש הדברים.</li>
                                        <li>התייחסות רגשית ואמפתית: ניתן מקום לכל רגש שעולה, נאפשר לו להיות ונלמד ממנו.</li>
                                    </ul>
                                    <p>הכל במרחב בטוח, מכיל ודיסקרטי לחלוטין.</p>

                                    <p>במפגשים שלנו, קיימים רק אתם ואני, עם מטרה משותפת אחת: הטובה והצמיחה האישית שלכם.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <!-- Value Section -->
                    <section class="mainpage_value-section">
                        <div class="container">
                            <div class="mainpage_value-content">
                                <div class="mainpage_value-image">
                                    <img src="images/main-3.jpeg" alt="ערך האימון">
                                </div>
                                <div class="mainpage_value-text">
                                    <h3>הערך באימון בשיטת סאטיה</h3>
                                    <p>החיים הם כאן ועכשיו, פעם אחת ויחידה (לפחות בסיבוב הזה)</p>

                                    <p>המרחק בין חיים של פשרה לחיים מחוברים ומלאי השראה הוא דק כמו קרן אור</p>
                                    <p>יש בנו תשוקה עמוקה לחיות באמת, להרגיש חופש פנימי, ליצור קשרים עמוקים ומשמעותיים</p>
                                    <p>"אבל משהו תמיד עוצר אותנו - דפוסים ישנים, פחדים נסתרים, או פשוט הרגל להסתפק ב"בסדר</p>

                                    <p>ואולי זה בדיוק הזמן לעצור רגע ולשאול - מה היה קורה אם היינו מרשים לעצמנו להיות פגיעים, אותנטיים, אמיתיים?</p>

                                    <h4>מה מאפשר האימון?</h4>
                                    <ul class="benefits-list">
                                        <li>פיתוח חוסן מול אתגרים ותסכולים בחיי היום-יום</li>
                                        <li>התמודדות עם שינויים ומשברים, למשל בקריירה</li>
                                        <li>שיפור מערכות יחסים</li>
                                        <li>עבודה על איזון פנימי וניהול לחצים</li>
                                        <li>קידום התפתחות אישית וצמיחה</li>
                                    </ul>

                                    <p>אם קראת והתחברת, ואת או אתה מוכנ/ה לתהליך של צמיחה והתפתחות</p>
                                    <p>אני מזמינה אותך לפנות אליי כדי לשמוע עוד ולשתף אותי</p>
                                    <p>ונבחן יחד אפשרות לדרך של עבודה משותפת :-)</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>';

                $sql_insert_mainpage = "INSERT INTO mainpage (content) VALUES (:content)";
                $stmt = $conn->prepare($sql_insert_mainpage);
                $stmt->execute(['content' => $mainpage_content]);
                echo "<p style='color:green;'>✓ Mainpage content inserted successfully</p>";
            }
        ]
    ];

    if ($specific_table) {
        // Single table operation
        if (!isset($table_operations[$specific_table])) {
            echo "<p style='color:red;'>Unknown table: $specific_table</p>";
            exit;
        }

        echo "<h2>Dropping and Recreating Table: $specific_table</h2>";

        try {
            // Disable foreign key checks
            $conn->exec("SET FOREIGN_KEY_CHECKS = 0");

            // Drop the specific table
            $conn->exec("DROP TABLE IF EXISTS `$specific_table`");
            echo "<p>Table <code>$specific_table</code> dropped.</p>";

            // Re-enable foreign key checks
            $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

            // Create the table
            echo "<h2>Creating $specific_table Table</h2>";
            $conn->exec($table_operations[$specific_table]['create_sql']);
            echo "<p style='color:green;'>✓ $specific_table table created successfully</p>";

            // Insert data if function exists
            if (isset($table_operations[$specific_table]['insert_data'])) {
                echo "<h2>Populating $specific_table Table</h2>";
                $table_operations[$specific_table]['insert_data']($conn, $admin_email);
            }

        } catch (PDOException $e) {
            echo "<p style='color:red;'>Error with table $specific_table: " . $e->getMessage() . "</p>";
        }

    } else {
        // Full database reset (original behavior)
        // First check for existing tables
        echo "<h2>Checking Existing Tables</h2>";
        $tables_to_drop = [];

        try {
            $stmt = $conn->query("SHOW TABLES");
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $tables_to_drop[] = $row[0];
            }
            echo "<p>Found " . count($tables_to_drop) . " tables in database.</p>";
        } catch (PDOException $e) {
            echo "<p style='color:orange;'>Warning checking tables: " . $e->getMessage() . "</p>";
        }

        // Drop all tables
        echo "<h2>Dropping All Tables</h2>";
        try {
            $conn->exec("SET FOREIGN_KEY_CHECKS = 0");
            foreach ($tables_to_drop as $table) {
                $conn->exec("DROP TABLE IF EXISTS `$table`");
                echo "<p>Table <code>$table</code> dropped.</p>";
            }
            $conn->exec("SET FOREIGN_KEY_CHECKS = 1");
        } catch (PDOException $e) {
            echo "<p style='color:red;'>Error dropping tables: " . $e->getMessage() . "</p>";
        }

        // Create all tables
        foreach ($table_operations as $table_name => $operation) {
            echo "<h2>Creating $table_name Table</h2>";
            $conn->exec($operation['create_sql']);
            echo "<p style='color:green;'>✓ $table_name table created successfully</p>";

            if (isset($operation['insert_data'])) {
                echo "<h2>Populating $table_name Table</h2>";
                $operation['insert_data']($conn, $admin_email);
            }
        }
    }

    echo "<h2 style='color:green;'>Database Initialization Complete</h2>";
    echo "<p>Users table has been created with admin user.</p>";

    // Show links
    echo '<p>';
    echo '<a href="server_test.php" style="padding:10px 15px; background-color:#2196F3; color:white; text-decoration:none; border-radius:4px;">Server Test Page</a>';
    echo '</p>';

} catch (PDOException $e) {
    // Show error details
    echo "<h2 style='color:red;'>Database Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";

    // Debug info for development
    if ($GLOBALS['DEPLOYMENT'] !== 'Production') {
        echo "<h3>Debug Information:</h3>";
        echo "<pre>";
        print_r($e->getTrace());
        echo "</pre>";
    }
}
?>