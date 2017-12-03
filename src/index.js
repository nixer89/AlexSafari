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
    var languageConfigFile = new languageFilePrototype(S3_BUCKET_URL);

    //initial alexa stuff
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.resources = languageConfigFile.getLanguageProperties();
    alexa.registerHandlers(testHandler);
    alexa.execute();
};

var defaultHandler = {
    "LaunchRequest": function () {
        if (error_text) {
            this.emit(':tell', error_text);   
        }

        if(Object.keys(this.attributes).length === 0) {
            this.response.listen(resolveTextProperty("SAY_HELLO_MESSAGE", this));
        } else {
            this.response.listen(resolveTextProperty("CONTINUE", this));
        }

        this.emit(":responseReady");
    },
    "ContinentIntent": function() {
        var continent = this.event.request.intent.slots.continent.value;

        if(continent !== "Africa") {
            this.response.speak(resolveTextProperty("CONTINENT_NOT_SUPPORTED", this))
        } else {
            var adventure = createAdventure(continent);
            this.attributes.adventure = adventure;

            var s = resolveTextPropertyWithValue("CONTINENT_CHOSEN", [["CONTINENT", continent]], this);
            s += resolveTextProperty(adventure.start_safari, this);

            var q = adventure.questions[adventure.currentQuestion++];
            s += resolveTextPropertyWithValue(q.type + "." + q.id + "." + q.variant);

            this.response.listen(s);
        }

        this.emit(":responseReady");
    },
    'AMAZON.YesIntent': function() {
        var s = "Okay, dann lass uns da weiter machen, wo du aufgehört hast!";
        s += this.attributes.adventure.questions[this.attributes.adventure.currentQuestion++];

        this.response.listen(s);
        this.emit(":responseReady");
    },
    'AMAZON.NoIntent': function() {
        this.attributes.adventure = {};
        this.response.listen("Also gut, starten wir eine neue Safari! Bitte nenne mir zuerst den Kontinent, den du besuchen willst.");
        this.emit(':responseReady');
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
        this.emit(':saveState', true);
    },
    "Unhandled": function() {
        var message = "Das habe ich nicht verstanden. Bitte gib die Antwort nochmal.";
        this.emit(":ask", message, message);
    }
};

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
    }
});

function createAdventure(continent) {
    //TODO Crappy as fuck, we need to think of a really good idea, this is just for testing
    var adventure = {};
    adventure.continent = continent;
    adventure.start_safari = safariConfig[continent].start_safari;

    adventure.questions = [];
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["MATH"][0]), "MATH");
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["GUESS"][0]), "GUESS");
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["SPELL"][0]), "SPELL");

    adventure.currentQuestion = 0;
    adventure.score = 0;

    return adventure;
}

function createQuestion(selectedQ, type) {
    var q = {};
    q.id = selectedQ.id;
    q.type = type;
    q.answer = selectedQ.answer;

    var animals = [];
    if(selectedQ.animals !== null) {
        animals = selectedQ.supportedAnimals;
    } else {
        animals = safariConfig[continent].supportedAnimals;
    }
    q.animal = animals[Math.floor(Math.random() * animals.length) + 1];

    q.variant = Math.floor(Math.random() * selectedQ.variants) + 1;

    return q
}

function resolveTextProperty(s, a) {
    return a.t(s);
}

function resolveTextPropertyWithValue(s, p, a) {
    var message = a.t(s);

    p.forEach(function(e) {
       message = message.replace("#" + e[0] + "#", e[1]);
    });

    return message
}