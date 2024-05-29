import fs from "fs";
import jStat from "jStat";
import { calculateTourDistance } from "../generate_random_model_responses.js";

/**
 * we evaluate the p-value for the model responses distance 

 */

/**
 * {
 *  chunkSize: [
 *      {
 *          points: [ [x, y], [x, y], ...],
 *          tours: [{ pointsOrder: [0, 1, 2, ...], distance: #no}]
 *          referenceIndex: #no
 *      }
 *  ]
 * }
 */

function main() {

    const testData = readTestData();
    const modelResponses = readModelResponses();
    const chunkSizeList = Object.keys(testData);
    let analysis = {};
    chunkSizeList.forEach( chunkSize => {
        const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
        const modelResponsesChunk = modelResponses[chunkSize].sort( (a, b) => a.requestId - b.requestId);
        analysis[chunkSize] = {};
        modelResponsesChunk.forEach( (response, idx) => {   
            let pValue = 1;
            let order = getResponseOrder(response.content);
            let responseDistance = Infinity;
            const randomDistances = chunkRandomData[idx].tours.map((d) => d.distance);
            if(order && checkOrderValidity(order, chunkSize)) {
                const referenceIndex = chunkRandomData[idx].referenceIndex;
                const mean = jStat.mean(randomDistances);
                const std = jStat.stdev(randomDistances);
                responseDistance = calculateTourDistance(order, testData[chunkSize][referenceIndex]);
                pValue = jStat.ztest(responseDistance, mean, std, 1);
            }
            analysis[chunkSize][idx] = {
                pValue,
                order: order,
                responseDistance,
                randomDistances,
            }
        })
    })

    // Write analysis to file
    const fileName = "../generated_data/randomness_analysis.json";
    const jsonData = JSON.stringify(analysis, null, 2);
    fs.writeFile(fileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to validation file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}


function readTestData() {
    const fileName = "../generated_data/test_data.json";
    const file = fs.readFileSync(fileName, 'utf-8');
    const samples = JSON.parse(file);

    return samples;
}


function readModelResponses() {
    const fileName = "../generated_data/tsp-001-responses-old.json";
    const file = fs.readFileSync(fileName, 'utf-8');
    const modelResponses = JSON.parse(file);

    return modelResponses;
}

function readChunkRandomData(chunkSize) {
    const fileName = `../generated_data/random_test_data/chunk_${chunkSize}.json`;
    const file = fs.readFileSync(fileName, 'utf-8');
    const chunkRandomData = JSON.parse(file);

    return chunkRandomData;
}

function getResponseOrder(response) {
    let order = []
    if(response) {
        const regex = /"(?:minimum_distance_|optimal_)?(?:order|path)"\s*:\s*\[(\s*\d+(?:,\s*\d+)*\s*)\]/;
        const match = response.match(regex);
        if (match && match[1]) {
            order = JSON.parse(`[${match[1]}]`);  
        }
    }
    return order;
}


function checkOrderValidity(order, chunkSize) {
    let numCounts = Array(Number(chunkSize)).fill(0);
    let outOfOrder = []
    let validOrder = true;
    // Count occurrences of each number in the array
    order.forEach(num => {
        if(num < chunkSize) numCounts[num] += 1
        else outOfOrder.push(num)
    })

    // check out of order visits
    if(outOfOrder.length) validOrder = false;
    if(order[0] != 0 || order[order.length-1] !=0) validOrder = false;

    if(validOrder) {
        // Check visits status
        numCounts.forEach((num, idx) =>{
            if(idx == 0 && num != 2) validOrder = false;
            else if (idx && num != 1) validOrder = false;
        })
    }
  
    return validOrder;
}


main();
