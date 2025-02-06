let userCredentials = []
fetch('/dbname')
    .then(response => response.json())
    .then(data => {

        //This will contain all the Menu Items and all the pages that should have this will access this single code
        const menuItems = document.querySelector(".icon-nav");
        menuItems.insertAdjacentHTML(
            "afterbegin",
            `
<div class="icon-bar">

    <ul class="nav-list">
        <li class="nav-icon">
          <div class="icon-link">
            <a class="icon" id="accountIcon">
             <img src="images/login.png" alt="" srcset="">
                <span class="link_name">${data.dbName}</span>
            </a>
                     <i class="fas fa-caret-down arrow" ></i>

        </div>
        <ul class="sub-menu">
             <li>   <a>Account</a></li>
              <li>  <a id='logoutButton' href="logout">Sign Out</a></li>
           
        </ul>
      </li>
        <hr class="horizontal-line1">
        <!--Sales Summery  page link-->
        <li class="nav-icon">
        <div class="icon-link">
            <a class="icon" id="cashMngmntIcon"> <img src="images/cashflow.png" alt="" srcset="">
                <span class="link_name">  Cash Management</span>
            </a>
             <i class="fas fa-caret-down arrow" ></i>
            <span class="tooltip">Cash Management</span>
        </div>
        <ul class="sub-menu">
               <li> <a href="advanceCashMngmnt">Advanced Cash Management</a>  </li>
               <li>  <a href="Categories">Categories</a></li>
                <li> <a href="TrialBalance">Trial Balance</a></li>
        </ul>
        </li>

        <!--Settings management page link-->
        <li class="nav-icon">
         <div class="icon-link">
            <a class="icon" id="settingsIcon"> <img src="images/settings.png" alt="" srcset="">
                <span class="link_name">Settings</span>
            </a>
            <i class="fas fa-caret-down arrow" ></i>
            <span class="tooltip">Settings</span>
        </div>
        <ul class="sub-menu">
            <li>
                <a href="settings">Settings</a>
            </li>
        </ul>
        </li>

        <!--help center management page link-->
        <li class="nav-icon">
          <div class="icon-link">
            <a class="icon" id="termsIcon"> <img src="images/helpCenter.png" alt="" srcset="">
                <span class="link_name">Terms & Conditions</span>
            </a>
             <i class="fas fa-caret-down arrow" ></i>
            <span class="tooltip">Ts & Cs</span>
            </div>
        <ul class="sub-menu">
            <li >
                <a href="termsandconditions">Terms & Conditions</a>
            </li>
        </ul>
        </li>

    </ul>
</div>
`
        );
        const sidebarMenu = document.querySelector(".icon-nav");
        const closeBtn = document.querySelector(".iconbtn");
        let allIcons = document.querySelectorAll('.nav-icon')
        let subMenus = document.querySelectorAll('.sub-menu');
        // closeBtn.addEventListener("click", function () {
        //     sidebarMenu.classList.toggle("close");
        //    
        //     subMenus.forEach(subMenu => {
        //         if (subMenu.classList.contains('open')) {
        //             subMenu.classList.remove('open');  // Close the currently open sub-menu
        //         }
        //     })
        // })
        // let isClicked = false
        // allIcons.forEach(element => {
        //     element.addEventListener("click", (e) => {
        //         if (sidebarMenu.classList.contains("close")) {
        //             // Now, toggle the clicked sub-menu
        //             const currentSubMenu = element.querySelector('.sub-menu');
        //             isClicked = currentSubMenu.classList.contains('open')
        //             if (isClicked) {
        //                 element.classList.remove('show');  // Close the currently open sub-menu
        //                 currentSubMenu.classList.remove('open'); // Toggle the open/close state of the clicked sub-menu
        //             }
        //             else {
        //                 //first check if there are any dropdowns open
        //                 let subMenus = document.querySelectorAll('.sub-menu');
        //                 subMenus.forEach(subMenu => {
        //                     if (subMenu.classList.contains('open')) {
        //                         subMenu.classList.remove('open');  // Close the currently open sub-menu
        //                     }
        //                 })
        //                 element.classList.remove('show');  // Close the currently open sub-menu
        //                 currentSubMenu.classList.toggle('open'); // Toggle the open/close state of the clicked sub-menu
        //             }
        //         }
        //         else {
        //             //first check if there are any dropdowns open
        //             // allIcons.forEach(icon => {
        //             //     if (icon.classList.contains('show')) {
        //             //         icon.classList.remove('show');  // Close the currently open sub-menu
        //             //     }
        //             // })
        //             element.classList.toggle("show");
        //         }
        //     });
        // });
        // Function to close all dropdown menus
        function closeAllDropdowns() {
            subMenus.forEach(subMenu => {
                subMenu.classList.remove('open');
            });
            allIcons.forEach(icon => {
                icon.classList.remove('show');
            });
        }

        // Close the sidebar when the close button is clicked
        closeBtn.addEventListener("click", function () {
            sidebarMenu.classList.toggle("close");
            closeAllDropdowns();  // Close all open dropdowns when sidebar closes
        });

        // Handle icon clicks for dropdown toggling
        allIcons.forEach(element => {
            element.addEventListener("click", (e) => {
                if (sidebarMenu.classList.contains("close")) {
                    // If sidebar is closed, toggle the dropdown for the clicked icon
                    const currentSubMenu = element.querySelector('.sub-menu');
                    if (currentSubMenu.classList.contains('open')) {
                        currentSubMenu.classList.remove('open');  // Close the clicked dropdown
                    } else {
                        closeAllDropdowns();  // Close any other dropdown
                        currentSubMenu.classList.add('open');  // Open the clicked dropdown
                    }
                } else {
                    if (element.classList.contains('show')) {
                        element.classList.remove('show');  // Close the clicked dropdown
                    } else {
                        closeAllDropdowns();  // Close any other dropdown
                        element.classList.add('show');  // Open the clicked dropdown
                    }
                }
            });
        });

        // Close the sidebar when clicking outside of it
        document.addEventListener("click", (e) => {
            // Check if the click was outside of the sidebar
            if (!sidebarMenu.contains(e.target) && !closeBtn.contains(e.target)) {
                sidebarMenu.classList.add("close");  // Close the sidebar
                closeAllDropdowns();  // Close all open dropdowns
            }
        });
        function logout() {
            fetch("/logout", {
                method: "POST",
                credentials: "same-origin" // Ensure cookies (session) are sent with the request
            })
                .then(response => response.text())
                .then(message => {
                    console.log(message);  // 'Logged out!'
                    window.location.href = "/"; // Redirect to login page
                })
                .catch(error => console.error("Logout error:", error));
        }

        // Call this function when the user clicks the logout button
        document.getElementById("logoutButton").addEventListener("click", logout);

    })

    .catch(error => console.error('Error fetching database name:', error));
