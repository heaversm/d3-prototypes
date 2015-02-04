var collabBar = (function($, window) {

  var prevX = 0, curX =0;

  var barConfig = {
    waypoints: [
      { type: "start","content" : ""},
      { type: "waypoint","content" : "Parturient per eros condimentum adipiscing sagittis a dis vestibulum."},
      { type: "waypoint","content" : "Rutrum luctus scelerisque erat tempus egestas scelerisque mollis himenaeos primis."},
      { type: "waypoint","content" : "Aliquet imperdiet eleifend a eros feugiat sociis suspendisse."},
      { type: "waypoint","content" : "Sem venenatis adipiscing fames condimentum venenatis cubilia venenatis leo curae a."},
      { type: "waypoint","content" : "A dictum id a a neque pulvinar."},
      { type: "end","content" : ""}
    ],
    numWaypoints: null,
    percentPerWaypoint: null,
    textRange: 3, //percent distance at which the text will show on the bar
    autoDelay: 2000 //ms delay on each waypoint in autoplay
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
    animateBar();
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

    initializeNodes();
    addBarEvents();

  }

  function addBarEvents(){
    var hammerOptions = {};
    $(".slider-handle")
    .hammer(hammerOptions)
    .on("dragstart", onDragSliderStart)
    .on("drag", onDragSlider)
    .on("dragend", onDragSliderEnd);

    $('#collab-autoplay').one('click',function(){
      doAutoPlay();
      cancelDragEvents();
    });

  }

  function cancelDragEvents(){
    $('.slider-handle').off('dragstart drag dragend');
  }

  function disableAutoplay(){
    var displayVal = $('#collab-autoplay').css('display');
    if (displayVal != 'none'){
      $('#collab-autoplay').fadeTo(500,0,function(){
        $(this).off('click').hide();
      });
    }
  }

  function doAutoPlay(){
    if (barStates.curWaypoint == barConfig.numWaypoints-2){
      $('.slider-bar.auto').animate({'left': '100%' },{
        duration: 500,
        step: function(newPos){
          moveSlider(newPos,'right');
        },
        complete: function(){
          //
        }
      });
    } else {
      var waypointPos = barConfig.waypoints[barStates.curWaypoint+1].pos;
      var amtToAnimate = Math.floor(waypointPos)-1;
      $('.slider-bar.auto').animate({'left': amtToAnimate+'%' },{
        duration: 500,
        step: function(newPos){
          moveSlider(newPos,'right');
        },
        complete: function(){
          setTimeout(function(){
            moveSlider(waypointPos,'right');
            doAutoPlay();
          },barConfig.autoDelay);
        }
      });

    }

  }

  function initializeNodes(){
    collabNodes.init();
  }

  function onDragSliderStart(e){
    disableAutoplay();
    barRefs.$dragContainer.removeClass('active');
    var barPos = $(this).position().left;
    barStates.barPos = Math.round((barPos / barStates.barWidth)*100);
  }

  function getDirection(moveX){
    prevX = curX;
    curX = moveX;
    if (prevX > curX){
      return 'left';
    } else if (prevX < curX) {
      return 'right';
    }
  }

  function onDragSlider(e){
    var moveX = e.gesture.deltaX;
    var dir = getDirection(moveX);
    var moveXPerc = Math.round((moveX/barStates.barWidth)*100);
    var newPos = moveXPerc + barStates.barPos;
    moveSlider(newPos,dir);
  }

  function moveSlider(newPos,dir){

    if (newPos > 0 && newPos < 100){
      collabNodes.update(newPos,dir);
      //if we havent surpassed a waypoint
      if (dir == "right" ){

        var waypointPos = barConfig.waypoints[barStates.curWaypoint+1].pos;

        if (newPos < waypointPos){ //if we haven't reached the next waypoint
          barRefs.$sliderHandle.css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});

          if (newPos >= waypointPos - barConfig.textRange){ //if we're in range, show text
            showBarText(barStates.curWaypoint+1);
          } else { //keep text hidden
            hideBarText();
          }

        } else { //waypoint reach, go to the next
          barStates.curWaypoint++;
          collabNodes.animateCircles();
          collabNodes.decayLines(barStates.curWaypoint-1); //decay the old lines
        }
      } else if (dir == "left"){

        if (barStates.curWaypoint == 0){
          var waypointPos = 0;
        } else {
          var waypointPos = barConfig.waypoints[barStates.curWaypoint].pos;
        }
        //console.log(newPos, waypointPos);
        if (newPos > waypointPos){
          barRefs.$sliderHandle.css({'left' : newPos + '%'});
          barRefs.$sliderElapsed.css({'width' : newPos+ '%'});

          if (newPos <= waypointPos + barConfig.textRange){
            showBarText(barStates.curWaypoint);
          } else {
            hideBarText();
          }

        } else { //we've reached the previous waypoint
          collabNodes.hideCircles(barStates.curWaypoint);
          collabNodes.deleteLines(barStates.curWaypoint);
          barStates.curWaypoint--;
        }

      }

    } else if (newPos <= 0){
      barStates.curWaypoint = 0;
      collabNodes.deleteLines(barStates.curWaypoint);
      setBarToStart();
    } else if (newPos >= 100){
      barStates.curWaypoint = barConfig.waypoints.length-1;
      collabNodes.decayLines(barStates.curWaypoint-1);
      setBarToEnd();
    }
  }

  function showBarText(waypoint){
    barRefs.$dragContainer.addClass('active');
    var barText = barConfig.waypoints[waypoint].content;
    $('.drag-text').text(barText);
  }

  function hideBarText(){
    barRefs.$dragContainer.removeClass('active');
  }

  function onDragSliderEnd(e){

  }

  function setBarToStart(){
    barRefs.$sliderElapsed.css({'width' : '0%'});
    barRefs.$sliderHandle.css({'left' : '0%'});
    barStates.barPos = 0;
  }

  function setBarToEnd(){
    barRefs.$sliderElapsed.css({'width' : '100%'});
    barRefs.$sliderHandle.css({'left' : '100%'});
    barStates.barPos = 100;
  }

  function animateSliderToNextWaypoint(dir){
    console.log(barStates.curWaypoint,dir);
  }

  return {
    init: init,
    barConfig: barConfig,
    barStates: barStates
  }
})(jQuery, window);

