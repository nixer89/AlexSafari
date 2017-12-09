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

if (S3_BUCKET) {
    var bucket_params = {
        Bucket: S3_BUCKET
    };

    s3.headBucket(bucket_params, function(err, data) {
        if (err) {
            console.log ('S3 Bucket does not exist - lets try and create it');
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
    CONFIGMODE: "_CONFIGMODE", // Configure Name and Age

    GUESSMODE: "_GUESSMODE", // User is trying to guess an animal
    SPELLMODE: "_SPELLMODE", // User is trying to guess the number.
    MATHMODE: "_MATHMODE", // User is trying to spell some name
    SPELLMODE_1: "_SPELLING_1",
    SPELLMODE_2: "_SPELLING_2",
    SPELLMODE_3: "_SPELLING_3",
    SPELLMODE_4: "_SPELLING_4",
    SPELLMODE_5: "_SPELLING_5",
    SPELLMODE_6: "_SPELLING_6",
    SPELLMODE_7: "_SPELLING_7",
    SPELLMODE_8: "_SPELLING_8",
    SPELLMODE_9: "_SPELLING_9" // User is trying to spell some name
};

exports.handler = function(event, context, callback) {
    //initial stuff
    safariConfig = configFile.getSafariConfig();
    var languageConfigFile = new languageFilePrototype(S3_BUCKET_URL);

    //initial alexa stuff
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.dynamoDBTableName = 'AlexaSafari';
    alexa.resources = languageConfigFile.getLanguageProperties();
    alexa.registerHandlers(newSessionHandler, guessHandler, spellHandler, mathHandler, configHandler);
    alexa.execute();
};

var newSessionHandler = {
    "LaunchRequest": function () {
        if (error_text) {
            this.emit(':tell', error_text);
        }

        if(Object.keys(this.attributes).length === 0 || this.attributes.adventure.currentQuestion === this.attributes.adventure.questions.length) {
            if(!this.attributes.adventure || !this.attributes.adventure.score) {
                this.response.speak(resolveTextProperty("SAY_HELLO_MESSAGE", this)).listen("Wie bitte?");
            } else {
                this.response.speak("Willkommen zurück! Bist du bereit für eine neue Safaritour? Dann verrate mir doch bitte zuerst deinen Namen.").listen("Wie bitte?");
                this.attributes.name = null;
                this.attributes.age = null;
                this.attributes.adventure = null;
            }

            this.handler.state = states.CONFIGMODE;
        } else {
            this.response.speak(resolveTextPropertyWithValue("CONTINUE", [["NAME", this.attributes.name]], this)).listen("Wie bitte?");
        }

        this.emit(":responseReady");
    },
    'AMAZON.YesIntent': function() {
        var s = "Okay, dann lass uns da weiter machen, wo du aufgehört hast! Du bist bei Frage " + this.attributes.adventure.currentQuestion + " von " + this.attributes.adventure.questions.length + "";
        this.attributes.adventure.currentQuestion--;

        askNextQuestion(s, this);
    },
    'AMAZON.NoIntent': function() {
        this.attributes.adventure = {};
        this.response.speak("Also gut, starten wir eine neue Safari! Bitte nenne mir zuerst deinen Namen und dein Alter.").listen("Wie bitte?");
        this.handler.state = states.CONFIGMODE;
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function() {
        this.response.speak("Hilfe gibt es nicht!");
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
        this.response.speak("Auf wiedersehen.");
        this.emit(':responseReady');
    },
    "SessionEndedRequest": function () {
        this.handler.state = '';
        console.log("Main State");
        this.emit(':saveState', true);
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag das noch einmal.";

        this.response.speak(s).listen("Wie bitte?");

        this.emit(":responseReady");
    }
};

var configHandler = Alexa.CreateStateHandler(states.CONFIGMODE, {
    "FirstNameIntent": function () {
        if(this.attributes.name && !this.attributes.age) {
            this.response.speak("Ja, deinen Namen kenne ich bereits. Bitte nenne mir dein Alter.").listen("Wie bitte?");
        } else if (this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, Alter und Name kenne ich bereits. Wähle bitte den Kontinent, auf den die Reise gehen soll!").listen("Wie bitte?");
        } else {
            var firstName = this.event.request.intent.slots.firstName.value;
            this.attributes.name = firstName;

            this.response.speak("Danke " + firstName + ". Verrätst du mir nun auch noch dein Alter?").listen("Wie bitte?");
        }

        this.emit(":responseReady");
    },
    "AgeIntent": function () {
        if(!this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, dein Alter kenne ich bereits. Bitte nenne mir deinen Namen.").listen("Wie bitte?");
        } else if (this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, Alter und Name kenne ich bereits. Wähle bitte den Kontinent, auf den die Reise gehen soll!").listen("Wie bitte?");
        } else {
            var age = this.event.request.intent.slots.age.value;
            this.attributes.age = age;

            this.response.speak(resolveTextPropertyWithValue("SELECT_CONTINENT", [["NAME", this.attributes.name]], this)).listen("Wie bitte?");
        }

        this.emit(":responseReady");
    },
    "ContinentIntent": function() {
        if(!this.attributes.name || !this.attributes.age) {
            this.response.speak("Ich glaube du hast mir deinen Namen noch nicht verraten, wie heißt du denn?").listen("Wie bitte?");
        } else if (!this.attributes.age) {
            this.response.speak("Ich glaube du hast mir dein Alter noch nicht verraten, wie alt bist du denn?").listen("Wie bitte?");
        } else {
            var continent = this.event.request.intent.slots.continent.value;

            if(continent !== "Afrika") {
                this.response.speak(resolveTextProperty("CONTINENT_NOT_SUPPORTED", this)).listen("Wie bitte?");
            } else {
                var adventure = createAdventure(continent);
                this.attributes.adventure = adventure;

                var s = resolveTextPropertyWithValue("CONTINENT_CHOSEN", [["CONTINENT", continent]], this);
                s += resolveTextProperty(adventure.start_safari, this);

                askNextQuestion(s, this);
            }
        }

        this.emit(":responseReady");
    }
});

var guessHandler = Alexa.CreateStateHandler(states.GUESSMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        askNextQuestion(s, this);
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        askNextQuestion(s, this);
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag das noch einmal.";

        this.response.speak(s).listen("Wie bitte?");

        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        this.handler.state = '';
        delete this.attributes.STATE;  
        this.emit(':saveState', true);
    }
});

var mathHandler = Alexa.CreateStateHandler(states.MATHMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        askNextQuestion(s, this);
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        askNextQuestion(s, this);
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag das noch einmal.";

        this.response.speak(s).listen("Wie bitte?");

        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        this.handler.state = '';
        delete this.attributes.STATE;  
        this.emit(':saveState', true);
    }
});

