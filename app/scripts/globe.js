var width = 1000,
  height = 800,
  sens = 0.25,
  tau = Math.PI * 2,
  focused;

var introText = [  ];

var centerpoint = [width/2, height/2],
  globeRadius = 200;

var arcData = [.33,.6,.9,1],
    arcColors = ['#f2b31c', '#db4436','#4284f3','#109d5a'],
    curArc = 0,
    arcGroup = null;

var infoGroup = null,
$infoText = $('#info-text'),
infoTextArray = [
"The quarterly budget originated at Google headquarters in Mountain View, California.",
"Ten days later it had traveled around the world and back again.",
"Googlers in 20 different locations edited, viewed or commented on the spreadsheet.",
"Select an office to see <br/>what happened there."
];

var links = [], arcLines = [], interactive = false,
countryIDs = [840, 392, 484, 76];

var sky = d3.geo.orthographic()
.scale(globeRadius+30)
.rotate([0,0])
.translate([centerpoint[0], centerpoint[1]])
.clipAngle(90);


//Setting projection
var projection = d3.geo.orthographic()
  .scale(globeRadius)
  .rotate([0, 0])
  .translate([centerpoint[0], centerpoint[1]])
  .clipAngle(90);

var path = d3.geo.path()
  .projection(projection)
  .pointRadius(2);

var $markerEl = null,marker = null,
markerColors=['yellow','red','blue','green'],
translateOutX = centerpoint[0] -8, //MH - this could be handled better...
translateOutY = centerpoint[1] -300,
translateInX = centerpoint[0] -8,
translateInY = centerpoint[1]-22,
dot;

//the points for the crescent shadow over the globe
var earthShadow=[[543.658,224.391],[539.646,199.062],[533.009,174.291],[523.819,150.349],[512.176,127.5],[498.209,105.993],[482.07,86.063],[463.937,67.93],[444.007,51.791],[422.5,37.824],[399.651,26.181],[375.709,16.991],[350.938,10.354],[325.609,6.342],[300,5],[280,6.048],[285.609,6.342],[310.938,10.354],[335.709,16.991],[359.651,26.181],[382.5,37.824],[404.007,51.791],[423.937,67.93],[442.07,86.063],[458.209,105.993],[472.176,127.5],[483.819,150.349],[493.009,174.291],[499.646,199.062],[503.658,224.391],[505,250],[503.658,275.609],[499.646,300.938],[493.009,325.709],[483.819,349.65],[472.176,372.5],[458.209,394.007],[442.07,413.937],[423.937,432.07],[404.007,448.209],[382.5,462.176],[359.651,473.819],[335.709,483.009],[310.938,489.646],[285.609,493.658],[280,493.952],[300,495],[325.609,493.658],[350.938,489.646],[375.709,483.009],[399.651,473.819],[422.5,462.176],[444.007,448.209],[463.937,432.07],[482.07,413.937],[498.209,394.007],[512.176,372.5],[523.819,349.65],[533.009,325.709],[539.646,300.938],[543.658,275.609],[545,250]];

d3.xml("img/marker-red.svg", "image/svg+xml", function(xml) {
  // document.body.appendChild(xml.documentElement);
   $markerEl = $(xml.documentElement).find('.marker-group')[0];
});

//SVG container

var svg = d3.select("#globe-container").append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr('id','globe-svg');

//Adding water

svg.append("path")
  .datum({
    type: "Sphere"
  })
  .attr("class", "water globe")
  .attr("d", path);

var countryTooltip = d3.select("#globe-container").append("div").attr("class", "country-tooltip"),
  countryList = d3.select("#globe-container").append("select").attr("name", "countries").attr('id','country-select');

queue()
  .defer(d3.json, "json/world-110m.json")
  .defer(d3.tsv, "json/world-110m-country-names.tsv")
  .defer(d3.json, "json/places.json")
  .await(ready);

//Main function

