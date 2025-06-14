// HAMBURGER
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const menu = document.querySelector(".hold3");
    const foldIcon = hamburger.querySelector("i:nth-child(1)");
    const unfoldIcon = document.querySelector(".hold3 .hamburger i");
  
    // Toggle menu on hamburger click
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("open");
  
      // Toggle the visibility of the icons (show fold/unfold)
      if (menu.classList.contains("open")) {
        foldIcon.style.display = "none";
        unfoldIcon.style.display = "block"; // Show unfold icon when menu is open
      } else {
        foldIcon.style.display = "block";
        unfoldIcon.style.display = "none"; // Show fold icon when menu is closed
      }
    });
  
    // Close the menu when the unfold icon is clicked
    unfoldIcon.addEventListener("click", () => {
      menu.classList.remove("open");
      foldIcon.style.display = "block";
      unfoldIcon.style.display = "none";
    });
  });
  
  
  
  
  
  // SWEET ALART THAT WELCOMES THE USER 
  document.addEventListener("DOMContentLoaded", function () {
    Swal.fire({
      title: "Join Poplox Telegram",
      html: "Stay updated with the latest rates, offers, and real-time support by joining our official Telegram channel.",
      icon: "info",
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Join Telegram Channel",
      confirmButtonColor: "#787de4",
      width: "400px",
      didOpen: () => {
        document.querySelector(".swal2-title").style.fontSize = "16px";
        document.querySelector(".swal2-title").style.lineHeight = "1.4";
        document.querySelector(".swal2-html-container").style.fontSize = "14px";
        document.querySelector(".swal2-html-container").style.lineHeight = "1.5";
        document.querySelector(".swal2-confirm").style.fontSize = "15px";
        document.querySelector(".swal2-confirm").style.padding = "10px 20px";

        // 🔴 Change icon color
        const icon = document.querySelector(".swal2-icon.swal2-info");
        if (icon) {
          icon.style.borderColor = "#787de4";
          icon.querySelector(".swal2-icon-content").style.color = "#787de4";
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        window.open("https://t.me/poplox000", "_blank");
      }
    });
  });



// ALL ABOUT Top Selling SMM Services
      const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.platform-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs
    tabs.forEach(t => t.classList.remove('active'));
    // Hide all content
    contents.forEach(c => c.classList.remove('active'));

    // Activate clicked tab and its content
    tab.classList.add('active');
    const target = tab.getAttribute('data-platform');
    document.getElementById(target).classList.add('active');
  });
});




  
  
  
  
// POPS UP ONCE YOU ARE IN THE WEB 
// window.onload = function () {
//   const messages = [
//     "Welcome to POPLOX — your social boost HQ!",
//     "Boost your likes, followers, and views instantly.",
//     "Poplox helps you grow your social media fast.",
//     "More followers, more engagement, more power.",
//     "Get real boosts that make your profiles shine.",
//     "Turn up your social game with Poplox boosts.",
//     "Skyrocket your presence on every platform.",
//     "Boost smarter, not harder, with Poplox.",
//     "Watch your socials grow daily with Poplox.",
//     "Get noticed by brands and fans alike.",
//     "Poplox — where social growth meets real results.",
//     "Boost your posts, stories, and reels easily.",
//     "Ready to go viral? Start boosting with Poplox.",
//     "Need help? Contact us at support@poplox.com",
//     "Poplox: Your partner in social media success."
//   ];

//   let messageIndex = 0;

//   function showNextMessage() {
//     Toastify({
//       text: messages[messageIndex],
//       duration: 5000,
//       gravity: "top",
//       position: "left",
//       backgroundColor: "#787de4",
//     }).showToast();

//     messageIndex++;

//     if (messageIndex >= messages.length) {
//       clearInterval(messageInterval);
//     }
//   }
//   const messageInterval = setInterval(showNextMessage, 9000);
// };

  
  
  
  
  // SCROLL TO TOP BUTTON
  document.addEventListener("DOMContentLoaded", () => {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  
    // Show the button when scrolling down, hide when at the top
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {  // When the user scrolls down 200px
        scrollToTopBtn.classList.add("show");
      } else {
        scrollToTopBtn.classList.remove("show");
      }
    });
  
    // Scroll to the top of the page when the button is clicked
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth" // Smooth scrolling
      });
    });
  });





  // ALL ABOUT F ASKED Q 
  document.addEventListener("DOMContentLoaded", function () {
      const faqItems = document.querySelectorAll(".faq-item");

      faqItems.forEach(item => {
          item.addEventListener("click", function () {
              this.classList.toggle("active");
          });
      });
  });

