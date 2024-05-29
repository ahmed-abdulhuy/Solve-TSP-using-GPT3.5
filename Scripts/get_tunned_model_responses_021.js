/***************************************
 * ---Script/get_tunned_model_responses.js---
 * This script is used to get the responses of the fine-tuned model gpt-3.5-turbo-0125.
 ****************************************/

import OpenAI from "openai";
import fs from "fs";
import { createGPTPromptLists } from "./gpt-3.5-turbo-0125-021.js";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

async function main() {
    const {validationPrompts} = await createGPTPromptLists();
    const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_021_Validation_Responses.json";
    let PreviousResponses = [];
    if(doesFileExist(responseFileName)) {
        const file = fs.readFileSync(responseFileName, 'utf-8');
        if(file.length > 0) {
            PreviousResponses = JSON.parse(file);
        }
    }
    const reqPromRefIdxList = PreviousResponses.map( obj => obj.referenceIndex);
    let responseList = [];
    await Promise.all(validationPrompts.map(async (prompt, idx) => {
        const referenceIndex = getReferenceIndex(1, idx);
        if(!reqPromRefIdxList.includes(referenceIndex)) {
            try {
                const response = await makeRequest(prompt, idx)
                if(response.assistantResponse) {
                    response.referenceIndex = referenceIndex;
                    console.log(`Prompt ${referenceIndex} completed`);
                    responseList.push(response);
                }
            } catch(err) {
                console.log("### Catch block ###")
                console.error(err);
                console.log("responses List", responseList.length)
                writePromptsToFiles(responseList);
            }
        }
    }))
    console.log("responses List", responseList.length)
    writePromptsToFiles(responseList);
}

function getReferenceIndex(type, index) {
    const typeStartIndex = [0, 3432, 5393]
    const offset = typeStartIndex[type];
    return offset + index;    
}

async function makeRequest(prompt, idx) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            // Remove assistant message from the prompt.
            const assistant = prompt.messages.pop();
            let response = {};
                
            try {
                const completion = await openai.chat.completions.create({
                    messages: prompt.messages,
                    // model: "ft:gpt-3.5-turbo-0125:kfupm:tsp-001:8zWmjfNu",
                    // model: "ft:gpt-3.5-turbo-0125:kfupm:tsp-002:95YLFLw6",
                    model: "ft:gpt-3.5-turbo-0125:kfupm:tsp-021:9AhTYUsZ",
                    temperature: 0.0,
                });
                const assistantResponse = completion.choices[0].message;
                
                if(assistantResponse.content) {
                    response = {
                        assistantResponse: assistantResponse,
                        expectedResponse: assistant
                    }
                }
                console.log("*** Success ***")
            } catch (err) {
                console.log("*** Error ***")
                // console.log(err);
                reject(err);
            }
            resolve(response);
        }, 1000 * idx);
    });
}

function  writePromptsToFiles(newResponses) {
    const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_021_Validation_Responses.json";
    let previousResponses = [];
    if(doesFileExist(responseFileName)) {
        const file = fs.readFileSync(responseFileName, 'utf-8');
        if(file.length > 0) {
            previousResponses = JSON.parse(file);
        }
    }
    if(!previousResponses) {
        previousResponses = [];
    }
    console.log("previousResponses", previousResponses.length)
    console.log("newResponses List", newResponses.length)
    const reqPromRefIdxList = previousResponses.map( obj => obj.referenceIndex);
    // const responses = [...PreviousResponses, ...newResponses];
    const responses = [...previousResponses];
    newResponses.forEach( obj => {
        if(!reqPromRefIdxList.includes(obj.referenceIndex)) {
            responses.push(obj);
        }
    });
    console.log("responses List", responses.length)
    // const jsonData = JSON.stringify(responses, null, 2);
    const jsonData = JSON.stringify(responses, null, 2);
    
    fs.writeFile(responseFileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
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