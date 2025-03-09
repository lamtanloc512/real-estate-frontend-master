import { initializeFilter } from "./filterHandler.js";
/**
 * *************************
 * Properties Detail page
 * *************************
 */

const gBASE_URL = config.apiUrl;
let propertyId = 0;
var userId='';
var jwt = '';

document.addEventListener("DOMContentLoaded", () => {
    jwt = Cookies.get('jwt');
    initializeFilter();
    /**
     * ************************************************************
     * ******************** Property Details *********************
     * ************************************************************
     */
    const urlParam = new URLSearchParams(window.location.search);
    propertyId = urlParam.get('id');
    userId = localStorage.getItem('userId');
    if (propertyId) {
        callGetPropertyDetail(propertyId);
    }

    $(".btn-update-property").on("click", function(e){
        e.preventDefault();
        window.location.href = `/update-property?id=${propertyId}`;
    });

    $(".btn-delete-property").on("click", function(e){
        e.preventDefault();
        $("#modal-delete").modal("show");
    });

    $("#btn-confirm-delete").click(function(){
        callDeletePropertyApi(propertyId);
    })
})


function callGetPropertyDetail(propertyId) {
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderPropertyDetails(data);
            if(data.project){
                callGetMasterLayout(data.project.id);
                callGetUtilities(data.project.utilities);
            }
            if(userId && data.createdBy && userId == data.createdBy){
                $(".btn-update-property").css("display", "block");
                $(".btn-delete-property").css("display", "block");
            }
        },
        error: function (xhr, status, error) {
        }
    });
}

function renderPropertyDetails(data) {
    document.querySelector('.details-header h1').textContent = data.title;
    let gallery = document.querySelector('.gallery');
    let galleryHTML = '';
    let arrPhoto = data.photo.split('\n');
    if(arrPhoto.length > 1){
        arrPhoto.forEach(photo => {
            galleryHTML += `
                <div class="col-6">
                    <img alt="Main Property Image" class="main-image mb-3 w-100" src="${photo}">
                </div>`;
        })
    }
    else{
        galleryHTML = `
            <img alt="Main Property Image" class="main-image mb-3" src="${data.photo}">
        `;
    }
    galleryHTML += `<p>${data.description}</p>`;
    gallery.innerHTML += galleryHTML;
}

function callGetMasterLayout(projectId){
    $.ajax({
        url: `${gBASE_URL}/master-layout/by-project?projectId=${projectId}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderMasterLayout(data);
        },
        error: function (xhr, status, error) {
        }
    });
}

function renderMasterLayout(data){
    const $floorPlanThumbnails = $('.floor-thumbnails');
    $floorPlanThumbnails.empty();
    data.forEach(item => {
        $floorPlanThumbnails.append($(`
            <div class="col-md-5">
                <img src="${item.photo}"
                    alt="${item.name}">
            </div>
        `));
    });
}

function callGetUtilities(utilities){
    $.ajax({
        url: `${gBASE_URL}/utilities`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderUtilities(data, utilities);
        },
        error: function (xhr, status, error) {
        }
    });
}

function renderUtilities(utilitiesList, paramUtilities){
    const selectedUtilities = paramUtilities.split(",");
    const $utilitiesList = $('.amenity-list');
    $utilitiesList.empty();
    utilitiesList.forEach(utility =>{
        let selectedAmenity = '';
        if(selectedUtilities.includes(utility.id.toString())){
            selectedAmenity = '<i class="fas fa-check-double"></i>';
        }
        const $item = $(`
            <div class="col-md-4">
                <img src="${utility.photo}"
                alt="Thumbnail 3">
                <p class="text-center mt-2">
                    ${selectedAmenity}
                    <span>${utility.name}</span>
                </p>
            </div>
            `);
        $utilitiesList.append($item);
    });
}

function callDeletePropertyApi(paramPropertyId) {
    // Send form data to the backend using AJAX
    $.ajax({
        url: `${gBASE_URL}/realestate/${propertyId}`,
        method: 'DELETE',
        contentType: 'application/json', // Required for FormData
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: () => {
            $("#modal-delete-customer").modal("hide");
            window.location.href = '/user/property-list';
        },
        error: function (error) {
            alert('Failed to delete property. Please try again.');
        }
    });
}
