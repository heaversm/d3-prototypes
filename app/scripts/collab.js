var collabModule = (function($, window) {
  var barConfig = {
    waypoints: [
      { type: "start","content" : ""},
      { type: "waypoint","content" : "Using Google Sheets, Katherine in Finance created the quarterly budget"},
      { type: "waypoint","content" : "She shared it with the VPs of Engineering, Operations, Product Management and Sales"},
      { type: "waypoint","content" : "As they filled it out, the VPs inserted comments to get additional input from teammates"},
      { type: "waypoint","content" : "They gave other people access to edit, comment, or view only."},
      { type: "waypoint","content" : "Then Katherine shared the spreadsheet with her boss, Rhonda, for review."},
      { type: "end","content" : ""}
    ],
  }

  var barRefs = {
    $sliderHandle: null,
    $sliderElapsed: null,
    $dragContainer: null
  }

  var barStates = {
    barWidth: 0,
    barPos: 0,
    curWaypoint: 0
  }

  function init(){
    setReferences();
    layoutBar();
    addBarEvents();
  }

  function setReferences(){
    barRefs.$sliderHandle = $('.slider-handle');
    barRefs.$sliderElapsed = $('.slider-bar.elapsed');
    barRefs.$dragContainer = $('#drag-text-container');
  }

  function layoutBar(){
    var numWaypoints = barConfig.waypoints.length;
    for (var i=0; i< numWaypoints; i++){
      var $waypoint = $('<span class="slider-waypoint">');
      var waypointPerc = ((i/(numWaypoints-1))*100) ;
      barConfig.waypoints[i].pos = waypointPerc;
      $waypoint.css({'left' : waypointPerc + '%'});
      $('.slider-waypoints').append($waypoint);
    }

    barStates.barWidth = $('.slider-bar-container').width();

  }

  function addBarEvents(){
    var hammerOptions = {};
    $(".slider-handle")
    .hammer(hammerOptions)
    .on("dragstart", onDragSliderStart)
    .on("drag", onDragSlider)
    .on("dragend", onDragSliderEnd);
  }

  function onDragSliderStart(e){
    barRefs.$dragContainer.addClass('active');
    var barPos = $(this).position().left;
    barStates.barPos = Math.round((barPos / barStates.barWidth)*100);
    var dir = e.gesture.direction;
    if (dir == "right"){
      var barText = barConfig.waypoints[barStates.curWaypoint+1].content;
    } else if (dir == "left") {
      var barText = barConfig.waypoints[barStates.curWaypoint-1].content;
    }
    $('.drag-text').text(barText);
  }

  function onDragSlider(e){
    var moveX = e.gesture.deltaX;
    var moveXPerc = Math.round((moveX/barStates.barWidth)*100);
    var newPos = moveXPerc + barStates.barPos;
    if (newPos >= 0 && newPos <= 100){
      //if we havent surpassed a waypoint
      if (e.gesture.direction == "right" && barStates.curWaypoint < (barConfig.waypoints.length-1)){
        if (newPos < barConfig.waypoints[barStates.curWaypoint+1].pos){
          $(this).css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});
        } else {
          //console.log('waypoint');
        }
      } else if (e.gesture.direction == "left" && barStates.curWaypoint > 0){
        if (newPos > barConfig.waypoints[barStates.curWaypoint-1].pos){
          $(this).css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});
        } else {
          //console.log('waypoint');
        }
      }



    } else if (newPos < 0){
      barStates.curWaypoint = 0;
    } else if (newPos > 0){
      barStates.curWaypoint = barConfig.waypoints.length-1;
    }

  }

  function onDragSliderEnd(e){
    //assess the waypoint we are at - drag to closest waypoint
    if (e.gesture.direction == "right" && barStates.curWaypoint < (barConfig.waypoints.length-1) ){
      barStates.curWaypoint++;
    } else if (e.gesture.direction == "left" && barStates.curWaypoint > 0){
      barStates.curWaypoint--;
    }
    barRefs.$sliderHandle.animate({'left' : barConfig.waypoints[barStates.curWaypoint].pos + '%'});
    barRefs.$sliderElapsed.animate({'width' : barConfig.waypoints[barStates.curWaypoint].pos + '%'});
    barRefs.$dragContainer.removeClass('active');
    //console.log(barStates.curWaypoint);
  }

  return {
    init: init
  }
})(jQuery, window);

collabModule.init();
