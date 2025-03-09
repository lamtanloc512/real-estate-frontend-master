const gBASE_URL = `${config.apiUrl}`;

let gSelectedProvince = null;
let gSelectedDistrict = null;
let gSelectedProject = null;
let gSelectedPropertyType = '';
let gSelectedPrice ='';
let gSelectedPropertySize = '';
let gSelectedBedroom = '';

const selectedTagsContainer = document.getElementById("selectedTags");
const projectDropdownButton = document.getElementById('projectDropdown');
const propertyTypeButton = document.getElementById('propertyTypeDropdown');
const priceMinInput = document.getElementById("priceMin");
const priceMaxInput = document.getElementById("priceMax");
const radioButtons = document.querySelectorAll('input[name="priceRange"]');
const priceFilterDropdown = document.getElementById("priceFilterDropdown");
const propertySizeButton = document.getElementById('propertySizeDropdown');
const bedroomButton = document.getElementById('bedroomDropdown');

// Function to create a tag
const createTag = (name, type) => {
    const tag = document.createElement("span");
    tag.className = `badge bg-${type === "province" ? "primary" : "info"} me-2`;
    tag.setAttribute("data-type", type); // Store type (province/district)
    tag.setAttribute("data-name", name); // Store name for uniqueness
    tag.innerHTML = `${name} <button type="button" class="btn-close btn-close-white ms-1" aria-label="Remove"></button>`;
    return tag;
};

// Function to clear province tag
const clearProvinceTag = () => {
    const existingProvinceTag = selectedTagsContainer.querySelector('.badge[data-type="province"]');
    if (existingProvinceTag) {
        selectedTagsContainer.removeChild(existingProvinceTag);
    }
};

// Function to clear district tag
const clearDistrictTag = () => {
    const existingDistrictTag = selectedTagsContainer.querySelector('.badge[data-type="district"]');
    if (existingDistrictTag) {
        selectedTagsContainer.removeChild(existingDistrictTag);
    }
};

const getSelectedLocation = () => {
    return {
        province: gSelectedProvince, // Returns the selected province
        district: gSelectedDistrict  // Returns the selected district
    };
}

const getSelectedProject = () => {
    return gSelectedProject;
}

const getSelectedPropertyType = () => {
    return gSelectedPropertyType;
}

const resetFilters = () => {
    // Reset the inputs and radio buttons
    priceMinInput.value = "";
    priceMaxInput.value = "";
    radioButtons.forEach((radio) => {
        radio.checked = false;
    });

    // Update the dropdown label to default
    priceFilterDropdown.textContent = "Price Range";

};

const getPriceSelectedValue = () => {
    const priceMin = document.getElementById("priceMin").value.trim();
    const priceMax = document.getElementById("priceMax").value.trim();
    const selectedRadio = document.querySelector('input[name="priceRange"]:checked');

    if (priceMin || priceMax) {
        gSelectedPrice = priceMin + "," + priceMax;
        return {
            type: "customRange",
            min: priceMin ? Number(priceMin) : null,
            max: priceMax ? Number(priceMax) : null,
        };
    } else if (selectedRadio) {
        gSelectedPrice = selectedRadio.value;
        return {
            type: "presetRange",
            value: selectedRadio.value,
        };
    }

    return null; // No selection
};

const getPropertySizeSelectedValue = () => {
    return gSelectedPropertySize;
}

const updateDropdownLabel = () => {
    let label = "Price Range";

    // Check if Min or Max input has values
    const minPrice = priceMinInput.value.trim();
    const maxPrice = priceMaxInput.value.trim();

    if (minPrice || maxPrice) {
        if(minPrice && maxPrice){
            label = `${minPrice} - ${maxPrice}`;
        }
        else if(minPrice && !maxPrice){
            label = `Over ${minPrice}`;
        }
        else if(!minPrice && maxPrice){
            label = `Under ${maxPrice}`;
        }

        // Deselect all radio buttons
        radioButtons.forEach((radio) => {
            radio.checked = false;
        });
    } else {
        // Check selected radio button
        const selectedRadio = document.querySelector(
            'input[name="priceRange"]:checked'
        );
        if (selectedRadio) {
            const selectedLabel = selectedRadio.nextElementSibling.textContent.trim();
            label = selectedLabel;
        }
    }

    priceFilterDropdown.textContent = label;
};

