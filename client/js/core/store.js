function makeid(numberOfChars=22) {
    /* From https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript */
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < numberOfChars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
}

/**
 * @class
 * We create a minimialist in-memory JSON database of
 * this key/value/store by utilizing a system where every table represents of an
 * 'uri' which is associated with an object with the two properties `index` (denotates how many rows added) and `ids` (the ids of the rows)
 * Rows are 'inserted' by the function below which takes the uri of the 'data table' and the row object.
 * The pure insertion is emulated by associating the row with the base table uri + ':<row_id>' which either
 * is the value of the id field of the row object or a random generated field.
 * @param {*} uri 
 * @param {*} row 
 */
export default class Store {
    constructor(storage) {
        this.storage = storage
        this.subscribers = []
        this.data = {}
        this.listeners = []
    }
    set(uri, value) {
        this.data[uri] = {
            ...value
        }
        this.storage.set(uri)
        this.notify(uri, value)
        this.emit()
    }
    replace(uri, value) {
        this.data[uri] = value
        this.storage.set(uri)
        this.notify(uri, value)
        this.emit()
    }
    /**
     * Inserts a new row to the 'store'
     */
    insert(uri, row, incremental=false) {
        let base = this.get(uri, {})
        if (!base.count) {
            base.count = 0
            base.ids = []
            base.objects = []
        }

        if (!(row instanceof Object)) {
            throw "Row must be an object, not null, array or string"
        }
        let newId = incremental ? base.count + 1 : makeid()
        if (('id' in row) && !incremental) {
            newId = row['id']                
        } else {
            row['id'] = newId
        }
        let rowUri = uri + ':' + row['id']
        this.set(rowUri, row)
        
        

        base.count += 1 // Increase row count
        base.ids.push(row['id'])        
        base.objects.push(row)
        this.set(uri, base)
        
    }
    get(uri, defaultValue=null) {
        var val = defaultValue
        try {
            val = this.storage.get(uri, defaultValue)
        } catch (e) {
            val = defaultValue
        }
        this.data[uri] = val
        return val
    }
    listen(callback) {
        this.listeners.push(callback)
    }
    emit() {
        for (let listener of this.listeners) {
            listener.call(this.data)
        }
    }
    subscribe(uri, callback) {
        this.subscribers.push({
            uri: uri,
            callback: callback
        })
    }
    notify(uri, data) {
        for (let subscriber of this.subscribers) {
            if (subscriber.uri.indexOf(uri) == 0) {
                subscriber.callback.call(data)
            }
        }
    }
}
