/**
 * In this file we expect to precess the responses collected from the model
 */

import { calculateTourDistance, checkOrderValidity, getFileContent, getResponseOrder, writeDataToFile } from "./utilities.js";
import jStat from 'jStat';


function main() {
    const fileName = "../generated_data/tsp-001-responses-old.json";
    const pointsFileName = "../generated_data/test_data.json";
    const analysisFileName = "../generated_data/test_self_consistency/randomness_analysis/randomness_analysis_consist1.json";
    const pointsChunks = getFileContent(pointsFileName);
    const responses = getFileContent(fileName);
    let data = getProcessedOrdersChunks(responses, pointsChunks);
    let chunkSizeList = ['5',   '10',  '11',  '12',  '13',  '14',
                        '15',  '16',  '17',  '18',  '19',  '20',
                        '21',  '22',  '27',  '32',];
    
    Object.keys(data).forEach(chunkSize => {
        if(!chunkSizeList.includes(chunkSize)) {
            delete data[chunkSize];
        }
    })
    chunkSizeList.forEach(chunkSize => {
      const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);      
      data[chunkSize].forEach((order, idx) => {
        const randomDistances = chunkRandomData[order.requestId].tours.map((d) => d.distance);
        order.random = jStat.stdev(randomDistances);
        order.mean = jStat.mean(randomDistances);
        data[chunkSize][idx] = order;
      })
    });
    writeDataToFile(data, analysisFileName);
}


function getProcessedOrdersChunks(responses, pointsChunks) {
    const chunkSizeList = Object.keys(responses);
    let responseOrderChunks = {};
    
    chunkSizeList.forEach( chunkSize => {
        const chunkResponses = responses[chunkSize];
        const chunkPoints = pointsChunks[chunkSize];

        const responseOrderList = chunkResponses.map( response => {
            const content = response.content;
            const requestId = response.requestId;
            const order  = getResponseOrder(content);
            const valid = order && checkOrderValidity(order, chunkSize);
            const distance = valid ? calculateTourDistance(order, chunkPoints[requestId]) : Infinity;
            return {order, distance, requestId, valid};
        });

        responseOrderChunks[chunkSize] = responseOrderList;
    })

    return responseOrderChunks;
} 

function readChunkRandomData(chunkSize) {
    const fileName = `../generated_data/random_test_data/chunk_${chunkSize}.json`;
    return getFileContent(fileName);
}
  
  
main();