const getBedroomSelectedValue = () => {
    return gSelectedBedroom;
}

function callGetProvinceListApi() {
    $.ajax({
        url: `${gBASE_URL}/provinces`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderProvinceDropdown(data);
        },
        error: function (xhr, status, error) {
        }
    })
}

function renderProvinceDropdown(provinceList) {
    const $provinceDropdown = $('.province-search-select-list');
    $provinceDropdown.empty();
    provinceList.forEach(province => {
        const $item = $(
            `<li value="${province.id}.${province.code}"
                    tracking-id="select-search-location">
                    <span>
                        ${province.name}
                    </span>
                </li>`
        )
        $provinceDropdown.append($item);
    });
}

function callGetDistrictListApi(provinceCode) {
    $.ajax({
        url: `${gBASE_URL}/districts?provinceCode=${provinceCode}`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderDistrictDropdown(data);
        },
        error: function (xhr, status, error) {
        }
    })
}

function renderDistrictDropdown(districtList) {
    const $districtDropdown = $('.district-search-select-list');
    $districtDropdown.empty();
    districtList.forEach(district => {
        const $item = $(
            `<li value="${district.id}">
                    <span>
                        ${district.name}
                    </span>
                </li>`
        )
        $districtDropdown.append($item);
    });
}

function callGetProjectListApi() {
    $.ajax({
        url: `${gBASE_URL}/projects`,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            renderProjectDropdown(data);
        },
        error: function (xhr, status, error) {
        }
    })
}

function renderProjectDropdown(projectList) {
    const $projectDropdown = $('.project-select-list');
    $projectDropdown.empty();
    projectList.forEach(project => {
        const $item = $(
            `<li class="px-2" value="${project.id}">
                    <span>
                    ${project.name}
                    </span>
                </li>`
        )
        $projectDropdown.append($item);
    });
}

