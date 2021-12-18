
    export default class SPArrayDataSource {
        constructor(objects, columnheaders) {
            this.objects = objects
            this.columnheaders = columnheaders
        }
        get numberOfRows () {
            return this.objects.length;
        }
        get numberOfColumnHeaders () {
            return this.columnheaders;
        }
        getRowAt(rowId, row) {
            return this.objects[rowId]
        }
        getColumnAt(pos) {
            return this.columns[pos]
        }
        getNumberOfChildren(row) {
            if (row == null)
                return this.objects.length;
            return 0
        }
        request() {
            if (this.onchange instanceof Function) {
                this.onchange.call(this);
            }
        }
        /**
         * Returns wheter rows can be reordered or not
         * */
        get canReorderRows() {
            return false;
        }
        /**
         * Returns whether rows can be added or not
         * */
        get canAddRows() {
            return false;
        }
        /**
         * Returns whether rows can be deleted
         * */
        get canDeleteRows() {
            return false;
        }
        /**
         * Returns whether rows can be reordered or not
         * */
        get canEditRow() {
            return false;
        }
        /**
         * Occurs when rows are reordered
         * */
        reorderRows(indexes, newPos) {
            
        }
        
        getChildRowAt(parentRowId, rowId) {
            return null;
        }
        /**
         * Fetch next rows
         **/
        fetchNext() {
            // TODO Implement fetch next
        }
    }
