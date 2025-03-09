import { showMessage } from '../../js/messageHandler.js';
const gBASE_URL = `${config.apiUrl}`;
var propertyId;

const form = $('#propertyForm');
var gProvinceSelectElement = $("#province-select");
var gDistrictSelectElement = $("#district-select");
var gWardsSelectElement = $("#ward-select");
var gProvinceList = [];
var gDistrictList = [];
var gSelectedProvinceData = "";
var gSelectProvinceId = 0;
var gProvinceSelectedText = "";
var gSelectedDistrictData = "";
var gDistrictName = "";
var gDistrictPrefix = "";
var gDistrictId = 0;
var gWardList = [];
var gSelectedWardData = "";
var gWardName = "";
var gWardPrefix = "";
var gWardId = 0;
var jwt = '';
var createdBy='';
var updatedBy='';

const propertyData = {
    title: "",
    price: 0,
    description: "",
    province: null,
    district: null,
    wards: null,
    address: "",
    type: 0,
    project: null,
    customer: null,
    bedroom: 0,
    bath: 0,
    acreage: 0,
    photo: "",
    createdBy:"",
    updatedBy:"",
}

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

// Attach an event listener to the form submit button
document.getElementById('add-property').addEventListener('click', function (event) {
    event.preventDefault();
    jwt = Cookies.get('jwt');
    if (jwt) {
        let userId = localStorage.getItem('userId');
        propertyData.title = $('#property-title').val();
        propertyData.price = $('#input-price').val();
        propertyData.description = $('#property-description').val();
        propertyData.province = {id: gSelectProvinceId};
        propertyData.district = {id: gDistrictId};
        propertyData.wards = {id: gWardId};
        propertyData.address = $('#input-location').val();
        propertyData.type = $('#select-property-type').val();
        propertyData.project = {id: $('#select-project').val()};
        propertyData.customer = {id: 1};
        propertyData.bedroom = $('#input-bedroom').val();
        propertyData.bath = $('#input-bath').val();
        propertyData.acreage = $('#input-acreage').val();

        const formImageData = new FormData();
        const files = document.getElementById('image').files;

        if (files.length === 0) {
            if(!propertyId){
                showMessage("Error", "Please select at least one image before submitting.");
                return;
            }
            else{
                propertyData.updatedBy = userId;
                propertyData.createdBy = createdBy;
                callUpdatePropertyApi(propertyData);
            }
        }

        if(files.length !== 0){
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
                    
                    if(!propertyId){
                        propertyData.photo = uploadedUrls;
                        propertyData.createdBy = userId;
                        callAddPropertyApi(propertyData);
                    }
                    else{
                        propertyData.photo = `${propertyData.photo}\n${uploadedUrls}`;
                        propertyData.updatedBy = userId;
                        propertyData.createdBy = createdBy;
                        callUpdatePropertyApi(propertyData);
                    }
                })
                .catch(error => {
                    showMessage("Error", "Error uploading files. Please try again.");
                });
        }
    }
    else{
        window.location.href="/user/login";
    }
});

function callAddPropertyApi(propertyData) {
    // Send form data to the backend using AJAX
    $.ajax({
        url: `${gBASE_URL}/realestate`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(propertyData),
        contentType: 'application/json', // Required for FormData
        success: function (response) {
            showMessage("Success", "Property added successfully!");
            form[0].reset(); // Reset the form after success
        },
        error: function (error) {
            showMessage("Error", "Failed to add property. Please try again.");
        },
    });
}

