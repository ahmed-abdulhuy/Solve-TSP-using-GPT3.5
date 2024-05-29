/***************************************
 * --- Scripts/check_model_response.js ---
 * This script is used to check the responses of fine tunned model gpt-3.5-turbo-0125.
 * Don't include this file in the report.
 ****************************************/

import fs from "fs";

async function main() {
    // const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_001_Validation_Responses.json";
    // const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_002_Validation_Responses.json";
    const responseFileName = "../generated_data/gpt-3.5-turbo-0125_TSP_011_Validation_Responses.json";
    const file = await fs.promises.readFile(responseFileName, 'utf-8');
    const responses = JSON.parse(file);

    const correctResponses = [];
    const incorrectResponses = [];


    responses.forEach( (response, idx) => {
        // Check if the order is the same in both responses.
        try {
            const {assistantResponse, expectedResponse} = response;
            const check = assistantResponse.content.minimum_distance_order
                .every( (val, index) => val === expectedResponse.content.minimum_distance_order[index] );

            console.log("**********************************");
            if(check) {
                console.log('%cThe order is correct', 'color: #bada55');
                console.log(idx);
                correctResponses.push(response);
            } 
            else {
                console.log('%cThe order is incorrect.', 'color: red');
                incorrectResponses.push(response);
            } 
            console.log("**********************************");
            
            console.log("assistant response order:", assistantResponse.content.minimum_distance_order);
            console.log("assistant response traveling cost:", assistantResponse.content.traveling_cost);
            console.log("expected response order:", expectedResponse.content.minimum_distance_order);
            console.log("expected response traveling cost:", expectedResponse.content.traveling_cost);
            console.log("============================================");
            console.log("============================================\n\n");

        } catch (error) {
            console.error("Error parsing response");
            console.error(response);
        }

        
    });


    console.log("number of correct responses:", correctResponses.length);
    console.log("number of incorrect responses:", incorrectResponses.length);
}

main();