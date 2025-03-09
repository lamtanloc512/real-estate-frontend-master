// done
import { validateEmail, validatePhone } from "../../js/common.js";

const gBASE_URL = `${config.apiUrl}`;
var gUserId = 0;
var jwt = '';

const userTable = $('#user-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'fullName' },
        { data: 'username' },
        { data: 'email' },
        {
            data: null,
            className: "text-center",
            render: function (data, type, row) {
                // <img class="delete-class" data-id="${row.id}" src="https://cdn4.iconfinder.com/data/icons/complete-common-version-6-4/1024/trash-512.png" style="width: 20px;cursor:pointer;"></img>
                return `
                    <i class="fas fa-hand-holding text-info user-property-list" data-id="${row.id}" style="width: 30px;cursor:pointer;"></i>
                `;
            }
        }
    ],
    order: [[0, 'desc']],  // Order by ID (descending)
    "sScrollX": '100%',
    scrollY: 400,
    responsive: true, // Make the table responsive
    autoWidth: false, // Prevent automatic width calculation
    fixedColumns: true // Fix columns on the left
})

$(document).ready(function () {
    jwt = Cookies.get('jwt');
    if (!jwt) {
        window.location.href = '/admin';
    }
    loadUserData();
});


async function loadUserData() {
    $('#loading-spinner').toggle(true);

    let page = 1;
    const size = 10;
    let hasMoreData = true;

    while (hasMoreData) {
        try {
            const response = await fetch(`${gBASE_URL}/users?page=${page}&size=${size}`,
                {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                }
            );
            const data = await response.json();

            if (data && data.length > 0) {
                userTable.rows.add(data).draw();

                if (data.length < size) {
                    hasMoreData = false;
                }
                page += 1;
            }
            else {
                hasMoreData = false;
            }
        }
        catch (error) {
            hasMoreData = false;
        }
    }

    $('#loading-spinner').toggle(false);
}

$(document).on('click', '.user-property-list', function () {
    gUserId = $(this).data('id');
    loadUserProperties();
    $("#modal-user-properties").modal("show");
});

async function loadUserProperties() {
    if ($.fn.DataTable.isDataTable('#user-properties-table')) {
        $('#user-properties-table').DataTable().clear().destroy();
    }
    $('#user-properties-table thead tr').empty();

    const headers = ['ID', 'Property Title', 'Price', 'Property Description', 'Address', 'Property Type',
        'Acreage', 'Bedroom', 'Bathroom', 'Project', 'Approve Status'];

    headers.forEach(header => {
        $('#user-properties-table thead tr').append(`<th>${header}</th>`);
    });

    const userPropertiesTable = $('#user-properties-table').DataTable({
        destroy: true,
        columns: [
            { data: 'id' },
            { data: 'title' },
            { data: 'price' },
            { data: 'description' },
            {
                data: null,
                render: function (data, type, row) {
                    return `${row.address}, ${row.ward}, ${row.district}, ${row.province}`;
                }
            },
            { data: 'type' },
            { data: 'acreage' },
            { data: 'bedroom' },
            { data: 'bath' },
            {
                data: null,
                render: function (data, type, row) {
                    return `${row.project.name}`
                }
            },
            { data: 'approveStatus' }
        ],
        searching: false,
        order: [[0, 'desc']],  // Order by ID (descending)
        "sScrollX": '100%',
        scrollY: 200,
        responsive: true, // Make the table responsive
        autoWidth: false, // Prevent automatic width calculation
        fixedColumns: true,
    });

    await $.ajax({
        url: `${gBASE_URL}/realestate/by-user/${gUserId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            if (res && res.length > 0) {
                userPropertiesTable.rows.add(res).draw();
            }
        },
        error: function (err) {
            alert("Failed to load user properties.");
        }
    });
}
