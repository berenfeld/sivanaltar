<?php
// users.php - Display users from database
// Start session for potential authentication check
session_start();

// Include database configuration
require_once 'db_config.php';

// Security check - only allow admin users to view this page
$is_admin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
$current_user_email = $_SESSION['user_email'] ?? '';
$current_user_id = $_SESSION['user_id'] ?? 0;

// You can comment this out for testing, but enable it for production
if (!$is_admin) {
    header('HTTP/1.0 403 Forbidden');
    echo "<h1>Access Denied</h1>";
    echo "<p>You must be an administrator to view this page.</p>";
    echo "<p><a href='index.php'>Return to homepage</a></p>";
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }
        .admin-badge {
            background-color: #4285f4;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 5px;
        }
        .status-active {
            background-color: #4CAF50;
        }
        .status-inactive {
            background-color: #ccc;
        }
        .actions {
            white-space: nowrap;
        }
        .button {
            padding: 5px 10px;
            border-radius: 3px;
            text-decoration: none;
            display: inline-block;
            margin-right: 5px;
            font-size: 12px;
            cursor: pointer;
        }
        .edit-btn {
            background-color: #4285f4;
            color: white;
            border: none;
        }
        .delete-btn {
            background-color: #f44336;
            color: white;
            border: none;
        }
        .refresh-btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 14px;
        }
        .current-user {
            background-color: #e8f0fe;
        }

        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        }

        .modal-content {
            background-color: #fefefe;
            margin: 10% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 5px;
        }

        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }

        .close:hover {
            color: black;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group input {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
        }

        .form-group .checkbox {
            display: flex;
            align-items: center;
        }

        .form-group .checkbox input {
            width: auto;
            margin-right: 10px;
        }

        .modal-buttons {
            text-align: right;
            margin-top: 20px;
        }

        #message-box {
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
            display: none;
        }

        #message-box.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        #message-box.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>
