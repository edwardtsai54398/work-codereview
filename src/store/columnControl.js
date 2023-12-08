export default {
    namespaced: true,
    state: {
        tables: {},
    },
    getters: {},
    mutations: {
        setColumnSortedByFixed(state, { tableName, props }) {
            if (!state.tables[tableName]) {
                state.tables[tableName] = [];
            }
            let columnWithFixed = [];
            let columnNoFixed = [];

            props.forEach((column) => {
                if (!("show" in column)) {
                    column.show = true;
                }
                if (!("fixed" in column)) {
                    column.fixed = false;
                } else if(column.fixed){
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
            state.tables[tableName] = [...columnWithFixed, ...columnNoFixed];
        },
        setColumnShow(state, { tableName, columnName }) {
            if (Array.isArray(state.tables[tableName])) {
                let column = state.tables[tableName].find(
                    (column) => columnName === column.columnName
                );
                column.show = !column.show;
                if(column.fixed){
                    column.fixed = false
                    this.commit("columnControl/setColumnSortedByFixed", {
                        tableName,
                        props: state.tables[tableName]
                    })
                }
            }
        },
        setMovedNewOrder(state, { tableName, e }) {
            if (Array.isArray(state.tables[tableName])) {
                let groupStartOrder = 1;
                if (!e.element.fixed) {
                    groupStartOrder = state.tables[tableName].filter((column) => {
                        return column.fixed;
                    }).length + 1;
                }
                let moveColumn = state.tables[tableName].find((column) => e.element.columnName === column.columnName);

                let newOrder = e.newIndex + groupStartOrder;
                let oldOrder = e.oldIndex + groupStartOrder;
                if (oldOrder > newOrder) {
                    state.tables[tableName].forEach((column) => {
                        if (column.order < oldOrder && column.order >= newOrder) {
                            column.order += 1;
                        }
                    });
                } else if (oldOrder < newOrder) {
                    state.tables[tableName].forEach((column) => {
                        if (column.order > oldOrder && column.order <= newOrder) {
                            column.order -= 1;
                        }
                    });
                }
                moveColumn.order = newOrder;
            }

            this.commit("columnControl/reorderColumn", {
                tableName,
            });
        },
        setAddedNewOrder(state, { tableName, e }){
            if (Array.isArray(state.tables[tableName])) {
                let moveColumn = state.tables[tableName].find((column) => e.element.columnName === column.columnName);
                let groupStartOrder = 1

                if(moveColumn.fixed){
                    groupStartOrder = state.tables[tableName].filter((column)=>{
                        return column.fixed
                    }).length
                }
                console.log("newIndex", e.newIndex);
                let newOrder = e.newIndex + groupStartOrder
                let oldOrder = moveColumn.order
                console.log(oldOrder, newOrder);
                if (oldOrder > newOrder) {
                    state.tables[tableName].forEach((column) => {
                        if (column.order < oldOrder && column.order >= newOrder) {
                            column.order += 1;
                        }
                    });
                } else if (oldOrder < newOrder) {
                    state.tables[tableName].forEach((column) => {
                        if (column.order > oldOrder && column.order <= newOrder) {
                            column.order -= 1;
                        }
                    });
                }
                moveColumn.order = newOrder;
                console.log(state.tables[tableName]);
                moveColumn.fixed = !moveColumn.fixed
                this.commit("columnControl/reorderColumn", {
                    tableName,
                });
                if(moveColumn.fixed){

                    this.commit("columnControl/setColumnSortedByFixed", {
                        tableName,
                        props: state.tables[tableName]
                    });
                }
            }
        },
        reorderColumn(state, { tableName }) {
            for (let i = 0; i < state.tables[tableName].length; i++) {
                for (let j = i + 1; j < state.tables[tableName].length; j++) {
                    if (
                        state.tables[tableName][i].order >
                        state.tables[tableName][j].order
                    ) {
                        let temp = { ...state.tables[tableName][i] };
                        state.tables[tableName][i] = {
                            ...state.tables[tableName][j],
                        };
                        state.tables[tableName][j] = { ...temp };
                    }
                }
            }
            console.dir(state.tables[tableName]);
        },
    },
    actions: {},
    modules: {},
};
