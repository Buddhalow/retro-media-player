export default class SPDataSource {
    getObjectById(id) {
        return {};
    }
    get numberOfFields() {
        return 0;
    }
    getFieldByIndex(index) {
        return {
            type: 'string',
            name: 'Test'
        }
    }
    find(q) {
        return {
            objects: [{
                id: q,
                name: q
            }]
        };
    }
    saveOrUpdate(data) {
        
    }
    deleteObject(id) {
        
    }
}