<body>
    <h1>User Management</h1>

    <?php
    // Display current user information
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) {
        echo "<p>Logged in as: <strong>{$_SESSION['user_name']}</strong> ({$_SESSION['user_email']})";
        if ($_SESSION['is_admin']) {
            echo " <span class='admin-badge'>Admin</span>";
        }
        echo "</p>";
    } else {
        echo "<p>Not logged in.</p>";
    }
    ?>

    <div id="message-box"></div>

    <p><button class="button refresh-btn" onclick="window.location.reload()">Refresh List</button></p>

    <?php
    try {
        // Get database connection
        $conn = getDbConnection();

        // Fetch all users
        $stmt = $conn->query("
            SELECT id, email, name, profile_picture, is_admin, last_login, created_at
            FROM users
            ORDER BY created_at DESC
        ");

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($users) > 0) {
            ?>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Avatar</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Login</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $user): ?>
                    <tr class="<?php echo ($user['email'] === $current_user_email) ? 'current-user' : ''; ?>" data-user-id="<?php echo $user['id']; ?>">
                        <td><?php echo htmlspecialchars($user['id']); ?></td>
                        <td>
                            <?php if (!empty($user['profile_picture'])): ?>
                                <img class="user-avatar" src="<?php echo htmlspecialchars($user['profile_picture']); ?>" alt="Avatar">
                            <?php else: ?>
                                <div class="user-avatar">No Image</div>
                            <?php endif; ?>
                        </td>
                        <td><?php echo htmlspecialchars($user['name']); ?></td>
                        <td><?php echo htmlspecialchars($user['email']); ?></td>
                        <td>
                            <?php if ($user['is_admin']): ?>
                                <span class="admin-badge">Admin</span>
                            <?php else: ?>
                                User
                            <?php endif; ?>
                        </td>
                        <td>
                            <?php
                            $last_login = $user['last_login'] ? date('Y-m-d H:i', strtotime($user['last_login'])) : 'Never';
                            echo $last_login;
                            ?>
                        </td>
                        <td><?php echo date('Y-m-d', strtotime($user['created_at'])); ?></td>
                        <td class="actions">
                            <button class="button edit-btn" onclick="editUser(<?php echo $user['id']; ?>, '<?php echo htmlspecialchars(addslashes($user['name'])); ?>', '<?php echo htmlspecialchars(addslashes($user['email'])); ?>', <?php echo $user['is_admin'] ? 'true' : 'false'; ?>)">Edit</button>
                            <?php if ($user['id'] != $current_user_id): ?>
                                <button class="button delete-btn" onclick="deleteUser(<?php echo $user['id']; ?>, '<?php echo htmlspecialchars(addslashes($user['name'])); ?>')">Delete</button>
                            <?php else: ?>
                                <button class="button delete-btn" disabled title="You cannot delete your own account">Delete</button>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php
        } else {
            echo "<p>No users found in the database.</p>";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    }
    ?>

    <!-- Edit User Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            <h2>Edit User</h2>
            <form id="editUserForm">
                <input type="hidden" id="userId" name="userId">

                <div class="form-group">
                    <label for="userName">Name:</label>
                    <input type="text" id="userName" name="userName" required>
                </div>

                <div class="form-group">
                    <label for="userEmail">Email:</label>
                    <input type="email" id="userEmail" name="userEmail" required>
                </div>

                <div class="form-group checkbox">
                    <input type="checkbox" id="isAdmin" name="isAdmin">
                    <label for="isAdmin">Admin User</label>
                </div>

                <div class="modal-buttons">
                    <button type="button" class="button" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="button edit-btn">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // Global variables
        const modal = document.getElementById('editModal');
        const editUserForm = document.getElementById('editUserForm');
        const messageBox = document.getElementById('message-box');

        // Function to display messages
        function showMessage(message, type = 'success') {
            messageBox.textContent = message;
            messageBox.className = type;
            messageBox.style.display = 'block';

            // Hide message after 5 seconds
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 5000);
        }

        // Edit user function
        function editUser(userId, userName, userEmail, isAdmin) {
            // Populate form fields
            document.getElementById('userId').value = userId;
            document.getElementById('userName').value = userName;
            document.getElementById('userEmail').value = userEmail;
            document.getElementById('isAdmin').checked = isAdmin;

            // Show modal
            modal.style.display = 'block';
        }

        // Close modal function
        function closeModal() {
            modal.style.display = 'none';
        }

        // Delete user function
        function deleteUser(userId, userName) {
            if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
                // Send delete request
                fetch('user_actions.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `action=delete&userId=${userId}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Remove row from table
                        const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                        if (row) {
                            row.remove();
                        }
                        showMessage(`User "${userName}" has been deleted.`);
                    } else {
                        showMessage(`Error: ${data.message}`, 'error');
                    }
                })
                .catch(error => {
                    showMessage(`Error: ${error.message}`, 'error');
                });
            }
        }

        // Handle form submission
        editUserForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const userId = document.getElementById('userId').value;
            const userName = document.getElementById('userName').value;
            const userEmail = document.getElementById('userEmail').value;
            const isAdmin = document.getElementById('isAdmin').checked ? 1 : 0;

            // Send update request
            fetch('user_actions.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=update&userId=${userId}&userName=${encodeURIComponent(userName)}&userEmail=${encodeURIComponent(userEmail)}&isAdmin=${isAdmin}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update row in table
                    const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                    if (row) {
                        row.cells[2].textContent = userName;
                        row.cells[3].textContent = userEmail;

                        // Update admin status
                        if (isAdmin) {
                            row.cells[4].innerHTML = '<span class="admin-badge">Admin</span>';
                        } else {
                            row.cells[4].textContent = 'User';
                        }
                    }

                    closeModal();
                    showMessage(`User "${userName}" has been updated.`);
                } else {
                    showMessage(`Error: ${data.message}`, 'error');
                }
            })
            .catch(error => {
                showMessage(`Error: ${error.message}`, 'error');
            });
        });

        // Close modal when clicking outside of it
        window.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
            }
        }
    </script>
</body>
</html>