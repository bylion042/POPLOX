

//  <!-- Password toggle -->
        function togglePassword(fieldId, icon) {
            let input = document.getElementById(fieldId);
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("ri-eye-off-line", "ri-eye-line");
            } else {
                input.type = "password";
                icon.classList.replace("ri-eye-line", "ri-eye-off-line");
            }
        }



// <!-- FUNTION TO ReVIEWS  -->
  document.getElementById("reviewForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      title: formData.get("title"),
      review: formData.get("review"),
      rating: formData.get("rating")
    };

    try {
      const response = await fetch("/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      Toastify({
        text: result.message,
        duration: 5000,
        gravity: "top",
        position: "center",
        backgroundColor: response.ok ? "#28a745" : "#dc3545"
      }).showToast();

      if (response.ok) this.reset();
    } catch (err) {
      Toastify({
        text: "Submission failed.",
        duration: 5000,
        gravity: "top",
        position: "center",
        backgroundColor: "#dc3545"
      }).showToast();
    }
  });




    // <!-- FUNCTION TO OPEN SETTING AND CLOSE SETTING  -->
    const openSettings = document.getElementById("open-settings");
    const closeSettings = document.getElementById("close-settings");
    const settingsPanel = document.getElementById("settingsPanel")
    openSettings.addEventListener("click", () => {
        settingsPanel.classList.add("open");
    })
    closeSettings.addEventListener("click", () => {
        settingsPanel.classList.remove("open");
    })
    // Optional: click outside to close
    document.addEventListener("click", (e) => {
        if (!settingsPanel.contains(e.target) && !openSettings.contains(e.target)) {
            settingsPanel.classList.remove("open");
        }
    });




// <!-- FUNCTION TO CHANGE USERNAME, EMAILS AND NUMBER  -->
    document.getElementById("profileForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            newPassword: formData.get("newPassword") // optional
        };

        try {
            const response = await fetch("/auth/update-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            Toastify({
                text: result.message || "Profile updated successfully",
                duration: 4000,
                gravity: "top",
                position: "center",
                backgroundColor: response.ok ? "#28a745" : "#dc3545"
            }).showToast();

            // ✅ Update form fields safely
            const nameInput = document.querySelector("input[name=' name']"); const
                emailInput = document.querySelector("input[name='email' ]"); if (nameInput)
                nameInput.value = result.user.name; if (emailInput)
                emailInput.value = result.user.email;
        } catch (error) {
            Toastify({
                text: "Something went wrong!", duration: 4000, gravity: "top",
                position: "center", backgroundColor: "#dc3545"
            }).showToast();
        }
    });





// Add script to send currency to backend
  function updateCurrency(newCurrency) {
    fetch('/settings/currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currency: newCurrency })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Currency updated!');
        location.reload(); // Reload to reflect new currency in charge + balance
      } else {
        alert('Failed to update.');
      }
    });
  }
