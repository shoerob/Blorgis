namespace RCEngine {
    export class Player {
        public x: number;
        public y: number;
        public direction: number;
        private paces: number;

        constructor(x: number, y: number, direction: number) {
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.paces = 0;
        }

        public update(controls: Controls, map: Map, seconds: number) {
            if (controls.states["ArrowUp"]) {
                var dx = Math.cos(this.direction) * 0.01;
                var dy = Math.sin(this.direction) * 0.01;
                if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
                if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
                this.paces += 0.01;
            }
            if (controls.states["ArrowDown"]) {
                var dx = Math.cos(this.direction) * -0.01;
                var dy = Math.sin(this.direction) * -0.01;
                if (map.get(this.x + dx, this.y) <= 0) this.x += dx;
                if (map.get(this.x, this.y + dy) <= 0) this.y += dy;
                this.paces -= 0.01;
            }
            if (controls.states["ArrowLeft"]) {
                this.direction-=0.01;
                if (this.direction < 0) {
                    this.direction = 360;
                }
            }
            if (controls.states["ArrowRight"]) {
                this.direction+=0.01;
                if (this.direction > 360) {
                    this.direction = 0;
                }
            }
        }
    }
}
