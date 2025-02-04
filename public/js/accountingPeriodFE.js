let startDate = ""; //value to store the daterange start date
let endDate = ""; //value to store the daterange end date
let accountingPeriodDetails = []
//on page load store the document of accounting period details
fetch('/details')
    .then(response => response.json())
    .then(details => {
        details.forEach((detail) => {
            accountingPeriodDetails.push(detail);
        });
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
                    // endDate,
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.isModified === true) {
                        accountingPeriodDetails.forEach(period => {
                            if(period._id===id){
                                period.startDate=startDate
                            }
                        })
                        displayDates()
                        notification('Updated')
                    }
                    else if (data.isModified === false) {
                        accountingPeriodDetails.forEach(period => {
                            if(period._id===id && period.startDate===startDate){
                                period.startDate=startDate
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
        }, 4000); // 4 seconds total visible time
    }
    