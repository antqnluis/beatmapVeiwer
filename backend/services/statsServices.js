const parseMap = require('./parserService.js');

const map = "../../frontend/beatmaps/sample.osu"; //change to content later


async function getStats() {

    console.log("Getting Data...");
    const mapData = await parseMap(map);

    //total hitobjects
    const hitObjects = mapData.hitObjects;
    const totalNotes = hitObjects.length;
    // console.log("Total Objects = " + totalNotes);

    //length in mins
    if (mapData.hitObjects[0] == null) {
        console.log("Invalid value err");
        return;
    }
    const start = mapData.hitObjects[0].time;
    const end = mapData.hitObjects[hitObjects.length - 1].time;

    const ms = end - start;

    const mins = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);

    const duration = mins + ":" + (seconds < 10 ? '0' : '') + seconds;

    // console.log("Time in minutes = " + duration);
    // calculating object types
    let circleCount = 0;
    let sliderCount = 0;
    let spinnerCount = 0;

    for (const object of hitObjects) {
        if ((object.type & 1) != 0) {
            circleCount++;
        } else if ((object.type & 2) != 0) {
            sliderCount++;
        } else if ((object.type & 8) != 0) {
            spinnerCount++;
        }
    }
    //note density?

    const density = totalNotes / (ms / 1000);

    // SECTION DENSITY

    const windowSize = 5000; // 5 seconds
    const densityList = [];
    let currentTime = start;

    while (currentTime < end) {
        const windowEnd = currentTime + windowSize;
        let count = 0;
        for (const object of hitObjects) {
            if (object.time >= currentTime && object.time < windowEnd) {
                count++;
            }
        }
        const densityWindow = count / (windowSize / 1000);
        densityList.push(densityWindow);
        currentTime += windowSize;
    }


    // COMPUTE PEAK + AVERAGE

    let peakDensity = 0;
    let avgDensity = 0;

    if (densityList.length > 0) {
        peakDensity = densityList[0];
        let totalDensity = 0;
        for (const value of densityList) {
            if (value > peakDensity) {
                peakDensity = value;
            }
            totalDensity += value;
        }
        avgDensity = totalDensity / densityList.length;
    }


    // OPTIONAL ROUNDING
    peakDensity = Number(peakDensity.toFixed(2));
    avgDensity = Number(avgDensity.toFixed(2));


    //BPM fuck!! 

    const timingPoints = mapData.timingPoints;
    const bpmList = [];
    for (const point of timingPoints) {
        if (point.beatLength > 0) { // 
            if (point.uninherited == undefined || point.uninherited == 1) {
                const bpm = 60000 / point.beatLength;
                bpmList.push(bpm);

            }
        }
    }

    let minBPM = 0;
    let maxBPM = 0;
    let avgBPM = 0;

    if (bpmList.length === 0) {
        minBPM = 0;
        maxBPM = 0;
        avgBPM = 0;
    } else {
        minBPM = bpmList[0];
        maxBPM = bpmList[0];

        let total = 0;

        for (const bpm of bpmList) {
            if (bpm < minBPM) {
                minBPM = bpm;
            }
            if (bpm > maxBPM) {
                maxBPM = bpm;
            }
            total += bpm;
        }
        avgBPM = total / bpmList.length;
    }

    // console.log("These are the BPM(s)= " + bpmList[0].toFixed(2));

    //  slider velocity

    const sliderSpeedList = [];

    for (const point of timingPoints) {
        if (point.uninherited == 0 && point.beatLength < 0) {
            const sv = -100 / point.beatLength;
            sliderSpeedList.push(sv);
        }
    }

    // console.log(sliderSpeedList);

    let totalSv = 0;
    let minSv = 1.0;
    let maxSv = 1.0;
    let avgSv = 0;

    // incidents where sliders go fast
    // constant values
    const slow = 0.75;
    const normal = 1.0;
    const fast = 1.5;

    let slowCount = 0;
    let normalCount = 0;
    let fastCount = 0;

    let slowPercent = 0;
    let fastPercent = 0;
    let normalPercent = 0;

    if (sliderSpeedList.length === 0) {
        console.log("No sliders in map");

        minSv = 0;
        maxSv = 0;
        avgSv = 0;

        slowCount = 0;
        normalCount = 0;
        fastCount = 0;

        slowPercent = 0;
        normalPercent = 0;
        fastPercent = 0;

    } else {

        // average slider speed
        for (const slider of sliderSpeedList) {
            totalSv = totalSv + slider;
        }
        avgSv = totalSv / sliderSpeedList.length;

        //min & max slider (FIXED initialization)
        minSv = sliderSpeedList[0];
        maxSv = sliderSpeedList[0];

        for (const slider of sliderSpeedList) {
            if (slider < minSv) {
                minSv = slider;
            }
            if (slider > maxSv) {
                maxSv = slider;
            }
        }

        // distribution
        for (const slider of sliderSpeedList) {
            if (slider <= slow) {
                slowCount++;
            } else if (slider >= fast) {
                fastCount++;
            } else {
                normalCount++;
            }
        }

        //percentages
        slowPercent = (slowCount / sliderSpeedList.length) * 100;
        fastPercent = (fastCount / sliderSpeedList.length) * 100;
        normalPercent = (normalCount / sliderSpeedList.length) * 100;
    }


    const statistics = {
        totalNotes: totalNotes,
        mapDuration: duration,
        rawMapDuration: ms,
        noteDensity: density,
        bpmStats: {
            min: minBPM,
            max: maxBPM,
            avg: avgBPM
        },
        objectCounts: {
            circles: circleCount,
            sliders: sliderCount,
            spinners: spinnerCount,
            total: totalNotes
        },
        sliderVelocity: {
            minSv: minSv,
            maxSv: maxSv,
            avgSv: avgSv
        },
        sliderStats: {
            slowCount: slowCount,
            fastCount: fastCount,
            normalCount: normalCount,

            slowPercent: slowPercent,
            fastPercent: fastPercent,
            normalPercent: normalPercent
        },
        densityStats: {
            peak: peakDensity,
            average: avgDensity
        }
    };

    return statistics;
}


//this function is for testing
async function calculate() {

    const stats = await getStats();
    console.log(stats);

}


calculate();


module.exports = getStats;