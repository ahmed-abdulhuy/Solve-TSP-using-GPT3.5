// analyze the data for self consistency
import { getDistant, getFileContent } from "./utilities.js";


function main() {
    const dataFileName = "../generated_data/test_self_consistency/processed_order.json";
    const rawDataFileName = "../generated_data/test_self_consistency/model_responses.json"
    const analysisFileName = "../generated_data/test_self_consistency/randomness_analysis/randomness_analysis.json";
    const rawData = getFileContent(rawDataFileName);
    const data = getFileContent(dataFileName);
    let analysisData = getFileContent(analysisFileName);
    const keys = Object.keys(data)



    let counter = 0
    keys.forEach(chunkSize => {
        const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
        if(chunkSize != 19) return  
        data[chunkSize].forEach((order, idx) => {
            if(! order.valid) {
                const points = chunkRandomData[order.requestId].points;
                const example = {
                    sample: points,
                    optimalTour: order.optOrder,
                    cost: order.optDistance
                }
                const response = rawData[chunkSize].find(response => response.requestId === order.requestId);
                const prompt = createPrompt(example);
                // if(counter < 39) {counter++;return;}
                // if(counter > 46) return
                counter++;
                // console.log(prompt);
                // console.log(response);

                // console.log('\n\n')
                
            }
        });
    });



    keys.forEach(chunkSize => {
        const {[chunkSize]: chunkRandomData} = readChunkRandomData(chunkSize);
        if(parseInt(chunkSize) != 10) return  
        data[chunkSize].forEach((order, idx) => {
            if(order.order) {
                // console.log(order.order[order.order.length-1])
                const points = chunkRandomData[order.requestId].points;
                const example = {
                    sample: points,
                    optimalTour: order.optOrder,
                    cost: order.optDistance
                }
                const response = rawData[chunkSize].find(response => response.requestId === order.requestId);
                const prompt = createPrompt(example);
                // if(counter < 39) {counter++;return;}
                // if(counter > 46) return
                counter++;
                console.log(prompt);
                console.log(response);

                console.log('\n\n')
                
            }
        });
    });
    
}

function readChunkRandomData(chunkSize) {
    const fileName = `../generated_data/random_test_data/chunk_${chunkSize}.json`;
    return getFileContent(fileName);
}



function createPrompt(example) {
    const systemMessage = `In two-dimensional space, you will visit variable number of stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".

Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.

Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total travelling distance of the journey. At last, Sum the distances between the stations according to the order you find.

The answer format should be as follows: distance matrix, Stations' order with minimum total traveling distance, and traveling distance.
`;

    let userMessage = '';
    example.sample.map( (station, idx) => {
        if(idx < example.sample.length - 1)
            userMessage += `station ${idx} ( ${station[0]}, ${station[1]} ), `;
        else
            userMessage += `and station ${idx} ( ${station[0]}, ${station[1]} ).`;
    });

    let assistantMessage = {};
    let distArr = JSON.stringify(getDistant(example.sample)).replace(/,/g, ', ');

    
    assistantMessage["distance_matrix"] = distArr;
    assistantMessage["minimum_distance_order"] = example.optimalTour;
    assistantMessage["traveling_cost"] = example.cost;

    // const promptOutput = JSON.stringify(answer);

    return {
        "messages": [
            {"role": "system", "content": systemMessage}, 
            {"role": "user", "content": userMessage}, 
            {"role": "assistant", "content": assistantMessage}
        ]
    };   
}

main();


