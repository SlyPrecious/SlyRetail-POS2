function openAllDayPopup(){
    document.getElementById('all-day-popup').style.display="block"
}
//The function of closing the add-item popup in teachers timetable on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('all-day-popup');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });

function openStorePopup(){
  document.getElementById('all-store-popup').style.display="block"
}
//The function of closing the add-item popup in teachers timetable on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('all-store-popup');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });



  function openEmployeePopup(){
    document.getElementById('all-employee-popup').style.display="block"
}
//The function of closing the add-item popup in teachers timetable on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('all-employee-popup');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });



function selectChart(){
    document.getElementById('select-chart-type').style.display="block"
}
//The function of closing the  popup on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('select-chart-type');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });



function selectPeriod(){
  document.getElementById('select-chart-period').style.display="block"
}
//The function of closing the  popup on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('select-chart-period');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });


