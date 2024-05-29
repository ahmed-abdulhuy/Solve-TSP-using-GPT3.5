/**
 * This is a draft file.
 */

import { getFileContent } from "./utilities.js";


function main() {
    const fileName = "../generated_data/data_2.json";
    const samples = getFileContent(fileName);
    const countJourneySizeCount = {}
    samples.forEach( sample => {
        if(countJourneySizeCount[sample.sample.length]) countJourneySizeCount[sample.sample.length]++;
        else countJourneySizeCount[sample.sample.length] = 1;
    })

    console.log(countJourneySizeCount);
    console.log(samples.length)

    
}

main();