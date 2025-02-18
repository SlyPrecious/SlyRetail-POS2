let newCurrencies = [];
let startDate = ""; //value to store the daterange start date
let endDate = ""; //value to store the daterange end date
let accountingPeriodDetails = []

const shiftToggleSwitch = document.querySelector('.shift-toggle');
function animateToggleShift() {
    shiftToggleSwitch.classList.toggle("shift-active");
}


const timeClockToggleSwitch = document.querySelector('.time-clock-toggle');
function animateToggleTimeClock() {
    timeClockToggleSwitch.classList.toggle("time-clock-active");
}

const openTicketsToggleSwitch = document.querySelector('.open-ticket-toggle');
function animateToggleOpenTicket() {
    openTicketsToggleSwitch.classList.toggle("open-ticket-active");
}


const kitchenPrintersToggleSwitch = document.querySelector('.kitchen-printer-toggle');
function kitchenPrintersToggleTimeClock() {
    kitchenPrintersToggleSwitch.classList.toggle("kitchen-printer-active");
}
const customerDisplayToggleSwitch = document.querySelector('.customer-display-toggle');
function animateToggleCustomerDisplay() {
    customerDisplayToggleSwitch.classList.toggle("customer-display-active");
}


const lSNToggleSwitch = document.querySelector('.low-stock-notification-toggle');
function animateTogglelowstockNotification() {
    lSNToggleSwitch.classList.toggle("low-stock-notification-active");
}
const negativeStockAlertToggleSwitch = document.querySelector('.negative-stock-alert-toggle');
function animateToggleNegativeStockAlert() {
    negativeStockAlertToggleSwitch.classList.toggle("negative-stock-alert-active");
}

const showDiscountToggleSwitch = document.querySelector('.show-discount-toggle');
function animateToggleTimeShowDiscount() {
    showDiscountToggleSwitch.classList.toggle("show-discount-active");
}
const weightEmbededToggleSwitch = document.querySelector('.weight-embeded-barcode-toggle');
function animateToggleWeightEmbededBarcode() {
    weightEmbededToggleSwitch.classList.toggle("weight-embeded-barcode-active");
    window.onload = function () {
        weightEmbededToggleSwitch.style.display = ''
    }
}

