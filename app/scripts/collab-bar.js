var collabBar = (function($, window) {
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
    numWaypoints: null,
    percentPerWaypoint: null,
    textRange: 3 //percent distance at which the text will show on the bar
  }

  var barRefs = {
    $sliderHandle: null,
    $sliderElapsed: null,
    $sliderRemaining: null,
    $dragContainer: null
  }

  var barStates = {
    barWidth: 0,
    barPos: 0,
    curWaypoint: 0,
    passedWaypoints: []
  }

  function init(){
    setReferences();
    //layoutBar();
    animateBar();
    addBarEvents();
    initializeNodes();
  }

  function animateBar(){
    barRefs.$sliderRemaining.css({'height' : '0%'}).animate({'height' : '100%'});
    barRefs.$sliderHandle.css({'left' : '100%'}).animate({'left': '0%'},function(){
      layoutBar();
    });
  }

  function setReferences(){
    barRefs.$sliderHandle = $('.slider-handle');
    barRefs.$sliderElapsed = $('.slider-bar.elapsed');
    barRefs.$sliderRemaining = $('.slider-bar.remaining');
    barRefs.$dragContainer = $('#drag-text-container');
  }

  function layoutBar(){
    var numWaypoints = barConfig.waypoints.length;
    barConfig.numWaypoints = numWaypoints;
    barConfig.percentPerWaypoint = Math.ceil(100/numWaypoints);
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

  function initializeNodes(){
    collabNodes.init();
  }

  function onDragSliderStart(e){
    barRefs.$dragContainer.removeClass('active');
    var barPos = $(this).position().left;
    barStates.barPos = Math.round((barPos / barStates.barWidth)*100);

  }

  function onDragSlider(e){
    var moveX = e.gesture.deltaX;
    var moveXPerc = Math.round((moveX/barStates.barWidth)*100);
    var newPos = moveXPerc + barStates.barPos;
    var dir = e.gesture.direction;
    if (newPos > 0 && newPos < 100){
      //if we havent surpassed a waypoint
      if (dir == "right" && barStates.curWaypoint < (barConfig.waypoints.length-1)){
        var waypointPos = barConfig.waypoints[barStates.curWaypoint+1].pos;
        if (newPos < waypointPos){
          $(this).css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});
          collabNodes.update(newPos, e.gesture.direction);

          if (newPos >= waypointPos - barConfig.textRange){
            showBarText('right');
          } else {
            hideBarText();
          }

        } else {
          barStates.curWaypoint++;
        }
      } else if (dir == "left" && barStates.curWaypoint > 0){
        var waypointPos = barConfig.waypoints[barStates.curWaypoint-1].pos;
        if (newPos > waypointPos){
          $(this).css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});
          collabNodes.update(newPos,dir);

          if (newPos <= waypointPos + barConfig.textRange){
            showBarText('left');
          } else {
            hideBarText();
          }

        } else {
          barStates.curWaypoint--;
        }

      }

    } else if (newPos <= 0){
      barStates.curWaypoint = 0;
    } else if (newPos >= 0){
      barStates.curWaypoint = barConfig.waypoints.length-1;
      console.log('end');
    }

  }

  function showBarText(dir){
    barRefs.$dragContainer.addClass('active');
    if (dir == "right"){
      var barText = barConfig.waypoints[barStates.curWaypoint+1].content;
    } else {
      var barText = barConfig.waypoints[barStates.curWaypoint-1].content;
    }
    $('.drag-text').text(barText);
  }

  function hideBarText(){
    barRefs.$dragContainer.removeClass('active');
  }

  function animateSliderToNextWaypoint(dir){
    barRefs.$sliderHandle.animate({'left' : barConfig.waypoints[barStates.curWaypoint].pos + '%'});
    barRefs.$sliderElapsed.animate({'width' : barConfig.waypoints[barStates.curWaypoint].pos + '%'});
  }


  function onDragSliderEnd(e){

    var dir = e.gesture.direction;

    if (dir == "right" && barStates.curWaypoint < (barConfig.waypoints.length-1) ){
      barStates.curWaypoint++;
    } else if (dir == "left" && barStates.curWaypoint > 0){
      barStates.curWaypoint--;
    }
    animateSliderToNextWaypoint(dir);

  }

  return {
    init: init,
    barConfig: barConfig,
    barStates: barStates
  }
})(jQuery, window);

