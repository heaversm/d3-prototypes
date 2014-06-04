window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

var dataArray = [];

var config = {
  canvas: {
    width: 800,
    height: 800
  },
  circles: {
    amt: 20,
    sizeMin: 5,
    sizeMax: 10
  }
}




function init(){
  populateDataArray();
}

function populateDataArray(){
  for (var i=0;i<config.circles.amt;i++){
    dataArray.push(i);
  }
  addCircles();
}

function addCircles(){
  var scale = d3.scale.linear()
  .domain([0,1])
  .range([-config.canvas.height/2,config.canvas.height/2]);

  var circleTime = d3.select("#main")
    .append("svg:svg")
    .attr("width", config.canvas.width)
    .attr("height", config.canvas.height);

  circleTime.selectAll("circle")
    .data(dataArray)
    .enter()
    .append("circle")
    .attr("cx", function(d,i){return randomNumber(0,config.canvas.width) })
    .attr("cy", function(d,i){return randomNumber(0,config.canvas.height) })
    .attr("r", function(d,i){return randomNumber(config.circles.sizeMin,config.circles.sizeMax)})
    .attr("fill", function(){return randomcolor()})
    .on("mousedown", animate);
}

function randomcolor(){
  return "#" + Math.random().toString(16).slice(2, 8) + "";
}

function randomNumber(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}


function animate(){
  d3.selectAll("circle")
  .transition()
  .duration(1000)
  .attr("cx", function(d,i){return randomNumber(0,config.canvas.width) })
  .attr("cy", function(d,i){return randomNumber(0,config.canvas.height) })
  .each("end",function(){
    animate();
  })
  //update();
}

init();
