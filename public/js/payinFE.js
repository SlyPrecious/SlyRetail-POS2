
import { WorldCurrencies } from "./worldCurrency.js";

//=======================================================================================================
let newCurrencies = []; let newIncomeCategories = []; let newExpenseCategories = []; let cashFlowArray = []; let headersStatus = [];
let checkedRows = []; let symbol = null; let sign = null; let formattedValue = null; let totalPayinsRange = 0; let openingBalance = 0; let totalPayOutsRange = 0;
let newCurrCode = ""; //variable to store the currency's code
let baseCurrCode = ""; //variable to store the base currency's code
let startDate = ""; //value to store the daterange start date
let endDate = ""; //value to store the daterange end date
let checkedRowsId = []; let currentPage; let exportingCriteria = "FullExport"
let sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
let eDate = localStorage.getItem("lastDate"); let taxStatus = "N"; let ztfEntry = {}; let vatEntry = {};
let isNavigating = false; let isFiltering = false; let displayModal = false; let taxtypeSelected = ''; let rowData = []; let taxDataToUpdate = [];
let vatStat = ''; let vatRowId = ''; let rowDataFromDb = []; let selectedTaxType = '';
let vatDataToUpdate = []; let itemsToProcess = [];

fetch("/currencies")
    .then((response) => response.json())
    .then((currencies) => {
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
                fetch('/getPayInHeaderStatus')
                    .then((response) => response.json())
                    .then(payInHeaderStatus => {

                        payInHeaderStatus.forEach((stat) => {
                            headersStatus.push(stat);
                        });
                        //=============================================================================================
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
                        //=============================================================================================
                        function blocksStyle() {
                            const allBlocks = document.querySelectorAll(".box")
                            allBlocks.forEach(box => {
                                box.style.flexBasis = '100px'
                            });
                        }
                        function removeBlocksStyle() {
                            const allBlocks = document.querySelectorAll(".box")
                            allBlocks.forEach(box => {
                                box.style.flexBasis = '156px'
                            });
                        }

                        //success modal
                        const successModal = document.getElementById('success_tic')
                        const successModalText = document.querySelector('.itemsCount')
                        const successBtn = document.getElementById('okay')
                        //event listener on teh success button to remove the modal if user click
                        successBtn.addEventListener('click', function (event) {
                            successModal.style.display = 'none'
                        })
                        const deleteRowsModal = document.getElementById('deleteRowsId');
                        const yesDeleteRows = document.getElementById('yesDelete');
                        const noDeleteRows = document.getElementById('noDelete');
                        const closeDelete = document.getElementById('closeDelete2');
                        const vatModal = document.getElementById('undoVatId');
                        //=====================================================================================
                        const spinner = document.querySelector(".myloader");
                        const tableContainer =
                            document.getElementById("table_container");
                        //when the user selects what rows to display
                        let isChecked = false;
                        const selectioncheckboxes = document.querySelectorAll(
                            ".custom-control-input"
                        );


                        function displayContainerBlocks() {
                            document.querySelector(".loader-container").style.display = "none";
                            document.querySelector(".toolbar").style.display = "block";
                            document.querySelector(".icon-nav").style.display = "block";
                            document.querySelector(".main-card").style.display = "block";
                            document.querySelector(".main-card-second").style.display = "block";

                        }
                        //=======================================================================================================
                        let hiddenHeaders = []; //array to store the unchecked values
                        headersStatus.forEach((status) => {
                            //loop in the status array database and check if the status is true
                            const tableHeaders = document.querySelectorAll(
                                ".income-list-table thead th"
                            ); // get all table rows

                            if (status.isDisplayed === true) {
                                //if so loop in the checkboxes and check them
                                selectioncheckboxes.forEach((checkbox) => {
                                    if (status.HeaderName === checkbox.value) {
                                        checkbox.checked = true;
                                        isChecked = true;
                                        tableHeaders.forEach((row, index) => {
                                            const headerName = row.innerText
                                                .replace(/[\n\u2191\u2193]/g, "")
                                                .split(/[\(\{\"]/)[0]
                                                .trim(); // get the text content of the header cell
                                            if (status.isDisplayed === true) {
                                                if (status.HeaderName === headerName) {
                                                    if (index !== 1) {
                                                        //DO NOT SHOW THE HIDDEN ID COLUMN
                                                        row.style.display = "table-cell";
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            } else if (status.isDisplayed === false) {
                                hiddenHeaders.push(status.HeaderName);
                                selectioncheckboxes.forEach((checkbox) => {
                                    if (status.HeaderName === checkbox.value) {
                                        checkbox.checked = false;
                                        isChecked = false;
                                        tableHeaders.forEach((row, index) => {
                                            const headerName = row.innerText
                                                .replace(/[\n\u2191\u2193]/g, "")
                                                .split(/[\(\{\"]/)[0]
                                                .trim(); // get the text content of the header cell
                                            if (isChecked === false) {
                                                if (status.HeaderName === headerName) {
                                                    if (index !== 1) {
                                                        //DO NOT SHOW THE HIDDEN ID COLUMN
                                                        row.style.display = "none";
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });

                        //OPERATIONS WHEN USER CHECKS OR UNCHECK CHECKBOXES
                        //add event listener on each tickable checkbox
                        const shiftCheckbox =
                            document.getElementById("checkbox-id-shift");
                        const vatCheckbox =
                            document.getElementById("checkbox-id-vat");
                        const invoiceCheckbox = document.getElementById(
                            "checkbox-id-invoice"
                        );
                        const categoryCheckbox = document.getElementById(
                            "checkbox-id-category"
                        );
                        const cashEquivCheckbox = document.getElementById(
                            "checkbox-id-cashEquiv"
                        );
                        const BalanceCheckbox = document.getElementById(
                            "checkbox-id-balance"
                        );
                        let headerisDisplayed = "";
                        let headerNamefcb = "";

                        //WHEN THE USER CLICKS ON SHIFT CHECKBOX
                        shiftCheckbox.addEventListener("click", () => {
                            if (shiftCheckbox.checked === true) {
                                shiftCheckbox.checked = true;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table headers
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("ShiftNo" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "table-cell";
                                            headerisDisplayed = true;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (headersStatus[i].HeaderName === "ShiftNo") {
                                                    headersStatus[i].isDisplayed = true;
                                                }
                                            }
                                            //THEN ALSO THE TDs SHOULD BE TRUE
                                            //GET ALL THE TD IN THE TABLE UNDER SHIFT
                                            const myTableColumns =
                                                document.querySelectorAll(".editableShift"); // get shift table rows

                                            myTableColumns.forEach((column) => {
                                                column.style.display = "table-cell"; //LOOP DISPLAYING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            } else if (shiftCheckbox.checked === false) {
                                shiftCheckbox.checked = false;
                                isChecked = false;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table rows
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("ShiftNo" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "none";
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            headerisDisplayed = false;
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (headersStatus[i].HeaderName === "ShiftNo") {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //GET ALL THE TD IN THE TABLE UNDER SHIFT
                                            const myTableColumns =
                                                document.querySelectorAll(".editableShift"); // get shift table cells or tds
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "none"; //LOOP REMOVING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            }
                        });
                        //WHEN THE USER CLICKS ON VAT CHECKBOX
                        vatCheckbox.addEventListener("click", () => {
                            if (vatCheckbox.checked === true) {
                                vatCheckbox.checked = true;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table headers
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("Tax" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "table-cell";
                                            headerisDisplayed = true;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (headersStatus[i].HeaderName === "Tax") {
                                                    headersStatus[i].isDisplayed = true;
                                                }
                                            }
                                            //THEN ALSO THE TDs SHOULD BE TRUE
                                            //GET ALL THE TD IN THE TABLE UNDER VAT
                                            const myTableColumns =
                                                document.querySelectorAll(".radioBtn"); // get shift table rows
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "table-cell"; //LOOP DISPLAYING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE VAT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            } else if (vatCheckbox.checked === false) {
                                vatCheckbox.checked = false;
                                isChecked = false;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table rows
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("Tax" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "none";
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            headerisDisplayed = false;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (headersStatus[i].HeaderName === "Tax") {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //GET ALL THE TD IN THE TABLE UNDER VAT
                                            const myTableColumns =
                                                document.querySelectorAll(".radioBtn"); // get shift table rows
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "none"; //LOOP HIDDING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            }
                        });

                        //WHEN THE USER CLICKS ON INVOICE CHECKBOX
                        invoiceCheckbox.addEventListener("click", () => {
                            if (invoiceCheckbox.checked === true) {
                                invoiceCheckbox.checked = true;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table headers
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("InvoiceRef" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "table-cell";
                                            headerisDisplayed = true;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName === "InvoiceRef"
                                                ) {
                                                    headersStatus[i].isDisplayed = true;
                                                }
                                            }
                                            //THEN ALSO THE TDs SHOULD BE TRUE
                                            //GET ALL THE TD IN THE TABLE UNDER INVOICE
                                            const myTableColumns =
                                                document.querySelectorAll(".editableInvoice"); // get shift table rows

                                            myTableColumns.forEach((column) => {
                                                column.style.display = "table-cell"; //LOOP DISPLAYING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            } else if (invoiceCheckbox.checked === false) {
                                invoiceCheckbox.checked = false;
                                isChecked = false;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table rows
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("InvoiceRef" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "none";
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            headerisDisplayed = false;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName === "InvoiceRef"
                                                ) {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //GET ALL THE TD IN THE TABLE UNDER invoice
                                            const myTableColumns =
                                                document.querySelectorAll(".editableInvoice"); // get invoice table rows
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "none"; //LOOP HIDDING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            }
                        });
                        //WHEN THE USER CLICKS ON CATEGORY CHECKBOX

                        //WHEN THE USER CLICKS ON CASH EQUIV CHECKBOX
                        cashEquivCheckbox.addEventListener("click", () => {
                            if (cashEquivCheckbox.checked === true) {
                                cashEquivCheckbox.checked = true;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table headers
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("CashEquiv" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "table-cell";
                                            headerisDisplayed = true;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName === "CashEquiv"
                                                ) {
                                                    headersStatus[i].isDisplayed = true;
                                                }
                                            }
                                            //THEN ALSO THE TDs SHOULD BE TRUE
                                            //GET ALL THE TD IN THE TABLE UNDER CASH EQUIV
                                            const myTableColumns =
                                                document.querySelectorAll(".cashEquivClass"); // get cash equiv table rows

                                            myTableColumns.forEach((column) => {
                                                column.style.display = "table-cell"; //LOOP DISPLAYING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE CASH EQUIV STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            } else if (cashEquivCheckbox.checked === false) {
                                cashEquivCheckbox.checked = false;
                                isChecked = false;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table rows
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("CashEquiv" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "none";
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE CATEGORY STATUS NOT THE ENTIRE COLLECTION
                                            headerisDisplayed = false;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName === "CashEquiv"
                                                ) {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //GET ALL THE TD IN THE TABLE UNDER CASH EQUIV
                                            const myTableColumns =
                                                document.querySelectorAll(".cashEquivClass"); // get cash equiv table rows
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "none"; //LOOP HIDDING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE SHIFT STATUS NOT THE ENTIRE COLLECTION
                                            spinner.style.display = "block"; //display progress bar
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            }
                        });
                        //WHEN THE USER CLICKS ON RUNNING BALANCE CHECKBOX
                        BalanceCheckbox.addEventListener("click", () => {
                            if (BalanceCheckbox.checked === true) {
                                BalanceCheckbox.checked = true;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table headers
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("RunningBalance" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "table-cell";
                                            headerisDisplayed = true;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName ===
                                                    "RunningBalance"
                                                ) {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //THEN ALSO THE TDs SHOULD BE TRUE
                                            //GET ALL THE TD IN THE TABLE UNDER RUNNING BALANCE
                                            const myTableColumns =
                                                document.querySelectorAll(".runningBalance"); // get RUNNING BALANCE table rows

                                            myTableColumns.forEach((column) => {
                                                column.style.display = "table-cell"; //LOOP DISPLAYING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                            //start the progress bar
                                            spinner.style.display = "block";
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            } else if (BalanceCheckbox.checked === false) {
                                BalanceCheckbox.checked = false;
                                isChecked = false;
                                const tableHeaders = document.querySelectorAll(
                                    ".income-list-table thead th"
                                ); // get all table rows
                                tableHeaders.forEach((theader, index) => {
                                    headerNamefcb = theader.innerText
                                        .replace(/[\n\u2191\u2193]/g, "")
                                        .split(/[\(\{\"]/)[0]
                                        .trim(); // get the text content of the header cell
                                    if ("RunningBalance" === headerNamefcb) {
                                        if (index !== 1) {
                                            //DO NOT SHOW THE HIDDEN ID COLUMN
                                            theader.style.display = "none";
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                            headerisDisplayed = false;
                                            //NOW LOOP IN THE HEADERSTATUS ARRAY UPDATING THE ISDISPLAYED VALUE
                                            for (let i = 0; i < headersStatus.length; i++) {
                                                if (
                                                    headersStatus[i].HeaderName ===
                                                    "RunningBalance"
                                                ) {
                                                    headersStatus[i].isDisplayed = false;
                                                }
                                            }
                                            //GET ALL THE TD IN THE TABLE UNDER CASH EQUIV
                                            const myTableColumns =
                                                document.querySelectorAll(".runningBalance"); // get RUNNING BALANCE table rows
                                            myTableColumns.forEach((column) => {
                                                column.style.display = "none"; //LOOP HIDDING THE TDS
                                            });
                                            //THEN SEND INFORMATION TO THE DATABASE, UPDATING ONLY THE RUNNING BALANCE STATUS NOT THE ENTIRE COLLECTION
                                            fetch("/updateHeaderStatusPayin", {
                                                //THIS IS AN API END POINT TO CARRY THE VARIABLE NAMES TO ANOTHER JS MODULE WHICH WILL BE THE SEVER
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    headerNamefcb,
                                                    headerisDisplayed,
                                                }),
                                            })
                                                .then((response) => response.json())
                                                .then((data) => {
                                                    // Show alert
                                                    if (data.isSaving) {
                                                        spinner.style.display = "none"; //remove progress bar
                                                    }
                                                })

                                                .catch((error) => {
                                                    console.error(
                                                        `Error updating Date field for expense ID: ${incomeId}`,
                                                        error
                                                    );
                                                });
                                        }
                                    }
                                });
                            }
                        });
                        //=====================================================================================================================
                        //FUNCTION TO TRUNCATE(KUGURA LONG TEXT TICHIZOISA MA DOTS)
                        function truncateText(text, maxLength) {
                            if (text.length <= maxLength) {
                                return text;
                            }
                            // Truncate the text and add ellipsis
                            return text.substring(0, maxLength - 3) + "...";
                        }
                        //===========================================================================================
                        let selectedDate = ""; //CREATE AN EMPTY VARIABLE TO STORE THE DATE VALUE FROM THE DATE RANGE FIELD
                        //================================================================================================

                        //FUNCTION TO CLOSE THE INCOME FORM IF THE USER CLICKS ANYWHERE
                        //THIS IS FOR THE income-FORM CATEGORY DROPDOWN MENU
                        const categoryBtn =
                            document.querySelector(".cate-Btn-Span");
                        const categoriesMenu =
                            document.querySelector(".InCategories");
                        const categoryCaret = document.querySelector(".ccaret");

                        //THIS IS FOR THE SELECT PAYMENT TYPE DROPDOWN MENU
                        const selectBtn = document.querySelector(".select-btn");
                        const selectMenu =
                            document.querySelector(".Incomecurrencies");
                        const caret = document.querySelector(".caret");

                        categoryBtn.addEventListener("click", function () {
                            if (selectMenu.classList.contains("IncomeCurr-open")) {
                                caret.classList.remove("caret-rotate");
                                selectMenu.classList.remove("IncomeCurr-open");
                            }
                            categoryCaret.classList.toggle("ccaret-rotate");
                            categoriesMenu.classList.toggle("IncomeCate-open");
                        });

                        //when the categories categoriesMenu is open, loop thru all the list of Categories putting the event listeners
                        const catOptions =
                            document.querySelectorAll(".cate-option");
                        catOptions.forEach((categoryOptions) => {
                            categoryOptions.addEventListener("click", function () {
                                //when the category has been selected, let it be shown on the screen by renaming 'Category... into the selected category'
                                document.querySelector(".cate-Btn-Span").innerText =
                                    categoryOptions.innerText;

                                categoryCaret.classList.remove("ccaret-rotate");
                                categoriesMenu.classList.remove("IncomeCate-open");
                            });
                        });

                        selectBtn.addEventListener("click", function () {
                            if (
                                categoriesMenu.classList.contains("IncomeCate-open")
                            ) {
                                categoryCaret.classList.remove("ccaret-rotate");
                                categoriesMenu.classList.remove("IncomeCate-open");
                            }
                            // add the rotate style to the caret element
                            caret.classList.toggle("caret-rotate");
                            // then make the dropdown open
                            selectMenu.classList.toggle("IncomeCurr-open");
                        });

                        //when the currencies dropdown is open, loop thru all the list of currencies puting the event listeners
                        const options = document.querySelectorAll(".option");
                        options.forEach((option) => {
                            option.addEventListener("click", function () {
                                //when the currency has been selected, let it be shown on the screen by renaming 'Select Payment Type into the selected currency'
                                document.querySelector(".btn-text").innerText =
                                    option.innerText;

                                const formRate = document.getElementById("label-rate");
                                //update the text content of the rate span with the corresponding rate
                                //loop thru the currencies array checking if the selected currency matches the currency name in the array if it does collect
                                //the  rate of the matched currency name
                                for (let i = 0; i < newCurrencies.length; i++) {
                                    const currency_rate = newCurrencies[i];
                                    if (
                                        option.innerText === currency_rate.Currency_Name
                                    ) {
                                        const rateSpan = currency_rate.RATE;
                                        formRate.innerText = rateSpan;
                                    }
                                }
                                // rateSpan.innerText = option.dataset.rate;
                                //then rotate the caret to its normal position
                                caret.classList.remove("caret-rotate");
                                //and close the dropdown menu
                                selectMenu.classList.remove("IncomeCurr-open");
                                //Soon after adding the name, add all other things like the rate and so forth...
                            });
                        });

                        // //This Functions opens up that page where you select the created multiple currencies
                        // function openMultipleCurrencies() {
                        //     //we have to add event listeners to the currencies names so that when clicked, they go onto where it is written payment type and click the name to the currency
                        //     const currencyoptions =
                        //         document.querySelectorAll("#paymentid");
                        //     currencyoptions.forEach((currencyoption) => {
                        //         currencyoption.addEventListener("click", function () {
                        //             document.querySelector(
                        //                 "#select-payment-type-btn"
                        //             ).innerText = currencyoption.innerText;
                        //             document.querySelector(
                        //                 "#select-payment-type"
                        //             ).style.display = "none";
                        //         });
                        //     });
                        //     //Then drop down thelist
                        //     const selectPaymentType = document.querySelector(
                        //         "#select-payment-type"
                        //     );
                        //     selectPaymentType.style.display =
                        //         selectPaymentType.style.display = "block";
                        // }
                        //=================================================================================================
                        //FUNCTION TO CALCULATE THE RUNNING BALANCE

                        //===================================================================================================
                        function dateValidation(csvDate) {
                            let formattedDate = "";
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
                            csvDate = csvDate.replace(/[.,-]/g, "/");
                            const parts = csvDate.split("/");
                            if (parts.length === 3) {
                                const day = parseInt(parts[0]);
                                const month = parseInt(parts[1]);
                                //  const year = parseInt(parts[2]);
                                let year = 0;
                                //check if the length of the part year is ===4
                                //if ===2 add the 20 pekutanga
                                if (parts[2].length === 4) {
                                    year = parseInt(parts[2]);
                                } else if (parts[2].length === 2) {
                                    year = "20" + parseInt(parts[2]);
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
                            return formattedDate;
                        }
                        //================================================================================================
                        const deleteModal = document.querySelector(".deleteModal");
                        //FUNCTION CONTAINING EVENT LISTENERS FOR THE ALREADY EXISTING ENTRIES OR ROWS
                        function theAlreadyExistingRow(newEmptyRow) {
                            let rowId = newEmptyRow.querySelector(".incomeIdClass").innerText;
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
                                    if (document.getElementById("myCheck").checked === true) {
                                        document.getElementById("myCheck").checked = false
                                    }

                                    if (checkedRowsId.length === 0) {
                                        deleteModal.style.display = "none";
                                    }
                                }
                            });

                            const incomeDateCell = newEmptyRow.querySelector(".incomeDate");
                            incomeDateCell.addEventListener("keydown", function (event) {
                                // remove the message displaying on the table
                                tableErrorMsgs.style.display = "none";
                                const keyCode = event.keyCode;
                                if (
                                    (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    keyCode == 191 ||
                                    keyCode == 111 || // forward slash (/) on regular or numeric keyboard
                                    keyCode == 8 || // backspace
                                    keyCode == 9 || // tab
                                    keyCode == 37 ||
                                    keyCode == 39 || // left and right arrow keys
                                    (keyCode >= 96 && keyCode <= 105) || // numeric keypad
                                    keyCode == 109 ||
                                    keyCode == 189 || // hyphen (-)
                                    keyCode == 190 ||
                                    keyCode == 110 ||
                                    keyCode == 188 ||
                                    keyCode == 188 || // backspace
                                    keyCode == 190
                                ) {
                                    // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }

                                if (event.key === "Enter" || event.key === "Tab") {
                                    //WHEN ENTER IS CLICKED
                                    event.preventDefault();
                                    let newDate = dateValidation(
                                        incomeDateCell.innerText
                                    );
                                    if (newDate !== "") {
                                        incomeDateCell.innerText = newDate;
                                    } else if (newDate === "") {
                                        incomeDateCell.focus();
                                        notification("invalid date format");
                                        return;
                                    }
                                    const rowId = newEmptyRow
                                        .querySelector(".incomeIdClass")
                                        .textContent.trim();
                                    incomeDateCell.blur();

                                    spinner.style.display = "block";
                                    //UPDATE THE ARRAY
                                    for (let a = 0; a < cashFlowArray.length; a++) {
                                        const income = cashFlowArray[a];
                                        if (income._id === rowId && income.CashFlowType === 'Pay in') {
                                            income.CashFlowDate = incomeDateCell.innerText
                                        }

                                    }
                                    //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                                    const parts = (incomeDateCell.innerText).split("/");
                                    const formattedDate =
                                        parts[1] + "/" + parts[0] + "/" + parts[2];
                                    const formattedDates2 = new Date(formattedDate);
                                    startDate = new Date(formattedDates2); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    endDate = new Date(formattedDates2);

                                    // remove the stored date range from local storage
                                    localStorage.removeItem("firstDate");
                                    localStorage.removeItem("lastDate");
                                    // Store the start and end date values in localStorage
                                    localStorage.setItem("firstDate", startDate);
                                    localStorage.setItem("lastDate", endDate);

                                    //  use the fetch for the route with POST method and update the income rate in the database
                                    fetch("/updateCashFlowDate", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            rowId,
                                            newDate,
                                        }),
                                    }).then((response) => response.json()).then((data) => {
                                        // Show alert
                                        if (data.amUpdated === true) {
                                            spinner.style.display = "none";
                                            sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                            eDate = localStorage.getItem("lastDate");
                                            const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                            const endDate = new Date(eDate);
                                            myDatePicker(startDate, endDate)
                                            defaultDisplayContent(startDate, endDate)
                                            notification("Updated");

                                        } else if (data.amUpdated === false) {
                                            spinner.style.display = "none";
                                            notification("Updated");

                                        }
                                    }).catch((error) => {
                                        console.error(`Error updating Date field for expense ID: ${rowId}`, error);
                                    });
                                }
                            }
                            );
                            //===============================================================================================
                            //VAT CELL
                            const vatBtn = newEmptyRow.querySelector(".radio-check-input");
                            const taxCell = newEmptyRow.querySelector(".radioBtn");
                            vatEntry = {}; taxDataToUpdate = []; ztfEntry = {}; taxDataToUpdate = []
                            let previousState = vatBtn.checked;//get the radio button checked status before click
                            let prevStat = vatBtn.checked;//get the radio button checked status before click

                            taxCell.addEventListener("click", function (event) {
                                vatRowId = rowId
                                const radioButton = event.target;
                                let currentState = null //to store the current stattus upon click
                                if (previousState) {
                                    currentState = false
                                } else {
                                    event.preventDefault()
                                    currentState = true
                                }
                                //this condition will be based on the previous status that we will be able to toggle  check and uncheck
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
                                const noRemoveVat = document.getElementById('noUndoVat');
                                // vat function on uncheck and check
                                noRemoveVat.addEventListener('click', (event) => {
                                    event.preventDefault();
                                    previousState = prevStat
                                    //close the edit modal ans the submenu
                                    vatModal.style.display = 'none'
                                })
                                // Update the previous state to the current state after the click
                                previousState = currentState;
                            });
                            let allItems = newEmptyRow.querySelectorAll('.Taxdropdown-menu a')
                            //when the user clicks on each tax dropdown item
                            allItems.forEach(item => {
                                item.addEventListener('click', (event) => {
                                    event.preventDefault()
                                    taxtypeSelected = item.innerText
                                    newEmptyRow.querySelector(`.Taxdropdown-menu ul`).style.display = 'none' //remove anysubmenu still attached to the dropdown
                                    createSubMenu()
                                })
                            })
                            function createSubMenu() {
                                // Clear existing submenu content
                                let allTaxRows = newEmptyRow.querySelectorAll(`.Taxdropdown-menu ul tr`)
                                //loop in all the existing vatdropdown table row and remove them
                                if (allTaxRows.length > 0) {
                                    for (let h = 0; h < allTaxRows.length; h++) {
                                        const el = allTaxRows[h];
                                        el.style.display = 'none';
                                    }
                                }
                                //loop in all the diplayed data from database and access the vat and ztf data 
                                for (let i = 0; i < itemsToProcess.length; i++) {
                                    const el = itemsToProcess[i];
                                    let vat = el.Tax.vat
                                    let ztf = el.Tax.ztf
                                    //get the row data and the data from db on that vat and ztf if they have been entered if the given condition meet
                                    if (taxtypeSelected === 'vat' && rowId === el._id) {
                                        rowData = ["QRCode", "DeviceId", "ZimraFsNo", 'VatNumber', 'TinNumber', "VatAmount"];
                                        rowDataFromDb = [vat.QRCode, vat.DeviceId, vat.ZimraFsNo, vat.VatNumber, vat.TinNumber, vat.VatAmount]
                                    }
                                    else if (taxtypeSelected === 'ztf' && rowId === el._id) {
                                        rowData = ["First", "Second", "LevyAmount"];
                                        rowDataFromDb = [ztf.First, ztf.Second, ztf.LevyAmount]
                                    }
                                }

                                // Create a new table row (<tr>) element
                                const newRow = document.createElement("tr");
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
                                    if (taxtypeSelected === 'vat') {
                                        editableText.id = `editable-vattext${i}`;

                                    }
                                    else if (taxtypeSelected === 'ztf') {
                                        editableText.id = `editable-ztftext${i}`;

                                    }
                                    // Check if the value from rowDataFromDb is not empty or zero
                                    if (rowDataFromDb[i] !== "" && rowDataFromDb[i] !== 0) {
                                        editableText.innerText = rowDataFromDb[i]; // Set the value if valid
                                    } else {
                                        editableText.innerText = ""; // Placeholder text if empty or zero
                                    }

                                    // editableText.style.fontStyle = 'italic'
                                    // Add the label and editable text to the cell
                                    newCell.appendChild(label);
                                    newCell.appendChild(editableText);
                                    // Add a click event to trigger the floating effect and make the text editable
                                    newCell.addEventListener("click", function () {
                                        // If there is a previously clicked cell, reset it
                                        if (lastClickedCell && lastClickedCell !== newCell) {
                                            resetCell(lastClickedCell);
                                        }
                                        // Mark the current cell as clicked
                                        newCell.classList.add("clicked");
                                        // editableText.innerText = ''
                                        // Make the editable text area focusable and allow text input
                                        editableText.contentEditable = true; // Enable content editing
                                        editableText.focus();  // Focus on the content area so the user can type

                                        // Update last clicked cell
                                        lastClickedCell = newCell;
                                    });
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
                                // Add the table to the submenu
                                newEmptyRow.querySelector(`.VatDropdown-menu`).appendChild(myTable);
                                newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'block'

                                // Cancel (✕) icon functionality
                                cancelIcon.addEventListener('click', function () {
                                    newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'none';
                                })

                                // Yes Tick (✓) icon functionality
                                yesTick.addEventListener('click', function () {
                                    if (taxtypeSelected === 'vat') {
                                        taxDataToUpdate = []//empty this array first
                                        let VatStatus = ""
                                        let editableTextVatAmount = 0
                                        // Collect the editable text from the current row attached to the dropdown menu in table 
                                        const editableTextQRCode = newEmptyRow.querySelector(`#editable-vattext0`).innerText; // QRCode field
                                        const editableTextDeviceId = newEmptyRow.querySelector(`#editable-vattext1`).innerText; // DeviceId field
                                        const editableTextZimraFsNo = newEmptyRow.querySelector(`#editable-vattext2`).innerText; // ZimraFsNo field
                                        const editableTextVatNumber = newEmptyRow.querySelector(`#editable-vattext3`).innerText; // VatNumber field
                                        const editableTextTinNumber = newEmptyRow.querySelector(`#editable-vattext4`).innerText; // VatNumber field
                                        editableTextVatAmount = Number(newEmptyRow.querySelector(`#editable-vattext5`).innerText); // VatAmount field

                                        //check if all the data is not equal to defaults values
                                        if (editableTextVatAmount === 0) {
                                            VatStatus = 'N'
                                            taxStatus = "N"
                                        }
                                        else {
                                            VatStatus = 'Y'
                                            taxStatus = "Y"
                                        }
                                        // Create a vatEntry object with the collected data
                                        vatEntry = {
                                            QRCode: editableTextQRCode,
                                            DeviceId: Number(editableTextDeviceId),
                                            ZimraFsNo: editableTextZimraFsNo,
                                            VatNumber: Number(editableTextVatNumber),
                                            TinNumber: Number(editableTextTinNumber),
                                            VatAmount: editableTextVatAmount,
                                            VatStatus: VatStatus, // Add additiol status or logic if needed
                                            taxName: taxtypeSelected, // Add additional status or logic if needed
                                        };
                                        taxDataToUpdate.push(vatEntry)
                                        updateTaxStatus(taxStatus, taxDataToUpdate, rowId)

                                    }

                                    if (taxtypeSelected === 'ztf') {
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
                                            ztfStat = 'Y'
                                            taxStatus = "Y"
                                        }
                                        // Create a ztfEntry object with the collected data
                                        ztfEntry = {
                                            First: editableTextFirst,
                                            Second: editableTextSecond,
                                            LevyAmount: editableTextLevyAmount,
                                            ZtfStatus: ztfStat, // Add additional status or logic if needed
                                            taxName: taxtypeSelected, // Add additional status or logic if needed
                                        };
                                        taxDataToUpdate.push(ztfEntry)
                                        updateTaxStatus(taxStatus, taxDataToUpdate, rowId)
                                    }
                                });
                            }

                            // Function to reset a previously clicked cell
                            function resetCell(cell) {
                                cell.classList.remove("clicked");  // Remove the floating label effect
                                const editableText = cell.querySelector(".editable-text");
                                editableText.contentEditable = false; // Disable content editing
                            }

                            // Add event listener to the document to handle clicks
                            document.addEventListener("mousedown", function handleClickOutsideBox(event) {
                                // Reference to the dropdown and radio button
                                const dropdown = newEmptyRow.querySelector('.Taxdropdown-menu'); // Dropdown menu
                                const subMenu = newEmptyRow.querySelector('.Taxdropdown-menu ul'); // Dropdown menu
                                // Check if the click is inside the editable area or dropdown
                                const clickedInsideDropdown = dropdown.contains(event.target);
                                if (!clickedInsideDropdown) {
                                    // If clicked outside both editable area and dropdown, close the dropdown and uncheck the radio button
                                    dropdown.style.display = 'none'; // Close dropdown
                                    subMenu.style.display = 'none'; // Close dropdown
                                }

                            });

                            //=================================================================================================================

                            // INVOICE CELL
                            const incomeInvoiceRefCell = newEmptyRow.querySelector(".editableInvoice");
                            incomeInvoiceRefCell.addEventListener("keypress", function (event) {
                                if (event.key === "Enter") {
                                    // prevent the default behavior of the enter key
                                    event.preventDefault();
                                    // get the new value of the expense rate from the edited cell
                                    const InvoiceRef = event.target.innerText;
                                    const rowId = newEmptyRow
                                        .querySelector(".incomeIdClass")
                                        .textContent.trim();
                                    spinner.style.display = "block";
                                    incomeInvoiceRefCell.blur(); //REMOVE FOCUS ON THE CELL
                                    //  use the fetch for the route with POST method and update the expense rate in the database
                                    fetch("/updateCashFlowInvoice", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            rowId,
                                            InvoiceRef,
                                        }),
                                    })
                                        .then((response) => response.json())
                                        .then((data) => {
                                            // Show alert
                                            if (data.amUpdated) {
                                                notification("Updated");
                                                spinner.style.display = "none";
                                                defaultDisplayContent(startDate, endDate)
                                            }
                                        })
                                        .catch((error) => {
                                            console.error(
                                                `Error updating Invoice field for expense ID: ${rowId}`,
                                                error
                                            );
                                        });
                                }
                            }
                            );
                            //LISTENER FOR DESCRIPTION CELL
                            //CODE FOR UPDATE FORM DISPLAY WHEN DESCRIPTION CELL IS CLICKED
                            const incomeDescriptionCell = newEmptyRow.querySelector(".editable-cell");
                            const incomeDescriptionCellSpan = newEmptyRow.querySelector(".descriptionId");
                            incomeDescriptionCell.addEventListener("click", function (event) {
                                //now display full text
                                incomeDescriptionCell.innerText = incomeDescriptionCellSpan.innerText
                                // Add an event listener to all editable cells
                                const range = document.createRange();
                                const selection = window.getSelection();

                                range.selectNodeContents(this);
                                range.collapse(false); // Move the cursor to the end of the text
                                selection.removeAllRanges();
                                selection.addRange(range);
                            });
                            incomeDescriptionCell.addEventListener("keydown", function (event) {
                                if ((event.keyCode >= 65 && event.keyCode <= 90) || // A-Z
                                    (event.keyCode >= 97 && event.keyCode <= 122) || // a-z
                                    event.keyCode === 8 || // Backspace
                                    event.keyCode === 46 || // Delete
                                    event.keyCode === 37 || // Left arrow
                                    event.keyCode === 39 || // Right arrow
                                    event.keyCode === 32 || // Space
                                    event.keyCode === 188 || // Comma (,)
                                    event.keyCode === 190 ||// Full stop (.)
                                    event.keyCode >= 48 && event.keyCode <= 57//numbers
                                ) { //allow input
                                }
                                else {
                                    event.preventDefault()
                                }
                                //NOW SHOW DROPDOWNS WHEN ENTER IS CLICKED
                                if (event.key === 'Enter' || event.key === 'Tab') {
                                    const description = incomeDescriptionCell.innerText
                                    incomeDescriptionCell.blur()
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
                                                defaultDisplayContent(startDate, endDate)
                                                spinner.style.display = 'none'
                                                notification('Updated')

                                            }
                                        })
                                        .catch(error => {
                                            console.error(`Error updating shift field for expense ID: ${rowId}`, error);
                                        });
                                }
                            })

                            //=======================================================================================                                   
                            //CHECK IF CATEGORY CELL IS DISPLAYED
                            //get the category dropdown menu and caret
                            const categoriesCell = newEmptyRow.querySelector(".categories-cell");
                            function createNewCategory() {
                                //display the create category form
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
                                const insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                //gara wias a focus in the input field
                                insertedCategoryName.focus()
                                //limit the words length to 25
                                insertedCategoryName.maxLength = 25
                                const submitButton = newEmptyRow.querySelector('.submitCat')

                                //on click of the add button send data to database
                                submitButton.addEventListener('click', function (event) {
                                    event.preventDefault(); // Prevent form submission
                                    let insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                    insertedCategoryName.value = ((insertedCategoryName.value).replace(/ /g, "_")).toLowerCase();
                                    //STORE THE ORIGINAL NAME WITH UNDERSCORE IN LOCAL STORAGE
                                    //on click of the add button send data to database
                                    let newCategory = (insertedCategoryName.value).replace(/_/g, " ");
                                    newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    newEmptyRow.querySelector('.categorySpan').innerText = newCategory
                                    //STORE THE VALUE IN LOCAL STORAGE
                                    let categoryToDb = []
                                    //get the inserted value
                                    let payInCat = {};
                                    payInCat["category"] = insertedCategoryName.value;
                                    payInCat["CategoryLimit"] = 0;
                                    payInCat["CategoryLimitRange"] = "";
                                    payInCat["Balance"] = "PayIn";
                                    const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === insertedCategoryName.value)
                                    if (!categoryName) {
                                        categoryToDb.push(payInCat)
                                    }
                                    else if (categoryName) {
                                        notification('category Already Exist')
                                        return
                                    }
                                    insertCategoryRecord(categoryToDb)
                                    //send to db a category with underscore and lowercase
                                    newCategory = ((insertedCategoryName.value).replace(/ /g, "_")).toLowerCase();
                                    categoryTodatabase(newCategory)
                                })
                            }
                            //When the categories dropdown is open, loop thru all the list of Categories putting the event listeners
                            //loop through all the category options in the dropdown
                            const incomeDropdownOptions = newEmptyRow.querySelectorAll(".incCate-option");
                            incomeDropdownOptions.forEach((cat, i) => {
                                cat.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    const incomeSpan = newEmptyRow.querySelector(".categorySpan");
                                    if (i === 0) {
                                        event.stopPropagation();
                                        createNewCategory()
                                    }
                                    else {
                                        //GET THE SELECTED CATEGORY AND UPDATE THE CATEGORY CELL WITH ITS VALUE
                                        let newCategory = cat.querySelector(".cateList-optionSpan").innerText;
                                        newCategory = ((newCategory).replace(/_/g, " "))
                                        newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        incomeSpan.innerText = newCategory;
                                        //SEND TO DATABSE ONE WITH UNDERSCORE
                                        newCategory = ((newCategory).replace(/ /g, "_")).toLowerCase();
                                        categoryTodatabase(newCategory)
                                    }
                                });
                            })

                            //function to update category cell in database
                            function categoryTodatabase(newCategory) {
                                const rowId = newEmptyRow
                                    .querySelector(".incomeIdClass")
                                    .textContent.trim();
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
                                            defaultDisplayContent(startDate, endDate)
                                            notification("Updated");
                                            spinner.style.display = "none";
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(
                                            `Error updating base category field `,
                                            error
                                        );
                                    });
                            }
                            //CLOSE THE CATEGORY DROPDOWN IF USER CLICKS ANYWHERE
                            //CLOSE THE CATEGORY DROPDOWN IF USER CLICKS ANYWHERE
                            document.addEventListener("mousedown", function handleClickOutsideBox(event) {
                                const forms = document.querySelectorAll('#dropdownForm');
                                forms.forEach(form => {
                                    const inputField = form.querySelector('.categoryNameClass');
                                    // Check if the form is visible
                                    if (form.style.display === 'block') {
                                        // Check if the clicked element is outside the form and not the input
                                        if (!form.contains(event.target) && !inputField.contains(event.target)) {
                                            form.style.display = 'none';
                                        }

                                    }

                                });
                            });
                            //=====================================================================================
                            //currencies cell on click action to display dropdown
                            const currency_Name = newEmptyRow.querySelector(".currencies-cell");

                            const CurrencyOptions = newEmptyRow.querySelectorAll(".curr-option");
                            const CurrencySpan = newEmptyRow.querySelector(".currbtnSpan");
                            CurrencyOptions.forEach((currencyOption) => {
                                currencyOption.addEventListener("click", function (event) {
                                    event.preventDefault();
                                    const newCurrency = currencyOption.innerText;
                                    CurrencySpan.innerText = newCurrency;
                                    //CHANGE THE SYMBOLS BASED WITH THE CURRENCY SELECTED
                                    const currName = Array.from(WorldCurrencies).find(
                                        (curr) => (curr.Currency_Name).toLowerCase() === (newCurrency).toLowerCase()
                                    ); //find matching currency name with the one in the incomes table
                                    if (currName) {
                                        newCurrCode = currName.ISO_Code;
                                        //get the base currency
                                        const currencies = Array.from(newCurrencies).find(
                                            (newCurrency) =>
                                                newCurrency.BASE_CURRENCY === "Y"
                                        ); //find the base currency
                                        if (currencies) {
                                            const currSymbol = Array.from(
                                                WorldCurrencies
                                            ).find(
                                                (curr) =>
                                                    (curr.Currency_Name).toLowerCase() ===
                                                    (currencies.Currency_Name).toLowerCase()
                                            ); //find matching currency name with the one in the incomes table
                                            baseCurrCode = currSymbol.ISO_Code;
                                        }
                                    }
                                    //GET THE SELECTED currency AND UPDATE THE currency CELL WITH ITS VALUE
                                    //get reference for the rate span in the table
                                    const rateCell = newEmptyRow.querySelector(".incRate");
                                    //fill the rate cell with the corresponding rate
                                    for (let i = 0; i < newCurrencies.length; i++) {
                                        const currencyRate = newCurrencies[i];
                                        if (newCurrency === currencyRate.Currency_Name) {
                                            const newCashFlowRate = currencyRate.RATE;
                                            rateCell.innerText = newCashFlowRate; //CHANGE THE INTERFACE RATE
                                            //CALCULATE THE NEW CASH AND CASHEQUIV
                                            const incAmount =
                                                newEmptyRow.querySelector(
                                                    ".incAmount"
                                                ).innerText;
                                            const currencies = Array.from(
                                                newCurrencies
                                            ).find(
                                                (newCurrency) =>
                                                    newCurrency.BASE_CURRENCY === "Y"
                                            ); //find the base currency
                                            //calculate the relative rate to be used
                                            const relativeRate = newCashFlowRate / currencies.RATE;
                                            //calculate the cash equivalents
                                            const cashEquivValue2 = parseFloat(incAmount) / parseFloat(relativeRate);
                                            //PLACE SYMBOLS WHERE APPROPRIATE
                                            newEmptyRow.querySelector(".symbol").innerText = newCurrCode;
                                            newEmptyRow.querySelector(".symbol1").innerText = newCurrCode;

                                            //    rowSymbol = currName.symbols;
                                            newEmptyRow.querySelector(".Equivsymbol").innerText = baseCurrCode;
                                            newEmptyRow.querySelector(".cashEquivCell").innerText = Number(cashEquivValue2).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                            //UPDATE ALL TOTALS
                                            document.querySelector(".totalIncome").innerText = Number(totalPayinsRange).toFixed(2);
                                            const cashBalance = (parseFloat(totalPayinsRange) + parseFloat(openingBalance)) - parseFloat(totalPayOutsRange)

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
                                    }
                                }
                                );
                            });
                            function currencyToDatabase(rowId, newCurrency, cashEquivValue2, newCashFlowRate) {
                                fetch("/updateCashFlowCurrency", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        rowId,
                                        newCurrency,
                                        cashEquivValue2,
                                        newCashFlowRate,
                                    }),
                                })
                                    .then((response) => response.json())
                                    .then((data) => {
                                        // Show alert
                                        if (data.amUpdated) {
                                            spinner.style.display = "none";
                                            defaultDisplayContent(startDate, endDate)
                                            notification("Updated");
                                        }
                                    })

                                    .catch((error) => {
                                        console.error(
                                            `Error updating base currency field for  ID: ${rowId}`,
                                            error
                                        );
                                    });
                            }
                            //===============================================================================
                            //CODE FOR THE income AMOUNT CELL EVENT HANDLER IF USER ENTERS THE AMOUNT , IT CALCULATE THE CASH EQUIVALENT VALUE BASED ON THE BASE CURRENCY SELECTED
                            const incomeAmount = newEmptyRow.querySelector(".incAmount");
                            // add an event listener to the cell for key press events
                            incomeAmount.addEventListener(
                                "keydown",
                                function (event) {
                                    const keyCode = event.keyCode;
                                    if (
                                        (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                        (keyCode >= 96 && keyCode <= 105) ||
                                        keyCode == 13 || // numeric keypad
                                        keyCode == 8 || // backspace
                                        keyCode == 9 || // tab
                                        keyCode == 190 ||
                                        keyCode == 37 ||
                                        keyCode == 39
                                    ) {
                                        // tab) { // Enter key { // numeric keypad
                                    } else {
                                        // Prevent input
                                        event.preventDefault();
                                    }
                                    if (event.key === "Enter") {
                                        // prevent the default behavior of the enter key
                                        event.preventDefault();
                                        // get the new value of the expense rate from the edited cell
                                        const newCashFlowAmount = event.target.innerText;
                                        if (newCashFlowAmount === "") {
                                            notification("Field Can not Be Empty");
                                            incomeAmount.focus(); // Remove focus from amount cell
                                            return;
                                        } else {
                                            const rowId = newEmptyRow
                                                .querySelector(".incomeIdClass")
                                                .textContent.trim();
                                            const incId = Array.from(cashFlowArray).find(
                                                (inc) => inc._id === rowId
                                            ); //find the id equal to the expenseId
                                            const currencies = Array.from(newCurrencies).find(
                                                (newCurrency) =>
                                                    newCurrency.BASE_CURRENCY === "Y"
                                            ); //find the base currency
                                            //calculate the relative rate to be used
                                            const relativeRate =
                                                incId.CashFlowRate / currencies.RATE;
                                            //calculate the cash equivalents
                                            const cashEquivValue3 = Number(
                                                parseFloat(newCashFlowAmount) /
                                                parseFloat(relativeRate)
                                            ).toFixed(2);
                                            const currName = Array.from(WorldCurrencies).find(
                                                (curr) =>
                                                    (curr.Currency_Name).toLowerCase() ===
                                                    (currencies.Currency_Name).toLowerCase()
                                            ); //find matching currency name with the one in the incomes table
                                            if (currName) {
                                                baseCurrCode = currName.ISO_Code;
                                            }
                                            //NOW LOOP IN THE INCOME ARRAY UPDATING THE  AMOUNT AND CASHEQUIV VALUES
                                            for (let i = 0; i < cashFlowArray.length; i++) {
                                                if (cashFlowArray[i]._id === rowId && cashFlowArray[i].CashFlowType === 'Pay in') {
                                                    //calculate the updated total payin value
                                                    totalPayinsRange = parseFloat(totalPayinsRange) + (parseFloat(cashEquivValue3) - parseFloat(incId.CashFlowCashEquiv))
                                                    //update the rate
                                                    cashFlowArray[i].CashFlowAmount = newCashFlowAmount;
                                                    //update the cash equiv
                                                    cashFlowArray[i].CashFlowCashEquiv =
                                                        cashEquivValue3;
                                                }
                                            }
                                            //PLACE THE SYMBOLS WHERE APPROPRIATE
                                            newEmptyRow.querySelector(".Equivsymbol").innerText = baseCurrCode;
                                            newEmptyRow.querySelector(".cashEquivCell").innerText = Number(cashEquivValue3).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                            //UPDATE THE TOTALS
                                            const cashBalance = (parseFloat(totalPayinsRange) + parseFloat(openingBalance)) - parseFloat(totalPayOutsRange)

                                            document.querySelector(".totalIncome").innerText = Number(parseFloat(totalPayinsRange)).toFixed(2);
                                            if (cashBalance < 0) {
                                                //if the number is negative
                                                const numberString = cashBalance.toString(); //convert to string so that you can use the split method
                                                formattedValue = numberString.split("-")[1];
                                                document.querySelector(".CashBalance").style.color = "red";
                                                const updatedValue = "-" + baseCurrCode + Number(formattedValue).toFixed(2);
                                                newEmptyRow.querySelector(".runningBalance").innerText = updatedValue;
                                            } else if (cashBalance >= 0) {
                                                document.querySelector(".CashBalance").style.color = "black";
                                                document.querySelector(".CashBalance").innerText = baseCurrCode + "    " + Number(cashBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                            }
                                            // use the fetch for the route with POST method and update the income rate in the database
                                            spinner.style.display = "block";
                                            incomeAmount.blur();
                                            fetch("/updateCashFlowAmount", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                },
                                                body: JSON.stringify({
                                                    rowId,
                                                    newCashFlowAmount,
                                                    cashEquivValue3,
                                                }),
                                            }).then((response) => response.json()).then((data) => {
                                                // Show alert
                                                if (data.amUpdated) {
                                                    //call the defaultdisplay function
                                                    //GET THE L/S STORED STARTIND DATE AND THE END DATE
                                                    sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                                    eDate = localStorage.getItem("lastDate");
                                                    startDate = new Date(sDate)
                                                    endDate = new Date(eDate)
                                                    defaultDisplayContent(startDate, endDate)
                                                    notification("Updated");
                                                    spinner.style.display = "none";

                                                }
                                            }).catch((error) => {
                                                console.error(
                                                    `Error updating base amount field for income ID: ${rowId}`,
                                                    error
                                                );
                                            });
                                        }
                                    }
                                }
                            );

                            //===============================================================================
                            const incomeRate = newEmptyRow.querySelector(".incRate");
                            //CODE FOR THE income rate CELL EVENT HANDLER IF USER ENTERS THE AMOUNT , IT CALCULATE THE CASH EQUIVALENT VALUE BASED ON THE BASE CURRENCY SELECTED
                            // add an event listener to the cell for key press events
                            incomeRate.addEventListener("keypress", function (event) {
                                const keyCode = event.keyCode;
                                if (
                                    (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode >= 96 && keyCode <= 105) ||
                                    keyCode == 13 ||
                                    event.keyCode === 37 ||
                                    event.keyCode === 39
                                ) {
                                    // numeric keypad
                                    // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }
                                if (event.key === "Enter") {
                                    // prevent the default behavior of the enter key
                                    event.preventDefault();
                                    // get the new value of the income rate from the edited cell
                                    const newCashFlowRate = event.target.innerText;
                                    if (newCashFlowRate === "") {
                                        notification("Field Can not Be Empty");
                                        incomeRate.focus(); // Remove focus from amount cell
                                        return;
                                    } else {
                                        // get the income ID of the row that was edited
                                        const currencies = Array.from(newCurrencies).find(
                                            (newCurrency) => newCurrency.BASE_CURRENCY === "Y"
                                        ); //find the base currency
                                        //GET THE BASE CURRENCY SYMBOL
                                        const checkSymbol = Array.from(
                                            WorldCurrencies
                                        ).find(
                                            (curr) =>
                                                (curr.Currency_Name).toLowerCase() === (currencies.Currency_Name).toLowerCase()
                                        );
                                        if (checkSymbol) {
                                            baseCurrCode = checkSymbol.ISO_Code;
                                        }
                                        let newCashFlowCashEquiv1 = 0
                                        for (let i = 0; i < cashFlowArray.length; i++) {
                                            if (cashFlowArray[i]._id === rowId && cashFlowArray[i].CashFlowType === 'Pay in') {
                                                //update the rate
                                                cashFlowArray[i].CashFlowRate = newCashFlowRate;
                                                //calculate the relative rate to be used
                                                const relativeRate = cashFlowArray[i].CashFlowRate / currencies.RATE;
                                                //calculate the cash equivalents
                                                newCashFlowCashEquiv1 = Number(
                                                    parseFloat(cashFlowArray[i].CashFlowAmount) /
                                                    parseFloat(relativeRate)
                                                ).toFixed(2);
                                                //calculate the updated total payin value
                                                totalPayinsRange = parseFloat(totalPayinsRange) + (parseFloat(newCashFlowCashEquiv1) - parseFloat(cashFlowArray[i].CashFlowCashEquiv))
                                                //update the cash equiv
                                                cashFlowArray[i].CashFlowCashEquiv = newCashFlowCashEquiv1;
                                            }
                                        }
                                        //UPDATE THE TOTALS
                                        const cashBalance = (parseFloat(totalPayinsRange) + parseFloat(openingBalance)) - parseFloat(totalPayOutsRange)
                                        document.querySelector(".totalIncome").innerText = Number(parseFloat(totalPayinsRange)).toFixed(2);

                                        if (cashBalance < 0) {
                                            //if the number is negative
                                            const numberString = cashBalance.toString(); //convert to string so that you can use the split method
                                            formattedValue = numberString.split("-")[1];
                                            sign = -1;
                                            if (sign === -1) {
                                                document.querySelector(
                                                    ".CashBalance").style.color = "red";
                                                const updatedValue = "-" + symbol + Number(formattedValue).toFixed(2);
                                                // newEmptyRow.querySelector(
                                                //     ".runningBalance").innerText = updatedValue;
                                            }
                                        } else {
                                            document.querySelector(".CashBalance").innerText =
                                                symbol +
                                                "    " +
                                                Number(cashBalance).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                        }
                                        newEmptyRow.querySelector(
                                            ".Equivsymbol"
                                        ).innerText = baseCurrCode;
                                        newEmptyRow.querySelector(
                                            ".cashEquivCell"
                                        ).innerText =
                                            Number(newCashFlowCashEquiv1).toFixed(2); //place the cash Equiv value on the cashEquiv cell

                                        //  use the fetch for the route with POST method and update the income rate in the database
                                        spinner.style.display = "block";
                                        // notification('Updating')
                                        incomeRate.blur();
                                        fetch("/updateCashFlowRate", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                rowId,
                                                newCashFlowRate,
                                                newCashFlowCashEquiv1,
                                            }),
                                        })
                                            .then((response) => response.json())
                                            .then((data) => {
                                                // Show alert
                                                if (data.amUpdated) {
                                                    //call the defaultdisplay function
                                                    //GET THE L/S STORED STARTIND DATE AND THE END DATE
                                                    sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                                    eDate = localStorage.getItem("lastDate");
                                                    startDate = new Date(sDate)
                                                    endDate = new Date(eDate)
                                                    defaultDisplayContent(startDate, endDate)
                                                    notification("Updated");
                                                    spinner.style.display = "none";
                                                }
                                            })

                                            .catch((error) => {
                                                console.error(
                                                    `Error updating base newincomeRate field for income ID: ${rowId}`,
                                                    error
                                                );
                                            });
                                    }
                                }
                            });

                        }
                        //============================================================
                        //DELETE OPERATIONS
                        // Get all the checkboxes in the table
                        document.getElementById("myCheck").addEventListener("click", () => {
                            checkedRowsId = []
                            const rowCheckBoxes = document.querySelectorAll(".form-check-input")
                            if (document.getElementById("myCheck").checked === true) {
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

                        // Get the "Delete" button element in the modal
                        const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
                        // When the "Delete" button is clicked, delete the selected rows
                        confirmDeleteBtn.addEventListener("click", async () => {
                            // alert("delete confirmed of " + checkedRowsId.length+ " items")

                            //display the delte modal
                            deleteRowsModal.style.display = 'block'
                            document.querySelector('.deleteMsg').innerText = 'Do you want to delete ' + checkedRowsId.length + ' PayIn(s)?'
                            noDeleteRows.addEventListener('click', (event) => {
                                event.preventDefault();
                                //close the delte modal
                                deleteRowsModal.style.display = 'none'
                            })
                            closeDelete.addEventListener('click', (event) => {
                                event.preventDefault();
                                //close the delte modal
                                deleteRowsModal.style.display = 'none'
                            })
                            //when the yes button is clicked
                            yesDeleteRows.addEventListener('click', (event) => {
                                if (checkedRowsId.length > 0) {
                                    //  Hide the delete modal
                                    deleteModal.style.display = "none";
                                    deleteRowsModal.style.display = 'none'
                                    try {
                                        // spinner.style.display = 'block';
                                        fetch("/delete", {
                                            method: "DELETE",
                                            headers: {
                                                "Content-Type": "application/json",
                                            },
                                            body: JSON.stringify({
                                                checkedRowsId,
                                            }),
                                        })
                                            .then((response) => {
                                                return response.json();
                                            })
                                            .then((data) => {
                                                if (data.amDeleted === true) {
                                                    currentPage = 1
                                                    localStorage.setItem('incomeCurrPage', currentPage)
                                                    if (document.getElementById("myCheck").checked === true) {
                                                        document.getElementById("myCheck").checked = false
                                                    }
                                                    defaultDisplayContent(startDate, endDate)
                                                    notification("Deleted");
                                                    // location.href = "/payIn"
                                                    checkedRowsId = []
                                                }
                                            });
                                    } catch (err) {
                                        console.error(err);
                                    }

                                }
                            });

                        });
                        //==========================================================================
                        //display the blank row on cllick of the plus sign
                        document.querySelector('.addRow').addEventListener("click", function (event) {
                            addNewRow()
                            document.getElementById('Table_messages').style.display = 'none'
                        })
                        let clickedType = ''
                        function setEventListeners(newEmptyRow) {
                            const shiftStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "ShiftNo"
                            );
                            const invoiceStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "InvoiceRef"
                            );
                            const vatStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "Tax"
                            );
                            const descriptionStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "Description"
                            );
                            const amountStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "Amount"
                            );
                            const incomeShiftCell =
                                newEmptyRow.querySelector(".editableShift");
                            const invoiceCell =
                                newEmptyRow.querySelector(".editableInvoice");
                            const vatCell = newEmptyRow.querySelector(".radioBtn");
                            const vatBtn = vatCell.querySelector(".radio-check-input");
                            const incomeDateCell =
                                newEmptyRow.querySelector(".incomeDate");
                            const incomeDescriptionCell =
                                newEmptyRow.querySelector(".editable-cell");
                            const incomeAmountCell =
                                newEmptyRow.querySelector(".incAmount");


                            sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            eDate = localStorage.getItem("lastDate");
                            let startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            let endDate = new Date(eDate);
                            function fixDate(date) {
                                let newDate = dateValidation(date);
                                if (newDate !== "") {
                                    incomeDateCell.innerText = newDate;
                                    //remove focus on the date cell
                                    incomeDateCell.blur();
                                    const parts = incomeDateCell.innerText.split("/");
                                    const formattedDate =
                                        parts[1] + "/" + parts[0] + "/" + parts[2];
                                    const formattedDates2 = new Date(formattedDate);
                                    startDate = new Date(formattedDates2); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    endDate = new Date(formattedDates2);
                                    localStorage.setItem("firstDate", startDate);
                                    localStorage.setItem("lastDate", endDate);

                                } else if (newDate === "") {
                                    //maintain focus on the date cell
                                    incomeDateCell.focus();
                                    //IF USER HAS CLICKED ON THE TAX BUTTON dropdown SHOULD NOT OPEN
                                    if (clickedType === 'radio') {
                                        newEmptyRow.querySelector('.VatDropdown-menu').style.display = 'none';
                                    }
                                    notification("invalid date format");
                                    return;
                                }

                                //now focus on the next cell
                                if (shiftStatus.isDisplayed === true) {
                                    //fill the text with APS (ALL PREVIOUS SHIFTS)
                                    incomeShiftCell.innerText = 'APS'
                                }
                                else if (vatStatus.isDisplayed === true) {
                                    newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'block';
                                }
                                else if (invoiceStatus.isDisplayed === true) {
                                    //MOVE FOCUS TO INVOICE CELL
                                    invoiceCell.contentEditable = true
                                    invoiceCell.focus()
                                    if (invoiceCell.contentEditable === true) {
                                        newEmptyRow.querySelector('.Taxdropdown-menu').style.display = 'none';

                                    }
                                }
                            }
                            incomeDateCell.addEventListener("keydown", function (event) {
                                // remove the message displaying on the table
                                tableErrorMsgs.style.display = "none";
                                const keyCode = event.keyCode;
                                if (
                                    (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    keyCode == 191 ||
                                    keyCode == 111 || // forward slash (/) on regular or numeric keyboard
                                    keyCode == 8 || // backspace
                                    keyCode == 9 || // tab
                                    keyCode == 37 ||
                                    keyCode == 39 || // left and right arrow keys
                                    (keyCode >= 96 && keyCode <= 105) || // numeric keypad
                                    keyCode == 109 ||
                                    keyCode == 189 || // hyphen (-)
                                    keyCode == 190 ||
                                    keyCode == 110 ||
                                    keyCode == 188
                                ) {
                                    // Allow input
                                } else {
                                    // Prevent input, SILENTLY
                                    event.preventDefault();
                                }
                                // Add click and keydown event listeners in one line
                                if (event.key === "Enter" || event.key === "Tab") {
                                    currentPage = 1
                                    localStorage.setItem('incomeCurrPage', currentPage);
                                    //WHEN ENTER IS CLICKED
                                    event.preventDefault();
                                    let date = incomeDateCell.innerText
                                    fixDate(date)

                                }
                            }
                            );
                            invoiceCell.addEventListener("click", () => {
                                if (incomeDateCell.innerText !== '') {
                                    if (invoiceStatus.isDisplayed === true) {
                                        //MOVE FOCUS TO SHIFT CELL
                                        invoiceCell.contentEditable = true
                                        invoiceCell.focus()
                                    }

                                }
                            })
                            incomeDescriptionCell.addEventListener("click", () => {
                                if (incomeDateCell.innerText !== '') {
                                    if (descriptionStatus.isDisplayed === true) {
                                        //MOVE FOCUS TO SHIFT CELL
                                        incomeDescriptionCell.contentEditable = true
                                        incomeDescriptionCell.focus()
                                    }

                                }
                            })
                            incomeAmountCell.addEventListener("click", () => {
                                if (incomeDateCell.innerText !== '') {
                                    if (amountStatus.isDisplayed === true) {
                                        //MOVE FOCUS TO SHIFT CELL
                                        incomeAmountCell.contentEditable = true
                                        incomeAmountCell.focus()
                                    }

                                }
                            })
                            incomeShiftCell.addEventListener("click", function (event) {
                                let date = incomeDateCell.innerText
                                fixDate(date)
                            })
                            invoiceCell.addEventListener("click", function (event) {
                                let date = incomeDateCell.innerText
                                fixDate(date)
                            })
                            // incomeDescriptionCell.addEventListener("click", function (event) {
                            //     let date = incomeDateCell.innerText
                            //     fixDate(date)
                            // })
                            // newEmptyRow.querySelector('.radioBtn').addEventListener("click", function (event) {
                            //     let date = incomeDateCell.innerText
                            //     fixDate(date)
                            // })
                            // newEmptyRow.querySelector('.categories-cell').addEventListener("click", function (event) {
                            //     let date = incomeDateCell.innerText
                            //     fixDate(date)
                            // })
                            // newEmptyRow.querySelector('.currencies-cell').addEventListener("click", function (event) {
                            //     let date = incomeDateCell.innerText
                            //     fixDate(date)
                            // })
                            // incomeAmountCell.addEventListener("click", function (event) {
                            //     let date = incomeDateCell.innerText
                            //     fixDate(date)
                            // })
                            //====================================================================================================
                            //LISTENERS FOR VAT CELL
                            let vatEntry = {}
                            let ztfEntry = {}
                            let previousState = vatBtn.checked;//get the radio button checked status before click
                            const taxCell = newEmptyRow.querySelector(".radioBtn");
                            taxCell.addEventListener("click", function (event) {
                                // Prevent the default behavior of the radio button (i.e., checking it)
                                event.preventDefault();
                                //first check if the date exist in that row
                                if (incomeDateCell.innerText !== '') {
                                    let date = incomeDateCell.innerText
                                    fixDate(date)
                                    clickedType = event.target.type
                                    let currentState = null //to store the current stattus upon click
                                    if (previousState) {
                                        currentState = false
                                    } else {
                                        currentState = true
                                    }
                                    //this condition will be based on the previous status that we will be able to toggle  check and uncheck
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
                                }
                            });
                            let allItems = newEmptyRow.querySelectorAll('.Taxdropdown-menu a')
                            allItems.forEach(item => {
                                item.addEventListener('click', (event) => {
                                    event.preventDefault();
                                    previousState = true
                                    taxtypeSelected = item.innerText
                                    createSubMenu()
                                })
                            });
                            function createSubMenu() {
                                // Clear existing submenu content
                                let allTaxRows = newEmptyRow.querySelectorAll(`.Taxdropdown-menu ul tr`)
                                //loop in all the existing vatdropdown table row and remove them
                                if (allTaxRows.length > 0) {
                                    for (let h = 0; h < allTaxRows.length; h++) {
                                        const el = allTaxRows[h];
                                        el.style.display = 'none';
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
                                        editableTextVatAmount = newEmptyRow.querySelector(`#editable-vattext5`).innerText; // VatAmount field
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

                                    }
                                    else if (taxtypeSelected === 'ztf') {
                                        taxDataToUpdate = []//empty this array first
                                        let ztfStat = ""
                                        let editableTextLevyAmount = 0
                                        // Collect the editable text from the current row
                                        const editableTextFirst = newEmptyRow.querySelector(`#editable-ztftext0`).innerText; // First field
                                        const editableTextSecond = newEmptyRow.querySelector(`#editable-ztftext1`).innerText; // Second field
                                        editableTextLevyAmount = newEmptyRow.querySelector(`#editable-ztftext2`).innerText; // LevyAmount field
                                        //check if all the data is not equal to defaults values
                                        if (editableTextLevyAmount === 0) {
                                            ztfStat = 'N'
                                            taxStatus = "N"
                                        }
                                        else {
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

                                    }
                                    //remove the dropdowns and open next cell
                                    newEmptyRow.querySelector(`.VatDropdown-menu`).style.display = 'none'
                                    previousState = false//set radio button status to false as the dropdown menu is still open

                                    //open the next cell
                                    if (invoiceStatus.isDisplayed === true) {
                                        //MOVE FOCUS TO INVOICE CELL
                                        invoiceCell.contentEditable = true
                                        invoiceCell.focus()
                                    }
                                    else if (descriptionStatus.isDisplayed === true) {
                                        //MOVE FOCUS TO DESCRIPTION CELL
                                        incomeDescriptionCell.contentEditable = true
                                        incomeDescriptionCell.focus()
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
                                    // If clicked outside both editable area and dropdown, close the dropdown and uncheck the radio button
                                    dropdown.style.display = 'none'; // Close dropdown
                                    vatBtn.checked = false; // Uncheck the radio button
                                    subMenu.style.display = 'none'
                                    previousState = false//set radio button status to false as the dropdown menu has been closed

                                }
                            });
                            //========================================================================================================
                            //LISTENERS FOR INVOICE CELL
                            invoiceCell.addEventListener("keydown", function (event) {
                                // event.preventDefault()
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

                                if (keyCode === 13 || event.key === 'Tab') {
                                    event.preventDefault();
                                    invoiceCell.blur(); // Remove focus on the cell
                                    // Focus on the next cell
                                    if (descriptionStatus.isDisplayed === true) {
                                        // MOVE FOCUS TO DESCRIPTION CELL
                                        incomeDescriptionCell.contentEditable = true
                                        incomeDescriptionCell.focus();
                                    }
                                }
                            });

                            function displayCategoryForm() {
                                //display the create category form
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
                                //gara wias a focus in the input field
                                newEmptyRow.querySelector(`.categoryNameClass`).focus()
                                const insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                //limit the words length to 25
                                insertedCategoryName.maxLength = 25
                            }
                            function createNewCategory() {
                                let insertedCategoryName = newEmptyRow.querySelector(`.categoryNameClass`)
                                insertedCategoryName.value = ((insertedCategoryName.value).replace(/ /g, "_")).toLowerCase();

                                //STORE THE ORIGINAL NAME WITH UNDERSCORE IN LOCAL STORAGE
                                localStorage.setItem("newPayInCategory", insertedCategoryName.value)
                                //on click of the add button send data to database
                                let newCategory = (insertedCategoryName.value).replace(/_/g, " ");
                                newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                newEmptyRow.querySelector('.categorySpan').innerText = newCategory
                                let categoryToDb = []
                                //get the inserted value
                                let payInCat = {};
                                payInCat["category"] = insertedCategoryName.value;
                                payInCat["CategoryLimit"] = 0;
                                payInCat["CategoryLimitRange"] = "";
                                payInCat["Balance"] = "PayIn";
                                const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === insertedCategoryName.value)
                                if (!categoryName) {
                                    categoryToDb.push(payInCat)
                                }
                                else if (categoryName) {
                                    notification('category Already Exist')
                                    return
                                }

                                insertCategoryRecord(categoryToDb)
                                // currencyDropdown();//OPEN CURRENCY DROPDOWN
                            }
                            newEmptyRow.querySelector('.submitCat').addEventListener("click", () => {
                                createNewCategory()//function to add the category to database
                            })
                            newEmptyRow.querySelector('.categories-cell').addEventListener("keydown", (event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    if (newEmptyRow.querySelector('#dropdownForm').style.display === 'block') {
                                        newEmptyRow.querySelector('#dropdownForm').style.display = 'none'; // Create a new dropdown instance
                                        createNewCategory()//function to add the category to database
                                        const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                        dropdownMenu.hide(); //close the ctegory dropdwon
                                        const nextDropdownButton = newEmptyRow.querySelector('.currbtnSpan');
                                        const nextDropdown = new bootstrap.Dropdown(nextDropdownButton);
                                        nextDropdown.toggle(); // Open the currency droPDOWN
                                    }
                                }
                            })

                            function categoryDropdown() {
                                // then make the dropdown open
                                const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                dropdownMenu.toggle(); // Toggle the dropdown
                            }

                            function currencyDropdown() {
                                const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.currbtnSpan')); // Create a new dropdown instance
                                dropdownMenu.toggle(); // Toggle the dropdown
                            }
                            //===============================================================================================
                            incomeDescriptionCell.addEventListener("keydown", function (event) {
                                const categoryStatus = Array.from(headersStatus).find(
                                    (name) => name.HeaderName === "Category"
                                );
                                const currStatus = Array.from(headersStatus).find(
                                    (name) => name.HeaderName === "Currency"
                                );
                                tableErrorMsgs.style.display = "none";
                                if (
                                    (event.keyCode >= 65 && event.keyCode <= 90) || // A-Z
                                    (event.keyCode >= 97 && event.keyCode <= 122) || // a-z
                                    event.keyCode === 8 || // Backspace
                                    event.keyCode === 46 || // Delete
                                    event.keyCode === 37 || // Left arrow
                                    event.keyCode === 39 || // Right arrow
                                    event.keyCode === 32 || // Space
                                    event.keyCode === 188 || // Comma (,)
                                    event.keyCode === 190 ||// Full stop (.)
                                    event.keyCode >= 48 && event.keyCode <= 57 //numbers
                                ) {
                                    // Allow entry
                                } else {
                                    event.preventDefault();
                                }
                                //NOW SHOW DROPDOWNS WHEN ENTER IS CLICKED
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    if (categoryStatus.isDisplayed === true) {
                                        categoryDropdown();
                                        incomeDescriptionCell.blur(); //remove focus
                                    }
                                    else if (currStatus.isDisplayed === true) {
                                        currencyDropdown();
                                        incomeDescriptionCell.blur(); //remove focus
                                    }

                                }
                            });

                            //DROPDOWN (CATEGORY AND CURRENCIES) CLICK EVENTS
                            //When the categories dropdown is open, loop thru all the list of Categories putting the event listeners
                            //loop through all the category options in the dropdown
                            const expcOptions = newEmptyRow.querySelectorAll(".incCate-option");
                            const incomeSpan = newEmptyRow.querySelector(".categorySpan");
                            expcOptions.forEach((cat, i) => {
                                cat.addEventListener("click", (event) => {
                                    event.preventDefault();
                                    if (i === 0) {
                                        event.stopPropagation();
                                        displayCategoryForm()
                                    }
                                    else {
                                        //GET THE SELECTED CATEGORY AND UPDATE THE CATEGORY CELL WITH ITS VALUE
                                        let newCategory = cat.querySelector(".cateList-optionSpan").innerText;
                                        newCategory = ((newCategory).replace(/_/g, " "))
                                        newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                        incomeSpan.innerText = newCategory;
                                    }

                                });
                            })
                            //ENTER KEY TO ALLOW CURRENCY DROPDOWN TO OPEN
                            expcOptions.forEach((cat, i) => {
                                cat.addEventListener("keydown", (event) => {
                                    event.preventDefault();
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        if (i === 0) {
                                            event.stopPropagation();
                                            displayCategoryForm()
                                        }
                                        else {
                                            //GET THE SELECTED CATEGORY AND UPDATE THE CATEGORY CELL WITH ITS VALUE
                                            let newCategory = cat.querySelector(".cateList-optionSpan").innerText;
                                            newCategory = ((newCategory).replace(/_/g, " "))
                                            newCategory = (newCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            incomeSpan.innerText = newCategory;
                                            const dropdownMenu = new bootstrap.Dropdown(newEmptyRow.querySelector('.categorySpan')); // Create a new dropdown instance
                                            dropdownMenu.hide(); //close the ctegory dropdwon
                                            const nextDropdownButton = newEmptyRow.querySelector('.currbtnSpan');
                                            const nextDropdown = new bootstrap.Dropdown(nextDropdownButton);
                                            nextDropdown.toggle(); // Open the currency droPDOWN
                                        }

                                    }
                                })
                            })
                            document.addEventListener("mousedown", function handleClickOutsideBox(event) {
                                const forms = document.querySelectorAll('#dropdownForm');
                                forms.forEach(form => {
                                    const inputField = form.querySelector('.categoryNameClass');
                                    // Check if the form is visible
                                    if (form.style.display === 'block') {
                                        // Check if the clicked element is outside the form and not the input
                                        if (!form.contains(event.target) && !inputField.contains(event.target)) {
                                            form.style.display = 'none';
                                        }
                                    }
                                });
                            });
                            //===================================================================================================
                            //get the currency dropdown menu and caret
                            //CURRENCY CELL WITH THE CLICK EVENT LISTENER
                            const CurrencyOptions =
                                newEmptyRow.querySelectorAll(".curr-option");
                            const CurrencySpan =
                                newEmptyRow.querySelector(".currbtnSpan");

                            CurrencyOptions.forEach((currencyOption) => {
                                currencyOption.addEventListener(
                                    "click",
                                    function (event) {
                                        event.preventDefault();
                                        const newCurrency = currencyOption.innerText;
                                        CurrencySpan.innerText = newCurrency;
                                        //GET THE SELECTED currency AND UPDATE THE currency CELL WITH ITS VALUE
                                        //get reference for the rate span in the table
                                        const rateCell =
                                            newEmptyRow.querySelector(".incRate");
                                        //fill the rate cell with the corresponding rate
                                        for (let i = 0; i < newCurrencies.length; i++) {
                                            const currencyRate = newCurrencies[i];
                                            if (newCurrency === currencyRate.Currency_Name) {
                                                const rateSpan = currencyRate.RATE;
                                                rateCell.innerText = rateSpan;
                                            }
                                            const currName = Array.from(WorldCurrencies).find(
                                                (curr) => (curr.Currency_Name).toLowerCase() === (newCurrency).toLowerCase()
                                            ); //find matching currency name with the one in the incomes table
                                            if (currName) {
                                                newEmptyRow.querySelector(".symbol1").innerText = currName.ISO_Code;
                                                newEmptyRow.querySelector(".symbol").innerText = currName.ISO_Code;
                                            }
                                        }
                                        //focus on the amount cell
                                        incomeAmountCell.contentEditable = true
                                        incomeAmountCell.focus()
                                    }
                                );
                            });
                            //========================================================================================================
                            //CODE FOR THE income AMOUNT CELL EVENT HANDLER IF USER ENTERS THE AMOUNT , IT CALCULATE THE CASH EQUIVALENT VALUE BASED ON THE BASE CURRENCY SELECTED
                            // add an event listener to the cell for key press events
                            newEmptyRow.querySelector('.amount-cell').addEventListener("click", function (event) {
                                event.preventDefault()
                                incomeAmountCell.focus()
                            })
                            incomeAmountCell.addEventListener("keydown", function (event) {
                                //find the base currency name
                                const currencies = Array.from(newCurrencies).find(
                                    (newCurrency) => newCurrency.BASE_CURRENCY === "Y"
                                ); //find the base currency
                                const keyCode = event.keyCode;
                                if (
                                    (keyCode >= 48 && keyCode <= 57) || // numbers 0-9
                                    (keyCode >= 96 && keyCode <= 105) ||
                                    keyCode == 13 ||
                                    keyCode == 8 || // backspace
                                    keyCode == 9 || // tab
                                    keyCode == 46 || //delete
                                    keyCode == 190 ||
                                    keyCode == 37 ||
                                    keyCode == 39
                                ) {
                                    // Allow input
                                } else {
                                    // Prevent input
                                    event.preventDefault();
                                }

                                if (event.key === "Enter") {
                                    // Prevent input
                                    event.preventDefault();
                                    itemsToProcess = [];
                                    // get the new value of the income rate from the edited cell
                                    const newincomeAmount = event.target.innerText;
                                    tableContainer.scrollLeft = 0;
                                    if (newincomeAmount === "") {
                                        notification("Field Can not Be Empty");
                                        incomeAmountCell.focus(); // Remove focus from amount cell
                                        return;
                                    } else {
                                        const newCurrency =
                                            newEmptyRow.querySelector(
                                                ".currbtnSpan"
                                            ).innerText;
                                        //find the selected currency so that we take the rate
                                        const selectedCurrency = Array.from(
                                            newCurrencies
                                        ).find(
                                            (newCurr) =>
                                                newCurr.Currency_Name === newCurrency
                                        );
                                        //calculate the relative rate to be used using the rate of the base currency and the selected currency
                                        const relativeRate =
                                            selectedCurrency.RATE / currencies.RATE;
                                        //calculate the cash equivalents

                                        const calculated = Number(
                                            parseFloat(newincomeAmount) /
                                            parseFloat(relativeRate)
                                        ).toFixed(2);
                                        const currName = Array.from(WorldCurrencies).find(
                                            (curr) =>
                                                (curr.Currency_Name).toLowerCase() ===
                                                (currencies.Currency_Name).toLowerCase()
                                        ); //find matching currency name with the one in the incomes table
                                        if (currName) {
                                            newEmptyRow.querySelector(
                                                ".Equivsymbol"
                                            ).innerText = currName.ISO_Code;
                                            newEmptyRow.querySelector(
                                                ".cashEquivCell"
                                            ).innerText = Number(calculated).toFixed(2); //place the cash Equiv value on the cashEquiv cell
                                        }
                                        const myTotalIncome = Number(
                                            parseFloat(
                                                totalPayinsRange
                                            ) + parseFloat(calculated)
                                        ).toFixed(2);
                                        document.querySelector(".totalIncome").innerText =
                                            Number(myTotalIncome).toFixed(2);

                                        const cashBalance = (parseFloat(myTotalIncome) + parseFloat(openingBalance)) - parseFloat(totalPayOutsRange)


                                        //GET THE CURRENCY SYMBOL
                                        //CHECK IF THERE EXIST THE CURRENCY SELECTED
                                        const checkCurrency = Array.from(
                                            newCurrencies
                                        ).find((curr) => curr.BASE_CURRENCY === "Y");
                                        const checkSymbol = Array.from(
                                            WorldCurrencies
                                        ).find(
                                            (curr) =>
                                                (curr.Currency_Name).toLowerCase() ===
                                                (checkCurrency.Currency_Name).toLowerCase()
                                        );
                                        if (checkSymbol) {
                                            baseCurrCode = checkSymbol.ISO_Code;
                                        }
                                        if (cashBalance < 0) {
                                            //if the number is negative
                                            const numberString = cashBalance.toString(); //convert to string so that you can use the split method
                                            formattedValue = numberString.split("-")[1];
                                            sign = -1;
                                            if (sign === -1) {
                                                document.querySelector(
                                                    ".CashBalance"
                                                ).style.color = "red";
                                                document.querySelector(
                                                    ".CashBalance"
                                                ).innerText =
                                                    "-" + baseCurrCode + " " + formattedValue;
                                            }
                                        } else {
                                            document.querySelector(
                                                ".CashBalance"
                                            ).style.color = "black";
                                            document.querySelector(
                                                ".CashBalance"
                                            ).innerText = baseCurrCode + "  " + cashBalance; //place the cash Equiv value on the cashEquiv cell
                                        }
                                        //NOW TO GET THE DATA FROM  THE INTERFACE
                                        const IncomeShift = newEmptyRow.querySelector(".editableShift").innerText;
                                        const IncomeInvoiceRef = newEmptyRow.querySelector(".editableInvoice").innerText;
                                        const cashEquivValue = parseFloat(newEmptyRow.querySelector(".cashEquivCell").innerText);

                                        let IncomeCategory = newEmptyRow.querySelector('.categorySpan').innerText;
                                        if (IncomeCategory.includes(" ")) {
                                            IncomeCategory = IncomeCategory.replace(/ /g, "_").toLowerCase();
                                        }
                                        else {
                                            IncomeCategory = IncomeCategory.toLowerCase();
                                        }
                                        if (IncomeCategory === 'Select Category') {
                                            IncomeCategory = 'suspense'
                                            let categoryToDb = []
                                            //and also update the new category array
                                            let payInCat = {}; //THE NEW DOCUMEN
                                            payInCat["category"] = IncomeCategory;
                                            payInCat["CategoryLimit"] = 0;
                                            payInCat["CategoryLimitRange"] = "";
                                            payInCat["Balance"] = "PayIn";
                                            const categoryName = Array.from(newIncomeCategories).find(cat => (cat.category).toLowerCase() === IncomeCategory)
                                            if (!categoryName) {
                                                categoryToDb.push(payInCat)
                                            }
                                            // else if (categoryName) {
                                            //     notification('category Already Exist')
                                            //     return
                                            // }

                                            insertCategoryRecord(categoryToDb)
                                        }
                                        const currentDate =
                                            newEmptyRow.querySelector(
                                                ".incomeDate"
                                            ).innerText;
                                        const IncomeDescription =
                                            newEmptyRow.querySelector(
                                                ".editable-cell"
                                            ).innerText;
                                        const Currency_Name =
                                            newEmptyRow.querySelector(
                                                ".currbtnSpan"
                                            ).innerText;
                                        const IncomeAmount = parseFloat(
                                            newEmptyRow.querySelector(".incAmount")
                                                .innerText
                                        );
                                        const IncomeRate = parseFloat(
                                            newEmptyRow.querySelector(".incRate").innerText
                                        );

                                        //FIRST UPDATE THE ARRAY WITH THE INSERTED DATA
                                        let payInDoc = {}; //THE NEW DOCUMENT

                                        payInDoc["CashFlowDate"] = currentDate;
                                        payInDoc["CashFlowShift"] = IncomeShift;
                                        payInDoc["Tax"] = { vat: vatEntry, ztf: ztfEntry }
                                        payInDoc["CashFlowInvoiceRef"] = IncomeInvoiceRef;
                                        payInDoc["CashFlowDescription"] = IncomeDescription;
                                        payInDoc["CashFlowCategory"] = IncomeCategory;
                                        payInDoc["CashFlowCurrency"] = Currency_Name;
                                        payInDoc["CashFlowAmount"] =
                                            parseFloat(IncomeAmount);
                                        payInDoc["CashFlowRate"] = parseFloat(IncomeRate);
                                        payInDoc["CashFlowCashEquiv"] =
                                            parseFloat(cashEquivValue);
                                        payInDoc["CashFlowType"] = 'Pay in'
                                        itemsToProcess.push(payInDoc); //push into an array that will go to database
                                        //USE OUR ONE AND ONLY FUNCTION TO SAVE TO DATABASE
                                        if (itemsToProcess.length > 0) {
                                            incomeAmountCell.blur(); // Remove focus from amount cell
                                            saveCashFlow(itemsToProcess);
                                        }
                                    }
                                }
                            }
                            );
                        }
                        function updateTaxStatus(taxStatus, taxDataToUpdate, rowId) {// send the data to db

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
                                        spinner.style.display = "none";
                                        const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                        const eDate = localStorage.getItem('lastDate');
                                        const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                        const endDate = new Date(eDate);
                                        defaultDisplayContent(startDate, endDate)
                                        notification("Updated");

                                    }
                                    else if (data.amUpdated === false) {
                                        spinner.style.display = "none";
                                        const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                        const eDate = localStorage.getItem('lastDate');
                                        const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                        const endDate = new Date(eDate);
                                        defaultDisplayContent(startDate, endDate)
                                        // notification("Updated");
                                    }
                                })
                                .catch((error) => {
                                    console.error(
                                        `Error updating Invoice field for expense ID: ${rowId}`,
                                        error
                                    );
                                });
                        }

                        //===========================================================================================
                        //CODE FOR ADDING NEW EMPTY ROW BY DEFAULT, DURING THE CHECKING AND UNCHECKING OF THE CHECK BOXES
                        function addNewRow() {
                            const tBody = document.querySelector(".table-body");
                            const numRows = tBody.rows.length;
                            const isEven = numRows % 2 === 0;
                            // create a new row element
                            const newEmptyRow = document.createElement("tr");
                            newEmptyRow.classList.add("IncomeTableRow");
                            if (isEven) {
                                newEmptyRow.classList.add("roweven");
                            } else {
                                newEmptyRow.classList.add("rowodd");
                            }
                            const shiftstatus = Array.from(headersStatus).find(name => name.HeaderName === 'ShiftNo');
                            const radiostatus = Array.from(headersStatus).find(name => name.HeaderName === 'Tax');
                            const invoiceStatus = Array.from(headersStatus).find(name => name.HeaderName === 'InvoiceRef');
                            const descriptionStatus = Array.from(headersStatus).find(name => name.HeaderName === 'Description');
                            //GET THE SYMBOL BASED ON THE BASECURRENCY SELECTED
                            const baseCurr = Array.from(newCurrencies).find(
                                (curr) => curr.BASE_CURRENCY === "Y"
                            ); //find matching currency name with the one in the incomes table
                            const currName = Array.from(WorldCurrencies).find(
                                (curr) => (curr.Currency_Name).toLowerCase() === (baseCurr.Currency_Name).toLowerCase()
                            ); //find matching currency name with the one in the incomes table

                            if (currName) {
                                baseCurrCode = currName.ISO_Code;
                            }
                            // create the cells for the new row
                            const checkboxCell = document.createElement("td");
                            const checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.classList.add("form-check-input");
                            checkbox.value = "checkedValue";

                            checkboxCell.appendChild(checkbox);
                            newEmptyRow.appendChild(checkboxCell);

                            const hiddenCell = document.createElement("td");
                            hiddenCell.hidden = true;
                            hiddenCell.classList.add("incomeIdClass");
                            newEmptyRow.appendChild(hiddenCell);

                            //DATE CELL AND HEADER
                            const dateCell = document.createElement("td");
                            dateCell.contentEditable = true;
                            dateCell.classList.add("incomeDate");
                            dateCell.innerHTML = selectedDate;
                            newEmptyRow.appendChild(dateCell);

                            //SHIFT CELL AND HEADER
                            const shiftCell = document.createElement("td");
                            shiftCell.classList.add("editableShift");
                            // shiftCell.contentEditable = true;

                            newEmptyRow.appendChild(shiftCell);

                            if (shiftstatus.isDisplayed == true) {
                                shiftCell.style.display = "table-cell";
                            } else if (shiftstatus.isDisplayed === false) {
                                shiftCell.style.display = "none";
                            }

                            //tax CELL AND HEADER
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

                            if (radiostatus.isDisplayed === true) {
                                radioCell.style.display = "table-cell";
                            } else if (radiostatus.isDisplayed === false) {
                                radioCell.style.display = "none";
                            }

                            //INVOICE CELL AND HEADER
                            const invoiceCell = document.createElement("td");
                            invoiceCell.classList.add("editableInvoice");
                            // invoiceCell.contentEditable = true;
                            newEmptyRow.appendChild(invoiceCell);

                            if (invoiceStatus.isDisplayed === true) {
                                invoiceCell.style.display = "table-cell";
                            } else if (invoiceStatus.isDisplayed === false) {
                                invoiceCell.style.display = "none";
                            }

                            //DESCRIPTION CELL AND HEADER
                            const descriptionCell = document.createElement("td");
                            descriptionCell.classList.add("editable-cell");
                            // descriptionCell.contentEditable = true;
                            newEmptyRow.appendChild(descriptionCell);
                            //====================================================================================
                            //CATEGORY CELL AND HEADER
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
                            createIncCate.appendChild(dropdownItem1);
                            dropdownMenu.appendChild(createIncCate);

                            newIncomeCategories.forEach(option => {
                                const dropdownList = document.createElement('li');
                                dropdownList.classList.add('incCate-option');
                                const dropdownItem = document.createElement('a');
                                dropdownItem.classList.add('dropdown-item');
                                dropdownItem.href = '#';
                                //get the full category name
                                // const categorySpan = document.createElement('span');
                                const catOptionSpan = document.createElement('span');
                                catOptionSpan.classList.add(`cateList-optionSpan`);
                                catOptionSpan.innerText = option.category;
                                catOptionSpan.hidden = true;

                                dropdownItem.classList.add('categorySpanId');
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
                            categoryCell.appendChild(catDropdownContainer);
                            categoryCell.appendChild(categoryDropdownMenu);
                            newEmptyRow.appendChild(categoryCell);
                            const categoryStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "Category"
                            );
                            if (categoryStatus.isDisplayed === true) {
                                categoryCell.style.display = "table-cell";
                            } else if (categoryStatus.isDisplayed === false) {
                                categoryCell.style.display = "none";
                            }
                            //CURRENCY CELL AND HEADER
                            const currencyCell = document.createElement("td");
                            currencyCell.classList.add("currencies-cell");
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
                            //============================================================================

                            const amountCell = document.createElement("td");
                            amountCell.classList.add("amount-cell");
                            const amountSpan = document.createElement("span");
                            amountSpan.classList.add("incAmount");
                            // amountSpan.contentEditable = true;
                            const symbolSpan1 = document.createElement("span");
                            symbolSpan1.classList.add("symbol1");
                            symbolSpan1.innerHTML = baseCurrCode;
                            amountCell.appendChild(symbolSpan1);
                            amountCell.appendChild(amountSpan);
                            newEmptyRow.appendChild(amountCell);

                            //RATE CELL AND HEADER
                            const rateCell = document.createElement("td");
                            rateCell.classList.add("incomeRate");
                            const rateSpan1 = document.createElement("span");
                            rateSpan1.classList.add("incRate");
                            const symbolSpan = document.createElement("span");
                            symbolSpan.classList.add("symbol");
                            symbolSpan.innerHTML = baseCurrCode;
                            rateCell.appendChild(symbolSpan);
                            rateCell.appendChild(rateSpan1);
                            newEmptyRow.appendChild(rateCell);

                            //CASH EQUIV CELL AND HEADER
                            const cashEquivCell = document.createElement("td");
                            cashEquivCell.classList.add("cashEquivClass");
                            const cashEquivSpan1 = document.createElement("span");
                            const cashEquivSpan = document.createElement("span");
                            cashEquivSpan1.classList.add("cashEquivCell");
                            cashEquivSpan.classList.add("Equivsymbol");
                            cashEquivSpan.innerHTML = baseCurrCode;
                            cashEquivCell.appendChild(cashEquivSpan);
                            cashEquivCell.appendChild(cashEquivSpan1);
                            const cashstatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "CashEquiv"
                            );
                            newEmptyRow.appendChild(cashEquivCell);
                            if (cashstatus.isDisplayed === true) {
                                cashEquivCell.style.display = "table-cell";
                            } else if (cashstatus.isDisplayed === false) {
                                cashEquivCell.style.display = "none";
                            }
                            //RUNNING BALL CELL AND HEADER
                            const profitCell = document.createElement("td");
                            profitCell.classList.add("runningBalance");

                            const profitStatus = Array.from(headersStatus).find(
                                (name) => name.HeaderName === "RunningBalance"
                            );
                            newEmptyRow.appendChild(profitCell);
                            if (profitStatus.isDisplayed === true) {
                                profitCell.style.display = "table-cell";
                            } else if (profitStatus.isDisplayed === false) {
                                profitCell.style.display = "none";
                            }
                            setEventListeners(newEmptyRow);
                            //THEN SET THE EVENT LISTENERS FOR THAT NEWLY CREATED ROW
                            tBody.appendChild(newEmptyRow);
                            // Make the income date input editable

                            if (dateCell.innerText === '') {
                                dateCell.focus()
                            }
                            if (dateCell.innerText !== '' && descriptionStatus.isDisplayed === true) {
                                shiftCell.innerText = 'APS'
                                descriptionCell.contentEditable = true
                                descriptionCell.focus()
                            }
                        }

                        //============================================================================

                        //onclick event listener is added on the status paragraph
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
                                    localStorage.setItem('incomeCurrPage', parseInt(document.querySelector('.spanText').innerText))
                                    //call the default display function
                                    defaultDisplayContent(startDate, endDate)
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

                        let itemsPerPage
                        const rowsPerPage = document.querySelector('.rowsPerPage')
                        //the rowsperpage innertext should show the number of rows as five
                        rowsPerPage.innerText = itemsPerPage
                        const paginationList = document.querySelectorAll('.paginationList');
                        paginationList.forEach(page => {
                            page.addEventListener("click", (event) => {
                                itemsPerPage = page.innerText;
                                //now change the innertext of the page container and remove dropdown
                                rowsPerPage.innerText = itemsPerPage
                                //change alse the current page to one
                                currentPage = 1; //WE HAVE TO MODIFY THIS TO BE AUTOMATIC DECTING THE CURRENT PAGE OF THE CURRENT CONTENTS ON CONDITION OF THE ITEMS PER PAGE CHOSEN BY THE USER
                                //remove dropdown after selection if item is selected
                                // Store the itemsPerPage value in localStorage
                                localStorage.setItem('itemsPerPage', itemsPerPage);
                                localStorage.setItem('incomeCurrPage', currentPage);
                                //THIS SHOULD JUST CALL THE DEFAULT DISPLAY
                                defaultDisplayContent(startDate, endDate)

                            });
                        });
                        // Initial display
                        function goPrev() {
                            currentPage = parseInt(document.querySelector('.spanText').innerText)
                            const totalPages = parseInt(document.querySelector('.spanText1').innerText)
                            if (currentPage > 1) {
                                currentPage--; //decrement the pages
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('incomeCurrPage', currentPage);
                                isNavigating = true//we are changing the navigation status to true
                                isFiltering = false //change the filtering to false kana tamu mode ye navigation
                                defaultDisplayContent(startDate, endDate)
                            }
                            else if (currentPage === 1) {
                                currentPage = totalPages
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('incomeCurrPage', currentPage);
                                isNavigating = true//we are changing the navigation status to true
                                isFiltering = false //change the filtering to false kana tamu mode ye navigation

                                defaultDisplayContent(startDate, endDate)
                            }
                        }
                        function goNext() {
                            currentPage = parseInt(document.querySelector('.spanText').innerText)
                            const totalPages = parseInt(document.querySelector('.spanText1').innerText)//Math.ceil(rangeData.length / itemsPerPage);
                            if (currentPage < totalPages) {
                                currentPage++;//increment the currentpage by1
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('incomeCurrPage', currentPage);
                                isNavigating = true//we are changing the navigation status to true
                                isFiltering = false //change the filtering to false kana tamu mode ye navigation
                                defaultDisplayContent(startDate, endDate)
                            }
                            else if (currentPage === totalPages) {
                                currentPage = 1
                                document.querySelector('.spanText').innerText = currentPage
                                localStorage.setItem('incomeCurrPage', currentPage);
                                isNavigating = true//we are changing the navigation status to true
                                isFiltering = false //change the filtering to false kana tamu mode ye navigation
                                defaultDisplayContent(startDate, endDate)
                            }
                        }
                        const prevArrow = document.getElementById('previous');
                        const nextArrow = document.getElementById('next');

                        prevArrow.addEventListener('click', goPrev);
                        nextArrow.addEventListener('click', goNext);

                        //===========================================================================
                        startDate = new Date(sDate)
                        endDate = new Date(eDate)
                        //==================================================================================================

                        //SEARCH BAR EVENT LISTENER
                        document.getElementById('searchInput').addEventListener('keydown', function (event) {
                            document.getElementById('searchInput').maxLength = 5;
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                const input = (document.getElementById('searchInput').value.toLowerCase())
                                if (1 <= (document.getElementById('searchInput').value.length) <= 5) {
                                    //store the input n a local storage
                                    localStorage.setItem("searchInput", input)
                                    let page = 1
                                    localStorage.setItem('incomeCurrPage', page)
                                    // CALL THIS FUNCTION THAT COLLECTS DATA FROM DB AND DISPLAY ON TABLE
                                    defaultDisplayContent(startDate, endDate)
                                }
                            }
                        });
                        //IF THE CLEAR ICON IS CLICKED
                        document.getElementById("searchInput").addEventListener("search", function (event) {
                            const inputField = document.getElementById('searchInput');
                            inputField.value = ''; // Clear the input field
                            //   REMOVE the input n a local storage
                            localStorage.removeItem("searchInput")
                            // CALL THIS FUNCTION THAT COLLECTS DATA FROM DB AND DISPLAY ON TABLE
                            defaultDisplayContent(startDate, endDate)
                        });
                        //=====================================================================================================
                        defaultDisplayContent(startDate, endDate) //THIS FUNCTION IS CALLED FIRST DURING LOADING
                        //THIS FUNCTION IS THE FIRST TO BE EXECUTED DURING THE LOADING OF THE PAGE
                        function defaultDisplayContent(startDate, endDate) {
                            cashFlowArray = []
                            //GET THE L/S STORED STARTIND DATE AND THE END DATE
                            //GET THE L/S PAGE SIZE AND PAGE NUIMBER
                            let pageSize = localStorage.getItem('itemsPerPage');
                            if (pageSize === null) {
                                pageSize = 5
                            }
                            let page = localStorage.getItem('incomeCurrPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1
                            let searchInput = localStorage.getItem("searchInput")
                            let payOutSearchInput = localStorage.getItem("payOutSearchInput")
                            let payInFilterCategory = localStorage.getItem("payInCategory")
                            let payOutFilterCategory = localStorage.getItem('payOutcategoryName')
                            //check if the page is empty or if the painfilter is not empty and that we are in the filtering mode
                            if (page === null || (payInFilterCategory !== null && isFiltering === true)) {
                                page = 1
                            }

                            //check if the variable is not null and also that if in the navigation mode that is going next and prev
                            if ((payInFilterCategory !== null && isNavigating === true)) {
                                page = page
                            }

                            //GET THE L/S CATEGORY FILTER
                            if (payInFilterCategory === null) {
                                payInFilterCategory = "NoPayInCatFilter"
                            }
                            if (payOutFilterCategory === null) {
                                payOutFilterCategory = "NoPayOutCatFilter"
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
                                    payInFilterCategory: payInFilterCategory,
                                    payOutFilterCategory: payOutFilterCategory,
                                    searchInput: searchInput
                                })
                            })
                                .then(response => response.json())
                                .then(data => {

                                    // From the server, the computation of the total income and expenses (as well as by filter) per range has been done
                                    //TOP GRANT TOTALS COMPUTATION
                                    itemsToProcess = []
                                    let totalPages
                                    let cashBalance = ''

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

                                    //update the totalpayins and outs variables that are global
                                    totalPayinsRange = data.totalIncomePerRange
                                    totalPayOutsRange = data.totalExpensesPerRange
                                    payInFilterCategory = ((payInFilterCategory).replace(/_/g, " "))
                                    payInFilterCategory = (payInFilterCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    payOutFilterCategory = ((payOutFilterCategory).replace(/_/g, " "))
                                    payOutFilterCategory = (payOutFilterCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    // searchInput = ((searchInput).replace(/_/g, " "))
                                    // searchInput = (searchInput).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    //DETERMINE HOW TO DISPLAY THE PAYINs TABLE, EITHER BASED ON THE CATEGORY FILTERED CONDITIONS OR NOT
                                    if (payOutFilterCategory === "NoPayOutCatFilter" && payInFilterCategory === "NoPayInCatFilter") { //NO FILTER AT ALL
                                        //do  display other blocks like opening balance, and cash balance
                                        document.querySelector("#openingBalBox").style.display = 'block'
                                        document.querySelector("#cashBalanceBox").style.display = 'block'
                                        document.querySelector('.incomeCategory').innerText = ''
                                        document.querySelector('.expenseCategory').innerText = ''
                                        removeBlocksStyle()

                                    }
                                    if ((payOutFilterCategory !== "NoPayOutCatFilter" && payInFilterCategory === "NoPayInCatFilter")) { //THERE IS A PAYOUT CATEGORY FILTER
                                        document.querySelector("#openingBalBox").style.display = 'none' //OPENING BAL
                                        document.querySelector("#cashBalanceBox").style.display = 'none' //CLOSING BAL
                                        //update the total section of the payin to add the filter by category
                                        // alert(payOutFilterCategory)
                                        document.querySelector('.expenseCategory').innerText = payOutFilterCategory
                                        document.querySelector('.incomeCategory').innerText = 'All Categories'
                                        blocksStyle()

                                    }

                                    if ((payOutFilterCategory === "NoPayOutCatFilter" && payInFilterCategory !== "NoPayInCatFilter")) { //THERE IS A PAYOUT CATEGORY FILTER
                                        document.querySelector("#openingBalBox").style.display = 'none' //OPENING BAL
                                        document.querySelector("#cashBalanceBox").style.display = 'none' //CLOSING BAL
                                        //update the total section of the payin to add the filter by category
                                        document.querySelector('.expenseCategory').innerText = 'All Categories'
                                        document.querySelector('.incomeCategory').innerText = payInFilterCategory
                                        blocksStyle()
                                    }

                                    if (payOutFilterCategory !== "NoPayOutCatFilter" && payInFilterCategory !== "NoPayInCatFilter") { //THERE IS A PAYOUT CATEGORY FILTER
                                        document.querySelector("#openingBalBox").style.display = 'none' //OPENING BAL
                                        document.querySelector("#cashBalanceBox").style.display = 'none' //CLOSING BAL
                                        // alert(payOutFilterCategory)
                                        //update the total section of the payin to add the filter by category
                                        document.querySelector('.expenseCategory').innerText = payOutFilterCategory
                                        document.querySelector('.incomeCategory').innerText = payInFilterCategory
                                        blocksStyle()
                                    }


                                    //fill the cashflow array with data from database
                                    cashFlowArray = data.itemsToProcess
                                    if (searchInput !== null) {
                                        itemsToProcess = data.payInSearchedItemsToProcess
                                        totalPages = data.payInSearchedTotalPages
                                        console.log(totalPages)
                                        document.getElementById('searchInput').value = searchInput
                                        document.querySelector('.incomeCategory').innerText = searchInput
                                        cashBalance = Number((parseFloat(data.payInSearchedInputTotal) + parseFloat(data.openingBalance)) - parseFloat(data.totalExpensesPerRange)).toFixed(2);
                                        //TOTAL PAYINs 'whether filtered by cat or not'
                                        document.querySelector('.totalIncome').innerText = Number(data.payInSearchedInputTotal).toFixed(2);
                                        //TOTAL PAYOUts 'whether filtered by cat or not'
                                        document.querySelector(".totalExpenses").innerText = Number(data.totalExpensesPerRange).toFixed(2);

                                        //CALL THE FUNCTION TO CREATE TABLE ROWS
                                        currentPayInTable(itemsToProcess, pageSize, totalPages, page, startDate, endDate);
                                        //call the updatefilterbycategory function
                                        updateFilterByCategory(startDate, endDate)
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
                                    }
                                    if (searchInput === null) {
                                        totalPages = parseInt(data.totalPages)
                                        cashBalance = Number((parseFloat(data.totalIncomePerRange) + parseFloat(data.openingBalance)) - parseFloat(data.totalExpensesPerRange)).toFixed(2);
                                        //TOTAL PAYINs 'whether filtered by cat or not'
                                        document.querySelector('.totalIncome').innerText = Number(data.totalIncomePerRange).toFixed(2);
                                        //TOTAL PAYOUts 'whether filtered by cat or not'
                                        document.querySelector(".totalExpenses").innerText = Number(data.totalExpensesPerRange).toFixed(2);
                                        itemsToProcess = data.itemsToProcess
                                        //CALL THE FUNCTION TO CREATE TABLE ROWS
                                        currentPayInTable(itemsToProcess, pageSize, totalPages, page, startDate, endDate);
                                        //call the updatefilterbycategory function
                                        updateFilterByCategory(startDate, endDate)
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
                                    }
                                })
                                .catch(error => {
                                    console.error('Error:', error);
                                });
                        };
                        //FUNCTION TO PUT CONTENTS IN THE TABLE [/THIS FUNCTION WILL BE GLOBAL USED BY EVERYONE AND EVERYTHING THAT WANT TO PUT SOMETHING ON THE PAYIN TABLE]
                        function currentPayInTable(itemsToProcess, pageSize, totalPages, page, startDate, endDate) {
                            displayContainerBlocks()
                            let hasMatched = false
                            // REMOVE THE WHOLE TABLE
                            const wholeTable = document.querySelectorAll(".IncomeTableRow");
                            for (let h = 0; h < wholeTable.length; h++) {
                                const el = wholeTable[h];
                                el.style.display = "none";
                            }
                            const theDate = moment(startDate);//convert to the format dd/mm/yy using moment
                            const expectedDateFormat = theDate.format('DD/MM/YYYY');
                            if (startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
                                selectedDate = expectedDateFormat;
                            }
                            tableContainer.scrollLeft = 0;
                            //if the totals are equal to 0 of the generated range.dispay message that there is no items t display
                            if (itemsToProcess.length === 0) {
                                //display message
                                document.getElementById('Table_messages').style.display = 'block'
                                document.querySelector('.noDataText').innerText = 'No Data To Display'
                                document.querySelector('.noDataText2').innerText = 'There are no payIns in the selected time period'
                            }
                            else {
                                document.getElementById('Table_messages').style.display = 'none'
                                for (let a = 0; a < itemsToProcess.length; a++) { //LOOP AGAIN for the purpose of The contents to display to the user
                                    const row = itemsToProcess[a];
                                    const date = row.CashFlowDate;
                                    const parts = date.split("/");
                                    const formattedDate = parts[1] + "/" + parts[0] + "/" + parts[2];
                                    const formattedDates2 = new Date(formattedDate);
                                    if (startDate.getTime() <= formattedDates2.getTime() && formattedDates2.getTime() <= endDate.getTime()) {
                                        if (row.CashFlowType === 'Pay in') {
                                            hasMatched = true
                                            const tBody = document.querySelector(".table-body");
                                            const numRows = tBody.rows.length;
                                            const isEven = numRows % 2 === 0;

                                            const newEmptyRow = document.createElement("tr");
                                            newEmptyRow.classList.add("IncomeTableRow");

                                            if (isEven) {
                                                newEmptyRow.classList.add("roweven");
                                            } else {
                                                newEmptyRow.classList.add("rowodd");
                                            }
                                            const currName = Array.from(WorldCurrencies).find((curr) => (curr.Currency_Name).toLowerCase() === (row.CashFlowCurrency).toLowerCase()); //find matching currency name with the one in the incomes table

                                            if (currName) {
                                                newCurrCode = currName.ISO_Code;
                                            }
                                            //find the base currency code
                                            const currCode = Array.from(newCurrencies).find((curr) => curr.BASE_CURRENCY === "Y"); //find matching currency name with the one in the incomes table
                                            const baseCurrencyCode = Array.from(WorldCurrencies).find((curr) => (curr.Currency_Name).toLowerCase() === (currCode.Currency_Name).toLowerCase()); //find matching currency name with the one in the incomes table

                                            if (baseCurrencyCode) {
                                                baseCurrCode = baseCurrencyCode.ISO_Code;
                                            }
                                            // create the cells for the new row
                                            const checkboxCell = document.createElement("td");
                                            const checkbox = document.createElement("input");
                                            checkbox.type = "checkbox";
                                            checkbox.classList.add("form-check-input");
                                            checkbox.value = "checkedValue";

                                            checkboxCell.appendChild(checkbox);
                                            newEmptyRow.appendChild(checkboxCell);

                                            const hiddenCell = document.createElement("td");
                                            hiddenCell.hidden = true;
                                            hiddenCell.innerHTML = row._id;
                                            hiddenCell.classList.add("incomeIdClass");
                                            newEmptyRow.appendChild(hiddenCell);

                                            const dateCell = document.createElement("td");
                                            dateCell.contentEditable = true;
                                            dateCell.classList.add("incomeDate");
                                            dateCell.innerHTML = row.CashFlowDate;
                                            newEmptyRow.appendChild(dateCell);

                                            const shiftCell = document.createElement("td");
                                            shiftCell.classList.add("editableShift");
                                            shiftCell.innerHTML = row.CashFlowShift;
                                            shiftCell.contentEditable = false;
                                            const shiftstatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "ShiftNo"
                                            );
                                            newEmptyRow.appendChild(shiftCell);

                                            if (shiftstatus.isDisplayed == true) {
                                                shiftCell.style.display = "table-cell";
                                            } else if (shiftstatus.isDisplayed === false) {
                                                shiftCell.style.display = "none";
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

                                            const radiostatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "Tax"
                                            );
                                            if (radiostatus.isDisplayed === true) {
                                                radioCell.style.display = "table-cell";
                                            } else if (radiostatus.isDisplayed === false) {
                                                radioCell.style.display = "none";
                                            }
                                            const invoiceCell = document.createElement("td");
                                            invoiceCell.classList.add("editableInvoice");

                                            invoiceCell.innerHTML = row.CashFlowInvoiceRef;
                                            invoiceCell.contentEditable = true;
                                            newEmptyRow.appendChild(invoiceCell);
                                            const invoiceStatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "InvoiceRef"
                                            );
                                            if (invoiceStatus.isDisplayed === true) {
                                                invoiceCell.style.display = "table-cell";
                                            } else {
                                                invoiceCell.style.display = "none";
                                            }
                                            const descriptionCell = document.createElement("td");
                                            descriptionCell.classList.add("editable-cell");
                                            descriptionCell.style.cursor = "pointer";
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
                                            newEmptyRow.appendChild(descriptionCell);
                                            //=====================================================================================
                                            const categoryCell = document.createElement('td');
                                            categoryCell.classList.add('categories-cell');
                                            //create the DROPDOWN MENU
                                            // console.log(row.CashFlowCategory) 
                                            const categoryDropdownMenu = document.createElement('div');
                                            categoryDropdownMenu.classList.add('dropdown');
                                            const categoryDropdownButton = document.createElement('button');
                                            categoryDropdownButton.classList.add('btn');
                                            row.CashFlowCategory = ((row.CashFlowCategory).replace(/_/g, " "))
                                            row.CashFlowCategory = (row.CashFlowCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            const catTruncatedText = truncateText(row.CashFlowCategory, 18);
                                            categoryDropdownButton.innerText = catTruncatedText;
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
                                            createIncCate.appendChild(dropdownItem1);
                                            dropdownMenu.appendChild(createIncCate);

                                            newIncomeCategories.forEach(option => {
                                                const dropdownList = document.createElement('li');
                                                dropdownList.classList.add('incCate-option');
                                                const dropdownItem = document.createElement('a');
                                                dropdownItem.classList.add('dropdown-item');
                                                dropdownItem.href = '#';
                                                //get the full category name
                                                const catOptionSpan = document.createElement('span');
                                                catOptionSpan.classList.add(`cateList-optionSpan`);
                                                catOptionSpan.innerText = option.category;
                                                catOptionSpan.hidden = true;

                                                dropdownItem.classList.add('categorySpanId');
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
                                            categoryCell.appendChild(catDropdownContainer);
                                            categoryCell.appendChild(categoryDropdownMenu);
                                            newEmptyRow.appendChild(categoryCell);
                                            const categoryStatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "Category"
                                            );
                                            if (categoryStatus.isDisplayed === true) {
                                                categoryCell.style.display = "table-cell";
                                            } else if (categoryStatus.isDisplayed === false) {
                                                categoryCell.style.display = "none";
                                            }
                                            //======================================================================================================
                                            //currency cell
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
                                            //==============================================

                                            const amountCell = document.createElement("td");
                                            amountCell.classList.add("amount-cell");
                                            const amountSpan = document.createElement("span");
                                            amountSpan.classList.add("incAmount");
                                            amountSpan.contentEditable = true;
                                            amountSpan.innerHTML = Number(row.CashFlowAmount).toFixed(2);
                                            const symbolSpan1 = document.createElement("span");
                                            symbolSpan1.classList.add("symbol1");
                                            symbolSpan1.innerHTML = newCurrCode;
                                            amountCell.appendChild(symbolSpan1);
                                            amountCell.appendChild(amountSpan);
                                            newEmptyRow.appendChild(amountCell);

                                            const rateCell = document.createElement("td");
                                            rateCell.classList.add("incomeRate");
                                            const rateSpan1 = document.createElement("span");
                                            rateSpan1.classList.add("incRate");
                                            rateSpan1.innerHTML = Number(row.CashFlowRate).toFixed(2);
                                            rateSpan1.contentEditable = true;
                                            const symbolSpan = document.createElement("span");
                                            symbolSpan.classList.add("symbol");
                                            symbolSpan.innerHTML = newCurrCode;
                                            rateCell.appendChild(symbolSpan);
                                            rateCell.appendChild(rateSpan1);
                                            newEmptyRow.appendChild(rateCell);

                                            const cashEquivCell = document.createElement("td");
                                            cashEquivCell.classList.add("cashEquivClass");
                                            const cashEquivSpan1 = document.createElement("span");
                                            const cashEquivSpan = document.createElement("span");
                                            cashEquivSpan1.classList.add("cashEquivCell");
                                            cashEquivSpan.classList.add("Equivsymbol");
                                            cashEquivSpan.innerHTML = baseCurrCode;
                                            cashEquivSpan1.innerHTML = Number(row.CashFlowCashEquiv).toFixed(2);
                                            cashEquivCell.appendChild(cashEquivSpan);
                                            cashEquivCell.appendChild(cashEquivSpan1);
                                            const cashstatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "CashEquiv"
                                            );
                                            newEmptyRow.appendChild(cashEquivCell);
                                            if (cashstatus.isDisplayed === true) {
                                                cashEquivCell.style.display = "table-cell";
                                            } else if (cashstatus.isDisplayed === false) {
                                                cashEquivCell.style.display = "none";
                                            }
                                            const profitCell = document.createElement("td");
                                            profitCell.classList.add("runningBalance");

                                            const profitStatus = Array.from(headersStatus).find(
                                                (name) => name.HeaderName === "RunningBalance"
                                            );
                                            newEmptyRow.appendChild(profitCell);
                                            if (profitStatus.isDisplayed === true) {
                                                profitCell.style.display = "table-cell";
                                            } else if (profitStatus.isDisplayed === false) {
                                                profitCell.style.display = "none";
                                            }
                                            theAlreadyExistingRow(newEmptyRow);
                                            tBody.appendChild(newEmptyRow);
                                        }
                                    }
                                }
                                addNewRow(); //THIS IS THE NEW EMPTY ROW READY TO CAPTURE ANY CONTENTS

                            }
                            // update the status section with current page and items per page information
                            document.querySelector('.spanText').innerText = page;
                            document.querySelector('.spanText1').innerText = totalPages; //THIS WILL WRITE 1 OF BLA BLA BLA
                            //THIS HAS TO BE VISIBLE ALWAYS WHETHER THERE ARE MORE THAN 1 PAGE
                            if (hasMatched === true) {
                                document.querySelector(".footer").style.display = "block";
                            }
                            else if (hasMatched === false) {
                                document.querySelector(".footer").style.display = "none";
                            }
                            document.querySelector('.rowsPerPage').innerText = pageSize

                        }

                        //=================================================================================================
                        //  SORTING FUNCTION
                        // Sort the array by 'cashflow date' in ascending order
                        function ascending() {
                            cashFlowArray.sort((a, b) => {
                                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                                return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
                            });
                            //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                            sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            eDate = localStorage.getItem("lastDate");
                            const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            const endDate = new Date(eDate);
                            defaultDisplayContent(startDate, endDate);
                        }
                        function descending() {
                            // Sort the array by 'income date' in descending order
                            cashFlowArray.sort((a, b) => {
                                const [dayA, monthA, yearA] = a.CashFlowDate.split('/');
                                const [dayB, monthB, yearB] = b.CashFlowDate.split('/');
                                return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
                            });
                            //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                            sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            eDate = localStorage.getItem("lastDate");
                            const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            const endDate = new Date(eDate);
                            defaultDisplayContent(startDate, endDate);

                        }
                        document.getElementById('sortDateAsc').addEventListener('click', ascending);
                        document.getElementById('sortDateDesc').addEventListener('click', descending);
                        //======================================================================================

                        const rows = document.querySelectorAll(".IncomeTableRow");

                        rows.forEach((row) => {
                            row.addEventListener("click", function (event) {
                                const currentIncomeId = row.querySelector(".incomeIdClass").textContent.trim();
                                //  currentIncomeId = event.target.closest('tr').id;
                                document.querySelector(".myId").innerText = currentIncomeId;
                            });
                        });
                        //=============================================================================
                        //FUNCTION TO CALL WHEN SAVING NEW RECORD
                        async function saveCashFlow(itemsToProcess) {
                            try {
                                spinner.style.display = "block";
                                const response = await fetch("/saveCashflow", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        itemsToProcess,
                                    }),
                                });

                                const data = await response.json();
                                cashFlowArray = []
                                if (data.isSaving === true) {
                                    let dbDocs = data.documents;
                                    for (let i = 0; i < dbDocs.length; i++) {
                                        const doc = dbDocs[i];
                                        cashFlowArray.push(doc);
                                    }
                                    let itemsPerPage;
                                    //get whatever is in the localstorage --the itemsPerPage
                                    const itemsFromLS = localStorage.getItem("itemsPerPage");
                                    if (itemsFromLS === null) {
                                        itemsPerPage = 5
                                    }
                                    else if (itemsFromLS !== null) {
                                        itemsPerPage = itemsFromLS
                                    }
                                    //UPDATE THE INTERFACE
                                    sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    eDate = localStorage.getItem("lastDate");
                                    const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    const endDate = new Date(eDate);

                                    //get the data recored for that period selected
                                    let incomeForThatDay = []
                                    for (let a = 0; a < cashFlowArray.length; a++) {
                                        const row = cashFlowArray[a];
                                        if (row.CashFlowType === 'Pay in') {
                                            const incomeDate = row.CashFlowDate;
                                            const parts = incomeDate.split("/");
                                            const formattedDate =
                                                parts[1] + "/" + parts[0] + "/" + parts[2];
                                            const formattedDates2 = new Date(formattedDate);
                                            if (
                                                startDate.getTime() <=
                                                formattedDates2.getTime() &&
                                                formattedDates2.getTime() <=
                                                endDate.getTime()
                                            ) {
                                                //STORE IN AN ARRAY 
                                                incomeForThatDay.push(row)
                                            }
                                        }
                                    }
                                    //get the current page from the local storage
                                    const currentPageFromLS = localStorage.getItem('incomeCurrPage');
                                    if (currentPageFromLS === null) {
                                        currentPage = 1
                                    }
                                    else if (currentPageFromLS !== null) {
                                        currentPage = currentPageFromLS
                                    }
                                    if (incomeForThatDay.length > itemsPerPage) {
                                        currentPage = Math.ceil(incomeForThatDay.length / itemsPerPage)

                                    } else if (incomeForThatDay.length < itemsPerPage) {
                                        currentPage = 1
                                    }
                                    updateFilterByCategory(startDate, endDate)
                                    localStorage.setItem('incomeCurrPage', currentPage);
                                    myDatePicker(startDate, endDate);
                                    defaultDisplayContent(startDate, endDate);
                                    notification("Added...");
                                    //after the upload process is successfully done,show the table and remove spinner
                                    spinner.style.display = "none";
                                    // displayContainers()

                                } else {
                                    notification('error saving data')
                                    console.error("Error saving data");
                                    // displayContainers()

                                }
                            } catch (error) {
                                console.error(error);
                            }


                        }

                        //======================================================================================================
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

                                        }

                                        // call the function that updates the table
                                        //UPDATE THE INTERFACE IF THE ARRAY UPDATE HAS SOMETHING
                                        sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                        eDate = localStorage.getItem("lastDate");
                                        const startDate = new Date(sDate); //ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                        const endDate = new Date(eDate);
                                        updateFilterByCategory(startDate, endDate)
                                    }
                                })
                                .catch((error) => {
                                    console.error(`ErrorInserting`, error);
                                });
                        }
                        ///===============================================================================================
                        function removeContainers() {
                            //clear out all containers
                            document.querySelector(
                                ".loader-container"
                            ).style.display = "block";
                            document.querySelector(".loader-text").style.display =
                                "none";
                            // document.querySelector(".loader2-text").style.display =
                            //     "block";
                            // document.querySelector(".loader2-text").innerText =
                            //     "Importing";
                            document.querySelector(".main-card").style.display =
                                "none";
                            document.querySelector(
                                ".main-card-second"
                            ).style.display = "none";
                        }
                        function displayContainers() {
                            //clear out all containers
                            document.querySelector(
                                ".loader-container"
                            ).style.display = "none";
                            document.querySelector(".loader-text").style.display =
                                "none";
                            // document.querySelector(".loader2-text").style.display =
                            //     "block";
                            // document.querySelector(".loader2-text").innerText =
                            //     "Importing";
                            document.querySelector(".main-card").style.display =
                                "block";
                            document.querySelector(
                                ".main-card-second"
                            ).style.display = "block";
                        }
                        const tableErrorMsgs =
                            document.getElementById("Table_messages");
                        //====================================================================================

                        sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                        eDate = localStorage.getItem('lastDate');

                        if (sDate === null && eDate === null) {//CHECK IF THEY ARE EMPTY. IF SO LOAD THESE VARIABLES WITH CURRENT DATES USING MOMENT
                            startDate = new Date(moment())
                            endDate = new Date(moment())
                        }
                        else {
                            startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                            endDate = new Date(eDate);
                        }
                        //update the category dropdwon on the category header
                        //update the category dropdwon on the category header
                        const categoryHeader = document.querySelector('.categoryHeader')
                        const headerCategory = document.createElement('div');
                        headerCategory.classList.add('dropdown');
                        const headerCategoryButton = document.createElement('button');
                        headerCategoryButton.classList.add('btn');
                        headerCategoryButton.style.backgroundColor = 'transparent'
                        // add the dropdown atttribute
                        headerCategoryButton.setAttribute('data-bs-toggle', 'dropdown');
                        headerCategoryButton.setAttribute('aria-expanded', 'false');
                        const headerCategoryCaret = document.createElement('i');
                        headerCategoryCaret.style.fontSize = 'smaller';
                        headerCategoryCaret.classList.add('fas');
                        headerCategoryCaret.classList.add('fa-caret-down');
                        headerCategoryCaret.classList.add('ms-2');
                        headerCategoryCaret.classList.add('unRotate');

                        const headerCategoryButtonSpan1 = document.createElement('div');
                        headerCategoryButtonSpan1.innerText = 'Category'
                        headerCategoryButtonSpan1.style.marginTop = '9px'
                        headerCategoryButtonSpan1.appendChild(headerCategoryCaret)
                        //DROPDOWN MENU
                        const headerCategoryMenu = document.createElement('ul');
                        headerCategoryMenu.classList.add('dropdown-menu');
                        headerCategoryMenu.classList.add('headerDropdownMenu');

                        //create a span to contain the each category details
                        const categoryHeaderSpan = document.createElement('div');
                        categoryHeaderSpan.classList.add('categoryHeaderSpan')
                        headerCategoryButton.appendChild(headerCategoryButtonSpan1)
                        updateFilterByCategory(startDate, endDate) //THIS WILL THEN BECOME THE ENTRY POINT
                        function updateFilterByCategory(startDate, endDate) {
                            //CHECK IF THERE EXIST THE CURRENCY SELECTED
                            const checkCurrency = Array.from(newCurrencies).find(curr => curr.BASE_CURRENCY === 'Y')
                            const checkSymbol = Array.from(WorldCurrencies).find(curr => (curr.Currency_Name).toLowerCase() === (checkCurrency.Currency_Name).toLowerCase())
                            if (checkSymbol) {
                                baseCurrCode = checkSymbol.ISO_Code
                            }
                            sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            eDate = localStorage.getItem('lastDate');

                            if (sDate === null && eDate === null) {//CHECK IF THEY ARE EMPTY. IF SO LOAD THESE VARIABLES WITH CURRENT DATES USING MOMENT
                                startDate = new Date(moment())
                                endDate = new Date(moment())
                            }
                            else {
                                startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                endDate = new Date(eDate);
                            }
                            //get the searched input
                            let searchInput = localStorage.getItem("searchInput")

                            fetch('/getCategoriesTotals', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    startDate: sDate,
                                    endDate: eDate,
                                    searchInput: searchInput
                                })
                            })
                                .then(response => response.json())
                                // .then(responseData => {
                                .then(data => {
                                    //remove existing list items
                                    const categoryOptionList = document.querySelectorAll('.cateList-option');
                                    for (let k = 0; k < categoryOptionList.length; k++) {
                                        const element = categoryOptionList[k];
                                        element.style.display = 'none'
                                    }

                                    //CREATE HTML ELEMENTS FOR THE FIRST LI
                                    const noFilter = document.createElement("li");
                                    noFilter.classList.add('cateList-option');
                                    const catOptionItem = document.createElement('a');
                                    catOptionItem.href = '#';
                                    catOptionItem.classList.add('dropdown-item');
                                    catOptionItem.classList.add('cateList-item');
                                    let categoryItemSpan = document.createElement('span');
                                    categoryItemSpan.classList.add(`cateList-optionId`)
                                    categoryItemSpan.classList.add('float-right')
                                    if (searchInput !== null) {
                                        categoryItemSpan.innerText = ` ${baseCurrCode + Number(data.payInSearchedInputTotals).toFixed(2)}`;
                                        categoryHeaderSpan.innerText = `All Categories   ${baseCurrCode + Number(data.payInSearchedInputTotals).toFixed(2)}`;
                                    }
                                    else if (searchInput === null) {
                                        categoryItemSpan.innerText = ` ${baseCurrCode + Number(data.allPayInCatTotals).toFixed(2)}`;
                                        categoryHeaderSpan.innerText = `All Categories  ${baseCurrCode + Number(data.allPayInCatTotals).toFixed(2)}`;
                                    }
                                    catOptionItem.innerText = 'All Categories'
                                    //create a span with unique id that will store the original name THAT WILL BE HIDDEN
                                    const catOptionSpan = document.createElement('span');
                                    catOptionSpan.classList.add(`cateList-optionSpan`);
                                    catOptionSpan.innerText = 'All Categories';
                                    catOptionSpan.hidden = true;

                                    catOptionItem.appendChild(catOptionSpan);
                                    catOptionItem.appendChild(categoryItemSpan);
                                    noFilter.appendChild(catOptionItem);
                                    headerCategoryMenu.appendChild(noFilter);

                                    let payInCatArray = []
                                    if (searchInput !== null) {
                                        payInCatArray = data.payInSearchedCatArray
                                        displayCategories(payInCatArray)
                                    }
                                    else if (searchInput === null) {
                                        payInCatArray = data.payInCatArray
                                        displayCategories(payInCatArray)
                                    }
                                    function displayCategories(payInCatArray) {
                                        //LOOP IN THE ARRAY WITH UPDATED DATA FROM DATABASE TO GET THE AMOUNT OF EACH CATEDORY
                                        for (let a = 0; a < payInCatArray.length; a++) {
                                            const payInCatData = payInCatArray[a]
                                            const payInCat = Object.keys(payInCatData)[0]
                                            let payInCategory = ((payInCat).replace(/_/g, " "))
                                            payInCategory = (payInCategory).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                            const payInCatAmount = payInCatData[payInCat]
                                            //DISPLAY THE CATEGORY TOTALS UNDER THE CATEGORY HEADER ON COPNDITION THAT IT IS THE WANTED FILTER
                                            const cateNameFromLS = localStorage.getItem("payInCategory")
                                            if (cateNameFromLS === null) {
                                                if (searchInput !== null) {
                                                    categoryHeaderSpan.innerText = 'All Categories' + ' ' + baseCurrCode + Number(data.payInSearchedInputTotals).toFixed(2)
                                                }
                                                else {
                                                    categoryHeaderSpan.innerText = 'All Categories' + ' ' + baseCurrCode + Number(data.allPayInCatTotals).toFixed(2)
                                                }

                                            } else if ((cateNameFromLS !== null) && (payInCat === cateNameFromLS)) {
                                                categoryHeaderSpan.innerText = payInCategory + ' ' + baseCurrCode + payInCatAmount.toFixed(2)
                                                if (searchInput !== null) {
                                                    categoryHeaderSpan.innerText = payInCategory + ' ' + baseCurrCode + payInCatAmount.toFixed(2)
                                                }
                                            }
                                            //TRUNCATE THE CAT NAME
                                            const truncatedText = truncateText(payInCategory, 14);
                                            const dropdownList = document.createElement('li');
                                            const dropdownItem = document.createElement('a');
                                            dropdownList.classList.add('cateList-option');
                                            dropdownItem.classList.add('dropdown-item');
                                            dropdownItem.classList.add('cateList-item');
                                            dropdownItem.href = '#';

                                            //create a span with unique id that will store the original name THAT WILL BE HIDDEN
                                            const catOptionSpan = document.createElement('span');
                                            catOptionSpan.classList.add(`cateList-optionSpan`);
                                            catOptionSpan.innerText = payInCat;
                                            catOptionSpan.hidden = true;

                                            //class that will carry the amount
                                            const catOptionSpanAmnt = document.createElement('span');
                                            catOptionSpanAmnt.classList.add(`cateList-optionId`);
                                            catOptionSpanAmnt.classList.add('float-right')
                                            catOptionSpanAmnt.innerText = "  " + baseCurrCode + payInCatAmount.toFixed(2)//THE AMOUNT

                                            const optionText = document.createTextNode(truncatedText);
                                            dropdownItem.appendChild(catOptionSpan);
                                            dropdownItem.appendChild(optionText);
                                            dropdownItem.appendChild(catOptionSpanAmnt);
                                            dropdownList.appendChild(dropdownItem);
                                            headerCategoryMenu.appendChild(dropdownList);
                                        }
                                        headerCategoryButton.appendChild(categoryHeaderSpan)
                                        headerCategory.appendChild(headerCategoryButton)
                                        headerCategory.appendChild(headerCategoryMenu)
                                        //ADD EVENT LISTENER ON EACH CATEGORY TOTALS
                                        const categoryListItems = document.querySelectorAll('.cateList-item')
                                        categoryListItems.forEach((cat, index) => {
                                            cat.addEventListener("click", () => {
                                                const categoryNameArray = (cat.innerText).split("\n")
                                                categoryHeaderSpan.innerText = cat.querySelector(`.cateList-optionSpan`).innerText + ' ' + categoryNameArray[1]
                                                if (cat.querySelector(`.cateList-optionSpan`).innerText !== 'All Categories') {
                                                    console.log(cat.querySelector(`.cateList-optionSpan`).innerText)
                                                    localStorage.setItem('payInCategory', cat.querySelector(`.cateList-optionSpan`).innerText)
                                                }
                                                else if (cat.querySelector(`.cateList-optionSpan`).innerText === 'All Categories') {
                                                    localStorage.removeItem('payInCategory')
                                                    // defaultDisplayContent(startDate, endDate)
                                                }
                                                isFiltering = true//change the filtering status to true
                                                isNavigating = false//change the navigation status to true
                                                //SET THE FIRST PAGE TO ONE
                                                let currentPage = 1
                                                localStorage.setItem('incomeCurrPage', currentPage)
                                                defaultDisplayContent(startDate, endDate)
                                            })
                                        })
                                    }
                                })
                        }
                        categoryHeader.appendChild(headerCategory)
                        //add an event lister on the header
                        categoryHeader.addEventListener("click", (event) => {
                            headerCategoryCaret.classList.remove('unRotate');
                            headerCategoryCaret.classList.toggle('rotate');
                            //THEN COMPUTE CAT TOTALS
                            updateFilterByCategory(startDate, endDate)
                        })

                        //=========================================================================================
                        //DATE RANGE PICKER FUNCTION
                        myDatePicker(startDate, endDate)
                        function myDatePicker(startDate, endDate) {
                            //TAP INTO THE DATERANGE
                            $("#dateRange").daterangepicker(
                                //THIS IS APPLYING RANGES SELECTED BY THE USER PICKING UP STARTDATES AND ENDDATES
                                {
                                    opens: "right",
                                    showDropdowns: true,
                                    linkedCalendars: false,
                                    ranges: {
                                        Today: [moment(), moment()],
                                        Yesterday: [
                                            moment().subtract(1, "days"),
                                            moment().subtract(1, "days"),
                                        ],
                                        "Last 7 Days": [
                                            moment().subtract(6, "days"),
                                            moment(),
                                        ],
                                        "Last 30 Days": [
                                            moment().subtract(29, "days"),
                                            moment(),
                                        ],
                                        "This Month": [
                                            moment().startOf("month"),
                                            moment().endOf("month"),
                                        ],
                                        "Last Month": [
                                            moment().subtract(1, "month").startOf("month"),
                                            moment().subtract(1, "month").endOf("month"),
                                        ],
                                        "Last Year": [
                                            moment().subtract(1, "year").startOf("year"),
                                            moment().subtract(1, "year").endOf("year"),
                                        ],
                                        "This Year": [
                                            moment().startOf("year"),
                                            moment().endOf("year"),
                                        ],
                                    },
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
                                    updateFilterByCategory(startDate, endDate)
                                    defaultDisplayContent(startDate, endDate)
                                }
                            );

                            $(".drp-calendar.right").hide();
                            $(".drp-calendar.left").addClass("single");
                            $(".calendar-table").on("DOMSubtreeModified", function () {
                                var el = $(".prev.available").parent().children().last();
                                if (el.hasClass("next available")) {
                                    return;
                                }
                                el.addClass("next available");
                                el.append("<span></span>");
                            }
                            );
                        };

                        //==============================================================================
                        //user-defined function to download CSV file
                        function downloadCSV(csv, filename) {
                            let csvFile;
                            let downloadLink;
                            //define the file type to text/csv
                            csvFile = new Blob([csv], { type: "text/csv" });
                            downloadLink = document.createElement("a");
                            downloadLink.download = filename;
                            downloadLink.href = window.URL.createObjectURL(csvFile);
                            downloadLink.style.display = "none";

                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                        }
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
                        function exporting() {
                            //declare a /JavaScript variable of array type
                            let csv = [];
                            const startdateString = getFormatedDate(startDate);
                            const enddateString = getFormatedDate(endDate);
                            let filename = "PayIns -" + startdateString + '-' + enddateString;
                            sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                            eDate = localStorage.getItem("lastDate");
                            const headerRow = ['Id', 'Date', 'Type', 'ShiftNo', 'Tax', 'InvoiceRef', 'Description', 'Category', 'Currency', 'Amount', 'Rate', 'CashEquiv'];
                            csv.push(headerRow.join(","));
                            //ONE OF THE OPTIONS IS TO EXPORT EVERYTHING
                            //MAKE THE ARRAY HAVE EVERYTHING FOR THAT RANGE, SIMPLY CALL THE DEFAULT DISPLAY FUNCTION, PASSING THE VARIABLES PAGE SIZE === THE TOTAL ITEMS OF THAT RANGE
                            let pageSize = localStorage.getItem('itemsPerPage');
                            if (pageSize === null) {
                                pageSize = 5
                            }
                            let page = localStorage.getItem('incomeCurrPage')// VARIABLE IN THE LOCAL STORAGE, IF THERE IS NON WE TAKE PAGE1
                            let payInFilterCategory = localStorage.getItem("payInCategory")
                            if (page === null || payInFilterCategory !== null) {
                                page = 1
                            }

                            //GET THE L/S CATEGORY FILTER
                            if (payInFilterCategory === null) {
                                payInFilterCategory = "NoPayInCatFilter"
                            }
                            let payOutFilterCategory = localStorage.getItem('payOutcategoryName')
                            if (payOutFilterCategory === null) {
                                payOutFilterCategory = "NoPayOutCatFilter"
                            }
                            exportingCriteria = "FullExport"
                            // exportingCriteria="ExportSelected"
                            // exportingCriteria="ExportCurrentPage"
                            // Send data to the server, BUT THIS MUST BE A FUNNCTION
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
                                    payInFilterCategory: payInFilterCategory,
                                    payOutFilterCategory: payOutFilterCategory,
                                    exportingCriteria: exportingCriteria
                                })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    cashFlowArray = data.itemsToProcess
                                    let taxStatus = 'N'
                                    let CashflowType = ''
                                    //after getting the response from the server export the items
                                    for (let i = 0; i < cashFlowArray.length; i++) {
                                        const inc = cashFlowArray[i];
                                        let vat = inc.Tax.vat
                                        let ztf = inc.Tax.ztf

                                        //  console.log(vat.VatStatus + 'ztfstat' + ztf.ZtfStatus)
                                        if ((vat.VatStatus === 'Y' || ztf.ZtfStatus === 'Y')) {
                                            taxStatus = 'Y'
                                        }
                                        else {
                                            taxStatus = 'N'
                                        }
                                        CashflowType = 'Pay in'

                                        if (inc.CashFlowType === 'Pay in') {
                                            const date = inc.CashFlowDate;
                                            const parts = date.split("/");
                                            const formattedDate =
                                                parts[1] + "/" + parts[0] + "/" + parts[2];
                                            const formattedDates2 = new Date(formattedDate);

                                            //formatting the description if it has commas
                                            const incDescription =
                                                '"' + inc.CashFlowDescription + '"';

                                            if (
                                                startDate.getTime() <= formattedDates2.getTime() &&
                                                formattedDates2.getTime() <= endDate.getTime()
                                            ) {
                                                //CODE FOR
                                                if (checkedRows.length > 0) {
                                                    //DO SOMETHING
                                                    for (let d = 0; d < checkedRows.length; d++) {
                                                        const checkedRowId = checkedRows[d].querySelector(".incomeIdClass").textContent.trim();
                                                        if (inc._id === checkedRowId) {
                                                            const row = []; //to store all documents data
                                                            row.push(
                                                                inc._id, inc.CashFlowDate, CashflowType, inc.CashFlowShift, taxStatus, inc.CashFlowInvoiceRef, incDescription,
                                                                inc.CashFlowCategory, inc.CashFlowCurrency, inc.CashFlowAmount, inc.CashFlowRate, inc.CashFlowCashEquiv
                                                            );
                                                            csv.push(row.join(","));
                                                        }
                                                    }
                                                } else if (checkedRows.length === 0) {
                                                    const row = []; //to store all documents data

                                                    row.push(
                                                        inc._id, inc.CashFlowDate, CashflowType, inc.CashFlowShift, taxStatus, inc.CashFlowInvoiceRef, incDescription,
                                                        inc.CashFlowCategory, inc.CashFlowCurrency, inc.CashFlowAmount, inc.CashFlowRate, inc.CashFlowCashEquiv
                                                    );
                                                    csv.push(row.join(","));
                                                }
                                            }
                                        }
                                    }

                                    //  call the function to download the CSV file
                                    downloadCSV(csv.join("\n"), filename);
                                    checkedRows = [];
                                    //when done call the default function to retain the proper array
                                    cashFlowArray = []
                                    sDate = localStorage.getItem("firstDate"); //DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    eDate = localStorage.getItem("lastDate");
                                    startDate = new Date(sDate)
                                    endDate = new Date(eDate)
                                    defaultDisplayContent(startDate, endDate)
                                });
                        }
                        // Check if any row checkboxes are checked
                        const expBtn = document.querySelector(".export");
                        expBtn.addEventListener("click", function (event) {
                            exporting();
                        });
                        //================================================================================
                        //UPLOAD OR IMPORT SETTINGS
                        const importForm = document.querySelector('.importForm');
                        const fileInput = document.getElementById("csv-file");
                        const uploadBtn = document.getElementById("upload-btn");
                        const retryBtn = document.getElementById("cancel-btn");


                        // Prevent default behavior when dragging files over the form
                        importForm.addEventListener("dragover", (event) => {
                            event.preventDefault();
                        });

                        // Handle file drop event
                        importForm.addEventListener("drop", (event) => {
                            event.preventDefault();
                            csvFile.files = event.dataTransfer.files;
                        });

                        uploadBtn.addEventListener("click", (event) => {
                            event.preventDefault();
                            spinner.style.display = 'block'
                            //Method to read csv file and convert it into JSON
                            let extension = "";
                            let files = [];
                            let filename;
                            if (fileInput.value === '') {
                                notification("Please choose any CSV file...")
                                spinner.style.display = 'none'
                                displayContainers()
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
                                displayContainers()
                                return
                            }
                            else if (fileInput.value !== '' && extension === '.csv') {
                                const file = document.getElementById('csv-file').files[0];
                                if (file) {
                                    spinner.style.display = "block";
                                    uploadCSV(file);  // Call the function to upload the file
                                }
                            }

                        });

                        retryBtn.addEventListener("click", () => {
                            fileInput.value = "";
                        });
                        //When the user clicks outside the +add expense form it also closes
                        document.addEventListener(
                            "mousedown",
                            function handleClickOutsideBox(event) {
                                // const box = document.getElementById('expense-details-Form');
                                if (!importForm.contains(event.target)) {
                                    importForm.style.display = "none";
                                }
                            }
                        );
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
                                    spinner.style.display = "none";
                                    displayContainers()
                                    // display the modal with the total inserted count
                                    successModal.style.display = 'block'
                                    successModalText.innerText = payInArray.length
                                    document.querySelector('.uploadData').style.display = 'block'
                                    const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    const eDate = localStorage.getItem('lastDate');
                                    const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    const endDate = new Date(eDate);
                                    defaultDisplayContent(startDate, endDate)
                                    updateFilterByCategory(startDate, endDate)
                                    //update the categories arrays
                                    let dbDocs = data.categoriesDocs;
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

                                    }
                                    // updateFilterByCategory(startDate, endDate)
                                    console.log("Data successfully processed and saved.");
                                } else {
                                    //after the upload process is successfully done,show the table and remove spinner
                                    spinner.style.display = "none";
                                    displayContainers()
                                    // display the modal with the total inserted count
                                    successModal.style.display = 'block'
                                    successModalText.innerText = payOutArray.length
                                    document.querySelector('.uploadData').style.display = 'block'
                                    const sDate = localStorage.getItem('firstDate');//DATE STORED IN LOCAL STORAGE FROM OTHER JS FILES
                                    const eDate = localStorage.getItem('lastDate');
                                    const startDate = new Date(sDate);//ELSE CONVERT THE DATES IN LOCAL STORAGE TO DATE FORMAT
                                    const endDate = new Date(eDate);
                                    defaultDisplayContent(startDate, endDate)
                                    updateFilterByCategory(startDate, endDate)
                                    console.error("Error:", data.isSaving);
                                }
                            } catch (error) {
                                console.error("Error uploading CSV:", error);
                            }
                        }



                        //=========================================================================================================
                    })

                    .catch(error => console.error('Error fetching headerstatus:', error));
                console.log(headersStatus); // do something with the statuses array
            })
            .catch(error => console.error('Error fetching exp categories:', error));
    })
    .catch(error => console.error('Error fetching currencies:', error));
console.log(newCurrencies); // do something with the currencies array

//LOADING notification
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


