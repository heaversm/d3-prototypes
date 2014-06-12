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
      circleColors: ['#B22E30','#0B9C57', '#547DBE','#F2B31B'], //red, green, blue, yellow
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
      { size: 1, color: 0, position: { x: 37, y: 181 } },
      { size: 1, color: 1, position: { x: 87, y: 141 } },
      { size: 3, color: 2, position: { x: 330, y: 237 }, connection: [0,1] }
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
    var theseCircles = circleData[circleStates.phase];

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
        var nodeIcon = s.g(nodeCircle,nodeAvatar).attr({class: 'node-icon', transform: 'translate(' + (circleX-circleRadius) + ',' +  (circleY-circleRadius) + ') '});
        drawingConfig.circles.circleGroup.add(nodeIcon);
        /*Snap.load(iconFile, function (file) {
          file.select(".node-avatar").attr({fill: circleFill});
          var nodeIcon = file.select("g");
          var nodeRadius = parseInt(nodeIcon.select('circle').attr('r'));
          nodeIcon.attr({ transform: 'translate(' + (circleX-nodeRadius) + ',' +  (circleY-nodeRadius) + ') scale(0) '});
          drawingConfig.circles.circleGroup.add(nodeIcon);
          nodeIcon.animate({ transform: 'translate(' + (circleX-nodeRadius) + ',' +  (circleY-nodeRadius) + ') scale(1) ' },500,mina.backout);
        })*/
      } else { //circle
        var circleShape = s.circle(circleX, circleY, circleRadius);
        circleShape.attr({
          fill: circleFill,
          r: circleRadius
        });
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
          console.log(increment);
          var line = drawingConfig.lines.lineGroup.line(circleX, circleY, circle2X, circle2Y).attr({stroke: drawingConfig.lines.strokeActive, strokeWidth: '3px', 'stroke-dasharray' : dist, 'stroke-dashoffset' : dist, 'data-increment' : increment , 'data-dist' : dist });

          drawingConfig.lines.lineArray.push(line);
        }

      }

    }

    //animateCircles();
    connectLines();

    /*circleStates.phase++;
    makeCircles();*/

  }

  function update(progress){
    connectLines(progress);
  }

  function animateCircles(){
    var circles = s.selectAll('circle');
    for (var i=0; i< circles.length; i++){
      var circle = circles[i];
      circle.animate({r: 10},500,mina.backout);
    }

  }

  function connectLines(progress){
    var lineArray = drawingConfig.lines.lineArray;
    for (var i=0; i< lineArray.length;i++){
      var $node = $(lineArray[i].node);
      var increment = parseInt($node.attr('data-increment'));
      var dist = parseInt($node.attr('data-dist'));

      var $curOffset = $node.css('stroke-dashoffset');
      var curOffset = parseInt($curOffset, 10); //offset as px

      var newOffset = dist-(progress*increment);

      if (newOffset < 0){
        newOffset = 0;
      }

      if (newOffset > dist){
        newOffset = dist;
      }

      $node.css({'stroke-dashoffset' : newOffset});
      //$(lineArray[i].node).animate({'stroke-dashoffset' : 0},500);
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
    update: update
  }

})(jQuery,window);


