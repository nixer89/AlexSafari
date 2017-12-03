exports.getSafariConfig = function() {
    return adventure;
}

var adventure = {
    "hello_message": "SAY_HELLO_MESSAGE",
    "supportContinents" : ["Africa", "Europe", "Asia","Australia", "America"],
    "Africa" : {
        "title": "african safari",
        "supportedAnimals" : ["elephant", "lion"],
        "kontinent_intro": "Du läufst durch die dicht mit Bäumen bewachsene Savanne Afrikas.",
        "elephant" : {
            "name":"elephant",
            "nameVariations": ["elephant", "bull elephant", "elephant child"],
            "questions" : {
                "guessing": {
                    "difficulty_1" : {
                        "variant1": "ELEPHANT.QUESTIONS.GUESSING.DIFFICULTY_1.VARIANT_1",
                        "variant2": "ELEPHANT.QUESTIONS.GUESSING.DIFFICULTY_1.VARIANT_2",
                        "answer": "elephant"
                    }
                },
                "math": {
                    "difficulty_1" : {
                        "variant1_1": "Du kommst an ein Wasserloch. Dort stehen ",
                        "variant1_2": " Elefanten mit ihren ",
                        "variant1_3": " Kindern. Wie viele Elefanten sind es insgesamt?",
                        "variant2_1": "abcd",
                        "variant2_2": "abcd",
                    }
                },
                "spelling": {
                    "difficulty_1" : {
                        "variant1": "ELEPHANT.QUESTIONS.SPELLING.DIFFICULTY_1.VARIANT_1",
                        "variant2": "ELEPHANT.QUESTIONS.SPELLING.DIFFICULTY_1.VARIANT_2",
                        "answer": "elephant",
                    }
                }
            }
        },
        "lion" : {
            "name":"LION.NAME",
            "nameVariations": ["lion"],
            "questions" : {
                "guessing": {
                    "difficulty_1" : {
                        "variant1": "ELEPHANT.DIFFICULTY_1.VARIANT_1",
                        "variant2": "ELEPHANT.DIFFICULTY_1.VARIANT_2",
                        "answer": "elephant"
                    }
                },
                "math": {
                    "difficulty_1" : {
                        "variant1_1": "Du kommst an ein Wasserloch. Dort stehen ",
                        "variant1_2": " Elefanten mit ihren ",
                        "variant1_3": " Kindern. Wie viele Elefanten sind es insgesamt?",
                        "variant2_1": "abcd",
                        "variant2_2": "abcd",
                    }
                },
                "spelling:": {
                    "difficulty_1" : {
                        "variant1": "abc",
                        "variant2": "abcd",
                        "answer": "elephant",
                    }
                }
            }
        }
    }
}