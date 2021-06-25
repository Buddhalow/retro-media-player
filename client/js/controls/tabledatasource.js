
    export default class SPTableDataSource {
        get numberOfRows () {
            return 0;
        }
        get numberOfColumnHeaders () {
            return 0;
        }
        getRowAt(rowId, row) {
            throw "NotImplementedException"
        }
        getColumnAt(pos) {
            throw "NotImplementedException"
        }
        getNumberOfChildren(row) {
            return 0;
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
