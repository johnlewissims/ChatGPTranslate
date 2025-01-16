class CursorTracker {
    constructor() {
        this.cursorPosition = { x: 0, y: 0 };
    }

    init() {
        document.addEventListener('mousemove', (event) => {
            this.cursorPosition = { x: event.clientX, y: event.clientY };
        });
    }

    getPosition() {
        return {
            ...this.cursorPosition,
            scrollX: window.scrollX,
            scrollY: window.scrollY,
        };
    }
}

export default new CursorTracker();
