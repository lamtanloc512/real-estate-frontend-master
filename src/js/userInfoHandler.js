import { showMessage } from '../../js/messageHandler.js';
const gBASE_URL = config.apiUrl;
var jwt = '';
var userId = '';
var userType = '';
var username = "";

document.addEventListener("DOMContentLoaded", () => {
    jwt = Cookies.get('jwt');
    username = localStorage.getItem('username');
    userId = localStorage.getItem('userId');
    userType = localStorage.getItem('userType');
    if (jwt) {
        onUserInfoPageLoading();
    }
});

function onUserInfoPageLoading() {
    if (userType == 'USER') {
        callGetCustomerInfoApi();
    }
    else if (userType == 'EMPLOYEE') {
        callGetEmployeeInfoApi();
    }
}

function callGetCustomerInfoApi() {
    $.ajax({
        url: `${gBASE_URL}/user/${userId}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        dataType: 'json',
        success: function (data) {
            renderCustomerInfo(data);
        },
        error: function (xhr, status, error) {
        }
    });
}

function callGetEmployeeInfoApi() {
    $.ajax({
        url: `${gBASE_URL}/employees/${userId}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        dataType: 'json',
        success: function (data) {
            renderEmployeeInfo(data);
        },
        error: function (xhr, status, error) {
        }
    });
}

function renderCustomerInfo(data) {
    $("#user-name").append(` <span>${data.fullName}</span>`);
    $("#user-email").append(` <span>${data.email}</span>`);
    // $("#user-phone").append(` <span>${data.mobile}</span>`);
    // $("#user-address").append(` <span>${data.address}</span>`);
}

function renderEmployeeInfo(data) {
    $("#user-name").append(` <span>${data.firstName} ${data.lastName}</span>`);
    $("#user-email").append(` <span>${data.email}</span>`);
    $("#user-phone").append(` <span>${data.homePhone}</span>`);
    $("#user-address").append(` <span>${data.address}</span>`);
}

$("#form-change-password").submit(function (event) {
    event.preventDefault();

    // Disable the submit button to avoid duplicate clicks
    const $submitButton = $(".btn-submit");
    $submitButton.prop("disabled", true);

    if (validateForm()) {
        const data = {
            username: username,
            oldPassword : $("#input-old-password").val().trim(),
            newPassword : $("#input-new-password").val().trim()
        };

        let url="";
        if(userType == "USER"){
            url = `${gBASE_URL}/auth/reset-password/user`;
        }
        else if(userType == "EMPLOYEE"){
            url = `${gBASE_URL}/auth/reset-password/employee`;
        }
        $.ajax({
            url: url,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            data: JSON.stringify(data),
            success: function (response) {
                showMessage("Success", "Change password successfully");
                $("#form-change-password").trigger('reset');
            },
            error: function (pAjaxContext) {
                showMessage("Error", pAjaxContext.responseJSON ? pAjaxContext.responseJSON.error : pAjaxContext.responseText
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

// Function to validate the form fields
function validateForm() {
    let isValid = true;
    const oldPassword = $("#input-old-password").val().trim();
    const newPassword = $("#input-new-password").val().trim();
    const confirmPassword = $("#input-confirm-password").val().trim();

    // Clear previous error messages
    $(".form-control").removeClass("is-invalid");

    // Validate username
    if (oldPassword === "") {
        $("#input-old-password").addClass("is-invalid");
        isValid = false;
    }

    // Validate password
    if (newPassword === "") {
        $("#input-new-password").addClass("is-invalid");
        isValid = false;
    }

    if (confirmPassword === "") {
        $("#input-confirm-password").addClass("is-invalid");
        isValid = false;
    }

    // Validate password
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (newPassword === "" || !passwordRegex.test(newPassword)) {
        $("#input-password").addClass("is-invalid");
        $("#passwordHelp").addClass("text-danger");
        isValid = false;
    }

    // Validate confirm password
    if (confirmPassword === "" || newPassword !== confirmPassword) {
        $("#input-confirm-password").addClass("is-invalid");
        isValid = false;
    }

    return isValid;
}