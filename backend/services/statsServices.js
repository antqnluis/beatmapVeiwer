const parseMap = require('./parserService.js');

const map = "../../frontend/beatmaps/3sample.osu"; //change to content later


async function getStats() {

    console.log("Getting Data...");
    const mapData = await parseMap(map);

    //total hitobjects
    const hitObjects = mapData.hitObjects;
    const totalNotes = hitObjects.length;
    console.log("Total Objects = " + totalNotes);

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

    console.log("Time in minutes = " + duration);

    //note density?

    const density = totalNotes / (ms / 1000);
    console.log("Map Density (Notes per Second)= " + density.toFixed(2));


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

    console.log("These are the BPM(s)= " + bpmList[0].toFixed(2));

    //  slider velocity

    const sliderSpeedList = [];

    for (point of timingPoints) {
        if (point.uninherited == 0 && point.beatLength < 0) {
            const sv = -100 / point.beatLength;
            sliderSpeedList.push(sv);
        }
    }

    // console.log(sliderSpeedList);

    if (sliderSpeedList.length == 0) {
        console.log("No sliders in map");
        return;
    } else {
        let totalSv = 0;
        let minSv = 1.0;
        let maxSv = 1.0;
        // average slider speed
        for (const slider of sliderSpeedList) {
            totalSv = totalSv + slider;
        }
        const avgSv = totalSv / sliderSpeedList.length;

        //min slider
        for (const slider of sliderSpeedList) {
            if (slider < minSv) {
                minSv = slider;
            }
        }
        // max slider
        for (const slider of sliderSpeedList) {
            if (slider > maxSv) {
                maxSv = slider;
            }
        }

        console.log("Average Slider Speed = " + avgSv.toFixed(2));
        console.log("Slowest Slider Speed = " + minSv.toFixed(2));
        console.log("Fastest Slider Speed = " + maxSv.toFixed(2));
    }

    // incidents where sliders go fast
    // constant values
    const slow = 0.75;
    const normal = 1.0;
    const fast = 1.5;

    let slowCount = 0;
    let normalCount = 0;
    let fastCount = 0;

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
    const slowPercent = (slowCount / sliderSpeedList.length) * 100;
    const fastPercent = (fastCount / sliderSpeedList.length) * 100;
    const normalPercent = (normalCount / sliderSpeedList.length) * 100;



    console.log("Slow instances = " + slowCount);
    console.log("Percentage = " + slowPercent.toFixed(2) + "%");

    console.log("Fast instances = " + fastCount);
    console.log("Percentage = " + fastPercent.toFixed(2) + "%");

    console.log("Normal instances = " + normalCount);
    console.log("Percentage = " + normalPercent.toFixed(2) + "%");


}

getStats();