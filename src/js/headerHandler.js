import { showMessage } from '../../js/messageHandler.js';
const gBASE_URL = config.apiUrl;
document.addEventListener('DOMContentLoaded', () => {
    const addPropertyButton = document.querySelector(".header-actions-add-property");
    const dropdown = document.getElementById('userDropdown');
    const toggleButton = document.getElementById('userMenuToggle');

    if (addPropertyButton) {
        addPropertyButton.addEventListener("click", (e) => {
            e.preventDefault();
            if(jwt){
                window.location.href = `/add-property`;
            }
            else{
                window.location.href = `/user/login`;
            }
        });
    }

    // Toggle dropdown on button click
    toggleButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the document
        dropdown.classList.toggle('show');
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && !toggleButton.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });

    const jwt = Cookies.get('jwt');
    if (jwt) {
        $('#userDropdown .dropdown-item[href="/user/login"]').hide(); // Hide Sign In
        $('#userDropdown .dropdown-item[href="/user/info"]').show(); // Show User Info
        $('#userDropdown .dropdown-item[href="/user/property-list"]').show(); // Show Property List
        $('#userDropdown .dropdown-item[href="/"]').show(); // Show Sign Out
    }
    else{
        // Show only Sign In
        $('#userDropdown .dropdown-item[href="/user/login"]').show(); // Show Sign In
        $('#userDropdown .dropdown-item[href="/user/info"]').hide(); // Hide User Info
        $('#userDropdown .dropdown-item[href="/user/property-list"]').hide(); // Hide Property List
        $('#userDropdown .dropdown-item[href="/user/logout"]').hide(); // Hide Sign Out
    }

    $('#userDropdown .dropdown-item[href="/"]').on("click", onBtnLogoutClick);
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
                    window.location.href = "/";
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


});