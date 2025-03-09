const gBASE_URL = config.apiUrl;
var jwt = '';
var username = '';
$(document).ready(function () {
    jwt = Cookies.get('jwt');
    username = localStorage.getItem("username");
    if(!jwt){
        window.location.href = '/admin';
    }
    else{
        $(".btn-logout").css("display", "block");
    }

    loadMenuAsRole();
});

$('.btn-logout').on("click", onBtnLogoutClick);
function onBtnLogoutClick(event) {
        event.preventDefault(); 
        const jwt = Cookies.get('jwt');
        if (jwt) {
            $.ajax({
                url: `${gBASE_URL}/user/logout`,
                type: "POST",
                contentType: "application/json",
                headers: {
                    'Authorization': `Bearer ${jwt}`
                },
                success: function (response) {
                    Cookies.remove('jwt');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userType');
                    window.location.href = "/admin";
                },
                error: function (pAjaxContext) {
                    showMessage("Error", pAjaxContext.responseText
                        + ", status: " + pAjaxContext.status);
                },
            });
        }
        else {
            showMessage("Error", "User not logged in.");
        }
    }

function loadMenuAsRole(){
    $.ajax({
        url: `${gBASE_URL}/employees/employee-role/${username}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(response) {
            var role = response.role; // 'ROLE_ADMIN' or 'ROLE_SALE'
            
            if (role === 'ROLE_ADMIN') {
                // Show admin-specific items and common items
                $('ul.nav-treeview .nav-item[data-role="admin"]').show();
                $('ul.nav-treeview .nav-item[data-role="both"]').show(); // Show common items for both roles
            } else if (role === 'ROLE_SALE') {
                // Show sale-specific items and common items
                $('ul.nav-treeview .nav-item[data-role="admin"]').hide(); // Hide admin-specific items
                $('ul.nav-treeview .nav-item[data-role="both"]').show(); // Show common items for both roles
            }
        },
        error: function(err) {
        }
    });
}