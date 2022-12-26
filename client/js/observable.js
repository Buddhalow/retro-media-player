export class Observable {
    constructor() {
        this.observers = []
    }
    on(action, callback, data = null) {
        const listener = {
            action,
            callback,
            data
        }
        this.observers.push(listener)
        return listener;
    }
    notify(action, data) {
        const event = new CustomEvent(action);
        event.data = data
        for (let observer of this.observers) {
            if (observer.action === action) {
                observer.callback.call(
                    event
                )
            }
        }
    }
}