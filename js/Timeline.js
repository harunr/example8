window.addEvent('domready', function(){
	$$('div.timeline_slideshow').each(function(element, index){
		new Timeline(element);
	});
});

var Timeline = new Class({
	Implements : [Options, Events],
	options : {},
	
	initialize : function(element, options) {
		this.setOptions(options);
		
		if (!element.hasClass('timeline_slideshow'))
			return;
		
		this.element = element;
		this.visuals = this.element.getElements('div.slideshow div.wrapper div.visual');
		this.timeline = this.element.getElements('div.timeline div.elapsed_time')[0];
		this.legends = this.element.getElements('div.timeline ul.legends li');
		
		// On bride à 3 visuels
		if (this.visuals.length > 3 || this.legends.length > 3)
			return
		
		// Set du click sur les nombres
		this.legends.each(function(element, index){
			element.getFirst('span.legend').addEvent('click', function(e, index){
				if (this.morphs.timeline != null) {
					this.morphs.timeline.cancel();
					this.morphs.timeline = null;
				}
				var width = (100/3)*index;
				this.timeline.setStyle('width', width+'%');
				this.goToSlide(index);
			}.bindWithEvent(this, [index]));
		}.bind(this));
		
		this.morphs = {
			'timeline' : null,
			'visual' : null
		};
		this.current = this.visuals.length-1;
		this.playingVideo = false;
		
		this.element.getElements('div.timeline ul.legends')[0].addEvent('click', function(e){
			if (this.morphs.timeline != null) {
				this.morphs.timeline.cancel();
				// Video
				if ($chk(this.visuals[this.current].getElements('div.video-js')[0])) {
					this.visuals[this.current].getFirst('img').setStyle('display', 'none');
					this.visuals[this.current].getElements('div.video-js')[0].getFirst('video').play();
					this.visuals[this.current].getElements('div.video-js')[0].getFirst('video').addEventListener("ended", function(e){
						
						var next = (this.current == this.visuals.length-1) ? 0 : this.current+1;
						this.goToSlide(next);
					}.bindWithEvent(this));
					this.playingVideo = true;
				}
				if ($chk(this.visuals[this.current].getElements('a.slider_link')[0])) {
					window.location = this.visuals[this.current].getElements('a.slider_link')[0].get('href');
				}
			}
			
		}.bindWithEvent(this));
		
		this.goToSlide(0);
	},
	
	goToSlide : function(index) {
		// On met la bonne légende
		for (var i=0;i<this.legends.length;i++) {
			if (i == index)
				this.legends[i].addClass('selected');
			else
				this.legends[i].removeClass('selected');
		}
		
		// On morph sur le visuel
		this.visuals[index].setStyles({
			'zIndex' : '2',
			'opacity' : '1',
			'display': 'block'
		});
		
		this.morphs.visual = new Fx.Morph(this.visuals[this.current], {
			'onComplete' : function(index){
				if (this.playingVideo == true) {
					this.visuals[this.current].getFirst('img').setStyle('display', 'block');
					this.visuals[this.current].getElements('div.video-js')[0].getFirst('video').pause();
					this.visuals[this.current].getElements('div.video-js')[0].getFirst('video').currentTime = 0;
					this.playingVideo = false;
				}
				this.current = index;
				this.launchTimeline();
				this.visuals[this.current].setStyle('z-index', 3);				
			}.bind(this, [index])
		}).start({
			'opacity' : 0
		});
		
	},
	
	launchTimeline : function() {
		
		
		var width = (100/3)*this.current;
		this.timeline.setStyle('width', width+'%');
		
		this.morphs.timeline = new Fx.Morph(this.timeline, {
			'duration' : 5000,
			'unit' : '%',
			'transition' :Fx.Transitions.linear,
			'onComplete' : function(){
				if (this.current == 2)
					this.goToSlide(0);
				else 
					this.goToSlide((this.current+1));
				
				this.morphs.timeline = null;
				
			}.bind(this)
		}).start({
			'width' : (width+(100/3))+"%"
		});
		
	}
});
