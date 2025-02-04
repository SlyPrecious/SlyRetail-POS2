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






