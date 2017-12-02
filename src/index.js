
/** Alexa Safari skill for kids! */
'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');
var languageFilePrototype = require('./language_properties');
var configFile = require('./safariConfig');
var s3 = new AWS.S3();
var safariConfig = "";
var error_text;

var APP_ID = process.env.APP_ID;
var S3_BUCKET = process.env.S3_BUCKET;
var S3_BUCKET_URL = process.env.S3_BUCKET_URL;

if (S3_BUCKET){
    
    var bucket_params = {
      Bucket: S3_BUCKET
     };
     s3.headBucket(bucket_params, function(err, data) {
       if (err) {
           console.log ('S3 Bucket does not exist - lets try and create it')
           s3.createBucket(bucket_params, function(err, data) {
               if (err) {
                   console.log('Could not create bucket', err.stack);
                   error_text = 'The S3 Bucket could not be created - make sure you have set up the IAM role properly or alternatively try a different random bucket name'
               }
               else     {
                   console.log('Bucket Created');
               }
         });
       }
       else {
           console.log('Bucket already exists');
       }
     });
}

var states = {
    STARTMODE: "_STARTMODE",  // Prompt the user to start or restart the game.
    ANIMALGUESSMODE: "_ANIMALGUESSING", // User is trying to guess an animal
    NUMBERGUESSMODE: "_NUMBERGUESSING", // User is trying to guess the number.
    SPELLMODE: "_SPELLING" // User is trying to spell some name
};

exports.handler = function(event, context, callback) {
    //initial stuff
    safariConfig = configFile.getSafariConfig();
    console.log("Bucket URL: " + S3_BUCKET_URL);
    var languageConfigFile = new languageFilePrototype(S3_BUCKET_URL);

    //initial alexa stuff
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.resources = languageConfigFile.getLanguageProperties();
    alexa.registerHandlers(testHandler);
    alexa.execute();
};

var testHandler = {
    "LaunchRequest": function () {

        if (error_text){
            this.emit(':tell', error_text);   
        }

        this.t('SAY_HELLO_MESSAGE');

        console.log("Bin gerade im LaunchRequest");
        //call hello intent on startup
        var elephant_start = this.t(safariConfig.Africa.elephant.questions.guessing.difficulty_1.variant1);
        var elephant_end = this.t(safariConfig.Africa.elephant.questions.guessing.difficulty_1.variant2);
        elephant_start = elephant_start.replace('ANIMAL',safariConfig.Africa.elephant.name);
        elephant_end = elephant_end.replace('ANIMAL',safariConfig.Africa.elephant.name);

        this.emit(":ask", elephant_start + elephant_end, "test");
    },
    "LetterIntent": function () {
        var playAudioResponse = this;
        var letter = this.event.request.intent.slots.letter;
        if(letter) {
            console.log("Verstanden habe ich: " + letter.value);

            if("p" == letter.value.toLowerCase()) {
                //play sound directly through public url of MP3-File
                var pigUrl = S3_BUCKET_URL + "pig.mp3";
                var speechOutput = '<audio src="' + pigUrl + '"/>';
                console.log("speech output is: " + speechOutput);
                this.emit(":tell", speechOutput);

                //disable s3 generation of signed url -> mp3 files will be public!
                var test = false;
                if(test) {
                    var signedURL;
                    // create a signed URL to the MP3 that expires after 5 seconds - this should be plenty of time to allow alexa to load and cache mp3
                    var signedParams = {Bucket: S3_BUCKET, Key: 'pig.mp3', Expires: 60, ResponseContentType: 'audio/mpeg'};
                    s3.getSignedUrl('getObject', signedParams, function (err, url) {
                        
                        console.log("Ich habe eine signed url! cool!");
                        
                        if (url) {
                            console.log("URL = " + url);
                            // ampersands are not valid in SSML so we need to escape these out with &amp;
                            url = url.replace(/&/g, '&amp;'); // replace ampersands    
                            signedURL = url;
                            var speechOutput = '<audio src="' + signedURL + '"/>';
    
                            console.log("speech output is: " + speechOutput);
    
                            playAudioResponse.emit(":tell", speechOutput);
    
                        } else {
                            playAudioResponse.emit(":tell", 'There was an error creating the signed URL. Please ensure that the S3 Bucket name is correct in the environment variables and IAM permissions are set correctly');
                        }
                    });
                }
            } else {
                this.emit(":ask", letter.value);
            }
        } else {
            playAudioResponse.emit(":ask", "Das konnte ich leider nicht verstehen. Sage mir noch einen Buchstaben.");
        }
    },
    "AMAZON.CancelIntent": function () {
        //call hello intent on startup
        this.emit(":tell","Okay, ich breche hier ab.");
    },
    "AMAZON.StopIntent": function () {
        //call hello intent on startup
        this.emit(":tell","Tschüss und besuche mich bald wieder, um die nächsten Abendteuer zu erleben!");
    },
    "AMAZON.HelpIntent": function () {
        this.emit(":tell", "Hilfe!");
    },
    "SessionEndedRequest'": function () {
        //do we need proper session ending request? like storing current progress?

        //this.emit(":tell", "Bye!");
    },
    "Unhandled": function() {
        var message = "Das habe ich nicht verstanden. Bitte gib die Antwort nochmal.";
        this.emit(":ask", message, message);
    },
};

var standardHandler = Alexa.CreateStateHandler(states.STARTMODE, {
    "LaunchRequest": function () {
        //call hello intent on startup
        this.emit(":tell", "HelloWorldIntent");
    },
    "HelloIntent": function () {
        //add an suitable welcome message
        this.emit(":tell", "Hello!");
    },
    "ZoneSelectionIntent": function () {
        //pick random animal
        dfsdf
        //pick question type
        sdsdfs
        //set mode depending on question type
        this.session.sate = ANIMALGUESSMODE;
        //ask question
        sdfdf

        //add logic to select the safari zone
        this.emit(":tell", "Hello!");
    },
    "SupportedZonesIntent": function () {
        //add logic to select the safari zone
        this.emit(":tell", "Hello!");
    },
    "AMAZON.CancelIntent": function () {
        //call hello intent on startup
        this.emit(":tell","Okay, ich breche hier ab.");
    },
    "AMAZON.StopIntent": function () {
        //call hello intent on startup
        this.emit(":tell","Tschüss und besuche mich bald wieder, um die nächsten Abendteuer zu erleben!");
    },
    "AMAZON.HelpIntent": function () {
        this.emit(":tell", "Hilfe!");
    },
    "SessionEndedRequest'": function () {
        //do we need proper session ending request? like storing current progress?

        //this.emit(":tell", "Bye!");
    },
    "Unhandled": function() {
        var message = "Das habe ich nicht verstanden. Bitte gib die Antwort nochmal.";
        this.emit(":ask", message, message);
    },
});

var animalGuessingHandler = Alexa.CreateStateHandler(states.ANIMALGUESSMODE, {
    "AnimalGuessIntent": function () {
        //add logic for guessing the current anmial
        this.emit(":tell", "Hello!");
    },
    "SupportedAnimals": function () {
        //add logic for guessing the current anmial
        this.emit(":tell", "Hello!");
    },
    "Unhandled": function() {
        //repromt to guess an animal (maybe giving examples) and REPLAY THE SOUND!!!!!!
        this.emit(":tell", "Hello!");
    },
});