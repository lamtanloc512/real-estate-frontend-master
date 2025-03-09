import {validateEmail, validatePhone} from "../../js/common.js";

const gBASE_URL = `${config.apiUrl}/employees`;
var gEmployeeId = 0;
var jwt = '';

const employeeTable = $('#employee-table').DataTable({
    destroy: true,  // Ensure the table is destroyed before reinitializing
    columns: [
        { data: 'employeeId' },  // ID
        {
            data: null,
            render: function (data, type, row) {
                // Full name (first + last)
                return `${row.firstName || ''} ${row.lastName || ''}`;
            }
        },
        { data: 'username' },  // Username
        {
            data: 'birthDate',
            render: function (data) {
                // Format birth date (e.g., "YYYY-MM-DD")
                return data ? new Date(data).toLocaleDateString() : '';
            }
        },
        { data: 'email' },  // Email
        { data: 'address' },  // Address
        { data: 'homePhone' },  // Home Phone
        { data: 'title' },  // Title
        { data: 'userLevel' },  // Level
        {
            data: null,
            render: function (data, type, row) {
                // Report To (manager's full name)
                const reportsTo = row.reportsTo ? `${row.reportsTo.firstName} ${row.reportsTo.lastName}` : '';
                return reportsTo;
            }
        },
        {
            data: 'photo',
            render: function (data) {
                // Photo (display as an image)
                return data ? `<img src="${data}" alt="Employee Photo" style="width: 50px; height: 50px;">` : '';
            }
        },
        {
            data: 'hireDate',
            render: function (data) {
                // Format hire date
                return data ? new Date(data).toLocaleDateString() : '';
            }
        },
        { data: 'notes' },  // Notes (can be HTML content)
        {
            data: null,
            className: "text-center",
            render: function (data, type, row) {
                // Action buttons (Edit and Delete)
                return `
                    <img class="edit-class" data-id="${row.employeeId}" src="https://cdn0.iconfinder.com/data/icons/glyphpack/45/edit-alt-512.png" style="width: 20px; cursor:pointer;">
                    <img class="delete-class" data-id="${row.employeeId}" src="https://cdn4.iconfinder.com/data/icons/complete-common-version-6-4/1024/trash-512.png" style="width: 20px; cursor:pointer;">
                `;
            }
        }
    ],
    order: [[0, 'desc']],  // Order by ID (descending)
    "sScrollX": '100%',
    scrollY: 200
});


$(document).ready(function () {
    jwt = Cookies.get('jwt');
    if(!jwt){
        window.location.href = '/admin';
    }
    loadEmployeeData();
});


async function loadEmployeeData() {
    $('#loading-spinner').toggle(true);

    callGetAllEmployeeApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create-employee').click(function () {
    var employeeData = {
        lastName: "",
        firstName: "",
        homePhone: "",
        email: "",
        reportsTo: {employeeId:""},
        title: "",
        role:{id:""},
        userLevel:"",
        hireDate:"",
        notes:"",
        address:"",
        birthDate:"",
        password:"Passw@rd"
    }
    getFormData(employeeData);
    if(validateFormData(employeeData)){
        callCreateEmployeeApi(employeeData);
    }
});

$("#btn-update-employee").click(function(){
    var employeeData = {
        lastName: "",
        firstName: "",
        homePhone: "",
        email: "",
        reportsTo: {employeeId:""},
        title: "",
        role:{id:""},
        userLevel:"",
        hireDate:"",
        notes:"",
        address:"",
        birthDate:""
    }
    getFormData(employeeData);
    if(validateFormData(employeeData)){
        callUpdateEmployeeByIdApi(gEmployeeId, employeeData);
    }
})

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gEmployeeId = id;
    $("#modal-delete-employee").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gEmployeeId = id;
    callGetEmployeeByIdApi(id);
});

$("#btn-confirm-delete-employee").click(function(){
    callDeleteEmployeeByIdApi(gEmployeeId);
})

