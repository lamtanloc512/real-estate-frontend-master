// done
import {validateEmail, validatePhone, validateWebsite} from "../../js/common.js";

const gBASE_URL = `${config.apiUrl}/contractors`;
var gContractorId = 0;
var jwt = '';

const contractorTable = $('#construction-contractor-table').DataTable({
    destroy: true,
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'description' },
      { data: 'website' },
      { data: 'projects', defaultContent: '' },
      { data: 'address' },
      { data: 'email' },
      { data: 'fax', defaultContent: '' },
      { data: 'phone' },
      { data: 'note', defaultContent: '' },
      {
        data: null,
        render: function (data, type, row) {
          return `
            <img class="edit-class" data-id="${row.id}" src="https://cdn0.iconfinder.com/data/icons/glyphpack/45/edit-alt-512.png" style="width: 20px; cursor:pointer;">
            <img class="delete-class" data-id="${row.id}" src="https://cdn4.iconfinder.com/data/icons/complete-common-version-6-4/1024/trash-512.png" style="width: 20px; cursor:pointer;">
          `;
        }
      }
    ],
    order: [[0, 'desc']],  // Order by ID (descending)
    "sScrollX": '100%',
    scrollY: 200,
    responsive: true, // Make the table responsive
    autoWidth: false, // Prevent automatic width calculation
    fixedColumns: true // Fix columns on the left
  });

$(document).ready(function () {
    jwt = Cookies.get('jwt');
    loadContractorData();
});


async function loadContractorData() {
    $('#loading-spinner').toggle(true);

    callGetAllContractorApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var contractorData = {
        name: "",
        description: "",
        website: "",
        projects: "",
        address: "",
        email: "",
        fax: "",
        phone: "",
        note: ""
    }
    getFormData(contractorData);
    if(validateFormData(contractorData)){
        callCreateContractorApi(contractorData);
    }
});

$("#btn-update").click(function(){
    var contractorData = {
        name: "",
        description: "",
        website: "",
        projects: "",
        address: "",
        email: "",
        fax: "",
        phone: "",
        note: ""
    }
    getFormData(contractorData);
    if(validateFormData(contractorData)){
        callUpdateContractorByIdApi(gContractorId, contractorData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gContractorId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gContractorId = id;
    callGetContractorByIdApi(id);
});

$("#btn-confirm-delete").click(function(){
    callDeleteContractorByIdApi(gContractorId);
})

function callGetAllContractorApi(){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            contractorTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetContractorByIdApi(paramContractorId){
    $.ajax({
        url: `${gBASE_URL}/${paramContractorId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            loadContractorToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateContractorApi(paramObject){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Contractor created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateContractorByIdApi(contractorId, paramObject){
    $.ajax({
        url: `${gBASE_URL}/${contractorId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gContractorId = 0;
            alert('Contractor updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteContractorByIdApi(contractorId){
    $.ajax({
        url: `${gBASE_URL}/${contractorId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gContractorId = 0;
            alert('Contractor deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadContractorToForm(paramObject){
    $('#input-name').val(paramObject.name),
    $('#input-description').val(paramObject.description),
    $('#input-website').val(paramObject.website),
    $('#input-project').val(paramObject.projects),
    $('#input-address').val(paramObject.address),
    $('#input-email').val(paramObject.email),
    $('#input-fax').val(paramObject.fax),
    $('#input-phone').val(paramObject.phone),
    $('#input-note').val(paramObject.note)
}

function getFormData(paramObject){
    paramObject.name = $('#input-name').val().trim(),
    paramObject.description = $('#input-description').val().trim(),
    paramObject.website = $('#input-website').val().trim(),
    paramObject.projects = $('#input-project').val().trim(),
    paramObject.address = $('#input-address').val().trim(),
    paramObject.email = $('#input-email').val().trim(),
    paramObject.fax = $('#input-fax').val().trim(),
    paramObject.phone = $('#input-phone').val().trim(),
    paramObject.note = $('#input-note').val().trim()
}

function validateFormData(paramObject){
    if(!paramObject.name || !paramObject.email || !paramObject.phone || !paramObject.website){
        alert("Please full fill data!");
        return false;
    }
    if (!validateEmail(paramObject.email)){
        return false;
    }
    if (!validatePhone(paramObject.phone)){
        return false;
    }
    if(!validateWebsite(paramObject.website)){
        return false;
    }
    return true;
}