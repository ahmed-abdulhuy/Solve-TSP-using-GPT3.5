/**
 * In this file we expect to precess the responses collected from the model
 */

import { calculateTourDistance, checkOrderValidity, getFileContent, getResponseOrder, readChunkRandomData, writeDataToFile } from "../utilities.js";


function main() {
    const pointsFileName = "../../generated_data/test_data.json";
    const analysisFileName = "../../generated_data/test_self_consistency/randomness_analysis/randomness_analysis.json";
    const ZSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_zero_shot.json`;
    const FSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_few_shot.json`;
    const CoTZSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_CoT_zero_shot.json`;
    const CoTFSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_CoT_few_shot.json`;
    const pointsChunks = getFileContent(pointsFileName);
    const ZSTestChunks = getFileContent(ZSResponseFileName);
    const FSTestChunks = getFileContent(FSResponseFileName);
    const CoTZSTestChunks = getFileContent(CoTZSResponseFileName);
    const CoTFSTestChunks = getFileContent(CoTFSResponseFileName);
    const analysisData = getFileContent(analysisFileName);
    
    const processedZSResponsesFileName = "../../generated_data/test_in_context_learning/processed_zero_shot_responses.json";
    const processedCoTZSResponsesFileName = "../../generated_data/test_in_context_learning/processed_CoT_zero_shot_responses.json";
    const processedFSResponsesFileName = "../../generated_data/test_in_context_learning/processed_few_shot_responses.json";
    const processedCoTFSResponsesFileName = "../../generated_data/test_in_context_learning/processed_CoT_few_shot_responses.json";
    
    writeProcessedResponses(ZSTestChunks, pointsChunks, processedZSResponsesFileName, analysisData);
    writeProcessedResponses(CoTZSTestChunks, pointsChunks, processedCoTZSResponsesFileName, analysisData);
    writeProcessedResponses(FSTestChunks, pointsChunks, processedFSResponsesFileName, analysisData);
    writeProcessedResponses(CoTFSTestChunks, pointsChunks, processedCoTFSResponsesFileName, analysisData);


    // logInsight(ZSTestChunks, pointsChunks, analysisData);
    // logInsight(CoTZSTestChunks, pointsChunks, analysisData);
    // logInsight(FSTestChunks, pointsChunks, analysisData);
    // logInsight(CoTFSTestChunks, pointsChunks, analysisData);
}


function getProcessedOrdersChunks(responses, pointsChunks, analysisData) {
    const chunkSizeList = Object.keys(responses);
    let responseOrderChunks = {};
    chunkSizeList.forEach( chunkSize => {
        const chunkResponses = responses[chunkSize];
        const chunkPoints = pointsChunks[chunkSize];
        const responseAnalysisList = chunkResponses.map( response => {
            let responseAnalysis = {};
            responseAnalysis.requestId = response.requestId;
            responseAnalysis.order  = getResponseOrder(response.response.content);
            responseAnalysis.valid = responseAnalysis.order && checkOrderValidity(responseAnalysis.order, chunkSize);
            responseAnalysis.distance = responseAnalysis.valid ? calculateTourDistance(responseAnalysis.order, chunkPoints[responseAnalysis.requestId]) : Infinity;
            responseAnalysis.points = chunkPoints[response.requestId];

            if(analysisData[chunkSize]) {
                const index = analysisData[chunkSize].findIndex( data => data.requestId === responseAnalysis.requestId);
                responseAnalysis.optOrder = analysisData[chunkSize][index].optOrder;
                responseAnalysis.optDistance = analysisData[chunkSize][index].optDistance;
            }

            return responseAnalysis;
        });

        responseOrderChunks[chunkSize] = responseAnalysisList;
    })

    return responseOrderChunks;
}


function logInsight(testChunks, pointsChunks, analysisData) {
    const processedOrderChunks = getProcessedOrdersChunks(testChunks, pointsChunks, analysisData);
    // count number of responses with valid order
    let orderCount = 0;
    let responsesCount = 0;
    let validOrderCount = 0;
    let badDistance = 0;
    let countingObj = {};
    Object.keys(testChunks).forEach( chunkSize => {
        const chunk = processedOrderChunks[chunkSize];
        countingObj[chunkSize] = Array(30).fill(0);
        chunk.forEach( response => {
            responsesCount++;
            countingObj[chunkSize][response.requestId]++;
            if(response.order.length > 0) orderCount++;
            if(response.valid) validOrderCount++;
            if(response.responseDistance < response.optDistance) badDistance++;
        })
        // console.log("Chunk size:", chunkSize);
        // countingObj[chunkSize].forEach( (count, idx) => {
        //     console.log(`===${idx}: ${count}`)
        // })
    })
    
    console.log("Responses count:", responsesCount);
    console.log("order count:", orderCount);
    console.log("Valid order count:", validOrderCount);
    console.log("Bad distance:", badDistance);
    console.log("\n\n")
    // Object.keys(testChunks).forEach( chunkSize => {
    //     if(chunkSize != 10) return
    //     const chunk = processedOrderChunks[chunkSize];
    //     chunk.forEach( (response, idx) => {
    //         if(response.valid) {
    //             console.log('Valid_response_order', response.order)
    //         } else {
    //             console.log('Invalid_response_order', response.order)
    //             console.log('response_content:', testChunks[chunkSize][idx].response.content)
    //         }
    //         console.log('\n######################################\n')
    //     })

    // });

    Object.keys(testChunks).forEach( chunkSize => {
        const chunk = processedOrderChunks[chunkSize];
        chunk.forEach( (response, idx) => {
            if(!response.order) {
                console.log(testChunks[chunkSize][idx].response.content)
                console.log('\n######################################\n')
            } 
        })
    });
    
}


function writeProcessedResponses(testChunks, pointsChunks, fileName, analysisData) {
    const processedOrderChunks = getProcessedOrdersChunks(testChunks, pointsChunks, analysisData);
    writeDataToFile(processedOrderChunks, fileName);
    // console.log("keys:", Object.keys(processedOrderChunks[10][0]));
}


main();