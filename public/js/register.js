let userCredentials = []; //array to store the user credentials
fetch('/getUserCredentials')
    .then(response => response.json())
    .then(credentials => {
        credentials.forEach((user) => {
            userCredentials.push(user);
        });

        const labels = document.querySelectorAll('.form-control label');
        console.log(labels)
        labels.forEach(label => {
            label.innerHTML = label.innerText
                .split('')
                .map((letter, index) => `<span style= "transition-delay:${index * 50}ms">${letter}</span>`)
                .join('')
        })
        const password = document.getElementById('password')
        const cPassword = document.getElementById('cPassword')
        const regForm = document.getElementById('regForm');
        const emailField = regForm.querySelector('.emailFIeld')
        const emailInput = regForm.querySelector('.emailInput')
        const submitButton = regForm.querySelector('.btn')
        const passwordField = regForm.querySelector('.passwordField')
        const cPasswordField = regForm.querySelector('.cPasswordField')
        const emailPattern = /^[^ ]+@[gmail]+\.[a-z]{2,3}$/;
        // console.log(regForm, submitButton)
        emailInput.addEventListener('input', (event) => {
            const input = event.target.value
            const length = input.length;
            // const mail = 'gmail'
            // console.log(input)
            if (!input.match(emailPattern)) {
                emailInput.style.color = 'red'

            }
            else {
                emailInput.style.color = 'green'

            }
        })
        function checkEmail() {
            if (!emailInput.value.match(emailPattern)) {
                return emailField.classList.add('invalid');
            }
            emailField.classList.remove('invalid');
        }

        //SHOW AND HIDE PASSWORD
        const showPassword = document.querySelectorAll('#eyeSlash');
        // console.log(showPassword)
        showPassword.forEach(eyeIcon => {
            eyeIcon.addEventListener('click', () => {
            alert('clocse')
            const pass = eyeIcon.parentElement.querySelector('input')

                //toggle the type attribute
                if (pass.type === 'password') {
                    eyeIcon.classList.replace('fa-eye-slash', 'fa-eye')
                    return pass.type = 'text';
                }
                else {
                    eyeIcon.classList.replace('fa-eye', 'fa-eye-slash')
                    return pass.type = 'password';
                }
            })
        })
        //PASSWORD VALIDATION
        // function createPassword() {
        //     const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        //     if (!password.value.match(passwordPattern)) {
        //         return passwordField.classList.add('invalid')
        //     }
        //     passwordField.classList.remove('invalid')
        // }
        function confirmPassword() {
            if (password.value !== cPassword.value) {
                return cPasswordField.classList.add('invalid')
            }
            cPasswordField.classList.remove('invalid')
        }
        //CHECK THE LENGTH
        password.addEventListener('input', (event) => {
            event.preventDefault();
            const input = event.target.value
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
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            checkEmail();
            // createPassword();
            confirmPassword();
            emailInput.addEventListener('keypress', checkEmail);
            // password.addEventListener('keypress', createPassword);
            // console.log(emailInput.value, password.value)
            const email = emailInput.value;
            const dbName = email.split('@')[0];
            // alert(dbName)
            const myPassword = password.value;
            if (!emailField.classList.contains('invalid') && !passwordField.classList.contains('invalid') && !cPasswordField.classList.contains('invalid')) {
                // location.href = regForm.getAttribute('action')
                //check if the database name exist,
                //creating an api to check in the database
                const spinner = document.getElementById('spinner');
                spinner.style.display = 'block';
                notification('Please Wait...')
                let isMatched = false;
                userCredentials.forEach(user => {
                    console.log(user)
                    //check if there are any account names that match the one in it
                    //if it matches display message and do not proceed creating account else proceed to create account
                    if (user.User_Account === dbName) {
                        spinner.style.display = 'none';
                        isMatched = true;
                    }
                    else {
                        isMatched = false;
                        spinner.style.display = 'none';

                    }

                });
                if (isMatched === true) {
                    return
                }
                if (isMatched === false) {
                    //  alert('mmmm')
                    // show the spinner
                    spinner.style.display = 'block';
                    notification('Creating Your Account, Please Wait');
                    fetch('/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            myPassword,
                            dbName
                        })
                    })
                        .then(response => {
                            // hide the spinner
                            spinner.style.display = 'none';
                            if (response.ok) {
                                notification('Account Created ');
                                location.href = regForm.getAttribute('action');
                                return response.json();
                            } else {
                                throw new Error('Error creating account');
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            // Handle the error and send the response to the client
                            // ...
                        });
                }

            }
        })
    })
    .catch(error => console.error('Error fetching user credentials:', error));
console.log(userCredentials); // do something with the statuses array
function notification(message) {
    const notificationBlock = document.getElementById('notificationBlock');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    notificationBlock.appendChild(notification);
    //show notification

    setTimeout(function () {
        notification.classList.add('show');
    }, 1000);

    //remove the notification after 3s
    setTimeout(function () {
        notification.classList.remove('show');
        setTimeout(function () {
            notification.remove('show');
        }, 700);
    }, 1000);

}
