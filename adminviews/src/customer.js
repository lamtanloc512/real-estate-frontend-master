// done
import { validateEmail, validatePhone } from "../../js/common.js";

const gBASE_URL = `${config.apiUrl}/customers`;
var gCustomerId = 0;
var jwt = '';

const customerTable = $('#customer-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'contactName' },
        { data: 'contactTitle' },
        { data: 'address' },
        { data: 'email' },
        { data: 'mobile' },
        { data: 'note' },
        {
            data: null,
            className: "text-center",
            render: function (data, type, row) {
                return `
                    <img class="delete-class" data-id="${row.id}" src="https://cdn4.iconfinder.com/data/icons/complete-common-version-6-4/1024/trash-512.png" style="width: 20px;cursor:pointer;">
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
    loadCustomerData();
});


async function loadCustomerData() {
    $('#loading-spinner').toggle(true);

    let page = 1;
    const size = 10;
    let hasMoreData = true;

    while (hasMoreData) {
        try {
            const response = await fetch(`${gBASE_URL}?page=${page}&size=${size}`,
                {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    }
                }
            );
            const data = (await response.json()).content;

            if (data && data.length > 0) {
                customerTable.rows.add(data).draw();

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

$('#btn-create-customer').click(function () {
    var customerData = {
        contactName: "",
        contactTitle: "",
        address: "",
        email: "",
        mobile: "",
        note: ""
    }
    getFormData(customerData);
    if (validateFormData(customerData)) {
        callCreateCustomerApi(customerData);
    }
});

$("#btn-update-customer").click(function () {
    var customerData = {
        contactName: "",
        contactTitle: "",
        address: "",
        email: "",
        mobile: "",
        note: ""
    }
    getFormData(customerData);
    if (validateFormData(customerData)) {
        callUpdateCustomerByIdApi(gCustomerId, customerData);
    }
})

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gCustomerId = id;
    $("#modal-delete-customer").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gCustomerId = id;
    callGetCustomerByIdApi(id);
});

$("#btn-confirm-delete-customer").click(function () {
    callDeleteCustomerByIdApi(gCustomerId);
})

function callGetCustomerByIdApi(paramCustomerId) {
    $.ajax({
        url: `${gBASE_URL}/${paramCustomerId}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        contentType: 'application/json',
        success: function (res) {
            loadCustomerToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateCustomerApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Customer created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateCustomerByIdApi(customerId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/${customerId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gCustomerId = 0;
            alert('Customer updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteCustomerByIdApi(customerId) {
    $.ajax({
        url: `${gBASE_URL}/${customerId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gCustomerId = 0;
            alert('Customer deleted successfully');
            $("#modal-delete-customer").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadCustomerToForm(paramObject) {
    $('#input-contact-name').val(paramObject.contactName),
        $('#input-contact-title').val(paramObject.contactTitle),
        $('#input-address').val(paramObject.address),
        $('#input-email').val(paramObject.email),
        $('#input-mobile').val(paramObject.mobile),
        $('#input-note').val(paramObject.note)
}

function getFormData(paramObject) {
    paramObject.contactName = $('#input-contact-name').val().trim();
    paramObject.contactTitle = $('#input-contact-title').val().trim();
    paramObject.address = $('#input-address').val().trim();
    paramObject.email = $('#input-email').val().trim();
    paramObject.mobile = $('#input-mobile').val().trim();
    paramObject.note = $('#input-note').val().trim();
}

function validateFormData(paramObject) {
    if (!paramObject.contactName || !paramObject.contactTitle || !paramObject.email || !paramObject.mobile) {
        alert("Please full fill data!");
        return false;
    }
    if (!validateEmail(paramObject.email)) {
        return false;
    }
    if (!validatePhone(paramObject.mobile)) {
        return false;
    }
    return true;
}