
import { showMessage } from '../../js/messageHandler.js';
const gBASE_URL = config.apiUrl;
var jwt = '';
$(document).ready(function () {
    jwt = Cookies.get('jwt');
    if (!jwt) {
        // Submit event handler for the form
        $("#form-login").submit(function (event) {
            event.preventDefault();

            // Disable the submit button to avoid duplicate clicks
            const $submitButton = $(".btn-submit");
            $submitButton.prop("disabled", true);

            if (validateForm()) {
                const data = {
                    username: $("#input-username").val().trim(),
                    password: $("#input-password").val().trim(),
                };

                $.ajax({
                    url: `${gBASE_URL}/user/login`,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(data),
                    success: function (response) {
                        jwt = response.token;
                        Cookies.set('jwt', jwt, { expires: 7, path: '/' });
                        getUserId(response.username);
                        setTimeout(function() {
                            window.location.href="/user/property-list";
                        }, 500);
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
                alert("Please fill out all fields.");
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
    const username = $("#input-username").val().trim();
    const password = $("#input-password").val().trim();

    // Clear previous error messages
    $(".form-control").removeClass("is-invalid");

    // Validate username
    if (username === "") {
        $("#input-username").addClass("is-invalid");
        isValid = false;
    }

    // Validate password
    if (password === "") {
        $("#input-password").addClass("is-invalid");
        isValid = false;
    }

    return isValid;
}

function getUserId(username){
    $.ajax({
        url: `${gBASE_URL}/user/getUserId/${username}`,
        type: "GET",
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            localStorage.setItem('username', username);
            localStorage.setItem('userId', response.id);
            localStorage.setItem('userType', response.userType);
        },
        error: function (pAjaxContext) {
            showMessage("Error", pAjaxContext.responseText
                + ", status: " + pAjaxContext.status);
        }
    });
}