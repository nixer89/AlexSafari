//Simple property file to get the correct language
var S3_BUCKET_URL = "";

LanguageConfig.prototype.getLanguageProperties = function() {
    return languageProperties;
};

function LanguageConfig(bucket_url) {
    S3_BUCKET_URL = bucket_url;
    console.log("Bucket URL ist in language file angekommen: " + S3_BUCKET_URL);

    languageProperties = JSON.parse(replaceAll(JSON.stringify(languageProperties), "S3_BUCKET_URL_",  S3_BUCKET_URL));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

var languageProperties = {
    'en-GB': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!',
            'ELEFANT' : {
                'NAME' : 'elephant',
                'QUESTIONS' : {
                    'GUESSING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }, 
                    'SPELLING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }, 
                    'GUESSING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }
                }
            },
            'LION' : {
                'NAME' : 'lion',
                'QUESTIONS' : {
                    'GUESSING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }, 
                    'SPELLING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }, 
                    'GUESSING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                        }
                    }
                }
            }
        }
    },
    'en-US': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!',
            'ELEFANT' : {
                'NAME' : 'elephant',
                'DIFFICULTY_1' : {
                    'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                    'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                }
            },
            'LION' : {
                'NAME' : 'lion',
                'DIFFICULTY_1' : {
                    'VARIANT_1' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                    'VARIANT_2' : "Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>"
                }
            }
        }
    },
    'de-DE': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Guten Tag! Willkommen zu deiner persönlichen Safari! Ich glaube ich habe deinen Namen und dein Alter nicht ganz verstanden, wie war das noch gleich?',
            'CONTINUE' : "Hallo #NAME#. Du hast deine letzte Safari nicht zu Ende gebracht, willst du dort weiter machen wo du aufgehört hast?",
            'SELECT_CONTINENT' : "Danke #NAME#. Bitte nenne mir zuerst den Kontinent, den du besuchen willst.",
            'CONTINENT_NOT_SUPPORTED' : "Tut mir Leid, ich unterstütze momentan nur den Kontinent Afrika. Bitte wähle einen anderen Kontinent.",
            'CONTINENT_CHOSEN': "Super! Du hast dich für #CONTINENT# entschieden!",
            'START_AFRICA': 'Du läufst durch die dicht mit Bäumen bewachsene Savanne Afrikas.',

            'WRONG' : 'Tut mir Leid, das war leider falsch.',
            'CORRECT' : 'Richtig, sehr gut!',

            'MATH' : {
                'WATERHOLE_COUNT' : {
                    'VARIANT_0' : "Du kommst an ein Wasserloch. <audio src='S3_BUCKET_URL_#ANIMAL#.mp3'/> Dort stehen #NUMBER_0# #ANIMAL# mit ihren #NUMBER_1# Kindern. Wie viele #ANIMAL#s sind es insgesamt?",
                    'VARIANT_1' : "Dort ist ein großes Wasserloch! Wow schau dir die #NUMBER_0# mächtigen #ANIMAL#s an. <audio src='S3_BUCKET_URL_#ANIMAL#.mp3'/> Er ist mit seinen #NUMBER_1# Kindern dort. Kannst du mir sagen wie viele #ANIMAL#s es insgesamt sind?"
                }
            },

            'GUESS' : {
                'SIMPLE_GUESS' : {
                    'VARIANT_0' : "Welches Tier macht dieses Geräusch?<audio src='S3_BUCKET_URL_#ANIMAL#.mp3'/> Hast du es erkannt?"
                }
            },

            'SPELL' : {
                'SIMPLE_SPELL' : {
                    'VARIANT_0' : "Kannst du #ANIMAL# buchstabieren?"
                }
            }
        }
    }
};

module.exports = LanguageConfig;