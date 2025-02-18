const loginForm = document.getElementById('loginForm');
const emailField = document.querySelector('.emailFIeld') //SUSPECTING DUPLICATION OF LOGIC, USE ONE
const emailInput = document.getElementById('emailID')
const password = document.getElementById('password')
const password1 = document.getElementById('password1')
const passwordField = loginForm.querySelector('.passwordField')
const submitButton = document.querySelector('.btn')
const newClient = loginForm.querySelector('.newto')
const existingClient = loginForm.querySelector('.member')
const erroMsg = loginForm.querySelector('.error-textEmail')
const emailPattern = /^[^ ]+@[gmail.com]+\.[a-z]{2,3}$/;
const header = document.getElementById('heading')
let buttonContent = submitButton.textContent;
localStorage.setItem('buttonContent', buttonContent)
//==================================================================================================================================
//SHOW AND HIDE PASSWORD we will need to under stand this
const showPassword = document.getElementById('eyeSlash');
const showPasswordConfirm = document.getElementById('confirmPassword')

showPassword.addEventListener('click', (e) => {
    //toggle the type attribute
    if (password.type === 'password') {
        showPassword.classList.replace('fa-eye-slash', 'fa-eye')
        return password.type = 'text';
    }
    else {
        showPassword.classList.replace('fa-eye', 'fa-eye-slash')
        return password.type = 'password';
    }
});
showPasswordConfirm.addEventListener('click', (e) => {
    //toggle the type attribute
    if (password1.type === 'password') {
        showPasswordConfirm.classList.replace('fa-eye-slash', 'fa-eye')
        return password1.type = 'text';
    }
    else {
        showPasswordConfirm.classList.replace('fa-eye', 'fa-eye-slash')
        return password1.type = 'password';
    }
});


//===========================================================================================================================
//THIS IS FOR VERIFYING THE EMAIL STRUCTURE
// Check on input for floating effect when typing
emailInput.addEventListener('input', function () {
    if (emailInput.value.trim() !== '') {
        label.classList.add('float'); // Add a class when there is input
    } else {
        label.classList.remove('float'); // Remove class when input is empty
    }
});

emailInput.addEventListener('input', (event) => {
    const input = event.target.value
    const length = input.length;
    if (!input.match(emailPattern)) {
        emailInput.style.color = 'red'
    }
    else {
        emailInput.style.color = 'green'
    }
});
//==================================================================================================================================
//THIS IS FOR VERIFYING THE PASSWORD STRUCTURE
const label = document.querySelector('.emailInput~label');
//CHECK THE LENGTH
password.addEventListener('input', (e) => {
    e.preventDefault();
    const input = e.target.value
    const length = input.length;
    if (length < 5) {
        password.style.color = 'red';
    }
    else if (length > 5 && length < 10) {
        password.style.color = 'blue';
    }
    else {
        password.style.color = 'green';
    }
})

password1.addEventListener('input', (e) => {
    e.preventDefault();
    const input = e.target.value //EXPLAIN THIS IN DETAIL, TAKE THE INNERTEXT APPROACH
    const length = input.length;
    if (length < 5) {
        password1.style.color = 'red';
    }
    else if (length > 5 && length < 10) {
        password1.style.color = 'blue';
    }
    else {
        password1.style.color = 'green';
    }
})
//======================================================================================================================
//WHEN THE USER HAS NO ACCOUNT, SIGN UP
newClient.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("new user");
    submitButton.textContent = 'Sign Up';
    document.getElementById('confirm').classList.remove('hidden');
    document.getElementById('user').classList.remove('hidden');
    document.getElementById('newuser').classList.add('hidden');
    header.textContent = 'Create Your Slyretail Account'
    buttonContent = 'Sign Up';
    loginForm.reset();
    const showConfirmPassword = document.getElementById('confirmPassword');
    showConfirmPassword.addEventListener('click', (e) => {
        //toggle the type attribute
        if (password.type === 'password') {
            showConfirmPassword.classList.replace('fa-eye-slash', 'fa-eye')
            return password.type = 'text';
        }
        else {
            showConfirmPassword.classList.replace('fa-eye', 'fa-eye-slash')
            return password.type = 'password';
        }
    });
});

//WHEN THE USER HAS ALREADY AN ACCOUNT, SIGN IN
existingClient.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("old user");
    submitButton.textContent = 'Sign In';
    document.getElementById('user').classList.add('hidden');
    document.getElementById('newuser').classList.remove('hidden');
    document.getElementById('confirm').classList.add('hidden');
    header.textContent = 'Sign In To Your SlyRetail Account'
    buttonContent = 'Sign In';
    loginForm.reset();
});
//WHEN THE USER EITHER CLICKS ON SIGN UP OR SIGN IN
submitButton.addEventListener('click', (e) => {
    //    alert(buttonContent)
    e.preventDefault();
    const email = emailInput.value;
    const dbName = email.split('@')[0];
    const myPassword = password.value;
    // checking for valid email and password  
    if (email === '') {
        notification("Email Cant Be Empty")
        return
    } else {
        if (!emailInput.value.match(emailPattern)) {
            notification('Invalid Email Input')
            return
        }
    }

    if (myPassword === '') {
        notification('Password field cant be empty ')
        return
    } else {
        if (myPassword.length < 7) {
            notification("Pasword characters cant be less than 7")
            return
        }
    }
    // ===========================================================================================
    document.querySelector('.myloader').style.display = 'block'
    fetch('/signinsignup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            buttonContent,
            dbName,
            email,
            myPassword,
        })
    }).then(response => response.json())
        .then(data => {
            if (data.loggedInStatus === "True") {

                // Accessing session ID cookie (express-session's default name is 'connect.sid')
                const getSessionId = () => {
                    const cookies = document.cookie.split('; ');
                    console.log(cookies);
                    for (let i = 0; i < cookies.length; i++) {
                        const cookie = cookies[i].split('=');
                        if (cookie[0] === 'connect.sid') {
                            // Decode the URL-encoded session ID
                            const sessionId = decodeURIComponent(cookie[1]);
                            //Remove the 's:' prefix and return only the actual session ID
                            const actualSessionId = sessionId.split(':')[1].split('.')[0];
                            return actualSessionId;  // Return only the session ID without 's:'
                        }
                    }
                    return null; // If the session cookie is not found
                };

                console.log(getSessionId());
                localStorage.setItem('sessionId', getSessionId())


                const mySessionId = getSessionId()
                if (mySessionId !== null) {
                    notification('Login Successful... Directing to page.');
                    document.querySelector('.myloader').style.display = 'none'
                    window.location.href = '/advanceCashMngmnt';  // This runs in the browser
                }
                else {
                    // notification('Login failed. Please try again.');
                    document.querySelector('.myloader').style.display = 'none'
                    notification(data.loggedInStatus);

                }
            } else {
                document.querySelector('.myloader').style.display = 'none'
                notification(data.loggedInStatus);
            }
        })
});
function notification(message) {
    const notificationBlock = document.getElementById('notificationBlock');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    notificationBlock.appendChild(notification);

    // Show notification with a delay
    setTimeout(function () {
        notification.classList.add('show'); // Trigger fade-in + slide-in
    }); // 1 second delay before showing

    // Remove notification after 4 seconds (1 second fade-in + 3 seconds visible)
    setTimeout(function () {
        notification.classList.remove('show'); // Trigger fade-out + slide-out
        setTimeout(function () {
            notification.remove(); // Remove the notification element after the animation
        }, 700); // Wait for the fade-out transition to finish before removing
    }, 4000); // 4 seconds total visible time
}
