import { appendDropdownDataThrowApi } from '../../js/common.js';

const gBASE_URL = `${config.apiUrl}`;
var gPropertyId = 0;
var gProvinceSelectElement = $("#select-province");
var gDistrictSelectElement = $("#select-district");
var gWardsSelectElement = $("#select-ward");
var gProvinceList = [];
var gDistrictList = [];
var gWardList = [];
var gSelectedProvinceData = "";
var gSelectProvinceId = 0;
var gProvinceSelectedText = "";
var gSelectedDistrictData = "";
var gDistrictName = "";
var gDistrictPrefix = "";
var gDistrictId = 0;
var gSelectedWardData = "";
var gWardName = "";
var gWardPrefix = "";
var gWardId = 0;
var jwt = '';
var createdBy = '';
var gPhoto='';

const propertyTable = $('#property-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'title' },
        { data: 'price' },
        { data: 'description' },
        {
            data: null,
            render: function (data, type, row) {
                let wardName = row.ward && row.ward.name ? row.ward.name : '';
                let districtName = row.district && row.district.name ? row.district.name : '';
                let provinceName = row.province && row.province.name ? row.province.name : '';
                return `${row.address}, ${wardName}, ${districtName}, ${provinceName}`;
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
        { data: 'approveStatus' },
        {
            data: null,
            className: "text-center",
            render: function (data, type, row) {
                return `
                    <img class="edit-class" data-id="${row.id}" src="https://cdn0.iconfinder.com/data/icons/glyphpack/45/edit-alt-512.png" style="width: 20px;cursor:pointer;">
                    <img class="delete-class" data-id="${row.id}" src="https://cdn4.iconfinder.com/data/icons/complete-common-version-6-4/1024/trash-512.png" style="width: 20px;cursor:pointer;">
                `;
            }
        }
    ],
    order: [[0, 'desc']],  // Order by ID (descending)
    "sScrollX": '100%',
    scrollY: 200,
    responsive: true, // Make the table responsive
    autoWidth: false, // Prevent automatic width calculation
    fixedColumns: true, // Fix columns on the left
    processing: true,  // Show processing indicator
    serverSide: true,  // Enable server-side processing
    ajax: function (data, callback, settings) {
        // Extract pagination data
        let page = settings._iDisplayStart / settings._iDisplayLength;
        let size = settings._iDisplayLength;

        loadPropertyData(page, size).then(response => {
            if (response && response.content) {
                callback({
                    draw: settings.iDraw,
                    recordsTotal: response.totalElements,  // Total items (for pagination)
                    recordsFiltered: response.totalElements,  // Filtered items (for search purposes)
                    data: response.content  // Data for the current page
                });
            } else {
                callback({
                    draw: settings.iDraw,
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: []
                });
            }
        }).catch(error => {
            callback({
                draw: settings.iDraw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
            });
        });
    }
})

$(document).ready(function () {
    jwt = Cookies.get('jwt');
    if (!jwt) {
        window.location.href = '/admin';
    }
    // load project data
    appendDropdownDataThrowApi(`${gBASE_URL}/projects`, $('#select-project'), jwt);
    callGetAllProvincesApi();
    // load legal document data
    appendDropdownDataThrowApi(`${gBASE_URL}/legal-documents`, $('#select-legal-document'), jwt);
});

async function loadPropertyData(page, size) {
    $('#loading-spinner').toggle(true);

    try {
        // const response = await fetch(`${gBASE_URL}/realestate?page=${page}&size=${size}`);
        const response = await fetch(`${gBASE_URL}/realestate/filter?approveStatus=Approved&page=${page}&size=${size}`);
        const data = await response.json();

        $('#loading-spinner').toggle(false);
        return data;
    }
    catch (error) {
        $('#loading-spinner').toggle(false);
    }
}

