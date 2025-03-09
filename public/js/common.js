const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const websiteRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/\S*)?$/;

export function validateEmail(email) {
    if (!emailRegex.test(email)) {
        alert("Please input correct email!");
        return false;
    }
    return true;
}

export function validatePhone(phone) {
    if (!phoneRegex.test(phone)) {
        alert("Please input correct phone!");
        return false;
    }
    return true;
}

export function validateWebsite(website) {
    if (website && !websiteRegex.test(website)) {
        alert("Please input correct website!");
        return false;
    }
    return true;
}

export function appendDropdownDataThrowApi(paramUrl , paramDropdownElement, jwt) {
    $.ajax({
        url: `${paramUrl}`,
        type: 'GET',
        dataType: 'json',
        headers: {
            'Authorization': `Bearer ${jwt}`
        },
        success: function (data) {
            loadDropdownData(data, paramDropdownElement);
        },
        error: function (xhr, status, error) {
        }
    })
}

function loadDropdownData(paramData, paramDropdownElement){
    paramData.forEach(project => {
        const $item = $(
            `<option value="${project.id}">${project.name}</option>`
        )
        paramDropdownElement.append($item);
    });
}