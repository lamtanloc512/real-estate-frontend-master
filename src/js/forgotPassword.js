
// import { showMessage } from '../../js/messageHandler.js';
// const gBASE_URL = config.apiUrl;
// $(document).ready(function () {
//     const jwt = Cookies.get('jwt');
//     if (!jwt) {
//         // Submit event handler for the form
//     $("#form-forgot-password").submit(function (event) {
//         event.preventDefault();

//         // Disable the submit button to avoid duplicate clicks
//         const $submitButton = $(".btn-submit");
//         $submitButton.prop("disabled", true);

//         if (validateForm()) {
//             const data = {
//                 username: $("#input-username").val().trim(),
//                 password: $("#input-password").val().trim(),
//             };

//             $.ajax({
//                 url: `${gBASE_URL}/user/reset-password`,
//                 type: "POST",
//                 contentType: "application/json; charset=utf-8",
//                 data: JSON.stringify(data),
//                 success: function (response) {
//                     console.log(response);
//                     Cookies.set('jwt', response, { expires: 7, path: '/' });
//                     console.log("JWT set in login:", Cookies.get('jwt'));
//                     setTimeout(function() {
//                         window.location.href="/user/login";
//                     }, 500);
//                 },
//                 error: function (pAjaxContext) {
//                     showMessage("Error", pAjaxContext.responseText
//                         + ", status: " + pAjaxContext.status);
//                 },
//                 complete: function () {
//                     // Re-enable the submit button after the request completes
//                     $submitButton.prop("disabled", false);
//                 },
//             });
//         } else {
//             alert("Please fill out all fields.");
//             // Re-enable the submit button if validation fails
//             $submitButton.prop("disabled", false);
//         }
//     });
//     }
//     else{
//         window.location.href ="/";
//     }
// });

// // Function to validate the form fields
// function validateForm() {
//     let isValid = true;
//     const username = $("#input-username").val().trim();
//     const password = $("#input-password").val().trim();
//     const confirmPassword = $("#input-confirm-password").val().trim();

//     // Clear previous error messages
//     $(".form-control").removeClass("is-invalid");

//     // Validate username
//     if (username === "") {
//         $("#input-username").addClass("is-invalid");
//         isValid = false;
//     }

//     // Validate password
//     if (password === "") {
//         $("#input-password").addClass("is-invalid");
//         isValid = false;
//     }

//     if (confirmPassword === "") {
//         $("#input-confirm-password").addClass("is-invalid");
//         isValid = false;
//     }

//     // Validate password
//     const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
//     if (password === "" || !passwordRegex.test(password)) {
//         $("#input-password").addClass("is-invalid");
//         $("#passwordHelp").addClass("text-danger");
//         isValid = false;
//     }

//     // Validate confirm password
//     if (confirmPassword === "" || password !== confirmPassword) {
//         $("#input-confirm-password").addClass("is-invalid");
//         isValid = false;
//     }

//     return isValid;
// }