$('#btn-create').click(function () {
    var propertyData = {
        title: "",
        description: "",
        price: "",
        address: "",
        province: { id: "" },
        district: { id: "" },
        ward: { id: "" },
        type: "",
        project: { id: "" },
        acreage: "",
        bedroom: "",
        bath: "",
        balcony: "",
        numberFloors: "",
        totalFloors: "",
        legalDocument: { id: "" },
        createdBy: '',
        photo: ''
    }

    getFormData(propertyData);
    if (validateFormData(propertyData)) {
        let userId = localStorage.getItem('userId');
        const formImageData = new FormData();
        const files = document.getElementById('image').files;

        if (files.length === 0) {
            alert("Please select at least one image before submitting.");
            return;
        }
        else {
            propertyData.createdBy = userId;
            for (let i = 0; i < files.length; i++) {
                formImageData.append('files', files[i]); // Append each file with the same key
            }

            fetch(`${gBASE_URL}/images/upload`, {
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
                    propertyData.photo = uploadedUrls;
                    callCreatePropertyApi(propertyData);
                })
                .catch(error => {
                    alert("Error uploading files. Please try again.");
                });
        }

    }
});

$("#btn-update").click(function () {
    var propertyData = {
        title: "",
        description: "",
        price: "",
        address: "",
        province: { id: "" },
        district: { id: "" },
        ward: { id: "" },
        type: "",
        project: { id: "" },
        acreage: "",
        bedroom: "",
        bath: "",
        balcony: "",
        numberFloors: "",
        totalFloors: "",
        legalDocument: { id: "" },
        photo: gPhoto
    }

    getFormData(propertyData);
    if (validateFormData(propertyData)) {
        callUpdatePropertyByIdApi(gPropertyId, propertyData);
    }
})

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gPropertyId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gPropertyId = id;
    callGetPropertyByIdApi(id);
});

$("#btn-confirm-delete").click(function () {
    callDeletePropertyByIdApi(gPropertyId);
})

$('#btn-approve').click(function () {
    loadApprovalList();
    $("#modal-approval-list").modal("show");
})

$(document).on('click', '.approve-class', function () {
    const propertyId = $(this).data('id');
    callUpdatePropertyApprovalStatus(propertyId, "Approved");
})

$(document).on('click', '.decline-class', function () {
    const propertyId = $(this).data('id');
    callUpdatePropertyApprovalStatus(propertyId, "Declined");
})

gProvinceSelectElement.on("change", function () {
    gDistrictSelectElement.html("<option disabled selected value>Select District</option>");
    gSelectedProvinceData = $(this).val();
    gSelectProvinceId = gSelectedProvinceData.split(".")[0];
    var bProvinceCode = gSelectedProvinceData.split(".")[1];

    gProvinceSelectedText = $(this).find("option:selected").text(); // Text của option được chọn

    getDistrictsByProvinceCode(gDistrictSelectElement, bProvinceCode);
});

gDistrictSelectElement.on("change", function () {
    gWardsSelectElement.html("<option  disabled selected value>Select Ward</option>");
    gSelectedDistrictData = $(this).val();
    if (gSelectedDistrictData) {
        gDistrictId = gSelectedDistrictData.split(".")[0];
        gDistrictName = gSelectedDistrictData.split(".")[1];
        gDistrictPrefix = gSelectedDistrictData.split(".")[2];

        getWardsByDistrictName(gDistrictName);
    }
    else {
        gWardsSelectElement.html("<option disabled selected value>Select Ward</option>");
    }
});

gWardsSelectElement.on("change", function () {
    gSelectedWardData = $(this).val();
    if (gSelectedWardData) {
        gWardId = gSelectedWardData.split(".")[0];
        gWardName = gSelectedWardData.split(".")[1];
        gWardPrefix = gSelectedWardData.split(".")[2];
    }
});

// Attach an event listener to the file input
document.getElementById('image').addEventListener('change', function (event) {
    const files = event.target.files;
    const fileNameElement = document.getElementById('file-name');
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    let fileNames = [];
    let valid = true;

    for (let i = 0; i < files.length; i++) {
        if (!validImageTypes.includes(files[i].type)) {
            valid = false;
            break;
        }
        fileNames.push(files[i].name);
    }

    if (!valid) {
        fileNameElement.textContent = "Error: Please select only image files (jpg, png, gif, webp)";
        fileNameElement.style.color = "red";
        event.target.value = ""; // Reset file input
    } else {
        fileNameElement.textContent = fileNames.join(', ');
        fileNameElement.style.color = "black";
    }
});

