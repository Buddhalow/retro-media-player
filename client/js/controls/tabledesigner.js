
	/**
     * Cretes a design for the table
     **/
    export default class SPTableDesigner {
        getCellElementAt(columnIndex, row) {
            let td = document.createElement('td');
            td.innerHTML = row[columnIndex];
            return td;
        }
        getRowElementAt(row) {
            // Returns row at index
            let tr = document.createElement('tr');
            return tr;
        }
        getColumnElementAt(row, column) {
            let th = document.createElement('th');
            return th;
        }
    }
