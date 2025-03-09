// done
const gBASE_URL = `${config.apiUrl}/utilities`;
const gFILE_BASE_URL = `${config.apiUrl}/images/upload`;
var gUtilityId = 0;
var jwt = '';

const utilitiesTable = $('#utilities-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'description' },
        { 
            data: null,
            render: function(data, type, row){
                if (row.photo){
                    return `<img src="${row.photo}" alt="" style="width: 70px;">`;
                }
                return "";
            }
        },
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
    loadUtilityData();
});


async function loadUtilityData() {
    $('#loading-spinner').toggle(true);

    callGetAllUtilityApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var utilityData = {
        name: "",
        description: "",
        photo: ""
    }
    getFormData(utilityData);
    if (validateFormData(utilityData)) {
        saveUtility(null, utilityData);
    }
});

$("#btn-update").click(function () {
    var utilityData = {
        name: "",
        description: "",
        photo: ""
    }
    getFormData(utilityData);
    if (validateFormData(utilityData)) {
        saveUtility(gUtilityId, utilityData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gUtilityId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gUtilityId = id;
    callGetUtilityByIdApi(id);
});

$("#btn-confirm-delete").click(function () {
    callDeleteUtilityByIdApi(gUtilityId);
})

function callGetAllUtilityApi() {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            utilitiesTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetUtilityByIdApi(paramUtilityId) {
    $.ajax({
        url: `${gBASE_URL}/${paramUtilityId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            loadUtilityToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateUtilityApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Utility created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function saveUtility(utilityId, paramObject){
    const files = document.getElementById('input-photo').files;
    const formImageData = new FormData();

    if(files.length !== 0){
        for (let i = 0; i < files.length; i++) {
            formImageData.append('files', files[i]); // Append each file with the same key
        }

        fetch(`${gFILE_BASE_URL}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`
            },
            body: formImageData,
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json(); // Parse JSON response
            })
            .then(data => {
                // Display the uploaded file URLs
                const uploadedUrls = data.map(fileInfo => fileInfo.url).join('\n');
                paramObject.photo = `${uploadedUrls}`;
                if(!utilityId){
                    callCreateUtilityApi(paramObject);
                }
                else{
                    callUpdateUtilityByIdApi(utilityId, paramObject);
                }                
            })
            .catch(error => {
                alert("Error uploading files. Please try again.");
            });
    }
    else{
        if(!utilityId){
            callCreateUtilityApi(paramObject);
        }
        else{
            paramObject.photo = gSelectedPhoto;
            callUpdateUtilityByIdApi(utilityId, paramObject);
        } 
    }
}

function callUpdateUtilityByIdApi(utilityId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/${utilityId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gUtilityId = 0;
            alert('Utility updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteUtilityByIdApi(utilityId) {
    $.ajax({
        url: `${gBASE_URL}/${utilityId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gUtilityId = 0;
            alert('Utility deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

var gSelectedPhoto = "";
function loadUtilityToForm(paramObject) {
    $('#input-name').val(paramObject.name);
    $('#input-description').val(paramObject.description);
    if (paramObject.photo) {
        const imgPreview = $('#photo-preview');
        // Set the source of the image to the file's data URL
        gSelectedPhoto = paramObject.photo;
        imgPreview.attr('src', paramObject.photo);
        // Make the image visible
        imgPreview.show();
    }
}

function getFormData(paramObject) {
    paramObject.name = $('#input-name').val().trim();
    paramObject.description = $('#input-description').val().trim();
    $('#input-photo')[0].files[0];
}

function validateFormData(paramObject) {
    if (!paramObject.name) {
        alert("Please full fill data!");
        return false;
    }
    return true;
}