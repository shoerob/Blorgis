"use strict";
var RCEngine;
(function (RCEngine) {
    var Controls = /** @class */ (function () {
        function Controls() {
            var _this = this;
            this._states = {};
            document.addEventListener('keydown', function (ev) {
                _this._states[ev.key] = true;
            });
            document.addEventListener('keyup', function (ev) {
                delete _this._states[ev.key];
            });
        }
        Object.defineProperty(Controls.prototype, "states", {
            get: function () {
                return this._states;
            },
            enumerable: true,
            configurable: true
        });
        return Controls;
    }());
    RCEngine.Controls = Controls;
})(RCEngine || (RCEngine = {}));
var RCEngine;
(function (RCEngine) {
    var Map = /** @class */ (function () {
        function Map(size) {
            this.size = size;
            this.wallGrid = new Uint8Array(size * size);
            this.light = 0;
        }
        Map.prototype.get = function (x, y) {
            x = Math.floor(x);
            y = Math.floor(y);
            if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1)
                return -1;
            return this.wallGrid[y * this.size + x];
        };
        Map.prototype.randomize = function () {
            for (var i = 0; i < this.size * this.size; i++) {
                this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
            }
        };
        Map.prototype.cast = function (point, angle, range) {
            var self = this;
            var sin = Math.sin(angle);
            var cos = Math.cos(angle);
            var noWall = { x: 0, y: 0, height: 0, distance: 0, shading: 0, length2: Infinity, offset: 0 };
            return ray({ x: point.x, y: point.y, height: 0, distance: 0, shading: 0, length2: 0, offset: 0 });
            // composes a ray of incremental steps
            function ray(origin) {
                var stepX = step(sin, cos, origin.x, origin.y);
                var stepY = step(cos, sin, origin.y, origin.x, true);
                var nextStep = stepX.length2 < stepY.length2
                    ? inspect(stepX, 1, 0, origin.distance, stepX.y)
                    : inspect(stepY, 0, 1, origin.distance, stepY.x);
                if (nextStep.distance > range)
                    return [origin];
                return [origin].concat(ray(nextStep));
            }
            // steps once in the direction of the ray
            function step(rise, run, x, y, inverted) {
                if (inverted === void 0) { inverted = false; }
                if (run === 0)
                    return noWall;
                var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
                var dy = dx * (rise / run);
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
            function inspect(step, shiftX, shiftY, distance, offset) {
                var dx = cos < 0 ? shiftX : 0;
                var dy = sin < 0 ? shiftY : 0;
                step.height = self.get(step.x - dx, step.y - dy);
                step.distance = distance + Math.sqrt(step.length2);
                if (shiftX)
                    step.shading = cos < 0 ? 2 : 0;
                else
                    step.shading = sin < 0 ? 2 : 1;
                step.offset = offset - Math.floor(offset);
                return step;
            }
        };
        Map.prototype.update = function (seconds) {
            // if (this.light > 0) this.light = Math.max(this.light - 10 * seconds, 0);
            // else if (Math.random() * 5 < seconds) this.light = 2;
        };
        return Map;
    }());
    RCEngine.Map = Map;
})(RCEngine || (RCEngine = {}));
var RCEngine;
(function (RCEngine) {
    var Player = /** @class */ (function () {
        function Player(x, y, direction) {
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.paces = 0;
        }
        Player.prototype.update = function (controls, map, seconds) {
            if (controls.states["ArrowUp"]) {
                var dx = Math.cos(this.direction) * 0.01;
                var dy = Math.sin(this.direction) * 0.01;
                if (map.get(this.x + dx, this.y) <= 0)
                    this.x += dx;
                if (map.get(this.x, this.y + dy) <= 0)
                    this.y += dy;
                this.paces += 0.01;
            }
            if (controls.states["ArrowDown"]) {
                var dx = Math.cos(this.direction) * -0.01;
                var dy = Math.sin(this.direction) * -0.01;
                if (map.get(this.x + dx, this.y) <= 0)
                    this.x += dx;
                if (map.get(this.x, this.y + dy) <= 0)
                    this.y += dy;
                this.paces -= 0.01;
            }
            if (controls.states["ArrowLeft"]) {
                this.direction -= 0.01;
                if (this.direction < 0) {
                    this.direction = 360;
                }
            }
            if (controls.states["ArrowRight"]) {
                this.direction += 0.01;
                if (this.direction > 360) {
                    this.direction = 0;
                }
            }
        };
        return Player;
    }());
    RCEngine.Player = Player;
})(RCEngine || (RCEngine = {}));
var RCEngine;
(function (RCEngine) {
    var Camera = /** @class */ (function () {
        function Camera(canvas, resolution, focalLength) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = canvas.width = window.innerWidth * 0.5;
            this.height = canvas.height = window.innerHeight * 0.5;
            this.resolution = resolution;
            this.spacing = this.width / resolution;
            this.focalLength = focalLength || 0.8;
            this.range = 14;
            this.lightRange = 5;
            this.scale = (this.width + this.height) / 1200;
        }
        Camera.prototype.render = function (player, map) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawColumns(player, map);
        };
        Camera.prototype.drawColumns = function (player, map) {
            this.ctx.save();
            for (var column = 0; column < this.resolution; column++) {
                var x = column / this.resolution - 0.5;
                var angle = Math.atan2(x, this.focalLength);
                var ray = map.cast(player, player.direction + angle, this.range);
                this.drawColumn(column, ray, angle, map);
            }
            this.ctx.restore();
        };
        Camera.prototype.drawColumn = function (column, ray, angle, map) {
            var ctx = this.ctx;
            var left = Math.floor(column * this.spacing);
            var width = Math.ceil(this.spacing);
            var hit = -1;
            while (++hit < ray.length && ray[hit].height <= 0)
                ;
            for (var s = ray.length - 1; s >= 0; s--) {
                var step = ray[s];
                if (s === hit) {
                    var wall = this.project(step.height, angle, step.distance);
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = '#636F57';
                    // ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
                    ctx.fillRect(left, wall.top, width, wall.height);
                    // ctx.fillStyle = '#000000';
                    // ctx.globalAlpha = Math.max((step.distance + step.shading) / this.lightRange - map.light, 0);
                    // ctx.fillRect(left, wall.top, width, wall.height);
                }
            }
        };
        Camera.prototype.project = function (height, angle, distance) {
            var z = distance * Math.cos(angle);
            // var wallHeight = this.height * height / z;
            var wallHeight = 240 * height / z;
            var bottom = this.height / 2 * (1 + 1 / z);
            return {
                top: bottom - wallHeight,
                height: wallHeight
            };
        };
        return Camera;
    }());
    RCEngine.Camera = Camera;
})(RCEngine || (RCEngine = {}));
var RCEngine;
(function (RCEngine) {
    /**
     * The main game class.
     */
    var Engine = /** @class */ (function () {
        function Engine(canvas) {
            this.lastTime = 0;
            this.player = new RCEngine.Player(15.3, -1.2, Math.PI * 0.3);
            this.map = new RCEngine.Map(32);
            this.map.randomize();
            this.controls = new RCEngine.Controls();
            this.camera = new RCEngine.Camera(canvas, 320, 0.8);
        }
        Engine.prototype.run = function () {
            var _this = this;
            var frame = function (seconds) {
                _this.map.update(seconds);
                _this.player.update(_this.controls, _this.map, seconds);
                _this.camera.render(_this.player, _this.map);
                requestAnimationFrame(frame);
            };
            frame(0);
        };
        return Engine;
    }());
    RCEngine.Engine = Engine;
})(RCEngine || (RCEngine = {}));
var game = new RCEngine.Engine(document.getElementById("main"));
game.run();
//# sourceMappingURL=app.js.map