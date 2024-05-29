
/**
 * Don't include this file in the report.
 */

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

    // const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Validation_Responses.json";
    // const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Validation_Responses.json";
    const modelResponsesFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Validation_Responses.json";
    const modelResponsesFile = fs.readFileSync(modelResponsesFileName);
    const modelResponses = JSON.parse(modelResponsesFile);
    
    let goodResponses = 0;
    const pValues = modelResponses.map( (modelResponse, idx) => {
        if(!modelResponse) return null;
        const randomResponse = randomResponses[idx];
        const referenceIndex = randomResponse[0].referenceIndex;
        const optimalDistance = data2[referenceIndex].cost;
        const RandomDistances = randomResponse.map((d) => d.distance);
        const mean = jStat.mean(RandomDistances);
        const std = jStat.stdev(RandomDistances);
        const responseOrder = modelResponse["assistantResponse"]["content"].minimum_distance_order;
        if(!responseOrder || responseOrder.find( val => val < 0 || val >= data2[referenceIndex].sample.length)) return null;
        const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);
        const optimalDistancePValue = jStat.ztest(optimalDistance, mean, std, 1);
        const responseDistancePValue = jStat.ztest(responseDistance, mean, std, 1);
        const check = responseOrder.every( (val, index) => val === data2[referenceIndex].optimalTour[index] );

        const randomDistanceBelowResponses = RandomDistances.filter( (distance) => distance < responseDistance);
        const tmp = randomDistanceBelowResponses.length / modelResponses.length;
        console.log("tmp", tmp);   
        if(tmp < 0.05) goodResponses++;

        return responseDistancePValue
        
        // console.log("check", check);
        // console.log("mean", mean);
        // console.log("optimalDistance", optimalDistance);
        // console.log("responseDistance", responseDistance);
        // console.log("std", std);
        // console.log("length", length);
        // console.log("optimalDistanceZScore", optimalDistanceZScore);
        // console.log("p-value optimal distance", optimalDistancePValue);
        // console.log("responseDistanceZScore", responseDistanceZScore);
        // console.log("p-value response distance", responseDistancePValue);
        // console.log("============================================");
        // console.log("============================================\n\n");
    })

    // let goodResponses = 0;
    // let badResponses = 0;
    // pValues.forEach( (pValue, idx) => {
        // if(pValue < 0.05) goodResponses++;
        // else badResponses++;
    // });

    console.log(goodResponses);

    // console.log("good response");
    // pValues.forEach( (pValue, idx) => {
    //     if(!modelResponses[idx]) return;
    //     const referenceIndex = randomResponses[idx][0].referenceIndex;
    //     const optimalDistance = data2[referenceIndex].cost;
    //     const responseOrder = modelResponses[idx]["assistantResponse"]["content"].minimum_distance_order;
    //     const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);


    //     if(pValue < 0.05) {
    //         console.log("pValue", pValue);
    //         console.log("optimalDistance", optimalDistance);
    //         console.log("responseDistance", responseDistance);
    //         console.log("============================================");
    //         console.log("============================================\n\n");
    //     }
        
    // });
    // console.log("***********************************");
    // console.log("***********************************");
    // console.log("***********************************\n\n\n");

    // console.log("bad response");
    // pValues.forEach( (pValue, idx) => {
    //     if(!modelResponses[idx]) return;
    //     const referenceIndex = randomResponses[idx][0].referenceIndex;
    //     const optimalDistance = data2[referenceIndex].cost;
    //     const responseOrder = modelResponses[idx]["assistantResponse"]["content"].minimum_distance_order;
    //     const responseDistance = calculateTourDistance(responseOrder, data2[referenceIndex].sample);


    //     if(pValue >= 0.05) {
    //         console.log("pValue", pValue);
    //         console.log("optimalDistance", optimalDistance);
    //         console.log("responseDistance", responseDistance);
    //         console.log("============================================");
    //         console.log("============================================\n\n");
    //     }
        
    // });
    
    // console.log("number of good responses:", goodResponses);
    // console.log("number of bad responses:", badResponses);
}

pValue();