function createPropertyCardTemplate(realestate) {
    const { photo, address, dateCreate, price, acreage, bedroom } = realestate;
    const formattedDate = formatDate(dateCreate); 
    return `
            <div class="property-card d-flex mb-3 p-0" data-id="${realestate.id}">
                    <div class="position-relative">
                        <img src="${realestate.photo.split('\n')[0]}"
                            alt="Property Image" class="img-fluid" style="height: 220px;">
                        <span class="badge"><i class="fas fa-camera"></i> 07</span>
                        <span class="badge" style="top: 40px;"><i class="fas fa-film"></i> 08</span>
                    </div>
                    <div class="pt-3 w-100">
                        <h5 class="px-3">${realestate.title}</h5>
                        <p class="px-3 text-muted"><u>${realestate.address}</u></p>
                        <p class="px-3 text-muted">Added: ${formattedDate}</p>
                        <div class="mx-3 py-2 border-top">
                            <p class="text-price">Price: $${realestate.price}</p>
                        </div>
                        <ul class="property-amenities w-100 mt-2 mb-0 py-2 bg-light">
                            <li>
                                <svg class="mr-[5px]" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M11.8125 9.68709V4.31285C12.111 4.23634 12.384 4.0822 12.6037 3.86607C12.8234 3.64994 12.982 3.37951 13.0634 3.08226C13.1448 2.78501 13.1461 2.47151 13.0671 2.1736C12.9882 1.87569 12.8318 1.60398 12.6139 1.38605C12.396 1.16812 12.1243 1.01174 11.8263 0.932792C11.5284 0.85384 11.2149 0.855126 10.9177 0.936521C10.6204 1.01792 10.35 1.17652 10.1339 1.39623C9.91774 1.61593 9.7636 1.88892 9.68709 2.18747H4.31285C4.23634 1.88892 4.0822 1.61593 3.86607 1.39623C3.64994 1.17652 3.37951 1.01792 3.08226 0.936521C2.78501 0.855126 2.47151 0.85384 2.1736 0.932792C1.87569 1.01174 1.60398 1.16812 1.38605 1.38605C1.16812 1.60398 1.01174 1.87569 0.932792 2.1736C0.85384 2.47151 0.855126 2.78501 0.936521 3.08226C1.01792 3.37951 1.17652 3.64994 1.39623 3.86607C1.61593 4.0822 1.88892 4.23634 2.18747 4.31285V9.68709C1.88892 9.7636 1.61593 9.91774 1.39623 10.1339C1.17652 10.35 1.01792 10.6204 0.936521 10.9177C0.855126 11.2149 0.85384 11.5284 0.932792 11.8263C1.01174 12.1243 1.16812 12.396 1.38605 12.6139C1.60398 12.8318 1.87569 12.9882 2.1736 13.0671C2.47151 13.1461 2.78501 13.1448 3.08226 13.0634C3.37951 12.982 3.64994 12.8234 3.86607 12.6037C4.0822 12.384 4.23634 12.111 4.31285 11.8125H9.68709C9.7636 12.111 9.91774 12.384 10.1339 12.6037C10.35 12.8234 10.6204 12.982 10.9177 13.0634C11.2149 13.1448 11.5284 13.1461 11.8263 13.0671C12.1243 12.9882 12.396 12.8318 12.6139 12.6139C12.8318 12.396 12.9882 12.1243 13.0671 11.8263C13.1461 11.5284 13.1448 11.2149 13.0634 10.9177C12.982 10.6204 12.8234 10.35 12.6037 10.1339C12.384 9.91774 12.111 9.7636 11.8125 9.68709ZM11.375 1.74997C11.548 1.74997 11.7172 1.80129 11.8611 1.89744C12.005 1.99358 12.1171 2.13024 12.1834 2.29012C12.2496 2.45001 12.2669 2.62594 12.2332 2.79568C12.1994 2.96541 12.1161 3.12132 11.9937 3.24369C11.8713 3.36606 11.7154 3.4494 11.5457 3.48316C11.3759 3.51692 11.2 3.49959 11.0401 3.43337C10.8802 3.36714 10.7436 3.25499 10.6474 3.11109C10.5513 2.9672 10.5 2.79803 10.5 2.62497C10.5002 2.39298 10.5925 2.17055 10.7565 2.00651C10.9206 1.84246 11.143 1.7502 11.375 1.74997ZM1.74997 2.62497C1.74997 2.45191 1.80129 2.28274 1.89744 2.13885C1.99358 1.99495 2.13024 1.8828 2.29012 1.81658C2.45001 1.75035 2.62594 1.73302 2.79568 1.76678C2.96541 1.80055 3.12132 1.88388 3.24369 2.00625C3.36606 2.12862 3.4494 2.28453 3.48316 2.45427C3.51692 2.624 3.49959 2.79993 3.43337 2.95982C3.36714 3.1197 3.25499 3.25636 3.11109 3.35251C2.9672 3.44865 2.79803 3.49997 2.62497 3.49997C2.39298 3.49974 2.17055 3.40748 2.00651 3.24343C1.84246 3.07939 1.7502 2.85696 1.74997 2.62497ZM2.62497 12.25C2.45191 12.25 2.28274 12.1987 2.13885 12.1025C1.99495 12.0064 1.8828 11.8697 1.81658 11.7098C1.75035 11.5499 1.73302 11.374 1.76678 11.2043C1.80055 11.0345 1.88388 10.8786 2.00625 10.7563C2.12862 10.6339 2.28453 10.5505 2.45427 10.5168C2.624 10.483 2.79993 10.5003 2.95982 10.5666C3.1197 10.6328 3.25636 10.745 3.35251 10.8888C3.44865 11.0327 3.49997 11.2019 3.49997 11.375C3.49974 11.607 3.40748 11.8294 3.24343 11.9934C3.07939 12.1575 2.85696 12.2497 2.62497 12.25ZM9.68709 10.9375H4.31285C4.23448 10.6367 4.07729 10.3622 3.8575 10.1424C3.63771 9.92265 3.36326 9.76546 3.06247 9.68709V4.31285C3.36324 4.23444 3.63766 4.07724 3.85745 3.85745C4.07724 3.63766 4.23444 3.36324 4.31285 3.06247H9.68709C9.76546 3.36326 9.92265 3.63771 10.1424 3.8575C10.3622 4.07729 10.6367 4.23448 10.9375 4.31285V9.68709C10.6367 9.76542 10.3622 9.92259 10.1424 10.1424C9.92259 10.3622 9.76542 10.6367 9.68709 10.9375ZM11.375 12.25C11.2019 12.25 11.0327 12.1987 10.8888 12.1025C10.745 12.0064 10.6328 11.8697 10.5666 11.7098C10.5003 11.5499 10.483 11.374 10.5168 11.2043C10.5505 11.0345 10.6339 10.8786 10.7563 10.7563C10.8786 10.6339 11.0345 10.5505 11.2043 10.5168C11.374 10.483 11.5499 10.5003 11.7098 10.5666C11.8697 10.6328 12.0064 10.745 12.1025 10.8888C12.1987 11.0327 12.25 11.2019 12.25 11.375C12.2496 11.6069 12.1573 11.8293 11.9933 11.9933C11.8293 12.1573 11.6069 12.2496 11.375 12.25Z"
                                        fill="#494949"></path>
                                </svg>
                                <span>${realestate.acreage} Sq.fit</span>
                            </li>
                            <li>
                                <svg class="mr-[5px]" width="14" height="10" viewBox="0 0 14 10" fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M13.0002 4.18665V2.33331C13.0002 1.23331 12.1002 0.333313 11.0002 0.333313H8.3335C7.82016 0.333313 7.3535 0.533313 7.00016 0.853313C6.64683 0.533313 6.18016 0.333313 5.66683 0.333313H3.00016C1.90016 0.333313 1.00016 1.23331 1.00016 2.33331V4.18665C0.593496 4.55331 0.333496 5.07998 0.333496 5.66665V9.66665H1.66683V8.33331H12.3335V9.66665H13.6668V5.66665C13.6668 5.07998 13.4068 4.55331 13.0002 4.18665ZM8.3335 1.66665H11.0002C11.3668 1.66665 11.6668 1.96665 11.6668 2.33331V3.66665H7.66683V2.33331C7.66683 1.96665 7.96683 1.66665 8.3335 1.66665ZM2.3335 2.33331C2.3335 1.96665 2.6335 1.66665 3.00016 1.66665H5.66683C6.0335 1.66665 6.3335 1.96665 6.3335 2.33331V3.66665H2.3335V2.33331ZM1.66683 6.99998V5.66665C1.66683 5.29998 1.96683 4.99998 2.3335 4.99998H11.6668C12.0335 4.99998 12.3335 5.29998 12.3335 5.66665V6.99998H1.66683Z"
                                        fill="#494949"></path>
                                </svg>
                                <span>${realestate.bedroom}</span>
                            </li>
                            <li>
                                <svg class="mr-[5px]" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12.6875 7.65627H2.1875V2.7344C2.18699 2.54904 2.22326 2.36543 2.29419 2.19418C2.36512 2.02294 2.46932 1.86746 2.60075 1.73676L2.61168 1.72582C2.81765 1.52015 3.0821 1.38309 3.36889 1.33336C3.65568 1.28362 3.95083 1.32364 4.21403 1.44795C3.96546 1.86122 3.86215 2.34571 3.9205 2.82443C3.97885 3.30315 4.19552 3.74864 4.53608 4.0901L4.83552 4.38954L4.28436 4.94073L4.90304 5.55941L5.4542 5.00825L8.5082 1.95431L9.05937 1.40314L8.44066 0.78443L7.88946 1.3356L7.59002 1.03616C7.23151 0.678646 6.75892 0.458263 6.2546 0.413412C5.75029 0.368561 5.24622 0.502086 4.83025 0.790719C4.3916 0.513704 3.87178 0.394114 3.35619 0.451596C2.84059 0.509078 2.35987 0.740213 1.993 1.10703L1.98207 1.11797C1.76912 1.32975 1.6003 1.58165 1.48537 1.85911C1.37044 2.13657 1.31168 2.43407 1.3125 2.7344V7.65627H0.4375V8.53127H1.3125V9.37072C1.31248 9.44126 1.32386 9.51133 1.34619 9.57823L2.16016 12.02C2.20359 12.1508 2.28712 12.2645 2.39887 12.345C2.51062 12.4256 2.64491 12.4689 2.78266 12.4688H3.1354L2.81641 13.5625H3.72786L4.04688 12.4688H9.73711L10.0652 13.5625H10.9785L10.6504 12.4688H11.2172C11.355 12.4689 11.4893 12.4256 11.6011 12.3451C11.7129 12.2645 11.7964 12.1508 11.8398 12.02L12.6538 9.57823C12.6761 9.51133 12.6875 9.44126 12.6875 9.37072V8.53127H13.5625V7.65627H12.6875ZM5.15484 1.65486C5.3959 1.41433 5.72254 1.27924 6.06308 1.27924C6.40362 1.27924 6.73026 1.41433 6.97132 1.65486L7.2707 1.95431L5.45429 3.77072L5.15484 3.47134C4.91432 3.23027 4.77924 2.90364 4.77924 2.5631C4.77924 2.22256 4.91432 1.89593 5.15484 1.65486ZM11.8125 9.33518L11.0597 11.5938H2.94033L2.1875 9.33518V8.53127H11.8125V9.33518Z"
                                        fill="#494949"></path>
                                </svg>
                                <span>${realestate.bath}</span>
                            </li>
                            <li>
                                <svg class="mr-[5px]" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12.25 6.98507H12.236L11.1307 4.49805C11.0275 4.26615 10.8592 4.06913 10.6464 3.93083C10.4335 3.79253 10.1851 3.71887 9.93125 3.71875H4.06875C3.81491 3.71888 3.56655 3.79256 3.3537 3.93086C3.14085 4.06916 2.97263 4.26616 2.86937 4.49805L1.76397 6.98507H1.75C1.51802 6.98533 1.29561 7.0776 1.13157 7.24164C0.967531 7.40568 0.875261 7.62809 0.875 7.86007V10.9226C0.875261 11.1546 0.967531 11.377 1.13157 11.541C1.29561 11.705 1.51802 11.7973 1.75 11.7976V12.9062C1.7502 13.0802 1.81941 13.247 1.94243 13.3701C2.06546 13.4931 2.23226 13.5623 2.40625 13.5625H3.9375C4.11149 13.5623 4.27829 13.4931 4.40131 13.3701C4.52434 13.247 4.59355 13.0802 4.59375 12.9062V11.7976H9.40625V12.9062C9.40645 13.0802 9.47566 13.247 9.59869 13.3701C9.72171 13.4931 9.88851 13.5623 10.0625 13.5625H11.5938C11.7677 13.5623 11.9345 13.4931 12.0576 13.3701C12.1806 13.247 12.2498 13.0802 12.25 12.9062V11.7976C12.482 11.7973 12.7044 11.705 12.8684 11.541C13.0325 11.377 13.1247 11.1546 13.125 10.9226V7.86007C13.1247 7.62809 13.0325 7.40568 12.8684 7.24164C12.7044 7.0776 12.482 6.98533 12.25 6.98507ZM3.66885 4.85352C3.70327 4.7762 3.75936 4.71052 3.83033 4.66442C3.90131 4.61831 3.98412 4.59377 4.06875 4.59375H9.93125C10.0159 4.59379 10.0986 4.61835 10.1696 4.66445C10.2406 4.71055 10.2966 4.77622 10.331 4.85352L11.2784 6.98504H2.7215L3.66885 4.85352ZM3.71875 12.6875H2.625V11.7976H3.71875V12.6875ZM11.375 12.6875H10.2812V11.7976H11.375V12.6875ZM12.25 10.9226H1.75V7.86007H12.25V10.9226Z">
                                    </path>
                                    <path d="M2.625 8.96875H4.8125V9.84375H2.625V8.96875Z"></path>
                                    <path d="M9.1875 8.96875H11.375V9.84375H9.1875V8.96875Z"></path>
                                    <path
                                        d="M7 0.403564L0.4375 3.03849V3.98139L7 1.34649L13.5625 3.98139V3.03849L7 0.403564Z"
                                        fill="#494949"></path>
                                </svg>
                                <span>2</span>
                            </li>
                        </ul>
                    </div>
                </div>`;
}

