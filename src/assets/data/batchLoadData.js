let arr = []
for(let i=0;i<950;i++){
    arr.push({
        id: `#00${i}`,
        index: i
    })
}

function batchLoad(startIndex, dataLen) {
    return new Promise((resolve) => {
        let endIndex = startIndex + dataLen;
        if (startIndex + dataLen > arr.length) {
            endIndex = arr.length;
        }
        let data = arr.slice(startIndex, endIndex); // 或使用 arr.concat()

        resolve([...data]);
    });
}

export default {arr, batchLoad}