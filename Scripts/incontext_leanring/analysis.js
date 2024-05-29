// analyze the data for self consistency

import { range } from "d3";
import { getOptimalCost } from "../Exact_DP_TSP.js";
import { getFileContent, writeDataToFile, checkRandomness, readChunkRandomData } from "../utilities.js";
import jStat from 'jStat';


function main() {
  const processedZSResponsesFileName = "../../generated_data/test_in_context_learning/processed_zero_shot_responses.json";
  const processedCoTZSResponsesFileName = "../../generated_data/test_in_context_learning/processed_CoT_zero_shot_responses.json";
  const processedFSResponsesFileName = "../../generated_data/test_in_context_learning/processed_few_shot_responses.json";
  const processedCoTFSResponsesFileName = "../../generated_data/test_in_context_learning/processed_CoT_few_shot_responses.json";

  const ZSTestChunks = getFileContent(processedZSResponsesFileName);
  const CoTZSTestChunks = getFileContent(processedCoTZSResponsesFileName);
  const FSTestChunks = getFileContent(processedFSResponsesFileName);
  const CoTFSTestChunks = getFileContent(processedCoTFSResponsesFileName);  
  
  
  
  
}




main();
