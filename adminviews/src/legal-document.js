// done
const gBASE_URL = `${config.apiUrl}/legal-documents`;
var gLegalDocId = 0;
var jwt = '';

const investorTable = $('#legal-document-table').DataTable({
    destroy: true,
    columns: [
      { data: 'id' },
      { data: 'name' },
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
    loadLegalDocData();
});


async function loadLegalDocData() {
    $('#loading-spinner').toggle(true);

    callGetAllInvestorApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var legalDocData = {
        name: ""
    }
    getFormData(legalDocData);
    if(validateFormData(legalDocData)){
        callCreateInvestorApi(legalDocData);
    }
});

$("#btn-update").click(function(){
    var legalDocData = {
        name: ""
    }
    getFormData(legalDocData);
    if(validateFormData(legalDocData)){
        callUpdateLegalDocumentByIdApi(gLegalDocId, legalDocData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gLegalDocId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gLegalDocId = id;
    callGetLegalDocumentByIdApi(id);
});

$("#btn-confirm-delete").click(function(){
    callDeleteLegalDocumentByIdApi(gLegalDocId);
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

function callGetLegalDocumentByIdApi(paramLegalDocId){
    $.ajax({
        url: `${gBASE_URL}/${paramLegalDocId}`,
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
            alert('Legal document created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateLegalDocumentByIdApi(legalDocId, paramObject){
    $.ajax({
        url: `${gBASE_URL}/${legalDocId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gLegalDocId = 0;
            alert('Legal document updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteLegalDocumentByIdApi(legalDocId){
    $.ajax({
        url: `${gBASE_URL}/${legalDocId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gLegalDocId = 0;
            alert('Legal document deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadInvestorToForm(paramObject){
    $('#input-name').val(paramObject.name)
}

function getFormData(paramObject){
    paramObject.name = $('#input-name').val().trim()
}

function validateFormData(paramObject){
    if(!paramObject.name){
        alert("Please full fill data!");
        return false;
    }
    return true;
}