function getDistrictsByProvinceCode(pDistrictSelectElement, pProvinceCode) {
    $.ajax({
        url: `${gBASE_URL}/districts?provinceCode=${pProvinceCode}`,
        method: "GET",
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (pObjRes) {
            loadDataToDistrictSelect(pDistrictSelectElement, pObjRes);
            gDistrictList = pObjRes;
        },
        error: function (pXhrObj) {
        }
    });
}

function loadDataToDistrictSelect(pDistrictSelectElement, pDistrictList) {
    if (pDistrictList.length > 0) {
        pDistrictSelectElement.prop("disabled", false);

        for (let i = 0; i < pDistrictList.length; i++) {
            var bDistrictOption = $("<option/>");
            bDistrictOption.prop("value", pDistrictList[i].id + "." + pDistrictList[i].name + "." + pDistrictList[i].prefix);
            bDistrictOption.prop("text", pDistrictList[i].name);
            pDistrictSelectElement.append(bDistrictOption);
        };
    } else {
        pDistrictSelectElement.prop("disabled", "disabled");
    }
}

async function loadApprovalList() {
    // Clear previous headers and data if the DataTable already exists
    if ($.fn.DataTable.isDataTable('#approval-table')) {
        $('#approval-table').DataTable().clear().destroy();
    }
    $('#approval-table thead tr').empty();

    const headers = ['ID', 'Property Title', 'Price', 'Property Description', 'Address', 'Property Type',
        'Acreage', 'Bedroom', 'Bathroom', 'Project', 'Approve Status', 'Action'];

    headers.forEach(header => {
        $('#approval-table thead tr').append(`<th>${header}</th>`);
    });

    const approvalTable = $('#approval-table').DataTable({
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
            { data: 'approveStatus' },
            {
                data: null,
                className: "text-center",
                render: function (data, type, row) {
                    return `
                    <img class="approve-class" data-id="${row.id}" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Approve_icon.svg/2048px-Approve_icon.svg.png" style="width: 20px;cursor:pointer;">
                    <img class="decline-class" data-id="${row.id}" src="https://cdn-icons-png.freepik.com/256/11695/11695444.png?semt=ais_hybrid" style="width: 20px;cursor:pointer;">
                `;
                }
            }
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
        url: `${gBASE_URL}/realestate/filter?approveStatus=Pending`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            if (res.content && res.content.length > 0) {
                approvalTable.rows.add(res.content).draw();
            } else {
                alert("No order detail data available for this order.");
            }
        },
        error: function (err) {
            alert("Failed to load customer orders.");
        }
    });
}

