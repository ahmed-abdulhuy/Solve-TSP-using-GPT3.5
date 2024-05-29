/***************************************
 * ---Script/gpt-3.5-turbo-0125-001.js---
 * This file is used to create prompts to fine tune the GPT-3.5-turbo-0125 model.
 * We will try to add space between integers of any number in the prompt.
 ****************************************/

import fs from "fs";
import { getDistant } from "./Exact_DP_TSP.js";

export async function createGPTPromptLists() {

  const fileName = "../generated_data/data.json";
  const file = await fs.promises.readFile(fileName, 'utf-8');
  const samples = JSON.parse(file);
  const prompts = samples.map(createPrompt);
  
  // We will start with 400 examples for tunning and 359 for validation.
  const tunningPrompts = prompts.slice(0, 400);
  const validationPrompts = prompts.slice(400);

  return {tunningPrompts, validationPrompts};
}

function createPrompt(example) {
    const systemMessage = 
`In two-dimensional space, you will visit 10 stations. You must visit each station once and return to the starting station at the end. Each station is represented with a 2-dimensional Cartesian point ( x, y ) where x is the coordinate on the X-axis and y is the coordinate on the Y-axis. The formula calculates the Euclidean distance between stations is " ( ( X1 - X2 ) ^ 2 + ( Y1 - Y1 ) ^ 2 ) ^ 0.5 ".

Your task is to find the visiting order for the stations that minimizes the total distance you will travel to finish the journey.

Let’s work this out step-by-step to ensure we have the correct answer. First, calculate the Euclidean distance between all pairs of stations using the Euclidean distance formula and make a matrix of the calculated distances. Then, compare all the possible stations' orders to find the order that costs the minimum total travelling distance of the journey. At last, Sum the distances between the stations according to the order you find.

The answer format should be as follows: distance matrix, Stations' order with minimum total traveling distance, and traveling distance.
`;

    let userMessage = '';
    const {sample, optimalTour, cost} = example;
    sample.map( (station, idx) => {
        const spacedStation = station.map(val => val.toString().split('').join(' '));
        if(idx < sample.length - 1)
            userMessage += `station ${idx} ( ${spacedStation[0]}, ${spacedStation[1]} ), `;
        else
            userMessage += `and station ${idx} ( ${spacedStation[0]}, ${spacedStation[1]} ).`;
    });

    let assistantMessage = {};
    const distArr = getDistant(sample);
    // add spaces between distArr values.
    const spacedDistArr = distArr.map( dist => dist.map(val => val.toString().split('').join(' ')));
    const spacedOptimalTour = optimalTour.map(val => val.toString().split('').join(' '));
    const spacedCost = cost.toString().split('').join(' ');

    assistantMessage["distance_matrix"] = spacedDistArr;
    assistantMessage["minimum_distance_order"] = spacedOptimalTour;
    assistantMessage["traveling_cost"] = spacedCost;

    // const promptOutput = JSON.stringify(answer);
    // console.log("************UserMessage************");
    // console.log(userMessage);
    // console.log("\n\n************assistantMessage************");
    // console.log(assistantMessage);

    return {
        "messages": [
            {"role": "system", "content": systemMessage}, 
            {"role": "user", "content": userMessage}, 
            {"role": "assistant", "content": JSON.stringify(assistantMessage)}
        ]
    };   
}

async function writePromptsToFiles() {

  /**We will use  oly 400 examples for tunning*/
  const tunningFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Tunning.jsonl";
  const validationFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Validation.jsonl";
  const {tunningPrompts, validationPrompts} = await createGPTPromptLists();
  
  const tunningPromptsLines = tunningPrompts.map( obj => JSON.stringify(obj));
  const tunningPromptsContent = tunningPromptsLines.join('\n');

  const validationPromptsLines = validationPrompts.map( obj => JSON.stringify(obj));
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

writePromptsToFiles();

// console.log(createPrompt({
//     "sample": [
//       [
//         288,
//         149
//       ],
//       [
//         288,
//         129
//       ],
//       [
//         270,
//         133
//       ],
//       [
//         256,
//         141
//       ],
//       [
//         256,
//         157
//       ],
//       [
//         246,
//         157
//       ],
//       [
//         236,
//         169
//       ],
//       [
//         228,
//         169
//       ],
//       [
//         228,
//         161
//       ],
//       [
//         220,
//         169
//       ]
//     ],
//     "optimalTour": [
//       0,
//       1,
//       2,
//       3,
//       8,
//       9,
//       7,
//       6,
//       5,
//       4,
//       0
//     ],
//     "cost": 174.88
//   }));