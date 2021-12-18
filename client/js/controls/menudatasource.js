
    export default class SPMenuDataSource {
        constructor(rows) {
            this.rows = rows;
        }
        getRowAt(index, parentRow) {
            if (parentRow != null) {
                return parentRow.rows.objects[index];
            }
            return this.rows[index];
        }
        getNumberOfRows(row) {
            if (!row) {
                row = {
                    rows: {
                        objects: this.rows
                    }
                }
            }   
            return row.rows.objects.length;
        }
    };