function callGetAllEmployeeApi(){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            employeeTable.rows.add(res).draw();
            $.each(res, function (index, cls) {
				$("#select-report-to").append(
					$('<option>', {
						value: cls.employeeId,
						text: `${cls.firstName} ${cls.lastName}`
					})
				);
			});
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetEmployeeByIdApi(paramEmployeeId){
    $.ajax({
        url: `${gBASE_URL}/${paramEmployeeId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            loadEmployeeToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateEmployeeApi(paramObject){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Employee created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateEmployeeByIdApi(employeeId, paramObject){
    $.ajax({
        url: `${gBASE_URL}/${employeeId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gEmployeeId = 0;
            alert('Employee updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteEmployeeByIdApi(employeeId){
    $.ajax({
        url: `${gBASE_URL}/${employeeId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gEmployeeId = 0;
            alert('Employee deleted successfully');
            $("#modal-delete-employee").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadEmployeeToForm(paramObject){
    $('#input-first-name').val(paramObject.firstName);
    $('#input-last-name').val(paramObject.lastName);
    $('#input-username').val(paramObject.username);
    $('#input-username').prop('readonly', true);
    const birthDate = paramObject.birthDate ? paramObject.birthDate.split('T')[0] : '';
    $('#input-birth-date').val(birthDate);
    $('#input-email').val(paramObject.email);
    $('#input-address').val(paramObject.address);
    $('#input-home-phone').val(paramObject.homePhone);
    $('#input-job-title').val(paramObject.title);
    $('#input-job-level').val(paramObject.userLevel);
    const reportsTo = paramObject.reportsTo ? paramObject.reportsTo.employeeId : null;
    $('#select-report-to').val(reportsTo);
    $('#select-role').val(paramObject.role.id);
    const hireDate = paramObject.hireDate ? paramObject.hireDate.split('T')[0] : '';
    $('#input-hire-date').val(hireDate);
    $('#input-note').val(paramObject.notes);
    $('#input-password').prop('readonly', false);
}

function getFormData(paramObject){
    paramObject.firstName = $('#input-first-name').val().trim();
    paramObject.lastName = $('#input-last-name').val().trim();
    paramObject.username = $('#input-username').val().trim();
    paramObject.birthDate = $('#input-birth-date').val() + 'T00:00:00';
    paramObject.email = $('#input-email').val().trim();
    paramObject.address = $('#input-address').val().trim();
    paramObject.homePhone = $('#input-home-phone').val();
    paramObject.title = $('#input-job-title').val().trim();
    paramObject.userLevel = $('#input-job-level').val();
    if($('#select-report-to').val()){
        paramObject.reportsTo.employeeId = $('#select-report-to').val();
    }
    else{
        paramObject.reportsTo = null;
    }
    
    paramObject.role.id = $('#select-role').val();
    paramObject.hireDate = $('#input-hire-date').val() + 'T00:00:00';
    paramObject.notes = $('#input-note').val();
    if($('#input-password').val()){
        paramObject.password = $('#input-password').val();
    }
}

function validateFormData(paramObject){
    if(!paramObject.firstName || !paramObject.lastName || !paramObject.username || 
        !paramObject.email || !paramObject.homePhone || !paramObject.role)
    {
        alert("Please full fill data!");
        return false;
    }
    if (!validateEmail(paramObject.email)){
        return false;
    }
    if (!validatePhone(paramObject.homePhone)){
        return false;
    }

    // Validate Date of Birth: should be less than now - 20 years
    let birthDate = new Date(paramObject.officeId); // 'officeId' stores the birth date
    let currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    let m = currentDate.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--; // Adjust age if the birthday hasn't occurred yet this year
    }

    if (age < 20) {
        alert("You must be at least 20 years old.");
        return false;
    }

    // Validate Hire Date: should be less than the current date
    let hireDate = new Date(paramObject.hireDate);
    if (hireDate >= currentDate) {
        alert("Hire Date cannot be in the future.");
        return false;
    }

    return true;
}