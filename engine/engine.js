import PerlinNoise from "../lib/PerlinNoise";

class Engie {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.noise = [];
        this.mapWidth = 7000;
        this.mapHeight = 5000;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.tileSize = 1;
        this.imageData = this.ctx.createImageData(this.windowWidth * this.tileSize, this.windowHeight * this.tileSize);
        this.originX = 0;
        this.originY = 0;
        this.scrollSpeed = 5;
        this.isScrolling = false;
        this.scrollStartX = 0;
        this.scrollStartY = 0;
        this.zoom = 1;
        this.heightThresholdMap = {
            deepwater: 0.6,
            water: 0.7,
            beach: 0.74,
            grass: 1.05,
            forest: 1.2,
            mountain: 1.3
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
        const zoomMap = this.zoomMap.bind(this);

        window.addEventListener('mousedown', (e) => {
            this.scrollStartX = e.clientX;
            this.scrollStartY = e.clientY;
            this.isScrolling = true
        });

        window.addEventListener('mouseup', (e) => {
            this.isScrolling = false
        });

        window.addEventListener('mousemove', (e) => {
            if(this.isScrolling) {
                if (e.clientX > this.scrollStartX) {
                    moveMap(-this.scrollSpeed, 0);
                }
                else if (e.clientX < this.scrollStartX) {
                    moveMap(this.scrollSpeed, 0);
                }

                if (e.clientY > this.scrollStartY) {
                    moveMap(0, -this.scrollSpeed);
                }
                else if (e.clientY < this.scrollStartY) {
                    moveMap(0, this.scrollSpeed);
                }

                this.scrollStartX = e.clientX;
                this.scrollStartY = e.clientY;

                renderMap();
            }
        });

        window.addEventListener('keypress', (e) => {
            switch(e.key) {
                case "1":
                    zoomMap(1);
                    break;
                case "2":
                    zoomMap(2);
                    break;
                case "3":
                    zoomMap(3);
                    break;
                case "4":
                    zoomMap(4);
                    break;
                case "5":
                    zoomMap(5);
                    break;
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
        const xSize = this.mapWidth / this.tileSize;
        const ySize = this.mapHeight / this.tileSize;
        const baseHeight = 2;
        const multiplier = 3;
        const z = Math.random();

        for(let y = 0; y < ySize; y++) {
            this.noise[y] = [];
            for(let x = 0; x < xSize; x++) {
                const nx = x / this.mapWidth * multiplier;
                const ny = y / this.mapHeight * multiplier;
                const p = new PerlinNoise();
                this.noise[y].push(
                  Math.pow(
                  1 * p.noise( nx, ny, z * 10 ) +
                  0.5 * p.noise( 2 * nx, 2 * ny, 2 ) +
                  0.25 * p.noise( 4 * nx, 4 * ny, 4 )                    , baseHeight)
                );
            }
        }
    }

    getColorIndicesForCoord = (x, y, width) => {
        const red = y * (width * 4) + x * 4;
        return [red, red + 1, red + 2, red + 3];
    }

    renderMap() {
        const h = this.mapHeight < this.windowHeight ? this.mapHeight - 10 : this.windowHeight;
        const w = this.mapWidth < this.windowWidth ? this.mapWidth - 10 : this.windowWidth;
        for(let row = 0; row < h ; row++) {
            for(let col = 0; col < w; col++) {
                const colorIndices = this.getColorIndicesForCoord(col, row, this.windowWidth);
                const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;

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

                // Beach
                else if (n < this.heightThresholdMap.beach) {
                    color[0] = 255;
                    color[1] = 215;
                    color[2] = 184;
                    color[3] = 255;
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

                // Mountain
                else if (n < this.heightThresholdMap.mountain) {
                    color[0] = 100;
                    color[1] = 100;
                    color[2] = 100;
                    color[3] = 255;
                }

                // Snow
                else {
                    color[0] = 255;
                    color[1] = 255;
                    color[2] = 255;
                    color[3] = 255;
                }

                this.imageData.data[redIndex] = color[0];
                this.imageData.data[greenIndex] = color[1];
                this.imageData.data[blueIndex] = color[2];
                this.imageData.data[alphaIndex] = color[3];
            }
        }
    }

    moveMap(x, y) {
        if (this.originX + x >= 0 && this.originX + this.windowWidth + x < this.mapWidth * this.tileSize) {
            this.originX += x;
        }
        if (this.originY + y >= 0 && this.originY + this.windowHeight + y < this.mapHeight * this.tileSize) {
            this.originY += y;
        }
    }

    zoomMap(scale) {
        this.zoom = scale;
    }

    scaledImageData(imageData, scale) {
        const scaled = this.ctx.createImageData(imageData.width * scale, imageData.height * scale);
        const subLine = this.ctx.createImageData(scale, 1).data
        for (let row = 0; row < imageData.height; row++) {
            for (let col = 0; col < imageData.width; col++) {
                let sourcePixel = imageData.data.subarray(
                  (row * imageData.width + col) * 4,
                  (row * imageData.width + col) * 4 + 4
                );
                for (let x = 0; x < scale; x++) subLine.set(sourcePixel, x*4)
                for (let y = 0; y < scale; y++) {
                    let destRow = row * scale + y;
                    let destCol = col * scale;
                    scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
                }
            }
        }

        return scaled;
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

console.log(e);