function callGetPropertyByIdApi(paramPropertyId) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${paramPropertyId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            loadPropertyToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreatePropertyApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}/realestate`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Property created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdatePropertyByIdApi(propertyId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gPropertyId = 0;
            alert('Property updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeletePropertyByIdApi(propertyId) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gPropertyId = 0;
            alert('Property deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadPropertyToForm(paramObject) {
    $('#input-property-title').val(paramObject.title);
    $('#input-description').val(paramObject.description);
    $('#input-price').val(paramObject.price);
    $('#input-address').val(paramObject.address);
    $("#select-province").val(`${paramObject.province.id}.${paramObject.province.code}`).trigger('change');
    // Use a timeout to ensure the district dropdown has loaded before setting its value
    setTimeout(() => {
        if (`${paramObject.district.id}.${paramObject.district.name}.${paramObject.district.prefix}`) {
            const districtValue = `${paramObject.district.id}.${paramObject.district.name}.${paramObject.district.prefix}`;
            $("#select-district").val(districtValue).trigger('change');
        }
        // $("#select-district").val(`${paramObject.district.id}.${paramObject.district.name}.${paramObject.district.prefix}`).trigger('change');
    }, 2000);
    // Use another timeout to ensure the ward dropdown has loaded before setting its value
    setTimeout(() => {
        if (paramObject.ward && paramObject.ward.id && paramObject.ward.name && paramObject.ward.prefix) {
            const wardValue = `${paramObject.ward.id}.${paramObject.ward.name}.${paramObject.ward.prefix}`;
            $("#select-ward").val(wardValue).trigger('change');
        }
    }, 5000);
    $('#select-property-type').val(paramObject.type);
    $('#input-acreage').val(paramObject.acreage);
    $('#input-bedroom').val(paramObject.bedroom);
    $('#input-bathroom').val(paramObject.bath);
    $('#input-balcony').val(paramObject.balcony);
    $('#input-number-floors').val(paramObject.numberFloors);
    $('#input-total-floors').val(paramObject.totalFloors);
    $('#select-legal-document').val(paramObject.legalDocument ? paramObject.legalDocument.id : '');
    $('#select-project').val(paramObject.project.id);
    gPhoto = paramObject.photo;
}

function callGetAllProvincesApi() {
    $.ajax({
        url: `${gBASE_URL}/provinces`,
        method: "GET",
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (pObjRes) {
            loadDataToProvinceSelect(gProvinceSelectElement, pObjRes);
            gProvinceList = pObjRes;
        },
        error: function (pXhrObj) {
        }
    });
}

function loadDataToProvinceSelect(pSelectElement, pProvinceList) {
    for (let i = 0; i < pProvinceList.length; i++) {
        var bProvinceOption = $("<option/>");
        bProvinceOption.prop("value", pProvinceList[i].id + "." + pProvinceList[i].code);
        bProvinceOption.prop("text", pProvinceList[i].name);
        pSelectElement.append(bProvinceOption);
    };
}

function getWardsByDistrictName(pDistrictName) {
    $.ajax({
        url: `${gBASE_URL}/wards?districtName=${pDistrictName}`,
        method: "GET",
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (pObjRes) {
            loadDataToWardSelect(gWardsSelectElement, pObjRes);
            gWardList = pObjRes;
        },
        error: function (pXhrObj) {
        }
    });
}

function loadDataToWardSelect(pWardSelectElement, pWardList) {
    if (pWardList.length > 0) {
        pWardSelectElement.prop("disabled", false);

        for (let i = 0; i < pWardList.length; i++) {
            var bWardOption = $("<option/>");
            bWardOption.prop("value", pWardList[i].id + "." + pWardList[i].name + "." + pWardList[i].prefix);
            bWardOption.prop("text", pWardList[i].name);
            pWardSelectElement.append(bWardOption);
        };
    } else {
        pWardSelectElement.prop("disabled", "disabled");
    }
}

function callUpdatePropertyApprovalStatus(propertyId, paramStatus) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}/approve?status=${paramStatus}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gPropertyId = 0;
            alert(`Property ${paramStatus} successfully`);
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function getFormData(paramObject) {
    paramObject.title = $('#input-property-title').val().trim();
    paramObject.description = $('#input-description').val().trim();
    paramObject.price = $('#input-price').val().trim();
    paramObject.address = $('#input-address').val().trim();
    paramObject.province.id = gSelectProvinceId;
    paramObject.district.id = gDistrictId;
    paramObject.ward.id = gWardId;
    paramObject.type = $('#select-property-type').val();
    paramObject.project.id = $('#select-project').val();
    paramObject.acreage = $('#input-acreage').val().trim();
    paramObject.bedroom = $('#input-bedroom').val().trim();
    paramObject.bath = $('#input-bathroom').val().trim();
    paramObject.balcony = $('#input-balcony').val().trim();
    paramObject.numberFloors = $('#input-number-floors').val().trim();
    paramObject.totalFloors = $('#input-total-floors').val().trim();
    paramObject.legalDocument.id = $('#select-legal-document').val();
}

function validateFormData(paramObject) {
    if (!paramObject.title || !paramObject.price || !paramObject.legalDocument.id ||
        !paramObject.acreage || !paramObject.bedroom || !paramObject.bath || !paramObject.address ||
        !paramObject.province.id || !paramObject.district.id || !paramObject.ward.id) {
        alert("Please full fill data!");
        return false;
    }
    return true;
}