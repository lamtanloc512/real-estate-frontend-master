import { initializeFilter, renderPropertyCard } from "./filterHandler.js";

/**
 * *************************
 * Properties page
 * *************************
 */
const gBASE_URL = config.apiUrl;
let currentPage = 1;
let startPageNumber = 1; // Track the visible start page globally
let filterParams = {};

document.addEventListener("DOMContentLoaded", () => {

    initializeFilter();
    loadFilterResultsFromLocalStorage();

    /*
    ************************************************************
    ********** switch between grid view and list view **********
    ************************************************************
    */

    // JavaScript to toggle between grid and list view
    const gridTabMenu = document.querySelectorAll('.grid-tab-menu li');
    const propertyList = document.getElementById('property-list');
    propertyList.classList.add('list-view');

    gridTabMenu.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            gridTabMenu.forEach(item => item.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Toggle view based on data-grid attribute
            const viewType = tab.getAttribute('data-grid');
            const propertyCards = document.querySelectorAll('#property-list .property-card');

            if (viewType === 'grid') {
                propertyList.classList.remove('list-view');
                propertyList.classList.add('grid-view');
            } else if (viewType === 'list') {
                propertyList.classList.remove('grid-view');
                propertyList.classList.add('list-view');
            }
        });
    });


    /*
    ************************************************************
    ********** Main Content - properties list **********
    ************************************************************
    */

    const searchButton = document.querySelector(".btn-search");

    if (searchButton) {
        searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            loadFilterResultsFromLocalStorage();
        });
    }

    propertyList.addEventListener('click', (event) => {
        const target = event.target.closest(".property-card");
        if (target) {
            const propertyId = target.getAttribute('data-id');
             // Clear localStorage before navigation
            localStorage.removeItem("filter-object");
            localStorage.removeItem("filter-text");
            window.location.href = `/property-detail?id=${propertyId}`;
        }
    });

    
    // Detect clicks on navigation links or other elements
    const navigationLinks = document.querySelectorAll("a");
    navigationLinks.forEach(link => {
        link.addEventListener("click", () => {
            const href = link.getAttribute("href");

            // Clear localStorage if navigating to another page
            if (href && !href.includes("/properties")) {
                localStorage.removeItem("filter-object");
                localStorage.removeItem("filter-text");
            }
        });
    });

});

function onMainContentPageLoading() {
    callGetRealEstatePerPageApi(0);
}

function callGetRealEstatePerPageApi(page) {
    let size = 10;

    const { provinceId = '', districtId = '', projectId = '', type = '', 
        minPrice = '', maxPrice = '', bedroom = '', minAcreage = '', maxAcreage = '' } = filterParams;

    // Include filterParams in the API call
    const url = Object.keys(filterParams).length
        ? `${gBASE_URL}/realestate/filter?page=${page}&size=${size}` +
          `&provinceId=${provinceId}&districtId=${districtId}&projectId=${projectId}` +
          `&type=${type}&minPrice=${minPrice}&maxPrice=${maxPrice}` +
          `&bedrooms=${bedroom}&minAcreage=${minAcreage}&maxAcreage=${maxAcreage}`
        : `${gBASE_URL}/realestate/filter?page=${page}&size=${size}&approveStatus=Approved`;

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            updatePagination(data.totalPages);
            renderPropertyCard(data.content);
        },
        error: function (xhr, status, error) {
        }
    });
}

const loadFilterResultsFromLocalStorage = () => {
    const getFilterObject = () => {
        const filterString = localStorage.getItem("filter-object");
        return filterString ? JSON.parse(filterString) : null; // Parse JSON or return null if not found
    };

    const filterObject = getFilterObject();
    if (filterObject) {
        callFilterRealEstateApi(filterObject.provinceId.split(".")[0], filterObject.districtId.split(".")[0], filterObject.projectId,
            filterObject.type, filterObject.minPrice, filterObject.maxPrice,
            filterObject.bedroom, filterObject.minAcreage, filterObject.maxAcreage);
    }
    else{
        onMainContentPageLoading();
    }
}

function callFilterRealEstateApi(provinceId, districtId, projectId, type, minPrice,
                                maxPrice, bedroom, minAcreage, maxAcreage) {
    // Update filterParams
    filterParams = { provinceId, districtId, projectId, type, minPrice, maxPrice, bedroom, minAcreage, maxAcreage };
    
    $.ajax({
        url: `${gBASE_URL}/realestate/filter?provinceId=${provinceId}` +
            `&districtId=${districtId}&projectId=${projectId}&type=${type}` +
            `&minPrice=${minPrice}&maxPrice=${maxPrice}&bedrooms=${bedroom}` +
            `&minAcreage=${minAcreage}&maxAcreage=${maxAcreage}&approveStatus=Approved`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            currentPage = 1; // Reset to page 1 after filtering
            startPageNumber = 1;
            updatePagination(data.totalPages);
            renderPropertyCard(data.content);
        },
        error: function (xhr, status, error) {
        }
    });
}

function updatePagination(totalPages, visiblePages = 5) {
    // Ensure currentPage is within a valid range
    if (currentPage > totalPages) {
        currentPage = 1; // Reset to page 1 if currentPage exceeds totalPages
        startPageNumber = 1;   // Reset the visible range start page
    }

    var $pagination = $('.pagination');
    $pagination.empty();

    // Calculate the end page for the visible range
    const endPageNumber = Math.min(startPageNumber + visiblePages - 1, totalPages);

    // Add "Previous" button
    const $prevItem = $('<li class="page-item"><a class="page-link" href="#" data-page="prev">&laquo;</a></li>');
    if (startPageNumber === 1) $prevItem.addClass('disabled'); // Disable if at the beginning
    $pagination.append($prevItem);

    // Add page numbers within the visible range
    for (let i = startPageNumber; i <= endPageNumber; i++) {
        const $pageItem = $(
            `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
        );
        if (i === currentPage) {
            $pageItem.addClass('active'); // Keep current page active
        }
        $pagination.append($pageItem);
    }

    // Add "Next" button
    const $nextItem = $('<li class="page-item"><a class="page-link" href="#" data-page="next">&raquo;</a></li>');
    if (endPageNumber === totalPages) $nextItem.addClass('disabled'); // Disable if at the end
    $pagination.append($nextItem);

    // Handle click events
    $pagination.off('click').on('click', '.page-link', function (e) {
        e.preventDefault();
        var $link = $(this);
        var page = $link.data('page');

        if (page === 'prev' && startPageNumber > 1) {
            startPageNumber -= visiblePages; // Move to the previous set of pages
            startPageNumber = Math.max(1, startPageNumber); // Ensure it doesn’t go below 1
        } else if (page === 'next' && endPageNumber < totalPages) {
            startPageNumber += visiblePages; // Move to the next set of pages
            startPageNumber = Math.min(startPageNumber, totalPages - visiblePages + 1); // Ensure it doesn’t go beyond max
        } else if (typeof page === 'number') {
            currentPage = page;
            onPageLinkClick($link); // Call custom logic for page number click
        }

        // Refresh pagination
        updatePagination(totalPages, visiblePages);
    });
}

function onPageLinkClick(paramLink) {
    let page = $(paramLink).data('page');
    callGetRealEstatePerPageApi(page - 1);
}