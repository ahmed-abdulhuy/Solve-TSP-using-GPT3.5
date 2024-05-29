/**
 * We test zero-shot, few-shot, and Chain of thoughts technique
 */


import { getOptimalCost } from '../Exact_DP_TSP.js';
import { getDistant, getFileContent, getPreviousResponses, makeRequest, writeDataToFile } from '../utilities.js';


async function main() {
    const fileName = "../../generated_data/test_data.json";
    const analysisFileName = "../../generated_data/test_self_consistency/randomness_analysis/randomness_analysis.json";
    const testData = removeExtraChunks(getFileContent(fileName));
    const analysisData = getFileContent(analysisFileName);
    const promptChunks = createPromptChunks(testData, analysisData);


    const ZSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_zero_shot.json`;
    const FSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_few_shot.json`;
    const CoTZSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_CoT_zero_shot.json`;
    const CoTFSResponseFileName = `../../generated_data/test_in_context_learning/model_responses_CoT_few_shot.json`;
    const modelName = "gpt-3.5-turbo-0125";


    // const chunk = 10;
    // console.log(promptChunks['CoTFew-shot'][chunk][0])
    // collect zero-shot
    // const ZSTestChunks = {[chunk]: promptChunks['zero-shot'][chunk]};
    const ZSTestChunks = promptChunks['zero-shot'];
    await collectResponses(ZSTestChunks, ZSResponseFileName, modelName, 'zero-shot');
    
    // collect few-shot
    // const FSTestChunks = {[chunk]: promptChunks['few-shot'][chunk]};
    const FSTestChunks = promptChunks['few-shot'];
    await collectResponses(FSTestChunks, FSResponseFileName, modelName, 'few-shot');
    
    // collect zero-shot CoT
    // const CoTZSTestChunks = {[chunk]: promptChunks['CoTZero-shot'][chunk]};
    const CoTZSTestChunks = promptChunks['CoTZero-shot'];
    await collectResponses(CoTZSTestChunks, CoTZSResponseFileName, modelName, 'CoT-zero-shot');
    
    // collect few-shot CoT
    // const CoTFSTestChunks = {[chunk]: promptChunks['CoTFew-shot'][chunk]};
    const CoTFSTestChunks = promptChunks['CoTFew-shot'];
    await collectResponses(CoTFSTestChunks, CoTFSResponseFileName, modelName, 'CoT-few-shot');

}

function removeExtraChunks(dataObj) {
    const chunkSizeArr = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 27]
    let newDataObj = {};
    for(let chunk in dataObj) {
        if(chunkSizeArr.includes(parseInt(chunk))) {
            newDataObj[chunk] = dataObj[chunk];
        }
    }
    return newDataObj;
}


function createPromptChunks(dataObj, analysisData) {
    
    const numOfAssistantMessages = 5;
    const promptChunks = {
        'zero-shot': {},
        'few-shot': {},
        'CoTZero-shot': {},
        'CoTFew-shot': {}

    };

    for(let chunk_size in dataObj) {
        // create zero-shot prompt
        promptChunks['zero-shot'][chunk_size] = dataObj[chunk_size].map((points) => createPrompt([points], false));
        
        // create zero-shot CoT prompt
        promptChunks['CoTZero-shot'][chunk_size] = dataObj[chunk_size].map((points) => createPrompt([points], true));;
        
        if(! analysisData[chunk_size]) continue;

        promptChunks['few-shot'][chunk_size] = [];
        promptChunks['CoTFew-shot'][chunk_size] = [];
        
        for(let idx=0; idx<dataObj[chunk_size].length; idx++) {
            const pointsArr = [];
            const optOrderArr = [];
            for(let c = numOfAssistantMessages; c >= 0; c--) {
                const index = ( idx + c ) % dataObj[chunk_size].length;
                pointsArr.push(dataObj[chunk_size][index])
                optOrderArr.push({
                    optTour: analysisData[chunk_size][index].optOrder,
                    cost: analysisData[chunk_size][index].optDistance
                })
            }
            
            // create few-shot prompt
            promptChunks['few-shot'][chunk_size].push(createPrompt(pointsArr, false, optOrderArr));
            
            // create few-shot CoT prompt
            promptChunks['CoTFew-shot'][chunk_size].push(createPrompt(pointsArr, true, optOrderArr));
        }
    }

    return promptChunks;
}


export function createPrompt(journeys, useCot=true, optOrder={}) {

    let systemMessage = '';
    if(useCot) {
        systemMessage ='In two-dimensional space, you will visit variable number of stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".'
                            + 'Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.'
                            + "Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total traveling distance of the journey. At last, Sum the distances between the stations according to the order you find."
                            + "The answer format should strictly follows a json format with no description as follows: distance_matrix, Stations' order with minimum total traveling distance as minimum_distance_order, and traveling_cost.";

    } else {
        systemMessage ='In two-dimensional space, you will visit variable number of stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".'
                            + 'Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.'
                            + "The answer format should strictly follows a json format with no description as follows: distance_matrix, Stations' order with minimum total traveling distance as minimum_distance_order, and traveling_cost.";
            
    }
 
    let messages = [{"role": "system", "content": systemMessage}];
    const numOfAssistantMessages = journeys.length - 1;
    journeys.forEach((points, idx) => {
        points = points.map( p => [p[0]%100, p[1]%100]);
        let userMessage = '';
        points.map((station, idx) => {
            if(idx < points.length - 1)
                userMessage += `station ${idx} ( ${station[0]}, ${station[1]} ), `;
            else
                userMessage += `and station ${idx} ( ${station[0]}, ${station[1]} ).`;
        });
        
        messages.push({"role": "user", "content": userMessage});
        if(idx < numOfAssistantMessages) {
            let assistantMessage = {};
            const distArr = JSON.stringify(getDistant(points)).replace(/,/g, ', ');
            const {cost, optTour} = optOrder[idx];
            // const {cost, optTour} = getOptimalCost(points);
            
            assistantMessage["distance_matrix"] = distArr;
            assistantMessage["minimum_distance_order"] = optTour;
            assistantMessage["traveling_cost"] = cost;
            messages.push({"role": "assistant", "content": JSON.stringify(assistantMessage)});
        }
    
    });

    return messages;
}


async function collectResponses(promptChunks, responseFileName, modelName, promptType) {
    let responsesChunks = getPreviousResponses(responseFileName);
    let requestCounter = 0;
    const temperature = 0.7;
    const self_ensample = 11;    
    for(let chunk in promptChunks) {
        const promptChunk = promptChunks[chunk];
        await Promise.all(promptChunk.map( async (prompt, idx) => {
            for (let c=0; c < self_ensample; c++) {
                try {
                    // check how many previous responses exist
                    console.log(`*********Handle ${promptType}_${chunk}_${idx}_${c}********`);
                    const prevResExist = responsesChunks[chunk] && responsesChunks[chunk].filter( res => res.requestId == idx)
                    console.log("Existing responses:",  prevResExist && prevResExist.length); ;
                    if(prevResExist && prevResExist.length >= self_ensample) return;
                    
                    // start making requests
                    const response = await makeRequest(prompt, modelName, temperature, idx);
                    requestCounter++;
                    if(response) {
                        console.log(`request{${promptType}_${chunk}_${idx}_${c}} succeed`,)
                        console.log(`request num: ${requestCounter}`)
                        if(!responsesChunks[chunk]) {
                            responsesChunks[chunk] = [response];
                        } else {
                            responsesChunks[chunk].push(response);
                        }
                    }
                } catch(err) {
                    console.log("### Error ###")
                    console.error(err);
                    console.log(`number of new requests: ${requestCounter}`)
                    writeDataToFile(responsesChunks, responseFileName);
                }
            }
            
        }))
        console.log(`${promptType} number of new requests: ${requestCounter}`)
        writeDataToFile(responsesChunks, responseFileName);
    }
}


main();