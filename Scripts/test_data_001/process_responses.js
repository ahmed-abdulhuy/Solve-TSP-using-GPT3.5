/**
 * In this file we expect to precess the responses collected from the model
 */

import { calculateTourDistance, checkOrderValidity, getFileContent, getResponseOrder, writeDataToFile } from "../utilities.js";


function main() {
    const fileName = "../../generated_data/test_self_consistency/model_responses.json";
    const pointsFileName = "../../generated_data/test_data.json";
    const processedOrderFileName = "../../generated_data/test_self_consistency/processed_order.json";
    const pointsChunks = getFileContent(pointsFileName);
    const responses = getFileContent(fileName);
    let chunkSizeList = Object.keys(responses);
    let processedOrderChunks = getProcessedOrdersChunks(responses, pointsChunks);
    writeDataToFile(processedOrderChunks, processedOrderFileName);
    


    // count number of responses with valid order
    let orderCount = 0;
    let responsesCount = 0;
    let validOrderCount = 0;
    let countingObj = {};
    chunkSizeList.forEach( chunkSize => {
        const chunk = processedOrderChunks[chunkSize];
        countingObj[chunkSize] = Array(30).fill(0);
        chunk.forEach( response => {
            responsesCount++;
            countingObj[chunkSize][response.requestId]++;
            if(response.order.length > 0) orderCount++;
            if(response.valid) validOrderCount++;
        })
        console.log("Chunk size:", chunkSize);
        countingObj[chunkSize].forEach( (count, idx) => {
            console.log(`===${idx}: ${count}`)
        })
    })
    
    console.log("Responses count:", responsesCount);
    console.log("order count:", orderCount);
    console.log("Valid order count:", validOrderCount);
}


function getProcessedOrdersChunks(responses, pointsChunks) {
    const chunkSizeList = Object.keys(responses);
    let responseOrderChunks = {};
    
    chunkSizeList.forEach( chunkSize => {
        const chunkResponses = responses[chunkSize];
        const chunkPoints = pointsChunks[chunkSize];

        const responseOrderList = chunkResponses.map( response => {
            const content = response.response.content;
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


main();