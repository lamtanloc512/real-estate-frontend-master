import { showMessage } from '../../js/messageHandler.js';
const gBASE_URL = config.apiUrl;
$(document).ready(function () {
    const jwt = Cookies.get('jwt');
    if (!jwt) {
        // Submit event handler for the form
        $("#form-register").submit(function (event) {
            event.preventDefault();

            // Disable the submit button to avoid duplicate clicks
            const $submitButton = $(".btn-submit");
            $submitButton.prop("disabled", true);

            if (validateForm()) {
                const data = {
                    fullName: $("#input-full-name").val().trim(),
                    email: $("#input-email").val().trim(),
                    username: $("#input-username").val().trim(),
                    password: $("#input-password").val().trim(),
                };

                $.ajax({
                    url: `${gBASE_URL}/user/register`,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: function (response) {
                        alert("Registration successful!");
                        window.location.href = "/user/login";
                    },
                    error: function (pAjaxContext) {
                        showMessage("Error", pAjaxContext.responseText
                            + ", status: " + pAjaxContext.status);
                    },
                    complete: function () {
                        // Re-enable the submit button after the request completes
                        $submitButton.prop("disabled", false);
                    },
                });
            } else {
                alert("Please fix the errors in the form.");
                // Re-enable the submit button if validation fails
                $submitButton.prop("disabled", false);
            }
        });
    }
    else{
        window.location.href ="/";
    }
});

// Function to validate the form fields
function validateForm() {
    let isValid = true;
    const fullName = $("#input-full-name").val().trim();
    const email = $("#input-email").val().trim();
    const username = $("#input-username").val().trim();
    const password = $("#input-password").val().trim();
    const confirmPassword = $("#input-confirm-password").val().trim();

    // Clear previous error messages
    $(".form-control").removeClass("is-invalid");
    $(".form-text").removeClass("text-danger");

    // Validate full name
    if (fullName === "") {
        $("#input-full-name").addClass("is-invalid");
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "" || !emailRegex.test(email)) {
        $("#input-email").addClass("is-invalid");
        isValid = false;
    }

    // Validate username
    if (username === "") {
        $("#input-username").addClass("is-invalid");
        isValid = false;
    }

    // Validate password
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (password === "" || !passwordRegex.test(password)) {
        $("#input-password").addClass("is-invalid");
        $("#passwordHelp").addClass("text-danger");
        isValid = false;
    }

    // Validate confirm password
    if (confirmPassword === "" || password !== confirmPassword) {
        $("#input-confirm-password").addClass("is-invalid");
        isValid = false;
    }

    return isValid;
}