export function renderPropertyCard(realestates) {
    var $container = $('#property-list');
    $container.empty();
    realestates.forEach(function (realestate) {
        const formattedDate = formatDate(realestate.dateCreate);
        $container.append(createPropertyCardTemplate(realestate));
    });
}

function formatDate(dateString) {
    // Create a Date object from the input string
    const date = new Date(dateString);

    // Define an options object for the desired format
    const options = { day: '2-digit', month: 'long', year: 'numeric' };

    // Use toLocaleDateString to format the date
    return date.toLocaleDateString('en-GB', options);
}

export function initializeFilter() {
    /*
    ******************************
    ********** Location **********
    ******************************
    */
    callGetProvinceListApi();

    const provinceList = document.querySelector(".province-search-select-list");
    const districtList = document.querySelector(".district-search-select-list");
    const defaultText = document.getElementById("defaultText");

    $('#chooseProvinceDistrictWardDropdown').on('click', function(e){
        e.preventDefault();
        if(gSelectedProvince){
            // Show district list and hide province list
            provinceList.classList.add("d-none");
            callGetDistrictListApi(gSelectedProvince.value.split(".")[1]);
            districtList.classList.remove("d-none");
        }
    });

    // Handle province selection
    provinceList.addEventListener("click", (event) => {
        const target = event.target.closest("li");
        if (target && !gSelectedProvince) {
            const provinceName = target.innerText.trim();
            const provinceValue = target.getAttribute("value"); // Province value (id.code)

            // Clear existing province tag if any
            clearProvinceTag();

            gSelectedProvince = {
                text: provinceName,
                value: provinceValue
            }; // Store selected province

            const tag = createTag(provinceName, "province");
            selectedTagsContainer.appendChild(tag);
            defaultText.style.display = "none"; // Hide default text

            // Show district list and hide province list
            provinceList.classList.add("d-none");
            callGetDistrictListApi(provinceValue.split(".")[1]);
            districtList.classList.remove("d-none");
        }
    });

    // Handle district selection
    districtList.addEventListener("click", (event) => {
        const target = event.target.closest("li");
        if (target) {
            const districtName = target.innerText.trim();
            const districtValue = target.getAttribute("value"); // district value (code)

            // If a district is already selected, replace it with the new one
            if (gSelectedDistrict) {
                clearDistrictTag(); // Clear the previous district tag
            }

            const tag = createTag(districtName, "district");
            selectedTagsContainer.appendChild(tag);
            gSelectedDistrict = {
                text: districtName,
                value: districtValue
            }; // Store selected district
        }
    });

    // Handle tag province, district removal
    selectedTagsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("btn-close")) {
            const tag = event.target.closest(".badge");
            const tagType = tag.getAttribute("data-type");
            const tagName = tag.getAttribute("data-name");

            // Remove the tag
            selectedTagsContainer.removeChild(tag);

            // Reset selected province or district
            if (tagType === "province" && gSelectedProvince.text === tagName) {
                gSelectedProvince = null; // Reset selected province
                provinceList.classList.remove("d-none"); // Show province list again
            }

            if (tagType === "district" && gSelectedDistrict.text === tagName) {
                gSelectedDistrict = null; // Reset selected district
                districtList.classList.add("d-none"); // Hide district list again
            }

            // If no tags are left, reset the dropdown
            if (selectedTagsContainer.children.length === 0) {
                defaultText.style.display = "inline"; // Show default text
            }

            // Show district list if district tag is removed
            if (gSelectedDistrict === null) {
                districtList.classList.remove("d-none"); // Ensure district list is hidden when no province is selected
            }
        }
    });

    /*
    *********************************
    ********** Project **********
    *********************************
    */

    callGetProjectListApi();

    document.querySelector(".project-select-list").addEventListener('click', (event) => {
        const item = event.target.closest('li'); // Find the closest li element
        if (item) {
            const selectedProjectText = item.textContent.trim();
            const selectedProjectVal = item.getAttribute("value");
            gSelectedProject = {
                text: selectedProjectText,
                value: selectedProjectVal
            }
            projectDropdownButton.textContent = selectedProjectText;

            // Close the dropdown menu
            const dropdownMenu = projectDropdownButton.nextElementSibling;
            if (dropdownMenu.classList.contains("show")) {
                dropdownMenu.classList.remove("show");
            }
        }
    })

    /*
    ***********************************
    ********** Property Type **********
    ***********************************
    */

    const propertyTypeListItems = document.querySelectorAll(".property-type-select-list li");

    propertyTypeListItems.forEach((item) => {
        item.addEventListener("click", () => {
            const selectedText = item.textContent.trim();
            const selectedVal = item.getAttribute("value");
            gSelectedPropertyType = selectedVal;
            propertyTypeButton.textContent = selectedText;
            const dropdownMenu = propertyTypeButton.nextElementSibling;
            if (dropdownMenu.classList.contains("show")) {
                dropdownMenu.classList.remove("show");
            }
        });
    });

    /*
    *********************************
    ********** Price Range **********
    *********************************
    */
    const resetButton = document.querySelector(".btn-reset"); // Reset button

    // Event listeners
    priceMinInput.addEventListener("input", updateDropdownLabel);
    priceMaxInput.addEventListener("input", updateDropdownLabel);

    radioButtons.forEach((radio) => {
        radio.addEventListener("change", () => {
            // Clear price inputs if a radio button is selected
            if (radio.checked) {
                priceMinInput.value = "";
                priceMaxInput.value = "";
            }
            updateDropdownLabel();
        });
    });

    // Reset button event listener
    resetButton.addEventListener("click", resetFilters);

    /*
    ***********************************
    ********** Property Size **********
    ***********************************
    */

    const propertySizeListItems = document.querySelectorAll(".property-size-select-list li");

    propertySizeListItems.forEach((item) => {
        item.addEventListener("click", () => {
            const selectedPropertySizeText = item.textContent.trim();
            gSelectedPropertySize = item.getAttribute("value");
            propertySizeButton.textContent = selectedPropertySizeText;
            const dropdownMenu = propertySizeButton.nextElementSibling;
            if (dropdownMenu.classList.contains("show")) {
                dropdownMenu.classList.remove("show");
            }
        });
    });

    /*
    ******************************
    ********** Bedroom **********
    ******************************
    */

    const bedroomListItems = document.querySelectorAll(".bedroom-select-list li");

    bedroomListItems.forEach((item) => {
        item.addEventListener("click", () => {
            const selectedBedroomText = item.textContent.trim();
            gSelectedBedroom = item.getAttribute("value");
            bedroomButton.textContent = selectedBedroomText;
            const dropdownMenu = bedroomButton.nextElementSibling;
            if (dropdownMenu.classList.contains("show")) {
                dropdownMenu.classList.remove("show");
            }
        });
    });

    /**
     * ************************************************************
     * ******************** Search Properties *********************
     * ************************************************************
     */
    $(".btn-search ").off("click").on("click", function (e) {
        e.preventDefault();
        let minPrice = '';
        let maxPrice = '';
        const selectedPriceValue = getPriceSelectedValue();
        if (selectedPriceValue.type === "presetRange") {
            const value = selectedPriceValue.value;

            if (value.startsWith("under")) {
                maxPrice = value.replace("under", "");
            }
            else if (value.startsWith("over")) {
                minPrice = value.replace("over", "");
            }
            else if (value.includes("to")) {
                const [min, max] = value.split("to");
                minPrice = min.trim();
                maxPrice = max.trim();
            }
        }
        else if (selectedPriceValue.type === "customRange") {
            minPrice = selectedPriceValue.min ? selectedPriceValue.min : "";
            maxPrice = selectedPriceValue.max ? selectedPriceValue.max : "";
        }


        const selectedLocationValue = getSelectedLocation();
        const provinceId = selectedLocationValue.province == null ? '' : selectedLocationValue.province.value;
        const provinceText = selectedLocationValue.province == null ? '' : selectedLocationValue.province.text;
        const districtId = selectedLocationValue.district == null ? '' : selectedLocationValue.district.value;
        const districtText = selectedLocationValue.district == null ? '' : selectedLocationValue.district.text;

        const selectedProject = getSelectedProject();
        const projectId = selectedProject == null ? '' : selectedProject.value;
        const projectText = selectedProject == null ? '' : selectedProject.text;

        let minAcreage = '';
        let maxAcreage = '';
        const selectedPropertySize = getPropertySizeSelectedValue();
        let acreage;
        if (selectedPropertySize.includes("under")) {
            acreage = selectedPropertySize.split("under");
            maxAcreage = acreage[1];
        }
        else if (selectedPropertySize.includes("over")) {
            acreage = selectedPropertySize.split("over");
            minAcreage = acreage[1];
        }
        else if (selectedPropertySize.includes("to")) {
            acreage = selectedPropertySize.split("to");
            minAcreage = acreage[0];
            maxAcreage = acreage[1];
        }

        const type = getSelectedPropertyType();

        const bedroom = getBedroomSelectedValue();

        applyFilter(provinceId, districtId, projectId, type, minPrice, maxPrice, 
                    bedroom, minAcreage, maxAcreage, provinceText, districtText, projectText);
        if (window.location.pathname === '/property-detail') {
            // Redirect to properties page
            window.location.href = "/properties";
        } 
    });

}

