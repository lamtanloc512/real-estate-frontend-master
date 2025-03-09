const gBASE_URL = config.apiUrl;
const gCONTENT_TYPE = "application/json; charset=UTF-8";
var gSelectedProvinceData = "";
var gSelectProvinceId = 0;
var gProvinceSelectElement = $("#province-select");
var gDistrictSelectElement = $("#district-select");
var gWardsSelectElement = $("#ward-select");
var gProvinceSelectedText = "";
var gAdd = true;
var gProvinceList = [];
var gDistrictList = [];
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
/*
* **********************************
* On page load - load Province data
* **********************************
*/
$(document).ready(function () {
  jwt = Cookies.get('jwt');
  if (!jwt) {
    window.location.href = '/admin';
  }
  onPageLoad();
})

function onPageLoad() {
  callGetAllProvincesApi();
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

/*
* **********************************
* On change Province data - CRUD Province
* **********************************
*/

gProvinceSelectElement.on("change", function () {
  gDistrictSelectElement.html("<option disabled selected value>--Chọn--</option>");
  gSelectedProvinceData = $(this).val();
  gSelectProvinceId = gSelectedProvinceData.split(".")[0];
  var bProvinceCode = gSelectedProvinceData.split(".")[1];

  gProvinceSelectedText = $(this).find("option:selected").text(); // Text của option được chọn

  // Ghi giá trị vào các input
  $("#input-province-code").val(bProvinceCode);
  $("#input-province-name").val(gProvinceSelectedText);

  getDistrictsByProvinceCode(gDistrictSelectElement, bProvinceCode);
});

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

$("#btn-add-province").click(function (e) {
  e.preventDefault();
  gAdd = true;
  $("#provinceModal").modal("show");
});

$("#btn-update-province").click(function (e) {
  e.preventDefault();
  gAdd = false;
  if (gSelectProvinceId != 0 && gAdd == false) {
    $("#provinceModal").modal("show");
  }
  else {
    alert("Please select a province !");
  }
})

function getProvinceInput(paramProvince) {
  $(".valididate-province-name").css("display", "none");
  $(".valididate-province-code").css("display", "none");
  paramProvince.name = $("#input-province-name").val().trim();
  paramProvince.code = $("#input-province-code").val().trim();
}

function validateProvinceInput(paramProvince) {
  if (paramProvince.name.length < 2) {
    $(".valididate-province-name").css("display", "block");
    return false;
  }
  if (paramProvince.code.length < 2) {
    $(".valididate-province-code").css("display", "block");
    return false;
  }
  return true;
}

$("#btn-delete-province").click(function (e) {
  e.preventDefault();
  if (gSelectProvinceId != 0) {
    $(".delete-message").html("Bạn có chắc muốn xoá tỉnh/thành " + gProvinceSelectedText + " không?");
    $("#confirmDeleteProvinceModal").modal("show");
  }
  else {
    alert("Please select a province !");
  }
})

$("#provinceModal").on("hidden.bs.modal", function () {
  $(".valididate-province-name").hide();
  $(".valididate-province-code").hide();
  $("#input-province-name").val("");
  $("#input-province-code").val("");
});

$(".btn-submit-save-province").click(function (e) {
  var vProvince = {
    "name": "",
    "code": ""
  };
  getProvinceInput(vProvince);
  if (validateProvinceInput(vProvince)) {
    if (gSelectProvinceId != 0 && gAdd == false) {
      callUpdateProvinceApi(gSelectProvinceId, vProvince);
    }
    else {
      callAddProvinceApi(vProvince);
    }
  }

});

$(".btn-confirm-delete-province").click(function (e) {
  callDeleteProvinceApi(gSelectProvinceId);
})

$("#successModal").on("hidden.bs.modal", function () {
  location.reload();
});

function callAddProvinceApi(paramProvince) {
  $.ajax({
    url: `${gBASE_URL}/provinces/create`,
    type: "POST",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(paramProvince),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#provinceModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callUpdateProvinceApi(paramId, paramProvince) {
  $.ajax({
    url: `${gBASE_URL}/provinces/update/${paramId}`,
    type: "PUT",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(paramProvince),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#provinceModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callDeleteProvinceApi(paramId) {
  $.ajax({
    url: `${gBASE_URL}/provinces/delete/${paramId}`,
    type: "DELETE",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#confirmDeleteProvinceModal").modal("hide");
      $("#successModal").modal("show");

    },
    error: function (pXhrObj) {
    }
  });
}


/*
* **********************************
* On change District data - CRUD District
* **********************************
*/

gDistrictSelectElement.on("change", function () {
  gWardsSelectElement.html("<option disabled selected value>--Chọn--</option>");
  gSelectedDistrictData = $(this).val();
  gDistrictId = gSelectedDistrictData.split(".")[0];
  gDistrictName = gSelectedDistrictData.split(".")[1];
  gDistrictPrefix = gSelectedDistrictData.split(".")[2];

  getWardsByDistrictName(gDistrictName);

  // Ghi giá trị vào các input
  $("#input-district-name").val(gDistrictName);
  $("#select-district-prefix").val(gDistrictPrefix);
});

function getWardsByDistrictName(pDistrictName) {
  $.ajax({
    url: `${gBASE_URL}/wards?districtName=${pDistrictName}&provinceName=${gProvinceSelectedText}`,
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


$("#btn-add-district").click(function (e) {
  e.preventDefault();
  gAdd = true;
  $("#select-province-name").prop("disabled", false);
  $("#districtModal").modal("show");
});

$(".btn-submit-add-district").click(function (e) {
  var vDistrict = {
    "name": "",
    "prefix": "",
    "province": ""
  };
  getDistrictInput(vDistrict);
  if (validateDistrictInput(vDistrict)) {
    if (gDistrictName != "" && gAdd == false) {
      callUpdateDistrictApi(gDistrictId, vDistrict);
    }
    else {
      callAddDistrictApi(vDistrict);
    }
  }
});

$("#btn-update-district").click(function (e) {
  e.preventDefault();
  gAdd = false;
  if (gDistrictName != "" && gAdd == false) {
    $("#select-province-name").prop("disabled", "disabled");
    $("#districtModal").modal("show");
  }
  else {
    alert("Please select a province !");
  }

})

function getDistrictInput(paramDistrict) {
  $(".valididate-district-name").css("display", "none");
  $(".valididate-district-province").css("display", "none");
  paramDistrict.name = $("#input-district-name").val().trim();
  paramDistrict.prefix = $("#select-district-prefix").val();
  paramDistrict.province = $("#select-province-name").val().split(".")[1];
}

function validateDistrictInput(paramDistrict) {
  if (paramDistrict.name.length < 2) {
    $(".valididate-district-name").css("display", "block");
    return false;
  }
  if (paramDistrict.province == null) {
    $(".valididate-district-province").css("display", "block");
    return false;
  }
  return true;
}

$("#btn-delete-district").click(function (e) {
  e.preventDefault();
  if (gDistrictId != 0) {
    $(".delete-message").html("Bạn có chắc muốn xoá quận/huyện " + gDistrictName + " không?");
    $("#confirmDeleteDistrictModal").modal("show");
  }
  else {
    alert("Please select a district !");
  }
});

$(".btn-confirm-delete-district").click(function (e) {
  callDeleteDistrictApi(gDistrictId);
})

$("#districtModal").on("show.bs.modal", function () {
  var vProvinceSelectEleOfDistrict = $("#select-province-name")
  loadDataToProvinceSelect(vProvinceSelectEleOfDistrict, gProvinceList);
  vProvinceSelectEleOfDistrict.val(gSelectedProvinceData);
});

$("#districtModal").on("hidden.bs.modal", function () {
  $(".valididate-district-name").hide();
  $(".valididate-district-province").hide();
  $("#input-district-name").val("");
  $("#input-district-prefix").val("");
});

function callAddDistrictApi(paramDistrict) {
  let vRequestBody = { "name": paramDistrict.name, "prefix": paramDistrict.prefix };
  $.ajax({
    url: `${gBASE_URL}/districts/create?proviceCode=${paramDistrict.province}`,
    type: "POST",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(vRequestBody),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#districtModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callUpdateDistrictApi(paramId, paramDistrict) {
  let vRequestBody = { "name": paramDistrict.name, "prefix": paramDistrict.prefix };
  $.ajax({
    url: `${gBASE_URL}/districts/update/${paramId}`,
    type: "PUT",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(paramDistrict),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#districtModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callDeleteDistrictApi(paramId) {
  $.ajax({
    url: `${gBASE_URL}/districts/delete/${paramId}`,
    type: "DELETE",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#confirmDeleteDistrictModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

/*
* **********************************
* On change Province data - CRUD Province
* **********************************
*/





gWardsSelectElement.on("change", function () {
  gSelectedWardData = $(this).val();
  gWardId = gSelectedWardData.split(".")[0];
  gWardName = gSelectedWardData.split(".")[1];
  gWardPrefix = gSelectedWardData.split(".")[2];

  // Ghi giá trị vào các input
  $("#input-ward-name").val(gWardName);
  $("#select-ward-prefix").val(gWardPrefix);
});

$("#ward-select-province-name").on("change", function () {
  let vDistrictSelectElement = $("#select-district-name");
  vDistrictSelectElement.html("<option disabled selected value>--Chọn--</option>");
  gSelectedProvinceData = $(this).val();
  gSelectProvinceId = gSelectedProvinceData.split(".")[0];
  var bProvinceCode = gSelectedProvinceData.split(".")[1];

  gProvinceSelectedText = $(this).find("option:selected").text(); // Text của option được chọn

  // Ghi giá trị vào các input
  $("#input-province-code").val(bProvinceCode);
  $("#input-province-name").val(gProvinceSelectedText);

  getDistrictsByProvinceCode(vDistrictSelectElement, bProvinceCode);
});

$("#btn-add-ward").click(function (e) {
  e.preventDefault();
  gAdd = true;
  $("#wardModal").modal("show");
  $("#ward-select-province-name").prop("disabled", false);
  $("#select-district-name").prop("disabled", false);
});

$(".btn-submit-add-ward").click(function (e) {
  var vWard = {
    "name": "",
    "prefix": "",
    "province": "",
    "district": ""
  };
  getWardInput(vWard);
  if (validateWardInput(vWard)) {
    if (gWardName != "" && gAdd == false) {
      callUpdateWardApi(gWardId, vWard);
    }
    else {
      callAddWardApi(vWard);
    }
  }
});

$("#btn-update-ward").click(function (e) {
  e.preventDefault();
  gAdd = false;
  if (gWardName != "" && gAdd == false) {
    $("#wardModal").modal("show");
    $("#ward-select-province-name").prop("disabled", "disabled");
    $("#select-district-name").prop("disabled", "disabled");
  }
  else {
    alert("Please select a province !");
  }

})

function getWardInput(paramWard) {
  $(".valididate-ward-name").css("display", "none");
  $(".valididate-ward-province").css("display", "none");
  $(".valididate-ward-district").css("display", "none");
  paramWard.name = $("#input-ward-name").val().trim();
  paramWard.prefix = $("#select-ward-prefix").val();
  paramWard.province = $("#ward-select-province-name").find("option:selected").text();
  paramWard.district = $("#select-district-name").find("option:selected").text();
}

function validateWardInput(paramWard) {
  if (paramWard.name.length < 2) {
    $(".valididate-ward-name").css("display", "block");
    return false;
  }
  if (paramWard.province == null) {
    $(".valididate-ward-province").css("display", "block");
    return false;
  }
  if (paramWard.district == null) {
    $(".valididate-ward-district").css("display", "block");
    return false;
  }
  return true;
}

$("#btn-delete-ward").click(function (e) {
  e.preventDefault();
  if (gWardId != 0) {
    $(".delete-message").html("Bạn có chắc muốn xoá phường/xã " + gWardName + " không?");
    $("#confirmDeleteWardModal").modal("show");
  }
  else {
    alert("Please select a ward !");
  }
});

$(".btn-confirm-delete-ward").click(function (e) {
  callDeleteWardApi(gWardId);
})

$("#wardModal").on("show.bs.modal", function () {
  var vProvinceSelectEleOfWard = $("#ward-select-province-name");
  loadDataToProvinceSelect(vProvinceSelectEleOfWard, gProvinceList);
  vProvinceSelectEleOfWard.val(gSelectedProvinceData);

  var vDistrictSelectEleOfWard = $("#select-district-name");
  loadDataToDistrictSelect(vDistrictSelectEleOfWard, gDistrictList);
  vDistrictSelectEleOfWard.val(gSelectedDistrictData);
});

$("#wardModal").on("hidden.bs.modal", function () {
  $(".valididate-ward-name").hide();
  $(".valididate-ward-province").hide();
  $(".valididate-ward-district").hide();
  $("#input-ward-name").val("");
  $("#select-ward-prefix").val("");
  $("#ward-select-province-name").val("");
  $("#select-district-name").val("");
});

function callAddWardApi(paramWard) {
  let vRequestBody = { "name": paramWard.name, "prefix": paramWard.prefix };
  $.ajax({
    url: `${gBASE_URL}/wards/create?districtName=${paramWard.district}&provinceName=${paramWard.province}`,
    type: "POST",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(vRequestBody),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#wardModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callUpdateWardApi(paramId, paramWard) {
  let vRequestBody = { "name": paramWard.name, "prefix": paramWard.prefix };
  $.ajax({
    url: `${gBASE_URL}/wards/update/${paramId}`,
    type: "PUT",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    data: JSON.stringify(vRequestBody),
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#wardModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}

function callDeleteWardApi(paramId) {
  $.ajax({
    url: `${gBASE_URL}/wards/delete/${paramId}`,
    type: "DELETE",
    headers:{
      'Authorization': `Bearer ${jwt}`
    },
    contentType: gCONTENT_TYPE,
    success: function (pObjRes) {
      $("#confirmDeleteWardModal").modal("hide");
      $("#successModal").modal("show");
    },
    error: function (pXhrObj) {
    }
  });
}
