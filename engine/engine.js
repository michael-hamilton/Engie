import PerlinNoise from "../lib/PerlinNoise";

class Engie {
    constructor(canvas) {
        this.c = canvas;
        this.ctx = this.c.getContext("2d");
        this.noise = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    init() {
        window.removeEventListener('resize', this.handleResize, true);
        window.addEventListener('resize', this.handleResize.bind(this));
        this.draw();
        this.handleResize()
    }

    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.c.setAttribute('width', this.width);
        this.c.setAttribute('height', this.height);
        this.noise.length = 0;
        this.generateNoise();
    }

    generateNoise() {
        const xSize = this.width;
        const ySize = this.height;
        for(let y=0; y<ySize;y++) {
            this.noise[y] = [];
            for(let x=0; x<xSize;x++) {
                this.noise[y].push(PerlinNoise.noise( 10*x, 10*y, .8 ));
            }
        }
    }

    draw() {
        this.ctx.clearRect(0,0, this.width, this.height);
        for(let y=0; y<this.noise.length; y++) {
            for(let x=0; x<this.noise[y].length;x++) {
                this.ctx.fillStyle = `rgb(${this.noise[y][x]*255}, ${this.noise[y][x]*255}, ${this.noise[y][x]*255})`;
                this.ctx.fillRect(x, y, 2, 2);
            }
        }
        window.requestAnimationFrame(() => this.draw());
    }
}

const e = new Engie(document.getElementById("display"));
e.init();
