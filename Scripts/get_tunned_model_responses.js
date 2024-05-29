/***************************************
 * ---Script/get_tunned_model_responses.js---
 * This script is used to get the responses of the fine-tuned model gpt-3.5-turbo-0125.
 ****************************************/

import OpenAI from "openai";
import fs from "fs";
import { createGPTPromptLists } from "./gpt-3.5-turbo-0125.js";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

async function main() {
    
    const {validationPrompts} = await createGPTPromptLists();
    const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Validation_Responses.json";
    // const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Validation_Responses.json";
    // const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Validation_Responses.json";
    let PreviousResponses = [];
    if(doesFileExist(responseFileName)) {
        const file = await fs.promises.readFile(responseFileName, 'utf-8');
        PreviousResponses = JSON.parse(file);
    }
    const numberCreatedOfPrompts = PreviousResponses.length;
    const startIndex = numberCreatedOfPrompts;
    const endIndex = Math.min(startIndex + 100, validationPrompts.length);
    
    
    // const promptsRandomSample = selectRandomPrompts(validationPrompts, numberOfPrompts);
    const promptsSample = validationPrompts.slice(startIndex, endIndex);
    const newResponses = await Promise.all(promptsSample.map( async (prompt, idx) => {
        // Remove assistant message from the prompt.
        const assistant = prompt.messages.pop();
        
        const completion = await openai.chat.completions.create({
            messages: prompt.messages,
            // model: "ft:gpt-3.5-turbo-0125:kfupm:tsp-001:8zWmjfNu",
            model: "ft:gpt-3.5-turbo-0125:kfupm:tsp-002:95YLFLw6",
        });
        try {
            const assistantResponse = completion.choices[0].message;
            
            assistantResponse.content = JSON.parse(assistantResponse.content);
            return {
                assistantResponse: assistantResponse,
                expectedResponse: assistant
            }
        } catch {
            console.log("Error parsing response");
            console.log(completion.choices[0].message);
        }
    }));

    const responsesData = [...PreviousResponses, ...newResponses];
    
    console.log("number of responses:", responsesData.length);
    const jsonData = JSON.stringify(responsesData, null, 2);
    
    fs.writeFile(responseFileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}

function selectRandomPrompts(prompts, numberOfPrompts) {
    const selectedPrompts = [];
    for (let i = 0; i < numberOfPrompts; i++) {
        const randomIndex = Math.floor(Math.random() * prompts.length);
        selectedPrompts.push(prompts[randomIndex]);
    }
    return selectedPrompts;
}

function doesFileExist(filePath) {
    try {
      // Check if the file exists synchronously
      fs.accessSync(filePath, fs.constants.F_OK);
      return true; // File exists
    } catch (err) {
      return false; // File does not exist
    }
  }


main();