const applyFilter = (provinceId, districtId, projectId, type, minPrice, maxPrice, 
                    bedroom, minAcreage, maxAcreage, provinceText, districtText, projectText) => {
    const filterObject = {
        provinceId: provinceId,
        districtId: districtId,
        projectId: projectId,
        type: type,
        minPrice: minPrice,
        maxPrice: maxPrice,
        bedroom: bedroom,
        minAcreage: minAcreage,
        maxAcreage: maxAcreage
    };
    localStorage.setItem("filter-object", JSON.stringify(filterObject));

    const filterTexts = {
        province: provinceText ,
        district: districtText ,
        project: projectText
    }

    localStorage.setItem("filter-text", JSON.stringify(filterTexts));
}

document.addEventListener("DOMContentLoaded", () => {
    const filterStringValue = localStorage.getItem("filter-object");
    const filterText = localStorage.getItem("filter-text");
    if(filterStringValue){
        let filterObject = JSON.parse(filterStringValue);
        let filterTextObject = JSON.parse(filterText);
        let tag = null;
        if(filterObject.provinceId != ''){
            tag = createTag(filterTextObject.province, "province");
            selectedTagsContainer.appendChild(tag);
            defaultText.style.display = "none"; // Hide default text

            gSelectedProvince = {
                text: filterTextObject.province,
                value: filterObject.provinceId
            }; // Store selected province
        }

        if(filterObject.districtId != ''){
            tag = createTag(filterTextObject.district, "district");
            selectedTagsContainer.appendChild(tag);

            gSelectedDistrict = {
                text: filterTextObject.district,
                value: filterObject.districtId
            }; // Store selected district
        }

        if(filterObject.projectId != ''){
            projectDropdownButton.textContent = filterTextObject.project;

            gSelectedProject = {
                text: filterTextObject.project,
                value: filterObject.projectId
            }
        }

        if(filterObject.type != ''){
            let liElement = document.querySelector(`.property-type-select-list li[value="${filterObject.type}"]`);
            // Get the text content of the <span> inside the <li>
            let textContent = liElement.querySelector('span').textContent.trim();
            propertyTypeButton.textContent = textContent;

            gSelectedPropertyType = filterObject.type;
        }

        if(filterObject.minPrice != '' || filterObject.maxPrice != ''){
            priceMinInput.value = filterObject.minPrice;
            priceMaxInput.value = filterObject.maxPrice;

            priceFilterDropdown.textContent = 
                                    filterObject.minPrice !== '' && filterObject.maxPrice !== ''
                                    ? `${filterObject.minPrice} - ${filterObject.maxPrice}`
                                    : filterObject.minPrice === ''
                                    ? `Under ${filterObject.maxPrice}`
                                    : `Over ${filterObject.minPrice}`;
        }

        if(filterObject.minAcreage != '' || filterObject.maxAcreage != ''){
            propertySizeButton.textContent = 
                                    filterObject.minAcreage !== '' && filterObject.maxAcreage !== ''
                                    ? `${filterObject.minAcreage} to ${filterObject.maxAcreage} square feet`
                                    : filterObject.minAcreage === ''
                                    ? `Under ${filterObject.maxAcreage} square feet`
                                    : `Over ${filterObject.minAcreage} square feet`;

            gSelectedPropertySize = filterObject.minAcreage !== '' && filterObject.maxAcreage !== ''
                                    ? `${filterObject.minAcreage}to${filterObject.maxAcreage}`
                                    : filterObject.minAcreage === ''
                                    ? `under${filterObject.maxAcreage}`
                                    : `over${filterObject.minAcreage}`;
        }

        if(filterObject.bedroom != ''){
            let liElement = document.querySelector(`.bedroom-select-list li[value="${filterObject.bedroom}"]`);
            // Get the text content of the <span> inside the <li>
            let textContent = liElement.querySelector('span').textContent.trim();
            bedroomButton.textContent = textContent;

            gSelectedBedroom = filterObject.bedroom;
        }
        
    }
    
});