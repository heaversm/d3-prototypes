var globeModule = (function($, window) {

  var globeConfig = {
    width: 1000,
    height: 800,
    centerpoint: null, //MH - need to calculate on init (width/2, height/2)
    sens: .25,
    tau: Math.PI * 2,
    globeRadius: null, //MH - need to calculate on init (height/4)
    arcColors: ['#f2b31c', '#db4436','#4284f3','#109d5a'],
    markerColors: ['yellow','red','blue','green'],
    arcPercentages: [.33,.6,.9,1], //the circular arc that goes around the globe, as a progression of percentages
    infoTextArray: [ //the text of the animated intro
      "The quarterly budget originated at Google headquarters in Mountain View, California.",
      "Ten days later it had traveled around the world and back again.",
      "Googlers in 20 different locations edited, viewed or commented on the spreadsheet.",
      "Select an office to see <br/>what happened there."
    ],
    countryIDs: [840, 392, 484, 76], //countries which appear in the drop down
    translateOutX: null, //MH - this could be handled better...
    translateOutY: null, //positions of the marker when animated in and out
    translateInX: null,
    translateInY: null,
    earthShadow: [[543.658,224.391],[539.646,199.062],[533.009,174.291],[523.819,150.349],[512.176,127.5],[498.209,105.993],[482.07,86.063],[463.937,67.93],[444.007,51.791],[422.5,37.824],[399.651,26.181],[375.709,16.991],[350.938,10.354],[325.609,6.342],[300,5],[280,6.048],[285.609,6.342],[310.938,10.354],[335.709,16.991],[359.651,26.181],[382.5,37.824],[404.007,51.791],[423.937,67.93],[442.07,86.063],[458.209,105.993],[472.176,127.5],[483.819,150.349],[493.009,174.291],[499.646,199.062],[503.658,224.391],[505,250],[503.658,275.609],[499.646,300.938],[493.009,325.709],[483.819,349.65],[472.176,372.5],[458.209,394.007],[442.07,413.937],[423.937,432.07],[404.007,448.209],[382.5,462.176],[359.651,473.819],[335.709,483.009],[310.938,489.646],[285.609,493.658],[280,493.952],[300,495],[325.609,493.658],[350.938,489.646],[375.709,483.009],[399.651,473.819],[422.5,462.176],[444.007,448.209],[463.937,432.07],[482.07,413.937],[498.209,394.007],[512.176,372.5],[523.819,349.65],[533.009,325.709],[539.646,300.938],[543.658,275.609],[545,250]], //MH - move to  data file?
    skyScaleFactor: 30, //factor by which to increase globe radius in order to draw flight paths
    arcInner: 20, //the offset of the inner radius of the arc surrounding the globe
    arcOuter: 40, //offset of the outer radius of the arc surrounding the globe
    introPause: 1500, //time in ms to pause on each intro text,
    arcSpeed: 750, //time in ms to animate each section of arc,
    markerSpeed: 100 //time in ms to animate each pin falling or rising
  }

  var globeStates = {
    focused: false,
    curArc: 0,
    interactive: false,
    markerHidden: true
  }

  var globeRefs = {
    introText: [],
    $infoText: $('#info-text'),
    infoGroup: null,
    $markerEl: null,
    links: [],
    arcLines: [],  arcGroup: null,
    sky: null, //the matrix for the flyers
    projection: null, //the matrix for the earth
    path: null, //the geojson path for the countries
    marker: null, //the pin that gets dropped in the center of the globe
    dot: null, //the shadow beneath the marker
    svg: null, //holds all globe paths,
    countryTooltip: null, //displays the name of the country when hovering
    countryList: null,
    countries: null,
    world: null, //all land
    countries: null,
    countryById: null,
    allGlobe: null,
    places: null, //holds our list of locations,
    countryData: null,
    swoosh: null, //the line for each flight
  }

  init = function(){
    addConfigVars();
    addRefs();
    loadData();
  }

  function addConfigVars(){
    globeConfig.centerpoint = [globeConfig.width / 2, globeConfig.height /2];
    globeConfig.globeRadius = globeConfig.height / 4;
    globeConfig.skyRadius = globeConfig.globeRadius + globeConfig.skyScaleFactor;
    globeConfig.translateOutX = globeConfig.centerpoint[0] -8;//MH - this could be handled better... -8 is marker width / 2
    globeConfig.translateOutY = globeConfig.centerpoint[1] -300; //height you want the marker to drop from
    globeConfig.translateInX = globeConfig.centerpoint[0] -8;
    globeConfig.translateInY = globeConfig.centerpoint[1]-22; //-22 is height of marker
  }

  function addRefs(){
    addSvg();
    addProjection();
    addPath();
    addCountryList();
    addGlobeShadow();
    addWater();
    addSky();
  }

  function addSvg(){
    globeRefs.svg = d3.select("#globe-container").append("svg")
    .attr("width", globeConfig.width)
    .attr("height", globeConfig.height)
    .attr('id','globe-svg');
  }

  function addProjection(){
    //Setting projection
    globeRefs.projection = d3.geo.orthographic()
    .scale(globeConfig.globeRadius)
    .rotate([0, 0])
    .translate([globeConfig.centerpoint[0], globeConfig.centerpoint[1]])
    .clipAngle(90);
  }

  function addPath(){
    globeRefs.path = d3.geo.path()
    .projection(globeRefs.projection)
    .pointRadius(2);
  }

  function addSky(){
    globeRefs.sky = d3.geo.orthographic()
    .scale(globeConfig.globeRadius+globeConfig.skyScaleFactor)
    .rotate([0,0])
    .translate([globeConfig.centerpoint[0], globeConfig.centerpoint[1]])
    .clipAngle(90);
  }

  function addWater(){
    globeRefs.svg.append("path")
    .datum({
      type: "Sphere"
    })
    .attr("class", "water globe")
    .attr("d", globeRefs.path);
  }

  function addGlobeShadow(){
    globeRefs.svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", globeConfig.globeRadius*2)
    .attr("height", globeConfig.height)
    .attr("class","globe-shadow")
    .attr("transform","rotate(-45,100,100) translate(-30,600)"); //MH dynamic way to find tangent
  }

  function addMarker(){
    d3.xml("img/marker-red.svg", "image/svg+xml", function(xml) {
       globeRefs.$markerEl = $(xml.documentElement).find('.marker-group')[0];

       globeRefs.svg.append("circle").attr("cx", globeConfig.centerpoint[0]).attr("cy", globeConfig.centerpoint[1]).attr("r", 1).attr("class", "dot hidden");
      $('#globe-svg').append(globeRefs.$markerEl);
      globeRefs.dot = d3.select(".dot");
      globeRefs.marker = d3.select('.marker-group').attr('class','marker-group yellow hidden').attr("transform", "translate(" + globeConfig.translateInX + "," + globeConfig.translateInY + ")");

    });
  }

  function addCountryList(){
    globeRefs.countryList = d3.select("#globe-container").append("select").attr("name", "countries").attr('id','country-select');
  }

  function addTooltip(){
    globeRefs.countryTooltip = d3.select("#globe-container").append("div").attr("class", "country-tooltip")
  }

  function loadData(){
    queue()
    .defer(d3.json, "json/world-110m.json")
    .defer(d3.tsv, "json/world-110m-country-names.tsv")
    .defer(d3.json, "json/places.json")
    .await(dataReady);
  }

  function dataReady(error, world, countryData, places){
    globeRefs.countryById = {};
    globeRefs.places = places;
    globeRefs.countryData = countryData;
    globeRefs.countries = topojson.feature(world, world.objects.countries).features;
    addCountryOptions();
    addWorld();
    addMarker();
    addTooltip();
    addDragHandlers();
    addArcs();
    addFlights();
  }

  function addCountryOptions(){
    globeRefs.countryData.forEach(function(d) {
      globeRefs.countryById[d.id] = d.name;
      option = globeRefs.countryList.append("option");
      option.text(d.name);
      option.property("value", d.id);
    });

    d3.select("select").on("change", function() {
      switchCountry(this.value);
    });
  }

  function addWorld(){
      globeRefs.world = globeRefs.svg.selectAll("path.land")
      .data(globeRefs.countries)
      .enter().append("path")
      .attr("class", "land globe")
      .attr("d", globeRefs.path)

      .on("mouseover", function(d) {
        if (globeRefs.countryById[d.id]){ //if there is a named country, add a hover state and tooltip
          d3.select(this).attr('class','land globe focused');
          globeRefs.countryTooltip.text(globeRefs.countryById[d.id])
          .style("left", (d3.event.pageX + 7) + "px")
          .style("top", (d3.event.pageY - 15) + "px")
          .style("display", "block")
          .style("opacity", 1);
        }
      })
      .on("mouseout", function(d) { //remove the hover state and tooltip
        if (globeRefs.countryById[d.id]){
          d3.select(this).attr('class','land globe');
          globeRefs.countryTooltip.style("opacity", 0)
          .style("display", "none");
        }
      })
      .on("mousemove", function(d) {
        if (globeRefs.countryById[d.id]){
          globeRefs.countryTooltip.style("left", (d3.event.pageX + 7) + "px")
          .style("top", (d3.event.pageY - 15) + "px");
        }
      });

  }

  function addDragHandlers(){
    globeRefs.allGlobe = globeRefs.svg.selectAll('.globe')
    .call(d3.behavior.drag()
      .origin(function() {
        var r = globeRefs.projection.rotate();
        return {
          x: r[0] / globeConfig.sens,
          y: -r[1] / globeConfig.sens
        };
      })
      .on("drag", function() {

        globeStates.markerHidden = $('.marker').hasClass('hidden');

        var rotate = globeRefs.projection.rotate();
        globeRefs.projection.rotate([d3.event.x * globeConfig.sens, -d3.event.y * globeConfig.sens, rotate[2]]);
        globeRefs.sky.rotate([d3.event.x * globeConfig.sens, -d3.event.y * globeConfig.sens, rotate[2]]);
        refreshMap();
        globeRefs.svg.selectAll("path.land").attr("d", globeRefs.path);
        globeRefs.svg.selectAll(".focused").classed("focused", focused = false);
      }));
  }

  function addArcs(){

    globeRefs.arcGroup = globeRefs.svg.append("g")
    .attr("transform", "translate(" + globeConfig.width / 2 + "," + globeConfig.height / 2 + ")")
    .attr("class","arcGroup");
    addArc();
  }

  function addArc(){
    var i = globeStates.curArc;
      if (i==0){
        var startAngle = 0;
      } else {
        var startAngle = globeConfig.tau * globeConfig.arcPercentages[i-1];
      }
      var arc = d3.svg.arc()
      .innerRadius(globeConfig.globeRadius+globeConfig.arcInner)
      .outerRadius(globeConfig.globeRadius+globeConfig.arcOuter)
      .startAngle(startAngle);

      var arcPath = globeRefs.arcGroup.append("path")
      .datum({endAngle: startAngle}) //start at zero and animate to final value
      .style("fill", globeConfig.arcColors[i])
      .attr('class','arc arc'+i)
      .attr("d", arc);

      setTimeout(function(){
        switchCountry(globeConfig.countryIDs[globeStates.curArc], 'auto');
      },globeConfig.introPause);

      arcPath.transition()
      .delay(globeConfig.introPause)
      .duration(globeConfig.arcSpeed)
      .call(arcTween, globeConfig.arcPercentages[i] * globeConfig.tau, arc)
      .each('end',function(){
        addIntroText();
      });
  }

  function addIntroText(){
    globeRefs.$infoText.html(globeConfig.infoTextArray[globeStates.curArc]).addClass('active');
    setTimeout(function(){
      globeStates.curArc++;

      if (globeStates.curArc<globeConfig.arcPercentages.length){
        globeRefs.$infoText.removeClass('active').addClass('inactive');
        setTimeout(function(){
          globeRefs.$infoText.removeClass('inactive');
          addArc();
        },500)
      } else {
        beginInteractivePhase();
      }
    },2000)
  }

  function switchCountry(countryVal,mode){
    if (mode == 'auto'){
      animateMarkerIn();
    } else {
      $('.flyers').fadeTo(globeConfig.markerSpeed,0,function(){
        $(this).removeClass('active');
      });
      var markerColor = randomNumber(0,3);
      animateMarkerIn(markerColor);
    }

    var rotate = globeRefs.projection.rotate(),
    focusedCountry = country(globeRefs.countries, countryVal),
    p = d3.geo.centroid(focusedCountry);

    var countryName = $('select').find('option[value="' + countryVal + '"]').text();
    $('.marker-country').text(countryName);

    globeRefs.svg.selectAll(".focused").classed("focused", focused = false);

    //Globe rotating

    (function transition() {
      d3.transition()
        .duration(1000)
        .tween("rotate", function() {
          var r = d3.interpolate(globeRefs.projection.rotate(), [-p[0], -p[1]]);
          return function(t) {

            globeRefs.projection.rotate(r(t));
            globeRefs.sky.rotate(r(t));
            if (globeRefs.path){
              globeRefs.svg.selectAll(".point").attr("d", globeRefs.path);

              globeRefs.svg.selectAll(".globe").attr("d", globeRefs.path)
              .classed("focused", function(d, i) {
                return d.id == focusedCountry.id ? focused = d : false;
              });
            }

          };
        }).each("end", function() {
          if (globeStates.interactive){
            refreshMap();
            $('.flyers').addClass('active').fadeTo(globeConfig.markerSpeed,1);
          }
          if (!globeStates.interactive){
            animateMarkerOut();
          }

        })
    })();
  }

  function addFlights(){
    globeRefs.swoosh = d3.svg.line()
    .x(function(d) { return d[0] })
    .y(function(d) { return d[1] })
    .interpolate("cardinal")
    .tension(.0);

    globeRefs.svg.append("g").attr("class","points")
    .selectAll("text").data(globeRefs.places.features)
    .enter().append("path")
    .attr("class", "point")
    .attr("d", globeRefs.path);

    // spawn links between cities as source/target coord pairs
    globeRefs.places.features.forEach(function(a) {
      globeRefs.places.features.forEach(function(b) {
        if (a !== b) {
          globeRefs.links.push({
            source: a.geometry.coordinates,
            target: b.geometry.coordinates
          });
        }
      });
    });

    // build geoJSON features from links array
    globeRefs.links.forEach(function(e,i,a) {
      var feature =   { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [e.source,e.target] }}
      globeRefs.arcLines.push(feature)
    });

    //flight paths between locations
    globeRefs.svg.append("g").attr("class","flyers")
    .selectAll("path").data(globeRefs.links)
    .enter().append("path")
    .attr("class","flyer")
    .attr("stroke",function(d,i){
      var numColors = globeConfig.arcColors.length;
      var colorIndex = i % numColors;
      return globeConfig.arcColors[colorIndex];
    })
    .attr("d", function(d) { return globeRefs.swoosh(flightArc(d)) });
  }

  function flightArc(pts) {
    var source = pts.source,
    target = pts.target;

    var mid = locationOnArc(source, target, .5);
    var result = [ globeRefs.projection(source),
    globeRefs.sky(mid),
    globeRefs.projection(target) ];
    return result;
  }

  function locationOnArc(start, end, loc) {
    var interpolator = d3.geo.interpolate(start,end);
    return interpolator(loc)
  }

  function beginInteractivePhase(){
    globeStates.interactive = true;
    refreshMap();
    animateMarkerIn();
    $('#country-select, #marker-text,.flyers, .points').addClass('active').fadeTo(500,1); //MH - should be tied to a common element?
  };

  function refreshMap(){
    globeRefs.svg.selectAll(".point").attr("d", globeRefs.path);
    globeRefs.svg.selectAll(".flyer")
    .attr("d", function(d) {
      return globeRefs.swoosh(flightArc(d));
    }).attr("opacity", function(d) {
      return fadeAtEdge(d);
    });
  }

  function fadeAtEdge(d){

      var centerPos = globeRefs.projection.invert([globeConfig.centerpoint[0],globeConfig.centerpoint[1]]),
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

  function animateMarkerIn(markerIndex){

    globeRefs.dot.classed('active', false).transition().duration(100).attr('r', 1).attr('fill', '#4b4949').each('end', function() {
      globeRefs.dot.attr('class', 'dot hidden');
    });

    if (markerIndex){
      var markerColor = globeConfig.markerColors[markerIndex];
    } else {
      var markerColor = globeConfig.markerColors[globeStates.curArc];
    }

    globeRefs.marker.transition().duration(globeConfig.markerSpeed).style('opacity', 0).attr('transform','translate(' +  globeConfig.translateOutX + ', ' + globeConfig.translateOutY + ')').each('end',function(){
        globeRefs.marker.classed('hidden',true).attr('class','marker-group hidden ' + markerColor);
    });
  }

  function animateMarkerOut(){
    globeRefs.dot.classed("hidden", false).attr('class', 'dot active');

    globeRefs.marker.classed('hidden',false).transition().ease('bounce-ease-out').duration(500).style('opacity', 1).attr('transform','translate(' + globeConfig.translateInX + ', ' + globeConfig.translateInY + ')');
      globeRefs.dot.transition().duration(globeConfig.markerSpeed).attr('r', 20).attr('fill', '#4b4949').ease('sine').transition().duration(20).attr('r', 5).attr('fill-opacity', 1).each('end', function() {
    });
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

  return {
    init: init
  }

})(jQuery, window);

globeModule.init();
