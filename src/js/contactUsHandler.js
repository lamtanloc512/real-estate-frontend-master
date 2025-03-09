import {validateEmail, validatePhone} from "../../js/common.js";
const gBASE_URL = `${config.apiUrl}`;
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.querySelector(".contact-form form");

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission from refreshing the page

    // Collect form data
    const formData = {
      contactName: contactForm.querySelector("input[placeholder='Last Name']").value.trim() + " "
        + contactForm.querySelector("input[placeholder='First Name']").value.trim(),
      mobile: contactForm.querySelector("input[placeholder='Phone Number']").value.trim(),
      email: contactForm.querySelector("input[placeholder='Email Address']").value.trim(),
      contactTitle: contactForm.querySelector("input[placeholder='Title']").value.trim(),
      note: contactForm.querySelector("textarea[placeholder='Message']").value.trim(),
    };

    // Validate form data (optional)
    // if (!formData.contact_name || !formData.mobile || !formData.email || !formData.contact_title || !formData.note) {
    //   alert("Please fill out all fields.");
    //   return;
    // }
    if(validateFormData(formData)){

      fetch(`${gBASE_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to submit the form. Please try again.");
          }
        })
        .then((data) => {
          alert("Thank you! Your message has been sent.");
          contactForm.reset(); // Clear the form fields
        })
        .catch((error) => {
          alert("There was an error submitting your message. Please try again later.");
        });
      }
  });
});

function validateFormData(paramObject){
  if(!paramObject.contactName || !paramObject.email || !paramObject.mobile || !paramObject.note || !paramObject.contactTitle){
      alert("Please full fill data!");
      return false;
  }
  if (!validateEmail(paramObject.email)){
      return false;
  }
  if (!validatePhone(paramObject.mobile)){
      return false;
  }
  return true;
}