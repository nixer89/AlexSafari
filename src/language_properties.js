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
            'SAY_HELLO_MESSAGE' : 'Hallo. Willkommen zu deiner Safari. Bitte nenne mir einen Buchstaben.',
            'ELEPHANT' : {
                'NAME' : 'elephant',
                'QUESTIONS' : {
                    'GUESSING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : " Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : " Er wird bis zu 50 Jahre alt."
                        }
                    }, 
                    'SPELLING' : {
                        'CONNECTOR': '',
                        'DIFFICULTY_1' : {
                            'VARIANT_1' : " Das ist ein Elefant. <audio src='S3_BUCKET_URL_ANIMAL.mp3'/>",
                            'VARIANT_2' : " Er wird bis zu 50 Jahre alt. Kannst du schon Elefant buchstabieren?"
                        }
                    }, 
                    'MATH' : {
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
    }
}

module.exports = LanguageConfig;