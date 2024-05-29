import fs from "fs";
import { getDistant } from "./Exact_DP_TSP.js";

export async function createPromptList(filePath) {
    const prompt = `### Context ###
\`In two-dimensional space, you will visit 10 stations. You must visit each station once and return to the starting station at last. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".\`
    
### Instructions ### 
\`Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey\`.

\`Let’s work this out step-by-step to ensure we have the right answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total traveling distance of the journey. At last, Sum the distances between the stations according to the order you find.\`

### Stations ###
\`<stations>\`

### Answer Format ###
\`Distance matrix, Stations' order with minimum total traveling distance, and traveling distance.\`

### Answer ###
`;
    const file = await fs.promises.readFile(filePath, 'utf-8');
    const samples = JSON.parse(file);
    const promptInput = samples.map( (example) => {
        let stations = ''
        example.sample.map( (station, idx) => {
            if(idx < example.sample.length - 1)
                stations += `station ${idx} ( ${station[0]}, ${station[1]} ), `;
            else
            stations += `and station ${idx} ( ${station[0]}, ${station[1]} ).`;
        })

        return prompt.replace("<stations>", stations);
    });

    const promptOutput = samples.map((example, idx) => {
        let answer = {};
        const distArr = getDistant(example.sample);
        answer["distance_matrix"] = distArr;
        answer["minimum_distance_order"] = example.optimalTour;
        answer["traveling_cost"] = example.cost;

        return JSON.stringify(answer);
    })

    let prompts = []
    const prompts_no = Math.min(samples.length, 480);
    for (let i=0; i<prompts_no; i++) {
        prompts.push({
            input_text: promptInput[i],
            output_text: promptOutput[i]
        });
    }

    const fileName = "../generated_data/text-bison@002_TSP_001_bucket.jsonl";
    const lines = prompts.map( obj => JSON.stringify(obj));
    const content = lines.join('\n');

    fs.writeFile(fileName, content, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    })

    return prompts;
}

createPromptList("../generated_data/data.json").then(e=> console.log(e[0]));