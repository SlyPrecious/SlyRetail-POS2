// import "./moment.js";

//const moment = moment()
let fullYearCalendar = [];

// initialize date to Jan 1, 2023
let date = new Date(new Date().getFullYear(), 0, 1);
//alert(date)
// day length in milliseconds//
let dayLength = 1000 * 60 * 60 * 24;

// year length in days (account for leap years)
//let year = date.getFullYear();
let year = new Date().getFullYear();
//alert(year)
let yearLength = ((year % 4) || (!(year % 100) && (year % 400))) ? 365 : 366;
//alert(yearLength)
for (let i = 0; i < yearLength; i++) {
    // determine month
    let month = date.toLocaleDateString('en-GB', { month: 'long' });

    // determine weekday
    let weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });

    // initialize month if it does not exist
    // if (!fullYearCalendar[month])
    //     fullYearCalendar[month] = [];

    let formattedDate = moment(date, 'dd/mm/yyy');
    //  console.log(formattedDate);
    let formattedDates = formattedDate.format('DD/MM/YYYY');
    fullYearCalendar.push({
        formattedDates,
    })

    // increment date by one day
    date = new Date(date.getTime() + dayLength);

    //CODE TO LOOP IN THE INCOME ARRAY AND COMPARE THE DATE WITH THE ONES ON THE CALENDER
    //IF THEY MATCH COLLECT THE INCOME FOR THAT DAY ELSE DISPLAY A ZERO
}
// export const fullYearCalendar2 = fullYearCalendar;