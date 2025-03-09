/**
 * Handle filter
 */

const navLinks = document.querySelectorAll('.filter-container .nav-link');
const filterIcon = document.getElementById("filterIcon");
const filterSection = document.querySelector(".filter-section");
const rowsToDisable = document.querySelectorAll(".row-advance");
const btnContactUs = document.querySelector("#btn-contact-us");

// Add a click event listener to each nav-link
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        navLinks.forEach(nav => nav.classList.remove('active'));

        link.classList.add('active');
    });
});

filterIcon.addEventListener("click", () => {
    filterSection.classList.toggle("filter-active");

    rowsToDisable.forEach(row => {
        row.classList.toggle("filter-active");
    });
});

if (btnContactUs) {
    btnContactUs.addEventListener("click", (e) =>{
        e.preventDefault();
        window.location.href = `/contact-us`;
    });
}
