



function updateGraph() {

    var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
    var props = {
	    width: 960 - margin.right,
	    height: 500 - margin.top - margin.bottom,
	    marginTop: margin.top,
	    marginBottom: margin.bottom,
	    marginRight: margin.right,
	    marginLeft: margin.left
    }

    var marginLeft = props.marginLeft;
    var marginRight = props.marginRight;
    var marginTop = props.marginTop;
    var marginBottom = props.marginBottom;

    //create the SVG container and set the origin"
    var svg = d3.select("#chart1")
		.append("svg")

		.attr("width", props.width + marginLeft + marginRight)
		.attr("height", props.height + marginTop + marginBottom + 130);

    // Various accessors that specify the four dimensions of data to visualize.
    function x(d) { return d.BouceRate; }
    function y(d) { return d.PagesPerSession; }
    function radius(d) { return d.Sessions; } //
    function color(d) { return d.region; }
    function key(d) { return d.name; }
//d.BouceRate; d.PagesPerSession; d.Sessions;
    // Chart dimensions are specified in getDefaultProps
    // and called in componentDidMount

    var height = props.height;
    var width = props.width;
    var margin = {top: props.marginTop,
		  right: props.marginRight,
		  bottom: props.marginBottom,
		  left: props.marginLeft};

    // Various scales. These domains make assumptions of data, naturally.
    var xScale = d3.scale.linear().domain([0, 1]).range([0, width]),
	yScale = d3.scale.linear().domain([0, 24]).range([height, 0]),
	radiusScale = d3.scale.sqrt().domain([0, 5e4]).range([0, 20]),
	colorScale = d3.scale.category10();




    // The x & y axes.
    var xAxis = d3.svg.axis().orient("bottom")
	    .scale(xScale).ticks(10, d3.format(".0%")).tickFormat(d3.format(".0%"));
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    var svg = d3.select("svg")
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the x-axis.
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

    // Add the y-axis.
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis);

    // Add an x-axis label.
    svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
	.attr("x", width)
	.attr("y", height - 6)
	.text("Bounce Rate for each Channels");

    // Add a y-axis label.
    svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "end")
	.attr("y", 6)
	.attr("dy", ".95em")
	.attr("transform", "rotate(-90)")
	.text("Pages / Session for each Channels");


    // Add the year label; the value is set on transition.
    var label = svg.append("text")
	    .attr("class", "year label")
	    //.attr("class", "mdl-card__supporting-text mdl-color-text--grey-600")
	    .attr("text-anchor", "end")
	    .attr("y", height + 130)
	    .attr("x", width)
	    .text(20170401);

    // Load the data.
    d3.json("data/marketdata.json", function(nations) {

	// A bisector since many nation's data is sparsely-defined.
	var bisect = d3.bisector(function(d) {
	    // d here is an array of two values, the first value is the year, the second
	    // is the relevant data (in this case either income, BouceRate or life expectancy)
	    //console.log("d");
	    //console.log(d);
	    //here we return the year (so we compare with the year to find the index) 
	    return d[0];
	});

	// Finds (and possibly interpolates) the value for the specified year.
	function interpolateValues(values, year) {

	    //locate the insertion point for 'year' in 'values' array to maintain sorted order
	    //the final two arguments '0' and 'values.length -1' are used to specify a subset of
	    //the array which should be considered. bisect.left returns the insertion point (index)


	   
	    var i = bisect.left(values, year, 0, values.length - 1),
		a = values[i];
		//console.log(i);
		// console.log(a[0]);
//		console.log("a = " + a);
	    if (i > 0) {
		//https://en.wikipedia.org/wiki/Linear_interpolation
		var b = values[i - 1],
		    t = (year - a[0]) / (b[0] - a[0]);
//		    console.log("b = " + b);
		//console.log(a[1] * (1 - t) + b[1] * t);
		return a[1] * (1 - t) + b[1] * t;
	    }
	    return a[1];
	}

	// Interpolates the dataset for the given (fractional) year.
	function interpolateData(year) {
	    return nations.map(function(d) {

//		    console.log("d.Sessions");
//		    console.log(d.Sessions);



		
		var nameTemp=d.name,
		regionTemp=d.region,
		SessionsTemp=interpolateValues(d.Sessions, year),
		BouceRateTemp=interpolateValues(d.BouceRate, year),
		PagesPerSessionTemp=interpolateValues(d.PagesPerSession, year);
		return {
		    name: d.name,
		    region: d.region,
		    Sessions: interpolateValues(d.Sessions, year),
		    BouceRate: interpolateValues(d.BouceRate, year),
		    PagesPerSession: interpolateValues(d.PagesPerSession, year)
		};


	
	    });
	}

	// Positions the dots based on data.
	function position(dot) {
	    dot.attr("cx", function(d) { return xScale(x(d)); })
		.attr("cy", function(d) { return yScale(y(d)); })
		.attr("r", function(d) { return radiusScale(radius(d)); });
	}

	function positionVoronoi(dot) {

	}
	// Defines a sort order so that the smallest dots are drawn on top.
	function order(a, b) {
	    return radius(b) - radius(a);
	}

	// Add a dot per nation. Initialize the data at 1800, and set the colors.
	var dot = svg.append("g")
	    .attr("class", "dots")
	    .selectAll(".dot")
	    .data(interpolateData(20170401))
	    .enter().append("circle")
	    .attr("class", "dot")
	    .attr("id", function(d) { return (d.name)
				      .replace(/\s/g, '').replace(/\./g,'').replace(/\,/g,'')
				      .replace(/\'/g,''); })
	    .style("fill", function(d) { return colorScale(color(d)); })
	    .call(position)
	    .sort(order);


	//Initiate the voronoi function
	//Use the same variables of the data in the .x and .y as used in the cx and cy
	//of the dot call

	var voronoi = d3.geom.voronoi()
		.x(function(d) { return xScale(x(d)); })
		.y(function(d) { return yScale(y(d)); })
		.clipExtent([[0, 0], [width, height]]);

	var voronoiTiling =  svg.selectAll("path")
	    .data(voronoi(interpolateData(20170401))) //Use voronoi() with your dataset inside
	    .enter().append("path")
	    .attr("d", function(d, i) {return "M" + d.join("L") + "Z"; })
	    .datum(function(d, i) { return d.point; })
	//give each cell a unique id where the unique part corresponds to the dot ids
	//id is country name modulo spaces commas and fullstops
	    .attr("id", function(d,i) { return "voronoi" + d.name.replace(/\s/g, '')
					.replace(/\./g,'')
					.replace(/\,/g,'')
					.replace(/\'/g,''); })
	    .style("stroke", "rgb(0,128,128)")
	    .style("visibility", d3.select("input").property("checked") ? "hidden" : "visible" )
	    .style("fill", "none")
	    .style("opacity", 0.5)
	    .style("pointer-events", "all")
	    .on("mouseover", showTooltip)
	    .on("mouseout", removeTooltip);

	// Add a title.
	dot.append("title")
	    .text(function(d) { return d.name; });

	// Add an overlay for the year label.
	var box = label.node().getBBox();

	var overlay = svg.append("rect")
		.attr("class", "overlay")
		.attr("x", box.x)
		.attr("y", box.y)
		.attr("width", box.width)
		.attr("height", box.height)
		.on("mouseover", enableInteraction);

	// Start a transition that interpolates the data based on year.
	

	// After the transition finishes, you can mouseover to change the year.
	//p
	// Tweens the entire chart by first tweening the year, and then the data.
	// For the interpolated data, the dots and label are redrawn.

function AniMateYears(Test){

	svg.transition()
	    .duration(8000)
	    .ease("linear")
	    .tween("year", Test) // remove semicolon if you uncomment below!!!
	    .each("end", enableInteraction)
	    .transition()


}
AniMateYears(tweenYear);
//setTimeout(AniMateYears(tweenYear1), 31000);
setTimeout(function() { AniMateYears(tweenYear1); }, 9500);




	function showTooltip(d, i) {

	    d3.select("#countryname").remove();
	    d3.selectAll(".dot").style("opacity", 0.2);
	    var circle = d3.select("#" + d.name.replace(/\s/g, '')
				   .replace(/\./g,'')
				   .replace(/\,/g,'')
				   .replace(/\'/g,''));

	    circle.style("opacity", 1);

	    svg.append("text")
		.attr("id", "countryname")
		.attr("y", height - 10)
		.attr("x", 10)
		.text(d.name)
		.style("font-family", "Helvetica Neue")
		.style("font-size", 24)
		.style("fill", colorScale(color(d)));

	}

	function removeTooltip(d, i) {
	    d3.selectAll(".dot").style("opacity", 1);
	    d3.select("#countryname").remove();
	}

	function tweenYear() {
	    var year = d3.interpolateNumber(20170401, 20170430);

		
	    return function(t) { 




displayYear(year(t));
	    	
	    	

	    	 };
	}
	//20170529
	function tweenYear1() {
	    var year = d3.interpolateNumber(20170501, 20170529);

		
	    return function(t) { 




displayYear(year(t));
	    	
	    	

	    	 };
	}



	// Updates the display to show the specified year.
	function displayYear(year) {
	    // we use a key function to reduce the number of DOM modifications:
	    // it allows us to reorder DOM elements in the update selection rather than
	    // regenerating them
	    //for more information see Mike Bostock's post on Object Constancy
	    //https://bost.ocks.org/mike/constancy/
	    //or the answer to this stackoverflow question:
	    //http://stackoverflow.com/questions/24175624/d3-key-function

	    dot.data(interpolateData(year), key).call(position).sort(order);
	    label.text(Math.round(year));

	    //redraw voronoi
	    d3.selectAll("path").remove();
	    //		voronoiTiling.data(voronoi(interpolateData(year)));
	    svg.selectAll("path")
		.data(voronoi(interpolateData(year))) //Use voronoi() with your dataset inside
		.enter().append("path")
		.attr("d", function(d, i) {return "M" + d.join("L") + "Z"; })
		.datum(function(d, i) { return d.point; })
	    //give each cell a unique id where the unique part corresponds to the dot ids
		.attr("id", function(d,i) { return "voronoi" + d.name.replace(/\s/g, '').replace(/\./g,'').replace(/\,/g,''); })
		.style("stroke", "rgb(0,128,128)")
		.style("visibility", d3.select("input").property("checked") ? "hidden" : "visible" )
		.style("fill", "none")
		.style("opacity", 0.5)
		.style("pointer-events", "all")
		.on("mouseover", showTooltip)
		.on("mouseout", removeTooltip);
	}

	// After the transition finishes, you can mouseover to change the year.
	function enableInteraction() {

	
	    var yearScale = d3.scale.linear()
		    //.domain([Date.parse('04/01/2017'), Date.parse('05/29/2017')])
		    //.domain([20170401,20170529])
		    .domain([20170401,20170529])
		    .range([box.x + 10, box.x + box.width - 10])
		    .clamp(true);




	    // Cancel the current transition, if any.
	    svg.transition().duration(0);

	    overlay
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("mousemove", mousemove)
		.on("touchmove", mousemove);

	    function mouseover() {
		label.classed("active", true);
	    }

	    function mouseout() {
		label.classed("active", false);
	    }

	    function mousemove() {
		displayYear(yearScale.invert(d3.mouse(this)[0]));



	    }
	}


	d3.select("input").on("change", change);


	function change() {
	    this.checked ? svg.selectAll("path").style("visibility", "hidden")
		: svg.selectAll("path").style("visibility", "visible");
	}

/*
	var div = d3.select("body").append("div")
	    .attr("id", "introtext")
	    .attr("class", "explan-text")
	    .style("display", "inline")
	    .style("color", "black")
	    .style("left", 50 + "px")
	    .style("top", 510 + "px")
	    .style("font-family", "Helvetica Neue")
	    .style("font-size", "13px")

	;

	var div1 = div.append("p").text("Added a ");

	var span = div1.append('span').text("Voronoi overlay").style("color", "rgb(0,128,128)");
	;

	var span0 = div1.append('span').text(" to separate boundary points ");

	

	var span3 = div1.append('span').text(". It shows the dynamic fluctuation in Bounce Rate (x), Pages / Session (y) and Sessions (radius) for All Marketing  Channels on Ajio.com Website (Desktop/Msite)over the last 2 Months Starting From 01 April,2017 -29 May 2017 . Marketing Channels are colored by ; mouseover to read their names.");

	var span4 = div1.append('p').text(" The purpose of a Voronoi overlay is to improve mouseover interaction (in this case when hovering over the graph the closest Marketing Channels to the mouse will be highlighted).")
		.style("color", "rgb(0,128,128)");

	var span5 = span4.append("span").text(" Mouseover the Time label on the right to move forward and backwards through time.").style("color", "grey");
*/

    });
}
    
