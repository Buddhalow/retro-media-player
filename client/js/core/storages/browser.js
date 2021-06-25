import Storage from '/js/core/storage.js';
    export default class BrowserStorage extends Storage {
        get(id, defaultValue=null) {
            try {
                let val = JSON.parse(localStorage.getItem(id))
                if (!val) return defaultValue
                return val
            } catch (e) {
                return defaultValue
            }
        }
        set(id, value) {
            try {
                localStorage.setItem(id, JSON.stringify(value))
            } catch (e) {

            }
        }
    }
