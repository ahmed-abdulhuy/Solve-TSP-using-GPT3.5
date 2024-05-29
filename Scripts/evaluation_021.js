/***************************************
 * --- Script/evaluation.js ---
 * This script is used to evaluate the model responses
 * We calculate the total distance of traveling
 * according to the points order from the model response using p-value
 ****************************************/
import fs from "fs";
import jStat from "jstat";
import { calculateTourDistance } from "./generate_random_model_responses.js";

/**
 * we evaluate the p-value for the model responses distance 

 */


function pValue() {

    const RandomResponsesFileName = "../generated_data/random_model_responses.json";
    const RandomResponsesFile = fs.readFileSync(RandomResponsesFileName);
    const randomResponses = JSON.parse(RandomResponsesFile);
    
    const fileName2 = "../generated_data/data.json";
    const file2 = fs.readFileSync(fileName2);
    const data2 = JSON.parse(file2);

    const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_021_Validation_Responses.json";
    const modelResponsesFile = fs.readFileSync(modelResponsesFileName);
    let modelResponses = JSON.parse(modelResponsesFile);

    modelResponses = removeBadResponses(modelResponses);
    console.log("modelResponses", modelResponses.length);

    const pValues = modelResponses.map( (modelResponse, idx) => {
        if(!modelResponse) return null;
        const randomResponse = randomResponses[idx];
        const referenceIndex = randomResponse[0].referenceIndex;
        const RandomDistances = randomResponse.map((d) => d.distance);
        const mean = jStat.mean(RandomDistances);
        const std = jStat.stdev(RandomDistances);
        const responseOrder = modelResponse["assistantResponse"].minimum_distance_order;
        if(!responseOrder || responseOrder.find( val => val < 0 || val >= data2[referenceIndex].sample.length)) return null;
        const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);
        const responseDistancePValue = jStat.ztest(responseDistance, mean, std, 1);

        return responseDistancePValue
        
    })


    
}

function removeBadResponses(modelResponses) {
    const regex = /"minimum_distance_order"\s*:\s*\[(\s*-?\d+(\.\d+)?(?:,\s*-?\d+(\.\d+)?)*\s*)\]/;
    const filteredResponses = [];
    modelResponses.map( (modelResponse) => {
        if(Object.keys(modelResponse).includes("assistantResponse")) {
            const match = modelResponse.assistantResponse.content.match(regex);
            if (match && match[1]) {
                const minimum_distance_order = match[1].split(",").map( (val) => parseFloat(val))            
                if(minimum_distance_order.length == Math.max(...minimum_distance_order) + 1) {
                    modelResponse.assistantResponse.minimum_distance_order =minimum_distance_order;
                    filteredResponses.push(modelResponse);
                }
            } 
        }
    })

    return filteredResponses;
}


pValue();