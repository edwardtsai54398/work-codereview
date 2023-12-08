export {setColumnByIndex}
function setColumnByIndex(props) {
    let columnWithIndex = []
    let columnNoIndex = []

    props.forEach((column) => {
        if(!column.fixed){
            column.fixed = false
        }
        if (column.index) {
            columnWithIndex.push(column)
        } else {
            columnNoIndex.push(column)
        }
    })

    columnWithIndex.forEach((column, index) => {
        for (let i = 0; i < columnWithIndex.length - 1 - index; i++) {
            if (column.index > columnWithIndex[i + 1].index) {
                let temp = { ...column }
                columnWithIndex[i] = { ...columnWithIndex[i + 1] }
                columnWithIndex[i + 1] = { ...temp }
            }
        }
    })
    columnNoIndex.forEach((column, index)=>{
        column.index = index+1+columnWithIndex.length
    })
    return [...columnWithIndex, ...columnNoIndex]
}
