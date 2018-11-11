namespace RCEngine {
    /**
     * The main game class.
     */
    export class Engine {
        player: Player;
        map: Map;
        controls: Controls;
        camera: Camera;
        lastTime: number = 0;

        constructor(canvas: HTMLCanvasElement) {
            this.player = new Player(15.3, -1.2, Math.PI * 0.3);
            this.map = new Map(32);
            this.map.randomize();
            this.controls = new Controls();
            this.camera = new Camera(canvas, 320, 0.8);
        }

        public run(): void {
            let frame = (seconds: number) => {
                this.map.update(seconds);
                this.player.update(this.controls, this.map, seconds);
                this.camera.render(this.player, this.map);  
                requestAnimationFrame(frame);
            };
            frame(0);
        }
    }
}
