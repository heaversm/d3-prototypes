var collabNodes = (function($,window){
  var s = Snap("#svg");

  var drawingConfig = {
    lines: {
      lineGroup: null,
      lineArray: [],
      strokeActive: '#FFF'
    },
    circles: {
      amount: 20,
      sizeMin: 10,
      sizeMax: 20,
      proximity: 100,
      circleGroup: null,
      circleArray: [],
      animTime: 1000,
      circleColors: ['#B22E30','#0B9C57', '#547DBE','#F2B31B','rgba(0,0,0,0)'], //red, green, blue, yellow
      circleSizes: [5,7,25,31] //radius
    },
    canvas: {
      width: 800,
      height: 500
    }
  };

  var circleStates =  {
    phase: 0
  };

  var circleData = [
    { id: 0, set: 0, size: 0, color: 3, position: { x: 330, y: 189 } },
    { id: 1, set: 0, size: 1, color: 1, position: { x: 291, y: 223 } },
    { id: 2, set: 0, size: 0, color: 2, position: { x: 426, y: 189 } },
    { id: 3, set: 0, size: 0, color: 0, position: { x: 433, y: 251 } },
    { id: 4, set: 0, size: 0, color: 1, position: { x: 423, y: 317 } },
    { id: 5, set: 0, size: 1, color: 1, position: { x: 377, y: 353 } },
    { id: 6, set: 0, size: 3, color: 3, position: { x: 360, y: 268 }, connection: [0,1,2,3,4,19] },
    { id: 7, set: 0, size: 2, color: 2, position: { x: 484, y: 225 }, connection: [8,9,10,11,12,13,14]},
    { id: 8, set: 0, size: 0, color: 3, position: { x: 485, y: 286 } },
    { id: 9, set: 0, size: 1, color: 0, position: { x: 510, y: 305 } },
    { id: 10, set: 0, size: 0, color: 1, position: { x: 540, y: 262 } },
    { id: 11, set: 0, size: 1, color: 1, position: { x: 582, y: 202 } },
    { id: 12, set: 0, size: 0, color: 1, position: { x: 527, y: 183 } },
    { id: 13, set: 0, size: 1, color: 0, position: { x: 470, y: 168 } },
    { id: 14, set: 0, size: 0, color: 0, position: { x: 433, y: 251 } },
    { id: 15, set: 0, size: 1, color: 1, position: { x: 208, y: 59 } },
    { id: 16, set: 0, size: 1, color: 0, position: { x: 174, y: 123 } },
    { id: 17, set: 0, size: 1, color: 0, position: { x: 130, y: 181 } },
    { id: 18, set: 0, size: 2, color: 2, position: { x: 245, y: 110 }, connection: [15,16,17] },
    { id: 19, set: 0, size: 2, color: 0, position: { x: 278, y: 381 } },
    { id: 20, set: 0, size: 1, color: 1, position: { x: 105, y: 442 } },
    { id: 21, set: 0, size: 2, color: 3, position: { x: 442, y: 82 } },
    { id: 22, set: 0, size: 1, color: 1, position: { x: 698, y: 354 } },
    { id: 23, set: 0, size: 0, color: 2, position: { x: 592, y: 394 } },
    { id: 24, set: 0, size: 1, color: 1, position: { x: 560, y: 44 } },
    { id: 25, set: 0, size: 0, color: 3, position: { x: 633, y: 57 } },
    { id: 26, set: 0, size: 1, color: 0, position: { x: 170, y: 377 } },
    { id: 27, set: 0, size: 0, color: 0, position: { x: 102, y: 386 } },
    { id: 28, set: 1, size: 2, color: 1, position: { x: 415, y: 432 }, connection: [29,30,31,32,33,34,5] },
    { id: 29, set: 1, size: 1, color: 2, position: { x: 349, y: 474 } },
    { id: 30, set: 1, size: 1, color: 3, position: { x: 493, y: 473 } },
    { id: 31, set: 1, size: 1, color: 1, position: { x: 525, y: 431 } },
    { id: 32, set: 1, size: 1, color: 2, position: { x: 493, y: 473 } },
    { id: 33, set: 1, size: 1, color: 2, position: { x: 489, y: 385 } },
    { id: 34, set: 1, size: 1, color: 3, position: { x: 493, y: 473 } },
    { id: 36, set: 1, size: 2, color: 1, position: { x: 603, y: 90 },connection: [37,38,25,40] },
    { id: 37, set: 1, size: 1, color: 1, position: { x: 538, y: 148 } },
    { id: 38, set: 1, size: 1, color: 1, position: { x: 650, y: 91 } },
    { id: 40, set: 1, size: 1, color: 1, position: { x: 561, y: 44 } },
    { id: 41, set: 1, size: 0, color: 0, position: { x: 112, y: 76 } },
    { id: 42, set: 1, size: 0, color: 0, position: { x: 162, y: 46 } },
    { id: 43, set: 1, size: 0, color: 2, position: { x: 176, y: 85 }, connection: [42] },
    { id: 44, set: 1, size: 0, color: 4, position: { x: 102, y: 386 }, connection: [26,20] },
    { id: 48, set: 1, size: 0, color: 4, position: { x: 698, y: 354 }, connection: [23]},
    { id: 49, set: 1, size: 1, color: 1, position: { x: 106, y: 442 } },
    { id: 50, set: 1, size: 1, color: 2, position: { x: 106, y: 329 } },
    { id: 51, set: 1, size: 0, color: 0, position: { x: 149, y: 116 } },
    { id: 52, set: 1, size: 0, color: 1, position: { x: 706, y: 435 } },
    { id: 53, set: 1, size: 0, color: 3, position: { x: 401, y: 98 } },
    { id: 54, set: 1, size: 0, color: 3, position: { x: 447, y: 43 } },
    { id: 55, set: 1, size: 0, color: 3, position: { x: 641, y: 271 } },
    { id: 56, set: 2, size: 2, color: 0, position: { x: 660, y: 445 }, connection: [57,58,59,60] },
    { id: 57, set: 2, size: 0, color: 2, position: { x: 693, y: 394 } },
    { id: 58, set: 2, size: 1, color: 1, position: { x: 610, y: 429 } },
    { id: 59, set: 2, size: 0, color: 1, position: { x: 706, y: 435 } },
    { id: 60, set: 2, size: 0, color: 4, position: { x: 592, y: 394 }, connection: [56] },
    { id: 61, set: 2, size: 0, color: 1, position: { x: 751, y: 366 } },
    { id: 62, set: 2, size: 0, color: 3, position: { x: 641, y: 271 }, connection: [10] },
    { id: 64, set: 2, size: 0, color: 4, position: { x: 698, y: 354 }, connection: [61] },
    { id: 65, set: 2, size: 0, color: 4, position: { x: 442, y: 82 }, connection: [66,67] },
    { id: 66, set: 2, size: 0, color: 3, position: { x: 447, y: 43 } },
    { id: 67, set: 2, size: 0, color: 3, position: { x: 401, y: 98 } },
    { id: 68, set: 2, size: 0, color: 2, position: { x: 275, y: 185 } },
    { id: 69, set: 2, size: 0, color: 4, position: { x: 291, y: 223 }, connection: [68] },
    { id: 70, set: 2, size: 0, color: 0, position: { x: 149, y: 116 }, connection: [72] },
    { id: 71, set: 2, size: 0, color: 4, position: { x: 174, y: 123 }, connection: [70] },
    { id: 72, set: 2, size: 0, color: 2, position: { x: 176, y: 85 }},
    { id: 73, set: 2, size: 0, color: 1, position: { x: 157, y: 249 }, connection: [74,75,76,77,78]},
    { id: 74, set: 2, size: 0, color: 1, position: { x: 202, y: 236 }},
    { id: 75, set: 2, size: 0, color: 2, position: { x: 106, y: 329 }},
    { id: 76, set: 2, size: 0, color: 1, position: { x: 157, y: 249 }},
    { id: 77, set: 2, size: 0, color: 1, position: { x: 86, y: 257 }},
    { id: 78, set: 2, size: 0, color: 3, position: { x: 106, y: 207 }},
    { id: 79, set: 3, size: 0, color: 4, position: { x: 633, y: 57 }, connection: [80,81] },
    { id: 80, set: 3, size: 0, color: 0, position: { x: 722, y: 86 }},
    { id: 81, set: 3, size: 0, color: 2, position: { x: 676, y: 43 }},
    { id: 82, set: 3, size: 0, color: 2, position: { x: 602, y: 16 }},
    { id: 83, set: 3, size: 1, color: 1, position: { x: 561, y: 44 }, connection: [82,84] },
    { id: 84, set: 3, size: 0, color: 0, position: { x: 492, y: 26 } },
    { id: 85, set: 3, size: 0, color: 2, position: { x: 398, y: 43 } },
    { id: 86, set: 3, size: 0, color: 2, position: { x: 431, y: 17 } },
    { id: 87, set: 3, size: 0, color: 4, position: { x: 447, y: 43 }, connection: [85,86] },
    { id: 88, set: 3, size: 1, color: 0, position: { x: 285, y: 72 }, connection: [89,90] },
    { id: 89, set: 3, size: 0, color: 0, position: { x: 272, y: 26 } },
    { id: 90, set: 3, size: 1, color: 0, position: { x: 338, y: 48 } },
    { id: 91, set: 3, size: 0, color: 4, position: { x: 245, y: 110 }, connection: [88] },
    { id: 92, set: 3, size: 0, color: 2, position: { x: 202, y: 16 } },
    { id: 93, set: 3, size: 0, color: 4, position: { x: 208, y: 59 }, connection: [92] },
    { id: 94, set: 3, size: 0, color: 0, position: { x: 42, y: 186 } },
    { id: 95, set: 3, size: 0, color: 1, position: { x: 92, y: 146 } },
    { id: 96, set: 3, size: 0, color: 3, position: { x: 106, y: 207 }, connection: [94,95]},
    { id: 97, set: 3, size: 1, color: 0, position: { x: 194, y: 311 } },
    { id: 98, set: 3, size: 0, color: 4, position: { x: 157, y: 249 }, connection: [97]},
    { id: 99, set: 3, size: 0, color: 4, position: { x: 278, y: 381 }, connection: [97] },
    { id: 101, set: 3, size: 0, color: 4, position: { x: 275, y: 185 }, connection: [0] },
    { id: 103, set: 4, size: 0, color: 4, position: { x: 278, y: 381 }, connection: [29,114] },
    { id: 104, set: 4, size: 1, color: 3, position: { x: 246, y: 435 }},
    { id: 105, set: 4, size: 0, color: 1, position: { x: 203, y: 474 }},
    { id: 106, set: 4, size: 0, color: 0, position: { x: 292, y: 476 }},
    { id: 107, set: 4, size: 0, color: 0, position: { x: 590, y: 340 }},
    { id: 108, set: 4, size: 0, color: 0, position: { x: 758, y: 190 }},
    { id: 109, set: 4, size: 0, color: 2, position: { x: 684, y: 224 }, connection: [108,110]},
    { id: 110, set: 4, size: 0, color: 3, position: { x: 726, y: 294 }},
    { id: 112, set: 4, size: 0, color: 4, position: { x: 245, y: 110 }, connection: [68]},
    { id: 113, set: 4, size: 0, color: 3, position: { x: 670, y: 140 } },
    { id: 114, set: 4, size: 0, color: 3, position: { x: 264, y: 324 } },
    { id: 115, set: 5, size: 0, color: 4, position: { x: 650, y: 91 }, connection: [116] },
    { id: 116, set: 5, size: 0, color: 4, position: { x: 670, y: 140 }, connection: [109] },
    { id: 120, set: 5, size: 0, color: 4, position: { x: 510, y: 305 }, connection: [107] },
    { id: 123, set: 5, size: 0, color: 4, position: { x: 246, y: 435 }, connection: [106,105] },
    { id: 124, set: 5, size: 0, color: 4, position: { x: 278, y: 381 }, connection: [123] },
    { id: 127, set: 5, size: 0, color: 4, position: { x: 726, y: 294 } }
  ];

  function init(){
    addGroups();
    makeCircles();
  }

  function addGroups(){
    drawingConfig.lines.lineGroup = s.g().attr({id: 'lineGroup'});
    drawingConfig.circles.circleGroup = s.g().attr({id: 'circleGroup'});
  }

  function makeCircles(){
    var theseCircles = circleData;

    for (var i=0; i<theseCircles.length;i++){
      var thisCircleData = theseCircles[i];
      var circleX = thisCircleData.position.x;
      var circleY = thisCircleData.position.y;
      var circleFill = drawingConfig.circles.circleColors[thisCircleData.color];
      var circleRadius = drawingConfig.circles.circleSizes[thisCircleData.size];
      var circleSet = thisCircleData.set;

      if (thisCircleData.size > 1){ //icon
         var nodeCircle = s.circle(circleRadius, circleRadius, circleRadius).attr({fill: '#FFF', stroke: '#BFBFBF', 'stroke-width': 2 });
        if (thisCircleData.size == 2){
          var nodeAvatar = s.path("M28.283,21.098c1.586-0.946,2.892-2.675,2.892-4.657c0-2.996-2.311-5.426-5.308-5.426c-2.996,0-5.366,2.43-5.366,5.426c0,1.982,0.892,3.71,2.478,4.658c-2.43,1.097-4.174,3.616-4.174,6.552v11.961h13V27.651C31.805,24.715,30.713,22.196,28.283,21.098z").attr({'fill' : circleFill});
        } else {
          var nodeAvatar = s.path("M35.466,26.221c1.99-1.188,3.514-3.356,3.514-5.844c0-3.76-2.957-6.809-6.718-6.809c-3.76,0-6.762,3.049-6.762,6.809c0,2.487,0.99,4.656,2.98,5.845c-3.048,1.376-5.366,4.538-5.366,8.222v15.479h17V34.443C40.115,30.76,38.515,27.598,35.466,26.221z").attr({'fill' : circleFill});
        }
        var nodeIcon = s.g(nodeCircle,nodeAvatar).attr({class: 'node-icon set'+circleSet, transform: 'scale(0)' });
        var nodePositioner = s.g(nodeIcon).attr({class: 'node-positioner', transform: 'translate(' + (circleX-circleRadius) + ',' +  (circleY-circleRadius) + ')' })
        drawingConfig.circles.circleGroup.add(nodePositioner);

      } else { //circle
        var circleShape = s.circle(circleX, circleY, circleRadius);
        circleShape.attr({
          fill: circleFill,
          r: 0,
          class: 'node-circle set'+circleSet,
          'data-r' : circleRadius
        })
        drawingConfig.circles.circleGroup.add(circleShape);
      }

      if (thisCircleData.connection != undefined){
        for (var j=0;j<thisCircleData.connection.length;j++){
          var connectIndex = thisCircleData.connection[j];
          var connectedCircle = theseCircles[theseCircles.getIndexBy("id", connectIndex)];
          var circle2X = connectedCircle.position.x;
          var circle2Y = connectedCircle.position.y;
          var dist = Math.ceil(distance(circleX,circleY,circle2X,circle2Y));
          //console.log(dist,collabBar.barConfig.waypoints.length);
          var increment = Math.ceil(dist / (100/collabBar.barConfig.numWaypoints));
          var line = drawingConfig.lines.lineGroup.line(circleX, circleY, circle2X, circle2Y).attr({class: 'lineset'+ circleSet, 'data-group': circleSet, stroke: drawingConfig.lines.strokeActive, strokeWidth: '3px', 'stroke-dasharray' : dist, 'stroke-dashoffset' : dist, 'data-increment' : increment , 'data-dist' : dist });
          drawingConfig.lines.lineArray.push(line);
        }

      }

    }

    setTimeout(animateCircles,300);

  }

  function update(progress,dir){
    connectLines(progress,dir);
  }

  function animateCircles(){
    var animTime = drawingConfig.circles.animTime;
    var curWaypoint = collabBar.barStates.curWaypoint;

    var circles = s.selectAll('.set'+curWaypoint);
    for (var i=0; i< circles.length; i++){
      var circle = circles[i];

      var circleRad = parseInt(circle.attr('data-r'));
      circle.animate({r: circleRad},randomNumber(0,animTime),mina.backout);
    }

    var nodeIcons = s.selectAll('.set'+curWaypoint);
    for (var i=0; i< nodeIcons.length; i++){
      var nodeIcon = nodeIcons[i];
      nodeIcon.animate({transform: 'scale(1)'}, randomNumber(0,animTime), mina.backout);
    }

  }

  function hideCircles(curWaypoint){
    //console.log(curWaypoint);
    var animTime = drawingConfig.circles.animTime;

    var circles = s.selectAll('.set'+curWaypoint);
    for (var i=0; i< circles.length; i++){
      var circle = circles[i];

      circle.animate({r: 0},randomNumber(0,animTime),mina.backin);
    }

    var nodeIcons = s.selectAll('.set'+curWaypoint);
    for (var i=0; i< nodeIcons.length; i++){
      var nodeIcon = nodeIcons[i];
      nodeIcon.animate({transform: 'scale(0)'}, randomNumber(0,animTime), mina.backin);
    }
  }

  function connectLines(progress,dir){
    var curWaypoint = collabBar.barStates.curWaypoint;
    var lineArray = $('.lineset' + curWaypoint);
    var sectionProgress = progress % collabBar.barConfig.percentPerWaypoint;

    for (var i=0; i< lineArray.length;i++){

      var $node = $(lineArray[i]);

        var increment = parseInt($node.attr('data-increment'));
        var dist = parseInt($node.attr('data-dist'));
        var $curOffset = $node.css('stroke-dashoffset');
        var curOffset = parseInt($curOffset, 10); //offset as px
        var newOffset = dist-(sectionProgress*increment);
        if (newOffset < 0){
          newOffset = 0;
        }
        if (newOffset > dist){
          newOffset = dist;
        }

        if (curOffset > increment && dir == "right"){
          $node.css({'stroke-dashoffset' : newOffset});
        } else if (dir == "left"){
          $node.css({'stroke-dashoffset' : newOffset});
        }

    } // end loop
  } //end connectLines

  function decayLines(curWaypoint){
    var lineArray = $('.lineset' + curWaypoint);
    for (var i=0;i<lineArray.length;i++){
       var $node = $(lineArray[i]);
       $node.css({'stroke-width': 2, 'stroke': '#547DBE'});
    }
  }

  function restoreLines(curWaypoint){
    var lineArray = $('.lineset' + curWaypoint);
    for (var i=0;i<lineArray.length;i++){
       var $node = $(lineArray[i]);
       $node.css({'stroke-width': 3, 'stroke': '#FFFFFF'});
    }
  }

  function deleteLines(curWaypoint){
    var lineArray = $('.lineset' + curWaypoint);
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i]);
      var offset = parseInt($node.attr('data-dist'));
      $node.animate({'stroke-dashoffset' : offset});
    }
  }

  function finishLines(){
    var lineArray = drawingConfig.lines.lineArray;
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i].node);
      var group =parseInt($node.attr('data-group'));
      if (group == collabBar.barStates.curWaypoint){
        if (collabBar.barStates.curWaypoint == collabBar.barConfig.numWaypoints-2){

          $node.animate({'stroke-dashoffset' : 0, 'stroke-width' : 2}).attr('stroke','#547DBE');
        } else {
          $node.animate({'stroke-dashoffset' : 0});
        }

      } else if (collabBar.barStates.curWaypoint -1 != undefined && group == collabBar.barStates.curWaypoint-1){
        $node.animate({'stroke-width' : 2}).attr('stroke' , '#547DBE');
      }
    }
  }

  function distance(circleX,circleY,circle2X,circle2Y){
    var distX = circle2X - circleX;
    var distY = circle2Y - circleY;
    distX = distX*distX;
    distY = distY*distY;
    return Math.sqrt(distX + distY);
  }

  function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  return {
    init: init,
    update: update,
    makeCircles: makeCircles,
    decayLines: decayLines,
    deleteLines: deleteLines,
    finishLines: finishLines,
    animateCircles: animateCircles,
    hideCircles: hideCircles,
    restoreLines: restoreLines
  }

})(jQuery,window);


