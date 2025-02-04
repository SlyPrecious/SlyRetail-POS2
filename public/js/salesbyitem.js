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





var xValues = [50,60,70,80,90,100,110,120,130,140,150];
var yValues = [20,8,8,9,14,9,10,11,14,14,15,0];
var barColors = ["red", "green","blue","orange","brown","pink","blue",]
new Chart("myChart", {
    type: "bar",
    
data: {
    
    labels: xValues,
    datasets: [{
    borderColor: "rgb(1, 6, 105)",
    data: yValues,

    }]
},
options:{}
});