import { appendDropdownDataThrowApi } from '../../js/common.js';

const gBASE_URL = `${config.apiUrl}`;
var gProjectId = 0;
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


const propertyTable = $('#project-table').DataTable({
    destroy: true,
    columns: [
        { data: 'id' },
        { data: 'name' },
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
        { data: 'acreage' },
        { data: 'constructArea' },
        { 
            data: null,
            render: function (data, type, row) {
                return row.constructionContractor && row.constructionContractor.name ? row.constructionContractor.name : 'N/A';
            } 
        },
        {
            data: null,
            render: function (data, type, row) {
                return row.investor && row.investor.name ? row.investor.name : 'N/A';
            }
        },
        { data: 'numBlock' },
        { data: 'numFloors' },
        { data: 'slogan' },
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
})

$(document).ready(function () {
    jwt = Cookies.get('jwt');
    if(!jwt){
        window.location.href = '/admin';
    }
    
    callGetAllProvincesApi();
    appendDropdownDataThrowApi(`${gBASE_URL}/contractors`, $('#select-construction-contractor'), jwt);
    appendDropdownDataThrowApi(`${gBASE_URL}/investors`, $('#select-investor'), jwt);
    appendDropdownDataThrowApi(`${gBASE_URL}/region-links`, $('#select-region-link'), jwt);
    loadProjectData();
});

async function loadProjectData() {
    $('#loading-spinner').toggle(true);

    callGetAllProjectsApi();

    $('#loading-spinner').toggle(false);
}

$('#btn-create').click(function () {
    var projectData = {
        name: "",
        description: "",
        address: "",
        province: { id: "" },
        district: { id: "" },
        ward: { id: "" },
        acreage: "",
        constructionContractor: { id: "" },
        constructArea: "",
        investor: { id: "" },
        numBlock: "",
        numFloors: "",
        slogan: "",
    }

    getFormData(projectData);
    if (validateFormData(projectData)) {
        callCreateProjectApi(projectData);
    }
});

$("#btn-update").click(function () {
    var projectData = {
        name: "",
        description: "",
        address: "",
        province: { id: "" },
        district: { id: "" },
        ward: { id: "" },
        acreage: "",
        constructionContractor: { id: "" },
        constructArea: "",
        investor: { id: "" },
        numBlock: "",
        numFloors: "",
        slogan: "",
    }

    getFormData(projectData);
    if (validateFormData(projectData)) {
        callUpdateProjectByIdApi(gProjectId, projectData);
    }
})

$(document).on('click', '.delete-class', function () {
    const id = $(this).data('id');
    gProjectId = id;
    $("#modal-delete").modal("show");
});

$(document).on('click', '.edit-class', function () {
    const id = $(this).data('id');
    gProjectId = id;
    callGetProjectByIdApi(id);
});

$("#btn-confirm-delete").click(function () {
    callDeleteProjectByIdApi(gProjectId);
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
    if(gSelectedWardData){
        gWardId = gSelectedWardData.split(".")[0];
        gWardName = gSelectedWardData.split(".")[1];
        gWardPrefix = gSelectedWardData.split(".")[2];
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

function callGetAllProjectsApi() {
    $.ajax({
        url: `${gBASE_URL}/projects`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            propertyTable.rows.add(res).draw();
        },
        error: (err) => alert(err.responseText),
    });
}

function callGetProjectByIdApi(paramProjectId) {
    $.ajax({
        url: `${gBASE_URL}/projects/${paramProjectId}`,
        method: 'GET',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (res) {
            loadProjectToForm(res);
        },
        error: (err) => alert(err.responseText),
    });
}

function callCreateProjectApi(paramObject) {
    $.ajax({
        url: `${gBASE_URL}/projects`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            alert('Project created successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callUpdateProjectByIdApi(projectId, paramObject) {
    $.ajax({
        url: `${gBASE_URL}/projects/${projectId}`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(paramObject),
        success: () => {
            gProjectId = 0;
            alert('Project updated successfully');
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function callDeleteProjectByIdApi(projectId) {
    $.ajax({
        url: `${gBASE_URL}/projects/${projectId}`,
        method: 'DELETE',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            gProjectId = 0;
            alert('Project deleted successfully');
            $("#modal-delete").modal("hide");
            location.reload();
        },
        error: (err) => alert(err.responseText),
    });
}

function loadProjectToForm(paramObject) {
    $('#input-name').val(paramObject.name);
    $('#input-description').val(paramObject.description);
    $('#input-address').val(paramObject.address);
    $("#select-province").val(`${paramObject.province.id}.${paramObject.province.code}`).trigger('change');
    // Use a timeout to ensure the district dropdown has loaded before setting its value
    setTimeout(() => {
        $("#select-district").val(`${paramObject.district.id}.${paramObject.district.name}.${paramObject.district.prefix}`).trigger('change');
    }, 600);
    // Use another timeout to ensure the ward dropdown has loaded before setting its value
    setTimeout(() => {
        if (paramObject.ward && paramObject.ward.id && paramObject.ward.name && paramObject.ward.prefix){
            const wardValue = `${paramObject.ward.id}.${paramObject.ward.name}.${paramObject.ward.prefix}`;
            $("#select-ward").val(wardValue).trigger('change');
            // $("#select-ward").val(`${paramObject.ward.id}.${paramObject.ward.name}.${paramObject.ward.prefix}`);
        }
    }, 1500);
    $('#input-acreage').val(paramObject.acreage);
    $('#input-construct-area').val(paramObject.constructArea);
    $('#select-construction-contractor').val(paramObject.constructionContractor.id);
    $('#select-investor').val(paramObject.investor.id);
    $('#input-number-block').val(paramObject.numBlock);
    $('#input-number-floor').val(paramObject.numFloors);
    $('#input-slogan').val(paramObject.slogan);
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

function getFormData(paramObject) {
    paramObject.name = $('#input-name').val().trim();
    paramObject.description = $('#input-description').val().trim();
    paramObject.address = $('#input-address').val().trim();
    paramObject.province.id = gSelectProvinceId;
    paramObject.district.id = gDistrictId;
    paramObject.ward.id = gWardId;
    paramObject.acreage = $('#input-acreage').val().trim();
    paramObject.constructArea = $('#input-construct-area').val().trim();
    paramObject.constructionContractor.id = $('#select-construction-contractor').val();
    paramObject.investor.id = $('#select-investor').val();
    paramObject.numBlock = $('#input-number-block').val().trim();
    paramObject.numFloors = $('#input-number-floor').val().trim();
    paramObject.slogan = $('#input-slogan').val().trim();
}

function validateFormData(paramObject) {
    if (!paramObject.name || !paramObject.acreage ) {
        alert("Please full fill data!");
        return false;
    }
    return true;
}