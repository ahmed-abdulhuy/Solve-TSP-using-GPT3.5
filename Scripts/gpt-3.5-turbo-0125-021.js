/***************************************
 * ---Script/gpt-3.5-turbo-0125-021.js---
 * This file is used to create prompts to fine tune the GPT-3.5-turbo-0125 model.
 ****************************************/

import fs from "fs";
import { getDistant } from "./Exact_DP_TSP.js";

export async function createGPTPromptLists(logSize = 0) {
    
    // const fileName = "../generated_data/data.json";
    const fileName = "../generated_data/data_2.json";
    const file = await fs.promises.readFile(fileName, 'utf-8');
    const samples = JSON.parse(file);
    const prompts = samples.map(createPrompt);
    
    // We will start with 35% examples for tunning and 20% for validation and the rest for testing.
    
    const tunningPromptsSize = Math.floor(0.35 * prompts.length);
    const validationPromptsSize = Math.floor(0.20 * prompts.length);
    const testingPromptsSize = prompts.length - tunningPromptsSize - validationPromptsSize;
    // const validationPromptsSize = prompts.length - tunningPromptsSize;
    const tunningPrompts = prompts.slice(0, tunningPromptsSize);
    const validationPrompts = prompts.slice(tunningPromptsSize, tunningPromptsSize+validationPromptsSize);
    const testingPrompts = prompts.slice(tunningPromptsSize+validationPromptsSize);
    if(logSize) {
        console.log("tunningPrompts size:", tunningPrompts.length);
        console.log("validationPrompts size:", validationPrompts.length);
        console.log("testingPrompts size:", testingPromptsSize);
    }
  
    return {tunningPrompts, validationPrompts, testingPrompts};
}

function createPrompt(example) {
//     const systemMessage = `In two-dimensional space, you will visit 10 stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".

// Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.

// Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total travelling distance of the journey. At last, Sum the distances between the stations according to the order you find.

// The answer format should be as follows: distance matrix, Stations' order with minimum total traveling distance, and traveling distance.
// `;


//* this system message for models with variable number of stations
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

async function writePromptsToFiles() {

    /**We will use  oly 400 examples for tunning*/
    // const tunningFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Tunning.jsonl";
    // const validationFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Validation.jsonl";
    // const tunningFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Tunning.jsonl";
    // const validationFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Validation.jsonl";
    const tunningFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_021_Tunning.jsonl";
    const validationFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_021_Validation.jsonl";
    const {tunningPrompts, validationPrompts} = await createGPTPromptLists();
    
    const tunningPromptsLines = tunningPrompts.map( obj => {obj.messages[2].content = JSON.stringify(obj.messages[2].content); return JSON.stringify({messages: obj.messages})});
    const tunningPromptsContent = tunningPromptsLines.join('\n');

    const validationPromptsLines = validationPrompts.map( obj => {obj.messages[2].content = JSON.stringify(obj.messages[2].content); return JSON.stringify({messages: obj.messages})});
    const validationPromptsContent = validationPromptsLines.join('\n');
    

    fs.writeFile(tunningFileName, tunningPromptsContent, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to tunning file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });

    fs.writeFile(validationFileName, validationPromptsContent, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to validation file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}

// writePromptsToFiles();