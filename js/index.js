$(document).ready(function() {

	//Canvas setup
	var canvas = $('canvas')[0];
	//Argument implementation
	canvas.style.marginLeft = 0;
	canvas.style.marginTop = 0;
	canvas.width = $(document).width();
	canvas.height = $(document).height();
	//Canvas context declaration
	var ctx = canvas.getContext("2d");
	//Mouse tracking
	var mouseX;
	var mouseY;
	var safe = true;

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
	
	
	$(document).bind('click',function() {
		location.reload();
	});

	//Game resources
	var intersect = true;
	var snakeNodes = [];
	var grow = 100;
	var score = 0;
	var maxScore = 1;
	var health = 1;
	var gameOver = false;
	
	//Food
	function Food() {
		this.x = Math.random()*(canvas.width-100)+50;
		this.y = Math.random()*(canvas.height-100)+50;
		this.radius = Math.random()*9+10;
		this.color = "#" + Math.floor(Math.random()*16777215).toString(16);
	}
	
	var food = new Food();

	function SnakeNode(mouseX, mouseY) {
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.color = "rgba(128,128,128,0.25)";
		this.intersect = false;
		this.full = false;
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
		if(!safe) {
			for (i = 0; i < snakeNodes.length - 1; i++) {
				if (getDistance(this.x, this.y, snakeNodes[i].x, snakeNodes[i].y) < this.radius + snakeNodes[i].radius) {
					snakeNodes[i].intersect = true;
					this.intersect = true;
					health -= 0.07;
				}
			}
			if (this.radius < 1) {
				this.intersect = true;
				health -= 0.01;
			}
		}
		//Food collection
		if(getDistance(this.x,this.y,food.x,food.y) < this.radius + food.radius) {
			this.color = food.color;
			this.full = true;
			food = new Food();
			score++;
			grow += 5;
		}
	}
	
	//Loop
	var mainLoop = function() {
		//Repaint
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//Food
		ctx.fillStyle = food.color;
		ctx.strokeStyle = "rgba(0,255,0,0.5)";
		ctx.beginPath();
		ctx.ellipse(food.x, food.y, food.radius, food.radius, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		for (i = 0; i < snakeNodes.length; i++) {
			ctx.strokeStyle = "rgba(0,255,0,0.5)";

			if (snakeNodes[i].intersect && !snakeNodes[i].full) {
				ctx.fillStyle = "rgba(255,0,0,0.3)";
			} else {
				ctx.fillStyle = snakeNodes[i].color;
			}
			//Connective nodes outside
			ctx.beginPath();
			ctx.ellipse(snakeNodes[i].x, snakeNodes[i].y, snakeNodes[i].radius, snakeNodes[i].radius, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			//Connective nodes inside
			ctx.beginPath();
			ctx.ellipse(snakeNodes[i].x, snakeNodes[i].y, snakeNodes[i].radius / 2, snakeNodes[i].radius / 2, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			//Connective node center
			ctx.fillStyle = "rgba(128,128,128,0.25)";
			ctx.beginPath();
			ctx.ellipse(snakeNodes[i].x, snakeNodes[i].y, 3, 3, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			//Connecting lines
			if (i > 0) {
				ctx.beginPath();
				ctx.moveTo(snakeNodes[i - 1].x, snakeNodes[i - 1].y);
				ctx.lineTo(snakeNodes[i].x, snakeNodes[i].y);
				ctx.stroke();
			}
			//Mouse points
			ctx.beginPath();
			ctx.ellipse(snakeNodes[i].mouseX, snakeNodes[i].mouseY, snakeNodes[i].radius / 2, snakeNodes[i].radius / 2, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}

		ctx.strokeStyle = "rgb(0,255,0)";

		//Title
		var titleWidth = ctx.measureText("SCORE++").width + 20;
		ctx.strokeRect(0, 1, titleWidth, 50);
		ctx.strokeRect(0, 1, canvas.width, 50);
		ctx.font = "30px Monospace";
		ctx.strokeText("SNAKE++", 10, 35);
		//Score
		if(score > maxScore) {
			maxScore = score;
		}
		//Score bar
		if(score > 0) {
			var scoreText = "SCORE: " + score + "/" + maxScore;
		} else {
			var scoreText = "SCORE: 0/0";
		}
		ctx.strokeText(scoreText, titleWidth + (canvas.width - (titleWidth)) / 2 - ctx.measureText(scoreText).width / 2, 35);
		ctx.fillStyle = "rgba(0,255,0,0.4)";
		ctx.fillRect(titleWidth, 1, score/maxScore * (canvas.width-titleWidth), 50);
		//Health
		if (health <= 0) {
			health = 0;
			gameOver = true;
		}
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
			clearInterval();
			ctx.fillStyle = "rgba(0,255,0,0.8)";
			var endText = "GAME OVER!";
			ctx.font = "40px Monospace";
			ctx.strokeStyle = "rgba(0,0,0,0.5)";
			ctx.fillRect(canvas.width / 2 - ctx.measureText(endText).width / 2 - 25, canvas.height/2-20-50, ctx.measureText(endText).width+50,25+50);
			ctx.strokeRect(canvas.width / 2 - ctx.measureText(endText).width / 2 - 23, canvas.height/2-20-48, ctx.measureText(endText).width+46,25+46);
			ctx.strokeText(endText, canvas.width / 2 - ctx.measureText(endText).width / 2, canvas.height/2-20);
		} else {
			//Add node to front
			snakeNodes.push(new SnakeNode(mouseX, mouseY));
			if (grow > 0) {
				grow--;
			} else {
				snakeNodes.splice(0, 1);
				if(snakeNodes[0].full) {
					score--;
				}
			}
		}
	}

	function getDistance(x1, y1, x2, y2) {
		return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
	}

	setInterval(mainLoop, 1000 / 16);

});
