
import { WorldCurrencies } from "./worldCurrency.js";

let newCurrencies = []
let cashFlowArray = []
let newIncomeCategories = []
let newExpenseCategories = []
let categoryArray = []
let accountingPeriodDetails = []

//load the loaser
// document.querySelector('.toolbar').classList.add('toolbarPosition')
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
                fetch('/cashFlowArray')
                    .then(response => response.json())
                    .then(cashFlows => {
                        cashFlows.forEach((i) => {
                            cashFlowArray.push(i);
                        });
                        fetch('/details')
                            .then(response => response.json())
                            .then(details => {
                                document.querySelector('.loader-container').style.display = 'none'
                                document.querySelector('.toolbar').style.display = 'block'
                                document.querySelector('.icon-nav').style.display = 'block'
                                document.querySelector('.BigContainer').style.display = 'block'
                                document.querySelector('.toolbar').classList.remove('toolbarPosition')
                                details.forEach((detail) => {
                                    accountingPeriodDetails.push(detail);
                                });
                                //CREATE THE CATEGORIES ARRAY THAT HAS BOTH PAYINS AND PAYOUTS CATEGORIES
                                newIncomeCategories.forEach(payIn => {
                                    categoryArray.push(payIn)
                                });
                                newExpenseCategories.forEach(payOut => {
                                    categoryArray.push(payOut)
                                });
                                console.log(categoryArray)
                                const submitCategory = document.querySelector('.submitCategory')

                                //=======================================================================================
                                //GET THE ISOCODE OF THE BASE CURRENCY
                                const baseCurrName = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === "Y");//find matching currency name with the one in the incomes table

                                //find the base currency code 
                                const baseCurrencyCode = Array.from(WorldCurrencies).find(curr => curr.Currency_Name === baseCurrName.Currency_Name);//find matching currency name with the one in the incomes table
                                let isoCode = ''
                                if (baseCurrencyCode) {
                                    isoCode = baseCurrencyCode.ISO_Code;
                                }
                                //=======================================================================================
                                function dateValidation(datepIckerDate) {
                                    let formattedDate = ''
                                    datepIckerDate = datepIckerDate.replace(/[.,-]/g, '/');
                                    const parts = datepIckerDate.split("/");
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
                                        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2099) {
                                            // Date is valid, construct the formatted date string in "dd/mm/yyyy" format
                                            //.padStart(2, "0") ensures that the resulting string has a minimum length of 2 characters by padding the left side with zeros ("0") if necessary.
                                            formattedDate = `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year.toString()}`;

                                        } else {
                                            console.log("Invalid date.");
                                        }
                                    } else {
                                        console.log("Invalid date format.");
                                    }
                                    return formattedDate
                                }
                                //==========================================================================================
                                //OPENING BALANCE CALCULATIONS FUNCTION
                                let startDate = ''
                                let endDate = ''
                                //check if the accouting period has been set
                                const myAccStartDate = localStorage.getItem('firstDateOfAccountingPeriod');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                // const myAccEndDate = localStorage.getItem('lastDateOfAccountingPeriod');
                                const myStartDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                const myEndDate = localStorage.getItem('lastDate');

                                if ((myAccStartDate === null && myEndDate !== null)) {
                                    // Accessing startdate from db
                                    accountingPeriodDetails.forEach(detail => {
                                        startDate = detail.startDate
                                    });
                                    const parts = startDate.split("-");
                                    const formattedDate = parts[2] + "/" + parts[1] + "/" + new Date(myStartDate).getFullYear();
                                    const formattedStartDates = new Date(formattedDate);
                                    startDate = new Date(formattedStartDates);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    endDate = new Date();
                                    trialBalance(startDate, endDate)
                                }
                                else if ((myAccStartDate !== null && myEndDate !== null)) {
                                    const parts = myAccStartDate.split("-");
                                    const formattedDate = parts[2] + "/" + parts[1] + "/" + new Date(myStartDate).getFullYear();
                                    const formattedStartDates = new Date(formattedDate);
                                    startDate = new Date(formattedStartDates);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    endDate = new Date(myEndDate);
                                    trialBalance(startDate, endDate)
                                }
                                //========================================================================================================

                                function calculateCashBalance() {
                                    let theBeforeExpenses = 0
                                    let theBeforeIncome = 0
                                    //GET THE VALUE OF THE PREVIOUS MONTH BASED ON THE RANGE SELECTED
                                    const momntStartDate = moment(startDate)
                                    let theBeforeStartDate = momntStartDate.subtract(1, "days")
                                    theBeforeStartDate = new Date(theBeforeStartDate)
                                    for (let b = 0; b < cashFlowArray.length; b++) {
                                        const row = cashFlowArray[b];
                                        const date = row.CashFlowDate;
                                        const parts = date.split("/");
                                        const formattedDate =
                                            parts[1] + "/" + parts[0] + "/" + parts[2];
                                        const formattedDates2 = new Date(formattedDate);

                                        if (theBeforeStartDate.getTime() >= formattedDates2.getTime()) {
                                            if (row.CashFlowType === 'Payout') {
                                                theBeforeExpenses += parseFloat(
                                                    row.CashFlowCashEquiv
                                                );
                                            }
                                            else if (row.CashFlowType === 'Pay in') {
                                                if (theBeforeStartDate.getTime() >= formattedDates2.getTime()) {
                                                    theBeforeIncome += parseFloat(row.CashFlowCashEquiv);
                                                }
                                            }
                                        }

                                    }
                                    return parseFloat(theBeforeIncome) - parseFloat(theBeforeExpenses)
                                }
                                //======================================================================================================
                                //GENERATE THE TRIAL BALANCE ONCE THE BUTTON IS CLICKED

                                // TRIAL BALANCE OPERATIONS
                                function trialBalance(startDate, endDate) {

                                    const openingCashBalance = calculateCashBalance()

                                    let theStartDate = moment(startDate);//convert to the format dd/mm/yy using moment
                                    let theEndDate = moment(endDate);//convert to the format dd/mm/yy using moment
                                    theStartDate = theStartDate.format('DD/MM/YYYY');
                                    theEndDate = theEndDate.format('DD/MM/YYYY');
                                    //create another span
                                    const trialBalanceSpan = document.querySelector('.dateRange')

                                    trialBalanceSpan.innerText = theEndDate

                                    trialBalanceSpan.addEventListener('keydown', (event) => {
                                        // Add click and keydown event listeners in one line
                                        if (event.key === "Enter" || event.key === 'Tab') {//WHEN ENTER IS CLICKED
                                            event.preventDefault();
                                            //VALIDATE THE DATES ENTERED
                                            let newEndDate = dateValidation(trialBalanceSpan.innerText);
                                            if (newEndDate !== '') {
                                                //then correct the text  clicked with the one inputted
                                                trialBalanceSpan.innerText = newEndDate
                                                //CHANGE THE STRUCTURE TO MM/DD/YYYY
                                                const parts = newEndDate.split("/");
                                                const formattedDate =
                                                    parts[1] + "/" + parts[0] + "/" + parts[2];
                                                newEndDate = new Date(formattedDate);
                                                //now store the correct date in local storage so that it can be used in other js
                                                localStorage.setItem('lastDate', newEndDate)
                                                //first clear the tbody ,loop in the table and remove rows
                                                const trialBalnceRows = document.querySelectorAll('.tBalanceTableRows');
                                                for (let i = 0; i < trialBalnceRows.length; i++) {
                                                    const tb = trialBalnceRows[i];
                                                    tb.style.display = 'none'
                                                }
                                                //call the function that displays the trial balance
                                                const myStartDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                                const myEndDate = localStorage.getItem('lastDate');
                                                startDate = new Date(myStartDate)
                                                endDate = new Date(myEndDate)
                                                trialBalance(startDate, endDate)

                                                //remove focus on the text
                                                trialBalanceSpan.blur()
                                                document.querySelector('.daterangepicker').style.display = 'none'
                                            }
                                            if (newEndDate === '') {
                                                // ('invalid date')
                                            }

                                        }
                                    })
                                    //loop in the array of categories
                                    let totalPayInCatAmnt = 0
                                    let totalPayOutCatAmnt = 0
                                    let totalCategoryCash = 0
                                    // Create a new row in the table
                                    const tbody = document.querySelector('.trialBalanceTableBody');
                                    let myRow = ''
                                    let isMatched = false
                                    myRow = document.createElement('tr');
                                    myRow.classList.add('tBalanceTableRows')
                                    const hiddenCel = document.createElement('td');
                                    hiddenCel.hidden = true;
                                    // hiddenCel.innerHTML = myId
                                    hiddenCel.classList.add('categoryId');
                                    myRow.appendChild(hiddenCel);
                                    //add other rows ..the payins category and payouts under their respective headings
                                    const nameCel = document.createElement('td');
                                    nameCel.classList.add('categoryName')
                                    nameCel.textContent = 'OPENING CASH BALANCE'; // Replace with desired content
                                    myRow.appendChild(nameCel);
                                    const payOutAmountCel = document.createElement('td');
                                    payOutAmountCel.classList.add('payOutAmount')
                                    payOutAmountCel.style.textAlign = 'center'

                                    const payInAmountCel = document.createElement('td');
                                    payInAmountCel.classList.add('payInAmount')
                                    payInAmountCel.style.textAlign = 'center'
                                    payInAmountCel.textContent = Number(openingCashBalance).toFixed(2);
                                    myRow.appendChild(payOutAmountCel);
                                    myRow.appendChild(payInAmountCel);
                                    tbody.appendChild(myRow);
                                    //now loop in the array displaying the categories
                                    for (let i = 0; i < categoryArray.length; i++) {
                                        const each = categoryArray[i];
                                        // Create a new row
                                        myRow = document.createElement('tr');
                                        myRow.classList.add('tBalanceTableRows')
                                        // Create cells and set their content
                                        //ID TD
                                        const hiddenCell = document.createElement('td');
                                        hiddenCell.hidden = true;
                                        // hiddenCell.innerHTML = myId
                                        hiddenCell.classList.add('categoryId');
                                        myRow.appendChild(hiddenCell);
                                        //add other rows ..the payins category and payouts under their respective headings
                                        const nameCell = document.createElement('td');
                                        nameCell.classList.add('categoryName')
                                        let newCategory = (each.category).replace(/_/g, " ");
                                        newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        nameCell.textContent = newCategory; // Replace with desired content
                                        nameCell.style.cursor = 'pointer'

                                        const payOutAmountCell = document.createElement('td');
                                        payOutAmountCell.classList.add('payOutAmount')
                                        payOutAmountCell.style.textAlign = 'center'

                                        const payInAmountCell = document.createElement('td');
                                        payInAmountCell.classList.add('payInAmount')
                                        payInAmountCell.style.textAlign = 'center'


                                        if (each.Balance === 'PayIn') {
                                            let totalPayInCatAmnt1 = 0
                                            for (let b = 0; b < cashFlowArray.length; b++) {
                                                const row = cashFlowArray[b];
                                                if (row.CashFlowType === 'Pay in') {
                                                    const date = row.CashFlowDate
                                                    const parts = date.split("/");
                                                    const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                    const formattedDates2 = new Date(formattedDate);
                                                    if (each.category === row.CashFlowCategory) {
                                                        if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                                            //TIRIMO CHECK THE TOTALS OF THE AVAILABLE CATEGORIES
                                                            totalPayInCatAmnt1 = parseFloat(totalPayInCatAmnt1) + parseFloat(row.CashFlowCashEquiv);
                                                            totalPayInCatAmnt = parseFloat(totalPayInCatAmnt) + parseFloat(row.CashFlowCashEquiv);
                                                            payInAmountCell.textContent = Number(totalPayInCatAmnt1).toFixed(2)
                                                            isMatched = true
                                                            myRow.appendChild(nameCell);
                                                            myRow.appendChild(payOutAmountCell);
                                                            myRow.appendChild(payInAmountCell);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        else if (each.Balance === 'PayOut') {
                                            let totalPayOutCatAmnt1 = 0
                                            for (let b = 0; b < cashFlowArray.length; b++) {
                                                const row = cashFlowArray[b];
                                                if (row.CashFlowType === 'Payout') {
                                                    const date = row.CashFlowDate
                                                    const parts = date.split("/");
                                                    const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                    const formattedDates2 = new Date(formattedDate);
                                                    if (each.category === row.CashFlowCategory) {
                                                        if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                                            //TIRIMO CHECK THE TOTALS OF THE AVAILABLE CATEGORIES
                                                            totalPayOutCatAmnt = parseFloat(totalPayOutCatAmnt) + parseFloat(row.CashFlowCashEquiv);
                                                            totalPayOutCatAmnt1 = parseFloat(totalPayOutCatAmnt1) + parseFloat(row.CashFlowCashEquiv);
                                                            payOutAmountCell.textContent = Number(totalPayOutCatAmnt1).toFixed(2)
                                                            isMatched = true
                                                            myRow.appendChild(nameCell);
                                                            myRow.appendChild(payOutAmountCell);
                                                            myRow.appendChild(payInAmountCell);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        // Append the row to the table body
                                        tbody.appendChild(myRow);
                                        //ADD CLICKABLE EVENTS ON EACH CATEGORY
                                        nameCell.addEventListener("click", () => {

                                            //onclick go to your respective page displaying only the items of with that category
                                            if (each.Balance === 'PayIn') {
                                                //open the respective page which is payIn
                                                location.href = "/payIn"
                                                const payInCat = each.category
                                                //STORE THE CLICKED VALUE IN L;OCAL STORAGE SO THAT IT CAN BE USED IN THE PAYOUT PAGE
                                                localStorage.setItem("payInCategory", payInCat)
                                            }
                                            if (each.Balance === 'PayOut') {
                                                //open the respective page which is payIn
                                                location.href = "/payOut"
                                                const payOutCat = each.category
                                                //STORE THE CLICKED VALUE IN L;OCAL STORAGE SO THAT IT CAN BE USED IN THE PAYOUT PAGE
                                                localStorage.setItem("payOutcategoryName", payOutCat)
                                            }
                                        })
                                    }

                                    //append the last row with totals outside the loop of cash balance and total
                                    const cashBalance = (parseFloat(openingCashBalance)) + (parseFloat(totalPayInCatAmnt)) - parseFloat(totalPayOutCatAmnt)
                                    // Create a new row
                                    const row1 = document.createElement('tr');
                                    row1.classList.add('tBalanceTableRows')
                                    const hiddenCell1 = document.createElement('td');
                                    hiddenCell1.hidden = true;
                                    // hiddenCell.innerHTML = myId
                                    hiddenCell1.classList.add('categoryId');
                                    row1.appendChild(hiddenCell1);
                                    //add other rows ..the payins category and payouts under their respective headings
                                    const nameCell1 = document.createElement('td');
                                    nameCell1.classList.add('categoryName')
                                    nameCell1.textContent = 'CLOSING CASH BALANCE'; // Replace with desired content
                                    row1.appendChild(nameCell1);
                                    const payOutAmountCell1 = document.createElement('td');
                                    payOutAmountCell1.style.textAlign = 'center'
                                    if (cashBalance >= 0) {
                                        payOutAmountCell1.textContent = Number(cashBalance).toFixed(2);
                                        totalPayOutCatAmnt = parseFloat(totalPayOutCatAmnt) + parseFloat(cashBalance)
                                    }

                                    else if (cashBalance < 0) {
                                        payOutAmountCell1.textContent = Number(cashBalance).toFixed(2);
                                        totalPayOutCatAmnt = parseFloat(totalPayOutCatAmnt) + parseFloat(cashBalance)
                                    }
                                    const payInAmountCell1 = document.createElement('td');
                                    payInAmountCell1.style.textAlign = 'center'

                                    row1.appendChild(payOutAmountCell1);
                                    row1.appendChild(payInAmountCell1);
                                    tbody.appendChild(row1);

                                    // Create a new row
                                    const roww = document.createElement('tr');
                                    roww.classList.add('tBalanceTableRows')
                                    const hiddenCell = document.createElement('td');
                                    hiddenCell.hidden = true;
                                    // hiddenCell.innerHTML = myId
                                    hiddenCell.classList.add('categoryId');
                                    roww.appendChild(hiddenCell);
                                    //add other rows ..the payins category and payouts under their respective headings
                                    const nameCell = document.createElement('td');
                                    nameCell.classList.add('categoryName')
                                    nameCell.textContent = 'TOTAL'; // Replace with desired content
                                    nameCell.style.fontWeight = 'bold'
                                    roww.appendChild(nameCell);
                                    const payOutAmountCell = document.createElement('td');
                                    payOutAmountCell.classList.add('payOutAmount')
                                    payOutAmountCell.style.textAlign = 'center'
                                    payOutAmountCell.style.fontWeight = 'bold'
                                    payOutAmountCell.style.borderTop = '1px solid black'
                                    payOutAmountCell.style.borderBottom = 'double black'
                                    // payOutAmountCell.style.borderBottomColor = 'black'
                                    payOutAmountCell.textContent = Number(totalPayOutCatAmnt).toFixed(2);

                                    const payInAmountCell = document.createElement('td');
                                    payInAmountCell.classList.add('payInAmount')
                                    payInAmountCell.style.textAlign = 'center'
                                    payInAmountCell.style.fontWeight = 'bold'
                                    payInAmountCell.style.borderTop = '1px solid black'
                                    // payInAmountCell.style.borderBottomStyle = ' double'
                                    payInAmountCell.style.borderBottom = 'double black'
                                    totalPayInCatAmnt = parseFloat(totalPayInCatAmnt) + parseFloat(openingCashBalance)
                                    payInAmountCell.textContent = Number(totalPayInCatAmnt).toFixed(2);
                                    roww.appendChild(payOutAmountCell);
                                    roww.appendChild(payInAmountCell);
                                    tbody.appendChild(roww);

                                }
                                //==============================================================================================
                                //DATE RANGE PICKER FUNCTION

                                $(function () {
                                    //TAP INTO THE DATERANGE

                                    $(".dateRange").daterangepicker(
                                        //THIS IS APPLYING RANGES SELECTED BY THE USER PICKING UP STARTDATES AND ENDDATES
                                        {
                                            opens: "right",
                                            showDropdowns: true,
                                            linkedCalendars: false,
                                            alwaysShowCalendars: true,
                                            startDate: startDate,
                                            endDate: endDate,
                                            locale: {
                                                format: "DD/MM/YYYY",
                                            },
                                            minYear: "2000",
                                            maxYear: new Date().getFullYear(),
                                        },
                                        //THIS IS A FUNCTION TO APPLY THE RANGES SELECTED BY THE USER, CHANGING THE DEFAULT START DATES AND END DATES SETTING THEM TO THE L/S
                                        function (startDate, endDate) {
                                            // remove the stored date range from local storage
                                            localStorage.removeItem("firstDate");
                                            localStorage.removeItem("lastDate");
                                            startDate = new Date(startDate)
                                            endDate = new Date(endDate)
                                            // Store the start and end date values in localStorage
                                            localStorage.setItem("firstDate", startDate);
                                            localStorage.setItem("lastDate", endDate);
                                            let theEndDate = moment(endDate);//convert to the format dd/mm/yy using moment
                                            theEndDate = theEndDate.format('DD/MM/YYYY');
                                            //update the innertext of the period ending
                                            const trialbalanceSpan2 = document.querySelector('.dateRange')
                                            trialbalanceSpan2.innerText = theEndDate
                                            //first clear the tbody ,loop in the table and remove rows
                                            const trialBalnceRows = document.querySelectorAll('.tBalanceTableRows');
                                            for (let i = 0; i < trialBalnceRows.length; i++) {
                                                const tb = trialBalnceRows[i];
                                                tb.style.display = 'none'
                                            }
                                            //           document.querySelector('.trialBalanceSpan3').innerHTML=''
                                            // document.querySelector('.trialBalanceSpan2').innerHTML=''
                                            //call the function that displays the trial balance
                                            trialBalance(startDate, endDate)
                                        }
                                    );

                                    $(".drp-calendar.right").hide();
                                    $(".drp-calendar.left").addClass("single");

                                    $(".calendar-table").on(
                                        "DOMSubtreeModified",
                                        function () {
                                            var el = $(".prev.available")
                                                .parent()
                                                .children()
                                                .last();
                                            if (el.hasClass("next available")) {
                                                return;
                                            }
                                            el.addClass("next available");
                                            el.append("<span></span>");
                                        }
                                    );
                                });
                                //===============================================================================================

                                //=======================================================================================
                                //EXPORT OPERATIONS
                                const expBtn = document.querySelector('.export');
                                expBtn.addEventListener('click', function (event) {
                                    exporting(startDate, endDate)
                                })
                                function downloadCSV(csvContent, filename, shopName) {
                                    let csvFile;
                                    let downloadLink;

                                    //define the file type to text/csv  
                                    csvFile = new Blob([csvContent], { type: 'text/csv' });
                                    downloadLink = document.createElement("a");
                                    downloadLink.download = filename;
                                    downloadLink.href = window.URL.createObjectURL(csvFile);
                                    downloadLink.style.display = "none";

                                    document.body.appendChild(downloadLink);
                                    downloadLink.click();
                                }

                                function exporting(startDate, endDate) {
                                    //check if there are dates set pakuchinja range
                                    const firstNewDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    const lastNewDate = localStorage.getItem('lastDate');
                                    if (firstNewDate !== null && lastNewDate !== null) {
                                        endDate = new Date(lastNewDate);
                                        startDate = new Date(firstNewDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    }

                                    let theDate = moment(startDate);//convert to the format dd/mm/yy using moment
                                    let theEndDate = moment(endDate);//convert to the format dd/mm/yy using moment
                                    theDate = theDate.format('DD/MM/YYYY');
                                    theEndDate = theEndDate.format('DD/MM/YYYY');

                                    const currencies = Array.from(newCurrencies).find(newCurrency => newCurrency.BASE_CURRENCY === 'Y');//find the base currency
                                    let baseCurrName
                                    if (currencies) {
                                        baseCurrName = currencies.Currency_Name
                                    }

                                    let headerRow = ['Category', 'PayOut' + ` (${baseCurrName})`, 'PayIn' + ` (${baseCurrName})`];
                                    let csvContent = [];
                                    let filename = "trial_balance.csv";
                                    csvContent.push(('Trial Balance for the period ending:' + theEndDate) + "\r\n");

                                    let totalPayIn = 0
                                    let totalPayOut = 0
                                    for (let i = 0; i < categoryArray.length; i++) {
                                        const each = categoryArray[i];
                                        let row = [];

                                        if (i === 0) {
                                            // Generate the header row
                                            csvContent.push(headerRow.join(","));
                                        }
                                        // Add other columns (payOutAmountCell and payInAmountCell) to the row
                                        let totalPayInCatAmnt1 = 0
                                        let totalPayOutCatAmnt1 = 0

                                        if (each.Balance === 'PayIn') {
                                            for (let a = 0; a < cashFlowArray.length; a++) {
                                                const data = cashFlowArray[a];
                                                const date = data.CashFlowDate
                                                const parts = date.split("/");
                                                const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                const formattedDates2 = new Date(formattedDate);

                                                if (formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                                    //TIRIMO CHECK THE TOTALS OF THE AVAILABLE CATEGORIES
                                                    if (each.category === data.CashFlowCategory && data.CashFlowType === 'Pay in') {
                                                        totalPayInCatAmnt1 = parseFloat(totalPayInCatAmnt1) + parseFloat(data.CashFlowCashEquiv);
                                                        totalPayIn = parseFloat(totalPayIn) + parseFloat(data.CashFlowCashEquiv)
                                                    }
                                                    else {
                                                        totalPayInCatAmnt1 = totalPayInCatAmnt1

                                                    }
                                                }
                                            }
                                            if (each.category.includes("_")) {
                                                each.category = each.category.replace(/_/g, " ")
                                                each.category = (each.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            }
                                            else {
                                                each.category = (each.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            }
                                            row.push(each.category + ',' + "" + ',' + Number(totalPayInCatAmnt1).toFixed(2));
                                        }

                                        else if (each.Balance === 'PayOut') {
                                            for (let a = 0; a < cashFlowArray.length; a++) {
                                                const data = cashFlowArray[a];
                                                const date = data.CashFlowDate
                                                const parts = date.split("/");
                                                const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                                const formattedDates2 = new Date(formattedDate);

                                                if (formattedDates2.getTime() <= endDate.getTime()) {//CODE FOR 
                                                    //TIRIMO CHECK THE TOTALS OF THE AVAILABLE CATEGORIES
                                                    if (each.category === data.CashFlowCategory && data.CashFlowType === 'Payout') {
                                                        totalPayOutCatAmnt1 = parseFloat(totalPayOutCatAmnt1) + parseFloat(data.CashFlowCashEquiv);
                                                        totalPayOut = parseFloat(totalPayOut) + parseFloat(data.CashFlowCashEquiv)
                                                    }
                                                    else {
                                                        totalPayOutCatAmnt1 = totalPayOutCatAmnt1

                                                    }
                                                }
                                            }
                                            if (each.category.includes("_")) {
                                                each.category = each.category.replace(/_/g, " ")
                                                each.category = (each.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            }
                                            else {
                                                each.category = (each.category).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                                console.log(each.category)
                                            }
                                            row.push(each.category + ',' + Number(totalPayOutCatAmnt1).toFixed(2) + ',' + "");
                                        }

                                        csvContent.push(row);
                                    }

                                    if (totalPayIn > totalPayOut) {
                                        const profit = ['CASH BALANCE', Number(totalPayIn.toFixed(2) - totalPayOut.toFixed(2)).toFixed(2), ""].join(',');
                                        totalPayOut = totalPayOut + (totalPayIn.toFixed(2) - totalPayOut.toFixed(2))
                                        csvContent.push(profit);
                                    }
                                    else if (totalPayIn < totalPayOut) {
                                        const loss = ['CASH BALANCE', " ", Number(totalPayOut.toFixed(2) - totalPayIn.toFixed(2)).toFixed(2)].join(',');
                                        totalPayIn = totalPayIn + (totalPayOut.toFixed(2) - totalPayIn.toFixed(2))
                                        csvContent.push(loss);
                                    }
                                    const totalsRow = ['TOTAL', totalPayOut.toFixed(2), totalPayIn.toFixed(2)].join(',');
                                    csvContent.push(totalsRow);
                                    downloadCSV(csvContent.join("\n"), filename);
                                }
                            })

                            .catch(error => console.error('Error fetching accounding period details:', error));
                    })

                    .catch(error => console.error('Error fetching incomes:', error));
                console.log(cashFlowArray); // do something with the currencies array
            })
            .catch(error => console.error('Error fetching categories:', error));
    })
    .catch(error => console.error('Error fetching currencies:', error));
//=============================================================