function ready(error, world, countryData, places) {

  var countryById = {},
    countries = topojson.feature(world, world.objects.countries).features;

  //Adding countries to select

  countryData.forEach(function(d) {
    countryById[d.id] = d.name;
    option = countryList.append("option");
    option.text(d.name);
    option.property("value", d.id);
  });

  //Drawing countries on the globe

  var world = svg.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land globe")
    .attr("d", path)

  //Drag event

  //Mouse events

  .on("mouseover", function(d) {

    if (countryById[d.id]){
      d3.select(this).attr('class','land globe focused');
      countryTooltip.text(countryById[d.id])
      .style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px")
      .style("display", "block")
      .style("opacity", 1);
    }

  })
    .on("mouseout", function(d) {
      if (countryById[d.id]){
        d3.select(this).attr('class','land globe');
        countryTooltip.style("opacity", 0)
        .style("display", "none");
      }
    })
    .on("mousemove", function(d) {
      if (countryById[d.id]){
        countryTooltip.style("left", (d3.event.pageX + 7) + "px")
        .style("top", (d3.event.pageY - 15) + "px");
      }
    });

  var allGlobe = svg.selectAll('.globe')
  .call(d3.behavior.drag()
    .origin(function() {
      var r = projection.rotate();
      return {
        x: r[0] / sens,
        y: -r[1] / sens
      };
    })
    .on("drag", function() {

      var markerHidden = $('.marker').hasClass('hidden');

      var rotate = projection.rotate();
      projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
      sky.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
      refresh();
      svg.selectAll("path.land").attr("d", path);
      svg.selectAll(".focused").classed("focused", focused = false);
    }));

  svg.append("circle").attr("cx", centerpoint[0]).attr("cy", centerpoint[1]).attr("r", 1).attr("class", "dot hidden");
  $('#globe-svg').append($markerEl);
  dot = d3.select(".dot");
  marker = d3.select('.marker-group').attr('class','marker-group yellow hidden').attr("transform", "translate(" + translateInX + "," + translateInY + ")");


  buildArcs();
  buildSky();


  svg.append("polygon").attr("class", "earthshadow").attr("transform", "translate(255,196) scale(.81632)").attr("points", earthShadow).attr('fill', 'black').attr('fill-opacity', .25);

  infoGroup = svg.append("g")
      .attr("transform", "translate(" + width / 2 + "," + height * .75 + ")")
      .attr("class","textGroup");

  //Country focus on option select

  d3.select("select").on("change", function() {
    changeCountry(this.value);
  });

  function markerIn(markerIndex){

    dot.classed('active', false).transition().duration(100).attr('r', 1).attr('fill', '#4b4949').each('end', function() {
      dot.attr('class', 'dot hidden');
    });

    if (markerIndex){
      var markerColor = markerColors[markerIndex];
    } else {
      var markerColor = markerColors[curArc];
    }
    marker.transition().duration(500).style('opacity', 0).attr('transform','translate(' + translateOutX + ', ' + translateOutY + ')').each('end',function(){
        marker.classed('hidden',true).attr('class','marker-group hidden ' + markerColor);
    });
  }

  function markerOut(){

    dot.classed("hidden", false).attr('class', 'dot active');

    marker.classed('hidden',false).transition().ease('bounce-ease-out').duration(500).style('opacity', 1).attr('transform','translate(' + translateInX + ', ' + translateInY + ')');
      dot.transition().duration(100).attr('r', 20).attr('fill', '#4b4949').ease('sine').transition().duration(20).attr('r', 5).attr('fill-opacity', 1).each('end', function() {
    });
  }

  function changeCountry(countryVal,mode){

    if (mode == 'auto'){
      markerIn();
    } else {
      $('.flyers').fadeTo(100,0,function(){
        $(this).removeClass('active');
      });
      var markerColor = randomNumber(0,3);
      markerIn(markerColor);
    }

    var rotate = projection.rotate(),
      focusedCountry = country(countries, countryVal),
      p = d3.geo.centroid(focusedCountry);
      var countryName = $('select').find('option[value="' + countryVal + '"]').text();
      $('.marker-country').text(countryName);

    svg.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating

    (function transition() {
      d3.transition()
        .duration(1000)
        .tween("rotate", function() {
          var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
          return function(t) {

            projection.rotate(r(t));
            sky.rotate(r(t));
            if (path){
              svg.selectAll(".point").attr("d", path);

              svg.selectAll(".globe").attr("d", path)
              .classed("focused", function(d, i) {
                return d.id == focusedCountry.id ? focused = d : false;
              });
            }

          };
        }).each("end", function() {
          if (interactive){
            refresh();
            $('.flyers').addClass('active').fadeTo(100,1);
          }
          if (!interactive){
            markerOut();
          }

        })
    })();
  }

  function buildArcs(){

    arcGroup = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .attr("class","arcGroup");
    buildArc();
  };

  function buildArc(){

      var i = curArc;
      if (i==0){
        var startAngle = 0;
      } else {
        startAngle = tau * arcData[i-1];
      }

      var arc = d3.svg.arc()
      .innerRadius(globeRadius+20)
      .outerRadius(globeRadius+40)
      .startAngle(startAngle);

      var arcPath = arcGroup.append("path")
      .datum({endAngle: startAngle})
      .style("fill", arcColors[i])
      .attr('class','arc arc'+i)
      .attr("d", arc);

      setTimeout(function(){
        changeCountry(countryIDs[curArc], 'auto');
      },1500);

      arcPath.transition()
      .delay(1500)
      .duration(750)
      .call(arcTween, arcData[i] * tau, arc)
      .each('end',function(){
        addText();
      });
    }

    function buildSky(){

      swoosh = d3.svg.line()
      .x(function(d) { return d[0] })
      .y(function(d) { return d[1] })
      .interpolate("cardinal")
      .tension(.0);

      svg.append("g").attr("class","points")
      .selectAll("text").data(places.features)
      .enter().append("path")
      .attr("class", "point")
      .attr("d", path);

      // spawn links between cities as source/target coord pairs
      places.features.forEach(function(a) {
        places.features.forEach(function(b) {
          if (a !== b) {
            links.push({
              source: a.geometry.coordinates,
              target: b.geometry.coordinates
            });
          }
        });
      });

      // build geoJSON features from links array
      links.forEach(function(e,i,a) {
        var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [e.source,e.target] }}
        arcLines.push(feature)
      });

      //flight paths between locations
      svg.append("g").attr("class","flyers")
      .selectAll("path").data(links)
      .enter().append("path")
      .attr("class","flyer")
      .attr("d", function(d) { return swoosh(flying_arc(d)) });

      //refresh();

    }

    function flying_arc(pts) {
      var source = pts.source,
          target = pts.target;

      var mid = location_along_arc(source, target, .5);
      var result = [ projection(source),
      sky(mid),
      projection(target) ];
      return result;
    }

    function location_along_arc(start, end, loc) {
      var interpolator = d3.geo.interpolate(start,end);
      return interpolator(loc)
    }

    function refresh(){
      svg.selectAll(".point").attr("d", path);
      svg.selectAll(".flyer")
      .attr("d", function(d) {
        return swoosh(flying_arc(d));
      }).attr("opacity", function(d) {
        return fade_at_edge(d);
      });
    }

    function fade_at_edge(d) {

      var centerPos = projection.invert([width/2,height/2]),
          arc = d3.geo.greatArc(),
          start, end;
      // function is called on 2 different data structures..
      if (d.source) {
        start = d.source,
        end = d.target;
      }
      else {
        start = d.geometry.coordinates[0];
        end = d.geometry.coordinates[1];
      }

      var start_dist = 1.57 - arc.distance({source: start, target: centerPos}),
          end_dist = 1.57 - arc.distance({source: end, target: centerPos});

      var fade = d3.scale.linear().domain([-.1,0]).range([0,.1])
      var dist = start_dist < end_dist ? start_dist : end_dist;

      return fade(dist)
    }

    function addText(){
      $infoText.html(infoTextArray[curArc]).addClass('active');
      setTimeout(function(){
        curArc++;
        if (curArc<arcData.length){
          $infoText.removeClass('active').addClass('inactive');
          setTimeout(function(){
            $infoText.removeClass('inactive');
            buildArc();
          },500)
        } else {
          beginInteractive();
        }
      },2000)
    }

    function beginInteractive(){
      interactive = true;
      refresh();
      markerIn();
      $('#country-select, #marker-text,.flyers, .points').addClass('active').fadeTo(500,1);

    }

    function arcTween(transition, newAngle, arc) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });
    }

  function country(cnt, countryVal) {
    for (var i = 0, l = cnt.length; i < l; i++) {
      if (cnt[i].id == countryVal) {
        return cnt[i];
      }
    }
  };

  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

};
