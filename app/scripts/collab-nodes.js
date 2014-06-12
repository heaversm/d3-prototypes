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
      circleSizes: [5,7,20,30] //radius
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
      { size: 2, color: 3, position: { x: 330, y: 237 }, connection: [0,1] }
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

      if (thisCircleData.size > 1){ //icon
        if (thisCircleData.size == 2){
          var iconFile = "img/node-icon-sm.svg"
        } else {
          var iconFile = "img/node-icon.svg"
        }
        Snap.load(iconFile, function (file) {
          file.select(".node-avatar").attr({fill: circleFill});
          var nodeIcon = file.select("g");
          var nodeRadius = parseInt(nodeIcon.select('circle').attr('r'));
          nodeIcon.attr({ transform: 'translate(' + (circleX-nodeRadius) + ',' +  (circleY-nodeRadius) + ')'});
          drawingConfig.circles.circleGroup.add(nodeIcon)
        })
      } else { //circle
        var circleRadius = drawingConfig.circles.circleSizes[thisCircleData.size];
        var circleShape = s.circle(circleX, circleY, circleRadius);
        circleShape.attr({
          fill: circleFill
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

    connectLines();

  }

  function update(progress){
    connectLines(progress);
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


