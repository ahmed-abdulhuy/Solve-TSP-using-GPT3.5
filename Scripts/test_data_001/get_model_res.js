/**
 * In this file we expect to set model tsp-001 temperature to high value
 * and get 11 responses for each response.
 */
import { createPrompt, getFileContent, getPreviousResponses, makeRequest, writeDataToFile } from '../utilities.js';


function main() {
    const chunk = 27;
    const prevChunk = 22;
    const fileName = "../../generated_data/test_data.json";
    const testData = getFileContent(fileName);
    const promptChunks = createPromptChunks(testData);
    const responseFileName = `../../generated_data/test_self_consistency/model_responses_${prevChunk}.json`;
    const newResponseFileName = `../../generated_data/test_self_consistency/model_responses_${chunk}.json`;
    const modelName = "ft:gpt-3.5-turbo-0125:kfupm:tsp-001:8zWmjfNu";


    const testChunks = {[chunk]: promptChunks[chunk]};
    // console.log(Object.keys(testChunks));
    collectResponses(testChunks, responseFileName, newResponseFileName, modelName);


    // collectResponses(promptChunks, responseFileName, modelName);
    // console.log(Object.keys(promptChunks[5]));
    // console.log(promptChunks[5])

}


function createPromptChunks(dataObj) {
    const promptChunks = {};
    for(let chunk_size in dataObj) {
        const promptChunk = dataObj[chunk_size].map(createPrompt);
        promptChunks[chunk_size] = promptChunk.map(prompt => prompt.messages);
    }
    return promptChunks;
}



// collect 11 responses for each prompt
async function collectResponses(promptChunks, responseFileName, newResponseFileName, modelName) {
    let responsesChunks = getPreviousResponses(responseFileName);
    let requestCounter = 0;
    const temperature = 0.7;

    for(let chunk in promptChunks) {
        const promptChunk = promptChunks[chunk];
        await Promise.all(promptChunk.map( async (prompt, idx) => {
            for (let c=0; c<11; c++) {

                // check how many previous responses exist
                console.log(`*********Handle ${chunk}_${idx}_${c}********`);
                let prevResExist = responsesChunks[chunk] && responsesChunks[chunk].filter( res => res.requestId == idx)
                console.log("Existing responses:",  prevResExist && prevResExist.length); ;
                if(prevResExist && prevResExist.length >= 11) return;
    
                // start making requests
                try {
                    const response = await makeRequest(prompt, modelName, temperature, idx)
                    requestCounter++;
                    if(response) {
                        console.log(`request{${chunk}_${idx}_${c}} succeed`,)
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
                    writeDataToFile(responsesChunks, newResponseFileName);
                }
            }
            
        }))
        console.log(`number of new requests: ${requestCounter}`)
        writeDataToFile(responsesChunks, newResponseFileName);
    }
}


main();