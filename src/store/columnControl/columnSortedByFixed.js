export default function (columns) {
    let columnWithFixed = [];
    let columnNoFixed = [];

    columns.forEach((column) => {
        if (!("show" in column)) {
            column.show = true;
        }
        if (!("fixed" in column)) {
            column.fixed = false;
        } else if (column.fixed) {
            column.show = true;
        }

        if (column.fixed) {
            columnWithFixed.push(column);
        } else {
            columnNoFixed.push(column);
        }
    });

    columnWithFixed.forEach((column, index) => {
        column.order = index + 1;
    });
    columnNoFixed.forEach((column, index) => {
        column.order = index + 1 + columnWithFixed.length;
    });
    return [...columnWithFixed, ...columnNoFixed];
}