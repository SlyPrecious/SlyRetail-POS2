
import { WorldCurrencies } from "./worldCurrency.js";

let balanceValue = ''
let limitRange = ''
let isoCode = ''
let startDate = ''
let endDate = ''
let pageSize = 0
let page = 0
let newCurrencies = []
let cashFlowCategories = []
let newExpenseCategories = []
let newIncomeCategories = []
let categoryArray = []
let categoryArrayToDisplay = []
let oldCatName = ''
let newCatName = ''
let idsToDelete = [];
let checkedRowsId = []
let cashFlowArray = []
let assignedItemsArray = []
let currentPage
let theCategoryName = ''


fetch('/currencies')
    .then(response => response.json())
    .then(currencies => {
        currencies.forEach((currency) => {
            newCurrencies.push(currency);
        });
        fetch('/getCategories')
            .then(response => response.json())
            .then(allCashFlowCategories => {
                cashFlowCategories = allCashFlowCategories
                for (let k = 0; k < allCashFlowCategories.length; k++) {
                    const element = allCashFlowCategories[k];
                    if (element.Balance === 'PayIn') {
                        newIncomeCategories.push(element)
                    }
                    else if (element.Balance === 'PayOut') {
                        newExpenseCategories.push(element)
                    }
                }
                const spinner = document.querySelector('#spinner')

                //FUNCTION TO REMOVE THE LOADER
                function displayContainerBlocks() {
                    document.querySelector('.loader-container').style.display = 'none'
                    document.querySelector('.toolbar').style.display = 'block'
                    document.querySelector('.icon-nav').style.display = 'block'
                    document.querySelector('.BigContainerCat').style.display = 'block'
                }
                function displaySpinner() {
                    spinner.style.display = "block";
                    document.querySelector('.BigContainerCat').style.display = 'none'
                    document.querySelector(".theLoader").style.display = "flex";
                }
                function removeSpinner() {
                    spinner.style.display = "none";
                    document.querySelector('.BigContainerCat').style.display = 'block'
                    document.querySelector(".theLoader").style.display = "none";
                }
                const submitCategory = document.querySelector('.submitCategory')
                //=================================================================================================
                //GET THE SESSION ID FROM THE LOCALSTORAGE
                const sessionId = localStorage.getItem('sessionId')
                //======================================================================================
                //GET THE ISOCODE OF THE BASE CURRENCY
                const baseCurrName = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === "Y");//find matching currency name with the one in the incomes table

                //find the base currency code 
                const baseCurrencyCode = Array.from(WorldCurrencies).find(curr => curr.Currency_Name === baseCurrName.Currency_Name);//find matching currency name with the one in the incomes table

                if (baseCurrencyCode) {
                    isoCode = baseCurrencyCode.ISO_Code;
                }
                // Get the modal element
                const deleteModal = document.getElementById('delete-modall');
                const deleteModal2 = document.querySelector('.deleteModal');
                const allOptions = document.querySelectorAll('.myButtons')
                let categoryId = ''
                //=======================================================================================
                // Get the modal
                const modal = document.getElementById("myModal");
                // Get the button that opens the modal
                const btn = document.getElementById("myBtn");
                // Get the <span> element that closes the modal
                const close = document.querySelector('.closeContent');
                const save = document.getElementById('save');
                const theConfirmModal = document.getElementById('theConfirmModal')
                const closeModal = document.querySelector('.closeModal')
                const yesDiscard = document.getElementById('yesDiscard')
                const noDiscard = document.getElementById('noDiscard')
                //ONCLICK OF THE ADD BUTTON DISPLAY THE FORM TO ADD NEW CATEGORY
                const optionModal = document.querySelector('.optionModal')
                const addCategory = document.querySelector('.addCategory')
                const containerWrapper = document.querySelector('#myForm')
                addCategory.addEventListener('click', () => {
                    //display the form
                    containerWrapper.style.display = 'block'
                    document.getElementById('categoryNameId').value = '';
                    document.getElementById('categoryLimitId').value = 0;
                    document.querySelector('.limitOptionSpan').innerText = '';
                    document.querySelector('.categoryLimitSpan').innerText = ''
                    document.getElementById('debit').checked = false;
                    document.getElementById('credit').checked = false;
                    submitCategory.textContent = 'Add Category'
                    document.querySelectorAll('input[type="radio"]').forEach(radio => {
                        if (radio.checked !== true) {
                            //make the buttons not clickable
                            btn.disabled = true
                            submitCategory.disabled = true
                        }
                        radio.addEventListener("click", function () {
                            btn.disabled = false
                            submitCategory.disabled = false
                        })
                        // }
                    })
                })
                //===========================================================================================
                //WHEN THE FORM CONTAINER IS CLICKED OUTSIDE
                document.addEventListener("mousedown", function handleClickOutsideBox(event) {
                    if (event.target === containerWrapper || modal.style.display === 'block' || (containerWrapper.style.display === 'block' && event.target === noDiscard)
                        || (containerWrapper.style.display === 'block' && event.target === yesDiscard)) {
                        containerWrapper.style.display = "block";
                    }
                    else if (!containerWrapper.contains(event.target) && !deleteModal2.contains(event.target)) {
                        containerWrapper.style.display = "none";
                        deleteModal2.style.display = 'none'

                        // Reset the form inputs
                        document.getElementById('categoryNameId').value = '';
                        document.getElementById('categoryLimitId').value = 0;
                        document.querySelector('.limitOptionSpan').innerText = '';
                        document.querySelector('.categoryLimitSpan').innerText = ''
                        document.getElementById('debit').checked = false;
                        document.getElementById('credit').checked = false;
                        for (let i = 0; i < allOptions.length; i++) {
                            const button = allOptions[i];
                            button.checked = false
                        }
                    }
                }
                );
                //=====================================================================================
                //when l clcik on the dropdwon items
                const typeOptions = document.querySelectorAll('.typeOptions')
                typeOptions.forEach(type => {
                    type.addEventListener('click', () => {
                        if (type.innerText === 'All Types') {
                            localStorage.setItem('chooseTypeMode', 'All Types')
                            document.querySelector('.typeSpan').innerText = ''
                            document.querySelector('.typeBtn').style.marginBottom = '0px'
                            defaultDisplayContent()
                        }
                        else if (type.innerText === 'PayIn') {
                            document.querySelector('.typeSpan').innerText = 'PayIn'
                            localStorage.setItem('chooseTypeMode', 'PayIn')
                            document.querySelector('.typeBtn').style.marginBottom = '-22px'
                            categoryArrayToDisplay = newIncomeCategories
                            addNewRow(categoryArrayToDisplay)
                        }
                        else if (type.innerText === 'PayOut') {
                            document.querySelector('.typeSpan').innerText = 'PayOut'
                            localStorage.setItem('chooseTypeMode', 'PayOut')
                            document.querySelector('.typeBtn').style.marginBottom = '-22px'
                            categoryArrayToDisplay = newExpenseCategories
                            addNewRow(categoryArrayToDisplay)

                        }
                    })
                });
                //    BY DEFAULT displayBOTH PAYIN AND PAYOUT
                const chooseTypeMode = localStorage.getItem('chooseTypeMode')
                // const choosePayInTypeMode = localStorage.getItem('choosePayInTypeMode')
                // const choosePayOutTypeMode = localStorage.getItem('choosePayOutTypeMode')
                if (chooseTypeMode === null) {
                    categoryArrayToDisplay = categoryArray
                    document.querySelector('.typeBtn').style.marginBottom = '0px'
                    defaultDisplayContent()

                }
                else if (chooseTypeMode === 'All Types') {
                    categoryArrayToDisplay = categoryArray
                    document.querySelector('.typeBtn').style.marginBottom = '0px'
                    defaultDisplayContent()

                }
                else if (chooseTypeMode === 'PayIn') {
                    document.querySelector('.typeSpan').innerText = 'PayIn'
                    document.querySelector('.typeBtn').style.marginBottom = '-22px'
                    categoryArrayToDisplay = newIncomeCategories
                    addNewRow(categoryArrayToDisplay)
                }
                else if (chooseTypeMode === 'PayOut') {
                    document.querySelector('.typeSpan').innerText = 'PayOut'
                    document.querySelector('.typeBtn').style.marginBottom = '-22px'
                    categoryArrayToDisplay = newExpenseCategories
                    addNewRow(categoryArrayToDisplay)
                }
                function defaultDisplayContent() {
                    displaySpinner()
                    fetch('/getCategories')
                        .then(response => response.json())
                        .then(allCashFlowCategories => {
                            categoryArrayToDisplay = allCashFlowCategories
                            removeSpinner()
                            addNewRow(categoryArrayToDisplay)
                            // displayContainerBlocks()//DISPLY ALL BLOCKS

                        })
                }

                function addNewRow(categoryArrayToDisplay) {
                    // Create a new row in the table
                    //FIRST CLEAR EXISTING ROWS
                    const allTableRows = document.querySelectorAll('.allTableRows')
                    for (let h = 0; h < allTableRows.length; h++) {
                        const row = allTableRows[h];
                        row.style.display = 'none'
                    }
                    const table = document.getElementById('dataTable');
                    // const row = table.insertRow(-1); // -1 to insert at the end
                    const tbody = table.getElementsByTagName('tbody')[0]; // Get the table body
                    //LOOP IN THE ARRAY DISPLAYING ROWS WITH THE DATA
                    // // sort by category name
                    categoryArrayToDisplay = categoryArrayToDisplay.sort((a, b) => {
                        const nameA = a.category.toUpperCase(); // ignore upper and lowercase
                        const nameB = b.category.toUpperCase(); // ignore upper and lowercase
                        if (nameA < nameB) {
                            return -1;
                        }
                        if (nameA > nameB) {
                            return 1;
                        }
                        // names must be equal
                        return 0;
                    });
                    for (let i = 0; i < categoryArrayToDisplay.length; i++) {
                        const category = categoryArrayToDisplay[i];
                        const row = document.createElement('tr');
                        row.classList.add('allTableRows')
                        //ID TD
                        const hiddenCell = document.createElement('td');
                        hiddenCell.hidden = true;
                        hiddenCell.innerHTML = category._id
                        hiddenCell.classList.add('categoryId');
                        row.appendChild(hiddenCell);

                        const checkboxCell = document.createElement('td');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.classList.add('form-check-input');
                        checkbox.value = 'checkedValue';
                        checkboxCell.appendChild(checkbox);
                        row.appendChild(checkboxCell);


                        const nameCell = document.createElement('td');
                        nameCell.classList.add('categoryName')
                        category.category = (category.category).replace(/_/g, " ");
                        category.category = (category.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                        nameCell.textContent = category.category; // Replace with desired content
                        row.appendChild(nameCell);

                        const categoryLimitCell = document.createElement('td');
                        categoryLimitCell.classList.add('categoryLimitCell')
                        const isoCodeSpan = document.createElement('span');
                        isoCodeSpan.classList.add('isoCode')
                        isoCodeSpan.textContent = isoCode; // Replace with desired content
                        categoryLimitCell.appendChild(isoCodeSpan);
                        const categoryLimitSpan = document.createElement('span');
                        categoryLimitSpan.classList.add('categoryLimit')
                        categoryLimitSpan.textContent = Number(parseFloat(category.CategoryLimit)).toFixed(2); // Replace with desired content
                        categoryLimitCell.appendChild(categoryLimitSpan);
                        const limitRangeSpan = document.createElement('span');
                        limitRangeSpan.classList.add('limitRange')
                        limitRangeSpan.textContent = '(' + category.CategoryLimitRange + ')'; // Replace with desired content
                        categoryLimitCell.appendChild(limitRangeSpan);

                        row.appendChild(categoryLimitCell);

                        const debitCreditCell = document.createElement('td');
                        debitCreditCell.classList.add('categoryBalance')
                        debitCreditCell.textContent = category.Balance; // Replace with desired content
                        row.appendChild(debitCreditCell);

                        //IF THERE ARE NO ROWS IN THE TABLE JUST  APPEND ELSE APPEND AFTER THE ALREADY EXISTING
                        //change color of row if its either DR or CR
                        if (category.Balance === 'PayOut') {
                            // alert('dr')
                            row.classList.add('rowPayOut');
                        }
                        else if (category.Balance === 'PayIn') {
                            // alert('cr')
                            row.classList.add('rowPayIn');
                        }

                        // Append the row to the table body
                        row.style.borderBottom = '0.5px solid #d3d3d3'
                        tbody.appendChild(row);
                        //attach any event listeners
                        setEventListeners(row)

                    }

                }
                let checkedRowsId1 = []

                //CREATE A FUNCTION WITH THE EVENT LISTENERS FOR THE ROWS
                function setEventListeners(row) {
                    let rowId = ''
                    //do not append event listener on the cell rine category name as suspense
                    if ((row.querySelector('.categoryName').innerText).toLowerCase() === 'suspense') {
                        //that row shouldnt be clickable
                        row.querySelector('.form-check-input').disabled = true
                        rowId = ''
                    }
                    else {

                        rowId = row.querySelector('.categoryId').textContent.trim()
                        checkedRowsId = []
                        row.querySelector('.form-check-input').addEventListener('click', () => {
                            oldCatName = row.querySelector('.categoryName').innerText
                            if (row.querySelector('.form-check-input').checked === true) {
                                deleteModal.style.display = 'block'
                                //THIS WILL NOW JUST PUSH THE PAYIN ID ONTO THE EXISTING ARRAY ATOP WITH ITS OLD CAT NAME
                                let catArray = {}
                                oldCatName = (oldCatName.replace(/ /g, "_")).toLowerCase();
                                catArray[rowId] = oldCatName
                                checkedRowsId.push(catArray)
                            }
                            else if (row.querySelector('.form-check-input').checked === false) {
                                for (let i = 0; i < checkedRowsId.length; i++) {
                                    const catId = checkedRowsId[i];
                                    const catDataId = Object.keys(catId)[0]
                                    if (catDataId === rowId) {
                                        checkedRowsId1.push(catId)
                                    }
                                }
                                checkedRowsId1.forEach(checkedRow => {
                                    checkedRowsId = checkedRowsId.filter(cat => cat !== checkedRow)
                                });
                                console.log(checkedRowsId)
                                deleteModal.style.display = 'none'

                            }
                        })

                        row.querySelector('.categoryName').addEventListener('click', () => {
                            rowEvents()
                        })
                        row.querySelector('.categoryLimit').addEventListener('click', () => {
                            rowEvents()
                        })
                        row.querySelector('.categoryName').addEventListener('click', () => {
                            rowEvents()
                        })
                        function rowEvents() {
                            checkedRowsId = []
                            document.querySelector('.myCategoryId').innerText = row.querySelector('.categoryId').textContent.trim();
                            categoryId = row.querySelector('.categoryId').textContent.trim()
                            //get the old category name
                            oldCatName = row.querySelector('.categoryName').innerText
                            submitCategory.textContent = 'Edit Category'
                            containerWrapper.style.display = 'block'
                            deleteModal2.style.display = 'block'
                            if (deleteModal.style.display === 'block') {
                                deleteModal.style.display = 'none'
                            }
                            deleteModal2.style.display = 'block'
                            let catArray = {}
                            oldCatName = (oldCatName.replace(/ /g, "_")).toLowerCase();
                            catArray[rowId] = oldCatName
                            checkedRowsId.push(catArray)
                            //NOW TAKE WHAT IS ON THE CLICKED ROW AND PUT ON THE ROW
                            document.getElementById('categoryNameId').value = row.querySelector('.categoryName').innerText;
                            //store this value in a variable
                            theCategoryName = (document.getElementById('categoryNameId').value).replace(/ /g, "_").toLowerCase()
                            document.getElementById('categoryLimitId').value = row.querySelector('.categoryLimit').innerText;
                            //remove parentheses on the inner text
                            // Find the opening and closing parentheses
                            const openingParenIndex = row.querySelector('.limitRange').innerText.indexOf("(");
                            const closingParenIndex = row.querySelector('.limitRange').innerText.indexOf(")");
                            let word = ''
                            if (openingParenIndex !== -1 && closingParenIndex !== -1 && closingParenIndex > openingParenIndex) {
                                // Extract the word within parentheses and remove leading/trailing whitespaces
                                word = row.querySelector('.limitRange').innerText.substring(openingParenIndex + 1, closingParenIndex).trim();
                            }
                            document.querySelector('.categoryLimitSpan').innerText = word
                            document.querySelector('.limitOptionSpan').innerText = word
                            limitRange = word;
                            //check if payIn or payOut has been checked and check the necessary buttons
                            if (row.querySelector('.categoryBalance').innerText === 'PayIn') {
                                balanceValue = 'PayIn'
                                document.getElementById('credit').checked = true;
                                //store this ina local storage
                                localStorage.setItem('balanceValue', balanceValue)

                            }
                            else if (row.querySelector('.categoryBalance').innerText === 'PayOut') {
                                // alert('payOut')
                                balanceValue = 'PayOut'
                                //store this in a local storage
                                localStorage.setItem('balanceValue', balanceValue)
                                document.getElementById('debit').checked = true;
                            }
                        }
                    }
                    //==================================================================================================
                    // Get all the checkboxes in the table
                    document.querySelector("#myCheck").addEventListener("click", () => {
                        checkedRowsId = []
                        const rowCheckBoxes = document.querySelectorAll(".form-check-input:enabled")
                        if (document.querySelector("#myCheck").checked === true) {
                            //lets loop in the table
                            const categoryTableRows = document.querySelectorAll('.allTableRows')
                            categoryTableRows.forEach((cashFlow) => {
                                if (cashFlow.querySelector(".form-check-input").checked === true) {
                                    let catArray = {}
                                    let cashFlowCat = cashFlow.querySelector('.categoryName').innerText
                                    cashFlowCat = (cashFlowCat.replace(/ /g, "_")).toLowerCase();
                                    catArray[cashFlow.querySelector('.categoryId').textContent.trim()] = cashFlowCat
                                    checkedRowsId.push(catArray)
                                }
                            });
                            for (let i = 0; i < rowCheckBoxes.length; i++) {
                                const rowCheckBox = rowCheckBoxes[i];
                                rowCheckBox.checked = true
                            }
                            deleteModal.style.display = "block";
                        } else {
                            checkedRowsId = []
                            for (let i = 0; i < rowCheckBoxes.length; i++) {
                                const rowCheckBox = rowCheckBoxes[i];
                                rowCheckBox.checked = false
                            }
                            deleteModal.style.display = "none";
                        }
                    });

                }

                // Get the "Delete" button element in the modal
                const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
                const confirmDeleteBtn2 = document.getElementById('confirm-delete-btn2');
                confirmDeleteBtn2.addEventListener('click', async () => {
                    const deleteRowsModal = document.getElementById('deleteRowsId');
                    const yesDeleteRows = document.getElementById('yesDelete');
                    const noDeleteRows = document.getElementById('noDelete');
                    const closeDelete = document.getElementById('closeDelete2');
                    //display the delte modal
                    deleteRowsModal.style.display = 'block'
                    document.querySelector('.deleteMsg').innerText = 'Do you want to delete ' + checkedRowsId.length + ' Category(ies)?'
                    noDeleteRows.addEventListener('click', (event) => {
                        event.preventDefault();
                        //close the delte modal
                        deleteRowsModal.style.display = 'none'

                    })
                    closeDelete.addEventListener('click', (event) => {
                        event.preventDefault();
                        //display the delte modal
                        deleteRowsModal.style.display = 'none'

                    })
                    //when the yes button is clicked
                    yesDeleteRows.addEventListener('click', (event) => {
                        if (checkedRowsId.length > 0) {
                            //  Hide the delete modal
                            deleteModal.style.display = 'none';
                            deleteRowsModal.style.display = 'none'
                            deleteRows(checkedRowsId)
                        }
                    })
                })
                // When the "Delete" button is clicked, delete the selected rows
                confirmDeleteBtn.addEventListener('click', async () => {
                    const deleteRowsModal = document.getElementById('deleteRowsId');
                    const yesDeleteRows = document.getElementById('yesDelete');
                    const noDeleteRows = document.getElementById('noDelete');
                    const closeDelete = document.getElementById('closeDelete2');
                    //display the delte modal
                    deleteRowsModal.style.display = 'block'
                    document.querySelector('.deleteMsg').innerText = 'Do you want to delete ' + checkedRowsId.length + ' Category(ies)?'
                    noDeleteRows.addEventListener('click', (event) => {
                        event.preventDefault();
                        //close the delte modal
                        deleteRowsModal.style.display = 'none'

                    })
                    closeDelete.addEventListener('click', (event) => {
                        event.preventDefault();
                        //display the delte modal
                        deleteRowsModal.style.display = 'none'

                    })
                    //when the yes button is clicked
                    yesDeleteRows.addEventListener('click', (event) => {
                        if (checkedRowsId.length > 0) {
                            //  Hide the delete modal
                            deleteModal.style.display = 'none';
                            deleteRowsModal.style.display = 'none'
                            deleteRows(checkedRowsId)
                        }
                    })
                });

                //=================================================================================================

                //ADD AN EVENT LISTENER TO DISPLAY OPTION DROPDOWN AAFTER THE CATEGOTY LIMIT FIELD IS FILLED OR HAS AN INPUT
                const limitOption = document.querySelector('.limitOption')
                limitOption.addEventListener("click", function (event) {
                    optionModal.style.display = 'block'
                })
                //IF USER CLICKED OUTSIDE ANYWHERE, IT REMOVES
                document.addEventListener('mousedown', function handleClickOutsideBox(event) {
                    if (!optionModal.contains(event.target)) {
                        optionModal.style.display = 'none';
                    }
                });

                //WHEN THE Debit radio btn  IS SELECTED
                const debitBtn = document.getElementById('debit')
                debitBtn.addEventListener("click", function (event) {
                    //check if credit header utton is clciked
                    if (creditBtn.checked === true) {
                        creditBtn.checked = false
                    }
                    balanceValue = debitBtn.value

                })
                //WHEN THE PAYIN HEader IS SELECTED
                const creditBtn = document.getElementById('credit')
                creditBtn.addEventListener("click", function (event) {
                    //check if debit header utton is clciked
                    if (debitBtn.checked === true) {
                        debitBtn.checked = false
                    }
                    //    alert(creditBtn.value)
                    balanceValue = creditBtn.value


                })

                //============================================================================================================
                //NOW LOOP IN THEMODAL OPTION LIST ARRAY
                //CHECK THE ONE BEING CLICKED AND THEN AUTO FILL THE CATEGORY LIMIT FIELD WITH THE SELECTED
                for (let i = 0; i < allOptions.length; i++) {
                    const button = allOptions[i];
                    button.addEventListener("click", function (event) {

                        if (button.innerText === 'Daily') {
                            limitRange = button.innerText

                        }
                        if (button.innerText === 'Weekly') {
                            // alert(button.innerText)
                            limitRange = button.innerText

                        }
                        if (button.innerText === 'Monthly') {
                            // alert(button.innerText)
                            limitRange = button.innerText

                        }
                        if (button.innerText === 'Yearly') {
                            // alert(button.innerText)
                            limitRange = button.innerText

                        }
                        document.querySelector('.limitOptionSpan').innerText = limitRange
                        document.querySelector('.categoryLimitSpan').innerText = limitRange
                        optionModal.style.display = 'none'
                    })
                }

                //when the form is submitted
                let categoryToDb = []
                document.getElementById('myForm').addEventListener('submit', function (event) {
                    event.preventDefault(); // Prevent form submission
                    let categoryName = document.getElementById('categoryNameId').value;
                    categoryName = (categoryName).replace(/ /g, "_").toLowerCase();
                    let categoryLimit = 0;
                    if (document.getElementById('categoryLimitId').value === 0) {
                        categoryLimit = categoryLimit
                    }
                    else if (document.getElementById('categoryLimitId').value !== 0) {
                        categoryLimit = Number(document.getElementById('categoryLimitId').value)
                    }
                    //CATEGORY LIMIT SHOULD BE BASED ON THE BASE CURRENCY SELECTED
                    //store the category limit in local storage
                    if (submitCategory.innerText === 'Add Category') {
                        categoryToDb = []
                        // localStorage.removeItem("categoryLimitAmount");
                        if (categoryName !== '' && balanceValue !== '') {
                            let newDocs = {}
                            newDocs['category'] = categoryName
                            newDocs['CategoryLimit'] = Number(categoryLimit)
                            newDocs['CategoryLimitRange'] = limitRange
                            newDocs['Balance'] = balanceValue
                            categoryToDb.push(newDocs)
                            if (categoryToDb.length > 0) {
                                createCategoryRecord(categoryToDb)
                                //removee the add form
                                containerWrapper.style.display = 'none'
                            }
                        }
                        else if (categoryName === '' || balanceValue === '') {
                            notification(' Category Name and Category Type Required')
                            return
                        }
                        localStorage.setItem("oldBaseCurrencyRate", (baseCurrName.RATE));
                        //CALL THIS FUNCTION TO THEN UPDATE THE CATEGORISED ITEMS if something has already been assigned
                        if (assignedItemsArray.length !== 0) {
                            //first check if its for assigning to a to be created categories, first check that the category exist or not ,if not create it and also
                            //continue assigning else dont create just assign
                            theCategoryName = categoryName
                            updateAssignedDocs(assignedItemsArray, theCategoryName)
                            //
                        }

                    }
                    else if (submitCategory.innerText === 'Edit Category') {
                        //clear the old base currency if entering new category so that the amount can be in that amount in full
                        localStorage.removeItem("oldBaseCurrencyRate");
                        let oldBaseCurrencyRate = localStorage.getItem("oldBaseCurrencyRate");

                        if (oldBaseCurrencyRate === null) {
                            oldBaseCurrencyRate = baseCurrName.RATE
                        }
                        //get the new category  name
                        newCatName = document.getElementById('categoryNameId').value
                        newCatName = (newCatName).replace(/ /g, "_").toLowerCase();
                        //CATEGORY LIMIT SHOULD BE BASED ON THE BASE CURRENCY SELECTED
                        categoryLimit = (parseFloat(categoryLimit) / parseFloat(oldBaseCurrencyRate)) * parseFloat(baseCurrName.RATE)
                        //LOOP IN THE TABLE TO UPDATE RELATIVE CELLS
                        const allTableRows = document.querySelectorAll('.allTableRows')
                        //get values from the form
                        const categoryId = document.querySelector('.myCategoryId').innerText;
                        for (let t = 0; t < allTableRows.length; t++) {
                            const index = allTableRows[t];
                            //NOW TAKE WHAT IS ON THE form AND PUT ON THE ROW CLICKED 
                            if (index.querySelector('.categoryId').textContent.trim() === categoryId) {
                                newCatName = (newCatName).replace(/_/g, " ");
                                newCatName = (newCatName).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                index.querySelector('.categoryName').innerText = newCatName
                                index.querySelector('.categoryLimit').innerText = Number(document.getElementById('categoryLimitId').value)
                                index.querySelector('.limitRange').innerText = '(' + document.querySelector('.limitOptionSpan').innerText + ')';
                                index.querySelector('.categoryBalance').innerText = balanceValue;
                                //IF THERE ARE NO ROWS IN THE TABLE JUST  APPEND ELSE APPEND AFTER THE ALREADY EXISTING
                                //change color of row has either value payin or payout
                                if (balanceValue === 'PayOut') {
                                    index.classList.add('rowPayOut');
                                }
                                else if (balanceValue === 'PayIn') {
                                    index.classList.add('rowPayIn');
                                }
                            }
                        }


                        //find the id in that array
                        const categoryIdCheck = Array.from(cashFlowCategories).find(cat => cat._id === categoryId); //find matching currency name with the one in the incomes table
                        if (categoryIdCheck) {
                            categoryIdCheck._id = categoryId
                            categoryIdCheck.category = categoryName
                            categoryIdCheck.CategoryLimit = Number(categoryLimit)
                            categoryIdCheck.CategoryLimitRange = limitRange
                            categoryIdCheck.Balance = balanceValue
                            updateCategoryRecord(categoryId, oldCatName, categoryName, categoryLimit, limitRange, balanceValue)

                        }

                        //CALL THIS FUNCTION TO THEN UPDATE THE CATEGORISED ITEMS if something has already been assigned
                        if (assignedItemsArray.length !== 0) {
                            updateAssignedDocs(assignedItemsArray, theCategoryName)
                        }
                        submitCategory.textContent = 'Add Category'
                        //removee the add form
                        containerWrapper.style.display = 'none'
                        deleteModal2.style.display = 'none'
                        localStorage.removeItem('totalAmount')
                    }
                    // Get the input values

                    // Reset the form inputs
                    document.getElementById('categoryNameId').value = '';
                    document.getElementById('categoryLimitId').value = 0;
                    document.querySelector('.limitOptionSpan').innerText = '';
                    document.querySelector('.categoryLimitSpan').innerText = ''
                    document.getElementById('debit').checked = false;
                    document.getElementById('credit').checked = false;
                    for (let i = 0; i < allOptions.length; i++) {
                        const button = allOptions[i];
                        button.checked = false
                    }
                });
                //======================================================================================================

                save.addEventListener("click", function (event) {
                    //CALL THIS FUNCTION TO THEN UPDATE THE CATEGORISED ITEMS if something has already been assigned
                    let categoryName = document.getElementById('categoryNameId').value;
                    categoryName = (categoryName).replace(/ /g, "_").toLowerCase();
                    let categoryLimit = 0;
                    if (document.getElementById('categoryLimitId').value === 0) {
                        categoryLimit = categoryLimit
                    }
                    else if (document.getElementById('categoryLimitId').value !== 0) {
                        categoryLimit = Number(document.getElementById('categoryLimitId').value)
                    } if (assignedItemsArray.length !== 0) {
                        //first check if its for assigning to a to be created categories, first check that the category exist or not ,if not create it and also
                        //continue assigning else dont create just assign
                        if (submitCategory.innerText === 'Add Category') {
                            categoryToDb = []
                            // localStorage.removeItem("categoryLimitAmount");
                            if (categoryName !== '' && balanceValue !== '') {
                                let newDocs = {}
                                newDocs['category'] = categoryName
                                newDocs['CategoryLimit'] = Number(categoryLimit)
                                newDocs['CategoryLimitRange'] = limitRange
                                newDocs['Balance'] = balanceValue
                                categoryToDb.push(newDocs)
                                if (categoryToDb.length > 0) {
                                    createCategoryRecord(categoryToDb)
                                    //removee the add form
                                    containerWrapper.style.display = 'none'
                                }
                            }
                            else if (categoryName === '' || balanceValue === '') {
                                notification(' Category Name and Category Type Required')
                                return
                            }
                        }
                        localStorage.setItem("oldBaseCurrencyRate", (baseCurrName.RATE));
                        theCategoryName = categoryName
                        updateAssignedDocs(assignedItemsArray, theCategoryName)
                        //Clear the data withing the current modal and innitialize zero on the area with total amount of that category'
                        document.querySelector('.catAmount').innerText = Number(0).toFixed(2)
                        const allTableRows = document.querySelectorAll('.categoryRows')
                        for (let h = 0; h < allTableRows.length; h++) {
                            const row = allTableRows[h];
                            row.style.display = 'none'
                        }
                        containerWrapper.style.display = "none";
                        modal.style.display = 'none'

                    }
                    localStorage.removeItem('totalAmount')

                })
                function displayAssignmentModal() {
                    currentPage = 1
                    localStorage.setItem('catCurrentPage', currentPage)
                    displayCashFlowDocs(startDate, endDate)
                    if (containerWrapper.style.display === 'block' && event.target !== btn) {
                        containerWrapper.style.display = "block";
                        deleteModal2.style.display = 'block'
                        // DONT CLOSE IT WHEN THE ASSIGN CATEGORIES IS CLICKED
                    }
                    assignedItemsArray = []
                    modal.style.display = "block";

                }
                // When the user clicks on the button, open the modal
                btn.addEventListener("click", function (event) {
                    event.preventDefault()
                    displayAssignmentModal()
                })

                // When the user clicks on <span> (x), close the modal
                close.addEventListener("click", function (event) {
                    modal.style.display = "none";
                })

                // When the user clicks on <span> (x), close the modal
                document.querySelector('.closeForm').addEventListener("click", function (event) {
                    if (assignedItemsArray.length > 0) {
                        //display a modal
                        theConfirmModal.style.display = 'block'
                        document.querySelector('.selectedTransactions').innerText = assignedItemsArray.length
                    }
                    else {
                        containerWrapper.style.display = "none";
                    }
                    localStorage.removeItem('totalAmount')

                })
                noDiscard.addEventListener("click", function (event) {
                    event.preventDefault();
                    // Check if the containerWrapper is currently displayed
                    if (containerWrapper.style.display === 'block' && event.target === noDiscard) {
                        containerWrapper.style.display === 'block'
                        // Show the delete modal without closing the confirm modal
                        deleteModal2.style.display = 'block';
                        // Hide the confirm modal 
                        theConfirmModal.style.display = 'none';
                    }
                });

                yesDiscard.addEventListener("click", function (event) {
                    assignedItemsArray = []
                    // Check if the containerWrapper is currently displayed
                    if (containerWrapper.style.display === 'block' && event.target === yesDiscard) {
                        containerWrapper.style.display === 'block'
                        // Show the delete modal without closing the confirm modal
                        deleteModal2.style.display = 'block';
                        // Hide the confirm modal 
                        theConfirmModal.style.display = 'none';
                    }
                })
                closeModal.addEventListener("click", function (event) {
                    theConfirmModal.style.display = 'none'

                })
                // When the user clicks anywhere outside of the modal, close it
                window.addEventListener("click", function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                    if (event.target == theConfirmModal) {
                        theConfirmModal.style.display = "none";
                    }
                })
                //========================================================================================================
                const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                const eDate = localStorage.getItem('lastDate');
                // let balanceValue = '';
                startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                endDate = new Date(eDate);
                assignedItemsArray = []//empty the selected items array
                let totalAmount
                localStorage.removeItem('totalAmount')
                function displayCashFlowDocs(startDate, endDate) {
                    document.querySelector('.catName').innerHTML = document.getElementById('categoryNameId').value
                    theCategoryName = (document.getElementById('categoryNameId').value.replace(/ /g, "_")).toLowerCase();
                    //GET THE L/S STORED STARTIND DATE AND THE END DATE
                    //GET THE L/S PAGE SIZE AND PAGE NUIMBER
                    pageSize = localStorage.getItem('catItemsPerPage');
                    //loop within the radio buttons and get the value of the checked value type
                    let balanceValue = ''
                    document.querySelectorAll('input[type="radio"]').forEach(radio => {
                        if (radio.checked === true) {
                            balanceValue = radio.value
                        }
                        else {
                            radio.addEventListener("click", function () {
                                balanceValue = radio.value
                            })
                        }
                    })
                    // alert(balanceValue)
                    if (pageSize === null) {
                        pageSize = 5
                    }
                    page = localStorage.getItem('catCurrentPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1

                    //check if the page is empty or if the painfilter is not empty and that we are in the filtering mode
                    if (page === null) {
                        page = 1
                    }

                    let totalPages = 0
                    fetch('/getCategoriesTotals', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            startDate: startDate,
                            endDate: endDate,
                            pageSize: pageSize,
                            page: page,
                            theCategoryName: theCategoryName,
                            sessionId: sessionId
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            const amount = localStorage.getItem('totalAmount')
                            // totalAmount = Number(amount).toFixed(2)
                            if (balanceValue === 'PayIn') {
                                //change colors of thead and buttons
                                document.querySelector('.isoCode').innerText = isoCode
                                if (amount === null) {
                                    document.querySelector('.catAmount').innerText = Number(data.totalPayInsPerCat).toFixed(2)
                                }
                                else if (amount !== null) {
                                    document.querySelector('.catAmount').innerText = Number(totalAmount).toFixed(2)
                                }
                                document.querySelector('.thead').style.backgroundColor = '#88a6bb'
                                document.getElementById('save').style.backgroundColor = '#88a6bb'
                                cashFlowArray = data.payInsToProcess
                                totalPages = data.payInTotalPages
                                newRow(cashFlowArray, totalPages)
                            }
                            else if (balanceValue === 'PayOut') {

                                document.querySelector('.thead').style.backgroundColor = '#de7d57'
                                document.getElementById('save').style.backgroundColor = '#de7d57'
                                document.querySelector('.isoCode').innerText = isoCode
                                if (amount === null) {
                                    document.querySelector('.catAmount').innerText = Number(data.totalPayOutsPerCat).toFixed(2)
                                }
                                else if (amount !== null) {
                                    document.querySelector('.catAmount').innerText = Number(totalAmount).toFixed(2)
                                }
                                cashFlowArray = data.payOutsToProcess
                                totalPages = data.payOutTotalPages
                                newRow(cashFlowArray, totalPages)
                            }
                        })
                }
                //=======================================================================================================
                //create the assign categories table

                function newRow(cashFlowArray, totalPages) {

                    // Create a new row in the table
                    //FIRST CLEAR EXISTING ROWS

                    const table = document.getElementById('categoryTable');
                    // const row = table.insertRow(-1); // -1 to insert at the end
                    const tbody = table.getElementsByTagName('tbody')[0]; // Get the table body

                    //LOOP IN THE ARRAY DISPLAYING ROWS WITH THE DATA
                    let isCreated = false
                    for (let i = 0; i < cashFlowArray.length; i++) {
                        const category = cashFlowArray[i];
                        const idExist = Array.from(assignedItemsArray).find(cat => cat.id === category._id)
                        const row = document.createElement('tr');
                        row.classList.add('categoryRows')

                        const checkboxCell = document.createElement('td');
                        checkboxCell.style.padding = '8px'
                        checkboxCell.style.textAlign = 'justify'
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.classList.add('form-check');
                        checkbox.value = 'checkedValue';
                        if (idExist) {
                            //get the totals
                            // document.querySelector('.catAmount').innerText = Number(totalAmount).toFixed(2)
                            checkbox.checked = true
                        }
                        else {
                            // document.querySelector('.catAmount').innerText = Number(totalAmount).toFixed(2)
                            checkbox.checked = false
                        }
                        checkboxCell.appendChild(checkbox);
                        row.appendChild(checkboxCell);
                        //ID TD
                        const hiddenCell = document.createElement('td');
                        hiddenCell.style.padding = '8px'
                        hiddenCell.style.textAlign = 'justify'
                        hiddenCell.hidden = true;
                        hiddenCell.innerHTML = category._id
                        hiddenCell.classList.add('hiddenId');
                        row.appendChild(hiddenCell);

                        const descriptionCell = document.createElement('td');
                        descriptionCell.style.textAlign = 'justify'
                        descriptionCell.style.padding = '5px'
                        const descriptionCellSpan = document.createElement('span');
                        descriptionCellSpan.classList.add('description')
                        descriptionCellSpan.style.display = 'block'
                        descriptionCellSpan.style.marginTop = '-5px'
                        descriptionCellSpan.style.marginBottom = '-14px'
                        descriptionCellSpan.textContent = category.CashFlowDescription; // Replace with desired content
                        //create a span that will contain the category for that transaction
                        const categoriesCell = document.createElement('span');
                        categoriesCell.style.textAlign = 'justify'
                        categoriesCell.style.padding = '8px'
                        categoriesCell.classList.add('Category')
                        categoriesCell.style.fontSize = '11px'
                        categoriesCell.style.fontStyle = 'italic'
                        if (category.CashFlowCategory.includes("_")) {
                            category.CashFlowCategory = category.CashFlowCategory.replace(/_/g, " ").toLowerCase();
                        }
                        else {
                            category.CashFlowCategory = category.CashFlowCategory.toLowerCase();
                        }
                        if (category.CashFlowCategory === 'suspense') {
                            categoriesCell.style.color = 'black'
                        }
                        else if (category.CashFlowCategory !== 'suspense' && category.CashFlowCategory !== (document.getElementById('categoryNameId').value).toLowerCase()) {
                            categoriesCell.style.color = 'grey'
                        }

                        else if ((category.CashFlowCategory === (document.getElementById('categoryNameId').value).toLowerCase()) && category.CashFlowType === 'Pay in') {
                            categoriesCell.style.color = ' #4169e1'
                        }
                        else if ((category.CashFlowCategory === (document.getElementById('categoryNameId').value).toLowerCase()) && category.CashFlowType === 'Payout') {
                            categoriesCell.style.color = '#de7d57'
                        }
                        category.CashFlowCategory = (category.CashFlowCategory).replace(/_/g, " ");
                        category.CashFlowCategory = (category.CashFlowCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                        categoriesCell.textContent = category.CashFlowCategory;
                        descriptionCell.appendChild(descriptionCellSpan);
                        descriptionCell.appendChild(categoriesCell);
                        row.appendChild(descriptionCell);
                        const amountCell = document.createElement('td');
                        amountCell.style.textAlign = 'justify'
                        amountCell.style.padding = '5px'
                        const amountCellSpan1 = document.createElement('span');
                        const amountCellSpan2 = document.createElement('span');
                        amountCellSpan2.classList.add('amount')
                        amountCellSpan1.textContent = isoCode
                        amountCellSpan2.textContent = Number(category.CashFlowAmount).toFixed(2)
                        amountCell.appendChild(amountCellSpan1);
                        amountCell.appendChild(amountCellSpan2);
                        row.appendChild(amountCell);
                        isCreated = true
                        // Append the row to the table body
                        row.style.borderBottom = '0.5px solid #d3d3d3'
                        rowEvenListeners(row)
                        tbody.appendChild(row);

                    }

                    //THIS HAS TO BE VISIBLE ALWAYS WHETHER THERE ARE MORE THAN 1 PAGE
                    if (isCreated === true) {
                        document.querySelector(".footer").style.display = "block";
                    }
                    else if (isCreated === false) {
                        document.querySelector(".footer").style.display = "none";
                    }
                    // update the status section with current page and items per page information
                    document.querySelector('.spanText').innerText = page;
                    document.querySelector('.spanText1').innerText = totalPages; //THIS WILL WRITE 1 OF BLA BLA BLA

                    document.querySelector('.rowsPerPage').innerText = pageSize

                }
                //function to add event listeners to the rows
                assignedItemsArray = []
                function rowEvenListeners(row) {
                    let currentItemID = row.querySelector(".hiddenId").textContent.trim();
                    let currentRowAmount = row.querySelector(".amount").innerText;
                    let currentCheckBoxStatus = row.querySelector('.form-check').checked
                    let isClickedOnCheckBox = "N"

                    //PUT THE ALREADY EXISTING ITEM INTO THAT SAME ARRAY WITH THE NEW ITEMS TO BE ASSIGNED
                    if ((document.getElementById('categoryNameId').value).toLowerCase() === (row.querySelector(".Category").innerText).toLowerCase()) {
                        row.querySelector('.form-check').disabled = true;  // Disable the checkbox, we will have to reconsider this
                        row.querySelector('.form-check').checked = true;  // check the checkbox with the already asigned items
                    } else {
                        // all rows will have a click listener
                        row.addEventListener("click", () => {
                            calculateTotals()
                        })
                        // add a click listener on the row's checkbox
                        currentCheckBoxStatus = row.querySelector('.form-check').checked
                        row.querySelector('.form-check').addEventListener("click", () => {
                            isClickedOnCheckBox = "Y"
                        })
                    }
                    totalAmount = Number(document.querySelector('.catAmount').innerText).toFixed(2)
                    function calculateTotals() {
                        if ((isClickedOnCheckBox === "N")) {
                            if (row.querySelector('.form-check').checked === false) {
                                addTotals()
                            } else if (row.querySelector('.form-check').checked === true) {
                                subtractTotals()
                            }
                        } else if (isClickedOnCheckBox = "Y") {
                            if (row.querySelector('.form-check').checked === true) {
                                addTotals()
                            } else if (row.querySelector('.form-check').checked === false) {
                                subtractTotals()
                            }
                            isClickedOnCheckBox = "N"
                        }

                        function addTotals() {
                            // Create an object to represent the item to be added
                            let myArray = {
                                id: currentItemID,
                                amount: Number(currentRowAmount).toFixed(2)
                            };
                            assignedItemsArray.push(myArray)
                            // inccrease the total amount by the current row amount
                            totalAmount = Number(totalAmount) + Number(currentRowAmount);
                            document.querySelector('.catAmount').innerText = totalAmount.toFixed(2);
                            // Update the status to false
                            row.querySelector('.form-check').checked = true;
                        }

                        function subtractTotals() {
                            // Create an object to represent the item to be removed
                            let myArray = {
                                id: currentItemID,
                                amount: Number(currentRowAmount).toFixed(2)
                            };
                            // Remove the item with the matching ID from assignedItemsArray
                            assignedItemsArray = assignedItemsArray.filter(item => item.id !== myArray.id);
                            // Decrease the total amount by the current row amount
                            totalAmount = Number(totalAmount) - Number(currentRowAmount);
                            document.querySelector('.catAmount').innerText = totalAmount.toFixed(2);
                            // Update the status to false
                            row.querySelector('.form-check').checked = false;
                        }
                    }
                }

                //========================================================================================================
                //function to update the selected items and their categories
                function updateAssignedDocs(assignedItemsArray, theCategoryName) {
                    try {
                        fetch('/updateAssignedDocs', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                assignedItemsArray,
                                theCategoryName,
                                sessionId
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.isUpdated === true) {
                                    notification('Updated')
                                    assignedItemsArray = []

                                }
                                else {
                                    notification('An Error Occured, Try Again...')
                                }
                            })
                    } catch (err) {
                        console.error(err);
                    }

                }

                //=========================================================================================================
                //PAGINATION Settings
                document.querySelector('.spanText').addEventListener("click", function (event) {
                    document.querySelector('.spanText').contentEditable = true //allow editing
                    // change the baCKGROUND TO A COLOR THAT SHOWS THAT WE ARE NOW EDITING 
                    document.querySelector('.spanText').style.backgroundColor = '#88a6bb'
                    document.querySelector('.spanText').style.textDecoration = 'underline'
                })

                document.querySelector('.spanText').addEventListener("keydown", function (event) {
                    const keyCode = event.keyCode;
                    if ((keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                        (keyCode >= 96 && keyCode <= 105) ||
                        (keyCode == 13) ||
                        (keyCode == 8) || // backspace
                        (keyCode == 9) || // tab
                        (keyCode == 190) || (keyCode == 37 || keyCode == 39)) { // Allow input
                    } else {
                        // Prevent input
                        event.preventDefault();
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        if (parseInt(event.target.innerText) <= parseInt(document.querySelector('.spanText1').innerText)) {
                            //change the innertext with the numbers entered
                            document.querySelector('.spanText').innerText = event.target.innerText
                            //remove focus 
                            document.querySelector('.spanText').blur()
                            //store the entered numbers to LS
                            localStorage.setItem('catCurrentPage', parseInt(document.querySelector('.spanText').innerText))
                            //call the default display function
                            displayCashFlowDocs(startDate, endDate)
                            // change the baCKGROUND TO no COLOR THAT SHOWS THAT WE ARE NOW EDITING 
                            document.querySelector('.spanText').style.backgroundColor = 'white'
                            document.querySelector('.spanText').style.textDecoration = 'none'
                        }
                        else if (parseInt(event.target.innerText) > parseInt(document.querySelector('.spanText1').innerText)) {
                            notification('number exceeds total pages')
                            return
                        }
                    }
                })
                let catItemsPerPage
                const rowsPerPage = document.querySelector('.rowsPerPage')
                //the rowsperpage innertext should show the number of rows as five
                rowsPerPage.innerText = catItemsPerPage
                const paginationList = document.querySelectorAll('.paginationList');
                paginationList.forEach(page => {
                    page.addEventListener("click", (event) => {
                        catItemsPerPage = page.innerText;
                        //now change the innertext of the page container and remove dropdown
                        rowsPerPage.innerText = catItemsPerPage
                        //change alse the current page to one
                        currentPage = 1;
                        // paginationContainer.style.display = 'none'
                        // Store the catItemsPerPage value in localStorage
                        localStorage.setItem('catItemsPerPage', catItemsPerPage);
                        // Store the currentpage value in localStorage
                        localStorage.setItem('catCurrentPage', currentPage);
                        //THIS SHOULD JUST CALL THE DEFAULT DISPLAY
                        displayCashFlowDocs(startDate, endDate)
                    });
                });
                // Initial display
                function goPrev() {
                    currentPage = parseInt(document.querySelector('.spanText').innerText)
                    const totalPages = parseInt(document.querySelector('.spanText1').innerText)
                    if (currentPage > 1) {
                        currentPage--; //decrement the pages
                        document.querySelector('.spanText').innerText = currentPage
                        localStorage.setItem('catCurrentPage', currentPage);
                        ///store the total amount in local storage
                        localStorage.setItem('totalAmount', document.querySelector('.catAmount').innerText)
                        displayCashFlowDocs(startDate, endDate)
                    }
                    else if (currentPage === 1) {
                        currentPage = totalPages
                        document.querySelector('.spanText').innerText = currentPage
                        localStorage.setItem('catCurrentPage', currentPage);
                        // isNavigating = true//we are changing the navigation status to true
                        // isFiltering = false //change the filtering to false kana tamu mode ye navigation
                        displayCashFlowDocs(startDate, endDate)
                    }
                }
                function goNext() {
                    currentPage = parseInt(document.querySelector('.spanText').innerText)
                    const totalPages = parseInt(document.querySelector('.spanText1').innerText)//Math.ceil(rangeData.length / itemsPerPage);
                    if (currentPage < totalPages) {
                        currentPage++;//increment the currentpage by1
                        document.querySelector('.spanText').innerText = currentPage
                        localStorage.setItem('catCurrentPage', currentPage);
                        localStorage.setItem('totalAmount', document.querySelector('.catAmount').innerText)
                        displayCashFlowDocs(startDate, endDate)
                    }
                    else if (currentPage === totalPages) {
                        currentPage = 1
                        document.querySelector('.spanText').innerText = currentPage
                        localStorage.setItem('catCurrentPage', currentPage);
                        localStorage.setItem('totalAmount', document.querySelector('.catAmount').innerText)
                        displayCashFlowDocs(startDate, endDate)
                    }
                }
                const prevArrow = document.getElementById('previous');
                const nextArrow = document.getElementById('next');

                prevArrow.addEventListener('click', goPrev);
                nextArrow.addEventListener('click', goNext);
                //======================================================================================================
                function createCategoryRecord(categoryToDb) {  //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE CASH EQUIV STATUS NOT THE ENTIRE COLLECTION
                    fetch('/insertCategory', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            categoryToDb,
                            sessionId
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.isSaving === true) {
                                let dbDocs = data.documents
                                console.log(dbDocs)
                                categoryToDb = []
                                defaultDisplayContent()//function to display the updated data from db
                                notification('Added')
                            }
                        })

                        .catch(error => {
                            console.error(`ErrorInserting`, error);
                        });
                }
                function updateCategoryRecord(categoryId, oldCatName, categoryName, categoryLimit, limitRange, balanceValue) {
                    fetch('/UpdateCategoryRow', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ categoryId, oldCatName, categoryName, categoryLimit, limitRange, balanceValue, sessionId })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.isUpdated === true) {
                                notification('Updated')
                                //check kuti mu LS mune a name rakafanana ne the old name here, if so set the new name
                                let payInFilterCategory = localStorage.getItem("payInCategory")
                                if (payInFilterCategory === oldCatName) {
                                    localStorage.setItem("payInCategory", newCatName)
                                }
                                assignedItemsArray = []
                                defaultDisplayContent()//function to display the updated data from db
                                categoryToDb = []
                            }

                        })
                        .catch(error => {
                            console.error('error saving currency');
                        })
                }
                //==========================================================================================
                function deleteRows(checkedRowsId) {
                    try {
                        fetch('/deleteCategoriesRows', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                checkedRowsId,
                                sessionId

                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.amDeleted === true) {
                                    notification('Deleted')
                                    checkedRowsId = []
                                    defaultDisplayContent()//function to display the updated data from db
                                    //remove any filter in the  local storage
                                    localStorage.removeItem("payInCategory")
                                    if (document.getElementById("myCheck").checked === true) {
                                        document.getElementById("myCheck").checked = false
                                    }
                                    // location.href = "/categories"
                                }
                                else {
                                    notification('An Error Occured, Try Again...')
                                }

                            })
                    } catch (err) {
                        console.error(err);
                    }

                }
                //WHEN EVERYTHING IS LOADED SUCCEFULLY CLOSE THE LOADER
                displayContainerBlocks()

                //===========================================================================================

                //     })
                //     .catch(error => console.error('Error fetching expense categories:', error));
                // console.log(newExpenseCategories); // do something with the currencies array

            })
            .catch(error => console.error('Error fetching income categories:', error));
        console.log(cashFlowCategories); // do something with the currencies array

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
