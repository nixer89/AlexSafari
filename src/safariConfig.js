exports.getSafariConfig = function() {
    return adventure;
};

var adventure = {
    "supportContinents" : ["Africa", "Europe", "Asia","Australia", "America"],
    "Africa" : {
        "title": "african safari",
        "supportedAnimals" : ["elephant", "lion", "zebra", "hippo"],
        "start_safari": "START_AFRICA",
        "level" : [{
            "level": 1,
            "questions" : [{
                "MATH" : [{
                    "id": "WATERHOLE_COUNT",
                    "supportedAnimals" : ["elephant", "hippo"],
                    "variants": 2
                }],
                "GUESS" : [{
                    "id": "SIMPLE_GUESS",
                    "answer": "elephant",
                    "variants": 1
                }],
                "SPELL" : [{
                    "id": "SIMPLE_SPELL",
                    "answer": "elephant",
                    "variants": 1
                }]
            }]
        }]
    }
};