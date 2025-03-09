// done
const gBASE_URL = `${config.apiUrl}/region-links`;
const gFILE_BASE_URL = `${config.apiUrl}/images/upload`;
var gRegionLinkId = 0;
var jwt = '';

const regionLinkTable = $('#region-link-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'description' },
        { data: 'address' },
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
    loadregionLinkData();
});


async function loadregionLinkData() {
    $('#loading-spinner').toggle(true);

    callGetAllRegionLinkApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var regionLinkData = {
        name: "",
        description: "",
        address: "",
        photo: ""
    }
    getFormData(regionLinkData);
    if (validateFormData(regionLinkData)) {
        saveRegionLink(null, regionLinkData);
    }
});

$("#btn-update").click(function () {
    var regionLinkData = {
        name: "",
        description: "",
        address: "",
        photo: ""
    }
    getFormData(regionLinkData);
    if (validateFormData(regionLinkData)) {
        saveRegionLink(gRegionLinkId, regionLinkData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gRegionLinkId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gRegionLinkId = id;
    callGetRegionLinkByIdApi(id);
});

$("#btn-confirm-delete").click(function () {
    callDeleteRegionLinkByIdApi(gRegionLinkId);
})

function callGetAllRegionLinkApi() {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            regionLinkTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetRegionLinkByIdApi(paramRegionLinkId) {
    $.ajax({
        url: `${gBASE_URL}/${paramRegionLinkId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            loadRegionLinkToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateRegionLinkApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(paramObject),
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            alert('Region link created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function saveRegionLink(regionLinkId, paramObject){
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
                if(!regionLinkId){
                    callCreateRegionLinkApi(paramObject);
                }
                else{
                    callUpdateRegionLinkByIdApi(regionLinkId, paramObject);
                }                
            })
            .catch(error => {
                alert("Error uploading files. Please try again.");
            });
    }
    else{
        if(!regionLinkId){
            callCreateRegionLinkApi(paramObject);
        }
        else{
            paramObject.photo = gSelectedPhoto;
            callUpdateRegionLinkByIdApi(regionLinkId, paramObject);
        } 
    }
}

function callUpdateRegionLinkByIdApi(regionLinkId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/${regionLinkId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gRegionLinkId = 0;
            alert('Region link updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteRegionLinkByIdApi(regionLinkId) {
    $.ajax({
        url: `${gBASE_URL}/${regionLinkId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gRegionLinkId = 0;
            alert('Region link deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

var gSelectedPhoto = "";
function loadRegionLinkToForm(paramObject) {
    $('#input-name').val(paramObject.name);
    $('#input-description').val(paramObject.description);
    $('#input-address').val(paramObject.address);
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
    paramObject.address = $('#input-address').val().trim();
    $('#input-photo')[0].files[0];
}

function validateFormData(paramObject) {
    if (!paramObject.name) {
        alert("Please full fill data!");
        return false;
    }
    return true;
}