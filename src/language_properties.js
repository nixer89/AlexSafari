//Simple property file to get the correct language
var S3_BUCKET_URL = "";

LanguageConfig.prototype.getLanguageProperties = function() {
    return languageProperties;
}

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
            'SAY_HELLO_MESSAGE' : 'Hallo. Willkommen zu deiner Safari. Bitte nenne mir einen Buchstaben.',
            'ELEFANT' : {
                'START' : "Das ist ein Elefant. <audio src='S3_BUCKET_URL_elephant.mp3'/>",
                'END': " Er wird bis zu 50 Jahre alt. <audio src='S3_BUCKET_URL_elephant.mp3'/>"
            }
        }
    }
}

module.exports = LanguageConfig;