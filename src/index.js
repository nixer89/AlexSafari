
/** Alexa Safari skill for kids! */
'use strict';
var Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');
var s3 = new AWS.S3();

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
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(testHandler);
    alexa.execute();
};

var testHandler = {
    "LaunchRequest": function () {
        console.log("Bin gerade im LaunchRequest");
        //call hello intent on startup
        this.emit(":ask", "Hallo. Willkommen zu deiner Safari. Bitte sage mir einen Buchstaben.");
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
        this.emit(":tell","Hallo. Willkommen zu deiner Safari.");
    },
    "AMAZON.StopIntent": function () {
        //call hello intent on startup
        this.emit(":tell","Hallo. Willkommen zu deiner Safari.");
    },
    "AMAZON.HelpIntent": function () {
        //do we need proper session ending request? like storing current progress?
        this.emit(":tell", "Tschüss und auf wiedersehen!");
    },
    "SessionEndedRequest'": function () {
        this.emit(":tell", "Bye!");
    },
    "Unhandled": function() {
        var message = "Das habe ich nicht verstanden.";
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
        //add logic to select the safari zone
        this.emit(":tell", "Hello!");
    },
    "SupportedZonesIntent": function () {
        //add logic to select the safari zone
        this.emit(":tell", "Hello!");
    },
    "SessionEndedRequest": function () {
        //do we need proper session ending request? like storing current progress?
        this.emit(":tell", "Hello!");
    },
    "Unhandled": function() {
        //what if alexa did not understand the user correctly?
        this.emit(":tell", "Hello!");
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