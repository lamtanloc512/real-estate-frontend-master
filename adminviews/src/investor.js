// done
import {validateEmail, validatePhone, validateWebsite} from "../../js/common.js";

const gBASE_URL = `${config.apiUrl}/investors`;
var gInvestorId = 0;
var jwt = '';

const investorTable = $('#investor-table').DataTable({
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
    if(!jwt){
        window.location.href = '/admin';
    }
    loadInvestorData();
});


async function loadInvestorData() {
    $('#loading-spinner').toggle(true);

    callGetAllInvestorApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var investorData = {
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
    getFormData(investorData);
    if(validateFormData(investorData)){
        callCreateInvestorApi(investorData);
    }
});

$("#btn-update").click(function(){
    var investorData = {
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
    getFormData(investorData);
    if(validateFormData(investorData)){
        callUpdateInvestorByIdApi(gInvestorId, investorData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gInvestorId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gInvestorId = id;
    callGetInvestorByIdApi(id);
});

$("#btn-confirm-delete").click(function(){
    callDeleteInvestorByIdApi(gInvestorId);
})

function callGetAllInvestorApi(){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            investorTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetInvestorByIdApi(paraminvestorId){
    $.ajax({
        url: `${gBASE_URL}/${paraminvestorId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function(res) {
            loadInvestorToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateInvestorApi(paramObject){
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Investor created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateInvestorByIdApi(investorId, paramObject){
    $.ajax({
        url: `${gBASE_URL}/${investorId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gInvestorId = 0;
            alert('Investor updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteInvestorByIdApi(investorId){
    $.ajax({
        url: `${gBASE_URL}/${investorId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gInvestorId = 0;
            alert('Investor deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadInvestorToForm(paramObject){
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