import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
async function main() {
    const fileName = "../generated_data/test_data.json";
    const file = await fs.promises.readFile(fileName, 'utf-8');
    const data = JSON.parse(file);
    const promptChunks = createPromptChunks(data);
    const responseFileName_tsp_001 = "../generated_data/tsp-001-test.json";
    const responseFileName_tsp_021 = "../generated_data/tsp-021-test.json";
    const modelName_tsp_001 = "ft:gpt-3.5-turbo-0125:kfupm:tsp-001:8zWmjfNu";
    const modelName_tsp_021 = "ft:gpt-3.5-turbo-0125:kfupm:tsp-021:9AhTYUsZ";

    const testChunks = {};
    for(let chunk in promptChunks) {
        testChunks[chunk] = promptChunks[chunk].slice(0, 1);
    }

    // collectResponses(testChunks, responseFileName_tsp_001, modelName_tsp_001);
    // collectResponses(testChunks, responseFileName_tsp_021, modelName_tsp_021);
    
    await collectResponses(promptChunks, responseFileName_tsp_001, modelName_tsp_001);
    console.log("##############################################");
    console.log("### TSP-001 Done ###");
    console.log("##############################################");
    await collectResponses(promptChunks, responseFileName_tsp_021, modelName_tsp_021);
    console.log("##############################################");
    console.log("### TSP-021 Done ###");
    console.log("##############################################");
    
}

function createPromptChunks(dataObj) {
    const promptChunks = {};
    for(let chunk_size in dataObj) {
        const promptChunk = dataObj[chunk_size].map(createPrompt);
        promptChunks[chunk_size] = promptChunk;
    }
    return promptChunks;
}

function createPrompt(points) {
    const systemMessage = `In two-dimensional space, you will visit variable number of stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".

Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.

Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total travelling distance of the journey. At last, Sum the distances between the stations according to the order you find.

The answer format should be as follows: Stations' order with minimum total traveling distance.`;

    let userMessage = '';
    points.map((station, idx) => {
        if(idx < points.length - 1)
            userMessage += `station ${idx} ( ${station[0]}, ${station[1]} ), `;
        else
            userMessage += `and station ${idx} ( ${station[0]}, ${station[1]} ).`;
    });

    return {
        "messages": [
            {"role": "system", "content": systemMessage}, 
            {"role": "user", "content": userMessage}, 
        ]
    };


}

async function collectResponses(promptChunks, responseFileName, modelName) {
    let responsesChunks = getPreviousResponses(responseFileName);

    for(let chunk in promptChunks) {
        const promptChunk = promptChunks[chunk];
        await Promise.all(promptChunk.map( async (prompt, idx) => {
            console.log(`**************Handle ${chunk}_${idx}************`);
            let checkPrevResValidity = responsesChunks[chunk] && responsesChunks[chunk].filter( res => res.requestId == idx)[0]
            const validOrder = checkPrevResValidity && checkPrevResValidity.valid
            console.log("prev_res_valid:",  validOrder); ;
            if(validOrder) return;

            try {
                const response = await makeRequest(prompt, modelName, idx, chunk)
                if(response) {
                    if(!responsesChunks[chunk]) {
                        responsesChunks[chunk] = [response];
                    } else {
                        let prevResIdx = 0;
                        const getResponse = responsesChunks[chunk].filter( (res, i) => {
                            if(res.requestId == idx) {
                                prevResIdx = i;
                                return true;
                            }
                            return false;
                        });
                        if(getResponse && getResponse[0] && !getResponse[0].valid){
                            responsesChunks[chunk][prevResIdx] = response;   
                        } else {
                            responsesChunks[chunk].push(response);
                        }
                    }
                }
            } catch(err) {
                console.log("### Outer Error ###")
                console.log("chunk:", chunk);
                console.error(err);
                writePromptsToFiles(responsesChunks, responseFileName);
            }
        }))
        writePromptsToFiles(responsesChunks, responseFileName);
    }
}

function checkOrderValidity(order) {
    return order.length == (Math.max(...order) + 2);
}

async function makeRequest(prompt, modelName, idx, chunk) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const completion = await openai.chat.completions.create({
                    messages: prompt.messages,
                    model: modelName,
                    temperature: 0.0,
                });
                const assistantResponse = completion.choices[0].message;
                const order = getResponseOrder(assistantResponse);
                let response = {
                    response: assistantResponse,
                    minimum_distance_order: [],
                    requestId: idx,
                    valid: false,
                };
                if(order) {
                    response.minimum_distance_order = order

                    console.log("*** Request order exist ***");
                    if(checkOrderValidity(order)) {
                        console.log("*** Request order valid ***");
                        response.valid = true;
                    }
                }
                else {
                    console.log("*** Request order not exist ***");
                    console.log(assistantResponse);
                }
                console.log(`Order_${chunk}_${idx}:`, order)
                resolve(response);
            } catch (err) {
                console.log("*** request error ***");
                reject(err);
            }
        }, 1000 * idx);
    });
}

function getResponseOrder(response) {
    if(response && response.content) {
        const regex = /"(?:minimum_distance_|optimal_)?(?:order|path)"\s*:\s*\[(\s*\d+(?:,\s*\d+)*\s*)\]/;
        const match = response.content.match(regex);
        if (match && match[1]) {
            const order = JSON.parse(`[${match[1]}]`);
            return order;
        } 
    }
    return [];
}

function  writePromptsToFiles(responses, fileName) {
    const jsonData = JSON.stringify(responses, null, 2);
    
    fs.writeFile(fileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}

function getPreviousResponses(fileName) {
    try {
      // Check if the file exists synchronously
      fs.accessSync(fileName, fs.constants.F_OK);
      const file = fs.readFileSync(fileName, 'utf-8');
      let previousResponses = {};
      if(file.length > 0) {
          previousResponses = JSON.parse(file);
      }
      return previousResponses; // File exists
    } catch (err) {
      return {}; // File does not exist
    }
  }


main();
