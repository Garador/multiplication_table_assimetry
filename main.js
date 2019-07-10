var mainApp = angular.module("mainApp", []);

mainApp.controller("studentController", function($scope) {
  function _handleResize() {
	_recalculateContainerWidth();
  };

  function _recalculateContainerWidth(){
	window.graphData.containerWidth = $("#graphContainer_a").width();
	window.graphData.correctionA = (window.graphData.containerWidth/15);
  }

  window.graphData = {
	  element:null,
	  containerWidth: 300,
	  circleData:{
		  element:null,
		  diameter:0
	  },
	  points:[],
	  correctionA: 20,
	  correctionB: 2
  }

  function drawGraph(){
	if(!window.graphData.element){
		window.graphData.element = SVG('grapDrawing');
	}else{
		window.graphData.element.clear();	//Clears the graph
	}
	window.graphData.element.size(window.graphData.containerWidth+window.graphData.correctionA*2, window.graphData.containerWidth+window.graphData.correctionA*2);

	//We define the circle data element
	window.graphData.circleData.diameter = Math.floor(window.graphData.containerWidth);
	window.graphData.circleData.element = window.graphData.element.circle(window.graphData.circleData.diameter);
	window.graphData.circleData.element.fill("transparent").stroke({width:1, color:'blue'});
	window.graphData.circleData.element.move(window.graphData.correctionA+2, window.graphData.correctionA+2)
	
	//We plot the points
	let points = plotPoints($scope.calcData.points, window.graphData.circleData.diameter, window.graphData.element);

	//We set the point labels
	plotLabels(points, window.graphData.element);

	// We plot the lines
	plotLines(points, window.graphData.correctionB, $scope.calcData.multiplier);
	window.graphData.points = points;
  }

  //This function calculates and plot the actual lines agains the dots.
  function plotLines(points, correctionFactor, multFactor){
	let plotResult = [];
	for(let i=0;i<points.length;i++){
		let spinFactor = 1;
		let plotPointNumber = (multFactor*i);
		if(plotPointNumber > points.length){
			spinFactor = Math.floor(plotPointNumber/points.length);
			plotPointNumber -= ( spinFactor * points.length );
		}else if(plotPointNumber == points.length){
			continue;
		}
		let pointA = points[i];
		let pointB = undefined;

		//We search the point B
		for(let a=0;a<points.length;a++){
			if(points[a].position === plotPointNumber){
				pointB = points[a];
			}
		}
		if(pointB){
			plotLine(pointA, pointB, correctionFactor);
			plotResult.push({
				pointA, pointB
			})
		}else{
			console.log("Could not find point for pointA. Debug info:\n",{
				plotPointNumber, spinFactor, pointA, pointB
			});
		}
	}
	return plotResult;
  }

  function plotLine(pointA, pointB, correctionFactor){
	window.graphData.element.line(
		pointA['X']+correctionFactor, 
		pointA['Y']+correctionFactor, 
		pointB['X']+correctionFactor, 
		pointB['Y']+correctionFactor)
	.stroke({width:2, color:'blue'});
  }

  //This method plots the different points into the
  //element parameter (an SVG object)
  function plotPoints(points, diameter, element){
	let builtPoints = buildPoints(points, diameter);
	for(let i=0;i<builtPoints.length;i++){
		builtPoints['dot'] = plotPoint(element, builtPoints[i]['X'], builtPoints[i]['Y']);
	}
	return builtPoints;
  }

  //This method plots the labels into the
  // element (an SVG) based on a series of points
  function plotLabels(points, element){
	for(let i=0;i<points.length;i++){
		points[i].label = element.text(`${i}`).font({fill:'black', weight:'bold'});
		points[i].label.move(points[i]['X']+5, points[i]['Y'])
	}
  }

  //This method build the locations for the points
  //to be plotted agains the SVG object
  function buildPoints(points, diameter){
	let degreeJump = (360/points);
	let builtPoints = [];
	let position = 0;
	for(let i=360;i>0;i-=degreeJump){
		builtPoints.push(buildPoint(i, Math.floor(diameter/2), position));
		position++;
	}
	return builtPoints;
  }

  //This method takes the deg. and the radius, and
  //generates a series of points into the space 
  //that represent the circle points to be plotted
  function buildPoint(deg, radius, position){
	let X = (window.graphData.containerWidth/2)+(radius*Math.cos((deg*(Math.PI/180))))*-1;
	X+=window.graphData.correctionA;
	let Y = ((window.graphData.containerWidth/2)+(radius*Math.sin((deg*(Math.PI/180)))));
	Y+=window.graphData.correctionA;
	return {
		X, Y, dot:null, label:null, position
	};
  }

  //This method generates a point
  //into the SVG object parameter "element"
  function plotPoint(element, X, Y){
	return element.circle(5).fill("black").move(Math.floor(X), Math.floor(Y));
  }

  //This methods listen to window resize events
  //in order to resize
  function listenWindowResize() {
    $(window).resize(_handleResize);
  };

  //This actionates the calcualtions to draw
  //the canvas
  $scope.calculate = function() {
	drawGraph();
  };

  $scope.calcData = {
    multiplier: 2,
    points: 10
  };

  function initialize() {
	listenWindowResize();
	_recalculateContainerWidth();
  };

  initialize();
});
