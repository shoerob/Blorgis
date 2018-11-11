namespace RCEngine {
    export interface Step {
        x: number;
        y: number;
        height: number;
        distance: number;
        shading: number;
        length2: number;
        offset: number;
    }

    export class Map {
        private size: number;
        private wallGrid: Uint8Array;
        public light: number;

        constructor(size: number) {
            this.size = size;
            this.wallGrid = new Uint8Array(size * size);
            this.light = 0;
        }

        public get(x: number, y: number): number {
            x = Math.floor(x);
            y = Math.floor(y);
            if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
            return this.wallGrid[y * this.size + x];
        }

        public randomize() {
            for (let i = 0; i < this.size * this.size; i++) {
                this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
            }
        }

        public cast(point: Point, angle: number, range: number): Array<Step> {
            let self = this;
            let sin = Math.sin(angle);
            let cos = Math.cos(angle);
            let noWall: Step = { x: 0, y: 0, height: 0, distance: 0, shading: 0, length2: Infinity, offset: 0 };
            return ray({ x: point.x, y: point.y, height: 0, distance: 0, shading: 0, length2: 0, offset: 0 })

            // composes a ray of incremental steps
            function ray(origin: Step): Array<Step> {
                let stepX = step(sin, cos, origin.x, origin.y);
                let stepY = step(cos, sin, origin.y, origin.x, true);
                let nextStep = stepX.length2 < stepY.length2
                    ? inspect(stepX, 1, 0, origin.distance, stepX.y)
                    : inspect(stepY, 0, 1, origin.distance, stepY.x);

                    if (nextStep.distance > range) return [origin];
                    return [origin].concat(ray(nextStep));
            }

            // steps once in the direction of the ray
            function step(rise: number, run: number, x: number, y: number, inverted: boolean = false): Step {
                if (run === 0) return noWall;
                let dx = run > 0 ? Math.floor(x + 1) - x: Math.ceil(x - 1) - x;
                let dy = dx * (rise / run);
                return {
                    x: inverted ? y + dy : x + dx,
                    y: inverted ? x + dx : y + dy,
                    height: 0,
                    distance: 0,
                    shading: 0,
                    length2: dx * dx + dy * dy,
                    offset: 0
                };
            }

            // inspects the current position of the step in the ray
            function inspect(step: Step, shiftX: number, shiftY: number, distance: number, offset: number): Step {
                let dx = cos < 0 ? shiftX : 0;
                let dy = sin < 0 ? shiftY : 0;
                step.height = self.get(step.x - dx, step.y - dy);
                step.distance = distance + Math.sqrt(step.length2);
                if (shiftX) step.shading = cos < 0 ? 2 : 0;
                else step.shading = sin < 0 ? 2 : 1;
                step.offset = offset - Math.floor(offset);
                return step;
            }
        }

        public update(seconds: number) {
            // if (this.light > 0) this.light = Math.max(this.light - 10 * seconds, 0);
            // else if (Math.random() * 5 < seconds) this.light = 2;
        }
    }
}
