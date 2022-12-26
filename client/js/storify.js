import { Observable } from "/js/observable.js";

export class Storify extends Observable {
    constructor() {
        super();
        this.nodes = {}
    }
    loadDatabase() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("storify", 3);
            request.onsuccess = (event) => {
                this.db = event.target.result

                const transaction = this.db.transaction(["nodes"]);
                const objectStore = transaction.objectStore("nodes");
                const getRequest = objectStore.getAll()
                getRequest.onsuccess = (event) => {
                    if (event.target.result instanceof Array) {
                        event.target.result.forEach(row => {
                            this.nodes[row.uri] = row

                            this.notify(row.uri, row)
                        })
                    }
                    resolve(event.target.result)
                    console.log(this.nodes)
                }
                getRequest.onerror = (event) => {
                    console.error(event.target)
                }
            }
            request.onerror = (event) => {
                reject(event.target)
            }
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create an objectStore to hold information about our customers. We're
                // going to use "ssn" as our key path because it's guaranteed to be
                // unique - or at least that's what I was told during the kickoff meeting.
                const objectStore = db.createObjectStore("nodes");

                // Use transaction oncomplete to make sure the objectStore creation is
                // finished before adding data into it.
                objectStore.transaction.oncomplete = (event) => {
                    // Store values in the newly created objectStore.
                    resolve(db)
                };
            };
        })
    }
    upsertNode(node) {
        return new Promise(async (resolve, reject) => {
            let uri = node.uri ?? `${node?.service?.id ?? 'bungalow'}:${node.type}:${node.id}`
            let existingNode = this.nodes[uri]

            let newNode = node // lodash.merge(node, existingNode)
            if (!newNode.uri) {
                newNode.uri = uri
            }
            const transaction = this.db.transaction(["nodes"], "readwrite");
            const objectStore = transaction.objectStore("nodes");
            const updateRequest = objectStore.put({
                ...newNode,
                synced: new Date().getTime()
            }, uri)
            updateRequest.onsuccess = (event) => {
                this.nodes[uri] = newNode
                this.notify(uri, newNode)
                if (newNode.objects instanceof Array) {
                    Promise.all(newNode.objects.map(o => this.upsertNode(o))).then(results => {

                        resolve(newNode)
                    })
                } else {
                    resolve(newNode)
                }
            }
            updateRequest.onerror = (event) => {
                reject(event.target)
            }

        })
    }
    deleteNode(uri) {
        return new Promise((resolve, reject) => {
            if (this.nodes[uri]) {
                const node = this.nodes[uri]
                const newNode = {...node, deleted: true}
                const transaction = this.db.transaction(["nodes"], "readwrite");
                const objectStore = transaction.objectStore("nodes");
                const updateRequest = objectStore.put(newNode, uri)
                updateRequest.onsuccess = (event) => {
                    this.nodes[uri] = newNode
                    this.notify(uri, newNode)
                    resolve(newNode)
                }
                updateRequest.onerror = (event) => {
                    reject(event.target)
                }
            }
        })
    }
}
