import fs from 'fs';
import { createPrompt, getDistant, getFileContent } from '../utilities.js';

function main() {
    const fileName = "../../generated_data/data_2.json";
    const samples = getFileContent(fileName);
    const chunk15Point = samples.filter(sample => sample.sample.length === 15);
    const prompts = chunk15Point.map(getTrainingPrompt);
    WriteTrainingPromptsToFile(prompts, "../../generated_data/tsp_003/training_prompts_15.jsonl");
    // console.log(Object.keys(chunk15Point[0]));
    // console.log(getTrainingPrompt(chunk15Point[0]).messages[2])
}


function WriteTrainingPromptsToFile(prompts, fileName) {
    const trainingPromptsLines = prompts.map( obj => {obj.messages[2].content = JSON.stringify(obj.messages[2].content); return JSON.stringify({messages: obj.messages})});
    const trainingPromptsContent = trainingPromptsLines.join('\n');

    fs.writeFile(fileName, trainingPromptsContent, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to tunning file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });

}


function getTrainingPrompt(example) {
    const {sample, optimalTour, cost} = example;
    const prompt = createPrompt(sample);
    let assistantMessage = {};
    let distArr = JSON.stringify(getDistant(sample)).replace(/,/g, ', ');

    
    assistantMessage["distance_matrix"] = distArr;
    assistantMessage["minimum_distance_order"] = optimalTour;
    assistantMessage["traveling_cost"] = cost;

    prompt.messages.push({"role": "assistant", "content": assistantMessage})
    return prompt;
}


main();