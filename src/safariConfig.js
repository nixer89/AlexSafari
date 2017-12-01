var adventure = {
    "supportContinents" : ["Africa", "Europe", "Asia","Australia", "America"],
    "Africa" : {
        "title": "african safari",
        "supportedAnimals" : ["elephant", "lion"],
        "start_safari": "Du läufst durch die dicht mit Bäumen bewachsene Savanne Afrikas.",
        "elephant" : {
            "nameVariations": ["elephant", "bull elephant", "elephant child"],
            "questions" : {
                "guessing": {
                    "difficulty_1" : {
                        "variant1": "abc",
                        "variant2": "abcd",
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