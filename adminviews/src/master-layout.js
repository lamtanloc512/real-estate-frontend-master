// done
const gBASE_URL = `${config.apiUrl}/master-layout`;
const gPROJ_BASE_URL = `${config.apiUrl}/projects`;
const gFILE_BASE_URL = `${config.apiUrl}/images/upload`;
var gMasterLayoutId = 0;
var jwt = '';

const masterLayoutTable = $('#master-layout-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'description' },
        { data: 'acreage' },
        { 
            data: null,
            render: function(data, type, row){
                return `<img src="${row.photo}" alt="" style="width: 70px;">`;
            }
        },
        { 
            data: null,
            render: function(data, type, row) {
                return `${row.project.name}`;
            }
        },
        { data: 'apartmentList' },
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
    loadMasterLayoutData();
    callGetProjectListApi();
});


async function loadMasterLayoutData() {
    $('#loading-spinner').toggle(true);

    callGetAllMasterLayoutApi();

    $('#loading-spinner').toggle(false);
}

function callGetProjectListApi() {
    $.ajax({
        url: `${gPROJ_BASE_URL}`,
        type: 'GET',
        dataType: 'json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (data) {
            loadProjectData(data);
        },
        error: function (xhr, status, error) {
        }
    })
}

function loadProjectData(projectData){
    const $projectDropdown = $('#select-project');
    projectData.forEach(project => {
        const $item = $(
            `<option value="${project.id}">${project.name}</option>`
        )
        $projectDropdown.append($item);
    });
}

$('#btn-create').click(function () {
    var masterLayoutData = {
        name: "",
        description: "",
        acreage: "",
        apartmentList: "",
        photo: "",
        project: ""
    }
    getFormData(masterLayoutData);
    if (validateFormData(masterLayoutData)) {
        saveMasterLayout(null, masterLayoutData);
    }
});

$("#btn-update").click(function () {
    var masterLayoutData = {
        name: "",
        description: "",
        acreage: "",
        apartmentList: "",
        photo: "",
        project: ""
    }
    getFormData(masterLayoutData);
    if (validateFormData(masterLayoutData)) {
        saveMasterLayout(gMasterLayoutId, masterLayoutData);
    }
});

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gMasterLayoutId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gMasterLayoutId = id;
    callGetMasterLayoutByIdApi(id);
});

$("#btn-confirm-delete").click(function () {
    callDeleteMasterLayoutByIdApi(gMasterLayoutId);
})

function callGetAllMasterLayoutApi() {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            masterLayoutTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetMasterLayoutByIdApi(paramMasterLayoutId) {
    $.ajax({
        url: `${gBASE_URL}/${paramMasterLayoutId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            loadMasterLayoutToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateMasterLayoutApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(paramObject),
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            alert('Master layout created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function saveMasterLayout(masterLayoutId, paramObject){
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
                if(!masterLayoutId){
                    callCreateMasterLayoutApi(paramObject);
                }
                else{
                    callUpdateMasterLayoutByIdApi(masterLayoutId, paramObject);
                }                
            })
            .catch(error => {
                alert("Error uploading files. Please try again.");
            });
    }
    else{
        if(!masterLayoutId){
            callCreateMasterLayoutApi(paramObject);
        }
        else{
            paramObject.photo = gSelectedPhoto;
            callUpdateMasterLayoutByIdApi(masterLayoutId, paramObject);
        } 
    }
}

function callUpdateMasterLayoutByIdApi(masterLayoutId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/${masterLayoutId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gMasterLayoutId = 0;
            alert('Master layout updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteMasterLayoutByIdApi(masterLayoutId) {
    $.ajax({
        url: `${gBASE_URL}/${masterLayoutId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gMasterLayoutId = 0;
            alert('Master layout deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

var gSelectedPhoto = "";
function loadMasterLayoutToForm(paramObject) {
    $('#input-name').val(paramObject.name);
    $('#input-description').val(paramObject.description);
    $('#input-acreage').val(paramObject.acreage);
    $('#input-apartment-list').val(paramObject.apartmentList);
    // $('#input-photo')[0].files[0].name;
    $('#select-project').val(paramObject.project.id);

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
    paramObject.acreage = $('#input-acreage').val().trim();
    paramObject.apartmentList = $('#input-apartment-list').val().trim();
    $('#input-photo')[0].files[0];
    paramObject.project = {id: $('#select-project').val()};
}

function validateFormData(paramObject) {
    if (!paramObject.name || !paramObject.project) {
        alert("Please full fill data!");
        return false;
    }
    return true;
}