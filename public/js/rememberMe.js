
// Get the checkbox element
var checkbox = document.getElementById("rememberMe");

// Check if the checkbox is checked and save the state to localStorage
checkbox.addEventListener("change", function () {
    localStorage.setItem("remember", this.checked);
    // alert('rememberMe')
});

// Restore the checkbox state from localStorage
var rememberMe = localStorage.getItem("rememberMe");
if (rememberMe === "true") {
    checkbox.checked = true;
    // alert('remembered')

}
