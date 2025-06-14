<!DOCTYPE html>
<html>
<head>
  <title>Google Sign-In Test</title>
  <meta name="google-signin-client_id" content="737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com">
</head>
<body>
  <h1>Google Sign-In Test</h1>
  <div id="g_id_onload"
     data-client_id="737149879159-k8sksf67g8o8e769u1qvnjjmojv7i8sl.apps.googleusercontent.com"
     data-context="signin"
     data-callback="handleCredentialResponse">
  </div>

  <div class="g_id_signin"
     data-type="standard"
     data-size="large"
     data-theme="outline"
     data-text="sign_in_with"
     data-shape="rectangular">
  </div>

  <script>
    function handleCredentialResponse(response) {
      console.log("Encoded JWT ID token: " + response.credential);
      document.getElementById('result').textContent = "Authentication successful!";
    }
  </script>

  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <div id="result"></div>
</body>
</html>