$(document).ready(function() {

    //Canvas setup
    var canvas = $('canvas')[0];
    canvas.width = $(document).width();
    canvas.height = $(document).height();
    var ctx = canvas.getContext('2d');

    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }
    //Environment resources
    var now,
        deltaTime = 0,
        runSpeed = 1,
        last = timestamp(),
        targetFPS = 60,
        targetStep = 1000 / targetFPS,
        step = 0,
        frameTimer = 0,
        frames = 0,
        fps = 0,
		debug = [],
		showDebug = false;
	if(localStorage.getItem("showDebug") != null) {
		showDebug = localStorage.getItem("showDebug");
		if(showDebug) {
			$('#debug').show();
		}
	}
    //Game resources
    var intersect = true,
    	snakeNodes = [],
		grow = 25,
    	score = 1,
    	maxScore = 1;
    if (localStorage.getItem("maxScore") != null) {
        maxScore = localStorage.getItem("maxScore");
        score = 0;
    }
    var health = 1,
		damageInc = 0.07,
    	gameOver = false,
		pause = false;

    //Food
    function Food() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.radius = Math.random() * 9 + 10;
        this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
		this.render = function() {
			//Food
			ctx.fillStyle = food.color;
			ctx.strokeStyle = "rgba(0,255,0,0.5)";
			ctx.beginPath();
			ctx.ellipse(food.x, food.y, food.radius, food.radius, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			for (i = 0; i < snakeNodes.length; i++) {
				snakeNodes[i].render();
        	}
		};
    }

    var food = new Food();

    function SnakeNode(mouseX, mouseY) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.color = "rgba(128,128,128,0.25)";
        this.intersect = false;
        this.full = false;
		this.render = function() {
				//Fill them 
                if (this.intersect && !this.full) {
                    ctx.fillStyle = "rgba(255,0,0,0.3)";
                } else {
                    ctx.fillStyle = this.color;
                }
                //Connective nodes outside
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, this.radius, this.radius, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                //Connective nodes inside
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, this.radius / 2, this.radius / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                //Connective node center
                ctx.fillStyle = "rgba(128,128,128,0.25)";
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, 3, 3, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                //Connecting lines
                if (i > 0) {
                    ctx.beginPath();
                    ctx.moveTo(snakeNodes[i - 1].x, snakeNodes[i - 1].y);
                    ctx.lineTo(this.x, this.y);
                    ctx.stroke();
                }
                //Mouse points
                ctx.beginPath();
                ctx.ellipse(this.mouseX, this.mouseY, this.radius / 2, this.radius / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
        };
        if (snakeNodes.length > 0) {
            this.x = (snakeNodes[snakeNodes.length - 1].mouseX + this.mouseX) / 2;
            this.y = (snakeNodes[snakeNodes.length - 1].mouseY + this.mouseY) / 2;
            this.radius = getDistance(this.mouseX, this.mouseY, snakeNodes[snakeNodes.length - 1].mouseX, snakeNodes[snakeNodes.length - 1].mouseY) / 2;
        } else {
            this.x = mouseX;
            this.y = mouseY;
            this.radius = 3;
        }
        //Intersection
        for (i = 0; i < snakeNodes.length - 1; i++) {
            if (getDistance(this.x, this.y, snakeNodes[i].x, snakeNodes[i].y) < this.radius + snakeNodes[i].radius) {
                snakeNodes[i].intersect = true;
                this.intersect = true;
                health -= damageInc;
            }
        }
        if (this.radius < 1) {
            this.intersect = true;
            health -= 0.01;
        }
        
        //Food collection
        if (getDistance(this.x, this.y, food.x, food.y) < this.radius + food.radius) {
            this.color = food.color;
            this.full = true;
            food = new Food();
            score++;
            grow += 5;
        }
    }
    //Used to determine circle size
    function getDistance(x1, y1, x2, y2) {
        return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
    }

    function render() {
        //Repaint
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//Draw the food
		food.render();
		
        //Title
        var titleWidth = ctx.measureText("SCORE++").width + 20;
        ctx.strokeRect(0, 1, titleWidth, 50);
        ctx.strokeRect(0, 1, canvas.width, 50);
        ctx.font = "30px Monospace";
        ctx.strokeText("SNAKE++", 10, 35);
		
        //Score bar
        var scoreText = "SCORE: " + score + "/" + maxScore;
        ctx.strokeText(scoreText, titleWidth + (canvas.width - (titleWidth)) / 2 - ctx.measureText(scoreText).width / 2, 35);
        ctx.fillStyle = "rgba(0,255,0,0.4)";
        ctx.fillRect(titleWidth, 1, score / maxScore * (canvas.width - titleWidth), 50);
		
        //Damage bar
        ctx.strokeRect(0, canvas.height - 50, canvas.width, 50);
        var healthText = "HEALTH: " + Math.round(health * 100) + "%";
        ctx.strokeText(healthText, (canvas.width) / 2 - ctx.measureText(healthText).width / 2, canvas.height - 15);
        if (health > 0.25) {
            ctx.fillStyle = "rgba(0,255,0,0.4)";
        } else {
            ctx.fillStyle = "rgba(255,0,0,0.4)";
        }
        ctx.fillRect(1, canvas.height - 50, canvas.width * health, 50);
		
        //Game over
        if (gameOver) {
            ctx.fillStyle = "rgba(0,255,0,0.8)";
            var endText = "GAME OVER!";
            ctx.font = "40px Monospace";
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(canvas.width / 2 - ctx.measureText(endText).width / 2 - 25, canvas.height / 2 - 20 - 50, ctx.measureText(endText).width + 50, 25 + 50);
            ctx.strokeRect(canvas.width / 2 - ctx.measureText(endText).width / 2 - 23, canvas.height / 2 - 20 - 48, ctx.measureText(endText).width + 46, 25 + 46);
            ctx.strokeText(endText, canvas.width / 2 - ctx.measureText(endText).width / 2, canvas.height / 2 - 20);
        }
		
		//Debug tools
		if(showDebug) {
			//Line to food
			ctx.strokeStyle = "#FFF";
			ctx.moveTo(mouseX,mouseY);
			ctx.lineTo(food.x,food.y);
			ctx.stroke();
		}
    }

    function update() {
        //Health
        if (health <= 0) {
            health = 0;
            gameOver = true;
        }
        //Score
        if (score > maxScore) {
            maxScore = score;
            if (localStorage.getItem("maxScore") === null) {
                localStorage.setItem("maxScore", maxScore);
            } else {
                if (maxScore > localStorage.getItem("maxScore")) {
                    localStorage.setItem("maxScore", maxScore);
                } else {
                    maxScore = localStorage.getItem("maxScore");
                }
            }
        }
		//Add node to front, remove node from back
        snakeNodes.push(new SnakeNode(mouseX, mouseY));
        if (grow > 0) {
            grow--;
        } else {
            snakeNodes.splice(0, 1);
            if (snakeNodes[0].full) {
                score--;
            }
        }
    }

    //Loop
    function loop() {
        now = timestamp();
        //Clear screen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //Time between updates
        step = now - last;
        //FPS tracking
        frameTimer += step;
        frames++;
        if (frameTimer >= 1000) {
            fps = frames;
			frameTimer = 0;
            frames = 0;
			//Debug screen
			if(showDebug) {
				//Performance
				$('#debug').html("");
        		$('#debug').append("<strong>FPS <span class=\"secondary\">(ideal FPS)</span> <span class=\"colon\">:</span></strong> " + fps + " <span class=\"secondary\">(" + targetFPS + ")</span><br>");
				$('#debug').append("<strong>Run speed <span class=\"secondary\">(%)</span> <span class=\"colon\">:</span></strong> " + runSpeed + " <span class=\"secondary\">(" + runSpeed*100 + "%)</span><br>");
				$('#debug').append("<strong>Delta<span class=\"secondary\"> (frame step / ideal frame step)</span> <span class=\"colon\">:</span></strong> " + deltaTime + "<span class=\"secondary\">(" + step + "," + targetStep + ")</span><br>");
				
				//Game info
				$('#debug').append("<hr>");
				$('#debug').append("<strong>Snake length <span class=\"secondary\">(nodes filled)</span></strong> <span class=\"colon\">:</span> " + snakeNodes.length + " <span class=\"secondary\">(" + score + ")</span> <span class=\"dash\">-</span> <span class=\"extra\">Your score is the number of nodes filled.</span><br>");
				$('#debug').append("<strong>Health <span class=\"secondary\">(%)</span></strong> <span class=\"colon\">:</span> " + health + " <span class=\"secondary\">(" + health*100 + "%)</span> <span class=\"dash\">-</span> <span class=\"extra\">Subtracted in increments of " + damageInc + " (" + damageInc * 100 + "%)</span><br>");
				$('#debug').append("<strong>Mouse location (x,y)<span class=\"colon\">:</span></strong> (" + mouseX + "," + mouseY + ")<br>");
				$('#debug').append("<strong>Food radius <span class=\"secondary\">(Color)</span></strong> <span class=\"colon\">:</span> " + food.radius + "px <span class=\"secondary\" style=\"color:" + food.color + "\">(" + food.color + ")</span><br>");
				$('#debug').append("<strong>Food location (x,y)<span class=\"colon\">:</span></strong> (" + food.x + "," + food.y + ")<br>");
				var gameStatus = "";
				if(pause) {
					gameStatus = "The game is paused";
				} else if(gameOver) {
					gameStatus = "The game is over";
				} else {
					gameStatus = "The game is running";
				}
		
				$('#debug').append("<strong>Game status<span class=\"colon\">:</span></strong> " + gameStatus + "<br>");
				$('#debug').append("<strong>High score<span class=\"colon\">:</span></strong> " + maxScore + "<br>");
			}
        }
        //Run the game
        deltaTime = runSpeed * (step / targetStep);
        render();
		if(!gameOver && !pause) {
			update();	
		}
        //Prepare for next loop
        last = now;
        //Loop
        requestAnimationFrame(loop);
    }
    loop();
	
	 //Mouse tracking
    var mouseX;
    var mouseY;

    $(document).bind('touchmove', function(e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        mouseX = touch.pageX;
        mouseY = touch.pageY;
        console.log(mouseX);
        safe = false;
    });
    $(document).mousemove(function(event) {
        mouseX = event.pageX;
        mouseY = event.pageY;
        safe = false;
    });


    $(document).bind('click', function() {
		if(gameOver) {
			location.reload();
		} else {
			pause = !pause;
		}
    });
	
	$(document).keydown(function(e) {
		if(e.keyCode === 49) {
			$('#debug').toggle();
			showDebug = !showDebug;
			localStorage.setItem("showDebug",showDebug);
		}
	});

});