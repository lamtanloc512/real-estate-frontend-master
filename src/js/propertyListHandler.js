import { renderPropertyCard } from "./filterHandler.js";
const gBASE_URL = config.apiUrl;
let currentPage = 1;
let startPageNumber = 1; // Track the visible start page globally

document.addEventListener("DOMContentLoaded", () => {
    const jwt = Cookies.get('jwt');
    if (jwt) {
        onMainContentPageLoading();
        const propertyList = document.getElementById('property-list');

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
    }

});

function onMainContentPageLoading() {
    callGetRealEstatePerPageApi(0);
}

function callGetRealEstatePerPageApi(page) {
    let size = 10;
    // let forSaleByOwner = 1;
    let createdBy = localStorage.getItem("userId");

    // Include filterParams in the API call
    const url = `${gBASE_URL}/realestate/filter?page=${page}&size=${size}` +
                `&createdBy=${createdBy}` // &isForSaleByOwner=${forSaleByOwner}`

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