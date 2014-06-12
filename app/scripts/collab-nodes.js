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
      animTime: 2000,
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
    [
      { size: 0, color: 3, position: { x: 330, y: 189 } },
      { size: 1, color: 1, position: { x: 291, y: 223 } },
      { size: 0, color: 2, position: { x: 426, y: 189 } },
      { size: 0, color: 0, position: { x: 433, y: 251 } },
      { size: 0, color: 1, position: { x: 423, y: 317 } },
      { size: 1, color: 1, position: { x: 377, y: 353 } }, //5
      { size: 3, color: 3, position: { x: 360, y: 268 }, connection: [0,1,2,3,4,19] },
      { size: 2, color: 2, position: { x: 484, y: 225 }, connection: [8,9,10,11,12,13,14]},
      { size: 0, color: 3, position: { x: 485, y: 286 } },
      { size: 1, color: 0, position: { x: 510, y: 305 } },
      { size: 0, color: 1, position: { x: 540, y: 262 } }, //10
      { size: 1, color: 1, position: { x: 582, y: 202 } },
      { size: 0, color: 1, position: { x: 527, y: 183 } },
      { size: 1, color: 0, position: { x: 470, y: 168 } },
      { size: 0, color: 0, position: { x: 433, y: 251 } },
      { size: 1, color: 1, position: { x: 208, y: 59 } }, //15
      { size: 1, color: 0, position: { x: 174, y: 123 } },
      { size: 1, color: 0, position: { x: 130, y: 181 } },
      { size: 2, color: 2, position: { x: 245, y: 110 }, connection: [15,16,17] },
      { size: 2, color: 0, position: { x: 278, y: 381 } },
      { size: 1, color: 1, position: { x: 105, y: 442 } }, //20
      { size: 2, color: 3, position: { x: 442, y: 82 } },
      { size: 1, color: 1, position: { x: 698, y: 354 } },
      { size: 0, color: 2, position: { x: 592, y: 394 } },
      { size: 1, color: 1, position: { x: 560, y: 44 } },
      { size: 0, color: 3, position: { x: 633, y: 57 } }, //25
      { size: 1, color: 0, position: { x: 170, y: 377 } },
      { size: 0, color: 0, position: { x: 102, y: 386 } },
    ],
    [
      { size: 2, color: 1, position: { x: 415, y: 432 }, connection: [1,2,3,4,5,6,7] },
      { size: 1, color: 2, position: { x: 349, y: 474 } },
      { size: 1, color: 3, position: { x: 493, y: 473 } },
      { size: 1, color: 1, position: { x: 525, y: 431 } },
      { size: 1, color: 2, position: { x: 493, y: 473 } },
      { size: 1, color: 2, position: { x: 489, y: 385 } },//5
      { size: 1, color: 3, position: { x: 493, y: 473 } },
      { size: 1, color: 1, position: { x: 377, y: 353 } },
      { size: 2, color: 1, position: { x: 603, y: 90 },connection: [9,10,11,12] }, //
      { size: 1, color: 1, position: { x: 538, y: 148 } },
      { size: 1, color: 1, position: { x: 650, y: 91 } }, //10
      { size: 1, color: 2, position: { x: 633, y: 57 } },
      { size: 1, color: 1, position: { x: 561, y: 44 } },
      { size: 0, color: 0, position: { x: 112, y: 76 } },
      { size: 0, color: 0, position: { x: 162, y: 46 } },
      { size: 0, color: 2, position: { x: 176, y: 85 }, connection: [14,13] }, //15
      { size: 0, color: 0, position: { x: 102, y: 386 }, connection: [17,18] },
      { size: 1, color: 0, position: { x: 170, y: 377 } },
      { size: 1, color: 1, position: { x: 105, y: 442 } },
      { size: 0, color: 2, position: { x: 592, y: 394 } },
      { size: 1, color: 1, position: { x: 698, y: 354 }, connection: [19]}, //20
      { size: 1, color: 1, position: { x: 106, y: 442 } },
      { size: 1, color: 2, position: { x: 106, y: 329 } },
      { size: 0, color: 0, position: { x: 149, y: 116 } },
      { size: 0, color: 1, position: { x: 706, y: 435 } },
      { size: 0, color: 3, position: { x: 401, y: 98 } }, //25
      { size: 0, color: 3, position: { x: 447, y: 43 } },
      { size: 0, color: 3, position: { x: 641, y: 271 } },
    ],
    [
      { size: 2, color: 0, position: { x: 660, y: 445 }, connection: [1,2,3,4] },
      { size: 0, color: 2, position: { x: 693, y: 394 } },
      { size: 1, color: 1, position: { x: 610, y: 429 } },
      { size: 0, color: 1, position: { x: 706, y: 435 } },
      { size: 0, color: 2, position: { x: 592, y: 394 }, connection: [0] },
      { size: 0, color: 1, position: { x: 751, y: 366 } }, //5
      { size: 0, color: 3, position: { x: 641, y: 271 }, connection: [7] },
      { size: 0, color: 1, position: { x: 540, y: 262 } },
      { size: 1, color: 1, position: { x: 698, y: 354 }, connection: [5] },
      { size: 0, color: 4, position: { x: 442, y: 82 }, connection: [10,11] },
      { size: 0, color: 3, position: { x: 447, y: 43 } }, //10
      { size: 0, color: 3, position: { x: 401, y: 98 } },
      { size: 0, color: 2, position: { x: 275, y: 185 } },
      { size: 1, color: 1, position: { x: 291, y: 223 }, connection: [12] },
      { size: 0, color: 0, position: { x: 149, y: 116 }, connection: [16] },
      { size: 1, color: 0, position: { x: 174, y: 123 }, connection: [14] }, //15
      { size: 0, color: 2, position: { x: 176, y: 85 }},
      { size: 0, color: 1, position: { x: 157, y: 249 }, connection: [18,19,20,21,22]}, //
      { size: 0, color: 1, position: { x: 202, y: 236 }},
      { size: 0, color: 2, position: { x: 106, y: 329 }},
      { size: 0, color: 1, position: { x: 157, y: 249 }}, //20
      { size: 0, color: 1, position: { x: 86, y: 257 }},
      { size: 0, color: 3, position: { x: 106, y: 207 }},
    ],
    [
      { size: 0, color: 4, position: { x: 633, y: 57 }, connection: [1,2] },
      { size: 0, color: 0, position: { x: 722, y: 86 }},
      { size: 0, color: 2, position: { x: 676, y: 43 }},
      { size: 0, color: 2, position: { x: 602, y: 16 }},
      { size: 1, color: 1, position: { x: 561, y: 44 }, connection: [3,5] },
      { size: 0, color: 0, position: { x: 492, y: 26 } }, //5
      { size: 0, color: 2, position: { x: 398, y: 43 } },
      { size: 0, color: 2, position: { x: 431, y: 17 } },
      { size: 0, color: 4, position: { x: 447, y: 43 }, connection: [6,7] },
      { size: 1, color: 0, position: { x: 285, y: 72 }, connection: [10,11] },
      { size: 0, color: 0, position: { x: 272, y: 26 } }, //10
      { size: 1, color: 0, position: { x: 338, y: 48 } },
      { size: 0, color: 4, position: { x: 245, y: 110 }, connection: [9] },
      { size: 0, color: 2, position: { x: 202, y: 16 } },
      { size: 1, color: 1, position: { x: 208, y: 59 }, connection: [13] },
      { size: 0, color: 0, position: { x: 42, y: 186 } }, //15
      { size: 0, color: 1, position: { x: 92, y: 146 } },
      { size: 0, color: 3, position: { x: 106, y: 207 }, connection: [15,16]},
      { size: 1, color: 0, position: { x: 194, y: 311 } },
      { size: 0, color: 4, position: { x: 157, y: 249 }, connection: [18]},
      { size: 0, color: 4, position: { x: 278, y: 381 }, connection: [18] }, //20
      { size: 0, color: 3, position: { x: 330, y: 189 } },
      { size: 0, color: 4, position: { x: 275, y: 185 }, connection: [21] },
    ],
    [
      { size: 0, color: 4, position: { x: 349, y: 474 } },
      { size: 0, color: 4, position: { x: 278, y: 381 }, connection: [0,12] },
      { size: 1, color: 3, position: { x: 246, y: 435 }},
      { size: 0, color: 1, position: { x: 203, y: 474 }},
      { size: 0, color: 0, position: { x: 292, y: 476 }},
      { size: 0, color: 0, position: { x: 590, y: 340 }}, //5
      { size: 0, color: 0, position: { x: 758, y: 190 }},
      { size: 0, color: 2, position: { x: 684, y: 224 }, connection: [6]},
      { size: 0, color: 3, position: { x: 726, y: 294 }},
      { size: 0, color: 4, position: { x: 275, y: 185 } },
      { size: 0, color: 4, position: { x: 245, y: 110 }, connection: [9]}, //10
      { size: 0, color: 3, position: { x: 670, y: 140 } },
      { size: 0, color: 3, position: { x: 264, y: 324 } },
    ],
    [
      { size: 0, color: 4, position: { x: 650, y: 91 }, connection: [1] },
      { size: 0, color: 4, position: { x: 670, y: 140 }, connection: [2] },
      { size: 0, color: 4, position: { x: 684, y: 224 } },
      { size: 0, color: 4, position: { x: 751, y: 366 }},
      { size: 0, color: 4, position: { x: 766, y: 294 } },
      { size: 0, color: 4, position: { x: 510, y: 305 }, connection: [7] }, //5
      { size: 0, color: 4, position: { x: 684, y: 224 },connection:[12] },
      { size: 0, color: 4, position: { x: 590, y: 340 } },
      { size: 0, color: 4, position: { x: 246, y: 435 }, connection: [10,11] },
      { size: 0, color: 4, position: { x: 278, y: 381 }, connection: [8] },
      { size: 0, color: 4, position: { x: 292, y: 476 } }, //10
      { size: 0, color: 4, position: { x: 203, y: 474 } },
      { size: 0, color: 4, position: { x: 726, y: 294 } }
    ]
  ];

  function init(){
    addGroups();
    makeCircles();
  }

  function sizeCanvas(){
    $('#svg').width(800).height(600);
  }

  function addGroups(){
    drawingConfig.lines.lineGroup = s.g().attr({id: 'lineGroup'});
    drawingConfig.circles.circleGroup = s.g().attr({id: 'circleGroup'});
  }

  function makeCircles(){
    var theseCircles = circleData[collabBar.barStates.curWaypoint];

    for (var i=0; i<theseCircles.length;i++){
      var thisCircleData = theseCircles[i];
      var circleX = thisCircleData.position.x;
      var circleY = thisCircleData.position.y;
      var circleFill = drawingConfig.circles.circleColors[thisCircleData.color];
      var circleRadius = drawingConfig.circles.circleSizes[thisCircleData.size];

      if (thisCircleData.size > 1){ //icon
         var nodeCircle = s.circle(circleRadius, circleRadius, circleRadius).attr({fill: '#FFF', stroke: '#BFBFBF', 'stroke-width': 2 });
        if (thisCircleData.size == 2){
          var nodeAvatar = s.path("M28.283,21.098c1.586-0.946,2.892-2.675,2.892-4.657c0-2.996-2.311-5.426-5.308-5.426c-2.996,0-5.366,2.43-5.366,5.426c0,1.982,0.892,3.71,2.478,4.658c-2.43,1.097-4.174,3.616-4.174,6.552v11.961h13V27.651C31.805,24.715,30.713,22.196,28.283,21.098z").attr({'fill' : circleFill});
        } else {
          var nodeAvatar = s.path("M35.466,26.221c1.99-1.188,3.514-3.356,3.514-5.844c0-3.76-2.957-6.809-6.718-6.809c-3.76,0-6.762,3.049-6.762,6.809c0,2.487,0.99,4.656,2.98,5.845c-3.048,1.376-5.366,4.538-5.366,8.222v15.479h17V34.443C40.115,30.76,38.515,27.598,35.466,26.221z").attr({'fill' : circleFill});
        }
        var nodeIcon = s.g(nodeCircle,nodeAvatar).attr({class: 'node-icon', transform: 'scale(0)' });
        var nodePositioner = s.g(nodeIcon).attr({class: 'node-positioner', transform: 'translate(' + (circleX-circleRadius) + ',' +  (circleY-circleRadius) + ')' })
        drawingConfig.circles.circleGroup.add(nodePositioner);

      } else { //circle
        var circleShape = s.circle(circleX, circleY, circleRadius);
        circleShape.attr({
          fill: circleFill,
          r: 0,
          class: 'node-circle',
          'data-r' : circleRadius
        })
        drawingConfig.circles.circleGroup.add(circleShape);
      }

      if (thisCircleData.connection != undefined){
        for (var j=0;j<thisCircleData.connection.length;j++){
          var connectIndex = thisCircleData.connection[j];
          var connectedCircle = theseCircles[connectIndex];
          var circle2X = connectedCircle.position.x;
          var circle2Y = connectedCircle.position.y;
          var dist = Math.ceil(distance(circleX,circleY,circle2X,circle2Y));
          var increment = Math.ceil(dist / (100/collabBar.barConfig.numWaypoints));
          var line = drawingConfig.lines.lineGroup.line(circleX, circleY, circle2X, circle2Y).attr({'data-group': collabBar.barStates.curWaypoint, stroke: drawingConfig.lines.strokeActive, strokeWidth: '3px', 'stroke-dasharray' : dist, 'stroke-dashoffset' : dist, 'data-increment' : increment , 'data-dist' : dist });
          drawingConfig.lines.lineArray.push(line);
        }

      }

    }

    setTimeout(animateCircles,300);
    connectLines();

    /*circleStates.phase++;
    makeCircles();*/

  }

  function update(progress,dir){
    connectLines(progress,dir);
  }

  function animateCircles(){
    var circles = s.selectAll('.node-circle');
    for (var i=0; i< circles.length; i++){
      var circle = circles[i];

      var circleRad = parseInt(circle.attr('data-r'));
      circle.animate({r: circleRad},randomNumber(0,3000),mina.backout);
    }

    var nodeIcons = s.selectAll('.node-icon');
    for (var i=0; i< nodeIcons.length; i++){
      var nodeIcon = nodeIcons[i];
      nodeIcon.animate({transform: 'scale(1)'}, randomNumber(0,1000), mina.backout);
    }

  }

  function connectLines(progress,dir){

    var lineArray = drawingConfig.lines.lineArray;
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i].node);
      var increment = parseInt($node.attr('data-increment'));
      var dist = parseInt($node.attr('data-dist'));

      var $curOffset = $node.css('stroke-dashoffset');
      var curOffset = parseInt($curOffset, 10); //offset as px

      if (curOffset > increment && dir == "right"){
        var sectionProgress = progress % collabBar.barConfig.percentPerWaypoint
        var newOffset = dist-(sectionProgress*increment);
        if (newOffset < 0){
          newOffset = 0;
        }
        if (newOffset > dist){
          newOffset = dist;
        }
        $node.css({'stroke-dashoffset' : newOffset});
      } else if (dir == "left"){
        var group =parseInt($node.attr('data-group'));
        if (group == collabBar.barStates.curWaypoint-1){
          console.log(group,collabBar.barStates.curWaypoint);
          var sectionProgress = progress % collabBar.barConfig.percentPerWaypoint
          var newOffset = dist-(sectionProgress*increment);
          if (newOffset < 0){
            newOffset = 0;
          }
          if (newOffset > dist){
            newOffset = dist;
          }
          $node.css({'stroke-dashoffset' : newOffset});
        }

      }


    }

  }

  function deleteLines(){
    var lineArray = drawingConfig.lines.lineArray;
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i].node);
      var group =parseInt($node.attr('data-group'));
      if (group == collabBar.barStates.curWaypoint){
        var offset = parseInt($node.attr('data-dist'));
        $node.animate({'stroke-dashoffset' : offset});
      }
    }
  }

  function finishLines(){
    var lineArray = drawingConfig.lines.lineArray;
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i].node);
      var group =parseInt($node.attr('data-group'));
      if (group == collabBar.barStates.curWaypoint){
        $node.animate({'stroke-dashoffset' : 0});
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
    deleteLines: deleteLines,
    finishLines: finishLines
  }

})(jQuery,window);


