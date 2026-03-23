const { resolve } = require('node:dns');
const fs = require('node:fs');
const { parse } = require('node:path');

const input = "../../frontend/beatmaps/sample.osu";

function parseMap(input) {

    return new Promise((resolve, reject) => {


        fs.readFile(input, 'utf8', (err, data) => {

            if (err) {
                console.error(err);
                reject(err);
                return;
            }

            const lines = data.split('\n');
            let currentSection = null;

            const metadata = {};
            const difficulty = {};
            const hitObjects = [];





            for (const text of lines) {

                const trimmed = text.trim();

                if (trimmed.startsWith('[') && trimmed.endsWith(']')) { // if we are at a section
                    currentSection = trimmed.slice(1, -1);
                } else if (trimmed == "") {
                    continue;
                } else {
                    // console.log("Line in " + currentSection + (": ") + trimmed);
                }

                // metadata
                if (currentSection === "Metadata") {
                    if (trimmed.includes(':')) {
                        const index = trimmed.indexOf(':');
                        const key = trimmed.slice(0, index);
                        const value = trimmed.slice(index + 1);
                        const trimmedKey = key.trim();
                        const trimmedValue = value.trim();

                        metadata[trimmedKey] = trimmedValue;

                    }

                }

                // difficulty
                if (currentSection === "Difficulty") {
                    if (trimmed.includes(':')) {
                        const index = trimmed.indexOf(':');
                        const key = trimmed.slice(0, index);
                        const value = trimmed.slice(index + 1);
                        const trimmedKey = key.trim();
                        const trimmedValue = value.trim();

                        difficulty[trimmedKey] = trimmedValue;


                    }

                }

                //hitObhjcts
                if (currentSection === "HitObjects") {
                    const hitCircles = trimmed.split(',');
                    if (hitCircles.length >= 4) {
                        let x = parseInt(hitCircles[0]);
                        let y = parseInt(hitCircles[1]);
                        let time = parseInt(hitCircles[2]);
                        let type = parseInt(hitCircles[3]);

                        const object = {
                            x: x,
                            y: y,
                            time: time,
                            type: type
                        }

                        hitObjects.push(object);

                    }


                }

            }

            const mapData = {
                metadata: metadata,
                difficulty: difficulty,
                hitObjects: hitObjects
            }


            resolve(mapData);
        })



    })


}

// async function getdata() {
//     console.log('fetching data..');

//     const result = await parseMap(input);

//     console.log(result);

//     return result;
// }

// getdata();

module.exports = parseMap;