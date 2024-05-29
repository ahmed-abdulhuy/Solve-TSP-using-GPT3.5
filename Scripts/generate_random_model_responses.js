/***************************************
 * ---Script/generate_random_model_responses.js---
 * This script is used to generate random model responses for testing purposes.
 * We will generate 1000 random examples for each tour.
 * each example is points order and tour distance.
 ****************************************/

import fs from "fs";
import { measureDistant } from "./Exact_DP_TSP.js";


export async function createRandomModelResponses() {
    
    const examplesList = await getPointsFromJson();
    
    const randomSamples = examplesList.map((example, idx) => {
        const toursList = [];
        for (let i = 0; i < 1000; i++) {
            const points = example.sample;
            const randomPointsOrder = shufflePointsOrder(points);
            const distance = calculateTourDistance(randomPointsOrder, points);
            toursList.push({
                points: points,
                pointsOrder: randomPointsOrder,
                distance: distance,
                referenceIndex: 400 + idx
            });
        }
        return toursList;
    });

    const jsonData = JSON.stringify(randomSamples, null, 2);
    fs.writeFile("../generated_data/random_model_responses.json", jsonData, 'utf8', (err) => {
        if(err) {
            console.error('Error writing to validation file:', err);
            return;
        }
        console.log('Data written to file successfully.');
    });
}


function shufflePointsOrder(points) {
    let indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let pointsOrder = [0];
    while(indices.length > 0) {
        const randomIndex = Math.floor(Math.random() * indices.length);
        const index = indices[randomIndex];
        indices.splice(randomIndex, 1);
        pointsOrder.push(index);
    }
    pointsOrder.push(0);
    return pointsOrder;
}

export function calculateTourDistance(pointsOrder, points) {
    let distance = 0;
    for( let i = 1; i < pointsOrder.length; i++) {
        const point1 = pointsOrder[i-1];
        const point2 = pointsOrder[i];
        distance += measureDistant(points[point1], points[point2]);
    }

    return distance;
}

export function getPointsFromJson() {

    const fileName = "../generated_data/data.json";
    const file = fs.readFileSync(fileName, 'utf-8');
    const samples = JSON.parse(file);

    return samples.slice(400);
}

// createRandomModelResponses();