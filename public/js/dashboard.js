// Get all the menu items ADDING ACTIVE FOR BIG SCREEN 
const menuItems = document.querySelectorAll('.menu a');

// Function to set the active menu item based on the current URL
function setActiveMenuItem() {
    // Get the current URL path
    const currentPath = window.location.pathname;

    // Loop through each menu item
    menuItems.forEach(item => {
        // Remove 'active' class from all menu items
        item.classList.remove('active');

        // Check if the item's href matches the current path
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
}
// Run the function on page load
setActiveMenuItem();



// close sidebar and open sidebar 
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');
const container = document.querySelector('.container');

toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
    container.classList.toggle('sidebar-closed');

    // Change the icon direction
    const icon = toggleBtn.querySelector('i');
    if (sidebar.classList.contains('closed')) {
        // Change to right arrow when sidebar is closed
        icon.classList.remove('fa-angle-left');
        icon.classList.add('fa-angle-right');
    } else {
        // Change to left arrow when sidebar is open
        icon.classList.remove('fa-angle-right');
        icon.classList.add('fa-angle-left');
    }
});






// Get all the menu items ADDING ACTIVE FOR SMALL SCREEN 
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            const linkURL = new URL(link.href);
            const linkPath = linkURL.pathname;

            // Only activate internal links (same origin)
            if (linkURL.origin === window.location.origin && linkPath === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updateActiveLink();

    // Optional: click effect for instant active feedback (before page load)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const linkURL = new URL(link.href);

            if (linkURL.origin === window.location.origin) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
            // Let normal navigation continue
        });
    });




// HAMBURGER for small screen
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const menuContainer = document.getElementById("menu-container");
    const openIcon = document.getElementById("open-menu");
    const closeMenu = document.getElementById("close-menu");

    // OPEN the menu
    hamburgerMenu.addEventListener("click", function () {
        menuContainer.classList.add("active");
        openIcon.style.display = "none";
    });

    // CLOSE the menu
    closeMenu.addEventListener("click", function () {
        menuContainer.classList.remove("active");
        openIcon.style.display = "block";
    });
});







// ALL ABOUT  SLIDE 
document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll(".centered-content");
    let currentIndex = 0;
    let totalSlides = slides.length;

    function slideShow() {
        let currentSlide = slides[currentIndex];
        let nextIndex = (currentIndex + 1) % totalSlides;
        let nextSlide = slides[nextIndex];

        // Slide out the current slide
        currentSlide.style.transform = "translateX(-100%)";
        currentSlide.style.opacity = "0";

        // Slide in the next slide
        nextSlide.style.transform = "translateX(0)";
        nextSlide.style.opacity = "1";
        nextSlide.style.left = "0";

        // Reset previous slide position
        setTimeout(() => {
            currentSlide.style.left = "100%"; // Move it back for the next cycle
            currentSlide.style.transform = "none";
        }, 1500);

        currentIndex = nextIndex;
    }

    // Start auto-sliding every 5 seconds
    setInterval(slideShow, 5000);
});



