// State
var margin = {'top': 20, 'right': 80, 'left': 50, 'bottom': 30},
    height = 350 - margin.top - margin.bottom,
    width = null;

var url = window.location.toString(),
    query_string = url.replace(/\//g,'').split('?');

var commaFormat = d3.format(',');

var colors = d3.scaleOrdinal(d3.schemeCategory10);
var bisectDate = d3.bisector(function(d) { return d.time; }).left

// Fire when the chart initializes and again whenever the window is resized
d3.csv('data/tweets_per_minute.csv', type, function(error, data) {
  if (error) throw error;

  var lines = data.columns.slice(1).map(function(teamName, i) {
    return {
      id: teamName,
      values: data.map(function(d) {
        return {time: d['ftime'], quantity: d[teamName]};
      }),
      lineColor: colors(i) // Store this so we can label the coresponding current boxes above chart
    };
  });

  // Draw the lines for Falcons and Patriots tweets per minute
  drawChart([lines[0], lines[1]]); 


  function drawChart(lines){
    width = window.innerWidth - margin.left - margin.right;

    var svg = d3.select('#charts').append('svg')
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom);

    var g = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);


    var line = d3.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.quantity); })

    x.domain(d3.extent(data, function(d) { return d.ftime; }));
    y.domain([
      d3.min(lines, function(c) { return d3.min(c.values, function(d) { return d.quantity; }); }),
      d3.max(lines, function(c) { return d3.max(c.values, function(d) { return d.quantity; }); })
    ]);
    z.domain(lines.map(function(l) { return l.id }))

    var fullTimestampFormat = d3.timeFormat("%-I:%M %p %A, %b. %-d, %Y");
    d3.select("#last-updated").html("Last updated: "+fullTimestampFormat(x.domain()[1]));

    var xAxis = d3
      .axisBottom(x)

    // Change number of ticks on mobile display
    if(width <= 500){
      xAxis.ticks(5);
    }

    var yAxis = d3
      .axisLeft(y)
  
    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    g.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .style('fill', 'black')
        .text('Number of tweets')

    var team = g.selectAll('.team')
        .data(lines)
      .enter().append('g')
        .attr('class', 'team')

    /*
    team.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .attr('fill', '#000')
        .text('Number of tweets');
        */

    team.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) {return z(d.id); })


  }//draw chart
});


function type(d, _, columns) {
  //d.time = parseTime(d.time);
  var parseTime = d3.timeParse('%Y %m %d %H');
  d.ftime = parseTime(d['ftime'])

  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}