var spellHandler = Alexa.CreateStateHandler(states.SPELLMODE, {
    "LetterIntentFuenf": function () {
        var currentAnimal = "elefant".toLowerCase();
        var currentProgress = this.attributes.spelledAnimal || "";
        //add logic for guessing the current anmial
        var whatAlexaUnderstood = checkForLetterIntent(this.event.request.intent.slots);

        console.log("what alexa understood: " + whatAlexaUnderstood);
        console.log("current progress spelling: " + currentProgress);
        console.log("current animal to guess: " + currentAnimal);

        currentProgress += whatAlexaUnderstood.toLowerCase();

        console.log("current progress with new alexa understanding: " + currentProgress);

        if(currentAnimal == currentProgress) {
            this.emit(":tell", "Hey, das hast du super gemacht! Das war komplett richtig! Glückwunsch!");

        } else if(currentAnimal.indexOf(currentProgress) == 0) {
            var responseSpeech = whatAlexaUnderstood;

            var repromptSpeech = "Bis jetzt ist alles richtig. Ich habe verstanden: ";
            var letterArray = currentProgress.split('');
            for (var i = 0, len = letterArray.length; i < len   ; i++) {
                repromptSpeech += "<break time=\"200ms\"/>" + letterArray[i];
            }
            repromptSpeech += ". Wie geht es weiter?";
            
            this.attributes.spelledAnimal = currentProgress;
            this.emit(":ask", responseSpeech, repromptSpeech);
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
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        askNextQuestion(s, this);
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        askNextQuestion(s, this);
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag das noch einmal.";

        this.response.speak(s).listen("Wie bitte?");

        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        this.handler.state = '';
        delete this.attributes.STATE;  
        this.emit(':saveState', true);
    }
});

function askNextQuestion(s, a) {
    var q = {};

    if(a.attributes.adventure.questions.length === a.attributes.adventure.currentQuestion) {
        a.attributes.adventure.currentQuestion++;

        q.type = "";
        s += "Dein Abenteuer ist damit beendet. Du hast " + a.attributes.adventure.score + " von " + a.attributes.adventure.questions.length
            + " Fragen richtig beantwortet. Sehr gut!";
        a.response.speak(s);
    } else {
        a.attributes.adventure.currentQuestion++;

        q = a.attributes.adventure.questions[a.attributes.adventure.currentQuestion-1];
        s += resolveTextPropertyWithValue(q.message, q.values, a);
        a.response.speak(s).listen("Wie bitte?");
    }

    setMode(q, a);

    a.emit(":responseReady");
}

function createAdventure(continent) {
    //TODO Crappy as fuck, we need to think of a really good idea, this is just for testing
    var adventure = {};
    adventure.continent = continent;
    adventure.start_safari = safariConfig[continent].start_safari;

    adventure.questions = [];

    var selectedQ = safariConfig[continent].level[0].questions["MATH"][0];

    var animals = [];
    if(selectedQ.supportedAnimals) {
        animals = selectedQ.supportedAnimals;
    } else {
        animals = safariConfig[continent].supportedAnimals;
    }
    var animal = animals[Math.floor(Math.random() * animals.length)];

    adventure.questions.push(createQuestion(selectedQ, "MATH", animal));
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["GUESS"][0], "GUESS", animal));
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["SPELL"][0], "SPELL", animal));

    adventure.currentQuestion = 0;
    adventure.score = 0;

    return adventure;
}

