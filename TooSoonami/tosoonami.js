
	function TooSoonami() {
		
		/** The current dimensions of the screen (updated on resize) */
		var WIDTH = 1024; // window.innerWidth;
		var HEIGHT = 768; // window.innerHeight;
		
		var CITYHEIGHT = (HEIGHT/2)-20;
		
		/** Wave settings */
		var DENSITY = .75;
		var FRICTION = 1.14;
		var MOUSE_PULL = 2; // The strength at which the mouse pulls particles within the AOE
		var AOE = 100; // Area of effect for mouse pull
		var DETAIL = Math.round( WIDTH / 50 ); // The number of particles used to build up the wave
		var WATER_DENSITY = 1.07;
		var AIR_DENSITY = 1.02;

		var canvas, context, particles;
		var houses;
		var time = 0;
		var sendingWave = false;
		var currentPower=0;
		var powerBuildup = 0;
		var POWER_MAX = 8;
		var GameFinished = false;		
		var timeUpdateInterval;		
		var currentLevel = 1;

		var waveSound = new Audio("Sounds/ocean.wav") ;		
		var quakeSound  = new Audio("Sounds/equake6.wav");
		var screamSound = new Audio("Sounds/yellgroan2.wav");		
		
		this.Initialize = function( canvasID ) {
			canvas = document.getElementById( canvasID );
			
			if (canvas && canvas.getContext) {
				context = canvas.getContext('2d');
				
				particles = [];
				houses = [];
				
				// Generate our wave particles
				for( var i = 0; i < DETAIL+1; i++ ) {
					particles.push( { 
						x: WIDTH / (DETAIL-4) * (i-2), // Pad by two particles on each side
						y: HEIGHT*.5,
						original: {x: 0, y: HEIGHT * .5},
						velocity: {x: 0, y: Math.random()*3}, // Random for some initial movement in the wave
						force: {x: 0, y: 0},
						mass: 10
					} );
				}
				
				$(window).resize(ResizeCanvas);
				$(window).keydown(KeyDown);

				timeUpdateInterval = setInterval( TimeUpdate, 40 );
				
				ResizeCanvas();	
				FillHouses();			
			}
		};
		
		function KeyDown(key)
		{
			if(key.keyCode == 32 && !sendingWave)
			{
				sendingWave = true;
				quakeSound.play();
				waveSound.play();
				if(currentPower == POWER_MAX)
					powerBuildup++;
				else
					if(powerBuildup >0)
						 powerBuildup--;
						
				setTimeout(EnableSendWave, 5000)
				SendWave(); 
			}
		}
		
		function EnableSendWave(e)
		{
			sendingWave = false;
		}

		function FillHouses()
		{					
			houses[0] = { posx: WIDTH - 250 , posy: CITYHEIGHT, sizex: 100, sizey: -50, hit: false };
			houses[1] = { posx: WIDTH - 140 , posy: CITYHEIGHT, sizex: 50, sizey: -75, hit: false };
			houses[2] = { posx: WIDTH - 80 , posy: CITYHEIGHT, sizex: 70, sizey: -125, hit: false };		
		}
		
		function HouseAffected(house, particle)
		{
			if(      (particle.x >= house.posx && particle.x <= (house.posx + house.sizex))
				&&  (particle.y <= house.posy && particle.y >= (house.posy + house.sizey)))
			{
				
				return true;
			}
				
			return false;
		}
		
		function SendWave() {			
			var forceRange = currentPower*(10+powerBuildup); // -value to +value
			InsertImpulse( Math.random() * WIDTH/3.0, (forceRange) ) ;			
		}
		
		function InsertImpulse( positionX, forceY ) {
			var particle = particles[Math.round( positionX / WIDTH * particles.length )];
			
			if( particle ) {
				particle.force.y += forceY;
			}
		}		
		
		function DrawGround(context)
		{
			var fillStyle = context.fillStyle;

			var gradientFill = context.createLinearGradient(0,0,0,1000);
			gradientFill.addColorStop(0.5,'#804000');
			gradientFill.addColorStop(0.4,'#1E731E');
			gradientFill.addColorStop(1,'#000000');
			context.fillStyle = gradientFill;
			context.fillRect(WIDTH, CITYHEIGHT, -300, 3000);
			
			context.fillStyle = fillStyle;
		}
		
		function DrawBuildings(context)
		{
			var fillStyle = context.fillStyle;		
			
			for(var i = 0; i<houses.length; i++)
			{	
				var house = houses[i];
				
				var gradientFill = context.createLinearGradient(0,0,0,house.sizey);
				gradientFill.addColorStop(0,'#333333');
				gradientFill.addColorStop(1,'#cccccc');
				context.fillStyle = gradientFill;
				
				if(!house.hit)
					context.fillRect(house.posx, house.posy, house.sizex, house.sizey);
					
					var windowWidth = 2;
					var windowHeight = 3;
					var windowSpace = 3;
					var windowMargin = 6;
					var numWinX = Math.floor(Math.abs( (house.sizex-windowMargin)/(windowWidth+windowSpace)));
					var numWinY = Math.floor( Math.abs((house.sizey-windowMargin)/(windowHeight+windowSpace)));
					context.fillStyle = "#FFFFFF";
					var spacex = 0;
					var spacey = 0;
					for(var k =0; k<numWinY-1; k++)
					{
						for(var j=0; j<numWinX; j++)
						{
							context.fillRect(house.posx+windowMargin+spacex, house.posy-windowMargin-spacey, windowWidth, windowHeight);
							spacex = (windowWidth*j) + (windowSpace*j);
						}
						spacey =( windowHeight*k) + (windowSpace*k);
					}
					
			}		
			
			context.fillStyle = fillStyle;
		}
		
		function DrawHud(context)
		{
			// buildings razed
			// citys razed
			// perfect hits
		}
		
		function DrawGui(context)
		{
			var fillStyle = context.fillStyle;
		
			var boxStart = {x:50, y:100};
			var boxSide = 25;
			var boxSpace = 15;
			
			var timeInterval = Math.ceil(500/POWER_MAX);
			
			context.fillStyle = "rgba(255,0,0,0.1)";
			context.fillRect(boxStart.x, boxStart.y, boxSide, boxSide);
			
			for(var i=0; i<POWER_MAX; i++)
			{
				if(time > i*timeInterval)
				{
					var alpha = (((i*POWER_MAX))/100);
					context.fillStyle = "rgba(255,0,0,"+alpha+")";							
					context.fillRect(boxStart.x+(boxSide*i)+(boxSpace*i), boxStart.y, boxSide, boxSide);
					
					currentPower = Math.ceil(time / timeInterval);
				}
			}
			
			context.fillStyle = "#000000";
			context.fillText("Current level: " + currentLevel, 50,150);
			context.fillText("Combo power: " + powerBuildup, 50,170);
			context.fillText("Power, redder is better", 50, 90);
			
			context.fillStyle = fillStyle;
			
			
			if(!sendingWave)
				time += timeInterval/5;
			
			if(time >= POWER_MAX*timeInterval)
				time = 0;
		}
		
		
		var rollingTextStart = HEIGHT;
		
		/**
		 * 
		 */
		function TimeUpdate(e) {
		
	
			
			var gradientFill = context.createLinearGradient(WIDTH*.5,HEIGHT*.2,WIDTH*.5,HEIGHT);
			gradientFill.addColorStop(0,'#00AABB');
			gradientFill.addColorStop(1,'rgba(0,200,250,0)');
			
			context.clearRect(0, 0, WIDTH, HEIGHT);
			context.strokeRect(0,0, WIDTH,HEIGHT);
			context.fillStyle = "#ffffff";
			context.fillRect(0,0,WIDTH,HEIGHT);
			context.fillStyle = gradientFill;
			context.beginPath();
			context.moveTo(particles[0].x, particles[0].y);
			if(!GameFinished)
			{				
				DrawBuildings(context);
				DrawGui(context);
			}
			else
			{
				var fillStyle = context.fillStyle;
				context.fillStyle = "#000000";
				context.fillText("Created by h4x, inspired and based on hakims html5 examples", WIDTH/2-200, rollingTextStart--  );
				context.fillStyle = fillStyle;
			}
			
			var len = particles.length;
			var i;
			
			var current, previous, next;
			
			for( i = 0; i < len; i++ ) {
				current = particles[i];
				previous = particles[i-1];
				next = particles[i+1];
				
				if (previous && next) {
					
					var forceY = 0;
					
					forceY += -DENSITY * ( previous.y - current.y );
					forceY += DENSITY * ( current.y - next.y );
					forceY += DENSITY/15 * ( current.y - current.original.y );
					
					current.velocity.y += - ( forceY / current.mass ) + current.force.y;
					current.velocity.y /= FRICTION;
					current.force.y /= FRICTION;
					current.y += current.velocity.y;
					

					
					// cx, cy, ax, ay
					context.quadraticCurveTo(previous.x, previous.y, previous.x + (current.x - previous.x) / 2, previous.y + (current.y - previous.y) / 2);
					
					if(!GameFinished)
					{
						var cityHit = true;
						for(var ih = 0; ih<houses.length; ih++)
						{
							house = houses[ih];
							if(!house.hit)
							{
								var affected = HouseAffected(house, current);
								house.hit = affected;
							}
							if(!house.hit)
							{
								cityHit = false;
							}
						}	
						
						if(cityHit)
						{
							screamSound.play();
						}
						
						if(cityHit && !sendingWave)
						{
							CITYHEIGHT -=10;
							if(CITYHEIGHT < 100)
							{
								GameFinished = true;
							}
							else
							{
								currentLevel++;
							}
							
							FillHouses();
						}
					}
				}
				
			}
			
			context.lineTo(particles[particles.length-1].x, particles[particles.length-1].y);
			context.lineTo(WIDTH, HEIGHT);
			context.lineTo(0, HEIGHT);
			context.lineTo(particles[0].x, particles[0].y);
			context.fill();
			
			if(!GameFinished)
			{
				DrawGround(context);
			}
		}
		
		function GetClosestParticle(point){
			var closestIndex = 0;
			var closestDistance = 1000;
			
			var len = particles.length;
			
			for( var i = 0; i < len; i++ ) {
				var thisDistance = DistanceBetween( particles[i], point );
				
				if( thisDistance < closestDistance ) {
					closestDistance = thisDistance;
					closestIndex = i;
				}				
			}
			
			return particles[closestIndex];
		}
		
		/**
		 * 
		 */
		function ResizeCanvas(e) {
			WIDTH = 1024;// window.innerWidth;
			HEIGHT = 768; // window.innerHeight;
			
			canvas.width = WIDTH;
			canvas.height = HEIGHT;
			
			for( var i = 0; i < DETAIL+1; i++ ) {
				particles[i].x = WIDTH / (DETAIL-4) * (i-2);
				particles[i].y = HEIGHT*.5;
				
				particles[i].original.x = particles[i].x;
				particles[i].original.y = particles[i].y;
			}
		}
		
		/**
		 * 
		 */
		function DistanceBetween(p1,p2) {
			var dx = p2.x-p1.x;
			var dy = p2.y-p1.y;
			return Math.sqrt(dx*dx + dy*dy);
		}
		
	}
	
	var game = new TooSoonami();
	game.Initialize( 'world' );