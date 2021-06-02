const Snake = require("./snake-js/index");
const Render = require("buffer-render");
const Input = require("readline-char");
const chalk = require("chalk");
const start = Date.now();

module.exports = class SnakeCLI {
    constructor (
        x = 16, y = 16, delay = 50, foodSpawns = 5,
        foodColor = [100, 100, 100], char = "█"
    ) {
        this.terminal = new Render();
        this.input = new Input();

        this.x = x;
        this.y = y;
        this.delay = delay;
        this.char = char;
        this.foodColor = foodColor;
        this.foodSpawns = foodSpawns;
    }

    start () {
        //setup
        this.reset();
        this.terminal.draw.box(0, 0, this.y + 1, this.x * 2 + 1);
        this.input.bind(this.handleInput.bind(this));
        this.input.bindUnblocked((key) => {
            if (key.name !== "r") return;
            this.reset();
        })

        //start
        this.input.init();
        setInterval(this.renderFrame.bind(this), this.delay);
    }

    gradient (v) {
        if (v === 0) return " ";
        if (v === -1) return chalk.rgb(...this.foodColor)(this.char);
        if (this.input.blocked) return chalk.red(this.char);

        const t = Date.now() - start;
        const s1 = 0.5;
        const s2 = 0.001;
        const color = [
            Math.floor(127.5 * (Math.sin(v * s1 + t * s2 + 0 * Math.PI / 3) + 1)),
            Math.floor(127.5 * (Math.sin(v * s1 + t * s2 + 2 * Math.PI / 3) + 1)),
            Math.floor(127.5 * (Math.sin(v * s1 + t * s2 + 4 * Math.PI / 3) + 1)),
        ];

        return chalk.rgb(...color)(this.char);
    }

    renderFrame () {
        let error = this.snake.next().error;
        if (error !== "") {
            this.input.block();
        }

        let field = this.snake.field.map(f => f.map(x => this.gradient(x)));
        field = field.map(column => Array.from({ length: 2 * column.length }, (_, i) => column[Math.floor(i / 2)]));

        this.terminal.draw.d2toBuffer(1, 1, field);
        this.terminal.draw.textIntoY(1, this.x * 2 + 3, `Score ${this.snake.score - 3}      `);
        this.terminal.render();
    }

    reset () {
        this.snake = new Snake(this.x, this.y, undefined, undefined, undefined, undefined, this.foodSpawns);
        this.input.unblock();
    }

    handleInput (key) {
        switch (key.name) {
            case "w":
            case "up":
                this.snake.left();
                break;
            case "a":
            case "left":
                this.snake.up();
                break;
            case "s":
            case "down":
                this.snake.right();
                break;
            case "d":
            case "right":
                this.snake.down();
                break;
        }
    }
}