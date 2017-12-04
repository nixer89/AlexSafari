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
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'en-US': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'de-DE': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hallo! Willkommen zu deiner persönlichen Safari! Ich glaube ich habe deinen Namen nicht ganz verstanden, wie war der noch gleich?',
            'CONTINUE' : "Hallo #NAME#. Du hast deine letzte Safari nicht zu Ende gebracht, willst du dort weiter machen wo du aufgehört hast?",
            'SELECT_CONTINENT' : "Danke #NAME#. Bitte nenne mir zuerst den Kontinent, den du besuchen willst.",
            'CONTINENT_NOT_SUPPORTED' : "Tut mir Leid, ich unterstütze momentan nur den Kontinent Afrika. Bitte wähle einen anderen Kontinent.",
            'CONTINENT_CHOSEN': "Super! Du hast dich für #CONTINENT# entschieden!",
            'START_AFRICA': 'Du läufst durch die dicht mit Bäumen bewachsene Savanne Afrikas.',

            'WRONG' : 'Tut mir Leid, das war leider falsch.',
            'CORRECT' : 'Richtig, sehr gut!',

            'MATH' : {
                'WATERHOLE_COUNT' : {
                    'VARIANT_0' : "Du kommst an ein Wasserloch. <audio src='S3_BUCKET_URL_#ANIMAL#.mp3'/> Dort stehen zwei #ANIMAL# mit ihren fünf Kindern. Wie viele #ANIMAL#s sind es insgesamt?",
                    'VARIANT_1' : "Dort ist ein großes Wasserloch! Wow schau dir den mächtigen Papa #ANIMAL# an. <audio src='S3_BUCKET_URL_#ANIMAL#.mp3'/> Er ist mit seinen zwei Kindern dort. Kannst du mir sagen wie viele #ANIMAL#s es insgesamt sind?"
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