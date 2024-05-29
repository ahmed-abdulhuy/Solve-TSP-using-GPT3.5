/***************************************
 * ---Script/generate_data.js---
 * This script generate data from the *.tsp files in TSLLib Dataset.
 * We get fixed size samples, one sample from each file.
****************************************/

import fs from "fs";
import path from "path";

// Function to read content of .tsp files
export async function GetSample(directoryPath) {

  const SAMPLE_SIZE = 10;
  let SAMPLE_START_IDX = 0;
  const maxSamplePerFile = 10;
  var dataSamples = [];

  try {
    const files = await fs.promises.readdir(directoryPath);

    // Filter files to only include those ending with '.tsp'
    const tspFiles = files.filter(file => path.extname(file).toLowerCase() === '.tsp');
    
    // Read content of each .tsp file
    for(const file of tspFiles) {
      const filePath = path.join(directoryPath, file);
      const fileContent = await fs.promises.readFile(filePath, 'utf8');

      const lines = fileContent.split('\n');
      const dataTypeEUC_2D = lines.filter(line => line.includes("EDGE_WEIGHT_TYPE"))[0].includes("EUC_2D");
      if(!dataTypeEUC_2D){
        continue;
      }

      const data = lines.filter(line => {
        return line.split(' ').filter(e => e !== '').every(e => !isNaN(e));
      })
    //   console.log("data size:", data.length)
        // console.log("data[0]:", data[0])
      const dataPoints = data.map( line => {
        return line.split(' ').filter(e => e != '').map(e => Number(e)).slice(1, 3);
      })
      //* Add random sample size here
      const sampleSize = getRandomSampleSize(9, 22);

      for(let i=0; (i+sampleSize < dataPoints.length); i+=sampleSize) {
        const sample = dataPoints.slice(i, i+sampleSize);
        let validSample = true;
        sample.forEach( point => {
          if(point.length!=2) {
            validSample = false;
          }
        });
        if(validSample) {
          dataSamples.push(sample);
        }
      }
    };
    
    console.log(`Number of samples: ${dataSamples.length}`);
    // console.log("First sample:", dataSamples[0]);
    return dataSamples;

  } catch (err) {
    console.error('Error reading files:', err);
    return [];
  }
}

function getRandomSampleSize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  

// GetSample('../TSPLIB/ALL_tsp/').then(samples => {
//   samples.forEach((sample, idx) => {
//     // console.log("sample size:", sample.length);
//     sample.forEach( d => {
//         if(d.length!=2) {
//             console.log(`At sample ${idx} Wrong point dimensions:`);
//             console.log(sample);
//             return;
//         }
//     })
//   })
// });