function createQuestion(selectedQ, type, animal) {
    var q = {};
    q.answer = selectedQ.answer;
    q.type = type;

    q.values = [];
    q.values.push(["ANIMAL", animal]);

    q.message = type + "." + selectedQ.id + ".VARIANT_" + (Math.floor(Math.random() * selectedQ.variants));

    return q
}

function resolveTextProperty(value, alexa) {
    return alexa.t(value) + " ";
}

function resolveTextPropertyWithValue(value, parameter, alexa) {
    var message = alexa.t(value);

    parameter.forEach(function(e) {
        message = replaceAll(message, "#" + e[0] + "#", e[1]);
    });

    return message + " ";
}

function setMode(q, a) {
    switch (q.type) {
        case "MATH":
            a.handler.state = states.MATHMODE;
            break;
        case "GUESS":
            a.handler.state = states.GUESSMODE;
            break;
        case "SPELL":
            a.handler.state = states.SPELLMODE;
            break;
        default:
            a.handler.state = '';
            delete a.attributes.STATE;
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

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
                for (var i = 0, len2 = letterArray.length; i < len2; i++) {
                    responseSpeech += "<break time=\"200ms\"/>" + letterArray[i];
                }
                responseSpeech += ". Wie geht es weiter?";
                skill.emit(":ask", responseSpeech);
            }
        }
    }

    return whatAlexaUnderstood;
}