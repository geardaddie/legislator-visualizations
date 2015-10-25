if (Meteor.isClient) {

  Meteor.startup(function() {

    var actsByTerm = function() {
      var w = 1100
      var h = 500

      var x = d3.scale.linear().range([0, w]),
        y = d3.scale.ordinal().rangeRoundBands([0, h]),
        z = d3.scale.ordinal().range(["#DC143C", "#4169E1"])

      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var svg = d3.select('#actsByTerm').append('svg')
        .attr("width", w)
        .attr("height", h)
        .attr("class", "background")


      d3.json('terms.json', function(err, actCount) {
        actCount = _.sortBy(actCount, function(a) {
          return a.term_count;
        });

        if (err) {
          throw err
        };

        var acts = d3.layout.stack()(["Republican", "Democrat"].map(function(party) {
          return actCount.map(function(d) {
            return {
              y: +d[party], // party + party act stack
              x: d.term_count
            };
          });
        }));


        acts = acts.map(function(group) {
          return group.map(function(act) {
            return {
              x: act.y,
              x0: act.y0,
              y: act.x
            }
          });
        });

        console.log(acts)


        // Compute the x-domain (by age) and y-domain (by top).
        y.domain(acts[0].map(function(d) {
          return d.y;
        }));
        x.domain([0, d3.max(acts[acts.length - 1], function(d) {
          return d.x0 + d.x;
        })]);

        // Add a group for each age.
        var party = svg.selectAll("g.party")
          .data(acts)
          .enter().append("svg:g")
          .attr("class", "party")
          .attr("transform", "translate(" + 30 + "," + 0 + ")")
          .style("fill", function(d, i) {
            return z(i);
          })
          .style("fill-opacity", "0.8")
          .style("stroke-width", "1px")
          .style("stroke", function(d, i) {
            return z(i);
          });

        // Add a rect for each age/act/party.
        var rect = party.selectAll("rect")
          .data(Object)
          .enter().append("svg:rect")
          .attr("y", function(d) {
            return y(d.y);
          })
          .attr("x", function(d) {
            return x(d.x0);
          })
          .attr("width", function(d) {
            return x(d.x);
          })
          .attr("height", y.rangeBand());

        // Add a label per term.
        var label = svg.selectAll("text")
          .data(y.domain())
          .enter().append("svg:text")
          .attr("y", function(d) {
            return y(d) + y.rangeBand() - 5;
          })
          .attr("x", 0)
          .attr("dx", ".71em")
          .text(function(d) {
            return new String(d);
          })
      })
    }

    var actsByAge = function() {
      var w = 1100
      var h = 500

      var x = d3.scale.ordinal().rangeRoundBands([0, w]),
        y = d3.scale.linear().range([0, h]),
        z = d3.scale.ordinal().range(["#DC143C", "#4169E1"])

      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var svg = d3.select('#actsByAge').append('svg')
        .attr("width", w)
        .attr("height", h)
        .attr("class", "background")


      d3.json('age.json', function(err, actCount) {
        actCount = _.sortBy(actCount, function(a) {
          return a.sponsor_age;
        });

        console.log(actCount)

        if (err) {
          throw err
        };

        var acts = d3.layout.stack()(["Republican", "Democrat"].map(function(party) {
          return actCount.map(function(d) {
            return {
              x: d.sponsor_age, // age
              y: +d[party] // party + party act stack
            };
          });
        }));

        console.log(acts)

        // Compute the x-domain (by age) and y-domain (by top).
        x.domain(acts[0].map(function(d) {
          return d.x;
        }));
        y.domain([0, d3.max(acts[acts.length - 1], function(d) {
          return d.y0 + d.y;
        })]);

        // Add a group for each age.
        var party = svg.selectAll("g.party")
          .data(acts)
          .enter().append("svg:g")
          .attr("class", "party")
          .attr("transform", "translate(" + 0 + "," + (h - 20) + ")")
          .style("fill", function(d, i) {
            return z(i);
          })
          .style("fill-opacity", "0.8")
          .style("stroke-width", "1px")
          .style("stroke", function(d, i) {
            return z(i);
          });


        // Add a rect for each age/act/party.
        var rect = party.selectAll("rect")
          .data(Object)
          .enter().append("svg:rect")
          .attr("x", function(d) {
            return x(d.x);
          })
          .attr("y", function(d) {
            return -y(d.y0) - y(d.y);
          })
          .attr("height", function(d) {
            return y(d.y);
          })
          .attr("width", x.rangeBand());

        // Add a label per date.
        var label = svg.selectAll("text")
          .data(x.domain())
          .enter().append("svg:text")
          .attr("x", function(d) {
            return x(d) + x.rangeBand() / 2;
          })
          .attr("y", h - 16)
          .attr("text-anchor", "middle")
          .attr("dy", ".71em")
          .text(function(d) {
            return new String(d);
          })
      })
    }

    var actPartisanship = function() {
      var width = 1100
      var height = 500

      var color = d3.scale.linear()
        .domain([0, 0.5, 1])
        .range(["red", "white", "blue"]);

      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var svg = d3.select('#actPartisanship').append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("class", "background")

      var centerLine = svg.append("rect")
        .attr("width", width)
        .attr("height", "2px")
        .attr("x", "0px")
        .attr("y", height / 2 + "px")
        .attr("class", "center-line")


      d3.json('acts.json', function(err, acts) {
        if (err) {
          throw err
        };
        // console.log(acts);

        var node = svg.selectAll(".node")
          .data(acts)
          .enter().append("circle")
          .attr({
            cx: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              var scaled = d3.scale.linear()
                .domain([1, 0])
                .range([100, width - 100])
              return scaled(percentD) + "px"
            },
            cy: height / 2 + "px",
            r: function(d) {
              return (d.Republican + d.Democrat) / 12
            },
            class: 'node'
          })
          .style({
            fill: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              return color(percentD)
            },
            "stroke-width": "1px",
            stroke: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              return color(percentD)
                // return "#666"
            },
            "stroke-opacity": 1,
            "fill-opacity": 0.8
          })
          .on("mouseover", function(d) {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html(d.act + " " + "(" + (d.Democrat + d.Republican) + ")")
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
      })
    }

    var map = function() {
      var height = 650,
        width = 1100;

      var projection = d3.geo.albersUsa()
        .scale(width)
        .translate([width / 2, height / 2]);

      var path = d3.geo.path()
        .projection(projection);

      var svg = d3.select("#map").append("svg")
        .attr("viewBox", "0 50 1000 550")
        .attr("preserveAspectRatio", "xMinYMin meet");

      d3.json("us.json", function(error, us) {
        if (error) {
          throw error
        };

        svg.append("path")
          .datum(topojson.feature(us, us.objects.subunits))
          .attr("d", path);

        svg.selectAll(".subunit")
          .data(topojson.feature(us, us.objects.subunits).features)
          .enter().append("path")
          .attr("class", function(d) {
            return "subunit " + d.id;
          })
          //added id in above line to use as selector: ex US-NY
          .attr("d", path)
          .style('fill', '#ddd')



        /////////Gives state boundary line
        svg.insert('path', '.graticule')
          .datum(topojson.feature(us, us.objects.subunits, function(a, b) {
            return a !== b;
          }))
          .attr('class', 'state-boundary')
          .attr("d", path)
          .attr('stroke', '#FFF')
          .style('fill', 'none')


        ///Populating stateHeat for use in heatmap below
        var locationConcentration = {};
        var paths = d3.selectAll('path')[0];
        paths.forEach(function(path) {
          //Getting state abbreviation out of DOM
          var classString = path.className.animVal;
          var state = classString.slice(classString.length - 2)
          locationConcentration[state] = 0;
        })


        d3.json("states.json", function(error, data) {
          if (error) {
            throw error
          };

          _.each(data, function(item) {
            let total = item.Democrat + item.Republican;
            let state = item.state;
            var thisState = d3.select('path[class*=' + state + ']');
            locationConcentration[state] = total;
          })

          //////Added dot in the middle of the state
          /////////////Working with Bubbles

          svg.append("g")
            .attr("class", "bubble")
            .selectAll("circle")
            .data(topojson.feature(us, us.objects.subunits).features)
            .enter().append("circle")
            .attr("transform", function(d) {
              return "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function(d) {
              var tempArray = [];
              for (var num in locationConcentration) {
                tempArray.push(locationConcentration[num])
              }

              var radius = d3.scale.linear()
                .domain([d3.min(tempArray), d3.max(tempArray)])
                .range([1, 100]);

              var abbrev = d.id.split('-').pop();

              return radius(locationConcentration[abbrev]);
            });

        })
      })
    }


    map();
    actsByTerm();
    actPartisanship()
    actsByAge();

  })
}