namespace RCEngine {
    export class Camera {
        private canvas: HTMLCanvasElement
        private ctx: CanvasRenderingContext2D;
        private width: number;
        private height: number;
        private resolution: number;
        private spacing: number;
        private focalLength: number;
        private range: number;
        private lightRange: number;
        private scale: number;

        constructor(canvas: HTMLCanvasElement, resolution: number, focalLength: number) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d')!;
            this.width = canvas.width = window.innerWidth * 0.5;
            this.height = canvas.height = window.innerHeight * 0.5;
            this.resolution = resolution;
            this.spacing = this.width / resolution;
            this.focalLength = focalLength || 0.8;
            this.range = 14;
            this.lightRange = 5;
            this.scale = (this.width + this.height) / 1200;
        }

        public render(player: Player, map: Map) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawColumns(player, map);
        }

        private drawColumns(player: Player, map: Map) {
            this.ctx.save();
            for (let column = 0; column < this.resolution; column++) {
                let x = column / this.resolution - 0.5;
                let angle = Math.atan2(x, this.focalLength);
                let ray = map.cast(player, player.direction + angle, this.range);
                this.drawColumn(column, ray, angle, map);
            }
            this.ctx.restore();
        }

        private drawColumn(column: number, ray: Array<Step>, angle: number, map: Map) {
            let ctx = this.ctx;
            let left = Math.floor(column * this.spacing);
            let width = Math.ceil(this.spacing);
            let hit = -1;

            while (++hit < ray.length && ray[hit].height <= 0);

            for (let s = ray.length - 1; s >= 0; s--) {
                let step = ray[s];
                
                if (s === hit) {
                    let wall = this.project(step.height, angle, step.distance);
                    
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#636F57';
                    // ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
                    ctx.fillRect(left, wall.top, width, wall.height);


                    // ctx.fillStyle = '#000000';
                    // ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
                    // ctx.fillRect(left, wall.top, width, wall.height);
                }
            }
        }

        private project(height: number, angle: number, distance: number): { top: number, height: number} {
            var z = distance * Math.cos(angle);
            // var wallHeight = this.height * height / z;

            var wallHeight = 240 * height / z;

            var bottom = this.height / 2 * (1 + 1 / z);
            return {
              top: bottom - wallHeight,
              height: wallHeight
            }; 
        }
    }
}
