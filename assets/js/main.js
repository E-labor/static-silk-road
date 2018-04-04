// function loadSvg(selector, url) {
//   	var target = document.querySelector(selector);
// 	// Request the SVG file
//     var ajax = new XMLHttpRequest();
//     ajax.open("GET", url + ".svg", true);
//     ajax.send();

//     // Append the SVG to the target
//     ajax.onload = function(e) {
//       target.innerHTML = ajax.responseText;
//     }
// }

// function to simulate svg path hidden
function pathPrepare(el) {
	let lineLength = el.getTotalLength();
	el.style.strokeDasharray = lineLength;
	el.style.strokeDashoffset = lineLength;
}

// hide plain roads
var roads = document.querySelectorAll('#roads path');
roads.forEach((road) => {
  pathPrepare(road);
});

// hide cities name except first one
var cities = document.querySelectorAll('#cities-name text');
cities.forEach((city, index) => {
	if (index > 0) {  
		TweenMax.to(city, .3, {autoAlpha: 0, y:-40});
	}
});

// function to animate path & the map viewbox(pan & zoom) 
function mapAnimate() {
	this.controller = new ScrollMagic.Controller();
	this.scenes = [];
	this.setAnimation = function(element, duration, timelines) {
		var circles = document.querySelectorAll('#steps circle');
			circles[0].style.stroke = '#74D7B6'; // set firts step circle with right style
        let el = document.querySelector('.'+ element),
        	map = document.getElementById("map-svg"),
        	city = cities[Number(element.slice(4))],
        	circle = circles[Number(element.slice(4))],
        	drawPath = (step, duration) => { return TweenMax.to('#roads #'+ step, duration, {strokeDashoffset: 0, ease:Linear.easeNone}); },
        	showCity = (city) => { return TweenMax.to(city, .3, {autoAlpha: 1, y:0, ease:Power4.easeInOut}); };

        // set step circle animation timeline
        let ctl = new TimelineMax();
        ctl.to(circle, .2, {scale:2, strokeWidth:2, stroke:'#74D7B6', ease:Power2.easeIn}) 
        ctl.to(circle, .2, {scale:1, strokeWidth:1, ease:Power2.easeIn});

        // set animation main timeline 
        let tl = new TimelineMax({onUpadte:drawPath, onUpadteParams:[element, duration]});
		timelines.forEach((item, i) => {
			// use timelines data from data-timeline attributes to build viewbox animation
		    tl.to(map, parseFloat(item.duration), {attr:{ viewBox:item.viewBox}, ease:Power2.easeInOut}, item.position);
		});
		tl.add(drawPath(element, duration), .3) // draw road
		tl.add(ctl) // animation step circle
		tl.add(showCity(city), "-=0.3"); // finally show city name

		// set ScrollMagic's scene with animations
        let scene = new ScrollMagic.Scene({
        	duration: el.offsetHeight,
	        triggerElement: '.'+ element,
	        triggerHook: "onLeave"
        });
        scene.setTween(tl)
        scene.addTo(this.controller);
        // scene.addIndicators();

        this.scenes.push(scene);

        return this;
    };
}



// init map animations
var mapAnimate = new mapAnimate();
var initMap = () => {
	// loadSvg('.map-container', 'img/map.svg');
	// loop over all steps sections
	var steps = document.querySelectorAll('.step-section');
	steps.forEach((step) => {
		// get data attributes as params for animations
		let stepsData = step.dataset, timelines = [], duration;
	  	Object.keys(stepsData).map(function(key, index) {
	  		if (key.search('timeline') > -1) {
	  			timelines.push(JSON.parse(stepsData[key]));
	  		} else {
	  			duration = parseFloat(stepsData[key]);
	  		}
		});
		// set scenes with animations for each step
		if(step.classList[1]) {
			mapAnimate.setAnimation(step.classList[1], duration, timelines);
		}
	});
};
//launch map script
initMap();
