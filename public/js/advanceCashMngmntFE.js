//============================================================================
//import { format } from "path";
//import moment from "moment";
//import moment from "moment/moment.js";

import { WorldCurrencies } from "./worldCurrency.js";
let newCurrencies = []; let newIncomeCategories = [];
let newExpenseCategories = []; let startDate = ""; let endDate = ""; let isoCode = ''; let symbol = ''; let selectedDate = ''; let dataArray = []; let checkedRows = []; let headersStatus = []; let formattedValue = ''
let sign = ''; let openingBalance = 0; let currentPage; let isEditMode = false; let advItemsPerPage; let totalPayOutsRange = 0; let totalPayInsRange = 0; let checkedRowsId = []
let totalCash = 0
let totalPages = 0; let displayModal = false; let cashFlowArray = []; let advExportingCriteria = "FullExport"; let page = 0; let pageSize = 0; let hasId = false;
let vatIsChecked = false; let taxtypeSelected = ''; let rowData = []; let rowDataFromDb = []; let itemsToProcess = []; let taxStatus = 'N';

fetch('/currencies')
    .then(response => response.json())
    .then(currencies => {
        currencies.forEach((currency) => {
            newCurrencies.push(currency);
        });
        fetch('/getCategories')
            .then(response => response.json())
            .then(allCashFlowCategories => {
                for (let k = 0; k < allCashFlowCategories.length; k++) {
                    const element = allCashFlowCategories[k];
                    if (element.Balance === 'PayIn') {
                        newIncomeCategories.push(element)
                    }
                    else if (element.Balance === 'PayOut') {
                        newExpenseCategories.push(element)
                    }
                }
                fetch('/getAdvHeaderStatus')
                    .then(response => response.json())
                    .then(advancedHeaderStatus => {

                        advancedHeaderStatus.forEach((stat) => {
                            headersStatus.push(stat);
                        });
                        //clear the edit mode status 
                        localStorage.removeItem('editMode')
                        function displayContainerBlocks() {

                            document.querySelector(".loader-container").style.display = "none";
                            document.querySelector(".theLoader").style.display = "none";
                            document.querySelector(".icon-nav").style.display = "block";
                            document.querySelector(".toolbar").style.display = "block";
                            document.getElementById("chartContainer").style.display = "block";
                            document.querySelector(".card1").style.display = "block";
                            document.querySelector(".main-card-second").style.display = "block";

                        }
                        //=======================================================================================
                        // Get the modal element
                        const deleteModal = document.querySelector('.deleteModal');
                        // Get the "Delete" button element in the modal
                        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
                        //=======================================================================================
                        //THEPAYIN AND PAYOUT BOXES CLICK EVENTLISTENER
                        const incomeBox = document.getElementById('incomeBox');
                        incomeBox.addEventListener('click', () => {
                            // Redirect to the template file download link
                            location.href = '/payIn';
                        });
                        const expenseBox = document.getElementById('expenseBox');
                        expenseBox.addEventListener('click', () => {
                            // Redirect to the template file download link
                            location.href = '/payOut';
                        });
                        //=======================================================================================
                        //FUNCTION TO TRUNCATE(KUGURA LONG TEXT TICHIZOISA MA DOTS)
                        function truncateText(text, maxLength) {
                            if (text.length <= maxLength) {
                                return text;
                            }
                            // Truncate the text and add ellipsis
                            return text.substring(0, maxLength - 3) + "...";
                        }
                        const deleteRowsModal = document.getElementById('deleteRowsId');
                        const yesDeleteRows = document.getElementById('yesDelete');
                        const noDeleteRows = document.getElementById('noDelete');
                        const closeDelete = document.getElementById('closeDelete2');
                        const vatModal = document.getElementById('undoVatId');
                        //====================================================================================
                        //ON CONDITION THAT THE INFORMATION IS BEING DISPLAYED BY THE DEFAULT RANGE
                        const sDate = localStorage.getItem('firstDate');
                        const eDate = localStorage.getItem('lastDate');
                        const de = new Date()
                        const currentDay = de.getDate();
                        const currMonth = de.getMonth();
                        const currYear = de.getFullYear();

                        if (sDate === null && eDate === null) {
                            //IF THERE IS NO DATE IN THE LOCAL STORAGE, SET THE RANGE FROM THE FIRST (startDate) DAY TO NOW(endDate)
                            for (let i = 1; i < currentDay + 1; i++) {
                                const date = new Date(currYear, currMonth, i);
                                if (i === 1) {
                                    startDate = date;
                                }
                                else {
                                    endDate = date;
                                }
                            }

                            //set the l/s to have the startDate and endDate
                            // Store the start and end date values in localStorage
                            localStorage.setItem('firstDate', startDate);
                            localStorage.setItem('lastDate', endDate);

                        } else {
                            // let startDate = ""
                            // let endDate = ""
                            startDate = new Date(sDate)
                            endDate = new Date(eDate)
                        }
                        //style the edit and export button on pagee reload
                        document.querySelector(".editBtn").classList.add('editBtnStyle')
                        //===================================================================================
                        const canvas = document.getElementById('myChart')
                        const myStyle =
                        {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    title: {
                                        display: true,
                                    },
                                    grid: {
                                        display: true,
                                    },
                                    ticks: {
                                        // Include a dollar sign in the ticks
                                        callback: function (value) {
                                            return symbol + value; // Add dollar sign to ticks
                                        },
                                        stepSize: 200
                                    }
                                },
                                x: {
                                    title: {
                                        display: true,
                                    },
                                    grid: {
                                        display: false,
                                    }

                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function (tooltipItem) {
                                            return symbol + tooltipItem.raw; // Add dollar symbol to the tooltip
                                        }
                                    }
                                },
                                legend: {
                                    position: 'top',
                                    labels: {
                                        boxWidth: 30,
                                    }
                                }
                            }
                        }

                        //======================================================================================
                        const spinner = document.querySelector('#spinner')
                        //user-defined function to download CSV file  
                        function downloadCSV(csv, filename) {
                            var csvFile;
                            var downloadLink;

                            //define the file type to text/csv  
                            csvFile = new Blob([csv], { type: 'text/csv' });
                            downloadLink = document.createElement("a");
                            downloadLink.download = filename;
                            downloadLink.href = window.URL.createObjectURL(csvFile);
                            downloadLink.style.display = "none";

                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                        }

                        const expBtn = document.querySelector('.export');
                        function getFormatedDate(dateString) {
                            // Example date string
                            // const dateString = 'Wed Jan 01 2025 00:00:00 GMT+0200 (Central Africa Time)';

                            // Convert the string to a Date object
                            const date = new Date(dateString);

                            // Extract day, month, and year
                            let day = date.getDate(); // Get the day of the month (1-31)
                            let month = date.getMonth() + 1; // Get the month (0-11, so add 1 to make it 1-12)
                            let year = date.getFullYear(); // Get the full year (e.g., 2025)
                            // Convert day and month to strings
                            day = day.toString();
                            month = month.toString();

                            // Log the results
                            if (day.length === 1) {
                                day = "0" + day
                            }
                            if (month.length === 1) {
                                month = "0" + month
                            }
                            const myDate = year + '-' + month + '-' + day
                            return myDate
                        }
                        expBtn.addEventListener('click', function (event) {
                            //declare a JavaScript variable of array type  
                            const csv = [];
                            const rows = document.querySelectorAll("#shift-list-table tr input[type='checkbox']");
                            const startdateString = getFormatedDate(startDate);
                            const enddateString = getFormatedDate(endDate);
                            let filename = "CashFlow-" + startdateString + '-' + enddateString;

                            // Add header row to the CSV array
                            const headerRow = [];
                            const editMode = localStorage.getItem('editMode')
                            if (editMode !== null) {
                                pageSize = localStorage.getItem('advItemsPerPage');
                                if (pageSize === null) {
                                    pageSize = 5
                                }
                                page = localStorage.getItem('advCurrentPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1

                                advExportingCriteria = "FullExport"
                                const sDate = localStorage.getItem('firstDate');
                                const eDate = localStorage.getItem('lastDate');
                                startDate = new Date(sDate)
                                endDate = new Date(eDate)
                                let csv = [];
                                const headerRow = ['Id', 'Date', 'Type', 'ShiftNo', 'Tax', 'InvoiceRef', 'Description', 'Category', 'Currency', 'Amount', 'Rate', 'CashEquiv'];
                                csv.push(headerRow.join(","));
                                // Send data to the server, and get the updated data
                                fetch('/getArrayForExport', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        startDate: sDate,
                                        endDate: eDate,
                                        pageSize: pageSize,
                                        page: page,
                                        advExportingCriteria: advExportingCriteria
                                    })
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        cashFlowArray = data.itemsToProcess
                                        let taxStatus = 'N'
                                        for (let i = 0; i < cashFlowArray.length; i++) {
                                            const exp = cashFlowArray[i];
                                            const date = exp.CashFlowDate
                                            const parts = date.split("/");
                                            const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                            const formattedDates2 = new Date(formattedDate);
                                            let vat = exp.Tax.vat
                                            let ztf = exp.Tax.ztf

                                            //  console.log(vat.VatStatus + 'ztfstat' + ztf.ZtfStatus)
                                            if ((vat.VatStatus === 'Y' || ztf.ZtfStatus === 'Y')) {
                                                taxStatus = 'Y'
                                            }
                                            else {
                                                taxStatus = 'N'
                                            }
                                            //formatting the description if it has commas
                                            const expDescription = '"' + exp.CashFlowDescription + '"'

                                            if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                                if (checkedRows.length > 0) {
                                                    //DO SOMETHING
                                                    for (let d = 0; d < checkedRows.length; d++) {
                                                        const checkedRowId = checkedRows[d].querySelector(".idClass").textContent.trim();
                                                        if (exp._id === checkedRowId) {
                                                            const row = [] //to store all documents data
                                                            row.push(exp._id, exp.CashFlowDate, exp.CashFlowType, exp.CashFlowShift, taxStatus, exp.CashFlowInvoiceRef, expDescription,
                                                                exp.CashFlowCategory, exp.CashFlowCurrency, exp.CashFlowAmount, exp.CashFlowRate, exp.CashFlowCashEquiv)
                                                            csv.push(row.join(","));
                                                        }
                                                    }
                                                }

                                                else if (checkedRows.length === 0) {
                                                    const row = [] //to store all documents data
                                                    row.push(exp._id, exp.CashFlowDate, exp.CashFlowType, exp.CashFlowShift, taxStatus, exp.CashFlowInvoiceRef,
                                                        expDescription, exp.CashFlowCategory, exp.CashFlowCurrency, exp.CashFlowAmount, exp.CashFlowRate, exp.CashFlowCashEquiv)
                                                    csv.push(row.join(","));

                                                }

                                            }
                                        }
                                        //call the function to download the CSV file  
                                        downloadCSV(csv.join("\n"), filename);
                                        checkedRows = []

                                    })
                            }

                            else if (editMode === null) {
                                const headerCols = document.querySelectorAll('#shift-list-table th');

                                headerCols.forEach(function (headerCol) {
                                    headerRow.push(headerCol.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim());
                                });
                                csv.push(headerRow.join(","));

                                if (checkedRows.length > 0) {
                                    // Add selected rows to the CSV array
                                    for (let i = 0; i < checkedRows.length; i++) {
                                        const row = [], cols = checkedRows[i].querySelectorAll("td");
                                        for (let j = 0; j < cols.length; j++) {
                                            // remove all symbols 
                                            if (j === 2 || j === 3 || j === 4) {
                                                let splittedText = (cols[j].innerText).split(' ')
                                                //LOOP IN THE FIRST PART OF THE TEXT TO CHECK KANA INE NEGATIVE SIGN OR NOT
                                                let isNegative = false
                                                for (let p = 0; p < splittedText[0].length; p++) {
                                                    const char = splittedText[0][p];
                                                    if (char === '-') {
                                                        isNegative = true
                                                    }
                                                }
                                                if (isNegative === true) {
                                                    //push a number with brackets 
                                                    row.push("(" + splittedText[1] + ")".replace(/\n/g, '').trim());
                                                }

                                                else {
                                                    //push a number with no brackets
                                                    row.push(splittedText[1].replace(/\n/g, '').trim());
                                                }
                                            }
                                            else {
                                                row.push(cols[j].innerText.replace(/\n/g, '').trim());
                                            }
                                        }
                                        csv.push(row.join(","));
                                    }
                                }
                                else {
                                    for (let i = 0; i < dataArray.length; i++) {
                                        let row = [], cols = dataArray[i].querySelectorAll("td");
                                        for (let j = 0; j < cols.length; j++) {
                                            // remove all symbols 
                                            if (j === 2 || j === 3 || j === 4) {
                                                let splittedText = (cols[j].innerText).split(' ')
                                                //LOOP IN THE FIRST PART OF THE TEXT TO CHECK KANA INE NEGATIVE SIGN OR NOT
                                                let isNegative = false
                                                for (let p = 0; p < splittedText[0].length; p++) {
                                                    const char = splittedText[0][p];
                                                    if (char === '-') {
                                                        isNegative = true
                                                    }
                                                }
                                                if (isNegative === true) {
                                                    //push a number with brackets 
                                                    row.push("(" + splittedText[1] + ")".replace(/\n/g, '').trim());
                                                }

                                                else {
                                                    //push a number with no brackets
                                                    row.push(splittedText[1].replace(/\n/g, '').trim());
                                                }
                                            }
                                            else {
                                                row.push(cols[j].innerText.replace(/\n/g, '').trim());
                                            }
                                        }
                                        csv.push(row.join(","));

                                    }
                                }
                                //call the function to download the CSV file  
                                downloadCSV(csv.join("\n"), filename);
                                checkedRows = []
                            }
                        })
                        //===========================================================================
                        //const categorySpan = document.querySelector('.cate-Btn-Span');
                        const categoriesDrpn = document.querySelector('.categories');
                        const categoriesDrpn1 = document.querySelector('.incCategories');
                        const catCaret = document.querySelector('.ccaret');

                        //THIS IS FOR THE SELECT PAYMENT TYPE DROPDOWN MENU
                        const selectBtn = document.querySelector(".select-btn");
                        const selectMenu = document.querySelector('.currencies');
                        const caret = document.querySelector('.caretForm');
                        let myType = ''

                        document.querySelector(".cate-btn").addEventListener("click", function () {
                            if (document.querySelector('.myCurrentType').innerText === 'Pay in') {
                                categoriesDrpn1.classList.toggle('categories-open2');
                                catCaret.classList.toggle('caret-rotate');
                            }
                            if (document.querySelector('.myCurrentType').innerText === 'Payout') {
                                categoriesDrpn.classList.toggle('categories-open3');
                                catCaret.classList.toggle('caret-rotate1');
                            }

                        });

                        selectBtn.addEventListener("click", function () {
                            if (categoriesDrpn.classList.contains('categories-open3')) {
                                catCaret.classList.remove('caret-rotate1');
                                categoriesDrpn.classList.remove('categories-open3');
                            }
                            if (categoriesDrpn1.classList.contains('categories-open2')) {
                                catCaret.classList.remove('caret-rotate');

                                categoriesDrpn1.classList.remove('categories-open2');
                            }
                            // add the rotate style to the caret element
                            caret.classList.toggle('caret-rotate');
                            // then make the Drpn open
                            selectMenu.classList.toggle('currencies-open2');
                        });

                        //when the currencies Drpn is open, loop thru all the list of currencies puting the event listeners
                        const options = document.querySelectorAll(".option");
                        options.forEach(option => {
                            option.addEventListener("click", function () {
                                //when the currency has been selected, let it be shown on the screen by renaming 'Select Payment Type into the selected currency'
                                document.querySelector(".btn-text").innerText = option.innerText;
                                const formRate = document.getElementById('label-rate');
                                //update the text content of the rate span with the corresponding rate
                                //loop thru the currencies array checking if the selected currency matches the currency name in the array if it does collect
                                //the  rate of the matched currency name
                                for (let i = 0; i < newCurrencies.length; i++) {
                                    const currency_rate = newCurrencies[i]
                                    if (option.innerText === currency_rate.Currency_Name) {
                                        const rateSpan = currency_rate.RATE;
                                        formRate.innerText = rateSpan;
                                    }
                                    //  console.log(formRate.innerText)

                                }
                                //then rotate the caret to its normal position
                                caret.classList.remove('ccaret-rotate');
                                //and close the dropdown menu
                                selectMenu.classList.remove('currencies-open');
                                //Soon after adding the name, add all other things like the rate and so forth...
                            });
                        });

                        //WHEN THE USER CLICKES THE CATEGORY DROPDOWN ON THE EDIT FORM
                        //when the categories categoriesDropdown is open, loop thru all the list of Categories putting the event listeners
                        const coptions = document.querySelectorAll(".cate-option");
                        const incOptions = document.querySelectorAll(".incCate-option");
                        const categoryCaret = document.querySelector('.ccaret'); //remove ama payout cat 
                        coptions.forEach(categoryOptions => {
                            categoryOptions.addEventListener("click", function () {
                                //when the category has been selected, let it be shown on the screen by renaming 'Category... into the selected category'
                                document.querySelector(".cate-Btn-Span").innerText = categoryOptions.innerText;
                                catCaret.classList.remove('caret-rotate1');
                                categoriesDrpn.classList.remove('categories-open3');
                            })
                        })

                        //remove ama payin cat 
                        incOptions.forEach(categoryOptions => {
                            categoryOptions.addEventListener("click", function () {
                                //when the category has been selected, let it be shown on the screen by renaming 'Category... into the selected category'
                                document.querySelector(".cate-Btn-Span").innerText = categoryOptions.innerText;
                                catCaret.classList.remove('caret-rotate');
                                categoriesDrpn.classList.remove('categories-open2');

                            })
                        })



                        //====================================================================================
                        //THIS IS FOR THE EXPENSE-FORM CATEGORY DROPDOWN MENU

                        //CODE FOR ADDING NEW EMPTY ROW BY DEFAULT
                        let baseCurrCode = ''
                        //GET THE SYMBOL BASED ON THE BASECURRENCY SELECTED
                        const baseCurr = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === 'Y');//find matching currency name with the one in the incomes table
                        const currName = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (baseCurr.Currency_Name).toLowerCase());//find matching currency name with the one in the incomes table
                        if (currName) {
                            baseCurrCode = currName.ISO_Code;
                        }
                        // addNewRow()
                        function addNewRow() {
                            const tBody = document.querySelector('.tableBody');
                            const numRows = tBody.rows.length;

                            // create a new row element
                            const newEmptyRow = document.createElement('tr');
                            newEmptyRow.classList.add('shiftRowss');
                            // create the cells for the new row
                            const checkboxCell = document.createElement('td');
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.classList.add('form-check-input');
                            checkbox.value = 'checkedValue';

                            checkboxCell.appendChild(checkbox);
                            newEmptyRow.appendChild(checkboxCell);

                            const hiddenCell = document.createElement('td');
                            hiddenCell.hidden = true;
                            hiddenCell.classList.add('idClass');

                            newEmptyRow.appendChild(hiddenCell);

                            const dateCell = document.createElement('td');
                            dateCell.contentEditable = true;
                            dateCell.classList.add('expenseDate');
                            dateCell.innerHTML = selectedDate;

                            newEmptyRow.appendChild(dateCell);

                            const typeCell = document.createElement('td');
                            typeCell.classList.add('type');

                            //create the DROPDOWN MENU 
                            const typeContainer = document.createElement('div');
                            typeContainer.classList.add('dropdown');
                            typeContainer.classList.add('typeContainer');
                            const typeText = document.createElement('button');
                            typeText.classList.add('btn');
                            typeText.classList.add('dropdown-toggle');
                            typeText.classList.add('typeSpan');
                            // add the dropdown atttribute
                            typeText.setAttribute('data-bs-toggle', 'dropdown');
                            typeText.setAttribute('aria-expanded', 'false');
                            typeText.innerHTML = 'Select Type'
                            // createDropdown menu and items
                            const typeListDropdown = document.createElement('ul');
                            typeListDropdown.classList.add('dropdown-menu');
                            typeListDropdown.classList.add('typeDropdown-menu');
                            const payInType = document.createElement("li");
                            payInType.classList.add(`typeList-option`);
                            const dropdownItem = document.createElement('a');
                            dropdownItem.classList.add('dropdown-item');
                            dropdownItem.href = '#';
                            const payOutType = document.createElement("li");
                            payOutType.classList.add(`typeList-option`);
                            const dropdwnItem = document.createElement('a');
                            dropdwnItem.classList.add('dropdown-item');
                            dropdwnItem.href = '#';
                            const optionText = document.createTextNode('Pay in')
                            const optionText2 = document.createTextNode('Payout')
                            dropdownItem.appendChild(optionText);
                            payInType.appendChild(dropdownItem);
                            dropdwnItem.appendChild(optionText2);
                            payOutType.appendChild(dropdwnItem);
                            typeListDropdown.appendChild(payInType);
                            typeListDropdown.appendChild(payOutType);
                            typeContainer.appendChild(typeText);
                            typeContainer.appendChild(typeListDropdown);
                            typeCell.appendChild(typeContainer);
                            // typeCell.appendChild(typeListDropdown);
                            newEmptyRow.appendChild(typeCell);


                            const shiftCell = document.createElement('td');
                            shiftCell.classList.add('editableShift');
                            // shiftCell.contentEditable = true;

                            const shiftstatus = Array.from(headersStatus).find(name => name.HeaderName === 'ShiftNo');
                            newEmptyRow.appendChild(shiftCell);
                            // THIS NOW ONLY WILL MAKE THE TD APPEAR OR DISAPPEAR
                            if ((shiftstatus.isDisplayed === true)) {
                                //MAKE THE TD VISIBLE
                                shiftCell.style.display = 'table-cell'
                            } else {
                                if ((shiftstatus.isDisplayed === false)) {
                                    //MAKE THE TD INVISIBLE
                                    shiftCell.style.display = 'none'
                                }
                            }
                            const radioCell = document.createElement("td");
                            radioCell.classList.add("radioBtn");
                            const radioBtnSpan = document.createElement("span");
                            radioBtnSpan.classList.add("radioBtnSpan");
                            radioBtnSpan.hidden = true
                            // radioId.innerText = row.Vat._id
                            const radio = document.createElement("input");
                            radio.type = "radio";
                            radio.classList.add("radio-check-input");

                            // createDropdown menu and items
                            const taxTypesDropdownMenu = document.createElement('ul');
                            taxTypesDropdownMenu.classList.add('dropdown-menu');
                            taxTypesDropdownMenu.classList.add('Taxdropdown-menu');
                            //dropdown with tax types
                            const taxTypesItemSubmenu = document.createElement('ul');
                            taxTypesItemSubmenu.classList.add('submenu');
                            taxTypesItemSubmenu.classList.add('VatDropdown-menu');

                            //dropdown with tax types
                            const taxTypesDropdownMenuList1 = document.createElement('li');
                            const taxTypesItem1 = document.createElement('a');
                            taxTypesItem1.classList.add('dropdown-item');
                            taxTypesItem1.href = '#';
                            taxTypesItem1.innerText = 'vat';
                            taxTypesDropdownMenuList1.appendChild(taxTypesItem1)
                            taxTypesDropdownMenu.appendChild(taxTypesDropdownMenuList1)

                            const taxTypesDropdownMenuList2 = document.createElement('li');
                            const taxTypesItem2 = document.createElement('a');
                            taxTypesItem2.classList.add('dropdown-item');
                            taxTypesItem2.href = '#';
                            taxTypesItem2.innerText = 'ztf';
                            taxTypesDropdownMenuList2.appendChild(taxTypesItem2)
                            taxTypesDropdownMenu.appendChild(taxTypesDropdownMenuList2)
                            // Append the shared submenu to the dropdown menu
                            taxTypesDropdownMenu.appendChild(taxTypesItemSubmenu);
                            radioCell.appendChild(radio);
                            radioCell.appendChild(radioBtnSpan);
                            radioCell.appendChild(taxTypesDropdownMenu);
                            newEmptyRow.appendChild(radioCell);
                            const radiostatus = Array.from(headersStatus).find(name => name.HeaderName === 'Tax');
                            if ((radiostatus.isDisplayed === true)) {
                                radioCell.style.display = 'table-cell'
                            }
                            else if (radiostatus.isDisplayed === false) {
                                radioCell.style.display = 'none'
                            }
                            const invoiceCell = document.createElement('td');
                            invoiceCell.classList.add('editableInvoice');
                            // invoiceCell.contentEditable = true;
                            newEmptyRow.appendChild(invoiceCell);
                            const invoiceStatus = Array.from(headersStatus).find(name => name.HeaderName === 'InvoiceRef');
                            if ((invoiceStatus.isDisplayed === true)) {
                                invoiceCell.style.display = 'table-cell'
                            }
                            else if (invoiceStatus.isDisplayed === false) {
                                invoiceCell.style.display = 'none'
                            }
                            const descriptionStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Description');
                            const descriptionCell = document.createElement('td');
                            descriptionCell.classList.add('editable-cell');
                            descriptionCell.style.cursor = 'pointer';
                            // descriptionCell.contentEditable = true;

                            newEmptyRow.appendChild(descriptionCell);
                            //===============================================================================================
                            const categoryCell = document.createElement('td');
                            categoryCell.classList.add('categories-cell');
                            //create the DROPDOWN MENU 
                            const categoryDropdownMenu = document.createElement('div');
                            categoryDropdownMenu.classList.add('dropdown');
                            const categoryDropdownButton = document.createElement('button');
                            categoryDropdownButton.classList.add('btn');
                            categoryDropdownButton.innerText = 'Select Category';
                            categoryDropdownButton.classList.add('dropdown-toggle');
                            categoryDropdownButton.classList.add('categorySpan');
                            categoryDropdownButton.style.backgroundColor = 'transparent';
                            // add the dropdown atttribute
                            categoryDropdownButton.setAttribute('data-bs-toggle', 'dropdown');
                            categoryDropdownButton.setAttribute('aria-expanded', 'false');

                            // createDropdown menu and items
                            const dropdownMenu = document.createElement('ul');
                            dropdownMenu.classList.add('dropdown-menu');
                            dropdownMenu.classList.add('catDropdown-menu');
                            categoryDropdownMenu.appendChild(categoryDropdownButton);
                            //add the create category
                            //ADD A CREATE CATEGORY ITEM 
                            const createExpCate = document.createElement('li');
                            const dropdownItem0 = document.createElement('a');
                            dropdownItem0.href = '#';

                            createExpCate.classList.add('expcate-option');
                            //classes on the dropdown item create category
                            dropdownItem0.classList.add('dropdown-item');
                            dropdownItem0.classList.add('categorySpanId');
                            dropdownItem0.innerText = "Create Category"

                            const createIncCate = document.createElement("li");
                            const dropdownItem1 = document.createElement('a');
                            dropdownItem1.href = '#';

                            createIncCate.classList.add('incCate-option');
                            //classes on the dropdown item create category
                            dropdownItem1.classList.add('dropdown-item');
                            dropdownItem1.classList.add('categorySpanId');
                            dropdownItem1.innerText = "Create Category"

                            // DROPDOWN WITH FORM for payout
                            const catDropdownContainer = document.createElement('div');
                            catDropdownContainer.classList.add('dropdown');
                            catDropdownContainer.classList.add('catDropdownContainer');
                            const formContainerDropdown = document.createElement("div");
                            formContainerDropdown.classList.add('dropdown-menu');
                            formContainerDropdown.id = 'dropdownForm';
                            const createCategoryForm = document.createElement("form");
                            createCategoryForm.classList.add('form');
                            // createCategoryForm.id = 'dropdwnForm';
                            const formContainer = document.createElement("div");
                            formContainer.style.padding = '10px';
                            const categoryFormLabel = document.createElement('label');
                            categoryFormLabel.classList.add('form-label');
                            categoryFormLabel.classList.add('categoryFormLabel');
                            categoryFormLabel.innerText = 'Category:'
                            const categoryNameClass = document.createElement('input');
                            categoryNameClass.type = 'text';
                            categoryNameClass.classList.add('form-control');
                            categoryNameClass.classList.add('categoryNameClass');
                            const submitBtn = document.createElement('button');
                            submitBtn.type = 'submit';
                            submitBtn.classList.add('btn');
                            submitBtn.classList.add('submitCat');
                            submitBtn.innerText = 'Add'
                            submitBtn.style.backgroundColor = 'rgb(1, 6, 105)';
                            submitBtn.style.color = 'white'
                            submitBtn.style.marginLeft = '93px'

                            formContainer.appendChild(categoryFormLabel);
                            formContainer.appendChild(categoryNameClass);
                            createCategoryForm.appendChild(formContainer);
                            createCategoryForm.appendChild(submitBtn);
                            formContainerDropdown.appendChild(createCategoryForm);
                            catDropdownContainer.appendChild(formContainerDropdown);
                            createExpCate.appendChild(dropdownItem0);
                            createIncCate.appendChild(dropdownItem1);
                            dropdownMenu.appendChild(createIncCate);
                            dropdownMenu.appendChild(createExpCate);

                            // loop adding the dropdown items from the array
                            newExpenseCategories.forEach(option => {
                                const dropdownList = document.createElement('li');
                                dropdownList.classList.add('expcate-option');
                                const dropdownItem = document.createElement('a');
                                dropdownItem.classList.add('dropdown-item');
                                dropdownItem.href = '#';
                                dropdownItem.classList.add('categorySpanId');

                                const catOptionSpan = document.createElement('span');
                                catOptionSpan.classList.add(`cateList-optionSpan`);
                                catOptionSpan.innerText = option.category;
                                catOptionSpan.hidden = true;

                                option.category = ((option.category).replace(/_/g, " "))
                                option.category = (option.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                const truncatedText = truncateText(option.category, 18);
                                const optionText = document.createTextNode(truncatedText);
                                dropdownItem.appendChild(catOptionSpan);
                                dropdownItem.appendChild(optionText);
                                dropdownList.appendChild(dropdownItem);
                                dropdownMenu.appendChild(dropdownList);

                            });
                            newIncomeCategories.forEach(option => {
                                const dropdownList = document.createElement('li');
                                dropdownList.classList.add('incCate-option');
                                const dropdownItem = document.createElement('a');
                                dropdownItem.classList.add('dropdown-item');
                                dropdownItem.href = '#';
                                //get the full category name
                                // const categorySpan = document.createElement('span');
                                dropdownItem.classList.add('categorySpanId');
                                const catOptionSpan = document.createElement('span');
                                catOptionSpan.classList.add(`cateList-optionSpan`);
                                catOptionSpan.innerText = option.category;
                                catOptionSpan.hidden = true;

                                option.category = ((option.category).replace(/_/g, " "))
                                option.category = (option.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                const truncatedText = truncateText(option.category, 18);
                                const optionText = document.createTextNode(truncatedText);

                                dropdownItem.appendChild(catOptionSpan);
                                dropdownItem.appendChild(optionText);
                                dropdownList.appendChild(dropdownItem);
                                dropdownMenu.appendChild(dropdownList);

                            });

                            categoryDropdownMenu.appendChild(categoryDropdownButton);
                            categoryDropdownMenu.appendChild(dropdownMenu);
                            categoryCell.appendChild(formContainerDropdown);
                            categoryCell.appendChild(categoryDropdownMenu);
                            newEmptyRow.appendChild(categoryCell);
                            //=============================================================================
                            const categoryStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Category');
                            if ((categoryStatus.isDisplayed === true)) {
                                categoryCell.style.display = 'table-cell'
                            }
                            else if (categoryStatus.isDisplayed == false) {
                                categoryCell.style.display = 'none'
                            }
                            //===========================================================================================
                            //currency cell
                            const currencyCell = document.createElement('td');
                            currencyCell.classList.add('currencies-cell');
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
                            currencyDropdownButton.innerHTML = 'Select Currency';
                            //add the create category
                            // Populate the currency drop-down menu with options
                            newCurrencies.forEach(option => {
                                const dropdownList = document.createElement('li');
                                const dropdownItem = document.createElement('a');
                                dropdownList.classList.add('curr-option');
                                dropdownItem.classList.add('dropdown-item');
                                dropdownItem.classList.add('currdropdown-item');
                                dropdownItem.href = '#';
                                const optionText = document.createTextNode(option.Currency_Name);
                                dropdownItem.appendChild(optionText);
                                dropdownList.appendChild(dropdownItem);
                                currencyDropdownMenu.appendChild(dropdownList);
                            });
                            currencyDropdown.appendChild(currencyDropdownButton);
                            currencyDropdown.appendChild(currencyDropdownMenu);
                            currencyCell.appendChild(currencyDropdown);
                            newEmptyRow.appendChild(currencyCell);
                            //================================================================================================
                            const amountCell = document.createElement('td');

                            amountCell.classList.add('amount-cell');
                            const amountSpan = document.createElement('span');
                            amountSpan.classList.add('expAmount');
                            // amountSpan.contentEditable = true;
                            const symbolSpan1 = document.createElement('span');
                            symbolSpan1.classList.add('symbol1');
                            symbolSpan1.innerHTML = baseCurrCode
                            amountCell.appendChild(symbolSpan1);
                            amountCell.appendChild(amountSpan);
                            newEmptyRow.appendChild(amountCell);

                            const rateCell = document.createElement('td');
                            rateCell.classList.add('rate-amount');
                            const rateSpan1 = document.createElement('span');
                            rateSpan1.classList.add('expRate');
                            // rateSpan1.contentEditable = true;
                            const symbolSpan = document.createElement('span');
                            symbolSpan.classList.add('symbol2');
                            symbolSpan.innerHTML = baseCurrCode
                            rateCell.appendChild(symbolSpan);
                            rateCell.appendChild(rateSpan1);
                            newEmptyRow.appendChild(rateCell);

                            const cashEquivCell = document.createElement('td');
                            cashEquivCell.classList.add('cashEquivClass');
                            const cashEquivSpan1 = document.createElement('span');
                            const cashEquivSpan = document.createElement('span');
                            cashEquivSpan1.classList.add('cashEquivCell');
                            cashEquivSpan.classList.add('Equivsymbol');
                            cashEquivSpan.innerHTML = baseCurrCode
                            cashEquivCell.appendChild(cashEquivSpan)
                            cashEquivCell.appendChild(cashEquivSpan1)
                            newEmptyRow.appendChild(cashEquivCell);
                            const cashstatus = Array.from(headersStatus).find(name => name.HeaderName === 'CashEquiv');
                            if ((cashstatus.isDisplayed === true)) {
                                cashEquivCell.style.display = 'table-cell'

                            }
                            else if (cashstatus.isDisplayed === false) {
                                cashEquivCell.style.display = 'none'
                            }


                            const profitCell = document.createElement('td');
                            profitCell.classList.add('runningBalance');
                            const profitStatus = Array.from(headersStatus).find(name => name.HeaderName === 'RunningBalance');
                            newEmptyRow.appendChild(profitCell);
                            if ((profitStatus.isDisplayed === true)) {
                                profitCell.style.display = 'table-cell'
                            }
                            else if (profitStatus.isDisplayed === false) {
                                profitCell.style.display = 'none'

                            }
                            //add the function that has event listeners to the newly created row
                            setEventListeners(newEmptyRow);
                            newEmptyRow.style.borderBottom = '1px solid #9e9d9d'
                            tBody.appendChild(newEmptyRow)
                            if (dateCell.innerText === '') {
                                dateCell.focus()
                            }
                            if (dateCell.innerText !== '' && descriptionStatus.isDisplayed === true) {
                                shiftCell.innerText = 'APS'
                                descriptionCell.contentEditable = true
                                descriptionCell.focus()
                            }
                        }

                        //EDIT MODE OPERATIONS
                        const editBtn = document.querySelector('.editBtn');
                        editBtn.addEventListener('click', function (event) {
                            if (editBtn.textContent === 'Edit') {
                                localStorage.removeItem('advCurrentPage')
                                //display the import button
                                document.querySelector('.importContainer').style.display = 'block';
                                //remove the class with the default style
                                document.querySelector(".editBtn").classList.remove('editBtnStyle')
                                //now display the colums icon
                                document.querySelector('.columns').style.display = 'block'
                                //do remove the graph section
                                document.querySelector('.second_card').style.display = 'none'
                                //CLEAR ALL TABLE ROWS INCLUDING THE HEADING ROW SO THAT WE CAN ADD NEW ROWS TO ENTER ENTRIES
                                const allTableRow = document.querySelectorAll('table tr')
                                for (let a = 0; a < allTableRow.length; a++) {
                                    const tRow = allTableRow[a];
                                    tRow.style.display = 'none'
                                }
                                //create new table headers
                                const table = document.querySelector('.shiftListTable');
                                const thead = document.querySelector('.shift-list-headings');
                                //create headers row
                                // create a new row element
                                const headersRow = document.createElement('tr');
                                headersRow.classList.add('shift-list-row');
                                const checkboxHeader = document.createElement('th');
                                const checkbox1 = document.createElement('input');
                                checkbox1.type = 'checkbox';
                                checkbox1.classList.add('myCheck');
                                checkbox1.value = 'checkedValue';

                                checkboxHeader.appendChild(checkbox1);
                                headersRow.appendChild(checkboxHeader);

                                const hiddenCellHeader = document.createElement('th');
                                hiddenCellHeader.hidden = true;

                                headersRow.appendChild(hiddenCellHeader);

                                const dateHeader = document.createElement('th');
                                dateHeader.innerHTML = 'Date';
                                headersRow.appendChild(dateHeader);

                                const typeHeader = document.createElement('th');
                                typeHeader.classList.add('typeHeaderClass')
                                typeHeader.innerHTML = 'Type';
                                headersRow.appendChild(typeHeader);

                                const shiftHeader = document.createElement('th');
                                shiftHeader.innerHTML = 'ShiftNo';
                                headersRow.appendChild(shiftHeader);
                                const vatHeader = document.createElement('th');
                                vatHeader.innerHTML = 'Tax';
                                headersRow.appendChild(vatHeader);
                                const invoiceHeader = document.createElement('th');
                                invoiceHeader.innerHTML = 'InvoiceRef';
                                headersRow.appendChild(invoiceHeader);
                                const descriptionHeader = document.createElement('th');
                                descriptionHeader.innerHTML = 'Description';
                                headersRow.appendChild(descriptionHeader);
                                const categoryHeader = document.createElement('th');
                                categoryHeader.innerHTML = 'Category';
                                headersRow.appendChild(categoryHeader);
                                const currencyHeader = document.createElement('th');
                                currencyHeader.innerHTML = 'Currency';
                                headersRow.appendChild(currencyHeader);
                                const amountHeader = document.createElement('th');
                                amountHeader.innerHTML = 'Amount';
                                headersRow.appendChild(amountHeader);
                                const rateHeader = document.createElement('th');
                                rateHeader.innerHTML = 'Rate';
                                const rateHeaderText = document.createElement('p');
                                rateHeaderText.classList.add('headerText')
                                rateHeaderText.innerText = '(Relative to ' + baseCurrCode + ')'
                                rateHeader.appendChild(rateHeaderText);
                                headersRow.appendChild(rateHeader);
                                const cashEquivHeader = document.createElement('th');
                                cashEquivHeader.innerHTML = 'CashEquiv';
                                const cashEquivHeaderText = document.createElement('p');
                                cashEquivHeaderText.classList.add('headerText')
                                cashEquivHeaderText.innerText = '(Relative to ' + baseCurrCode + ')'
                                cashEquivHeader.appendChild(cashEquivHeaderText);
                                headersRow.appendChild(cashEquivHeader);
                                const runningBalHeader = document.createElement('th');
                                runningBalHeader.innerHTML = 'RunningBalance';
                                headersRow.appendChild(runningBalHeader);

                                thead.appendChild(headersRow)
                                //NOW CREATE A NEW TABLE WITH NEW HEADINGS
                                const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                const eDate = localStorage.getItem('lastDate');
                                let startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                let endDate = new Date(eDate);
                                defaultDisplayContent2(startDate, endDate)
                                //SAVE THE STATUS OF EDIT BUTTON IN LOCAL STORAGE
                                isEditMode = true
                                localStorage.setItem('editMode', isEditMode)
                                //CHANGE THE TEXT OF EDUT BUTTON TO VISUALS so that user can click to go back ku graph
                                editBtn.textContent = 'Visuals'
                                //GET THE SEARCH INPUT IN LOCAL STORAGE
                                const advancedSearchInput = localStorage.getItem('advSearchInput');
                                document.getElementById('searchInput').value = advancedSearchInput
                                //DISPLAY THE SEARCH BUTTON
                                document.querySelector('.searchBar').style.display = 'block'
                            }
                            else if (editBtn.textContent === 'Visuals') {
                                //sort of reload the page to show the graph and it table
                                location.href = 'advanceCashMngmnt';

                            }

                        })

                        function dateValidation(csvDate) {
                            let formattedDate = ''
                            if (csvDate.length > 10) {
                                const formattedDate1 = (csvDate).split(' ')
                                if (formattedDate1) {
                                    let currentDate = formattedDate1[0]
                                    //NOW SPLIT THE DATE TO BE IN THE FORM DD/MM/YYYY
                                    let parts1
                                    parts1 = (currentDate).split("/");
                                    if (parts1[0].length === 4) {
                                        parts1[0] = parts1[0][2] + parts1[0][3]
                                        csvDate = parts1[1] + "/" + parts1[0] + "/" + parts1[2];
                                    }
                                    else {
                                        csvDate = parts1[1] + "/" + parts1[0] + "/" + parts1[2];
                                    }
                                }

                            }

                            csvDate = csvDate.replace(/[.,-]/g, '/');
                            const parts = csvDate.split("/");
                            if (parts.length === 3) {
                                const day = parseInt(parts[0]);
                                const month = parseInt(parts[1]);
                                //  const year = parseInt(parts[2]);
                                let year = 0
                                //check if the length of the part year is ===4 
                                //if ===2 add the 20 pekutanga
                                if (parts[2].length === 4) {
                                    year = parseInt(parts[2]);
                                }
                                else if (parts[2].length === 2) {
                                    year = '20' + parseInt(parts[2])
                                }
                                else if (parts[2].length === 1) {
                                    year = '200' + parseInt(parts[2])
                                }
                                const currentYear = new Date().getFullYear();
                                if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2015 && year <= currentYear) {
                                    // Date is valid, construct the formatted date string in "dd/mm/yyyy" format
                                    //.padStart(2, "0") ensures that the resulting string has a minimum length of 2 characters by padding the left side with zeros ("0") if necessary.
                                    formattedDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString()}`;
                                }
                            }
                            return formattedDate
                        }
                        //====================================================================================================
                        //THIS FUNCTION IS THE FIRST TO BE EXECUTED BASED ON THE CONDITIONS MET
                        let newCurrCode = ''
                        //==============================================================================
                        //SEARCH BAR EVENT LISTENER
                        document.getElementById('searchInput').addEventListener('keydown', function (event) {
                            document.getElementById('searchInput').maxLength = 5;
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                const input = (document.getElementById('searchInput').value.toLowerCase())
                                if (1 <= (document.getElementById('searchInput').value.length) <= 5) {
                                    //store the input n a local storage
                                    localStorage.setItem("advSearchInput", input)
                                    let page = 1
                                    localStorage.setItem('advCurrentPage', page)
                                    // CALL THIS FUNCTION THAT COLLECTS DATA FROM DB AND DISPLAY ON TABLE
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            }
                        });
                        //IF THE CLEAR ICON IS CLICKED
                        document.getElementById("searchInput").addEventListener("search", function (event) {
                            const inputField = document.getElementById('searchInput');
                            inputField.value = ''; // Clear the input field
                            //   REMOVE the input n a local storage
                            localStorage.removeItem("advSearchInput")
                            // CALL THIS FUNCTION THAT COLLECTS DATA FROM DB AND DISPLAY ON TABLE
                            defaultDisplayContent2(startDate, endDate)
                        });
                        //=========================================================================================================
                        function defaultDisplayContent2(startDate, endDate) {
                            cashFlowArray = []
                            //GET THE L/S STORED STARTIND DATE AND THE END DATE
                            //GET THE L/S PAGE SIZE AND PAGE NUIMBER
                            pageSize = localStorage.getItem('advItemsPerPage');
                            if (pageSize === null) {
                                pageSize = 5
                            }
                            page = localStorage.getItem('advCurrentPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1

                            //check if the page is empty or if the painfilter is not empty and that we are in the filtering mode
                            if (page === null) {
                                page = 1
                            }
                            const advancedSearchInput = localStorage.getItem('advSearchInput');
                            //apply a loader 
                            displaySpinner()
                            fetch('/defaultDisplayThePaginationWay', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    startDate: startDate,
                                    endDate: endDate,
                                    pageSize: pageSize,
                                    page: page,
                                    advancedSearchInput: advancedSearchInput
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    removeSpinner()
                                    // From the server, the computation of the total income and expenses (as well as by filter) per range has been done
                                    //TOP GRANT TOTALS COMPUTATION
                                    itemsToProcess = []
                                    let totalPages
                                    let cashBalance = 0

                                    if (advancedSearchInput !== null) {
                                        totalPages = parseInt(data.advSearchedTotalPages)
                                        cashFlowArray = data.advSearchedItemsToProcess
                                        itemsToProcess = data.advSearchedItemsToProcess
                                        cashBalance = Number((parseFloat(data.payInSearchedInputTotal) + parseFloat(data.openingBalance)) - parseFloat(data.payOutSearchedInputTotal)).toFixed(2);
                                        currentCashFlowTable(totalPages, page, pageSize, itemsToProcess)
                                    }
                                    else if (advancedSearchInput === null) {
                                        totalPages = parseInt(data.totalPages2)
                                        cashFlowArray = data.itemsToProcess2
                                        itemsToProcess = data.itemsToProcess2
                                        cashBalance = Number((parseFloat(data.totalIncomePerRangeAdv) + parseFloat(data.openingBalance)) - parseFloat(data.totalExpensesPerRangeAdv)).toFixed(2);
                                        currentCashFlowTable(totalPages, page, pageSize, itemsToProcess)
                                    }
                                    //if the totals are equal to 0 of the generated range.dispay message that there is no items t display
                                    if (Number(data.totalIncomePerRangeAdv) === 0 && Number(data.totalExpensesPerRangeAdv) === 0) {
                                        //display message
                                        document.getElementById('Table_messages').style.display = 'block'
                                        document.querySelector('.fa-plus').style.display = 'inline'
                                        document.querySelector('.noDataText').innerText = 'No Data To Display'
                                        document.querySelector('.noDataText2').innerText = 'There are no cashflows in the selected time period'
                                    }
                                    else {
                                        document.getElementById('Table_messages').style.display = 'none'
                                    }
                                    //get the value of the opening balance to be global
                                    openingBalance = data.openingBalance
                                    let formattedValue = null;
                                    //GET THE CURRENCY SYMBOL
                                    const checkCurrency = Array.from(newCurrencies).find((curr) => curr.BASE_CURRENCY === "Y");
                                    const checkSymbol = Array.from(WorldCurrencies).find((curr) => (curr.Currency_Name).toLowerCase() === (checkCurrency.Currency_Name).toLowerCase());
                                    if (checkSymbol) {
                                        symbol = checkSymbol.ISO_Code
                                    };
                                    //THE OPENING BALANCE DISPLAYED
                                    if (data.openingBalance < 0) {
                                        //if the number is negative
                                        const numberString = data.openingBalance.toString(); //convert to string so that you can use the split method
                                        formattedValue = numberString.split("-")[1];
                                        document.querySelector(".openingBalance").style.color = "red";
                                        document.querySelector(".openingBalance").innerText = "-" + " " + baseCurrCode + Number(formattedValue).toFixed(2);
                                    } else if (data.openingBalance >= 0) {
                                        document.querySelector(".openingBalance").style.color = "black";
                                        document.querySelector(".openingBalance").innerText = baseCurrCode + "    " + Number(data.openingBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                    }
                                    //TOTAL PAYINs 'whether filtered by cat or not'
                                    document.querySelector('.totalIncome').innerText = Number(data.totalIncomePerRangeAdv).toFixed(2);
                                    //TOTAL PAYOUts 'whether filtered by cat or not'
                                    document.querySelector(".totalExpenses").innerText = Number(data.totalExpensesPerRangeAdv).toFixed(2);
                                    //update the totalpayins and outs variables that are global
                                    totalPayInsRange = data.totalIncomePerRangeAdv
                                    totalPayOutsRange = data.totalExpensesPerRangeAdv
                                    //THE CLOSING BALANCE DISPLAYED
                                    if (cashBalance < 0) {
                                        //if the number is negative
                                        const numberString = cashBalance.toString(); //convert to string so that you can use the split method
                                        formattedValue = numberString.split("-")[1];
                                        const updatedValue = "-" + " " + symbol + Number(formattedValue).toFixed(2);
                                        document.querySelector(".CashBalance").innerText = updatedValue;
                                        document.querySelector(".CashBalance").style.color = "red";
                                    } else if (cashBalance >= 0) {
                                        document.querySelector(".CashBalance").style.color = "black";
                                        document.querySelector(".CashBalance").innerText = symbol + "    " + Number(cashBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                    }



                                })
                        }

                        function currentCashFlowTable(totalPages, page, pageSize, itemsToProcess) {
                            displayContainerBlocks()
                            const allTableRow = document.querySelectorAll('.shiftRowss')
                            for (let a = 0; a < allTableRow.length; a++) {
                                const tRow = allTableRow[a];
                                tRow.style.display = 'none'
                            }
                            const theDate = moment(startDate);//convert to the format dd/mm/yy using moment
                            const expectedDateFormat = theDate.format('DD/MM/YYYY');
                            if (startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                                selectedDate = expectedDateFormat;
                            }
                            else {
                                selectedDate = ''
                            }
                            //now store the value in the variable showing on the browser
                            const tBody = document.querySelector('.tableBody');
                            let hasMatched = false
                            if (itemsToProcess.length === 0) {
                                //display message
                                document.getElementById('Table_messages').style.display = 'block'
                                document.querySelector('.noDataText').innerText = 'No Data To Display'
                                document.querySelector('.noDataText2').innerText = 'There are no payIns in the selected time period'
                            }
                            else {
                                document.getElementById('Table_messages').style.display = 'none'
                                for (let a = 0; a < itemsToProcess.length; a++) {
                                    const row = itemsToProcess[a];
                                    const date = row.CashFlowDate
                                    const dateParts = date.split("/");
                                    const formattedDate = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2];
                                    const formattedDates2 = new Date(formattedDate);
                                    const currName = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (row.CashFlowCurrency).toLowerCase());//find matching currency name with the one in the incomes table

                                    if (currName) {
                                        newCurrCode = currName.ISO_Code;
                                    }

                                    //find the base currency code 
                                    const currCode = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === "Y");//find matching currency name with the one in the incomes table
                                    const baseCurrencyCode = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (currCode.Currency_Name).toLowerCase());//find matching currency name with the one in the incomes table

                                    if (baseCurrencyCode) {
                                        baseCurrCode = baseCurrencyCode.ISO_Code;

                                    }
                                    if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                        hasMatched = true
                                        // create a new row element
                                        const newEmptyRow = document.createElement('tr');
                                        newEmptyRow.classList.add('shiftRowss');
                                        newEmptyRow.style.borderBottom = '1px solid #9e9d9d'
                                        if (row.CashFlowType === 'Pay in') {
                                            newEmptyRow.classList.add('rowPayIn');
                                        }
                                        else if (row.CashFlowType === 'Payout') {
                                            newEmptyRow.classList.add('rowPayOut');
                                        }
                                        const currName = Array.from(WorldCurrencies).find(
                                            (curr) => (curr.Currency_Name).toLowerCase() === (row.CashFlowCurrency).toLowerCase()
                                        ); //find matching currency name with the one in the incomes table

                                        if (currName) {
                                            newCurrCode = currName.ISO_Code;
                                        }

                                        // create the cells for the new row
                                        const checkboxCell = document.createElement('td');
                                        const checkbox = document.createElement('input');
                                        checkbox.type = 'checkbox';
                                        checkbox.classList.add('form-check-input');
                                        checkbox.value = 'checkedValue';

                                        checkboxCell.appendChild(checkbox);
                                        newEmptyRow.appendChild(checkboxCell);

                                        const hiddenCell = document.createElement('td');
                                        hiddenCell.hidden = true;
                                        hiddenCell.classList.add('idClass');
                                        hiddenCell.innerHTML = row._id
                                        newEmptyRow.appendChild(hiddenCell);

                                        // if (hiddenCell.innerHTML !== '') {
                                        const dateCell = document.createElement('td');
                                        dateCell.contentEditable = true;
                                        dateCell.classList.add('expenseDate');
                                        dateCell.innerHTML = row.CashFlowDate
                                        newEmptyRow.appendChild(dateCell);

                                        const typeCell = document.createElement('td');
                                        typeCell.classList.add('type');

                                        //create the DROPDOWN MENU 
                                        const typeContainer = document.createElement('div');
                                        typeContainer.classList.add('dropdown');
                                        typeContainer.classList.add('typeContainer');
                                        const typeText = document.createElement('button');
                                        typeText.classList.add('btn');
                                        typeText.classList.add('dropdown-toggle');
                                        typeText.classList.add('typeSpan');
                                        // add the dropdown atttribute
                                        typeText.setAttribute('data-bs-toggle', 'dropdown');
                                        typeText.setAttribute('aria-expanded', 'false');
                                        typeText.innerHTML = row.CashFlowType
                                        // createDropdown menu and items
                                        const typeListDropdown = document.createElement('ul');
                                        typeListDropdown.classList.add('dropdown-menu');
                                        typeListDropdown.classList.add('typeDropdown-menu');
                                        const payInType = document.createElement("li");
                                        payInType.classList.add(`typeList-option`);
                                        const dropdownItem = document.createElement('a');
                                        dropdownItem.classList.add('dropdown-item');
                                        dropdownItem.classList.add('typedropdown-item');
                                        dropdownItem.href = '#';
                                        const payOutType = document.createElement("li");
                                        payOutType.classList.add(`typeList-option`);
                                        const dropdwnItem = document.createElement('a');
                                        dropdwnItem.classList.add('dropdown-item');
                                        dropdwnItem.classList.add('typedropdown-item');
                                        dropdwnItem.href = '#';
                                        const optionText = document.createTextNode('Pay in')
                                        const optionText2 = document.createTextNode('Payout')
                                        dropdownItem.appendChild(optionText);
                                        payInType.appendChild(dropdownItem);
                                        dropdwnItem.appendChild(optionText2);
                                        payOutType.appendChild(dropdwnItem);
                                        typeListDropdown.appendChild(payInType);
                                        typeListDropdown.appendChild(payOutType);
                                        typeContainer.appendChild(typeText);
                                        typeContainer.appendChild(typeListDropdown);
                                        typeCell.appendChild(typeContainer);
                                        // typeCell.appendChild(typeListDropdown);
                                        newEmptyRow.appendChild(typeCell);



                                        const shiftCell = document.createElement('td');
                                        shiftCell.classList.add('editableShift');
                                        shiftCell.contentEditable = false;
                                        shiftCell.innerHTML = row.CashFlowShift
                                        const shiftstatus = Array.from(headersStatus).find(name => name.HeaderName === 'ShiftNo');
                                        newEmptyRow.appendChild(shiftCell);
                                        // THIS NOW ONLY WILL MAKE THE TD APPEAR OR DISAPPEAR
                                        if ((shiftstatus.isDisplayed == true)) {
                                            //MAKE THE TD VISIBLE
                                            shiftCell.style.display = 'table-cell'
                                        } else {
                                            if ((shiftstatus.isDisplayed == false)) {
                                                //MAKE THE TD INVISIBLE
                                                shiftCell.style.display = 'none'
                                            }
                                        }
                                        const radioCell = document.createElement("td");
                                        radioCell.classList.add("radioBtn");
                                        const radioBtnSpan = document.createElement("span");
                                        radioBtnSpan.classList.add("radioBtnSpan");
                                        radioBtnSpan.hidden = true
                                        const radio = document.createElement("input");
                                        radio.type = "radio";
                                        let vat = row.Tax.vat
                                        let ztf = row.Tax.ztf
                                        //  console.log(vat.VatStatus + 'ztfstat' + ztf.ZtfStatus)
                                        if ((vat.VatStatus === 'Y' || ztf.ZtfStatus === 'Y')) {
                                            radio.checked = true;
                                        }
                                        else {
                                            radio.checked = false;
                                        }

                                        radio.classList.add("radio-check-input");
                                        // Function to populate submenu dynamically
                                        const taxTypesItemSubmenu = document.createElement('ul');
                                        taxTypesItemSubmenu.classList.add('submenu');
                                        taxTypesItemSubmenu.classList.add('VatDropdown-menu');
                                        // createDropdown menu and items
                                        const taxTypesDropdownMenu = document.createElement('ul');
                                        taxTypesDropdownMenu.classList.add('dropdown-menu');
                                        taxTypesDropdownMenu.classList.add('Taxdropdown-menu');
                                        //dropdown with tax types
                                        const taxTypesDropdownMenuList1 = document.createElement('li');
                                        const taxTypesItem1 = document.createElement('a');
                                        taxTypesItem1.classList.add('dropdown-item');
                                        taxTypesItem1.href = '#';
                                        taxTypesItem1.innerText = 'vat';
                                        taxTypesDropdownMenuList1.appendChild(taxTypesItem1)
                                        taxTypesDropdownMenu.appendChild(taxTypesDropdownMenuList1)

                                        const taxTypesDropdownMenuList2 = document.createElement('li');
                                        const taxTypesItem2 = document.createElement('a');
                                        taxTypesItem2.classList.add('dropdown-item');
                                        taxTypesItem2.href = '#';
                                        taxTypesItem2.innerText = 'ztf';
                                        taxTypesDropdownMenuList2.appendChild(taxTypesItem2)
                                        taxTypesDropdownMenu.appendChild(taxTypesDropdownMenuList2)
                                        // Append the shared submenu to the dropdown menu
                                        taxTypesDropdownMenu.appendChild(taxTypesItemSubmenu);
                                        radioCell.appendChild(radio);
                                        radioCell.appendChild(radioBtnSpan);
                                        radioCell.appendChild(taxTypesDropdownMenu);
                                        newEmptyRow.appendChild(radioCell);
                                        const radiostatus = Array.from(headersStatus).find(name => name.HeaderName === 'Tax');
                                        if ((radiostatus.isDisplayed === true)) {
                                            radioCell.style.display = 'table-cell'

                                        }
                                        else if (radiostatus.isDisplayed == false) {
                                            radioCell.style.display = 'none'

                                        }
                                        const invoiceCell = document.createElement('td');
                                        invoiceCell.classList.add('editableInvoice');
                                        invoiceCell.contentEditable = true;
                                        invoiceCell.innerHTML = row.CashFlowInvoiceRef
                                        newEmptyRow.appendChild(invoiceCell);
                                        const invoiceStatus = Array.from(headersStatus).find(name => name.HeaderName === 'InvoiceRef');
                                        if ((invoiceStatus.isDisplayed === true)) {
                                            invoiceCell.style.display = 'table-cell'
                                        }
                                        else if (invoiceStatus.isDisplayed == false) {
                                            invoiceCell.style.display = 'none'
                                        }
                                        const descriptionCell = document.createElement('td');
                                        descriptionCell.classList.add('editable-cell');
                                        descriptionCell.style.cursor = 'pointer';
                                        descriptionCell.contentEditable = true;
                                        const truncatedText = truncateText(row.CashFlowDescription, 18);
                                        descriptionCell.innerHTML = truncatedText;
                                        //get the full description
                                        const descriptionSpan = document.createElement('span');
                                        descriptionSpan.classList.add('descriptionId');
                                        descriptionSpan.hidden = true;
                                        descriptionSpan.innerText = row.CashFlowDescription
                                        descriptionCell.appendChild(descriptionSpan);
                                        newEmptyRow.appendChild(descriptionCell);

                                        const categoryCell = document.createElement('td');
                                        categoryCell.classList.add('categories-cell');
                                        //create the DROPDOWN MENU 
                                        const categoryDropdownMenu = document.createElement('div');
                                        categoryDropdownMenu.classList.add('dropdown');
                                        const categoryDropdownButton = document.createElement('button');
                                        categoryDropdownButton.classList.add('btn');
                                        categoryDropdownButton.classList.add('dropdown-toggle');
                                        categoryDropdownButton.classList.add('categorySpan');
                                        categoryDropdownButton.style.backgroundColor = 'transparent';
                                        // add the dropdown atttribute
                                        categoryDropdownButton.setAttribute('data-bs-toggle', 'dropdown');
                                        categoryDropdownButton.setAttribute('aria-expanded', 'false');

                                        // createDropdown menu and items
                                        const dropdownMenu = document.createElement('ul');
                                        dropdownMenu.classList.add('dropdown-menu');
                                        dropdownMenu.classList.add('catDropdown-menu');
                                        row.CashFlowCategory = ((row.CashFlowCategory).replace(/_/g, " "))
                                        row.CashFlowCategory = (row.CashFlowCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        const truncatedText2 = truncateText(row.CashFlowCategory, 18);
                                        categoryDropdownButton.innerHTML = truncatedText2;
                                        categoryDropdownMenu.appendChild(categoryDropdownButton);
                                        //add the create category
                                        //ADD A CREATE CATEGORY ITEM 
                                        const createExpCate = document.createElement('li');
                                        const dropdownItem0 = document.createElement('a');

                                        createExpCate.classList.add('expcate-option');
                                        //classes on the dropdown item create category
                                        dropdownItem0.classList.add('dropdown-item');
                                        dropdownItem0.classList.add('categorySpanId');
                                        dropdownItem0.href = '#';
                                        // dropdownItem0.setAttribute('data-target',`#dropdownForm`);
                                        // dropdownItem0.setAttribute('data-bs-toggle', 'dropdown');
                                        // dropdownItem0.setAttribute('aria-expanded', 'false');
                                        dropdownItem0.innerText = "Create Category"
                                        // dropdownItem0.setAttribute('data-form', 'dropdownForm');

                                        const createIncCate = document.createElement("li");
                                        const dropdownItem1 = document.createElement('a');
                                        createIncCate.classList.add('incCate-option');
                                        //classes on the dropdown item create category
                                        dropdownItem1.classList.add('dropdown-item');
                                        dropdownItem1.classList.add('categorySpanId');
                                        dropdownItem1.innerText = "Create Category"
                                        dropdownItem1.href = '#';
                                        // dropdownItem1.setAttribute('data-form', 'dropdownForm');

                                        // DROPDOWN WITH FORM for payout
                                        const catDropdownContainer = document.createElement('div');
                                        catDropdownContainer.classList.add('dropdown');
                                        catDropdownContainer.classList.add('catDropdownContainer');

                                        const formContainerDropdown = document.createElement("div");
                                        formContainerDropdown.classList.add('dropdown-menu');
                                        // formContainerDropdown.classList.add(`drpDwnForm`);
                                        formContainerDropdown.id = `dropdownForm`;

                                        const createCategoryForm = document.createElement("form");
                                        createCategoryForm.classList.add('form');
                                        createCategoryForm.id = 'dropdwnForm';
                                        const formContainer = document.createElement("div");
                                        formContainer.style.padding = '10px';
                                        const categoryFormLabel = document.createElement('label');
                                        categoryFormLabel.classList.add('form-label');
                                        categoryFormLabel.classList.add('categoryFormLabel');
                                        categoryFormLabel.innerText = 'Category:'
                                        const categoryNameClass = document.createElement('input');
                                        categoryNameClass.type = 'text';
                                        categoryNameClass.classList.add('form-control');
                                        categoryNameClass.classList.add('categoryNameClass');
                                        const submitBtn = document.createElement('button');
                                        submitBtn.type = 'submit';
                                        submitBtn.classList.add('btn');
                                        submitBtn.classList.add('submitCat');
                                        submitBtn.innerText = 'Add'
                                        submitBtn.style.backgroundColor = 'rgb(1, 6, 105)';
                                        submitBtn.style.color = 'white'
                                        submitBtn.style.marginLeft = '93px'

                                        formContainer.appendChild(categoryFormLabel);
                                        formContainer.appendChild(categoryNameClass);
                                        createCategoryForm.appendChild(formContainer);
                                        createCategoryForm.appendChild(submitBtn);
                                        formContainerDropdown.appendChild(createCategoryForm);
                                        catDropdownContainer.appendChild(formContainerDropdown);
                                        createExpCate.appendChild(dropdownItem0);
                                        // createExpCate.appendChild(formContainerDropdown);
                                        createIncCate.appendChild(dropdownItem1);
                                        dropdownMenu.appendChild(createIncCate);
                                        dropdownMenu.appendChild(createExpCate);
                                        // loop adding the dropdown items from the array
                                        newExpenseCategories.forEach(option => {
                                            const dropdownList = document.createElement('li');
                                            dropdownList.classList.add('expcate-option');
                                            const dropdownItem = document.createElement('a');
                                            dropdownItem.classList.add('dropdown-item');
                                            dropdownItem.href = '#';
                                            dropdownItem.classList.add('categorySpanId');

                                            const catOptionSpan = document.createElement('span');
                                            catOptionSpan.classList.add(`cateList-optionSpan`);
                                            catOptionSpan.innerText = option.category;
                                            catOptionSpan.hidden = true;

                                            option.category = ((option.category).replace(/_/g, " "))
                                            option.category = (option.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            const truncatedText = truncateText(option.category, 18);
                                            const optionText = document.createTextNode(truncatedText);
                                            dropdownItem.appendChild(catOptionSpan);
                                            dropdownItem.appendChild(optionText);
                                            dropdownList.appendChild(dropdownItem);
                                            dropdownMenu.appendChild(dropdownList);

                                        });
                                        newIncomeCategories.forEach(option => {
                                            const dropdownList = document.createElement('li');
                                            dropdownList.classList.add('incCate-option');
                                            const dropdownItem = document.createElement('a');
                                            dropdownItem.classList.add('dropdown-item');
                                            dropdownItem.href = '#';
                                            //get the full category name

                                            dropdownItem.classList.add('categorySpanId');
                                            const catOptionSpan = document.createElement('span');
                                            catOptionSpan.classList.add(`cateList-optionSpan`);
                                            catOptionSpan.innerText = option.category;
                                            catOptionSpan.hidden = true;

                                            option.category = ((option.category).replace(/_/g, " "))
                                            option.category = (option.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            const truncatedText = truncateText(option.category, 18);
                                            const optionText = document.createTextNode(truncatedText);
                                            dropdownItem.appendChild(catOptionSpan);
                                            dropdownItem.appendChild(optionText);
                                            dropdownList.appendChild(dropdownItem);
                                            dropdownMenu.appendChild(dropdownList);

                                        });

                                        categoryDropdownMenu.appendChild(categoryDropdownButton);
                                        // dropdownMenu.appendChild(formContainerDropdown);
                                        categoryDropdownMenu.appendChild(dropdownMenu);

                                        categoryCell.appendChild(catDropdownContainer);
                                        categoryCell.appendChild(categoryDropdownMenu);
                                        newEmptyRow.appendChild(categoryCell);

                                        const categoryStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Category');
                                        if ((categoryStatus.isDisplayed === true)) {
                                            categoryCell.style.display = 'table-cell'
                                        }
                                        else if (categoryStatus.isDisplayed == false) {
                                            categoryCell.style.display = 'none'
                                        }
                                        //............................................
                                        //currency cell
                                        const currencyCell = document.createElement('td');
                                        currencyCell.classList.add('currencies-cell');
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
                                        currencyDropdownButton.innerHTML = row.CashFlowCurrency;
                                        //add the create category
                                        // Populate the currency drop-down menu with options
                                        newCurrencies.forEach(option => {
                                            const dropdownList = document.createElement('li');
                                            const dropdownItem = document.createElement('a');
                                            dropdownList.classList.add('curr-option');
                                            dropdownItem.classList.add('dropdown-item');
                                            dropdownItem.classList.add('currdropdown-item');
                                            dropdownItem.href = '#';
                                            const optionText = document.createTextNode(option.Currency_Name);
                                            dropdownItem.appendChild(optionText);
                                            dropdownList.appendChild(dropdownItem);
                                            currencyDropdownMenu.appendChild(dropdownList);
                                        });
                                        currencyDropdown.appendChild(currencyDropdownButton);
                                        currencyDropdown.appendChild(currencyDropdownMenu);
                                        currencyCell.appendChild(currencyDropdown);
                                        newEmptyRow.appendChild(currencyCell);

                                        // AMOUNT CELL
                                        const amountCell = document.createElement('td');
                                        amountCell.classList.add('amount-cell');
                                        const amountSpan = document.createElement('span');
                                        amountSpan.classList.add('expAmount');
                                        amountSpan.contentEditable = true;
                                        amountSpan.innerHTML = Number(row.CashFlowAmount).toFixed(2)
                                        const symbolSpan1 = document.createElement('span');
                                        symbolSpan1.classList.add('symbol1');
                                        symbolSpan1.innerHTML = newCurrCode;
                                        amountCell.appendChild(symbolSpan1);
                                        amountCell.appendChild(amountSpan);
                                        newEmptyRow.appendChild(amountCell);

                                        const rateCell = document.createElement('td');
                                        rateCell.classList.add('rate-amount');
                                        const rateSpan1 = document.createElement('span');
                                        rateSpan1.classList.add('expRate');
                                        rateSpan1.innerHTML = Number(row.CashFlowRate).toFixed(2)
                                        rateSpan1.contentEditable = true;
                                        const symbolSpan = document.createElement('span');
                                        symbolSpan.classList.add('symbol2');
                                        symbolSpan.innerHTML = newCurrCode;
                                        rateCell.appendChild(symbolSpan);
                                        rateCell.appendChild(rateSpan1);
                                        newEmptyRow.appendChild(rateCell);

                                        const cashEquivCell = document.createElement('td');
                                        cashEquivCell.classList.add('cashEquivClass');
                                        const cashEquivSpan1 = document.createElement('span');
                                        const cashEquivSpan = document.createElement('span');
                                        cashEquivSpan1.classList.add('cashEquivCell');

                                        cashEquivSpan.classList.add('Equivsymbol');
                                        cashEquivSpan.innerHTML = baseCurrCode
                                        cashEquivSpan1.innerHTML = Number(row.CashFlowCashEquiv).toFixed(2)
                                        cashEquivCell.appendChild(cashEquivSpan)
                                        cashEquivCell.appendChild(cashEquivSpan1)
                                        newEmptyRow.appendChild(cashEquivCell);
                                        const cashstatus = Array.from(headersStatus).find(name => name.HeaderName === 'CashEquiv');
                                        if ((cashstatus.isDisplayed === true)) {
                                            cashEquivCell.style.display = 'table-cell'

                                        }
                                        else if (cashstatus.isDisplayed == false) {
                                            cashEquivCell.style.display = 'none'
                                        }
                                        const profitCell = document.createElement('td');
                                        profitCell.classList.add('runningBalance');
                                        const profitStatus = Array.from(headersStatus).find(name => name.HeaderName === 'RunningBalance');
                                        newEmptyRow.appendChild(profitCell);
                                        if ((profitStatus.isDisplayed === true)) {
                                            profitCell.style.display = 'table-cell'
                                        }
                                        else if (profitStatus.isDisplayed == false) {
                                            profitCell.style.display = 'none'
                                        }
                                        setEventListeners(newEmptyRow);
                                        tBody.appendChild(newEmptyRow)
                                    }
                                }
                            }
                            //THIS HAS TO BE VISIBLE ALWAYS WHETHER THERE ARE MORE THAN 1 PAGE
                            if (hasMatched === true) {
                                document.querySelector(".footer").style.display = "block";
                                addNewRow()
                            }
                            else if (hasMatched === false) {
                                document.querySelector(".footer").style.display = "none";
                            }
                            // update the status section with current page and items per page information
                            document.querySelector('.spanText').innerText = page;
                            document.querySelector('.spanText1').innerText = totalPages; //THIS WILL WRITE 1 OF BLA BLA BLA

                            document.querySelector('.rowsPerPage').innerText = pageSize
                        }

                        //=======================================================================================================
                        //gara the columns icon removed
                        document.querySelector('.columns').style.display = 'none'
                        //display the blank row on cllick of the plus sign
                        document.querySelector('.addRow').addEventListener("click", function (event) {
                            addNewRow()
                            document.getElementById('Table_messages').style.display = 'none'
                        })
                        function setEventListeners(newEmptyRow) {
                            //when the user selects what rows to display
                            let isChecked = false
                            let amChecked = false
                            const selectioncheckboxes = document.querySelectorAll('.custom-control-input');

                            const tableRows = document.querySelectorAll('.shiftListTable thead th'); // get all table rows

                            headersStatus.forEach(status => {//loop in the status array database and check if the status is true
                                if (status.isDisplayed === true) {//if so loop in the checkboxes and check them
                                    selectioncheckboxes.forEach(checkbox => {
                                        if (status.HeaderName === checkbox.value) {
                                            checkbox.checked = true;
                                            isChecked = true
                                            tableRows.forEach((row, index) => {
                                                const headerName = row.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                                if (status.isDisplayed === true) {
                                                    if (status.HeaderName === headerName) {
                                                        if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                            row.style.display = 'table-cell';
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    })
                                }
                                else if (status.isDisplayed === false) {
                                    selectioncheckboxes.forEach(checkbox => {
                                        if (status.HeaderName === checkbox.value) {
                                            checkbox.checked = false;
                                            isChecked = false
                                            tableRows.forEach((row, index) => {
                                                const headerName = row.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                                if (isChecked === false) {
                                                    if (status.HeaderName === headerName) {
                                                        if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                            row.style.display = 'none';
                                                        }
                                                    }
                                                }
                                            });
                                        }

                                    })
                                }
                            });


                            //OPERATIONS WHEN USER CHECKS OR UNCHECK CHECKBOXES
                            //add event listener on each tickable checkbox
                            const shiftCheckbox = document.getElementById('checkbox-id-shift');
                            const vatCheckbox = document.getElementById('checkbox-id-vat');
                            const invoiceCheckbox = document.getElementById('checkbox-id-invoice');
                            const categoryCheckbox = document.getElementById('checkbox-id-category');
                            const cashEquivCheckbox = document.getElementById('checkbox-id-cashEquiv');
                            const BalanceCheckbox = document.getElementById('checkbox-id-balance');
                            let headerisDisplayed = ""
                            let headerNamefcb = ""

                            //WHEN THE USER CLICKS ON SHIFT CHECKBOX
                            shiftCheckbox.addEventListener('click', () => {
                                if (shiftCheckbox.checked === true) {
                                    shiftCheckbox.checked = true;
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table headers
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("ShiftNo" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'table-cell';
                                                headerisDisplayed = true
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'ShiftNo') {
                                                        headersStatus[i].isDisplayed = true;
                                                    }
                                                }
                                                //THEN ALSO THE TDs SHOULD BE TRUE
                                                //GET ALL THE TD IN THE TABLE UNDER SHIFT 
                                                const myTableColumns = document.querySelectorAll('.editableShift'); // get shift table rows
                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'table-cell'//LOOP DISPLAYING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {//get the isSaving variable form the server 
                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }

                                        }
                                    });
                                }
                                else if (shiftCheckbox.checked === false) {
                                    shiftCheckbox.checked = false;
                                    isChecked = false
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table rows
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("ShiftNo" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'none';
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                headerisDisplayed = false
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'ShiftNo') {
                                                        headersStatus[i].isDisplayed = false;
                                                    }
                                                }
                                                //GET ALL THE TD IN THE TABLE UNDER SHIFT 
                                                const myTableColumns = document.querySelectorAll('.editableShift'); // get shift table rows
                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'none' //LOOP REMOVING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }
                                        }
                                    });
                                }
                            })
                            //WHEN THE USER CLICKS ON VAT CHECKBOX
                            vatCheckbox.addEventListener('click', () => {
                                if (vatCheckbox.checked === true) {
                                    vatCheckbox.checked = true;
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table headers
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("Tax" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'table-cell';
                                                headerisDisplayed = true
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'Tax') {

                                                        headersStatus[i].isDisplayed = true;
                                                        break; // Assuming there is only one object with 'ShiftNo', exit the loop after updating
                                                    }
                                                }

                                                //THEN ALSO THE TDs SHOULD BE TRUE
                                                //GET ALL THE TD IN THE TABLE UNDER VAT 
                                                const myTableColumns = document.querySelectorAll('.radioBtn'); // get shift table rows
                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'table-cell'//LOOP DISPLAYING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE VAT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }

                                        }
                                    });
                                }
                                else if (vatCheckbox.checked === false) {
                                    vatCheckbox.checked = false;
                                    isChecked = false
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table rows
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("Tax" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'none';
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                headerisDisplayed = false
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'Tax') {
                                                        headersStatus[i].isDisplayed = false;
                                                        break; // Assuming there is only one object with 'ShiftNo', exit the loop after updating
                                                    }
                                                }
                                                //GET ALL THE TD IN THE TABLE UNDER VAT 
                                                const myTableColumns = document.querySelectorAll('.radioBtn'); // get shift table rows
                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'none'//LOOP HIDDING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }
                                        }
                                    });
                                }
                            })

                            //WHEN THE USER CLICKS ON INVOICE CHECKBOX
                            invoiceCheckbox.addEventListener('click', () => {
                                if (invoiceCheckbox.checked === true) {
                                    invoiceCheckbox.checked = true;
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table headers
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("InvoiceRef" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'table-cell';
                                                headerisDisplayed = true
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'InvoiceRef') {
                                                        headersStatus[i].isDisplayed = true;
                                                        break; // Assuming there is only one object with 'ShiftNo', exit the loop after updating
                                                    }
                                                }
                                                console.log(headersStatus)
                                                //THEN ALSO THE TDs SHOULD BE TRUE
                                                //GET ALL THE TD IN THE TABLE UNDER INVOICE 
                                                const myTableColumns = document.querySelectorAll('.editableInvoice'); // get shift table rows

                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'table-cell'//LOOP DISPLAYING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });

                                            }

                                        }
                                    });
                                }
                                else if (invoiceCheckbox.checked === false) {
                                    invoiceCheckbox.checked = false;
                                    isChecked = false
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table rows
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("InvoiceRef" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'none';
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                headerisDisplayed = false
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'InvoiceRef') {
                                                        headersStatus[i].isDisplayed = false;
                                                    }
                                                }
                                                //GET ALL THE TD IN THE TABLE UNDER invoice 
                                                const myTableColumns = document.querySelectorAll('.editableInvoice'); // get invoice table rows

                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'none'//LOOP HIDDING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });

                                            }
                                        }
                                    });
                                }
                            })

                            //WHEN THE USER CLICKS ON RUNNING BALANCE CHECKBOX
                            BalanceCheckbox.addEventListener('click', () => {
                                if (BalanceCheckbox.checked === true) {
                                    BalanceCheckbox.checked = true;
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table headers
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("RunningBalance" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'table-cell';
                                                headerisDisplayed = true
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'RunningBalance') {
                                                        headersStatus[i].isDisplayed = true;
                                                    }
                                                }
                                                //THEN ALSO THE TDs SHOULD BE TRUE
                                                //GET ALL THE TD IN THE TABLE UNDER RUNNING BALANCE 
                                                const myTableColumns = document.querySelectorAll('.runningBalance'); // get RUNNING BALANCE table rows

                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'table-cell'//LOOP DISPLAYING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }

                                        }
                                    });
                                }
                                else if (BalanceCheckbox.checked === false) {
                                    BalanceCheckbox.checked = false;
                                    isChecked = false
                                    const tableHeaders = document.querySelectorAll('.shiftListTable thead th'); // get all table rows
                                    tableHeaders.forEach((theader, index) => {
                                        headerNamefcb = theader.innerText.replace(/[\n\u2191\u2193]/g, '').split(/[\(\{\"]/)[0].trim(); // get the text content of the header cell
                                        if ("RunningBalance" === headerNamefcb) {
                                            if (index !== 1) {//DO NOT SHOW THE HIDDEN ID COLUMN
                                                theader.style.display = 'none';
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                                headerisDisplayed = false
                                                //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                                for (let i = 0; i < headersStatus.length; i++) {
                                                    if (headersStatus[i].HeaderName === 'RunningBalance') {
                                                        headersStatus[i].isDisplayed = false;
                                                    }
                                                }
                                                //GET ALL THE TD IN THE TABLE UNDER CASH EQUIV 
                                                const myTableColumns = document.querySelectorAll('.runningBalance'); // get RUNNING BALANCE table rows
                                                myTableColumns.forEach(column => {
                                                    column.style.display = 'none'//LOOP HIDDING THE TDS
                                                });
                                                //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                                spinner.style.display = 'block'//display progress bar
                                                fetch('/updateHeaderStatusAdv', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        headerNamefcb,
                                                        headerisDisplayed
                                                    })
                                                })
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        // Show alert
                                                        if (data.isSaving) {

                                                            spinner.style.display = 'none'//remove progress bar
                                                        }

                                                    })

                                                    .catch(error => {
                                                        console.error(`Error updating Date field `, error);
                                                    });


                                            }
                                        }
                                    });
                                }
                            })
                            //==============================================================================================

                            const allTypesList = newEmptyRow.querySelectorAll('.typeList-option')
                            const typeCell = newEmptyRow.querySelector('.typeSpan');
                            const invoiceStatus = Array.from(headersStatus).find(name => name.HeaderName === 'InvoiceRef');
                            const vatStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Tax');
                            const descriptionStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Description');
                            const typeStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Type');
                            const expenseShiftCell = newEmptyRow.querySelector('.editableShift');
                            const invoiceCell = newEmptyRow.querySelector('.editableInvoice');
                            const descriptionCell = newEmptyRow.querySelector('.editable-cell');
                            const expenseAmount = newEmptyRow.querySelector(".expAmount");
                            const expcOptions = newEmptyRow.querySelectorAll(".expcate-option");
                            const incomeOptions = newEmptyRow.querySelectorAll(".incCate-option");
                            const cashFlowDate = newEmptyRow.querySelector('.expenseDate');
                            const vatBtn = newEmptyRow.querySelector(".radio-check-input");
                            let previousState = vatBtn.checked;//get the radio button checked status before click
                            const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            const eDate = localStorage.getItem('lastDate');
                            let startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            let endDate = new Date(eDate);
                            //get the row id
                            let rowId = ''
                            if (newEmptyRow.querySelector('.idClass').innerText === '') {
                                rowId = ''
                            }
                            else if (newEmptyRow.querySelector('.idClass').innerText !== null) {
                                rowId = newEmptyRow.querySelector('.idClass').textContent.trim()
                            }

                            const checkBoxeCell = newEmptyRow.querySelector(".form-check-input");
                            // Attach a click event listener to each checkbox upon click
                            checkBoxeCell.addEventListener("click", () => {
                                if (checkBoxeCell.checked === true) {
                                    //THIS WILL NOW JUST PUSH THE PAYIN ID ONTO THE EXISTING ARRAY ATOP
                                    checkedRowsId.push(rowId)

                                    // Show the delete modal BUT AT THE SAME TIME, THE USER CAN CHOOSE TO EXPORT IT
                                    deleteModal.style.display = "block";
                                } else if (checkBoxeCell.checked === false) {
                                    let rowIdToRemove = rowId;  // Row ID to be removed
                                    let indexToRemove = checkedRowsId.indexOf(rowIdToRemove);  // Get the index of the rowIdToRemove
                                    if (indexToRemove !== -1) {
                                        checkedRowsId.splice(indexToRemove, 1);  // Remove the element at indexToRemove
                                    }
                                    if (document.querySelector(".myCheck").checked === true) {
                                        document.querySelector(".myCheck").checked = false
                                    }

                                    if (checkedRowsId.length === 0) {
                                        deleteModal.style.display = "none";
                                    }
                                }
                            });
                            //============================================================================================
                            function fixDate(date) {
                                currentPage = 1
                                localStorage.setItem('advCurrentPage', currentPage);
                                let newDate = dateValidation(date);
                                if (newDate !== '') {
                                    //kana riri date chairo endesa on the date range picker input
                                    cashFlowDate.innerText = newDate
                                    //remove focus on the date cell
                                    cashFlowDate.blur()

                                }
                                else if (newDate === '') {
                                    //maintain focus on the date cell
                                    cashFlowDate.focus()
                                    notification('invalid date format')
                                    return
                                }
                                if (rowId === '') {
                                    hasId = false

                                }
                                else if (rowId !== '') {
                                    hasId = true
                                    //UPDATE THE ARRAY
                                    for (let a = 0; a < cashFlowArray.length; a++) {

                                        if (cashFlowArray[a]._id === rowId) {
                                            cashFlowArray[a].CashFlowDate = cashFlowDate.innerText
                                        }

                                    }
                                    const parts = (cashFlowDate.innerText).split("/");
                                    const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                    const formattedDates2 = new Date(formattedDate);
                                    startDate = new Date(formattedDates2);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    endDate = new Date(formattedDates2);
                                    // remove the stored date range from local storage
                                    localStorage.removeItem('firstDate');
                                    localStorage.removeItem('lastDate');
                                    // Store the start and end date values in localStorage
                                    localStorage.setItem('firstDate', startDate);
                                    localStorage.setItem('lastDate', endDate);
                                    initializeDateRangePicker()

                                    fetch('/updateCashFlowDate', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            rowId,
                                            newDate
                                        })
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            // Show alert
                                            if (data.amUpdated) {
                                                notification('Updated')
                                                spinner.style.display = 'none'
                                                //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                                                const sDate =
                                                    localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                                const eDate =
                                                    localStorage.getItem("lastDate");
                                                const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                                const endDate = new Date(eDate);
                                                // initializeDateRangePicker()
                                                defaultDisplayContent2(startDate, endDate);

                                            }
                                            else if (data.amUpdated === false) {
                                                spinner.style.display = "none";
                                            }

                                        })
                                        .catch(error => {
                                            console.error(`Error updating Date field for expense ID: ${rowId}`, error);
                                        });

                                }

                            }
                            cashFlowDate.addEventListener('keydown', (event) => {
                                // Add click and keydown event listeners in one line
                                const keyCode = event.keyCode;
                                if ((keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode == 191 || keyCode == 111) || // forward slash (/) on regular or numeric keyboard
                                    (keyCode == 8) || // backspace
                                    (keyCode == 9) || // tab
                                    (keyCode == 37 || keyCode == 39) || // left and right arrow keys
                                    (keyCode >= 96 && keyCode <= 105) || // numeric keypad
                                    (keyCode == 109 || keyCode == 189) || // hyphen (-)
                                    (keyCode == 190 || keyCode == 110)) { // period (.) 
                                    // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }

                                // Add click and keydown event listeners in one line
                                if (event.key === "Enter" || event.key === 'Tab') {//WHEN ENTER IS CLICKED or tab is clicked
                                    event.preventDefault()
                                    let date = cashFlowDate.innerText
                                    fixDate(date)
                                    //check if the text is present
                                    if (cashFlowDate.innerText !== '') {
                                        //now focus on the next cell
                                        if (typeStatus.isDisplayed === true) {
                                            //open the type dropdown
                                            const nextDropdown = new bootstrap.Dropdown(newEmptyRow.querySelector('.typeSpan'));
                                            nextDropdown.toggle();
                                        }


                                    }

                                }
                            })
                            // shift
                            expenseShiftCell.addEventListener("click", function (event) {
                                let date = cashFlowDate.innerText
                                fixDate(date)
                            })
                            invoiceCell.addEventListener("click", function (event) {
                                let date = cashFlowDate.innerText
                                fixDate(date)
                            })
                            descriptionCell.addEventListener("click", function (event) {
                                let date = cashFlowDate.innerText
                                fixDate(date)
                            })
                            // newEmptyRow.querySelector('.categories-cell').addEventListener("click", function (event) {
                            //     let date = cashFlowDate.innerText
                            //     fixDate(date)
                            // })
                            // newEmptyRow.querySelector('.radioBtn').addEventListener("click", function (event) {
                            //     let date = cashFlowDate.innerText
                            //     fixDate(date)
                            // })
                            newEmptyRow.querySelector('.type').addEventListener("click", function (event) {
                                let date = cashFlowDate.innerText
                                fixDate(date)
                            })
                            // newEmptyRow.querySelector('.currencies-cell').addEventListener("click", function (event) {
                            //     let date = cashFlowDate.innerText
                            //     fixDate(date)
                            // })
                            // expenseAmount.addEventListener("click", function (event) {
                            //     let date = cashFlowDate.innerText
                            //     fixDate(date)
                            // })
                            //=====================================================================================
                            // TYPE CELL
                            allTypesList.forEach(type => {
                                type.addEventListener("keydown", (event) => {
                                    event.preventDefault()
                                    if (rowId === '' && event.key === 'Enter') {
                                        const emptyRow = document.querySelector('.shiftRowss:last-child');

                                        if (type.innerText === 'Pay in') {
                                            if (emptyRow.classList.contains('rowPayOut')) {
                                                emptyRow.classList.add('rowPayIn')
                                                emptyRow.classList.remove('rowPayOut')
                                            }
                                            else {
                                                emptyRow.classList.add('rowPayIn')
                                            }
                                            // isPayIn = true
                                            incomeOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('incCate-option')) {
                                                    categoryOption.style.display = 'block'
                                                }
                                            })
                                            expcOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('expcate-option')) {
                                                    categoryOption.style.display = 'none'
                                                }
                                            })
                                        }


                                        if (type.innerText === 'Payout') {
                                            if (emptyRow.classList.contains('rowPayIn')) {
                                                emptyRow.classList.add('rowPayOut')
                                                emptyRow.classList.remove('rowPayIn')
                                            }
                                            else {
                                                emptyRow.classList.add('rowPayOut')
                                            }
                                            expcOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('expcate-option')) {
                                                    categoryOption.style.display = 'block'
                                                }
                                            })
                                            incomeOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('incCate-option')) {
                                                    categoryOption.style.display = 'none'
                                                }
                                            })
                                            // isPayOut = true

                                        }
                                        emptyRow.querySelector('.typeSpan').innerText = type.innerText //ita what has been selected pa ttpe dropdown zvipinde mu TD

                                        if (vatStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO VAT CELL
                                            // previousState = true
                                            newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';

                                        }
                                        else if (invoiceStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO INVOICE CELL
                                            invoiceCell.contentEditable = true
                                            invoiceCell.focus()
                                        }
                                        else if (descriptionStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO DESCRIPTION CELL
                                            descriptionCell.contentEditable = true
                                            descriptionCell.focus()
                                        }
                                        // }
                                        //CLOSE the type dropdown
                                        const nextDropdown = new bootstrap.Dropdown(newEmptyRow.querySelector('.typeSpan'));
                                        nextDropdown.hide();
                                        //fill the expenseShiftcell with txt aps
                                        expenseShiftCell.innerText = 'APS'
                                    }
                                })
                            })
                            allTypesList.forEach(type => {
                                type.addEventListener("click", (event) => {
                                    event.preventDefault()
                                    if (rowId === '') {
                                        const emptyRow = document.querySelector('.shiftRowss:last-child');

                                        if (type.innerText === 'Pay in') {
                                            if (emptyRow.classList.contains('rowPayOut')) {
                                                emptyRow.classList.add('rowPayIn')
                                                emptyRow.classList.remove('rowPayOut')
                                            }
                                            else {
                                                emptyRow.classList.add('rowPayIn')
                                            }
                                            // isPayIn = true
                                            incomeOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('incCate-option')) {
                                                    categoryOption.style.display = 'block'
                                                }
                                            })
                                            expcOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('expcate-option')) {
                                                    categoryOption.style.display = 'none'
                                                }
                                            })
                                        }


                                        if (type.innerText === 'Payout') {
                                            if (emptyRow.classList.contains('rowPayIn')) {
                                                emptyRow.classList.add('rowPayOut')
                                                emptyRow.classList.remove('rowPayIn')
                                            }
                                            else {
                                                emptyRow.classList.add('rowPayOut')
                                            }
                                            expcOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('expcate-option')) {
                                                    categoryOption.style.display = 'block'
                                                }
                                            })
                                            incomeOptions.forEach(categoryOption => {
                                                if (categoryOption.classList.contains('incCate-option')) {
                                                    categoryOption.style.display = 'none'
                                                }
                                            })
                                            // isPayOut = true

                                        }
                                        emptyRow.querySelector('.typeSpan').innerText = type.innerText //ita what has been selected pa ttpe dropdown zvipinde mu TD
                                        if (vatStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO VAT CELL
                                            // previousState = false
                                            newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';

                                        } else if (invoiceStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO INVOICE CELL
                                            invoiceCell.contentEditable = true
                                            invoiceCell.focus()
                                            if (invoiceCell.contentEditable === true) {
                                                newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'none';

                                            }
                                        }
                                        else if (descriptionStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO DESCRIPTION CELL
                                            descriptionCell.contentEditable = true
                                            descriptionCell.focus()
                                            if (descriptionCell.contentEditable === true) {
                                                newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'none';

                                            }
                                        }

                                    }
                                    if (rowId !== '') {
                                        let categoryToDb = []

                                        let cashEquivValue = 0
                                        //first get the cashEquiv on the clicked row
                                        cashEquivValue = parseInt(newEmptyRow.querySelector('.cashEquivCell').innerText)
                                        //CHANGING FROM PAYIN TO PAYOUT OR VICEVERSA THE CATEGORY NOW HAVE TO CHANGE TO SUSPENSE
                                        //COZ THE CATEGORY WOULD NOT BE EXISTING IN THE CATEGORY LIS ARRAY OF THE TYPE ASSIGNED
                                        let newCategory = newEmptyRow.querySelector('.categorySpan').innerText
                                        if (type.innerText === 'Pay in') {
                                            if (newEmptyRow.classList.contains('rowPayOut')) {
                                                newEmptyRow.classList.add('rowPayIn')
                                                newEmptyRow.classList.remove('rowPayOut')
                                            }
                                            else {
                                                newEmptyRow.classList.add('rowPayIn')
                                            }
                                            //get the inserted value
                                            let payInCat = {};
                                            if (newCategory.includes(" ")) {
                                                payInCat["category"] = newCategory.replace(/ /g, "_").toLowerCase();
                                                newCategory = newCategory.replace(/ /g, "_").toLowerCase();
                                            }
                                            else {
                                                payInCat["category"] = newCategory.toLowerCase();
                                                newCategory = newCategory.toLowerCase();
                                            }
                                            payInCat["CategoryLimit"] = 0;
                                            payInCat["CategoryLimitRange"] = "";
                                            payInCat["Balance"] = "PayIn";
                                            const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === newCategory)
                                            if (!categoryName) {
                                                categoryToDb.push(payInCat)
                                            }
                                        }
                                        if (type.innerText === 'Payout') {
                                            if (newEmptyRow.classList.contains('rowPayIn')) {
                                                newEmptyRow.classList.add('rowPayOut')
                                                newEmptyRow.classList.remove('rowPayIn')
                                            }
                                            else {
                                                newEmptyRow.classList.add('rowPayOut')
                                            }
                                            if (newEmptyRow.classList.contains('rowPayIn')) {
                                                newEmptyRow.classList.add('rowPayOut')
                                                newEmptyRow.classList.remove('rowPayIn')
                                            }
                                            else {
                                                newEmptyRow.classList.add('rowPayOut')
                                            }

                                            //then save in the category array mu database
                                            //get the inserted value
                                            let payOutCat = {};
                                            if (newCategory.includes(" ")) {
                                                payOutCat["category"] = newCategory.replace(/ /g, "_").toLowerCase();
                                                newCategory = newCategory.replace(/ /g, "_").toLowerCase();
                                            }
                                            else {
                                                payOutCat["category"] = newCategory.toLowerCase();
                                                newCategory = newCategory.toLowerCase();
                                            }
                                            payOutCat["CategoryLimit"] = 0;
                                            payOutCat["CategoryLimitRange"] = "";
                                            payOutCat["Balance"] = "PayOut";
                                            const categoryName = Array.from(newExpenseCategories).find(cat => (cat.category).toLowerCase() === newCategory)
                                            if (!categoryName) {
                                                categoryToDb.push(payOutCat)
                                            }
                                        }

                                        newEmptyRow.querySelector('.categorySpan').innerText = newCategory
                                        newEmptyRow.querySelector('.typeSpan').innerText = type.innerText //ita what has been selected pa ttpe dropdown zvipinde mu TD
                                        document.querySelector('.totalExpenses').innerText = Number(totalPayOutsRange).toFixed(2);
                                        document.querySelector('.totalIncome').innerText = Number(totalPayInsRange).toFixed(2);
                                        const selectedCurrency = Array.from(newCurrencies).find(newCurr => newCurr.BASE_CURRENCY === 'Y');
                                        baseCurrCode = selectedCurrency.Currency_Name

                                        const cashBalance = parseFloat(totalPayInsRange) + parseFloat(openingBalance) - parseFloat(totalPayOutsRange)
                                        if (cashBalance < 0) {//if the number is negative
                                            const numberString = cashBalance.toString();//convert to string so that you can use the split method
                                            formattedValue = numberString.split('-')[1]
                                            sign = -1
                                            if (sign === -1) {
                                                document.querySelector('.CashBalance').style.color = 'red';
                                                const updatedValue = '-' + baseCurrCode + Number(formattedValue).toFixed(2);
                                                newEmptyRow.querySelector('.runningBalance').innerText = updatedValue
                                            }
                                        }
                                        else if (cashBalance >= 0) {
                                            document.querySelector('.CashBalance').style.color = 'black';
                                            document.querySelector('.CashBalance').innerText = baseCurrCode + '  ' + Number(cashBalance).toFixed(2);;//place the cash Equiv value on the cashEquiv cell
                                        }
                                        spinner.style.display = 'block';
                                        const typeSelected = type.innerText
                                        if (categoryToDb.length > 0) {
                                            insertCategoryRecord(categoryToDb)
                                        }
                                        //endesa ku database the result
                                        fetch('/updateCashFlowType', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                rowId,
                                                typeSelected,
                                                newCategory,
                                                categoryToDb
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                // Show alert
                                                if (data.amUpdated === true) {
                                                    notification('Updated')
                                                    spinner.style.display = 'none'

                                                    defaultDisplayContent2(startDate, endDate)
                                                }
                                                else {
                                                    notification('Updated')
                                                    spinner.style.display = 'none'
                                                    defaultDisplayContent2(startDate, endDate)

                                                }

                                            })
                                            .catch(error => {
                                                console.error(`Error updating shift field for  ID: ${rowId}`, error);
                                            });

                                    }

                                });

                            })
                            //=======================================================================================================
                            //VAT CELL

                            const vatId = newEmptyRow.querySelector(".radioBtnSpan").textContent.trim();
                            // Keep track of the current checked state
                            let taxDataToUpdate = []; let vatEntry = {}; let ztfEntry = {}
                            let prevStat = vatBtn.checked;//get the radio button checked status before click
                            const taxCell = newEmptyRow.querySelector(".radioBtn");
                            taxCell.addEventListener("click", function (event) {
                                //first check if the cashflow type has been selected if not dont open the dropdown
                                const radioButton = event.target;
                                if ((typeCell.innerText !== 'Pay in' && typeCell.innerText !== 'Payout')) {
                                    event.preventDefault()//stop the default behaviour of the radio button to check when clicked
                                    newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'none';
                                }
                                else {
                                    let currentState = null //to store the current stattus upon click
                                    if (previousState) {
                                        currentState = false
                                    } else {
                                        event.preventDefault()
                                        currentState = true
                                    }

                                    if (rowId === '') {
                                        if (currentState) {
                                            // Show the dropdown menu
                                            if (newEmptyRow.querySelector('.Taxdropdown-menu').style.display === 'none') {
                                                newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';
                                            }
                                            else {
                                                newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'none';
                                            }
                                        }
                                        // Update the previous state to the current state after the click
                                        previousState = currentState;
                                    } else {
                                        if (currentState) {
                                            // Show the dropdown menu
                                            newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';
                                        }
                                        //if the user has clicked and the status remains false,he hasnt made any changes to vat ststatus Y/N
                                        //close the modal
                                        if (currentState === false && prevStat === false) {
                                            radioButton.checked = prevStat //remain in the prev status
                                        }
                                        if (currentState === false && prevStat === true) {
                                            newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';

                                        }
                                        // Update the previous state to the current state after the click
                                        previousState = currentState;
                                    }

                                }
                            });
                            //event listeners on the dropdown menu items
                            let allItems = newEmptyRow.querySelectorAll('.Taxdropdown-menu a')
                            allItems.forEach(item => {
                                item.addEventListener('click', (event) => {
                                    event.preventDefault();
                                    taxtypeSelected = item.innerText
                                    createSubMenu()
                                })
                            });
                            function createSubMenu() {
                                if (rowId === '') {
                                    previousState = true
                                }
                                // Clear existing submenu content
                                let allTaxRows = newEmptyRow.querySelectorAll(`.Taxdropdown-menu ul tr`)
                                //loop in all the existing vatdropdown table row and remove them
                                if (allTaxRows.length > 0) {
                                    for (let h = 0; h < allTaxRows.length; h++) {
                                        const el = allTaxRows[h];
                                        el.style.display = 'none';
                                    }
                                }
                                //get the updated data from db if the id exist'
                                if (rowId !== '') {

                                    //loop in all the diplayed data from database and access the vat and ztf data 
                                    for (let i = 0; i < itemsToProcess.length; i++) {
                                        const el = itemsToProcess[i];
                                        let vat = el.Tax.vat
                                        let ztf = el.Tax.ztf
                                        //get the row data and the data from db on that vat and ztf if they have been entered if the given condition meet
                                        if (taxtypeSelected === 'vat' && rowId === el._id) {
                                            rowDataFromDb = [vat.QRCode, vat.DeviceId, vat.ZimraFsNo, vat.VatNumber, vat.TinNumber, vat.VatAmount]
                                        }
                                        else if (taxtypeSelected === 'ztf' && rowId === el._id) {
                                            rowDataFromDb = [ztf.First, ztf.Second, ztf.LevyAmount]
                                        }
                                    }
                                }
                                // Create a new table row (<tr>) element
                                const newRow = document.createElement("tr");
                                //display the headings based on the selected tax type
                                if (taxtypeSelected === 'vat') {
                                    // Create an array with different content for each cell
                                    rowData = ["QRCode", "DeviceId", "ZimraFsNo", 'VatNumber', 'TinNumber', "VatAmount"];
                                }
                                else if (taxtypeSelected === 'ztf') {
                                    rowData = ["First", "Second", "LevyAmount"];
                                }
                                // Keep track of the last clicked <td>
                                let lastClickedCell = null;
                                // Loop through the rowData array and create a <td> for each value
                                rowData.forEach((data, i) => {
                                    const newCell = document.createElement("td");
                                    newCell.classList.add("vatTd");
                                    // / Create the label
                                    const label = document.createElement("span");
                                    label.classList.add("floating-label");
                                    label.textContent = data; // Set the floating label text

                                    // Create the editable content area (div or span)
                                    const editableText = document.createElement("div");
                                    editableText.classList.add("editable-text");
                                    editableText.classList.add("placeholder");
                                    if (taxtypeSelected === 'vat') {
                                        editableText.id = `editable-vattext${i}`;

                                    }
                                    else if (taxtypeSelected === 'ztf') {
                                        editableText.id = `editable-ztftext${i}`;

                                    }
                                    // editableText.textContent = "";  // Initially empty, can be populated on click
                                    if (rowId !== '') {
                                        // Check if the value from rowDataFromDb is not empty or zero
                                        if (rowDataFromDb[i] !== "" && rowDataFromDb[i] !== 0) {
                                            editableText.innerText = rowDataFromDb[i]; // Set the value if valid
                                        } else {
                                            editableText.innerText = ""; // Placeholder text if empty or zero
                                        }
                                    }
                                    else {
                                        // check if there has ben any taxt type selection,if any has been selected fill the tds with its data if they had been filled before
                                        if (Object.keys(vatEntry).length !== 0 && taxtypeSelected === 'vat') {
                                            const keys = Object.keys(vatEntry)
                                            const field = keys[i]
                                            editableText.innerText = vatEntry[field];
                                        }

                                        else if (Object.keys(ztfEntry).length !== 0 && taxtypeSelected === 'ztf') {
                                            const keys = Object.keys(ztfEntry)
                                            const field = keys[i]
                                            editableText.innerText = ztfEntry[field];
                                        }
                                        else {
                                            editableText.textContent = "";  // Initially empty, can be populated on click

                                        }
                                    }
                                    // Add the label and editable text to the cell
                                    newCell.appendChild(label);
                                    newCell.appendChild(editableText);
                                    // Add a click event to trigger the floating effect and make the text editable
                                    newCell.addEventListener("click", function (event) {
                                        event.stopPropagation()
                                        // If there is a previously clicked cell, reset it
                                        if (lastClickedCell && lastClickedCell !== newCell) {
                                            resetCell(lastClickedCell);
                                        }
                                        // Mark the current cell as clicked
                                        newCell.classList.add("clicked");

                                        // Make the editable text area focusable and allow text input
                                        editableText.contentEditable = true; // Enable content editing
                                        editableText.focus();  // Focus on the content area so the user can type

                                        // Update last clicked cell
                                        lastClickedCell = newCell;
                                    });
                                    // Loop through each editable text div and attach event listeners
                                    //apply newcwll event listeners
                                    editableText.addEventListener('keydown', function (event) {
                                        // If Enter key is pressed, prevent default action and move focus to the next editable text field
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            // newEmptyRow.querySelector(`.vatTd`).classList.remove('clicked')
                                            if (taxtypeSelected === 'vat') {
                                                const nextEditableText = newEmptyRow.querySelector(`#editable-vattext${i + 1}`);
                                                if (nextEditableText) {

                                                    if (i === 3) {
                                                        if (((newEmptyRow.querySelector(`#editable-vattext${3}`).innerText).length > 9) && (newEmptyRow.querySelector(`#editable-vattext${3}`).innerText).startsWith('22')) {
                                                        }
                                                        else {
                                                            notification('vat number is invalid')
                                                            return
                                                        }
                                                    }
                                                    if (i === 4) {
                                                        if (((newEmptyRow.querySelector(`#editable-vattext${4}`).innerText).length > 6) && (newEmptyRow.querySelector(`#editable-vattext${4}`).innerText).startsWith('200')) {
                                                        }
                                                        else {
                                                            notification('tin number is invalid')
                                                            return
                                                        }
                                                    }

                                                    if (i === 5) {
                                                        newEmptyRow.querySelector(`#editable-vattext${5}`).innerText === ''
                                                        notification('vat amount cant be empty')
                                                        return
                                                    }

                                                }
                                                // nextEditableText.innerText = ''
                                                nextEditableText.contentEditable = true
                                                nextEditableText.focus();
                                                newEmptyRow.querySelector(`#editable-vattext${0}`).contentEditable = true
                                            }
                                            else if (taxtypeSelected === 'ztf') {
                                                const nextEditableText = newEmptyRow.querySelector(`#editable-ztftext${i + 1}`);
                                                if (nextEditableText) {
                                                    // nextEditableText.innerText = ''
                                                    nextEditableText.contentEditable = true
                                                    nextEditableText.focus();
                                                    newEmptyRow.querySelector(`#editable-ztftext${0}`).contentEditable = true
                                                }
                                            }
                                        }
                                        if (taxtypeSelected === 'vat') {
                                            // If it's not the first td, only allow numbers
                                            if (i !== 0 && i !== 2) {
                                                // If the key is not a number, Backspace, Delete, or Arrow keys, prevent it
                                                if (!/[0-9.]/.test(event.key) && event.key !== "Backspace" && event.key !== "Delete" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {

                                                    event.preventDefault();  // Prevent non-number input
                                                }
                                            }
                                        }
                                        else if (taxtypeSelected === 'ztf') {
                                            if (i === 2) {
                                                // If the key is not a number, Backspace, Delete, or Arrow keys, prevent it
                                                if (!/[0-9.]/.test(event.key) && event.key !== "Backspace" && event.key !== "Delete" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {

                                                    event.preventDefault();  // Prevent non-number input
                                                }
                                            }
                                        }
                                    });
                                    newRow.appendChild(newCell);  // Append the new <td> to the row
                                });
                                const yesTick = document.createElement("td");
                                yesTick.classList.add("yesTick");
                                yesTick.innerHTML = '&#10003';
                                yesTick.style.color = 'green';
                                const cancelIcon = document.createElement("td");
                                cancelIcon.classList.add("cancelIcon");
                                cancelIcon.innerHTML = '&#10005;';
                                cancelIcon.style.color = 'red';
                                newRow.appendChild(cancelIcon);  // Append the new <td> to the row
                                newRow.appendChild(yesTick);  // Append the new <td> to the row

                                // Get the table body element where rows will be added
                                const myTable = document.createElement("table");
                                myTable.classList.add('myTable')
                                const tableBody = document.createElement("tbody")
                                tableBody.classList.add('tableBody')
                                // Append the new row to the table body
                                tableBody.appendChild(newRow);
                                myTable.appendChild(tableBody);
                                newEmptyRow.querySelector(`.VatDropdown-menu`).appendChild(myTable);
                                newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'block'

                                // Cancel (✕) icon functionality
                                cancelIcon.addEventListener('click', function () {
                                    newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'none'
                                });
                                // Yes Tick (✓) icon functionality
                                yesTick.addEventListener('click', function () {
                                    if (taxtypeSelected === 'vat') {
                                        let VatStatus = ""
                                        let editableTextVatAmount = 0
                                        // Collect the editable text from the current row
                                        const editableTextQRCode = newEmptyRow.querySelector(`#editable-vattext0`).innerText; // QRCode field
                                        const editableTextDeviceId = newEmptyRow.querySelector(`#editable-vattext1`).innerText; // DeviceId field
                                        const editableTextZimraFsNo = newEmptyRow.querySelector(`#editable-vattext2`).innerText; // ZimraFsNo field
                                        const editableTextVatNumber = newEmptyRow.querySelector(`#editable-vattext3`).innerText; // VatNumber field
                                        const editableTextTinNumber = newEmptyRow.querySelector(`#editable-vattext4`).innerText; // VatNumber field
                                        editableTextVatAmount = Number(newEmptyRow.querySelector(`#editable-vattext5`).innerText); // VatAmount field
                                        // Create a vatEntry object with the collected data
                                        //check if all the data is not equal to defaults values
                                        if (editableTextVatAmount === 0) {
                                            VatStatus = 'N'
                                            taxStatus = "N"
                                        }
                                        else {
                                            VatStatus = 'Y'
                                            taxStatus = "Y"
                                        }

                                        vatEntry = {
                                            QRCode: editableTextQRCode,
                                            DeviceId: Number(editableTextDeviceId),
                                            ZimraFsNo: editableTextZimraFsNo,
                                            VatNumber: Number(editableTextVatNumber),
                                            TinNumber: Number(editableTextTinNumber),
                                            VatAmount: Number(editableTextVatAmount),
                                            VatStatus: VatStatus, // Add additional status or logic if needed
                                            taxName: taxtypeSelected, // Add additional status or logic if needed

                                        };
                                        //check also the status of the other tax types if they are not cliked set it to false thus default settings
                                        ztfEntry = {
                                            First: '',
                                            Second: '',
                                            LevyAmount: 0,
                                            ZtfStatus: 'N', // Add additional status or logic if needed
                                            taxName: 'ztf', // Add additional status or logic if needed
                                        };

                                        if (rowId !== '') {
                                            taxDataToUpdate.push(vatEntry)
                                            updateTaxStatus(taxStatus, taxDataToUpdate, rowId)
                                        }
                                    }
                                    else if (taxtypeSelected === 'ztf') {
                                        taxDataToUpdate = []//empty this array first
                                        let ztfStat = ""
                                        let editableTextLevyAmount = 0
                                        // Collect the editable text from the current row
                                        const editableTextFirst = newEmptyRow.querySelector(`#editable-ztftext0`).innerText; // First field
                                        const editableTextSecond = newEmptyRow.querySelector(`#editable-ztftext1`).innerText; // Second field
                                        editableTextLevyAmount = Number(newEmptyRow.querySelector(`#editable-ztftext2`).innerText); // LevyAmount field
                                        //check if all the data is not equal to defaults values
                                        if (editableTextLevyAmount === 0) {
                                            ztfStat = 'N'
                                            taxStatus = "N"
                                        }
                                        else {
                                            console.log('to yes' + editableTextLevyAmount + ztfStat)
                                            ztfStat = 'Y'
                                            taxStatus = "Y"
                                        }
                                        // Create a ztfEntry object with the collected data
                                        ztfEntry = {
                                            First: editableTextFirst,
                                            Second: editableTextSecond,
                                            LevyAmount: Number(editableTextLevyAmount),
                                            ZtfStatus: ztfStat, // Add additional status or logic if needed
                                            taxName: taxtypeSelected, // Add additional status or logic if needed
                                        };
                                        //check also the status of the other tax types if they are not cliked set it to false thus default settings
                                        vatEntry = {
                                            QRCode: '',
                                            DeviceId: 0,
                                            ZimraFsNo: '',
                                            VatNumber: 0,
                                            TinNumber: 0,
                                            VatAmount: 0,
                                            VatStatus: 'N', // Add additional status or logic if needed
                                            taxName: 'vat', // Add additional status or logic if needed

                                        };
                                        if (rowId !== '') {
                                            taxDataToUpdate.push(ztfEntry)
                                            updateTaxStatus(taxStatus, taxDataToUpdate, rowId)
                                        }
                                    }
                                    if (rowId === '') {
                                        //remove the dropdowns and open next cell
                                        newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'none'
                                        previousState = false//set radio button status to true as the dropdown menu is still open
                                        //open the next cell
                                        if (invoiceStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO INVOICE CELL
                                            invoiceCell.contentEditable = true
                                            invoiceCell.focus()
                                        }
                                        else if (descriptionStatus.isDisplayed === true) {
                                            //MOVE FOCUS TO DESCRIPTION CELL
                                            cashFlowDescriptionCell.contentEditable = true
                                            cashFlowDescriptionCell.focus()
                                        }
                                    }
                                });
                                // Function to reset a previously clicked cell
                                function resetCell(cell) {
                                    cell.classList.remove("clicked");  // Remove the floating label effect
                                    const editableText = cell.querySelector(".editable-text");
                                    editableText.contentEditable = false; // Disable content editing
                                }

                            }
                            // Add event listener to the document to handle clicks
                            document.addEventListener("mousedown", function handleClickOutsideBox(event) {
                                // Reference to the dropdown and radio button
                                const dropdown = newEmptyRow.querySelector('.Taxdropdown-menu'); // Dropdown menu
                                const subMenu = newEmptyRow.querySelector('.Taxdropdown-menu ul'); // Dropdown menu
                                // Check if the click is inside the editable area or dropdown
                                const clickedInsideDropdown = dropdown.contains(event.target);
                                if (!clickedInsideDropdown) {
                                    // console.log('am contributing')
                                    // If clicked outside both editable area and dropdown, close the dropdown and uncheck the radio button
                                    dropdown.style.display = 'none'; // Close dropdown
                                    subMenu.style.display = 'none'
                                    // previousState = false//set radio button status to false as the dropdown menu has been closed

                                }
                            });
                            //=====================================================================================
                            function updateTaxStatus(taxStatus, taxDataToUpdate, rowId) {
                                // send the data to db
                                fetch("/updateCashFlowTax", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        rowId,
                                        taxDataToUpdate,
                                        taxStatus,
                                    }),
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        // Show alert
                                        if (data.amUpdated === true) {
                                            notification("Updated");
                                            spinner.style.display = "none";
                                            defaultDisplayContent2(startDate, endDate)
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(
                                            `Error updating Invoice field for expense ID: ${rowId}`,
                                            error
                                        );
                                    });
                            }
                            //==============================================================================================
                            //LISTENERS FOR INVOICE CELL
                            invoiceCell.addEventListener("keydown", function (event) {
                                const keyCode = event.keyCode;
                                if (
                                    (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode >= 65 && keyCode <= 90) || // A-Z
                                    (keyCode >= 97 && keyCode <= 122) || // a-z
                                    keyCode === 8 || // Backspace
                                    keyCode === 13 || // Enter
                                    keyCode === 46 || // Delete
                                    keyCode === 37 || // Left arrow key
                                    keyCode === 39 || // Right arrow key
                                    keyCode === 32 // Spacebar
                                ) {
                                    // Allow the key to be typed in the cell
                                } else {
                                    event.preventDefault();
                                }

                                if (keyCode === 13) {
                                    event.preventDefault();
                                    invoiceCell.blur(); // Remove focus on the cell
                                    const InvoiceRef = invoiceCell.innerText

                                    if (rowId === '') {
                                        // MOVE FOCUS TO DESCRIPTION CELL
                                        descriptionCell.focus();
                                    }
                                    else if (rowId !== '') {
                                        //  use the fetch for the route with POST method and update the expense rate in the database
                                        fetch('/updateCashFlowInvoice', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                rowId,
                                                InvoiceRef
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                // Show alert
                                                if (data.amUpdated) {
                                                    notification('Updated')
                                                    spinner.style.display = 'none'
                                                    defaultDisplayContent2(startDate, endDate)
                                                }

                                            })
                                            .catch(error => {
                                                console.error(`Error updating Invoice field for expense ID: ${rowId}`, error);
                                            });
                                    }

                                }
                            })
                            // };
                            //================================================================================================
                            function displayCategoryForm() {

                                // const catDropdown = newEmptyRow.querySelector('.catDropdownContainer')
                                const catDropdown = newEmptyRow.querySelector('#dropdownForm')
                                const catButton = newEmptyRow.querySelector('.categorySpan');
                                const menuHeight = catDropdown.offsetHeight;
                                const dropdownRect = catButton.getBoundingClientRect();
                                // Set form position based on the clicked row
                                catDropdown.style.transition = 'transform 0.3s ease;' /* Smooth transition */
                                //the form's position is calculated based on the clicked row's bounding rectangle so that we are able to apply 
                                if (window.innerHeight - dropdownRect.bottom < menuHeight) {
                                    catDropdown.style.top = `${dropdownRect.top - menuHeight}px`
                                    catDropdown.classList.add('dropup');

                                } else {
                                    catDropdown.classList.remove('dropup');
                                }
                                // Show the selected form
                                catDropdown.style.display = 'block';

                                let insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                // //gara wias a focus in the input field
                                insertedCategoryName.focus()
                                //limit the words length to 25
                                insertedCategoryName.maxLength = 25
                            }
                            function createNewCategory() {
                                let insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                insertedCategoryName.value = ((insertedCategoryName.value).replace(/ /g, "_")).toLowerCase();
                                let newCategory = (insertedCategoryName.value).replace(/_/g, " ");
                                newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                newEmptyRow.querySelector('.categorySpan').innerText = newCategory
                                if (typeCell.innerText === 'Payout') {
                                    //UPDATE THE CATEGORY TABLE CELL
                                    let categoryToDb = []
                                    //get the inserted value
                                    let payOutCat = {};
                                    payOutCat["category"] = insertedCategoryName.value;
                                    payOutCat["CategoryLimit"] = 0;
                                    payOutCat["CategoryLimitRange"] = "";
                                    payOutCat["Balance"] = "PayOut";
                                    const categoryName = Array.from(newExpenseCategories).find(cat => (cat.category).toLowerCase() === insertedCategoryName.value)
                                    if (!categoryName) {
                                        categoryToDb.push(payOutCat)
                                    }
                                    else if (categoryName) {
                                        notification('category Already Exist')
                                        return
                                    }
                                    insertCategoryRecord(categoryToDb)
                                    if (rowId !== '') {
                                        const newCategory = insertedCategoryName.value
                                        categoryTodatabase(newCategory)
                                    }
                                }

                                if (typeCell.innerText === 'Pay in') {
                                    //UPDATE THE CATEGORY TABLE CELL
                                    // newEmptyRow.querySelector('.categorySpan').innerText = newCategory
                                    let categoryToDb = []
                                    //get the inserted value
                                    let payOutCat = {};
                                    payOutCat["category"] = insertedCategoryName.value;
                                    payOutCat["CategoryLimit"] = 0;
                                    payOutCat["CategoryLimitRange"] = "";
                                    payOutCat["Balance"] = "PayIn";
                                    const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === insertedCategoryName.value)
                                    if (!categoryName) {
                                        categoryToDb.push(payOutCat)
                                    }
                                    else if (categoryName) {
                                        notification('category Already Exist')
                                        return
                                    }
                                    const balanceValue = 'PayIn'
                                    insertCategoryRecord(categoryToDb, balanceValue)
                                    newEmptyRow.querySelector('#dropdownForm').style.display = 'none'; // Create a new dropdown instance
                                    const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                    dropdownMenu.toggle(); // Toggle the dropdown
                                    const dropdownMenu2 = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                    dropdownMenu2.hide();//close category dropdwn menu
                                    // notification('Added')
                                    if (rowId !== '') {
                                        const newCategory = insertedCategoryName.value
                                        categoryTodatabase(newCategory)

                                    }
                                }
                                newEmptyRow.querySelector('#dropdownForm').style.display = 'none'; // Create a new dropdown instance
                                const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                dropdownMenu.toggle(); // Toggle the dropdown
                                const dropdownMenu2 = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                dropdownMenu2.hide();//close category dropdwn menu
                            }
                            const payOutSubmitButton = newEmptyRow.querySelector(`.submitCat`)
                            //on click of the add button send data to database
                            payOutSubmitButton.addEventListener("click", (event) => {
                                event.preventDefault()
                                createNewCategory()
                            })
                            //if the key pressed is enter , add the event on the category cell
                            newEmptyRow.querySelector('.categories-cell').addEventListener("keydown", (event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    if (newEmptyRow.querySelector('#dropdownForm').style.display === 'block') {
                                        createNewCategory()

                                    }
                                }
                            })
                            //=================================================================================================
                            function categoryDropdown() {
                                //decide which contents of dropdown to delete
                                if (typeCell.innerText === 'Payout') {
                                    expcOptions.forEach(categoryOption => {
                                        if (categoryOption.classList.contains('expcate-option')) {
                                            categoryOption.style.display = 'block'
                                        }
                                    })
                                    incomeOptions.forEach(categoryOption => {
                                        if (categoryOption.classList.contains('incCate-option')) {
                                            categoryOption.style.display = 'none'
                                        }
                                    })
                                }
                                if (typeCell.innerText === 'Pay in') {
                                    incomeOptions.forEach(categoryOption => {
                                        if (categoryOption.classList.contains('incCate-option')) {
                                            categoryOption.style.display = 'block'
                                        }
                                    })
                                    expcOptions.forEach(categoryOption => {
                                        if (categoryOption.classList.contains('expcate-option')) {
                                            categoryOption.style.display = 'none'
                                        }
                                    })
                                }
                                // const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                // dropdownMenu.toggle(); // Toggle the dropdown
                            }
                            function currencyDropdown() {
                                // the dropdown should open
                                const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                dropdownMenu.toggle(); // Toggle the dropdown
                            }

                            // //CLOSE THE CREATE CATEGORY FORM ONCE CLICKED OUTSIDE
                            document.addEventListener('mousedown', function (event) {
                                const forms = document.querySelectorAll('#dropdownForm');
                                forms.forEach(form => {
                                    const inputField = form.querySelector('.categoryNameClass');
                                    // Check if the form is visible
                                    if (form.style.display === 'block') {
                                        // Check if the clicked element is outside the form and not the input
                                        if (!form.contains(event.target) && !inputField.contains(event.target)
                                            && !newEmptyRow.querySelector('.catDropdown-menu').classList.contains('show')) {
                                            form.style.display = 'none';
                                        }
                                    }
                                });
                            });
                            //===============================================================================================
                            const cashFlowDescriptionCell = newEmptyRow.querySelector('.editable-cell');
                            cashFlowDescriptionCell.addEventListener("click", function (event) {
                                //now display full text
                                cashFlowDescriptionCell.innerText = newEmptyRow.querySelector('.descriptionId').innerText
                                // Add an event listener to all editable cells
                                const range = document.createRange();
                                const selection = window.getSelection();

                                range.selectNodeContents(this);
                                range.collapse(false); // Move the cursor to the end of the text
                                selection.removeAllRanges();
                                selection.addRange(range);
                            })
                            cashFlowDescriptionCell.addEventListener("keydown", function (event) {
                                const categoryStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Category');
                                const currStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Currency');

                                if ((event.keyCode >= 65 && event.keyCode <= 90) || // A-Z
                                    (event.keyCode >= 97 && event.keyCode <= 122) || // a-z
                                    event.keyCode === 8 || // Backspace
                                    event.keyCode === 46 || // Delete
                                    event.keyCode === 37 || // Left arrow
                                    event.keyCode === 39 || // Right arrow
                                    event.keyCode === 32 || // Space
                                    event.keyCode === 188 || // Comma (,)
                                    event.keyCode === 190 ||// Full stop (.)
                                    event.keyCode >= 48 && event.keyCode <= 57
                                ) { //allow input

                                }
                                else {
                                    event.preventDefault()
                                }
                                //NOW SHOW DROPDOWNS WHEN ENTER IS CLICKED
                                if (event.key === 'Enter' || event.key === 'Tab') {
                                    event.preventDefault()
                                    if (rowId === '') {
                                        if ((categoryStatus.isDisplayed === true)) {
                                            const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                            dropdownMenu.toggle(); // Toggle the dropdown
                                            cashFlowDescriptionCell.blur()//remove focus
                                        }
                                        else if ((currStatus.isDisplayed === true)) {
                                            currencyDropdown()
                                            cashFlowDescriptionCell.blur()//remove focus
                                        }

                                    }
                                    if (rowId !== '') {
                                        const description = cashFlowDescriptionCell.innerText
                                        cashFlowDescriptionCell.blur()//remove focus
                                        //then update database
                                        fetch('/updateCashFlowDescription', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                rowId,
                                                description,
                                            })
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                // Show alert
                                                if (data.amUpdated) {
                                                    notification('Updated')
                                                    spinner.style.display = 'none'
                                                    defaultDisplayContent2(startDate, endDate)
                                                }

                                            })
                                            .catch(error => {
                                                console.error(`Error updating shift field for expense ID: ${rowId}`, error);
                                            });
                                    }
                                }
                            })
                            //=========================================================================================
                            //CLICK EVENTS ON DROPDOWNS
                            // Add click event listener to categories cell
                            newEmptyRow.querySelector('.categorySpan').addEventListener("click", function (event) {
                                if (rowId !== '') {
                                    categoryDropdown()
                                }
                                else if (typeCell.innerText === 'Select Type' && cashFlowDate.innerText === '' || typeCell.innerText === 'Select Type' && cashFlowDate.innerText !== '') {
                                    // the dropdown shouldnt open
                                    newEmptyRow.querySelector('.categorySpan').setAttribute('aria-expanded', 'false')
                                    newEmptyRow.querySelector('.catDropdown-menu').classList.remove('show')
                                }

                            });
                            function categoryToDatabase(event, i, categoryOption) {
                                if (i === 0) {
                                    event.stopPropagation();
                                    displayCategoryForm()
                                }
                                else {
                                    let newCategory = categoryOption.querySelector(".cateList-optionSpan").innerText;
                                    newCategory = ((newCategory).replace(/_/g, " "))
                                    newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    expenseSpan.innerText = newCategory;
                                    if (rowId !== '') {
                                        newCategory = (newCategory).replace(/ /g, "_").toLowerCase()
                                        categoryTodatabase(newCategory)
                                    }
                                    // const currDropdown = newEmptyRow.querySelector('.currbtnSpan');
                                    // const nextDropdown = new bootstrap.Dropdown(currDropdown);
                                    // nextDropdown.toggle(); // Open the currency droPDOWN
                                    const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                    dropdownMenu.hide(); //close the ctegory dropdwon
                                }
                            }
                            // Add click event listeners to category options
                            const expenseSpan = newEmptyRow.querySelector('.categorySpan');
                            expcOptions.forEach((categoryOption, i) => {
                                categoryOption.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    categoryToDatabase(event, i, categoryOption)
                                });
                            });

                            expcOptions.forEach((categoryOption, i) => {
                                categoryOption.addEventListener("keydown", (event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        categoryToDatabase(event, i, categoryOption)
                                        const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                        dropdownMenu.toggle(); // Toggle the dropdown

                                    }
                                })
                            })
                            incomeOptions.forEach((categoryOption, i) => {
                                categoryOption.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    categoryToDatabase(event, i, categoryOption)

                                });
                            });
                            incomeOptions.forEach((categoryOption, i) => {
                                categoryOption.addEventListener("keydown", (event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        categoryToDatabase(event, i, categoryOption)
                                        const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                        dropdownMenu.toggle(); // Toggle the dropdown
                                    }
                                })
                            })
                            //function to update category cell in database
                            function categoryTodatabase(newCategory) {
                                spinner.style.display = "block";
                                fetch("/updateCashFlowCategory", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        rowId,
                                        newCategory,
                                    }),
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        // Show alert
                                        if (data.amUpdated === true) {
                                            defaultDisplayContent2(startDate, endDate)
                                            spinner.style.display = "none";
                                            notification("Updated");
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(
                                            `Error updating base category field `,
                                            error
                                        );
                                    });
                            }
                            //============================================================================================
                            //currency CELL WITH KEYDOWN EVENT TO TRIGGER THE DROPDOWN
                            // newEmptyRow.querySelector('.currbtnSpan').addEventListener("click", function (event) {
                            //     if (typeCell.innerText === 'Select Type' && cashFlowDate.innerText === '' || typeCell.innerText === 'Select Type' && cashFlowDate.innerText !== '') {
                            //         // the dropdown shouldnt open
                            //         newEmptyRow.querySelector('.currbtnSpan').setAttribute('aria-expanded', 'false')
                            //         newEmptyRow.querySelector('.currdropdown-menu').classList.remove('show')

                            //     }
                            // });
                            const CurrencyOptions = newEmptyRow.querySelectorAll(".curr-option");
                            const CurrencySpan = newEmptyRow.querySelector(".currbtnSpan");
                            CurrencyOptions.forEach(currencyOption => {
                                currencyOption.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    //GET THE SELECTED currency AND UPDATE THE currency CELL WITH ITS VALUE
                                    const newCurrency = currencyOption.querySelector('.currdropdown-item').innerText;
                                    CurrencySpan.innerText = newCurrency;
                                    //get reference for the rate span in the table
                                    const rateCell = newEmptyRow.querySelector('.expRate');
                                    //fill the rate cell with the corresponding rate
                                    let newCashFlowRate = 0
                                    for (let i = 0; i < newCurrencies.length; i++) {
                                        const currencyRate = newCurrencies[i]
                                        if (newCurrency === currencyRate.Currency_Name) {
                                            newCashFlowRate = currencyRate.RATE;
                                            rateCell.innerText = newCashFlowRate;
                                        }
                                        const currName = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (newCurrency).toLowerCase());//find matching currency name with the one in the incomes table
                                        if (currName) {
                                            newCurrCode = currName.ISO_Code;
                                            //PLACE SYMBOLS WHERE APPROPRIATE
                                            const rateSymbol =
                                                newEmptyRow.querySelector(".symbol2");
                                            const amountSymbol =
                                                newEmptyRow.querySelector(".symbol1");
                                            rateSymbol.innerText = newCurrCode;
                                            amountSymbol.innerText = newCurrCode;

                                        }
                                    }
                                    if (rowId === '') {
                                        //focus on the amount cell after dropdown closes
                                        expenseAmount.contentEditable = true
                                        expenseAmount.focus()
                                    }
                                    else if (rowId !== '') {

                                        //calculate the relative rate to be used
                                        const currencies = Array.from(newCurrencies).find((newCurrency) => newCurrency.BASE_CURRENCY === "Y");
                                        const relativeRate =
                                            newCashFlowRate / currencies.RATE;
                                        const cashFlowAmount = newEmptyRow.querySelector(".expAmount").innerText;
                                        //calculate the cash equivalents
                                        const cashEquivValue2 =
                                            parseFloat(cashFlowAmount) /
                                            parseFloat(relativeRate);
                                        newEmptyRow.querySelector(
                                            ".Equivsymbol"
                                        ).innerText = baseCurrCode;
                                        newEmptyRow.querySelector(
                                            ".cashEquivCell"
                                        ).innerText =
                                            Number(cashEquivValue2).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                        //UPDATE ALL TOTALS
                                        document.querySelector(".totalIncome").innerText = Number(totalPayInsRange).toFixed(2);
                                        document.querySelector(".totalExpenses").innerText = Number(totalPayOutsRange).toFixed(2);
                                        const cashBalance = (parseFloat(totalPayInsRange) + parseFloat(openingBalance)) - parseFloat(totalPayOutsRange)

                                        if (cashBalance < 0) {
                                            //if the number is negative
                                            const numberString = cashBalance.toString(); //convert to string so that you can use the split method
                                            formattedValue = numberString.split("-")[1];
                                            sign = -1;
                                            if (sign === -1) {
                                                document.querySelector(
                                                    ".CashBalance"
                                                ).style.color = "red";
                                                const updatedValue =
                                                    "-" +
                                                    baseCurrCode +
                                                    Number(formattedValue).toFixed(2);
                                                newEmptyRow.querySelector(
                                                    ".runningBalance"
                                                ).innerText = updatedValue;
                                            }
                                        } else if (cashBalance >= 0) {
                                            document.querySelector(
                                                ".CashBalance"
                                            ).style.color = "black";
                                            document.querySelector(
                                                ".CashBalance"
                                            ).innerText =
                                                baseCurrCode +
                                                "    " +
                                                Number(cashBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                        }

                                        //CALCULATE THE RUNNING BALANCE
                                        //SEND THE DATA TO TEH DATABASE
                                        spinner.style.display = "block";
                                        currencyToDatabase(rowId, newCurrency, cashEquivValue2, newCashFlowRate)
                                    }


                                });
                            });
                            function currencyToDatabase(rowId, newCurrency, cashEquivValue2, newCashFlowRate) {
                                fetch('/updateCashFlowCurrency', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        rowId,
                                        newCurrency,
                                        newCashFlowRate,
                                        cashEquivValue2
                                    }),

                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        // Show alert
                                        if (data.amUpdated) {
                                            notification('Updated')
                                            spinner.style.display = 'none'
                                            defaultDisplayContent2(startDate, endDate)
                                        }

                                    })
                                    .catch(error => {
                                        console.error(`Error updating base currency field for id: ${rowId}`, error);
                                    });

                            }

                            //=====================================================================================================

                            //CODE FOR THE  AMOUNT CELL EVENT HANDLER IF USER ENTERS THE AMOUNT , IT CALCULATE THE CASH EQUIVALENT VALUE BASED ON THE BASE CURRENCY SELECTED
                            //first make it editable
                            expenseAmount.contentEditable = true
                            expenseAmount.focus()
                            // add an event listener to the cell for key press events
                            expenseAmount.addEventListener("keydown", function (event) {
                                // check if the pressed key is the enter key
                                //find the base currency name
                                const currencies = Array.from(newCurrencies).find(newCurrency => newCurrency.BASE_CURRENCY === 'Y');//find the base currency
                                const keyCode = event.keyCode;
                                if ((keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode >= 96 && keyCode <= 105) ||
                                    (keyCode == 13) ||
                                    (keyCode == 8) || // backspace
                                    (keyCode == 9) || // tab
                                    (keyCode == 190) || (keyCode == 37 || keyCode == 39)) // tab) { // Enter key { // numeric keypad
                                { // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }
                                // prevent the default behavior of the enter key
                                if (event.key === 'Enter') {
                                    event.preventDefault();

                                    itemsToProcess = []
                                    // get the new value of the expense rate from the edited cell
                                    const newCashFlowAmount = event.target.innerText;
                                    if (newCashFlowAmount === '') {
                                        notification('Field Can not Be Empty')
                                        expenseAmount.focus(); // Remove focus from amount cell
                                        return
                                    }
                                    else {
                                        //check if the id is present
                                        if (rowId === '') {
                                            const newCurrency = newEmptyRow.querySelector('.currbtnSpan').innerText;
                                            //find the selected currency so that we take the rate
                                            const selectedCurrency = Array.from(newCurrencies).find(newCurr => (newCurr.Currency_Name).toLowerCase() === (newCurrency).toLowerCase());
                                            //calculate the relative rate to be used using the rate of the base currency and the selected currency
                                            const relativeRate = selectedCurrency.RATE / currencies.RATE;
                                            //calculate the cash equivalents 
                                            const calculated = Number(parseFloat(newCashFlowAmount) / parseFloat(relativeRate)).toFixed(2);
                                            const currName = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (currencies.Currency_Name).toLowerCase());//find matching currency name with the one in the incomes table
                                            if (currName) {
                                                newEmptyRow.querySelector('.Equivsymbol').innerText = currName.symbols;
                                                newEmptyRow.querySelector('.cashEquivCell').innerText = (Math.round(calculated * 100) / 100).toFixed(2);;//place the cash Equiv value on the cashEquiv cell
                                            }

                                            //NOW LOAD THE DATA IN THE CELLS INTO VARIABLES SO THAT THEY CAN BE SEND TO THE DATABASE FOR SAVING
                                            const CashFlowShift = newEmptyRow.querySelector('.editableShift').innerText;
                                            const CashFlowInvoiceRef = newEmptyRow.querySelector('.editableInvoice').innerText;
                                            const cashEquivValue = parseFloat(newEmptyRow.querySelector('.cashEquivCell').innerText);
                                            let CashFlowCategory = newEmptyRow.querySelector('.categorySpan').innerText;
                                            if (CashFlowCategory.includes(" ")) {
                                                CashFlowCategory = CashFlowCategory.replace(/ /g, "_").toLowerCase();
                                            }
                                            else {
                                                CashFlowCategory = CashFlowCategory.toLowerCase();
                                            }
                                            if (CashFlowCategory === 'Select Category') {
                                                if (typeCell.innerText === 'Payout') {
                                                    CashFlowCategory = 'suspense'
                                                    let categoryToDb = []
                                                    //and also update the new category array
                                                    let payOutCat = {}; //THE NEW DOCUMEN
                                                    payOutCat["category"] = CashFlowCategory;
                                                    payOutCat["CategoryLimit"] = 0;
                                                    payOutCat["CategoryLimitRange"] = "";
                                                    payOutCat["Balance"] = "PayOut";
                                                    const categoryName = Array.from(newExpenseCategories).find(cat => (cat.category).toLowerCase() === CashFlowCategory)
                                                    if (!categoryName) {
                                                        categoryToDb.push(payOutCat)
                                                    }
                                                }
                                                if (typeCell.innerText === 'Pay in') {
                                                    CashFlowCategory = 'suspense'
                                                    let categoryToDb = []
                                                    //and also update the new category array
                                                    let payOutCat = {}; //THE NEW DOCUMEN
                                                    payOutCat["category"] = CashFlowCategory;
                                                    payOutCat["CategoryLimit"] = 0;
                                                    payOutCat["CategoryLimitRange"] = "";
                                                    payOutCat["Balance"] = "PayIn";
                                                    const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === CashFlowCategory)
                                                    if (!categoryName) {
                                                        categoryToDb.push(payOutCat)
                                                    }
                                                }
                                                if (categoryToDb.length > 0) {
                                                    insertCategoryRecord(categoryToDb)
                                                }
                                            }

                                            const currentDate = newEmptyRow.querySelector('.expenseDate').innerText;
                                            const selectedType = newEmptyRow.querySelector('.type').innerText;
                                            const CashFlowDescription = newEmptyRow.querySelector('.editable-cell').innerText;
                                            const Currency_Name = newEmptyRow.querySelector('.currbtnSpan').innerText;
                                            const CashFlowAmount = parseFloat(newEmptyRow.querySelector('.expAmount').innerText);
                                            const CashFlowRate = parseFloat(newEmptyRow.querySelector('.expRate').innerText);

                                            // scroll to the beginning of the table
                                            // tableContainer.scrollLeft = 0;
                                            //FIRST UPDATE THE ARRAY WITH THE INSERTED DATA
                                            let cashFlowDoc = {} //THE NEW DOCUMENT
                                            if (selectedType === 'Pay in') {
                                                cashFlowDoc["CashFlowDate"] = currentDate
                                                cashFlowDoc["CashFlowShift"] = CashFlowShift
                                                cashFlowDoc["Tax"] = { vat: vatEntry, ztf: ztfEntry }
                                                cashFlowDoc["CashFlowInvoiceRef"] = CashFlowInvoiceRef
                                                cashFlowDoc["CashFlowDescription"] = CashFlowDescription
                                                cashFlowDoc["CashFlowCategory"] = CashFlowCategory
                                                cashFlowDoc["CashFlowCurrency"] = Currency_Name
                                                cashFlowDoc["CashFlowAmount"] = parseFloat(CashFlowAmount)
                                                cashFlowDoc["CashFlowRate"] = parseFloat(CashFlowRate)
                                                cashFlowDoc["CashFlowCashEquiv"] = parseFloat(cashEquivValue)
                                                cashFlowDoc["CashFlowType"] = 'Pay in'
                                                itemsToProcess.push(cashFlowDoc);//push into an array that will go to database

                                            }
                                            else if (selectedType === 'Payout') {
                                                cashFlowDoc["CashFlowDate"] = currentDate
                                                cashFlowDoc["CashFlowShift"] = CashFlowShift
                                                cashFlowDoc["Tax"] = { vat: vatEntry, ztf: ztfEntry }
                                                cashFlowDoc["CashFlowInvoiceRef"] = CashFlowInvoiceRef
                                                cashFlowDoc["CashFlowDescription"] = CashFlowDescription
                                                cashFlowDoc["CashFlowCategory"] = CashFlowCategory
                                                cashFlowDoc["CashFlowCurrency"] = Currency_Name
                                                cashFlowDoc["CashFlowAmount"] = parseFloat(CashFlowAmount)
                                                cashFlowDoc["CashFlowRate"] = parseFloat(CashFlowRate)
                                                cashFlowDoc["CashFlowCashEquiv"] = parseFloat(cashEquivValue)
                                                cashFlowDoc["CashFlowType"] = 'Payout'
                                                itemsToProcess.push(cashFlowDoc);//push into an array that will go to database

                                            }
                                            //USE OUR ONE AND ONLY FUNCTION TO SAVE TO DATABASE
                                            if (itemsToProcess.length > 0) {
                                                expenseAmount.blur(); // Remove focus from amount cell
                                                saveCashFlowRecord(itemsToProcess)
                                            }
                                        }
                                        else if (rowId !== '') {
                                            const newCurrency = newEmptyRow.querySelector('.currbtnSpan').innerText;
                                            const cashFlowId = Array.from(cashFlowArray).find(ex => ex._id === rowId);//find the id equal to the expenseId

                                            const selectedCurrency = Array.from(newCurrencies).find(newCurr => (newCurr.Currency_Name).toLowerCase() === (newCurrency).toLowerCase());
                                            //calculate the relative rate to be used using the rate of the base currency and the selected currency
                                            const relativeRate = (cashFlowId.CashFlowRate / currencies.RATE);
                                            //calculate the cash equivalents 
                                            const cashEquivValue3 = Number(parseFloat(newCashFlowAmount) / parseFloat(relativeRate)).toFixed(2);

                                            //PLACE SYMBOLS WHERE APPROPRIATE
                                            newEmptyRow.querySelector('.Equivsymbol').innerText = baseCurrCode;
                                            newEmptyRow.querySelector('.cashEquivCell').innerText = Number(cashEquivValue3).toFixed(2);;//place the cash Equiv value on the cashEquiv cell

                                            document.querySelector('.totalExpenses').innerText = Number(totalPayOutsRange).toFixed(2);
                                            document.querySelector('.totalIncome').innerText = Number(totalPayInsRange).toFixed(2);
                                            //UPDATE ALL TOTALS
                                            const cashBalance = Number(parseFloat(totalPayInsRange + openingBalance) - parseFloat(totalPayOutsRange)).toFixed(2)

                                            if (cashBalance < 0) {//if the number is negative
                                                const numberString = cashBalance.toString();//convert to string so that you can use the split method
                                                formattedValue = numberString.split('-')[1]
                                                sign = -1
                                                if (sign === -1) {
                                                    document.querySelector('.CashBalance').style.color = 'red';
                                                    const updatedValue = '-' + baseCurrCode + Number(formattedValue).toFixed(2);
                                                    newEmptyRow.querySelector('.runningBalance').innerText = updatedValue
                                                }
                                            }
                                            else if (cashBalance >= 0) {
                                                document.querySelector('.CashBalance').style.color = 'black';
                                                document.querySelector('.CashBalance').innerText = baseCurrCode + '  ' + Number(cashBalance).toFixed(2);;//place the cash Equiv value on the cashEquiv cell
                                            }
                                            spinner.style.display = 'block';
                                            expenseAmount.blur();//REMOVE FOCUS ON CELL
                                            //NOW LOAD THE DATA IN THE CELLS INTO VARIABLES SO THAT THEY CAN BE SEND TO THE DATABASE FOR SAVING
                                            fetch('/updateCashFlowAmount', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    rowId,
                                                    newCashFlowAmount,
                                                    cashEquivValue3
                                                })
                                            })
                                                .then(response => response.json())
                                                .then(data => {
                                                    // Show alert
                                                    if (data.amUpdated) {
                                                        notification('Updated')
                                                        spinner.style.display = 'none'
                                                        defaultDisplayContent2(startDate, endDate)
                                                    }

                                                })
                                                .catch(error => {
                                                    console.error(`Error updating base amount field for expense ID: ${rowId}`, error);
                                                });
                                        }
                                    }

                                }
                            })
                            //==========================================================================================================
                            //LISTENER FOR RATE CELL
                            const cashFlowRate = newEmptyRow.querySelector('.expRate');
                            // cashFlowRate.addEventListener("click", function (event) {
                            // event.preventDefault();

                            //first make it editable
                            // cashFlowRate.contentEditable = true
                            //then add event listener to the edited txt
                            cashFlowRate.addEventListener("keydown", function (event) {
                                const keyCode = event.keyCode;
                                if ((keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode >= 96 && keyCode <= 105) ||
                                    (keyCode == 13) ||
                                    (keyCode == 8) || // backspace
                                    (keyCode == 9) || // tab
                                    (keyCode == 190) || (keyCode == 37 || keyCode == 39)) // tab) { // Enter key { // numeric keypad
                                {
                                    // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }
                                if (event.key === "Enter") {
                                    // prevent the default behavior of the enter key
                                    event.preventDefault();
                                    if (rowId !== '') {
                                        // get the new value of the expense rate from the edited cell
                                        const newCashFlowRate = event.target.innerText;
                                        if (newCashFlowRate === '') {
                                            notification('Field Can not Be Empty')
                                            cashFlowRate.focus(); // Remove focus from amount cell
                                            return
                                        }
                                        else {

                                            const exId = Array.from(cashFlowArray).find(ex => ex._id === rowId);//find the id equal to the expenseId
                                            //so that we can access any items with that id(e.g-exId.ExpenseAmount)
                                            const currencies = Array.from(newCurrencies).find(newCurrency => newCurrency.BASE_CURRENCY === 'Y');//find the base currency
                                            //calculate the relative rate to be used
                                            const relativeRate = newCashFlowRate / currencies.RATE;
                                            const currName = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (currencies.Currency_Name).toLowerCase());//find matching currency name with the one in the incomes table
                                            if (currName) {
                                                baseCurrCode = currName.ISO_Code
                                            }
                                            //calculate the cash equivalents 
                                            const newCashFlowCashEquiv = Number(parseFloat(exId.CashFlowAmount) / parseFloat(relativeRate)).toFixed(2);

                                            newEmptyRow.querySelector('.Equivsymbol').innerText = baseCurrCode;
                                            newEmptyRow.querySelector('.cashEquivCell').innerText = Number(newCashFlowCashEquiv).toFixed(2);;//place the cash Equiv value on the cashEquiv cell
                                            document.querySelector('.totalExpenses').innerText = Number(totalPayOutsRange).toFixed(2)
                                            document.querySelector('.totalIncome').innerText = Number(totalPayInsRange).toFixed(2)
                                            //UPDATE ALL TOTALS
                                            const cashBalance = Number(parseFloat(totalPayInsRange + openingBalance) - parseFloat(totalPayOutsRange)).toFixed(2)


                                            if (cashBalance < 0) {//if the number is negative
                                                const numberString = cashBalance.toString();//convert to string so that you can use the split method
                                                formattedValue = numberString.split('-')[1]
                                                sign = -1
                                                if (sign === -1) {
                                                    document.querySelector('.CashBalance').style.color = 'red';
                                                    const updatedValue = '-' + baseCurrCode + Number(formattedValue).toFixed(2);
                                                    newEmptyRow.querySelector('.runningBalance').innerText = updatedValue
                                                }
                                            }
                                            else if (cashBalance >= 0) {
                                                document.querySelector('.CashBalance').style.color = 'black';
                                                document.querySelector('.CashBalance').innerText = baseCurrCode + '  ' + Number(cashBalance).toFixed(2);;//place the cash Equiv value on the cashEquiv cell
                                            }

                                            //  use the fetch for the route with POST method and update the expense rate in the database
                                            cashFlowRate.blur();
                                            fetch('/updateCashFlowRate', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    rowId,
                                                    newCashFlowRate,
                                                    newCashFlowCashEquiv
                                                })
                                            })
                                                .then(response => response.json())
                                                .then(data => {
                                                    // Show alert
                                                    if (data.amUpdated) {
                                                        notification('Updated')
                                                        spinner.style.display = 'none'
                                                        defaultDisplayContent2(startDate, endDate)
                                                    }

                                                })
                                                .catch(error => {
                                                    console.error(`Error updating base rate field for  ID: ${rowId}`, error);
                                                });
                                        }
                                    }
                                }
                            })
                            //=========================================================================================================
                            // Get all the checkboxes in the table
                            document.querySelector(".myCheck").addEventListener("click", () => {
                                checkedRowsId = []
                                const rowCheckBoxes = document.querySelectorAll(".form-check-input")
                                if (document.querySelector(".myCheck").checked === true) {
                                    cashFlowArray.forEach((cashFlow) => {
                                        checkedRowsId.push(cashFlow._id);
                                    });
                                    for (let i = 0; i < rowCheckBoxes.length - 1; i++) {
                                        const rowCheckBox = rowCheckBoxes[i];
                                        rowCheckBox.checked = true
                                    }
                                    deleteModal.style.display = "block";
                                } else {
                                    checkedRowsId = []
                                    for (let i = 0; i < rowCheckBoxes.length - 1; i++) {
                                        const rowCheckBox = rowCheckBoxes[i];
                                        rowCheckBox.checked = false
                                    }
                                    deleteModal.style.display = "none";
                                }
                            });
                        }

                        //===================================================================================================

                        //DELETE OPERATIONS

                        // When the "Delete" button is clicked, delete the selected rows
                        confirmDeleteBtn.addEventListener('click', async () => {

                            //display the delte modal
                            deleteRowsModal.style.display = 'block'
                            document.querySelector('.deleteMsg').innerText = 'Do you want to delete ' + checkedRowsId.length + ' CashFlow(s)?'
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
                                    checkedRows = []
                                    try {
                                        fetch('/delete', {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                checkedRowsId
                                            })
                                        })
                                            .then(response => {
                                                return response.json()
                                            })
                                            .then(data => {
                                                if (data.amDeleted) {
                                                    notification("Deleted");
                                                    currentPage = 1
                                                    localStorage.setItem('advCurrentPage', currentPage)
                                                    if (document.querySelector(".myCheck").checked === true) {
                                                        document.querySelector(".myCheck").checked = false
                                                    }
                                                    location.href = "/advanceCashMngmnt"
                                                }
                                            })

                                    } catch (err) {
                                        console.error(err);
                                    }
                                }

                            })
                        })
                        //==================================================================================================
                        //FUNCTION TO CALL WHEN SAVING NEW RECORD
                        async function saveCashFlowRecord(itemsToProcess) {
                            //THEN LET THE SERVER STORE IT IN THE DATABASE
                            spinner.style.display = 'block'
                            fetch('/cashFlowData', { //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    itemsToProcess
                                }) // THE VARIABLES ARE STORED AS JOSON OBJECT, TRANSFEREABLE TO SERVER MODULE WHEN THE SERVER TAPS INTOR BODY-PARSER
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.isSaving === true) {
                                        let dbDocs = data.documents //array from db
                                        for (let i = 0; i < dbDocs.length; i++) {
                                            const doc = dbDocs[i];
                                            cashFlowArray.push(doc)

                                        }
                                        const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                        const eDate = localStorage.getItem('lastDate');
                                        const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                        const endDate = new Date(eDate);
                                        //get the data recored for that period selected
                                        let cashFlowsForThatDay = []
                                        for (let i = 0; i < cashFlowArray.length; i++) {
                                            const row = cashFlowArray[i];
                                            const expDate = row.CashFlowDate;
                                            const parts = expDate.split("/");
                                            const formattedDate =
                                                parts[1] + "/" + parts[0] + "/" + parts[2];
                                            const formattedDates2 = new Date(formattedDate);
                                            if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
                                                //STORE IN AN ARRAY 
                                                cashFlowsForThatDay.push(row)
                                            }
                                        }
                                        // else if (row.CashFlowType === 'Payout') {
                                        //  
                                        const itemsFromLS = localStorage.getItem('advItemsPerPage');
                                        if (itemsFromLS === null) {
                                            advItemsPerPage = 5
                                        }
                                        else if (itemsFromLS !== null) {
                                            advItemsPerPage = itemsFromLS
                                        }
                                        //get the current page from the local storage
                                        const currentPageFromLS = localStorage.getItem('expCurrentPage');
                                        if (currentPageFromLS === null) {
                                            currentPage = 1
                                        }
                                        else if (currentPageFromLS !== null) {
                                            currentPage = currentPageFromLS
                                        }
                                        if (cashFlowsForThatDay.length > advItemsPerPage) {
                                            currentPage = Math.ceil(cashFlowsForThatDay.length / advItemsPerPage)

                                        } else if (cashFlowsForThatDay.length < advItemsPerPage) {
                                            currentPage = 1
                                        }
                                        // localStorage.setItem('expCurrentPage', currentPage);
                                        defaultDisplayContent2(startDate, endDate);
                                        spinner.style.display = 'none';

                                    } else {
                                        // Error saving data
                                        console.error('Error saving data');
                                        spinner.style.display = 'none';
                                        displayContainerBlocks()
                                    }
                                })
                                .catch(error => console.error(error));
                        }
                        //============================================================================================
                        function insertCategoryRecord(categoryToDb) {
                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE CASH EQUIV STATUS NOT THE ENTIRE COLLECTION
                            fetch("/insertCategory", {
                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    categoryToDb,
                                }),
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    // Show alert
                                    if (data.isSaving === true) {
                                        let dbDocs = data.documents;
                                        for (let i = 0; i < dbDocs.length; i++) {
                                            const doc = dbDocs[i];
                                            if (doc.Balance === 'PayIn') {
                                                //cjheck if suspense already exisit
                                                if (doc.category.replace(/ /g, "_").toLowerCase() !== 'suspense') {
                                                    newIncomeCategories.push(doc); // Push only if category is not 'suspense'
                                                } else {
                                                    console.log('Document not added: category is "suspense".');
                                                }
                                            }
                                            else if (doc.Balance === 'PayOut') {
                                                //cjheck if suspense already exisit
                                                if (doc.category.replace(/ /g, "_").toLowerCase() !== 'suspense') {
                                                    newExpenseCategories.push(doc); // Push only if category is not 'suspense'
                                                } else {
                                                    console.log('Document not added: category is "suspense".');
                                                }
                                            }
                                        }
                                        // call the function that updates the table
                                        //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                                        const sDate =
                                            localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                        const eDate =
                                            localStorage.getItem("lastDate");
                                        const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                        const endDate = new Date(eDate);
                                        if (hasId === true) {
                                            defaultDisplayContent2(startDate, endDate)
                                        }
                                    }
                                })
                                .catch((error) => {
                                    console.error(`ErrorInserting`, error);
                                });
                        }

                        //=======================================================================================================
                        //CODE TO COMPARE THE DATES WITH THE ONE IN THE INCOME AND EXPENSES ARRAYS IF THEY MATCH COLLECT THE TOTAL COSTS PER DAY
                        const tablRows1 = document.querySelector('.tableBody');
                        //GET THE CURRENT DATE SO THAT WE CAN KNOW THE POSITION OF THE CURRENT MONTH
                        const d = new Date();
                        const currentMonth = d.getMonth() + 1; //MM
                        const currentYear = d.getFullYear(); //YY
                        //LOOP WITHIN THE WORLD CURRENCIES ARRAY SO THAT WE CAN ACCESS THE ISO CODE FOR THE BASE CURRENCY SELECTED
                        const baseCurrency = Array.from(newCurrencies).find(newCurrency => newCurrency.BASE_CURRENCY === 'Y');
                        for (let i = 0; i < WorldCurrencies.length; i++) {
                            const WorldCurrency = WorldCurrencies[i];

                            if ((WorldCurrency.Currency_Name).toLowerCase() === (baseCurrency.Currency_Name).toLowerCase()) {
                                isoCode = WorldCurrency.ISO_Code;
                                symbol = WorldCurrency.symbols;
                            }
                        }

                        //======================================================================================================
                        //DATE RANGE PICKER SCRIPT
                        const message = document.getElementById('Table_messages')
                        message.style.textAlign = 'center';
                        message.style.position = 'absolute';
                        message.style.top = "55%";
                        message.style.left = "50%";
                        message.style.transform = "translate(-50%, -50%)";
                        const overallContainer = document.querySelector('.dropdown');
                        const dateRangeHeaderRange = document.querySelector('.dropdown-menu');
                        const rangeDropdownOptions = document.querySelectorAll('.dropdown-item');
                        //CHECK IF THERE EXIST THE CURRENCY SELECTED
                        const checkCurrency = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === 'Y')
                        const checkSymbol = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (checkCurrency.Currency_Name).toLowerCase())
                        function defaultDisplayContent(startDate, endDate) {
                            cashFlowArray = []
                            openingBalance = 0
                            //GET THE L/S STORED STARTIND DATE AND THE END DATE
                            //GET THE L/S PAGE SIZE AND PAGE NUIMBER
                            pageSize = localStorage.getItem('advItemsPerPage');
                            if (pageSize === null) {
                                pageSize = 5
                            }
                            page = localStorage.getItem('advCurrentPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1

                            //check if the page is empty or if the painfilter is not empty and that we are in the filtering mode
                            if (page === null) {
                                page = 1
                            }

                            fetch('/defaultDisplayThePaginationWay', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    startDate: startDate,
                                    endDate: endDate,
                                    pageSize: pageSize,
                                    page: page,

                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    displayContainerBlocks()

                                    cashFlowArray = data.allCashFlows
                                    totalPages = data.totalPages2
                                    openingBalance = data.openingBalance
                                    // //THESE AREAS ARE NECCESSARY TO BE CLEARED OFF FIRST
                                    let lowerBound = 0
                                    let upperBound = 0
                                    let intervalLabel = [];
                                    let dateArray = []
                                    let currentInterval = ""


                                    const theDate1 = moment(startDate);//convert to the format dd/mm/yy using moment

                                    //format the final date like this ('DD/MM/YYYY') for each day;
                                    function getDateRangeLength(startDate, endDate) {
                                        const millisecondsPerDay = 1000 * 60 * 60 * 24;
                                        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
                                        const differenceInDays = Math.round(differenceInMilliseconds / millisecondsPerDay);
                                        return differenceInDays;
                                    }
                                    //WE WILL USE THIS TO GET THE INTERVAL LENTH
                                    const rangeLength = getDateRangeLength(startDate, endDate);

                                    const startYear = startDate.getFullYear();
                                    const endYear = endDate.getFullYear();
                                    const startMonth = startDate.getMonth();
                                    const endMonth = endDate.getMonth();
                                    function getMonthRangeLength() {
                                        const differenceInMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
                                        return differenceInMonths;
                                    }
                                    const monthRangeLength = getMonthRangeLength(startDate, endDate);

                                    function getYearlyRangeLength() {
                                        const differenceInYears = (endYear - startYear);
                                        return differenceInYears;
                                    }
                                    const yearRangeLength = getYearlyRangeLength(startDate, endDate);

                                    //Hourly CHECK
                                    if (rangeLength <= 1) {
                                        currentInterval = "Hourly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        for (let k = 0; k < 24; k++) {
                                            intervalLabel.push(`${k}:00`);
                                            //create the full date for use in the table
                                            const currentDate = moment(startDate).add(0, 'days');
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = 24

                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    //Daily CHECK
                                    if (rangeLength > 1 && rangeLength <= 31) {
                                        currentInterval = "Daily"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;

                                        for (let k = 0; k < rangeLength; k++) {
                                            const currentDate = moment(startDate).add(k, 'days');
                                            const theMonth = currentDate.format('MMM');
                                            const theDate = currentDate.format('DD') + ' ' + theMonth;
                                            //this will contain the label for daily chart
                                            intervalLabel.push(theDate);
                                            //create the full date for use in the table
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                            lowerBound = 0
                                            upperBound = dateArray.length

                                        }
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }
                                    //WEEKLEY CHECK
                                    if (rangeLength > 31 && rangeLength <= 90) {

                                        currentInterval = "Weekly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        for (let k = 0; k <= rangeLength; k++) {

                                            if (k + 6 > rangeLength) {
                                                // THE FIRST DAY OF THE CURRENT WEEK
                                                const currentDate1 = moment(startDate).add(k, 'days');
                                                const theMonth1 = currentDate1.format('MMM');
                                                const theDate1 = currentDate1.format('DD') + ' ' + theMonth1;
                                                const myDate = currentDate1.format('DD/MM/YYYY');
                                                dateArray.push(myDate);

                                                // THE last DAY OF THE CURRENT WEEK
                                                //if the last day of the week is going to go out of range, use the end date
                                                const currentDate2 = moment(endDate).add(0, 'days');
                                                const theMonth2 = currentDate2.format('MMM');
                                                const theDate2 = currentDate2.format('DD') + '' + theMonth2;
                                                const W = theDate1 + "-" + theDate2;
                                                intervalLabel.push(W);
                                                break

                                            } else if (k + 6 < rangeLength) {
                                                // THE FIRST DAY OF THE CURRENT WEEK
                                                const currentDate1 = moment(startDate).add(k, 'days');
                                                const theMonth1 = currentDate1.format('MMM');
                                                const theDate1 = currentDate1.format('DD') + ' ' + theMonth1;
                                                const myDate = currentDate1.format('DD/MM/YYYY');
                                                dateArray.push(myDate);


                                                // THE last DAY OF THE CURRENT WEEK
                                                //if the last day of the week is going to go out of range, use the end date
                                                const currentDate2 = moment(startDate).add(k + 6, 'days');
                                                const theMonth2 = currentDate2.format('MMM');
                                                const theDate2 = currentDate2.format('DD') + '' + theMonth2;
                                                // alert("UP TO = " + theDate2)
                                                const W = theDate1 + "-" + theDate2
                                                intervalLabel.push(W);
                                                k = k + 6 //WE WANT TO LOOP FOR Weekly STAGES
                                            }
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }

                                    //Monthly CHECK
                                    if (rangeLength > 90 && rangeLength <= 365) { //WHEN THERE IS A PERIOD THAT HAS MORE THAN THREE MONTHS, THEN
                                        currentInterval = "Monthly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            // intervalLabel.push(`${theMonth}`);
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(currentMonth);
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = intervalLabel.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }

                                    //Quarterly CHECK
                                    if (rangeLength > 365 && rangeLength <= 730) {
                                        currentInterval = "Quarterly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval) //WE WILL NOT BE ABLE TO DISPLAY Quarterly GRAPH ON CONDITION THAT THE USER HAS GENERATED A RANGE MORE THAN A YEAR
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            //GET THE FIRST MONTH OF THE QUARTER
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //GET THE LAST MONTH OF THE QUARTER
                                            const currentDate1 = moment(startDate).add(k + 2, 'month');
                                            const currentMonth1 = currentDate1.format('MMM');
                                            const W = "(" + currentMonth + "-" + currentMonth1 + ") " + currentDate1.format('YYYY')

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(W);
                                            dateArray.push(myDate)
                                            k = k + 2
                                        }
                                        lowerBound = 0
                                        upperBound = intervalLabel.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }
                                    //Half Yearly CHECK
                                    if (rangeLength > 730 && rangeLength <= 3287) {
                                        currentInterval = "Half Yearly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval) //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            //GET THE FIRST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //GET THE LAST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate1 = moment(startDate).add(k + 5, 'month');
                                            const currentMonth1 = currentDate1.format('MMM');
                                            const W = "(" + currentMonth + "-" + currentMonth1 + ") " + currentDate1.format('YYYY')

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(W);
                                            dateArray.push(myDate)
                                            k = k + 5
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }
                                    //YEARLY CHECK
                                    if (rangeLength > 3287) {

                                        currentInterval = "Yearly"
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        for (let k = 0; k <= yearRangeLength; k++) {
                                            //WHEN CALCULATING THE YEALY REPORTS, WE WANT THE CORRECT YEAR,
                                            //IF THE USER IS GENERATING THE YEARLY REPORT FROM 3 APRIL 2021, A FULL YEAR ENDS ON 3 APRIL THE END DATE.
                                            //GET THE FIRST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate = moment(startDate).add(k, 'year');
                                            const currentYear = currentDate.format('YYYY');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(currentYear);
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)

                                    }

                                })
                        }


                        //FUNCTION TO CREATE THE DEFAULT CHART BASED ON WHAT RANGE THE USER HAS
                        function createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate) {
                            let formattedValue = null
                            let totalIncomeArray = [];
                            let totalExpenseArray = [];
                            let totalExpensesPerRange = 0;
                            let totalIncomePerRange = 0;
                            let cashBalance = 0
                            let sign = null
                            dataArray = []
                            //HERE, REMOVE ROWS FIRST EVERYTIME THIS FUNCTION IS CALLED
                            const allTableRows = document.querySelectorAll('.shiftRows') //GET ALL ROWS IN THE TABLE 
                            for (let t = 0; t < allTableRows.length; t++) {
                                const rows = allTableRows[t];
                                rows.style.display = 'none'//REMOVE EACH ROW AS WE LOOP
                            }

                            //GET THE INTERVAL
                            rangeDropdownOptions.forEach(option => {
                                if (option.innerText === currentInterval) {
                                    //set the innertext of the graph interval to the current interval
                                    document.querySelector('.rangeInterval').innerText = currentInterval;
                                    for (let b = lowerBound; b < upperBound; b++) {
                                        //CALCULATION OF TOTAL INCOME PER EACH INTERVAL AND PER RANGE
                                        //FOR EACH INTERVAL, ZERORISE THE INCOMES & EXPENSE TOTALS
                                        let totalIncomePerInterval = 0
                                        let totalExpensesPerInterval = 0
                                        let tableIntervalLabel = ""
                                        let intervalRowCheck = false

                                        const currentDate = dateArray[b] //this is important to have a formated date array for use in the table
                                        // alert(b + " " + currentDate + " upper bound is " + upperBound)
                                        const parts1 = currentDate.split("/");
                                        const currentDate1 = parts1[1] + "/" + parts1[0] + "/" + parts1[2];
                                        const currentDate2 = new Date(currentDate1);
                                        const currentDate3 = moment(currentDate2).add(0, 'days');
                                        const currentMonth = currentDate3.format('MMM');
                                        const currentYear = currentDate3.format('YYYY');
                                        // const currentDate3 = moment(currentDate2).add(0, 'days');
                                        //GET THE INCOMES DATA POINTS FOR EACH INTERVAL
                                        const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
                                        const endIndex = startIndex + parseInt(pageSize);
                                        // cashFlowArray = cashFlowArray.slice(startIndex, endIndex);
                                        for (let i = 0; i < cashFlowArray.length; i++) {
                                            if (cashFlowArray[i].CashFlowType === 'Pay in') {
                                                const date = cashFlowArray[i].CashFlowDate
                                                const parts = date.split("/");
                                                const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                const incomeDate2 = new Date(formattedDate);
                                                const date2 = moment(incomeDate2).add(0, 'days');
                                                const theMonth = date2.format('MMM');
                                                const theYear = date2.format('YYYY');//
                                                //CHECK IF THE DATA TO BE COLLECTED FALLS WITHIN THE EXPECTED RANGE
                                                if (startDate.getTime() <= incomeDate2.getTime() && incomeDate2.getTime() <= endDate.getTime()) {//CHECKING IF THE CURRENT DATA POINT IS WITHIN THE RANGE
                                                    let ldp //this is a looping data point
                                                    let sdp //this is the saved data point to be compared with
                                                    if (currentInterval === "Hourly") {
                                                        ldp = b
                                                        const hexNumber = parseInt(cashFlowArray[i]._id.substring(0, 8), 16)//convert to hex number
                                                        const currentDate2 = new Date(hexNumber * 1000)//multiply by 1000 toz
                                                        sdp = currentDate2.getHours(); //get the current hour
                                                        tableIntervalLabel = `${b}:00`
                                                    }

                                                    if (currentInterval === "Daily") {
                                                        ldp = currentDate2.getTime();
                                                        sdp = incomeDate2.getTime();
                                                        tableIntervalLabel = dateArray[b]
                                                    }
                                                    if (currentInterval === "Weekly") {
                                                        const pWkStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pWkStartingDateCurrentDate3).add(6, 'days'); // or maybe we are adding 10
                                                        const currentMonth = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pHy
                                                        const pWkStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pWkStartingDateParts = pWkStartingDate.split("/");
                                                        const pWkStartingDateCurrentDate1 = pWkStartingDateParts[1] + "/" + pWkStartingDateParts[0] + "/" + pWkStartingDateParts[2];
                                                        const pWkStartingDateCurrentDate2 = new Date(pWkStartingDateCurrentDate1);
                                                        if (incomeDate2.getTime() >= currentDate2.getTime() && incomeDate2.getTime() < pWkStartingDateCurrentDate2.getTime()) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Monthly") {
                                                        ldp = currentMonth;
                                                        sdp = theMonth;
                                                        tableIntervalLabel = ldp
                                                    }
                                                    if (currentInterval === "Quarterly") {
                                                        const pQtStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pQtStartingDateCurrentDate3).add(3, 'month'); //
                                                        const currentMonth = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pHQ
                                                        const pQtStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pQtStartingDateParts = pQtStartingDate.split("/");
                                                        const pQtStartingDateCurrentDate1 = pQtStartingDateParts[1] + "/" + pQtStartingDateParts[0] + "/" + pQtStartingDateParts[2];
                                                        const pQtStartingDateCurrentDate2 = new Date(pQtStartingDateCurrentDate1);
                                                        if (incomeDate2.getTime() >= currentDate2.getTime() && incomeDate2.getTime() < pQtStartingDateCurrentDate2.getTime()) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Half Yearly") {
                                                        const pHyStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pHyStartingDateCurrentDate3).add(6, 'month'); // or maybe we are adding 10
                                                        const currentMonth = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pHy
                                                        const pHyStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pHyStartingDateParts = pHyStartingDate.split("/");
                                                        const pHyStartingDateCurrentDate1 = pHyStartingDateParts[1] + "/" + pHyStartingDateParts[0] + "/" + pHyStartingDateParts[2];
                                                        const pHyStartingDateCurrentDate2 = new Date(pHyStartingDateCurrentDate1);

                                                        if (incomeDate2.getTime() >= currentDate2.getTime() && incomeDate2.getTime() < pHyStartingDateCurrentDate2.getTime()) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Yearly") {
                                                        if (currentYear === theYear) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    //THIS WILL CALCULATE ACCORDING TO EACH INTERVAL PREFERED OR IMPLIED, THE TOTAL INCOME
                                                    if (ldp === sdp) {
                                                        // alert(b + "We have found a matching case at " + dateArray[b] + "investigated with " + incomeDate2 + "The Data Point has PayIn of " + cashFlowArray[i].CashFlowCashEquiv)
                                                        intervalRowCheck = true
                                                        totalIncomePerInterval += parseFloat(cashFlowArray[i].CashFlowCashEquiv);
                                                    }
                                                }

                                            }


                                            //CALCULATION OF TOTAL EXPENSES PER EACH INTERVAL AND PER RANGE
                                            //GET THE EXPENSES DATA POINTS FOR EACH INTERVAL
                                            else if (cashFlowArray[i].CashFlowType === 'Payout') {
                                                const date = cashFlowArray[i].CashFlowDate
                                                const parts = date.split("/");
                                                const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                const expenseDate2 = new Date(formattedDate);
                                                const date2 = moment(expenseDate2).add(0, 'days');
                                                const theMonth = date2.format('MMM');
                                                const theYear = date2.format('YYYY');//
                                                //CHECK IF THE DATA TO BE COLLECTED FALLS WITHIN THE DATA POINT
                                                if (startDate.getTime() <= expenseDate2.getTime() && expenseDate2.getTime() <= endDate.getTime()) {
                                                    let ldp //this is a looping data point
                                                    let sdp //this is the saved data point to be compared with
                                                    if (currentInterval === "Hourly") {
                                                        ldp = b
                                                        const hexNumber = parseInt(cashFlowArray[i]._id.substring(0, 8), 16)//convert to hex number
                                                        const currentDate2 = new Date(hexNumber * 1000)//multiply by 1000 toz
                                                        sdp = currentDate2.getHours(); //get the current hour
                                                        tableIntervalLabel = `${b}:00`
                                                    }

                                                    if (currentInterval === "Daily") {
                                                        ldp = currentDate2.getTime();
                                                        sdp = expenseDate2.getTime();
                                                        tableIntervalLabel = dateArray[b]
                                                    }
                                                    if (currentInterval === "Weekly") {
                                                        const pWkStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pWkStartingDateCurrentDate3).add(6, 'days'); // or maybe we are adding 10
                                                        const currentMonth = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pHy
                                                        const pWkStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pWkStartingDateParts = pWkStartingDate.split("/");
                                                        const pWkStartingDateCurrentDate1 = pWkStartingDateParts[1] + "/" + pWkStartingDateParts[0] + "/" + pWkStartingDateParts[2];
                                                        const pWkStartingDateCurrentDate2 = new Date(pWkStartingDateCurrentDate1);
                                                        if (expenseDate2.getTime() >= currentDate2.getTime() && expenseDate2.getTime() < pWkStartingDateCurrentDate2.getTime()) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Monthly") {
                                                        ldp = currentMonth;
                                                        sdp = theMonth;
                                                        tableIntervalLabel = ldp
                                                    }
                                                    if (currentInterval === "Quarterly") {
                                                        const pQtStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pQtStartingDateCurrentDate3).add(3, 'month'); // or maybe we are adding 10
                                                        const currentMonth2 = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pQt
                                                        const pQtStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pQtStartingDateParts = pQtStartingDate.split("/");
                                                        const pQtStartingDateCurrentDate1 = pQtStartingDateParts[1] + "/" + pQtStartingDateParts[0] + "/" + pQtStartingDateParts[2];
                                                        const pQtStartingDateCurrentDate2 = new Date(pQtStartingDateCurrentDate1);
                                                        if (expenseDate2.getTime() >= currentDate2.getTime() && expenseDate2.getTime() < pQtStartingDateCurrentDate2.getTime() && currentYear === theYear) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Half Yearly") {
                                                        const pHyStartingDateCurrentDate3 = new Date(currentDate1);
                                                        const currentDate3 = moment(pHyStartingDateCurrentDate3).add(6, 'month'); // or maybe we are adding 10
                                                        const currentMonth2 = currentDate3.format('MMM');
                                                        //ESTIMATE THE NEXT pHy
                                                        const pHyStartingDate = currentDate3.format('DD/MM/YYYY');
                                                        const pHyStartingDateParts = pHyStartingDate.split("/");
                                                        const pHyStartingDateCurrentDate1 = pHyStartingDateParts[1] + "/" + pHyStartingDateParts[0] + "/" + pHyStartingDateParts[2];
                                                        const pHyStartingDateCurrentDate2 = new Date(pHyStartingDateCurrentDate1);
                                                        if (expenseDate2.getTime() >= currentDate2.getTime() && expenseDate2.getTime() < pHyStartingDateCurrentDate2.getTime()) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }
                                                    if (currentInterval === "Yearly") {
                                                        if (currentYear === theYear) {
                                                            ldp = 0
                                                            sdp = 0
                                                            tableIntervalLabel = intervalLabel[b]
                                                        } else {
                                                            ldp = 0
                                                            sdp = 1
                                                        }
                                                    }

                                                    //THIS WILL CALCULATE ACCORDING TO EACH INTERVAL PREFERED OR IMPLIED, THE TOTAL EXPENSES
                                                    if (ldp === sdp) {
                                                        intervalRowCheck = true
                                                        // alert(b + ":00hrs, matching case at " + dateArray[b] + "investigated with " + date + "The Data Point has PayOut of " + cashFlowArray[i].CashFlowCashEquiv + " The staring date " + startDate + " and the end date is " + endDate)
                                                        totalExpensesPerInterval += parseFloat(cashFlowArray[i].CashFlowCashEquiv);
                                                    }
                                                }
                                            }
                                        }
                                        //EACH INTERVALS'S INCOME TOTALS WILL BE PUT IN AN ARRAY
                                        totalIncomeArray.push(totalIncomePerInterval)
                                        //UPDATE TOTALS PER RANGE GENERATED FROM LOWER BOUND TO UPPER BOUND
                                        totalIncomePerRange = parseFloat(totalIncomePerRange) + parseFloat(totalIncomePerInterval)
                                        //EACH INTERVALS'S EXPENSE TOTALS WILL BE PUT IN AN ARRAY
                                        totalExpenseArray.push(totalExpensesPerInterval)
                                        //UPDATE TOTALS PER RANGE GENERATED FROM LOWER BOUND TO UPPER BOUND
                                        totalExpensesPerRange = parseFloat(totalExpensesPerRange) + parseFloat(totalExpensesPerInterval)
                                        //NOW THAT WE HAVE AN UPDATED TOTAL INCOME & EXPENSES PER RANGE, GET THE CURRENCY SYMBOL
                                        //CHECK IF THERE EXIST THE CURRENCY SELECTED
                                        if (checkSymbol) {
                                            isoCode = checkSymbol.ISO_Code //E.G USD
                                            symbol = checkSymbol.symbols // EG $
                                        }
                                        //CALCULATE THE BALANCE PER EACH INTERVAL
                                        let rowBalance = totalIncomePerInterval - totalExpensesPerInterval
                                        //ON SETTINGS THERE WILL BE A SETTING TO EITHER USE A SYMBOL PREFIX OR AN ISO_CODE PREFIX
                                        if (rowBalance < 0) {//if the number is negative
                                            const numberString = rowBalance.toString();//convert to string so that you can use the split method
                                            formattedValue = numberString.split('-')[1]
                                            sign = -1
                                            const updatedValue = '-' + isoCode + '   ' + Number(formattedValue).toFixed(2)
                                            rowBalance = updatedValue;
                                        }
                                        else if (rowBalance >= 0) {
                                            // document.querySelector('.CashBalance').style.color = 'black';
                                            // rowBalance = symbol + ' ' + Number(rowBalance).toFixed(2)
                                            rowBalance = isoCode + ' ' + Number(rowBalance).toFixed(2)
                                        }
                                        //Update THE RANGE TOTALS

                                        document.querySelector('.totalIncome').innerText = Number(totalIncomePerRange).toFixed(2)
                                        document.querySelector('.totalExpenses').innerText = Number(totalExpensesPerRange).toFixed(2)
                                        //CALCULATE THE BALANCE PER EACH RANGE
                                        cashBalance = Number((parseFloat(totalIncomePerRange) + parseFloat(openingBalance)) - totalExpensesPerRange
                                        ).toFixed(2);
                                        if (cashBalance < 0) {//if the number is negative
                                            const numberString = cashBalance.toString();//convert to string so that you can use the split method
                                            formattedValue = numberString.split('-')[1]
                                            sign = -1
                                            document.querySelector('.CashBalance').style.color = 'red';
                                            // const updatedValue = '-' + symbol + '   ' + formattedValue
                                            const updatedValue = '-' + isoCode + '   ' + formattedValue
                                            // alert(updatedValue)
                                            document.querySelector('.CashBalance').innerText = updatedValue;
                                        }
                                        else if (cashBalance >= 0) {
                                            document.querySelector('.CashBalance').style.color = 'black';
                                            // document.querySelector('.CashBalance').innerText = symbol + ' ' + cashBalance
                                            document.querySelector('.CashBalance').innerText = isoCode + ' ' + cashBalance
                                        }
                                        if (openingBalance < 0) {
                                            //if the number is negative
                                            const numberString = openingBalance.toString(); //convert to string so that you can use the split method
                                            formattedValue = numberString.split("-")[1];
                                            sign = -1;
                                            if (sign === -1) {
                                                const updatedValue =
                                                    "-" + ' ' +
                                                    isoCode +
                                                    Number(formattedValue).toFixed(2);
                                                // alert(baseCurrCode)
                                                document.querySelector(".openingBalance").innerText =
                                                    updatedValue;
                                                document.querySelector(
                                                    ".openingBalance"
                                                ).style.color = "red";
                                            }
                                        } else if (openingBalance >= 0) {
                                            document.querySelector(
                                                ".openingBalance"
                                            ).style.color = "black";
                                            document.querySelector(".openingBalance").innerText =
                                                isoCode +
                                                "    " +
                                                Number(openingBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                        }
                                        //THEN CREATE THE TABLE, on condition that there is something to add to it
                                        if (intervalRowCheck === true) {
                                            const myRow = document.createElement("tr");
                                            // const myRow = tablRows1.insertRow();
                                            myRow.classList.add('shiftRows')
                                            const rowText = `
                                                        <td>
                                                            <input type="checkbox" class="form-check-input" name="" value="checkedValue">
                                                        </td>

                                                        <td>
                                                            <span class="date-cell">${tableIntervalLabel}</span>
                                                        </td>

                                                        <td>
                                                            <span class="total-sales">${isoCode}  ${totalIncomePerInterval.toFixed(2)}</span>
                                                        </td>

                                                        <td>
                                                            <span class="total-expenses">${isoCode} ${totalExpensesPerInterval.toFixed(2)}</span>
                                                        </td>

                                                        <td>
                                                            <span class="profit">${rowBalance}</span>
                                                        </td>`

                                            myRow.innerHTML = rowText;
                                            dataArray.push(myRow)
                                            tablRows1.appendChild(myRow)
                                            document.querySelector('.footer').style.display = 'block'
                                            //UPDATE THE PAGINATION STATUS DATA 
                                            document.querySelector('.spanText').innerText = page;
                                            totalPages = Math.ceil(dataArray.length / pageSize);
                                            const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
                                            const endIndex = startIndex + parseInt(pageSize);
                                            document.querySelector('.spanText1').innerText = totalPages;
                                            document.querySelector('.rowsPerPage').innerText = pageSize;
                                            for (let i = 0; i < dataArray.length; i++) {
                                                if (startIndex <= i && i < endIndex) {
                                                    dataArray[i].style.display = 'table-row';
                                                } else {
                                                    dataArray[i].style.display = 'none';
                                                }
                                            }
                                        }
                                    }
                                    //set the required vdetails in local storage
                                    localStorage.setItem('totalExpenseArray', JSON.stringify(totalExpenseArray));
                                    localStorage.setItem('totalIncomeArray', JSON.stringify(totalIncomeArray));
                                    localStorage.setItem('intervalLabel', JSON.stringify(intervalLabel));
                                    //CREATE DESIRED CHART BASED ON THE LOCAL STORAGE CHOICES
                                    //get the area choice in the local storage
                                    const displayGraph = localStorage.getItem('displayGraph')
                                    let areaSpan = document.querySelector('.areaSpan')
                                    //by default lets display the line graph
                                    if (displayGraph === 'Line' || displayGraph === null) {
                                        // alert('null')
                                        areaSpan.innerText = 'Line'
                                        document.querySelector('.lineGraphContainer').style.display = 'block'
                                        document.querySelector('.barGraphContainer').style.display = 'none'
                                        document.querySelector('.pieChartContainer').style.display = 'none'
                                        createLineGraph(totalExpenseArray, totalIncomeArray, intervalLabel)
                                    }
                                    else if (displayGraph === 'Pie') {
                                        areaSpan.innerText = displayGraph
                                        document.querySelector('.lineGraphContainer').style.display = 'none'
                                        document.querySelector('.barGraphContainer').style.display = 'none'
                                        document.querySelector('.pieChartContainer').style.display = 'block'
                                        createPieChart(totalExpenseArray, totalIncomeArray)
                                    }
                                    else if (displayGraph === 'Bar') {
                                        areaSpan.innerText = displayGraph
                                        document.querySelector('.lineGraphContainer').style.display = 'none'
                                        document.querySelector('.barGraphContainer').style.display = 'block'
                                        document.querySelector('.pieChartContainer').style.display = 'none'
                                        createBarGraph(totalExpenseArray, totalIncomeArray, intervalLabel)
                                    }
                                    //if the totals are equal to 0 of the generated range.dispay message that there is no items t display
                                    if (Number(totalIncomePerRange) === 0 && Number(totalExpensesPerRange) === 0) {

                                        //display message
                                        document.getElementById('Table_messages').style.display = 'block'
                                        document.querySelector('.noDataText').innerText = 'No Data To Display'
                                        document.querySelector('.noDataText2').innerText = 'There are no cashflows in the selected time period'
                                    }
                                    else {
                                        document.getElementById('Table_messages').style.display = 'none'
                                        //  document.getElementById('noDataMessage').style.display = 'none'

                                    }
                                }
                            });
                        }
                        //=======================================================================================================
                        //event listeners on the area dropdown items
                        const areaItems = document.querySelectorAll('.areaItemList'); // get shift table rows
                        let areaSpan = document.querySelector('.areaSpan')

                        areaItems.forEach((item, i) => {
                            item.addEventListener("click", (event) => {
                                event.preventDefault()
                                const totalExpenseArray = JSON.parse(localStorage.getItem('totalExpenseArray'));
                                const totalIncomeArray = JSON.parse(localStorage.getItem('totalIncomeArray'));
                                const intervalLabel = JSON.parse(localStorage.getItem('intervalLabel'))
                                if (document.querySelector(`#areaOptionId${i}`).innerText === 'Line') {
                                    areaSpan.innerText = 'Line'
                                    //set to local storage
                                    localStorage.setItem('displayGraph', areaSpan.innerText)
                                    document.querySelector('.lineGraphContainer').style.display = 'block'
                                    document.querySelector('.barGraphContainer').style.display = 'none'
                                    document.querySelector('.pieChartContainer').style.display = 'none'
                                    document.getElementById('noDataMessage').style.display = 'none';

                                    createLineGraph(totalExpenseArray, totalIncomeArray, intervalLabel)
                                }
                                else if (document.querySelector(`#areaOptionId${i}`).innerText === 'Bar') {
                                    areaSpan.innerText = 'Bar'
                                    //set to local storage
                                    localStorage.setItem('displayGraph', areaSpan.innerText)
                                    document.querySelector('.lineGraphContainer').style.display = 'none'
                                    document.querySelector('.barGraphContainer').style.display = 'block'
                                    document.querySelector('.pieChartContainer').style.display = 'none'
                                    document.getElementById('noDataMessage').style.display = 'none';

                                    createBarGraph(totalExpenseArray, totalIncomeArray, intervalLabel)
                                }
                                else if (document.querySelector(`#areaOptionId${i}`).innerText === 'Pie') {
                                    areaSpan.innerText = 'Pie'
                                    //set to local storage
                                    localStorage.setItem('displayGraph', areaSpan.innerText)
                                    document.querySelector('.lineGraphContainer').style.display = 'none'
                                    document.querySelector('.barGraphContainer').style.display = 'none'
                                    document.querySelector('.pieChartContainer').style.display = 'block'
                                    document.getElementById('noDataMessage').style.display = 'none';

                                    createPieChart(totalExpenseArray, totalIncomeArray)
                                }
                            })
                        });
                        //=======================================================================================================

                        function createLineGraph(totalExpenseArray, totalIncomeArray, intervalLabel) { //REPLACE A NEW AND UPDATED ONE
                            const canvas = document.getElementById('myLineGraph');
                            //DESTROY ANY EXISTING CHART 
                            const existingChart = Chart.getChart(canvas);
                            if (existingChart) {
                                existingChart.destroy();
                            } new Chart(canvas, {
                                type: 'line',
                                data: {
                                    labels: intervalLabel,
                                    datasets: [{
                                        label: 'PayOut',
                                        data: totalExpenseArray,
                                        borderColor: 'red',
                                        borderWidth: 3,
                                        backgroundColor: 'rgba(255, 0, 0, 0.2)', // set fill color with alpha value
                                        lineTension: 0.4,
                                        radius: 2,
                                        fill: 'origin', // fill area below the line graph
                                    },
                                    {
                                        label: 'PayIn',
                                        data: totalIncomeArray,
                                        borderColor: 'blue',
                                        backgroundColor: 'rgba(0, 0, 255, 0.2)', // set fill color with alpha value
                                        lineTension: 0.4,
                                        radius: 2,
                                        borderWidth: 3,
                                        fill: 'origin', // fill area below the line graph
                                    }]
                                },
                                options: myStyle
                            })
                        }
                        function createPieChart(totalExpenseArray, totalIncomeArray) {
                            const canvas = document.getElementById('myPieChart');
                            canvas.style.marginLeft = '31%'
                            canvas.style.paddingTop = '2%'

                            const existingChart = Chart.getChart(canvas);
                            if (existingChart) {
                                existingChart.destroy();
                            }
                            // Calculate total values for the pie chart
                            const totalExpense = totalExpenseArray.reduce((a, b) => a + b, 0);
                            const totalIncome = totalIncomeArray.reduce((a, b) => a + b, 0);
                            const totalValues = [totalExpense, totalIncome];
                            // Check if all amounts are zero
                            const allZero = totalValues.every(value => value === 0);
                            const messageDiv = document.getElementById('noDataMessage');

                            if (allZero) {
                                // Display a message instead of a chart
                                canvas.style.display = 'none'; // Hide the canvas
                                messageDiv.style.display = 'block'; // Show a message
                                messageDiv.innerText = 'No data available to display.';
                                return; // Exit the function
                            }
                            else {
                                canvas.style.display = 'block'; // show the canvas
                                messageDiv.style.display = 'none'; // Show a message
                                new Chart(canvas, {
                                    type: 'pie', // Change type to 'pie'
                                    data: {
                                        labels: ['PayOut', 'PayIn'], // Labels for the pie chart
                                        datasets: [{
                                            data: totalValues, // Use the calculated total values
                                            backgroundColor: ['rgba(255, 0, 0, 0.6)', 'rgba(0, 0, 255, 0.6)'], // Colors for each segment
                                            borderColor: ['rgba(255, 0, 0, 1)', 'rgba(0, 0, 255, 1)'], // Border colors for each segment
                                            borderWidth: 2
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (tooltipItem) {
                                                        return symbol + tooltipItem.raw; // Add dollar symbol to the tooltip to display an amount with dollar sign on hovering
                                                    }
                                                }
                                            }
                                        },
                                        animation: {
                                            animateRotate: true, // Enable rotation animation
                                            animateScale: true // Enable scale animation
                                        },
                                    }
                                });
                            }
                        }


                        function createBarGraph(totalExpenseArray, totalIncomeArray, intervalLabel) {
                            const canvas = document.getElementById('myBarGraph');
                            const existingChart = Chart.getChart(canvas);
                            if (existingChart) {
                                existingChart.destroy();
                            }
                            // Check if all amounts are zero
                            const allZero = totalExpenseArray.every(expense => Number(expense) === 0) && totalIncomeArray.every(income => Number(income) === 0);
                            new Chart(canvas, {
                                type: 'bar', // Change type to 'bar'
                                data: {
                                    labels: intervalLabel, // X-axis labels
                                    datasets: [{
                                        label: 'PayOut',
                                        data: totalExpenseArray,
                                        backgroundColor: 'rgba(255, 0, 0, 0.6)', // Bar color for PayOut
                                        borderColor: 'rgba(255, 0, 0, 1)', // Border color for PayOut
                                        borderWidth: 2,
                                        borderRadius: 1 // Rounded corners for bars
                                    },
                                    {
                                        label: 'PayIn',
                                        data: totalIncomeArray,
                                        backgroundColor: 'rgba(0, 0, 255, 0.6)', // Bar color for PayIn
                                        borderColor: 'rgba(0, 0, 255, 1)', // Border color for PayIn
                                        borderWidth: 2,
                                        borderRadius: 1 // Rounded corners for bars
                                    }]
                                },
                                options: {
                                    responsive: true, // Prevent automatic resizing
                                    maintainAspectRatio: false, // Keep aspect ratio if needed
                                    scales: {
                                        y: {
                                            title: {
                                                display: true,
                                            },
                                            grid: {
                                                display: true // show horizontal grid lines
                                            },
                                            ticks: {
                                                beginAtZero: true, // Start Y-axis at zero
                                                // Include a dollar sign in the ticks
                                                callback: function (value, index, ticks) {
                                                    return symbol + value;
                                                },
                                                stepSize: 200,
                                            },

                                        },
                                        x: {
                                            title: {
                                                display: true,
                                            },
                                            grid: {
                                                display: false // Hide vertical grid lines
                                            }
                                        }
                                    },

                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                boxWidth: 30,
                                            }
                                        },

                                        tooltip: {
                                            callbacks: {
                                                label: function (tooltipItem) {
                                                    return symbol + tooltipItem.raw; // Add dollar symbol to the tooltip to display an amount with dollar sign on hovering
                                                }
                                            }
                                        }
                                    },
                                }
                            });
                            // If all amounts are zero, add a horizontal line at y=0
                            if (allZero) {
                                options.scales.y.grid.lines = {
                                    color: 'black',
                                    lineWidth: 1,
                                    drawBorder: false,
                                    zeroLineColor: 'black',
                                    zeroLineWidth: 1,
                                    zeroLineDash: [2, 2] // Optional: make it dashed
                                };
                            }

                        }
                        //===========================================================================================
                        //DATE RANGE PICKER FUNCTION
                        initializeDateRangePicker()
                        function initializeDateRangePicker() {

                            //call this function based on which mode we are
                            const editMode = localStorage.getItem('editMode')
                            if (editMode !== null) {
                                const sDate = localStorage.getItem('firstDate');
                                const eDate = localStorage.getItem('lastDate');
                                startDate = new Date(sDate)
                                endDate = new Date(eDate)
                                defaultDisplayContent2(startDate, endDate)

                            }
                            else if (editMode === null) {

                                localStorage.removeItem('advCurrentPage')
                                //OPEN DROPDOWN ONCE THE SELECT INTERVAL IS CLICKED
                                overallContainer.addEventListener('click', (event) => {
                                    event.preventDefault();

                                    //CHANGE COLLOURS ACCORDING TO THE CURRENT SELECTED RANGE
                                    //FIND THE LENTH OF THE CURRENT GENERATED RANGE
                                    const sDate = localStorage.getItem('firstDate');
                                    const eDate = localStorage.getItem('lastDate');
                                    if (sDate === null && eDate === null) {
                                        //IF THERE IS NO DATE IN THE LOCAL STORAGE, SET THE RANGE FROM THE FIRST (startDate) DAY TO NOW(endDate)
                                        for (let i = 1; i < currentDay + 1; i++) {
                                            const date = new Date(currYear, currMonth, i);
                                            if (i === 1) {
                                                startDate = date;
                                            }
                                            else {
                                                endDate = date;
                                            }
                                        }
                                        localStorage.setItem('firstDate', startDate);
                                        localStorage.setItem('lastDate', endDate);

                                    } else {
                                        startDate = new Date(sDate)
                                        endDate = new Date(eDate)
                                    }

                                    //WE WILL USE THIS TO GET THE INTERVAL LENTH IN DAYS
                                    function getDateRangeLength(startDate, endDate) {
                                        const millisecondsPerDay = 1000 * 60 * 60 * 24;
                                        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
                                        const differenceInDays = Math.round(differenceInMilliseconds / millisecondsPerDay);
                                        return differenceInDays;
                                    }
                                    const rangeLength = getDateRangeLength(startDate, endDate);

                                    document.getElementById('intervalOptionID0').style.color = "grey";
                                    document.getElementById('intervalOptionID1').style.color = "grey";
                                    document.getElementById('intervalOptionID2').style.color = "grey";
                                    document.getElementById('intervalOptionID3').style.color = "grey";
                                    document.getElementById('intervalOptionID4').style.color = "grey";
                                    document.getElementById('intervalOptionID5').style.color = "grey";
                                    document.getElementById('intervalOptionID6').style.color = "grey";
                                    let intervalArray = []

                                    if (rangeLength <= 1) {
                                        document.getElementById('intervalOptionID0').style.color = "black";
                                        intervalArray.push("Hourly")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength > 1 && rangeLength <= 31) {
                                        document.getElementById('intervalOptionID1').style.color = "black";
                                        intervalArray.push("Daily")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength > 31 && rangeLength <= 90) {
                                        document.getElementById('intervalOptionID2').style.color = "black";
                                        intervalArray.push("Weekly")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength > 90 && rangeLength <= 365) {
                                        document.getElementById('intervalOptionID3').style.color = "black";
                                        intervalArray.push("Monthly")
                                        document.getElementById('intervalOptionID2').style.color = "black";
                                        intervalArray.push("Weekly")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength > 365 && rangeLength <= 730) {
                                        document.getElementById('intervalOptionID4').style.color = "black";
                                        intervalArray.push("Quarterly")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength > 730 && rangeLength <= 3287) {
                                        document.getElementById('intervalOptionID5').style.color = "black";
                                        intervalArray.push("Half Yearly")
                                        document.getElementById('intervalOptionID4').style.color = "black";
                                        intervalArray.push("Quarterly")
                                        checkInterval(intervalArray)
                                    }
                                    if (rangeLength >= 3287) {
                                        document.getElementById('intervalOptionID6').style.color = "black";
                                        intervalArray.push("Yearly")
                                        checkInterval(intervalArray)
                                    }
                                })
                                //IF USER CLICKED OUTSIDE ANYWHERE, IT REMOVES
                                function checkInterval(intervalArray) {
                                    for (let i = 0; i < 7; i++) {
                                        const option = document.getElementById(`intervalOptionID${i}`)
                                        for (let a = 0; a < intervalArray.length; a++) {
                                            if (option.innerText === intervalArray[a]) {
                                                option.addEventListener("click", function (event) {
                                                    // event.stopPropagation();
                                                    //PUT THE EVENT
                                                    changeInterval(option.innerText)
                                                })

                                            }
                                        }

                                    }
                                }

                                //ON CONDITION THAT THE USER WANT TO CHANGE THE INTERVALS BUT ON THE SAME GENERATED RANGE
                                // //LOOP IN THE INTERVALS ARRAY AND UPON SELECTION AUTOFILL THE SELECTED INTERVAL TEXT
                                function changeInterval(currentInterval) {
                                    //FIND THE LENTH OF THE CURRENT GENERATED RANGE
                                    const sDate = localStorage.getItem('firstDate');
                                    const eDate = localStorage.getItem('lastDate');
                                    startDate = new Date(sDate)
                                    endDate = new Date(eDate)

                                    const theDate1 = moment(startDate);//convert to the format dd/mm/yy using moment

                                    const startYear = startDate.getFullYear();
                                    const endYear = endDate.getFullYear();
                                    const startMonth = startDate.getMonth();
                                    const endMonth = endDate.getMonth();
                                    //WE WILL USE THIS TO GET THE INTERVAL LENTH IN DAYS
                                    function getDateRangeLength() {
                                        const millisecondsPerDay = 1000 * 60 * 60 * 24;
                                        const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
                                        const differenceInDays = Math.round(differenceInMilliseconds / millisecondsPerDay);
                                        return differenceInDays;
                                    }
                                    const rangeLength = getDateRangeLength(startDate, endDate);

                                    //WE WILL USE THIS TO GET THE INTERVAL LENTH IN MONTHS
                                    function getMonthRangeLength() {
                                        const differenceInMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
                                        return differenceInMonths;
                                    }
                                    const monthRangeLength = getMonthRangeLength(startDate, endDate);
                                    //WE WILL USE THIS TO GET THE INTERVAL LENTH IN YEARS
                                    function getYearlyRangeLength() {
                                        const differenceInYears = (endYear - startYear);
                                        return differenceInYears;
                                    }
                                    const yearRangeLength = getYearlyRangeLength(startDate, endDate);
                                    //THEN IF THE USER CLICKS ON HIS/HER CHOICE, MAKE IT PRESENT THE GRAPH AND THE REST OF THE INFORMATION
                                    if (currentInterval === "Hourly" && rangeLength <= 1) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k < 24; k++) {
                                            intervalLabel.push(`${k}:00`);
                                            //create the full date for use in the table
                                            const currentDate = moment(startDate).add(0, 'days');
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = 24

                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    if (currentInterval === "Daily" && rangeLength > 1 && rangeLength <= 31) {
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k < rangeLength; k++) {
                                            const currentDate = moment(startDate).add(k, 'days');
                                            const theMonth = currentDate.format('MMM');
                                            const theDate = currentDate.format('DD') + ' ' + theMonth;
                                            //this will contain the label for daily chart
                                            intervalLabel.push(theDate);
                                            //create the full date for use in the table
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                            lowerBound = 0
                                            upperBound = dateArray.length
                                        }
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    //WEEKLEY CHECK
                                    if (currentInterval === "Weekly" && rangeLength > 31 && rangeLength <= 365) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate,currentInterval)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k <= rangeLength; k++) {

                                            if (k + 6 > rangeLength) {
                                                // THE FIRST DAY OF THE CURRENT WEEK
                                                const currentDate1 = moment(startDate).add(k, 'days');
                                                const theMonth1 = currentDate1.format('MMM');
                                                const theDate1 = currentDate1.format('DD') + ' ' + theMonth1;
                                                const myDate = currentDate1.format('DD/MM/YYYY');
                                                dateArray.push(myDate);

                                                // THE last DAY OF THE CURRENT WEEK
                                                //if the last day of the week is going to go out of range, use the end date
                                                const currentDate2 = moment(endDate).add(0, 'days');
                                                const theMonth2 = currentDate2.format('MMM');
                                                const theDate2 = currentDate2.format('DD') + '' + theMonth2;
                                                const W = theDate1 + "-" + theDate2;
                                                intervalLabel.push(W);
                                                break

                                            } else if (k + 6 < rangeLength) {
                                                // THE FIRST DAY OF THE CURRENT WEEK
                                                const currentDate1 = moment(startDate).add(k, 'days');
                                                const theMonth1 = currentDate1.format('MMM');
                                                const theDate1 = currentDate1.format('DD') + ' ' + theMonth1;
                                                const myDate = currentDate1.format('DD/MM/YYYY');
                                                dateArray.push(myDate);


                                                // THE last DAY OF THE CURRENT WEEK
                                                //if the last day of the week is going to go out of range, use the end date
                                                const currentDate2 = moment(startDate).add(k + 6, 'days');
                                                const theMonth2 = currentDate2.format('MMM');
                                                const theDate2 = currentDate2.format('DD') + '' + theMonth2;
                                                // alert("UP TO = " + theDate2)
                                                const W = theDate1 + "-" + theDate2
                                                intervalLabel.push(W);
                                                k = k + 6 //WE WANT TO LOOP FOR Weekly STAGES
                                            }
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    if (currentInterval === "Monthly" && rangeLength > 90 && rangeLength <= 365) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            // intervalLabel.push(`${theMonth}`);
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(currentMonth);
                                            const myDate = currentDate.format('DD/MM/YYYY');
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = intervalLabel.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    //Quarterly CHECK
                                    if (currentInterval === "Quarterly" && (rangeLength > 365 && rangeLength <= 3287)) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            //GET THE FIRST MONTH OF THE QUARTER
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //GET THE LAST MONTH OF THE QUARTER
                                            const currentDate1 = moment(startDate).add(k + 2, 'month');
                                            const currentMonth1 = currentDate1.format('MMM');
                                            const W = "(" + currentMonth + "-" + currentMonth1 + ") " + currentDate1.format('YYYY')

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(W);
                                            dateArray.push(myDate)
                                            k = k + 2
                                        }
                                        lowerBound = 0
                                        upperBound = intervalLabel.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    //Half Yearly CHECK
                                    if (currentInterval === "Half Yearly" && rangeLength > 730 && rangeLength <= 3287) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k <= monthRangeLength; k++) {
                                            //GET THE FIRST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate = moment(startDate).add(k, 'month');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //GET THE LAST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate1 = moment(startDate).add(k + 5, 'month');
                                            const currentMonth1 = currentDate1.format('MMM');
                                            const W = "(" + currentMonth + "-" + currentMonth1 + ") " + currentDate1.format('YYYY')

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(W);
                                            dateArray.push(myDate)
                                            k = k + 5
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                    //YEARLY CHECK
                                    if (currentInterval === "Yearly" && rangeLength > 3287) {
                                        //set the currenct clicked value in local storage
                                        localStorage.setItem('currentInterval', currentInterval)
                                        //GET THE SELECTED RANGE AND UPDATE THE TEXT WITH ITS VALUE
                                        const rangeInterval = document.querySelector('.rangeInterval');
                                        rangeInterval.innerText = currentInterval;
                                        // dateRangeHeaderRange.style.display = 'none'
                                        // defaultDisplayContent(startDate, endDate)
                                        let lowerBound = 0
                                        let upperBound = 0
                                        let intervalLabel = [];
                                        let dateArray = []
                                        for (let k = 0; k <= yearRangeLength; k++) {
                                            //WHEN CALCULATING THE YEALY REPORTS, WE WANT THE CORRECT YEAR,
                                            //IF THE USER IS GENERATING THE YEARLY REPORT FROM 3 APRIL 2021, A FULL YEAR ENDS ON 3 APRIL THE END DATE.
                                            //GET THE FIRST MONTH OF THE SEMI-ANNUAL PERIOD
                                            const currentDate = moment(startDate).add(k, 'year');
                                            const currentYear = currentDate.format('YYYY');
                                            const currentMonth = currentDate.format('MMM');
                                            const myDate = currentDate.format('DD/MM/YYYY');

                                            //this will contain the label for monthly x-axis label chart
                                            intervalLabel.push(currentYear);
                                            dateArray.push(myDate)
                                        }
                                        lowerBound = 0
                                        upperBound = dateArray.length
                                        createChart(lowerBound, upperBound, intervalLabel, dateArray, currentInterval, startDate, endDate)
                                    }
                                }

                                //ON CONDITION THAT THE INFORMATION IS BEING DISPLAYED BY THE DEFAULT RANGE
                                const sDate = localStorage.getItem('firstDate');
                                const eDate = localStorage.getItem('lastDate');
                                const de = new Date()
                                const currMonth = de.getMonth();
                                const currYear = de.getFullYear();

                                if (sDate === null && eDate === null) {
                                    //IF THERE IS NO DATE IN THE LOCAL STORAGE, SET THE RANGE FROM THE FIRST (startDate) DAY TO NOW(endDate)
                                    for (let i = 1; i < currentDay + 1; i++) {
                                        const date = new Date(currYear, currMonth, i);
                                        if (i === 1) {
                                            startDate = date;
                                        }
                                        else {
                                            endDate = date;
                                        }
                                    }
                                    // alert('iam calling him by default')
                                    defaultDisplayContent(startDate, endDate)
                                    //set the l/s to have the startDate and endDate
                                    // Store the start and end date values in localStorage
                                    localStorage.setItem('firstDate', startDate);
                                    localStorage.setItem('lastDate', endDate);

                                } else {
                                    // let startDate = ""
                                    // let endDate = ""
                                    startDate = new Date(sDate)
                                    endDate = new Date(eDate)
                                    defaultDisplayContent(startDate, endDate)
                                }
                            }

                            //=======================================================================================================
                            $('#dateRange').daterangepicker({
                                opens: 'right',
                                showDropdowns: true,
                                // "autoapply": true,
                                "linkedCalendars": false,

                                ranges: {
                                    'Today': [moment(), moment()],
                                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                                    'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                                    'This Year': [moment().startOf('year'), moment().endOf('year')],
                                },
                                alwaysShowCalendars: true,
                                startDate: startDate,
                                endDate: endDate,
                                locale: {
                                    format: 'DD/MM/YYYY'
                                },
                                minYear: '2000',
                                maxYear: new Date().getFullYear(),


                            },
                                //AFTER EVERY SPECIFIED DATE RANGE, THIS FUNCTION IS CALLED
                                function (startDate, endDate) {
                                    // Store the start and end date values in localStorage
                                    localStorage.setItem("firstDate", startDate);
                                    localStorage.setItem("lastDate", endDate);
                                    const formattedFromDate = new Date(startDate);
                                    const formattedToDate = new Date(endDate);
                                    const theDate = moment(startDate); //convert to the format dd/mm/yy using moment
                                    const expectedDateFormat =
                                        theDate.format("DD/MM/YYYY");
                                    //check if The two dates do represent the same day
                                    if (
                                        formattedFromDate.getDate() ===
                                        formattedToDate.getDate() &&
                                        formattedFromDate.getMonth() ===
                                        formattedToDate.getMonth() &&
                                        formattedFromDate.getFullYear() ===
                                        formattedToDate.getFullYear()
                                    ) {
                                        selectedDate = expectedDateFormat; //STORE THE DATE TO DISPLAY IN THE EMPTY ROWS
                                    } else {
                                        selectedDate = "";
                                    }
                                    //CALL THE DEFAUALT DISPLAY FUNCTION
                                    startDate = new Date(startDate)
                                    endDate = new Date(endDate)
                                    //call this function based on which mode we are
                                    const editMode = localStorage.getItem('editMode')
                                    //set current page to one
                                    currentPage = 1
                                    localStorage.setItem('advCurrentPage', currentPage)

                                    if (editMode === null) {
                                        defaultDisplayContent(startDate, endDate)
                                    }
                                    else if (editMode !== null) {
                                        console.log('tamu two')
                                        defaultDisplayContent2(startDate, endDate)
                                    }
                                },
                            );

                            $('.drp-calendar.right').hide();
                            $('.drp-calendar.left').addClass('single');

                            $('.calendar-table').on('DOMSubtreeModified', function () {
                                var el = $(".prev.available").parent().children().last();
                                if (el.hasClass('next available')) {
                                    return;
                                }
                                el.addClass('next available');
                                el.append('<span></span>');
                            });
                        };

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

                                    //store the entered numbers to LS
                                    localStorage.setItem('advCurrentPage', parseInt(document.querySelector('.spanText').innerText))
                                    if (isEditMode === false) {
                                        totalPages = Math.ceil(dataArray.length / pageSize);
                                        const startIndex = (parseInt(event.target.innerText) - 1) * parseInt(pageSize);
                                        const endIndex = startIndex + parseInt(pageSize);
                                        document.querySelector('.spanText1').innerText = totalPages;
                                        document.querySelector('.rowsPerPage').innerText = pageSize;
                                        for (let i = 0; i < dataArray.length; i++) {
                                            if (startIndex <= i && i < endIndex) {
                                                dataArray[i].style.display = 'table-row';
                                            } else {
                                                dataArray[i].style.display = 'none';
                                            }
                                        }
                                    }
                                    else if (isEditMode === true) {
                                        //call the default display function
                                        defaultDisplayContent2(startDate, endDate)
                                    }

                                    // change the baCKGROUND TO no COLOR THAT SHOWS THAT WE ARE NOW EDITING 
                                    document.querySelector('.spanText').style.backgroundColor = 'white'
                                    document.querySelector('.spanText').style.textDecoration = 'none'
                                    //remove focus 
                                    document.querySelector('.spanText').blur()
                                }
                                else if (parseInt(event.target.innerText) > parseInt(document.querySelector('.spanText1').innerText)) {
                                    notification('number exceeds total pages')
                                    return
                                }
                            }
                        })

                        let advItemsPerPage
                        const rowsPerPage = document.querySelector('.rowsPerPage')
                        //the rowsperpage innertext should show the number of rows as five
                        rowsPerPage.innerText = advItemsPerPage
                        const paginationList = document.querySelectorAll('.paginationList');
                        paginationList.forEach(page => {
                            page.addEventListener("click", (event) => {
                                event.preventDefault();
                                advItemsPerPage = page.innerText;
                                //now change the innertext of the page container and remove dropdown
                                rowsPerPage.innerText = advItemsPerPage
                                //change alse the current page to one
                                currentPage = 1; //WE HAVE TO MODIFY THIS TO BE AUTOMATIC DECTING THE CURRENT PAGE OF THE CURRENT CONTENTS ON CONDITION OF THE ITEMS PER PAGE CHOSEN BY THE USER

                                // Store the advItemsPerPage value in localStorage
                                localStorage.setItem('advItemsPerPage', advItemsPerPage);
                                localStorage.setItem('advCurrentPage', currentPage);
                                //THIS SHOULD JUST CALL THE DEFAULT DISPLAY
                                if (isEditMode === false) {
                                    pageSize = localStorage.getItem('advItemsPerPage')
                                    const startIndex = (currentPage - 1) * pageSize;
                                    const endIndex = parseFloat(startIndex) + parseFloat(pageSize);
                                    totalPages = Math.ceil(dataArray.length / pageSize);
                                    document.querySelector('.spanText').innerText = currentPage;
                                    document.querySelector('.spanText1').innerText = totalPages;
                                    for (let i = 0; i < dataArray.length; i++) {
                                        if (startIndex <= i && i < endIndex) {
                                            dataArray[i].style.display = 'table-row';
                                        } else {
                                            dataArray[i].style.display = 'none';
                                        }
                                    }
                                }
                                else if (isEditMode === true) {
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            });
                        });
                        // Initial display
                        function goPrev() {
                            currentPage = parseInt(document.querySelector('.spanText').innerText)
                            const totalPages = parseInt(document.querySelector('.spanText1').innerText)
                            if (currentPage > 1) {
                                currentPage--; //decrement the pages
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('advCurrentPage', currentPage);
                                if (isEditMode === false) {
                                    // defaultDisplayContent(startDate, endDate)
                                    const startIndex = (currentPage - 1) * pageSize;
                                    const endIndex = parseFloat(startIndex) + parseFloat(pageSize);
                                    for (let i = 0; i < dataArray.length; i++) {
                                        if (startIndex <= i && i < endIndex) {
                                            dataArray[i].style.display = 'table-row';
                                        } else {
                                            dataArray[i].style.display = 'none';
                                        }
                                    }
                                }
                                else if (isEditMode === true) {
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            }
                            else if (currentPage === 1) {
                                currentPage = totalPages
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('advCurrentPage', currentPage);
                                if (isEditMode === false) {
                                    const startIndex = (currentPage - 1) * pageSize;
                                    const endIndex = parseFloat(startIndex) + parseFloat(pageSize);
                                    for (let i = 0; i < dataArray.length; i++) {
                                        if (startIndex <= i && i < endIndex) {
                                            dataArray[i].style.display = 'table-row';
                                        } else {
                                            dataArray[i].style.display = 'none';
                                        }
                                    }
                                }
                                else if (isEditMode === true) {
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            }
                        }
                        function goNext() {
                            currentPage = parseInt(document.querySelector('.spanText').innerText)
                            const totalPages = parseInt(document.querySelector('.spanText1').innerText)//Math.ceil(rangeData.length / advItemsPerPage);
                            if (currentPage < totalPages) {
                                currentPage++;//increment the currentpage by1
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('advCurrentPage', currentPage);
                                if (isEditMode === false) {
                                    const startIndex = (currentPage - 1) * pageSize;
                                    const endIndex = parseFloat(startIndex) + parseFloat(pageSize);
                                    for (let i = 0; i < dataArray.length; i++) {
                                        if (startIndex <= i && i < endIndex) {
                                            dataArray[i].style.display = 'table-row';
                                        } else {
                                            dataArray[i].style.display = 'none';
                                        }
                                    }
                                }
                                else if (isEditMode === true) {
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            }
                            else if (currentPage === totalPages) {
                                currentPage = 1
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('advCurrentPage', currentPage);
                                if (isEditMode === false) {
                                    const startIndex = (currentPage - 1) * pageSize;
                                    const endIndex = parseFloat(startIndex) + parseFloat(pageSize);
                                    for (let i = 0; i < dataArray.length; i++) {
                                        if (startIndex <= i && i < endIndex) {
                                            dataArray[i].style.display = 'table-row';
                                        } else {
                                            dataArray[i].style.display = 'none';
                                        }
                                    }
                                }
                                else if (isEditMode === true) {
                                    defaultDisplayContent2(startDate, endDate)
                                }
                            }
                        }
                        const prevArrow = document.getElementById('previous');
                        const nextArrow = document.getElementById('next');

                        prevArrow.addEventListener('click', goPrev);
                        nextArrow.addEventListener('click', goNext);
                        //===============================================================================================
                        function ascending() {
                            // Sort the array by 'expdate' in ascending order
                            cashFlowArray.sort((a, b) => {
                                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
                            });
                            //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                            const sDate =
                                localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            const eDate =
                                localStorage.getItem("lastDate");
                            const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            const endDate = new Date(eDate);
                            defaultDisplayContent2(
                                startDate,
                                endDate
                            );

                        }


                        function descending() {
                            // Sort the array by 'expdate' in ascending order
                            cashFlowArray.sort((a, b) => {
                                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                                return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
                            });
                            //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                            const sDate =
                                localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            const eDate =
                                localStorage.getItem("lastDate");
                            const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            const endDate = new Date(eDate);
                            defaultDisplayContent2(
                                startDate,
                                endDate
                            );

                        }
                        //=============================================================================
                        const importBtn = document.querySelector('.import');
                        const importForm = document.querySelector('.importForm');
                        const fileInput = document.getElementById('csv-file');
                        const uploadBtn = document.getElementById('upload-btn');
                        const retryBtn = document.getElementById('cancel-btn');
                        const successModal = document.getElementById('success_tic')
                        const successModalText = document.querySelector('.itemsCount')
                        const successBtn = document.getElementById('okay')
                        //event listener on teh success button to remove the modal if user click
                        successBtn.addEventListener('click', function (event) {
                            successModal.style.display = 'none'
                        })
                        importBtn.addEventListener('click', () => {
                            checkedRows = []

                        });
                        // Prevent default behavior when dragging files over the form
                        importForm.addEventListener('dragover', (event) => {
                            event.preventDefault();
                        });
                        // Handle file drop event
                        importForm.addEventListener('drop', (event) => {
                            event.preventDefault();
                            csvFile.files = event.dataTransfer.files;
                        });
                        uploadBtn.addEventListener('click', (event) => {
                            event.preventDefault();
                            spinner.style.display = 'block'

                            let extension = '';
                            let files = [];
                            let filename;
                            if (fileInput.value === '') {
                                notification("Please choose any CSV file...")
                                spinner.style.display = 'none'
                                displayContainerBlocks()
                                return
                            }
                            else if (fileInput.value !== '') {
                                files = document.getElementById('csv-file').files;
                                filename = files[0].name;
                                extension = filename.substring(filename.lastIndexOf("."));
                            }

                            if (extension !== '.csv') {//check if extension is csv format
                                notification("Please select a valid csv file.")
                                spinner.style.display = 'none'
                                displayContainerBlocks()
                                return
                            }
                            else if (fileInput.value !== '' && extension === '.csv') {
                                const file = document.getElementById('csv-file').files[0];
                                if (file) {
                                    displaySpinner()
                                    importForm.style.display = 'none';
                                    uploadCSV(file);  // Call the function to upload the file
                                }
                            }
                        })
                        retryBtn.addEventListener('click', () => {
                            fileInput.value = '';
                        });

                        //When the user clicks outside the +add expense form it also closes
                        document.addEventListener('mousedown', function handleClickOutsideBox(event) {
                            // const box = document.getElementById('expense-details-Form');
                            if (!importForm.contains(event.target)) {
                                importForm.style.display = 'none';
                            }
                        });

                        // Function to handle CSV file upload and send to the server
                        async function uploadCSV(csvFile) {
                            const formData = new FormData();
                            formData.append("csvFile", csvFile);  // Append the CSV file to the FormData object
                            try {

                                const response = await fetch("/cashFlowData", {
                                    method: "POST",
                                    body: formData,  // Send the FormData with the file
                                });

                                const data = await response.json();
                                cashFlowArray = []
                                let payInArray = []
                                let payOutArray = []
                                // Handle response from the server
                                if (data.isSaving === true) {
                                    //display the modal updating the user that data has been uploaded
                                    for (let i = 0; i < data.documents.length; i++) {
                                        const doc = data.documents[i];
                                        if (doc.CashFlowType === 'Pay in') {
                                            payInArray.push(doc)
                                        }
                                        else {
                                            payOutArray.push(doc)
                                        }
                                        cashFlowArray.push(doc);
                                    }

                                    //after the upload process is successfully done,show the table and remove spinner

                                    // display the modal with the total inserted count
                                    successModal.style.display = 'block'
                                    successModalText.innerText = data.documents.length
                                    document.querySelector('.uploadData').style.display = 'block'
                                    displaySpinner()
                                    const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    const eDate = localStorage.getItem('lastDate');
                                    const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    const endDate = new Date(eDate);
                                    defaultDisplayContent2(startDate, endDate)
                                    //update the categories arrays
                                    let dbDocs = data.categoriesDocs;
                                    for (let i = 0; i < dbDocs.length; i++) {
                                        const doc = dbDocs[i];
                                        if (doc.Balance === 'PayOut') {
                                            //cjheck if suspense already exisit
                                            if (doc.category.replace(/ /g, "_").toLowerCase() !== 'suspense') {
                                                newExpenseCategories.push(doc); // Push only if category is not 'suspense'
                                            } else {
                                                console.log('Document not added: category is "suspense".');
                                            }
                                        }

                                    }
                                    // updateFilterByCategory(startDate, endDate)
                                    console.log("Data successfully processed and saved.");
                                } else {

                                    // display the modal with the total inserted count
                                    successModal.style.display = 'block'
                                    successModalText.innerText = payOutArray.length
                                    document.querySelector('.uploadData').style.display = 'block'
                                    //after the upload process is successfully done,show the table and remove spinner
                                    removeSpinner()
                                    const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    const eDate = localStorage.getItem('lastDate');
                                    const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    const endDate = new Date(eDate);
                                    defaultDisplayContent2(startDate, endDate)
                                    console.error("Error:", data.isSaving);
                                }
                            } catch (error) {
                                console.error("Error uploading CSV:", error);
                            }
                        }

                        //==================================================================================
                        //    /?FUNCTIONS THAT DISPLAYS THE SPINNERS AND REMOVE
                        function displaySpinner() {
                            spinner.style.display = "block";
                            document.querySelector(".card1").style.display = "none";
                            document.querySelector(".main-card-second").style.display = "none";
                            document.querySelector(".theLoader").style.display = "flex";
                        }
                        function removeSpinner() {
                            spinner.style.display = "none";
                            document.querySelector(".card1").style.display = "block";
                            document.querySelector(".theLoader").style.display = "none";
                            document.querySelector(".main-card-second").style.display = "block";
                        }
                    })

                    .catch(error => console.error('Error fetching headerstatus:', error));
                console.log(headersStatus); // do something with the statuses array
            })
            .catch(error => console.error('Error fetching  categories:', error));
    })
    .catch(error => console.error('Error fetching currencies:', error));
console.log(newCurrencies); // do something with the currencies array
function notification(message) {
    const notificationBlock = document.getElementById('notificationBlock');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    notificationBlock.appendChild(notification);

    // Show notification with a delay
    setTimeout(function () {
        notification.classList.add('show');
    }, 500);
    // Remove notification after 4 seconds (1 second fade-in + 3 seconds visible)
    setTimeout(function () {
        notification.classList.remove('show'); // Trigger fade-out + slide-out
        setTimeout(function () {
            notification.remove(); // Remove the notification element after the animation
        }, 700); // Wait for the fade-out transition to finish before removing
    }, 2000); // 4 seconds total visible time
}
