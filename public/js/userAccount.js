let userCredentials = []; //array to store the user credentials
let newCurrencies = []//array to store currencies
let baseCurrency = ''//to store base currency selected
fetch('/getUserCredentials')
    .then(response => response.json())
    .then(credentials => {
        credentials.forEach((user) => {
            userCredentials.push(user);
        });
        fetch('/currencies')
            .then(response => response.json())
            .then(currencies => {
                currencies.forEach((currency) => {
                    newCurrencies.push(currency);
                });

                const editIcon = document.getElementById('editIcon');
                const eIcon = document.getElementById('eIcon');

                const editFieldEmail = document.getElementById('editFieldModal');
                const editFieldPassword = document.getElementById('editFieldModal3');
                const editFieldCPassword = document.getElementById('editFieldModal0');
                const editFieldOldPassword = document.getElementById('editFieldModal2');

                const saveValueBtnEmail = document.getElementById('save-value-btn-email');
                const saveOldBtnPass = document.getElementById('save-old-btn-pass');
                const saveNewBtnPass = document.getElementById('save-new-btn-pass');
                const saveValueBtnCPass = document.getElementById('save-Current-btn');

                const emailInput = document.getElementById('email');
                const newEmailInput = document.getElementById('newEmail');
                const passwordInput = document.getElementById('password');
                const newPasswordInput = document.getElementById('newPassword');
                const oldPasswordInput = document.getElementById('oldPassword');
                const currentPasswordInput = document.getElementById('currentPassword');

                const userEmail = document.querySelector('.myEmail').innerHTML;
                const emailPattern = /^[^ ]+@[gmail]+\.[a-z]{2,3}$/;

                const cancelBtn = document.getElementById('trashCancel');
                const deleteBtn = document.querySelector('.deleteAccount');
                const saveChanges = document.getElementById('saveChanges');
                const modallCancell = document.getElementById('modallCancell');
                const modallCanc = document.getElementById('modallCanc');
                const modalCancel = document.getElementById('modallCancel');
                const modalCanc = document.getElementById('modalCanc');
                if (userEmail !== '') {
                    emailInput.value = userEmail.trim() + '@gmail.com' //fill the email input text with the account name = tha gmail.com tag
                }
                //display the password of the currently logged in account
                const userAcc = Array.from(userCredentials).find(user => user.User_Account === userEmail.trim());
                // alert(userEmail)
                const userPassword = Array.from(userCredentials).find(user => user.DbPassword === userAcc.DbPassword);
                //store the value in the password field
                passwordInput.value = userPassword.DbPassword
                //DISABLE THE EMAIL AND PASSWORD INPUT FIELD SO THAT ONE CANNOT EDIT IN IT
                emailInput.disabled = true;
                passwordInput.disabled = true;
                newEmailInput.addEventListener('input', (event) => {
                    const input = event.target.value
                    const length = input.length;
                    if (!input.match(emailPattern)) {
                        emailInput.style.color = 'red'
                    }
                    else {
                        emailInput.style.color = 'green'
                    }
                })

                function checkEmail() {//check if the email is in expected format
                    if (!newEmailInput.value.match(emailPattern)) {
                        return editFieldEmail.classList.add('invalid');
                    }
                    editFieldEmail.classList.remove('invalid');
                }

                editIcon.addEventListener('click', () => {//OPEN EDIT MODAL ON EMAIL PEN CLICK TO ENTER THE CURRENT PASSWORD OF THE ACCOUNT
                    editFieldCPassword.style.display = 'block';
                });
                eIcon.addEventListener('click', () => {//OPEN EDIT MODAL ON PASSWORD PEN CLICK
                    // oldPasswordInput.value = passwordInput.value;
                    editFieldOldPassword.style.display = 'block';
                });
                const emailName = emailInput.value;//GET THE VALUE OF THE EMAIL
                const email = emailName.split('@')[0];//SPLIT TO GET THE NAME BEFORE THE @ TAG
                saveValueBtnCPass.addEventListener('click', () => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    //check if the current passwords match old and new password
                    const currentPassword = currentPasswordInput.value// get the value of the current password
                    const userPassword = Array.from(userCredentials).find(user => user.DbPassword === currentPassword);
                    if (userPassword) {//If the password matches display the email dialog
                        //  newEmailInput.value = emailInput.value;
                        editFieldEmail.style.display = 'block';
                        editFieldCPassword.style.display = 'none';
                    }
                    else {
                        currentPasswordInput.style.color = 'red';
                        notification('Password Do Not Match...')
                        editFieldCPassword.style.display = 'block';
                    }

                });
                //HWEN ENTER IS CLICKED
                editFieldCPassword.addEventListener('keydown', (event) => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    if (event.key === 'Enter') {
                        //check if the current passwords match old and new password
                        const currentPassword = currentPasswordInput.value// get the value of the current password
                        const userPassword = Array.from(userCredentials).find(user => user.DbPassword === currentPassword);
                        if (userPassword) {//If the password matches display the email dialog
                            //  newEmailInput.value = emailInput.value;
                            editFieldEmail.style.display = 'block';
                            editFieldCPassword.style.display = 'none';
                        }
                        else {
                            currentPasswordInput.style.color = 'red';
                            notification('Password Do Not Match...')
                            editFieldCPassword.style.display = 'block';
                        }
                        event.preventDefault()

                    }
                });
                saveValueBtnEmail.addEventListener('click', () => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    checkEmail()
                    emailInput.value = newEmailInput.value;
                    editFieldEmail.style.display = 'none';
                });
                //when  enter is cliked
                newEmailInput.addEventListener('keydown', (event) => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    if (event.key === 'Enter') {
                        checkEmail()
                        emailInput.value = newEmailInput.value;
                        editFieldEmail.style.display = 'none';
                        event.preventDefault()

                    }

                });
                saveOldBtnPass.addEventListener('click', () => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    //check if the passwords match old and new password
                    const oldPassword = oldPasswordInput.value// get the value of the old password
                    const userOldPassword = Array.from(userCredentials).find(user => user.DbPassword === oldPassword);
                    if (userOldPassword) {//If the password matches display the email dialog
                        editFieldOldPassword.style.display = 'none';
                        editFieldPassword.style.display = 'block';//open the dialog to enter new password
                    }
                    else {
                        oldPasswordInput.style.color = 'red';
                        notification('Password do not match ...')//show notification
                        editFieldOldPassword.style.display = 'block';//remain open if password are not matching
                    }
                });
                //when  enter is cliked
                editFieldOldPassword.addEventListener('keydown', (event) => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    if (event.key === 'Enter') {
                        //check if the passwords match old and new password
                        const oldPassword = oldPasswordInput.value// get the value of the old password
                        const userOldPassword = Array.from(userCredentials).find(user => user.DbPassword === oldPassword);
                        if (userOldPassword) {//If the password matches display the email dialog
                            editFieldOldPassword.style.display = 'none';
                            editFieldPassword.style.display = 'block';//open the dialog to enter new password
                        }
                        else {
                            oldPasswordInput.style.color = 'red';
                            notification('Password do not match ...')//show notification
                            editFieldOldPassword.style.display = 'block';//remain open if password are not matching
                        }
                        event.preventDefault()

                    }

                });
                saveNewBtnPass.addEventListener('click', () => {//WHEN THE DONE BUTTON IS CLICKED,CLOSE THE MODAL SAVING THE VALUES INPUTTED
                    passwordInput.value = newPasswordInput.value;
                    editFieldPassword.style.display = 'none';
                });
                //HWEN ENETER IS CLCIKED
                newPasswordInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        passwordInput.value = newPasswordInput.value;
                        editFieldPassword.style.display = 'none';
                        event.preventDefault()

                    }
                });
                // //WHEN THE DOCUMENT IS CLICKED ANYWHERE USING ENTER CLOSE ANY OPEN DIALOGS
                // document.addEventListener('keydown', (event) => {
                //     if (event.key === 'Enter') {
                //         //close the confirm password dialog
                //         editFieldOldPassword.style.display = 'none';
                //         //close the enter new email dialog
                //         editFieldEmail.style.display = 'none';
                //         //close the confirm password dialog
                //         editFieldCPassword.style.display = 'none';
                //         //close the enter new  password dialog
                //         editFieldPassword.style.display = 'none';
                //     }
                // })
                //LOOP N THE CURRENCIES ARRAY AND CHECK THE CURRENCY WITH Y
                const checkBaseCurrency = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === 'Y')
                if (checkBaseCurrency) {
                    document.querySelector('.baseCurr').innerHTML = checkBaseCurrency.Currency_Name
                }
                //WHEN BASE CURRENCY IS SELECTED
                const overallContainer = document.getElementById('overallContainer');
                const baseCurrDropdownContainer = document.getElementById('baseCurrDropdownContainer');
                const baseCurrencyDrop = document.querySelectorAll('.curr-option');
                //OPEN DROPDOWN ONCE THE SELECT BASECURRENCY IS CLICKED
                overallContainer.addEventListener('click', () => {
                    //display dropdown
                    baseCurrDropdownContainer.style.display = 'block'
                })
                //IF USER CLICKED OUTSIDE ANYWHERE, IT REMOVES
                document.addEventListener('mousedown', function handleClickOutsideBox(event) {
                    if (!baseCurrDropdownContainer.contains(event.target)) {
                        baseCurrDropdownContainer.style.display = 'none';
                    }
                });
                //LOOP IN THE INTERVALS ARRAY AND UPON SELECTION AUTOFILL THE SELECTED INTERVAL TEXT
                baseCurrencyDrop.forEach(option => {
                    option.addEventListener("click", function (event) {
                        event.stopPropagation();
                        //GET THE SELECTED CURRENCY AND UPDATE THE TEXT WITH ITS VALUE
                        const baseCurrText = document.querySelector('.baseCurr');
                        baseCurrText.innerText = option.innerText;
                        baseCurrency = option.innerText;
                        baseCurrDropdownContainer.style.display = 'none'

                    })
                })

                //SAVE CHANGES TO DATABASE
                saveChanges.addEventListener('click', (event) => {
                    event.preventDefault()
                    const spinner = document.getElementById('spinner');
                    // alert('sending data')
                    spinner.style.display = 'block'; // location.href = loginForm.getAttribute('action')
                    notification('Please Wait...')
                    const userAccount = emailInput.value.split('@')[0];//SPLIT TO GET THE NAME BEFORE THE @ TAG/
                    const myPassword = passwordInput.value;
                    //  alert(myPassword)
                    fetch('/updateUserAccount', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userAccount,
                            myPassword,
                            baseCurrency
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            // Handle the response data if needed
                            if (data.isModified && data.isModifiedCurr) {
                                spinner.style.display = 'none';
                                notification('Directing To Page')
                                location.href = '/'
                            }
                            // else if (data.isModified === false && data.isModifiedCurr === false) {
                            //     alert('zvaita')
                            // }
                            else {
                                notification('Failure to update..Try Again')
                                passwordInput.style.color = 'red';
                                location.href = '/userAccount'
                            }

                        })

                        .catch(error => {
                            console.error(error);
                            notification('An error occurred while updating. Please try again...');
                            location.reload()
                        })

                })
                //WHEN THE CANCEL BUTTON IS CLICKED

                modallCancell.addEventListener('click', (event) => {
                    event.preventDefault();
                    currentPasswordInput.value = ''
                    editFieldCPassword.style.display = 'none'
                })
                modalCancel.addEventListener('click', (event) => {
                    event.preventDefault();
                    newEmailInput.value = ''
                    editFieldEmail.style.display = 'none'

                })
                modalCanc.addEventListener('click', (event) => {
                    event.preventDefault();
                    oldPasswordInput.value = '';
                    editFieldOldPassword.style.display = 'none'

                })
                modallCanc.addEventListener('click', (event) => {
                    event.preventDefault();
                    newPasswordInput.value = '';
                    editFieldPassword.style.display = 'none'

                })
                //WHEN THE DELETE BUTTON IS CLICKED
                const deleteAccount = document.querySelector('.deleteAccount');
                const deleteAccountModal = document.getElementById('deleteAccountiD');
                const yesDeleteAccount = document.getElementById('yesDelete');
                const noDeleteAccount = document.getElementById('noDelete');
                const closeDelete = document.getElementById('closeDelete');

                deleteAccount.addEventListener('click', (event) => {
                    event.preventDefault();
                    //display the delte modal
                    deleteAccountModal.style.display = 'block'

                })
                //when the yes button is clicked
                yesDeleteAccount.addEventListener('click', (event) => {
                    const emailName = emailInput.value;
                    const email = emailName.split('@')[0];
                    fetch('/deleteUserAccount', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email,
                        })
                    })
                        .then(response => {
                            console.log(response)
                            spinner.style.display = 'none';
                            if (response.ok) {
                                //REMOVE ZVESE ZVIRI MUMA LOCAL HOST
                                localStorage.removeItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                localStorage.removeItem("lastDate");
                                localStorage.removeItem('expCurrentPage');
                                localStorage.removeItem('incomeCurrPage')
                                localStorage.removeItem("payInCategory")
                                localStorage.removeItem("payOutCategory")
                                localStorage.removeItem('totalIncomePerCategory')
                                localStorage.removeItem('itemsPerPage');
                                localStorage.removeItem('payOutcategoryName')
                                localStorage.removeItem('totalExpensesPerRange')
                                notification('Directing To Page');
                                location.href = '/register'
                                return response.json();
                            }
                            else {
                                notification('Failure to delete..Try Again')
                                passwordInput.style.color = 'red';
                                location.href = '/userAccount'

                                // throw new Error('Error checking database name');
                            }

                        })
                        .then(data => {
                            // Handle the response data if needed
                            console.log(data);
                        })
                        .catch(error => {
                            console.error(error);
                            notification('An error occurred while updating. Please try again...');
                            location.reload()
                        })
                })
                //when the no button is clicked
                noDeleteAccount.addEventListener('click', (event) => {
                    event.preventDefault();
                    deleteAccountModal.style.display = 'none'//remove the modal
                })
                //when the cancell icon isclicked
                //when the no button is clicked
                closeDelete.addEventListener('click', (event) => {
                    event.preventDefault();
                    deleteAccountModal.style.display = 'none'//remove the modal
                })
                //WHEN THE USER CLICKS OUTSIDE THE MODAL
                window.addEventListener('click', (event) => {
                    if (event.target === editFieldEmail) {
                        editFieldEmail.style.display = 'none';
                    }
                    else if (event.target === editFieldPassword) {
                        editFieldPassword.style.display = 'none';
                    }
                    else if (event.target === editFieldCPassword) {
                        editFieldCPassword.style.display = 'none';
                    }
                    else if (event.target === editFieldOldPassword) {
                        editFieldOldPassword.style.display = 'none';
                    }
                    else if (event.target === deleteAccountModal) {
                        deleteAccountModal.style.display = 'none';
                    }
                });
            })
            .catch(error => console.error('Error fetching user credentials:', error));
        console.log(newCurrencies); // do something with the currencies array
    })
    .catch(error => console.error('Error fetching user credentials:', error));
console.log(userCredentials); // do something with the credentials array
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
