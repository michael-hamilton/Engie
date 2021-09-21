import PerlinNoise from "../lib/PerlinNoise";
import SimplexNoise from 'simplex-noise';
import * as Perlin from '@trinkets/noise'


class Engie {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.noise = [];
    this.mapWidth = 1500;
    this.mapHeight = 1000;
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.imageData = this.ctx.createImageData(this.windowWidth, this.windowHeight);
    this.originX = 0;
    this.originY = 0;
    this.scrollSpeed = 2;
    this.isScrolling = false;
    this.scrollStartX = 0;
    this.scrollStartY = 0;
    this.baseHeight = 0;
    this.heightThresholdMap = {
      deepwater: 0.12,
      water: 0.23,
      shore: 0.26,
      field: 0.42,
      grass: 0.60,
      forest: 0.85,
      rock: 0.99,
      mountain: 1,
    };
  }

  init() {
    window.removeEventListener('resize', this.handleResize, true);
    window.addEventListener('resize', this.handleResize.bind(this));
    this.initInputHandlers();
    this.generateNoise();
    this.renderMap();
    this.handleResize();
    this.draw();
  }

  initInputHandlers() {
    const renderMap = this.renderMap.bind(this);
    const moveMap = this.moveMap.bind(this);

    window.addEventListener('mousedown', (e) => {
      this.scrollStartX = e.clientX;
      this.scrollStartY = e.clientY;
      this.isScrolling = true
    });

    window.addEventListener('mouseup', (e) => {
      this.isScrolling = false
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isScrolling) {
        if (e.clientX > this.scrollStartX) {
          moveMap(-this.scrollSpeed * 5, 0);
        } else if (e.clientX < this.scrollStartX) {
          moveMap(this.scrollSpeed * 5, 0);
        }

        if (e.clientY > this.scrollStartY) {
          moveMap(0, -this.scrollSpeed * 5);
        } else if (e.clientY < this.scrollStartY) {
          moveMap(0, this.scrollSpeed * 5);
        }

        this.scrollStartX = e.clientX;
        this.scrollStartY = e.clientY;

        renderMap();
      }
    });

    window.addEventListener('keypress', (e) => {
      switch (e.key) {
        case "w":
          moveMap(0, -this.scrollSpeed * 5);
          break;
        case "s":
          moveMap(0, this.scrollSpeed * 5);
          break;
        case "a":
          moveMap(-this.scrollSpeed * 5, 0);
          break;
        case "d":
          moveMap(this.scrollSpeed * 5, 0);
          break;
      }
      renderMap();
    });
  }

  handleResize() {
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;
    this.canvas.setAttribute('width', window.innerWidth);
    this.canvas.setAttribute('height', window.innerHeight);
    this.imageData = this.ctx.createImageData(this.windowWidth, this.windowHeight);
    this.renderMap();
  }

  generateNoise() {
    const xSize = this.mapWidth;
    const ySize = this.mapHeight;

    const p = new PerlinNoise();
    p.init();

    for (let y = 0; y < ySize; y++) {
      this.noise[y] = [];
      for (let x = 0; x < xSize; x++) {
        const nx = x / xSize - this.baseHeight;
        const ny = y / ySize - this.baseHeight;
        const normalize = (e) => (e - (-1)) / (1 - (-1));
        const noi =  normalize(1 * p.noise(2 * nx, 2 * ny, 1) +  0.5 * p.noise(4 * nx, 4 * ny, 1));
        this.noise[y].push(Math.pow(noi, 8));
      }
    }
  }

  getColorIndicesForCoord(x, y, width) {
    const red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  }

  renderMap() {
    const h = this.mapHeight < this.windowHeight ? this.mapHeight : this.windowHeight;
    const w = this.mapWidth < this.windowWidth ? this.mapWidth : this.windowWidth;

    const tileSize = 1;

    for (let row = 0; row < (h); row++) {
      for (let col = 0; col < (w); col++) {
        let n;
        if (this.noise[row + this.originY]) {
          n = this.noise[row + this.originY][col + this.originX];
        }

        const color = [0, 0, 0, 0];

        // Water
        if (n < this.heightThresholdMap.deepwater) {
          color[0] = 30;
          color[1] = 120;
          color[2] = 157;
          color[3] = 255;
        }

        // Water
        else if (n < this.heightThresholdMap.water) {
          color[0] = 22;
          color[1] = 144;
          color[2] = 184;
          color[3] = 255;
        }

        // Shore
        else if (n < this.heightThresholdMap.shore) {
          color[0] = 233;
          color[1] = 199;
          color[2] = 147;
          color[3] = 255;
        }

        // field
        else if (n < this.heightThresholdMap.field) {
          color[0] = 96;
          color[1] = 193;
          color[2] = 106;
          color[3] = 255;
          // "#e9c793"
        }

        // Grass
        else if (n < this.heightThresholdMap.grass) {
          color[0] = 42;
          color[1] = 181;
          color[2] = 88;
          color[3] = 255;
        }

        // Forest
        else if (n < this.heightThresholdMap.forest) {
          color[0] = 16;
          color[1] = 53;
          color[2] = 31;
          color[3] = 255;
        }

        // Rock
        else if (n < this.heightThresholdMap.rock) {
          color[0] = 74;
          color[1] = 60;
          color[2] = 48;
          color[3] = 255;
        }

        // Mountain
        else if (n < this.heightThresholdMap.mountain) {
          color[0] = 136;
          color[1] = 128;
          color[2] = 132;
          color[3] = 255;
          // #000000
        }

        // Snow
        else {
          color[0] = 255;
          color[1] = 255;
          color[2] = 255;
          color[3] = 255;
        }

        // color[0] = n*255;
        // color[1] = n*255;
        // color[2] = n*255;
        // color[3] = 255;

        // for (let px = 0; px < tileSize - 1; px++) {
          const colorIndices = this.getColorIndicesForCoord(col, row, this.windowWidth * tileSize);
          const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;

          this.imageData.data[redIndex] = color[0];
          this.imageData.data[greenIndex] = color[1];
          this.imageData.data[blueIndex] = color[2];
          this.imageData.data[alphaIndex] = color[3];
        // }
      }
    }
  }

  moveMap(x, y) {
    if (this.originX + x >= 0 && this.originX + this.windowWidth + x < this.mapWidth) {
      this.originX += x;
    }
    if (this.originY + y >= 0 && this.originY + this.windowHeight + y < this.mapHeight) {
      this.originY += y;
    }
  }

  setThreshold(property, threshold) {
    this.heightThresholdMap[property] = threshold;
    this.renderMap();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight);
    this.ctx.putImageData(this.imageData, 0, 0);
    window.requestAnimationFrame(this.draw.bind(this));
  }
}

const e = new Engie(document.getElementById("display"));
e.init();
