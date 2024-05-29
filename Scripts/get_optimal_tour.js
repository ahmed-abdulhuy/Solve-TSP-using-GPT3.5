/*************************************** 
 *--- Scripts/get-optimal-tour.js ---
 * Create a json file with the optimal tour and the cost of the optimal tour
 * for each .tsp file in the directory
****************************************/

// import { GetSample } from "./generate_data.js";
import { GetSample } from "./generate_data_2.js";
import { getOptimalCost } from "./Exact_DP_TSP.js";
import fs from "fs";

async function main() {
    // Directory where your .tsp files are located
    const directoryPath = '../TSPLIB/ALL_tsp/';

    const samples = await GetSample(directoryPath);
    let cost;
    let data = [];
    let idx = 0;
    for(const sample of samples) {
        idx++;
        cost = getOptimalCost(sample);
        data.push({
            sample: sample,
            optimalTour: cost[1],
            cost: cost[0]
        })
    }
    const jsonData = JSON.stringify(data, null, 2);
    // const fileName = "../generated_data/data.json";
    const fileName = "../generated_data/data_2.json";

    fs.writeFile(fileName, jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    })

}

main();