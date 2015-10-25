if (Meteor.isClient) {
  Meteor.startup(function() {
    (function() {
      var w = 1100
      var h = 500

    var x = d3.scale.ordinal().rangeRoundBands([0, w]),
        y = d3.scale.linear().range([0, h]),
        z = d3.scale.ordinal().range(["red", "blue"])

      var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      var svg = d3.select('body').append('svg')
        .attr("width", w)
        .attr("height", h)
        .attr("class", "background")


      d3.json('age.json', function(err, actCount) {
        actCount = _.sortBy(actCount, function(a) {return a.sponsor_age; });

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
        x.domain(acts[0].map(function(d) { return d.x; }));
        y.domain([0, d3.max(acts[acts.length - 1], function(d) { return d.y0 + d.y; })]);

        // Add a group for each age.
        var party = svg.selectAll("g.party")
        .data(acts)
        .enter().append("svg:g")
        .attr("class", "party")
        .attr("transform", "translate(" + 0 + "," + (h - 20) + ")")
        .style("fill", function(d, i) { return z(i); })
        .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

        // Add a rect for each age/act/party.
        var rect = party.selectAll("rect")
        .data(Object)
        .enter().append("svg:rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return -y(d.y0) - y(d.y); })
        .attr("height", function(d) { return y(d.y); })
        .attr("width", x.rangeBand());

// Add a label per date.
var label = svg.selectAll("text")
.data(x.domain())
.enter().append("svg:text")
.attr("x", function(d) { return x(d) + x.rangeBand() / 2; })
.attr("y", h - 16)
.attr("text-anchor", "middle")
.attr("dy", ".71em")
.text(function(d) {
  return new String(d);
})





/*
        var node = svg.selectAll(".node")
          .data(actCount)
          .enter().append("circle")
          .attr({
            cx: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              var scaled = d3.scale.linear()
                .domain([1, 0])
                .range([100, w - 100])
              return scaled(percentD) + "px"
            },
            cy: h / 2 + "px",
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
  */
      })
    })()



  })
}