$(document).ready(function () {
    const urlParam = new URLSearchParams(window.location.search);
    propertyId = urlParam.get('id');
    if(propertyId){
        callGetPropertyDetail(propertyId);
    }

    callGetAllProvincesApi();
    callGetAllProjectApi()

    gProvinceSelectElement.on("change", function () {
        gDistrictSelectElement.html("<option disabled selected value>Select District</option>");
        gSelectedProvinceData = $(this).val();
        gSelectProvinceId = gSelectedProvinceData.split(".")[0];
        var bProvinceCode = gSelectedProvinceData.split(".")[1];

        gProvinceSelectedText = $(this).find("option:selected").text(); // Text của option được chọn

        // Ghi giá trị vào các input
        $("#input-province-code").val(bProvinceCode);
        $("#input-province-name").val(gProvinceSelectedText);

        getDistrictsByProvinceCode(gDistrictSelectElement, bProvinceCode);
    });

    gDistrictSelectElement.on("change", function () {
        gWardsSelectElement.html("<option  disabled selected value>Select Ward</option>");
        gSelectedDistrictData = $(this).val();
        gDistrictId = gSelectedDistrictData.split(".")[0];
        gDistrictName = gSelectedDistrictData.split(".")[1];
        gDistrictPrefix = gSelectedDistrictData.split(".")[2];

        getWardsByDistrictName(gDistrictName);

        // Ghi giá trị vào các input
        $("#input-district-name").val(gDistrictName);
        $("#select-district-prefix").val(gDistrictPrefix);
    });

    gWardsSelectElement.on("change", function () {
        gSelectedWardData = $(this).val();
        gWardId = gSelectedWardData.split(".")[0];
        gWardName = gSelectedWardData.split(".")[1];
        gWardPrefix = gSelectedWardData.split(".")[2];

        // Ghi giá trị vào các input
        $("#input-ward-name").val(gWardName);
        $("#select-ward-prefix").val(gWardPrefix);
    });
});

function callGetAllProjectApi(){
    $.ajax({
        url: `${gBASE_URL}/projects`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            loadDataToProjectSelect(data);
        },
        error: function (xhr, status, error) {
        }
    })
}

function loadDataToProjectSelect(data){
    const projectEle = $('#select-project');
    data.forEach(project => {
        var bProjectOption = $("<option/>");
        bProjectOption.prop("value", project.id);
        bProjectOption.prop("text", project.name);
        projectEle.append(bProjectOption);
    })
}

function callGetAllProvincesApi() {
    $.ajax({
        url: `${gBASE_URL}/provinces`,
        method: "GET",
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

function getDistrictsByProvinceCode(pDistrictSelectElement, pProvinceCode) {
    $.ajax({
        url: `${gBASE_URL}/districts?provinceCode=${pProvinceCode}`,
        method: "GET",
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

function getWardsByDistrictName(pDistrictName) {
    $.ajax({
        url: `${gBASE_URL}/wards?districtName=${pDistrictName}`,
        method: "GET",
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

function callGetPropertyDetail(paramPropertyId) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${paramPropertyId}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderPropertyDetails(data);
        },
        error: function (xhr, status, error) {
        }
    });
}

function renderPropertyDetails(data){
    $("#property-title").val(data.title);
    $("#input-price").val(data.price);
    $("#property-description").val(data.description);
    $("#input-location").val(data.address);
    $("#select-property-type").val(data.type);
    $("#input-acreage").val(data.acreage);
    $("#input-bedroom").val(data.bedroom);
    $("#input-bath").val(data.bath);
    $(".div-add-images").append(`<input id="show-image" class="input-field" type="text" disabled>`);
    $("#show-image").val(data.photo);
    propertyData.photo = data.photo;
    $("#select-project").val(data.project.id);
    // Load province and trigger change to fetch districts
    $("#province-select").val(`${data.province.id}.${data.province.code}`).trigger('change');
    // Use a timeout to ensure the district dropdown has loaded before setting its value
    setTimeout(() => {
        $("#district-select").val(`${data.district.id}.${data.district.name}.${data.district.prefix}`).trigger('change');
    }, 300);
    // Use another timeout to ensure the ward dropdown has loaded before setting its value
    setTimeout(() => {
        $("#ward-select").val(`${data.ward.id}.${data.ward.name}.${data.ward.prefix}`);
    },600);
    updatedBy = data.updatedBy;
    createdBy = data.createdBy;
}

function callUpdatePropertyApi(propertyData) {
    // Send form data to the backend using AJAX
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}`,
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        data: JSON.stringify(propertyData),
        contentType: 'application/json', // Required for FormData
        success: function (response) {
            showMessage("Success", "Property updated successfully!");
            location.reload();
        },
        error: function (error) {
            showMessage("Error", "Failed to update property. Please try again.");
        },
    });
}