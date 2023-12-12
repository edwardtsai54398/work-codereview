import columnSortedByFixed from './columnSortedByFixed.js'
export default {
    namespaced: true,
    state: {
        tables: {},
        oringinSetting: {},
        activeTab: {},
    },
    getters: {},
    mutations: {
        setActiveTab(state, { tableName, tab }) {
            if (!state.activeTab[tableName]) {
                state.activeTab[tableName] = {};
            }
            state.activeTab[tableName] = tab;
        },
        saveColumnSortedOringinal(state, { tableName, columns }) {
            if (tableName in state.activeTab) {
                if (!(tableName in state.oringinSetting)) {
                    state.oringinSetting[tableName] = {};
                }
                let tabName = state.activeTab[tableName]
                if (!(tabName in state.oringinSetting[tableName])) {
                    
                    this.commit("columnControl/setColumnSortedByFixed", {
                        tableName,
                        columns,
                    });
                    state.oringinSetting[tableName][tabName] = JSON.parse(JSON.stringify(state.tables[tableName][state.activeTab[tableName]]));
                }
            } else if (!(tableName in state.oringinSetting)) {
                this.commit("columnControl/setColumnSortedByFixed", {
                    tableName,
                    columns,
                });
                state.oringinSetting[tableName] = JSON.parse(JSON.stringify(state.tables[tableName]));
            }
        },
        setColumnSortedByFixed(state, { tableName, columns }) {
            if (!state.tables[tableName]) {
                if (state.activeTab[tableName] && !state.tables[tableName]) {
                    state.tables[tableName] = {};
                    state.tables[tableName][state.activeTab[tableName]] = [];
                } else {
                    state.tables[tableName] = [];
                }
            }
            
            if (state.activeTab[tableName]) {
                state.tables[tableName][state.activeTab[tableName]] = columnSortedByFixed(columns)
            } else {
                state.tables[tableName] = columnSortedByFixed(columns)
            }
        },
        setColumnShow(state, { tableName, columnName }) {
            let useActiveTab = tableName in state.activeTab;
            let columnTarget = state.tables[tableName];
            if (useActiveTab) {
                columnTarget = state.tables[tableName][state.activeTab[tableName]];
            }
            let column = columnTarget.find((column) => columnName === column.columnName);
            column.show = !column.show;
            if (column.fixed) {
                column.fixed = false;
                this.commit("columnControl/setColumnSortedByFixed", {
                    tableName,
                    columns: columnTarget,
                });
            }
        },
        setMovedNewOrder(state, { tableName, e }) {
            let useActiveTab = tableName in state.activeTab;
            let columnTarget = state.tables[tableName];
            let groupStartOrder = 1;
            if (useActiveTab) {
                columnTarget =
                    state.tables[tableName][state.activeTab[tableName]];
            }

            if (!e.element.fixed) {
                groupStartOrder =
                    columnTarget.filter((column) => column.fixed).length + 1;
            }
            let moveColumn = columnTarget.find(
                (column) => e.element.columnName === column.columnName
            );

            let newOrder = e.newIndex + groupStartOrder;
            let oldOrder = e.oldIndex + groupStartOrder;
            if (oldOrder > newOrder) {
                columnTarget.forEach((column) => {
                    if (column.order < oldOrder && column.order >= newOrder) {
                        column.order += 1;
                    }
                });
            } else if (oldOrder < newOrder) {
                columnTarget.forEach((column) => {
                    if (column.order > oldOrder && column.order <= newOrder) {
                        column.order -= 1;
                    }
                });
            }
            moveColumn.order = newOrder;

            this.commit("columnControl/reorderColumn", {
                tableName,
            });
        },
        setAddedNewOrder(state, { tableName, e }) {
            let useActiveTab = tableName in state.activeTab;
            let columnTarget = state.tables[tableName];
            if (useActiveTab) {
                columnTarget =
                    state.tables[tableName][state.activeTab[tableName]];
            }
            let moveColumn = columnTarget.find((column) => e.element.columnName === column.columnName);
            let groupStartOrder = 1;

            if (moveColumn.fixed) {
                groupStartOrder = columnTarget.filter((column) => {
                    return column.fixed;
                }).length;
            }
            let newOrder = e.newIndex + groupStartOrder;
            let oldOrder = moveColumn.order;
            if (oldOrder > newOrder) {
                columnTarget.forEach((column) => {
                    if (column.order < oldOrder && column.order >= newOrder) {
                        column.order += 1;
                    }
                });
            } else if (oldOrder < newOrder) {
                columnTarget.forEach((column) => {
                    if (column.order > oldOrder && column.order <= newOrder) {
                        column.order -= 1;
                    }
                });
            }
            moveColumn.order = newOrder;
            moveColumn.fixed = !moveColumn.fixed;
            this.commit("columnControl/reorderColumn", {
                tableName,
            });
            if (moveColumn.fixed) {
                this.commit("columnControl/setColumnSortedByFixed", {
                    tableName,
                    columns: columnTarget,
                });
            }
        },
        reorderColumn(state, { tableName }) {
            let useActiveTab = tableName in state.activeTab;
            let columnTarget = state.tables[tableName];
            if (useActiveTab) {
                columnTarget =state.tables[tableName][state.activeTab[tableName]];
            }
            for (let i = 0; i < columnTarget.length; i++) {
                for (let j = i + 1; j < columnTarget.length; j++) {
                    if (columnTarget[i].order > columnTarget[j].order) {
                        let temp = { ...columnTarget[i] };
                        columnTarget[i] = {
                            ...columnTarget[j],
                        };
                        columnTarget[j] = { ...temp };
                    }
                }
            }
        },
        setAllColumnsShow(state, { tableName }) {
            let useActiveTab = tableName in state.activeTab;
            let columnTarget = state.tables[tableName];
            if (useActiveTab) {
                columnTarget =state.tables[tableName][state.activeTab[tableName]];
            }
            columnTarget.forEach((column) => {column.show = true;});
        },
        resetColumn(state, { tableName }) {
            let useActiveTab = tableName in state.activeTab;
            let tabName = state.activeTab[tableName]
            if(useActiveTab){
                state.tables[tableName][tabName] = JSON.parse(JSON.stringify(state.oringinSetting[tableName][tabName]));
            }else{
                state.tables[tableName] = JSON.parse(JSON.stringify(state.oringinSetting[tableName]));
            }
        },
    },
    actions: {},
    modules: {},
};
