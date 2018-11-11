namespace RCEngine {
    export class Controls {
        private _states: { [key: string]: true };

        constructor() {
            this._states = {};
            document.addEventListener('keydown', (ev) => {
                this._states[ev.key] = true;
            });
            document.addEventListener('keyup', (ev) => {
                delete this._states[ev.key];
            });
        }

        public get states(): { [key: string]: boolean } {
            return this._states;
        }
    }
}