fetch('/currencies')
    .then(response => response.json())
    .then(currencies => {
        currencies.forEach((currency) => {
            newCurrencies.push(currency);
        });
        fetch('/details')
            .then(response => response.json())
            .then(details => {
                details.forEach((detail) => {
                    accountingPeriodDetails.push(detail);
                });

                //Display all containers on page start
                function displayContainerBlocks() {
                    document.querySelector(".loader-container").style.display = "none";
                    document.querySelector(".theLoader").style.display = "none";
                    document.querySelector(".icon-nav").style.display = "block";
                    document.querySelector(".toolbar").style.display = "block";
                    document.querySelector(".general-settings-card").style.display = "block";
                    document.querySelector(".features-card").style.display = "block";
                }

                const spinner = document.querySelector('#spinner')
                //GET THE SESSION ID FROM THE LOCALSTORAGE
                const sessionId = localStorage.getItem('sessionId')

                document.addEventListener('mousedown', function handleClickOutsideBox(event) {
                    const box = document.getElementById('payment-details-Form');
                    if (!box.contains(event.target)) {
                        box.style.display = 'none';
                    }
                });
                //WHEN THE PAYMENT TYPE BUTTON IS CLICKED DISPLAY THE PAYMWNT TYPES TABLE
                const paymentTypeBtn = document.querySelector('.payment-type-btn')
                const accountingPeriodBtn = document.querySelector('.accountingPeriod-btn')
                const paymentTypeTable = document.querySelector('.payment-type-container')
                const accSettingContainer = document.querySelector('.accSettingContainer')

                //ADD A CLICK EVENT LISTENER
                paymentTypeBtn.addEventListener('click', () => {
                    paymentTypeTable.style.display = 'block'
                    accSettingContainer.style.display = 'none'
                })
                //ADD A CLICK EVENT LISTENER
                accountingPeriodBtn.addEventListener('click', () => {
                    accSettingContainer.style.display = 'block'
                    paymentTypeTable.style.display = 'none'
                })
                // Select all buttons
                const buttons = document.querySelectorAll('.bttn');

                // Add click event listener to each button
                buttons.forEach(button => {
                    button.addEventListener('click', () => {
                        // Remove the 'active' class from all buttons
                        buttons.forEach(btn => btn.classList.remove('active'));

                        // Add the 'active' class to the clicked button
                        button.classList.add('active');
                    });
                });

                //This Function opens up that form where you create your multiple currencies
                function openPaymentType() {
                    // alert('opens')
                    //On clcikof the select payment span drop down thelist
                    const selectPaymentSpan = document.querySelector(".selectPay1")
                    const selectPaymentType = document.querySelector("#select-payment-type");
                    selectPaymentSpan.addEventListener("click", function () {
                        selectPaymentType.style.display = "block";
                    })
                    //we have to add event listiners to the currencytypes names so that when clicked, they go onto where it is written select payment type and change the anme to the current type
                    const currencyoptions = document.querySelectorAll(".btn");
                    currencyoptions.forEach(currencyoption => {
                        currencyoption.addEventListener("click", function () {
                            document.querySelector(".selectPay1").innerText = currencyoption.innerText;
                            selectPaymentType.style.display = "none";
                        });
                    });

                    //  The function of closing the payment type dropdown popup in   on click of anywhere on screen
                    document.addEventListener('mousedown', function handleClickOutsideBox(event) {
                        const paymentTypeBox1 = document.getElementById('select-payment-type');
                        if (!paymentTypeBox1.contains(event.target)) {
                            paymentTypeBox1.style.display = 'none';
                        }
                    });
                };
                //we have to add event listiners to the currencytypes names so that when clicked, they go onto where it is written select payment type and change the anme to the current type
                const currencyoptions = document.querySelectorAll(".btn");
                currencyoptions.forEach(currencyoption => {
                    currencyoption.addEventListener("click", function () {
                        document.querySelector(".selectPay1").innerText = currencyoption.innerText;
                    });
                });

                var checkBox = document.querySelector(".payment-type-select");
                var text = document.querySelector(".delete");
                function showDelete() {
                    if (checkBox.checked == true) {
                        text.style.display = "block";
                    } else {
                        text.style.display = "none";
                    }
                }
                function openForm() {
                    document.getElementById("payment-details-Form").style.display = "block";
                }
                function closeForm() {
                    document.getElementById("payment-details-Form").style.display = "none";
                    document.querySelector('.selectPay1').innerText = 'Select Payment Type';
                    document.querySelector('#paymentnameid').value = '';
                    document.querySelector('#rateid').value = '';
                }

                const saveBtn = document.querySelector('.btn-save');
                //when the add new currency button is clicked
                const addCurrency = document.querySelector(".add-payment-type-btn");
                addCurrency.addEventListener('click', function () {
                    document.getElementById("payment-details-Form").style.display = "block";
                    document.querySelector('.selectPay1').innerText = 'Select Payment Type';
                    document.querySelector('#paymentnameid').value = '';
                    document.querySelector('#rateid').value = '';
                    saveBtn.textContent = 'SAVE';
                })

                //WHEN THE SAVE CURRENCY BUTTON IS CLICKED
                saveBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    const paymentType = document.querySelector('.selectPay1').innerText;
                    const paymentName = document.querySelector('#paymentnameid').value;
                    const paymentRate = parseFloat(document.querySelector('#rateid').value);
                    //CHECK WHETHER ALL THE NECCESSARY FEILD ARE THERE
                    if (paymentType && paymentName && paymentRate && saveBtn.textContent === 'SAVE') {
                        saveCurrencies()
                    }
                    function saveCurrencies() {
                        const currencyExist = Array.from(newCurrencies).find(curr => curr.Currency_Name === paymentName)
                        if (currencyExist) {
                            notification('Currency Already Exist')
                            return
                        }
                        else {
                            //THEN UPDATE THE USER INTERFACE WITH THE ENTERED VALUE

                            //THEN LET THE SERVER STORE IT IN THE DATABASE
                            //display the loader here
                            fetch('/createNewCurrency', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ paymentType, paymentName, paymentRate, sessionId }) // THE VARIABLES ARE STORED AS JOSON OBJECT, TRANSFEREABLE TO SERVER MODULE WHEN THE SERVER TAPS INTOR BODY-PARSER
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.isSaved === true) {
                                        tableRows()
                                        notification('Added')
                                    }
                                    else {
                                        notification('Not updated..error occured')
                                        tableRows()
                                    }
                                })
                                .catch(error => {
                                    console.error('error saving currency' + error);
                                })
                            closeForm();
                        }
                    }

                    if (saveBtn.textContent === 'UPDATE') {
                        UpdateTable()
                    }
                    function UpdateTable() {
                        const currencyExist = Array.from(newCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (paymentName).toLowerCase())
                        if (currencyExist && (currencyExist.paymentType).toLowerCase() === (paymentType).toLowerCase() && Number(currencyExist.RATE) === Number(paymentRate)) {
                            notification('Currency Already Exist')
                            return
                        }
                        else {
                            //get values from the form
                            const currencyId = document.querySelector('.myPaymentId').innerText;
                            const paymentType = document.querySelector('.selectPay1').innerText;
                            const paymentName = document.querySelector('#paymentnameid').value;
                            const paymentRate = parseFloat(document.querySelector('#rateid').value);
                            fetch('/UpdateCurrencies', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ paymentType, paymentName, paymentRate, currencyId, sessionId })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.isUpdated === true) {
                                        notification('Updated')
                                    }
                                    else {
                                        notification('Not updated..error occured')
                                        tableRows()
                                    }
                                })
                                .catch(error => {
                                    console.error('error saving currency');
                                })
                            closeForm();
                        }
                    }

                    //reset form
                    document.querySelector('.selectPay1').innerText = 'Select Payment Type';
                    document.querySelector('#paymentnameid').value = '';
                    document.querySelector('#rateid').value = '';

                });


                function displaySpinner() {
                    spinner.style.display = "block";
                    spinner.style.marginLeft = '279px'
                    document.querySelector(".payment-type").style.display = "none";
                    document.querySelector(".currencyContainer").style.display = "none";
                    document.querySelector(".theLoader").style.display = "flex";
                }
                function removeSpinner() {
                    spinner.style.display = "none";
                    document.querySelector(".payment-type").style.display = "block";
                    document.querySelector(".theLoader").style.display = "none";
                    document.querySelector(".currencyContainer").style.display = "block";
                }
                //=================================================================================================================================
                //CREATE A FUNCTION TO CREATE TABLE ROWS IN JS
                tableRows()//call this function to execute upon page load
                function tableRows() {
                    //display the loader here
                    // displaySpinner()
                    //GET THE CURRENCIES FROM THE DB
                    fetch('/currencies')
                        .then(response => response.json())
                        .then(currencies => {
                            newCurrencies = currencies

                            const allTableRow = document.querySelectorAll('.paymentTypesTable')
                            for (let a = 0; a < allTableRow.length; a++) {
                                const tRow = allTableRow[a];
                                tRow.style.display = 'none'
                            }
                            //start creating the tds
                            for (let i = 0; i < newCurrencies.length; i++) {
                                const currency = newCurrencies[i];
                                const tBody = document.querySelector('.table-body-create-discount');

                                const numRows = tBody.rows.length;
                                // alert(numRows)
                                const isEven = numRows % 2 === 0;
                                // create a new row element
                                const payrow = document.createElement('tr');
                                payrow.classList.add('paymentTypesTable');

                                if (isEven) {
                                    payrow.classList.add('roweven');
                                }
                                else {
                                    payrow.classList.add('rowodd');
                                }

                                //CHECKBOX TD
                                const checkboxCell = document.createElement('td');
                                const checkbox = document.createElement('input');
                                checkbox.type = 'checkbox';
                                checkbox.classList.add('form-check-input');
                                checkbox.value = 'checkedValue';
                                checkboxCell.appendChild(checkbox);
                                payrow.appendChild(checkboxCell);

                                //ID TD
                                const hiddenCell = document.createElement('td');
                                hiddenCell.hidden = true;
                                hiddenCell.innerHTML = currency._id
                                hiddenCell.classList.add('paymentId');
                                payrow.appendChild(hiddenCell);

                                //TOGGLE SWITCH TD
                                const toggleSwitchCell = document.createElement('td');
                                toggleSwitchCell.classList.add('toggleSwitch');
                                const toggleCheckbox = document.createElement('input');
                                toggleCheckbox.type = 'checkbox';
                                toggleCheckbox.classList.add('base-currency');
                                toggleSwitchCell.style.cursor = 'pointer';
                                const toggleLabel = document.createElement('label');
                                toggleLabel.classList.add('switchh');
                                toggleLabel.classList.add('small');
                                const toggleSpan = document.createElement('span');
                                toggleSpan.classList.add('slider');
                                toggleSpan.classList.add('round');
                                //LOOP IN THE CURRENCIES ARRAY CHECKING WHERE BASE CURRENCY IS Y
                                if (currency.BASE_CURRENCY === 'Y') {
                                    toggleCheckbox.checked = true
                                }
                                toggleLabel.appendChild(toggleCheckbox);
                                toggleLabel.appendChild(toggleSpan);
                                toggleSwitchCell.appendChild(toggleLabel);
                                payrow.appendChild(toggleSwitchCell);


                                //CURRENCY TYPE TD
                                const currNameCell = document.createElement('td');
                                currNameCell.classList.add('currencies');
                                const currencyDropdown = document.createElement('div');
                                currencyDropdown.classList.add('dropdown');
                                const currencyDropdownButton = document.createElement('button');
                                currencyDropdownButton.classList.add('btn');
                                currencyDropdownButton.classList.add('dropdown-toggle');
                                currencyDropdownButton.classList.add('currbtnSpan')
                                currencyDropdownButton.style.backgroundColor = 'transparent';
                                // add the dropdown atttribute
                                currencyDropdownButton.setAttribute('data-bs-toggle', 'dropdown');
                                currencyDropdownButton.setAttribute('aria-expanded', 'false');
                                // createDropdown menu and items
                                const currencyDropdownMenu = document.createElement('ul');
                                currencyDropdownMenu.classList.add('dropdown-menu');
                                currencyDropdownMenu.classList.add('currdropdown-menu');
                                // currency.paymentType = ((currency.paymentType).replace(/_/g, " "))
                                currency.paymentType = (currency.paymentType).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

                                currencyDropdownButton.innerHTML = currency.paymentType;
                                //add the create category
                                // Populate the currency drop-down menu with options
                                //CREATE AN ARRAY OF PAYMENT TYPES
                                const paymentTypes = ['Cash', 'Card', 'Mobile', 'Other']
                                paymentTypes.forEach(option => {
                                    const dropdownList = document.createElement('li');
                                    const dropdownItem = document.createElement('a');
                                    dropdownList.classList.add('CurrencyTypeClass');
                                    dropdownItem.classList.add('dropdown-item');
                                    dropdownItem.classList.add('currdropdown-item');
                                    dropdownItem.href = '#';
                                    const optionText = document.createTextNode(option);
                                    dropdownItem.appendChild(optionText);
                                    dropdownList.appendChild(dropdownItem);
                                    currencyDropdownMenu.appendChild(dropdownList);
                                });
                                currencyDropdown.appendChild(currencyDropdownButton);
                                currencyDropdown.appendChild(currencyDropdownMenu);
                                currNameCell.appendChild(currencyDropdown);
                                payrow.appendChild(currNameCell);

                                //CURRENCY NAME TD
                                const currenccyTypeCell = document.createElement('td');
                                currenccyTypeCell.classList.add('currency');
                                currenccyTypeCell.style.cursor = 'pointer';
                                currency.Currency_Name = (currency.Currency_Name).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase()).join(' ')
                                currenccyTypeCell.innerHTML = currency.Currency_Name
                                payrow.appendChild(currenccyTypeCell);

                                //create RATE CELL
                                const rateCell = document.createElement('td');
                                rateCell.classList.add('rate-id');
                                rateCell.contentEditable = true
                                const rateCellDiv = document.createElement('div');
                                rateCellDiv.classList.add('currDropdown');
                                const rateCellDivSpan = document.createElement('span');
                                rateCellDivSpan.classList.add('currDropdown-btn');
                                rateCellDivSpan.innerText = Number(currency.RATE).toFixed(2)
                                rateCellDiv.appendChild(rateCellDivSpan);
                                const rateCellDiv2 = document.createElement('div');
                                rateCellDiv2.classList.add('editRateClass');

                                rateCellDiv.appendChild(rateCellDiv2);
                                //APPEND THE DIV1 TO THE RATE TD CELL
                                rateCell.appendChild(rateCellDiv);
                                payrow.appendChild(rateCell);

                                theAlreadyExistingRow(payrow);
                                tBody.appendChild(payrow);
                            }
                            displayContainerBlocks()
                            removeSpinner()
                        })

                }

                //FUNCTION THAT HAS ALL THE EVENT LISTENERS FOR ALL THE EXISTING AND TO BE ADDED ROWS
                function theAlreadyExistingRow(payrow) {
                    //THIS FUNCTION CHANGES THE BASE CURRENCY BOTH ON THE DB AND INTERFACE
                    const toggleSwitch = payrow.querySelector('.base-currency');
                    toggleSwitch.addEventListener('click', function (event) {
                        //loop within the table removing all the other checked switches
                        const checkBaseCurr = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === 'Y');//find matching currency name with the one in the incomes table
                        const baseCurrRate = checkBaseCurr.RATE
                        if (checkBaseCurr) {
                            //store he now base currency in a local storage
                            localStorage.setItem("oldBaseCurrencyRate", baseCurrRate);
                        }
                        const paymentId = payrow.querySelector('.paymentId').textContent.trim();
                        const otherSwitches = document.querySelectorAll('.base-currency');
                        otherSwitches.forEach((otherSwitch) => {
                            if (otherSwitch !== toggleSwitch) {
                                otherSwitch.checked = false;
                            }
                        });
                        //UPDATE THE ARRAY FIRST WITH THE BASE CURRENCY CLICKED
                        for (let i = 0; i < newCurrencies.length; i++) {
                            newCurrencies[i].BASE_CURRENCY = 'N' //SWITCH ESE TO N
                            if (newCurrencies[i]._id === paymentId) {
                                //update the BASE CURRENCY VALUE
                                newCurrencies[i].BASE_CURRENCY = 'Y'

                            }
                        }

                        // UPDATE THE BASE CURRENCY IN THE DATABASE FROm THE CHECKED CURRENCY

                        fetch('/updateBaseCurrency', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                paymentId,
                                baseCurrRate,
                                sessionId
                            })
                        })

                            .then(response => response.json())
                            .then(data => {
                                if (data.isUpdated === true) {

                                    notification('Updated')
                                }
                                else {
                                    notification('Not updated..error occured')
                                    tableRows()
                                }

                            })
                            .catch(error => {
                                console.error('Error updating base currency field for payment ID:', paymentId, error);
                            });
                    });


                    //When the currencies dropdown is open, loop thru all the list of currencies putting the event listeners
                    //loop through all the currency options in the dropdown
                    const CurrencyOptions = payrow.querySelectorAll('.CurrencyTypeClass');
                    CurrencyOptions.forEach(currencyOption => {
                        currencyOption.addEventListener("click", function (event) {
                            const CurrencySpan = payrow.querySelector('.currbtnSpan');//the dropdown span 
                            //GET THE SELECTED currency AND UPDATE THE currency CELL WITH ITS VALUE
                            const newPaymentType = currencyOption.innerText;
                            CurrencySpan.innerText = newPaymentType;
                            const currencyId = payrow.querySelector('.paymentId').textContent.trim();

                            fetch('/UpdateCurrenciesName', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    currencyId,
                                    newPaymentType,
                                    sessionId
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.isUpdated === true) {
                                        notification('Updated')

                                    }
                                    else {
                                        notification('Not updated..error occured')
                                        tableRows()
                                    }

                                })
                                .catch(error => {
                                    console.error(`Error updating base currency field for expense ID: ${currencyId}`, error);
                                });
                        });

                    });

                    //=============================================================================================
                    //NEW CURRENCY NAME UPDATE

                    //NEWrate value btn-save
                    const currencyNameCell = payrow.querySelector(".currency");

                    // add an event listener to the cell for currencyNameCell events
                    currencyNameCell.addEventListener("click", function (event) {
                        //if the id is not empty continue displaing the form
                        if (payrow.querySelector('.paymentId').textContent.trim() !== '') {
                            //AUTOFILL THE SAVE BUTTON TEXT CONTENT TO UPDATE
                            saveBtn.textContent = 'UPDATE';
                            const ptype = document.querySelector('.selectPay1');
                            const pname = document.querySelector('#paymentnameid');
                            const prate = document.querySelector('#rateid');
                            const myId = payrow.querySelector('.paymentId').textContent.trim();
                            //collect the values in the clicked row
                            const curr = payrow.querySelector('.currency').innerText;
                            const payment = payrow.querySelector('.currbtnSpan').innerText;
                            const currRate = payrow.querySelector('.rate-id').innerText;
                            //update the clicked row data in the form value fields
                            ptype.innerHTML = payment;
                            pname.value = curr;
                            prate.value = parseFloat(currRate);

                            // get the Currency ID of the row that was edited
                            document.querySelector('.myPaymentId').innerText = myId;
                            const paymentForm = document.getElementById("payment-details-Form");
                            paymentForm.style.display = 'block';
                        }
                    });

                    //RATE CELL EDIT EVENTS
                    const currenciesRateCell = payrow.querySelector('.rate-id')
                    // add an event listener to the currenciesRateCell to enable the edit mode
                    currenciesRateCell.addEventListener("keydown", function (event) {
                        const keyCode = event.keyCode;
                        if ((keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                            (keyCode >= 96 && keyCode <= 105) ||
                            (keyCode == 13) ||// numeric keypad
                            (keyCode == 8) || // backspace
                            (keyCode == 9) || // tab
                            (keyCode == 190) || (keyCode == 37 || keyCode == 39)  //left and right arrow keys
                            || (keyCode == 46))//delete) 

                        {

                        } else {
                            // Prevent input
                            event.preventDefault();
                        }
                        if (event.key === "Enter") {
                            // prevent the default behavior of the enter key
                            event.preventDefault();
                            // get the new value of the currency rate from the edited cell
                            const CurrencyRate = event.target.innerText;
                            const currencyId = payrow.querySelector('.paymentId').textContent.trim();
                            currenciesRateCell.blur()

                            fetch('/updateCurrencyRate', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    currencyId,
                                    CurrencyRate,
                                    sessionId
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.isUpdated === true) {
                                        notification('Updated')

                                    }
                                    else {
                                        notification('Not updated..error occured')
                                        tableRows()
                                    }

                                })
                                .catch(error => {
                                    console.error(`Error updating base Rate field for expense ID: ${currencyId}`, error);
                                });
                        }
                    });

                    //===========================================================================
                    //DELETE CURRENCY ROWS
                    // Get the modal element
                    const deleteModal = document.getElementById('delete-modal');

                    // Get the "Delete" button element in the modal
                    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

                    // Get all the checkboxes in the table
                    const checkboxes = payrow.querySelectorAll('.form-check-input');
                    let idToDelete = []
                    // Attach a click event listener to each checkbox
                    checkboxes.forEach(checkbox => {
                        checkbox.addEventListener('click', () => {
                            const paymentId = payrow.querySelector('.paymentId').textContent.trim();
                            // console.log(paymentId);
                            // Show the delete modal
                            deleteModal.style.display = 'block';
                            // When the "Delete" button is clicked, delete the selected rows
                            confirmDeleteBtn.addEventListener('click', async () => {
                                //FIRST CHECK IF THE ID IS NOT OF A ROW THAT IS BASE CUCRRENCY
                                const currencyToDelete = newCurrencies.find(curr => curr._id === paymentId);
                                if (currencyToDelete.BASE_CURRENCY === 'Y') {
                                    notification('Cannot delete base currency.');
                                    // Hide the delete modal
                                    deleteModal.style.display = 'none';
                                    //ALSO REMOVE THE CHECKED STATE ON THE BASE CURRENCY CHECKBOX
                                    $('tbody input[type="checkbox"]').each(function () {
                                        // Uncheck all checked  rows
                                        this.checked = false;
                                    });
                                    return; // Stop further execution of the loop
                                }
                                else {
                                    idToDelete.push(paymentId);

                                    //UPDATE THE NEW CURRENCY ARRAY BY REMOVI=NG THE DOCUMENTS WITH THE SELECTED ID
                                    // newCurrencies = newCurrencies.filter(item => item._id !== idToDelete)
                                    //display the loader here

                                    try {

                                        fetch('/deletePaymentTypeRows', {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                idToDelete,
                                                sessionId
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                if (data.amDeleted === true) {
                                                    tableRows()
                                                    notification('Deleted')
                                                }
                                                else {
                                                    tableRows()
                                                    notification('An Error Occured, Try Again...')
                                                }

                                            })
                                    } catch (err) {
                                        console.error(err);
                                    }

                                    // Hide the delete modal
                                    deleteModal.style.display = 'none';

                                }
                            });
                            if (checkbox.checked === false) {
                                deleteModal.style.display = 'none';
                            }

                        });

                    });
                };
                function displayDates() {
                    accountingPeriodDetails.forEach(period => {
                        document.querySelector('.hiddenId').innerText = period._id
                        const parts = period.startDate.split("-");
                        const formattedDate = parts[0] + "-" + parts[1] + "-" + parts[2];
                        //AUTO FILL THE END DATE 
                        let formattedDates2 = new Date(formattedDate)
                        formattedDates2.setMonth(formattedDates2.getMonth() + 12)
                        formattedDates2.setDate(0); // Set to 0 to get the last day of the previous month
                        let theMonth = (formattedDates2.getMonth() + 1)
                        if (theMonth < 10) {
                            theMonth = `0${theMonth}`
                        }
                        else if (theMonth >= 10) {
                            theMonth = theMonth
                        }
                        const endDate = formattedDates2.getFullYear() + '-' + theMonth + '-' + formattedDates2.getDate()
                        document.getElementById('startDate').value = formattedDate;
                        document.getElementById('endDate').value = endDate;
                    });
                }
                displayDates()
                const setAccountingPeriodBtn = document.querySelector('.setAccountingPeriodBtn')
                setAccountingPeriodBtn.addEventListener("click", (event) => {
                    event.preventDefault()
                    //get the start and end date
                    startDate = document.getElementById('startDate').value
                    // endDate = document.getElementById('endDate').value
                    // store in local storage
                    localStorage.setItem("firstDateOfAccountingPeriod", startDate);
                    // localStorage.setItem("lastDateOfAccountingPeriod", endDate);
                    //send to database the dates and the id
                    const id = document.querySelector('.hiddenId').innerText
                    //fill the hidden span that stores the id

                    fetch('/updateAccountingPeriod', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id,
                            startDate,
                            sessionId,
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.isModified === true) {
                                accountingPeriodDetails.forEach(period => {
                                    if (period._id === id) {
                                        period.startDate = startDate
                                    }
                                })
                                displayDates()
                                notification('Updated')
                            }
                            else if (data.isModified === false) {
                                accountingPeriodDetails.forEach(period => {
                                    if (period._id === id && period.startDate === startDate) {
                                        period.startDate = startDate
                                    }
                                })
                                displayDates()
                                notification('Updated')

                            }
                        })

                        .catch(error => {
                            console.error(`ErrorInserting`, error);
                        });
                })
            })
            .catch(error => console.error('Error fetching  details:', error));
    })
    .catch(error => console.error('Error fetching currencies:', error));
//=============================================================
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


//=====================================================
