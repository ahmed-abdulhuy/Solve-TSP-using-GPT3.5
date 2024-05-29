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
    // const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Validation_Responses.json";
    // const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Validation_Responses.json";
    // const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Validation_Responses.json";
    const modelResponsesFile = fs.readFileSync(modelResponsesFileName);
    const modelResponses = JSON.parse(modelResponsesFile);
    
    
    const pValues = modelResponses.map( (modelResponse, idx) => {
        if(!modelResponse) return null;
        const randomResponse = randomResponses[idx];
        const referenceIndex = randomResponse[0].referenceIndex;
        const RandomDistances = randomResponse.map((d) => d.distance);
        const mean = jStat.mean(RandomDistances);
        const std = jStat.stdev(RandomDistances);
        const optimalDistance = data2[referenceIndex].cost;
        const responseOrder = modelResponse["assistantResponse"]["content"].minimum_distance_order;
        if(!responseOrder || responseOrder.find( val => val < 0 || val >= data2[referenceIndex].sample.length)) return null;
        const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);
        const optimalDistancePValue = jStat.ztest(optimalDistance, mean, std, 1);
        const responseDistancePValue = jStat.ztest(responseDistance, mean, std, 1);
        const check = responseOrder.every( (val, index) => val === data2[referenceIndex].optimalTour[index] );

        return responseDistancePValue
        
    })

    let goodResponses = 0;
    let badResponses = 0;
    pValues.forEach( (pValue, idx) => {
        if(pValue < 0.05) goodResponses++;
        else badResponses++;
    });

    console.log("good response");
    pValues.forEach( (pValue, idx) => {
        if(!modelResponses[idx]) return;
        const referenceIndex = randomResponses[idx][0].referenceIndex;
        const optimalDistance = data2[referenceIndex].cost;
        const responseOrder = modelResponses[idx]["assistantResponse"]["content"].minimum_distance_order;
        // console.log("responseOrder", responseOrder);
        // console.log("sample", data2[referenceIndex].sample);
        if(!responseOrder || responseOrder.find( val => val < 0 || val >= data2[referenceIndex].sample.length)) return null;
        const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);
        
        
        if(pValue < 0.05) {
            console.log("JourneyPoints", data2[referenceIndex].sample)
            console.log("JourneyMinX", Math.min(data2[referenceIndex].sample.map( point => point[0])));
            console.log("journeyMinY", Math.min(data2[referenceIndex].sample.map( point => point[1])));
            console.log("referenceIndex", referenceIndex);
            console.log("idx", idx)
            console.log("pValue", pValue);
            console.log("optimalDistance", optimalDistance);
            console.log("responseDistance", responseDistance);
            console.log("optimal order", data2[referenceIndex].optimalTour);
            console.log("response order", responseOrder);
            console.log("============================================");
            console.log("============================================\n\n");
        }
        
    });
    console.log("***********************************");
    console.log("***********************************");
    console.log("***********************************\n\n\n");

    // console.log("bad response");
    // pValues.forEach( (pValue, idx) => {
    //     if(!modelResponses[idx]) return;
    //     const referenceIndex = randomResponses[idx][0].referenceIndex;
    //     const optimalDistance = data2[referenceIndex].cost;
    //     const responseOrder = modelResponses[idx]["assistantResponse"]["content"].minimum_distance_order;
    //     if(!responseOrder || responseOrder.find( val => val < 0 || val >= data2[referenceIndex].sample.length)) return null;
    //     const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);

    //     if(pValue >= 0.05) {
    //         console.log("referenceIndex", referenceIndex);
    //         console.log("pValue", pValue);
    //         console.log("optimalDistance", optimalDistance);
    //         console.log("responseDistance", responseDistance);
    //         console.log("============================================");
    //         console.log("============================================\n\n");
    //     }
        
    // });
    
    console.log("number of good responses:", goodResponses);
    console.log("number of bad responses:", badResponses);
}

pValue();