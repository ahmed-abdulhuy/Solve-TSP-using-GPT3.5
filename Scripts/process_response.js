import fs from "fs";

async function main() {
    const fileName = "../generated_data/tsp-001-test.json";
    const file = await fs.promises.readFile(fileName, 'utf-8');
    const dataChunks = JSON.parse(file);

    const tmp = dataChunks[5][0].response;
    
    const regex = /"(?:minimum_distance_)?order"\s*:\s*\[(\s*\d+(?:,\s*\d+)*\s*)\]/;
            // /"(?:minimum_distance_)?order"\s*:\s*\[(\s*-?\d+(\.\d+)?(?:,\s*-?\d+(\.\d+)?)*\s*)\]/;
    const match = tmp.content.match(regex);
    if (match && match[1]) {
        const order = JSON.parse(`[${match[1]}]`);
        console.log(order);
    } 
}

main();