
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
    alexa.registerHandlers(testHandler, animalGuessingHandler);
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
        var elephant_start = this.t(safariConfig.Africa.elephant.questions.spelling.difficulty_1.variant1);
        var elephant_end = this.t(safariConfig.Africa.elephant.questions.spelling.difficulty_1.variant2);
        elephant_start = elephant_start.replace('ANIMAL',safariConfig.Africa.elephant.name);
        elephant_end = elephant_end.replace('ANIMAL',safariConfig.Africa.elephant.name);

        this.handler.state = states.SPELLMODE;

        this.emit(":ask", elephant_end, "test");
        //this.emit(":ask", elephant_start + elephant_end, "test");
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
    "EndedRequest'": function () {
        //do we need proper  ending request? like storing current progress?

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
        this.sate = ANIMALGUESSMODE;
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
    "EndedRequest'": function () {
        //do we need proper  ending request? like storing current progress?

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

var animalGuessingHandler = Alexa.CreateStateHandler(states.SPELLMODE, {
    "LetterIntent": function () {
        var currentAnimal = "elefant".toLowerCase();
        var currentProgress = this.attributes.spelledAnimal || "";
        //add logic for guessing the current anmial
        var whatAlexaUnderstood = checkForLetterIntent(this.event.request.intent.slots, this);

        console.log("what alexa understood: " + whatAlexaUnderstood);
        console.log("current progress spelling: " + currentProgress);
        console.log("current animal to guess: " + currentAnimal);

        currentProgress += whatAlexaUnderstood.toLowerCase();

        console.log("current progress with new alexa understanding: " + currentProgress);

        if(currentAnimal == currentProgress) {
            this.emit(":tell", "Hey, das hast du super gemacht! Das war komplett richtig! Glückwunsch!");

        } else if(currentAnimal.indexOf(currentProgress) == 0) {
            var responseSpeech = "Bis jetzt ist alles richtig. Ich habe verstanden: ";
            var letterArray = currentProgress.split('');
            for (var i = 0, len = letterArray.length; i < len; i++) {
                responseSpeech += "<break time=\"200ms\"/>" + letterArray[i];
            }
            responseSpeech += ". Wie geht es weiter?";
            this.attributes.spelledAnimal = currentProgress;

            this.emit(":ask", responseSpeech, responseSpeech);
        } else {
            this.attributes.askForRepeat = true;
            this.attributes.spelledAnimal = "";
            this.emit(":ask", "Das ist leider falsch. Möchtest du es noch einmal versuchen?");
        }
    },
    "AMAZON.YesIntent": function () {
        if(this.attributes.askForRepeat) {
            this.attributes.spelledAnimal = "";
            this.emit(":ask", "Ok, versuchen wir es nochmal. Wie buchstabiert man Elefant?", "Wie buchstabiert man Elefant?");
        } else {
            this.emit(":ask", "Ok, wie buchstabiert man Elefant?", "Wie buchstabiert man Elefant?");
        }
        //add logic for guessing the current anmial
        this.emit(":tell", "Hello!");
    },
    "AMAZON.NoIntent": function () {
        //add logic for guessing the current anmial
        var currentAnimal = "elefant";
        var spellingOutput = "";
        var letterArray = currentAnimal.split('');
        console.log("letterArray = " + letterArray);
        for (var i = 0, len = letterArray.length; i < len; i++) {
            spellingOutput += " <break time=\"200ms\"/> " + letterArray[i];
        }

        console.log("speechOutput = " + spellingOutput + ". " + currentAnimal);

        this.emit(":tell", "Ok, kein Problem. Dann sage ich es dir: " + spellingOutput);
    },
    "Unhandled": function() {
        //repromt to guess an animal (maybe giving examples) and REPLAY THE SOUND!!!!!!
        this.emit(":tell", "Hello!");
    },
});

function checkForLetterIntent(slots, skill) {
    console.log("filled slots: " + JSON.stringify(slots));
    var slotAppender = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    var whatAlexaUnderstood = ""; 
    for (var i = 0, len = slotAppender.length; i < len; i++) {
        console.log("index letter = " + 'letter'+slotAppender[i]);
        if(slots['letter'+slotAppender[i]] && slots['letter'+slotAppender[i]].value)
        {
            if(slots['letter'+slotAppender[i]].resolutions.resolutionsPerAuthority[0].status.code == "ER_SUCCESS_MATCH")
                whatAlexaUnderstood += slots['letter'+slotAppender[i]].resolutions.resolutionsPerAuthority[0].values[0].value.name;
            else {
                skill.attributes.spelledAnimal += whatAlexaUnderstood;
                var responseSpeech = "Tut mir leid, da habe ich etwas nicht verstanden. Bisher habe ich verstanden: ";
                var letterArray = this.attributes.spelledAnimal.split('');
                for (var i = 0, len = letterArray.length; i < len; i++) {
                    responseSpeech += "<break time=\"200ms\"/>" + letterArray[i];
                }
                responseSpeech += ". Wie geht es weiter?";
                skill.emit(":ask", responseSpeech);
            }
        }
    }

    return whatAlexaUnderstood;
}