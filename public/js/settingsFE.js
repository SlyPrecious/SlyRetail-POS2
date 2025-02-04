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

// //WHEN THE PAYMENT TYPE BUTTON IS CLICKED DISPLAY THE PAYMWNT TYPES TABLE
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