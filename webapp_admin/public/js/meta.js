// window.fbAsyncInit = function () {
//   // JavaScript SDK configuration and setup
//   FB.init({
//     appId: '315343961336992', // Facebook App ID
//     cookie: true, // enable cookies
//     xfbml: true, // parse social plugins on this page
//     version: 'v19.0', //Graph API version
//   });
// };

// // Load the JavaScript SDK asynchronously
// (function (d, s, id) {
//   let js,
//     fjs = d.getElementsByTagName(s)[0];
//   if (d.getElementById(id)) return;
//   js = d.createElement(s);
//   js.id = id;
//   js.src = 'https://connect.facebook.net/en_US/sdk.js';
//   fjs.parentNode.insertBefore(js, fjs);
// })(document, 'script', 'facebook-jssdk');

window.fbAsyncInit = function () {
  FB.init({
    appId: '315343961336992', // Facebook App ID
    cookie: true, // enable cookies
    xfbml: true, // parse social plugins on this page
    version: 'v19.0', //Graph API version
  });

  FB.AppEvents.logPageView();
  FB.getLoginStatus(function (response) {
    // Called after the JS SDK has been initialized.
    statusChangeCallback(response); // Returns the login status.
  });
};

(function (d, s, id) {
  let js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

// Facebook Login with JavaScript SDK
function launchWhatsAppSignup(config_id) {
  // Conversion tracking code
  // fbq && fbq('trackCustom', 'WhatsAppOnboardingStart', {appId: '315343961336992', feature: 'whatsapp_embedded_signup'});

  // Launch Facebook login
  FB.login(
    function (response) {
      if (response.authResponse) {
        const code = response.authResponse.code;
        console.log(response.authResponse);
        console.log(code);
        // The returned code must be transmitted to your backend,
        // which will perform a server-to-server call from there to our servers for an access token
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    },
    {
      config_id: config_id, // configuration ID goes here
      response_type: 'code', // must be set to 'code' for System User access token
      override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
    },
  );
}

function checkLoginState() {
  FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
  FB.api('/me', function (response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}

function statusChangeCallback(response) {
  console.log('res', response);
}
