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
    GUESSMODE: "_GUESSMODE", // User is trying to guess an animal
    SPELLMODE: "_SPELLMODE", // User is trying to guess the number.
    MATHMODE: "_MATHMODE" // User is trying to spell some name
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
    alexa.registerHandlers(newSessionHandler, guessHandler, spellHandler, mathHandler);
    alexa.execute();
};

var newSessionHandler = {
    "LaunchRequest": function () {
        if (error_text) {
            this.emit(':tell', error_text);
        }

        if(Object.keys(this.attributes).length === 0) {
            this.response.speak(resolveTextProperty("SAY_HELLO_MESSAGE", this)).listen();
        } else {
            this.response.speak(resolveTextPropertyWithValue("CONTINUE", [["NAME", this.attributes.name]], this)).listen();
        }

        this.emit(":responseReady");
    },
    "FirstNameIntent": function () {
        var firstName = this.event.request.intent.slots.firstName.value;
        this.attributes.name = firstName;

        this.response.speak(resolveTextPropertyWithValue("SELECT_CONTINENT", [["NAME", firstName]], this)).listen();
        this.emit(":responseReady");
    },
    "ContinentIntent": function() {
        var continent = this.event.request.intent.slots.continent.value;

        if(continent !== "Afrika") {
            this.response.speak(resolveTextProperty("CONTINENT_NOT_SUPPORTED", this)).listen();
        } else {
            var adventure = createAdventure(continent);
            this.attributes.adventure = adventure;

            var s = resolveTextPropertyWithValue("CONTINENT_CHOSEN", [["CONTINENT", continent]], this);
            s += resolveTextProperty(adventure.start_safari, this);

            s = askQuestion(s, this);

            this.response.speak(s).listen();
        }

        this.emit(":responseReady");
    },
    'RightIntent': function() {
        var s = "Okay, dann lass uns da weiter machen, wo du aufgehört hast!";

        s = askQuestion(s, this);

        this.response.speak(s).listen();
        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        this.attributes.adventure = {};
        this.response.speak("Also gut, starten wir eine neue Safari! Bitte nenne mir zuerst deinen Namen.").listen();
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
    "SessionEndedRequest'": function () {
        this.handler.state = '';
        delete this.attributes.STATE;;
        this.emit(':saveState', true);
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag wiederhole das.";

        this.response.listen(s);

        this.emit(":responseReady");
    }
};

var guessHandler = Alexa.CreateStateHandler(states.GUESSMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag wiederhole das.";

        this.response.listen(s);

        this.emit(":responseReady");
    },
    "SessionEndedRequest'": function () {
        this.handler.state = '';
        delete this.attributes.STATE;
        this.emit(':saveState', true);
    }
});

var mathHandler = Alexa.CreateStateHandler(states.MATHMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag wiederhole das.";

        this.response.listen(s);

        this.emit(":responseReady");
    },
    "SessionEndedRequest'": function () {
        this.handler.state = '';
        delete this.attributes.STATE;
        this.emit(':saveState', true);
    }
});

var spellHandler = Alexa.CreateStateHandler(states.SPELLMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askQuestion(s, this);

        if(this.attributes.adventure.questions.length >= this.attributes.adventure.currentQuestion + 1)
            this.response.speak(s).listen();
        else
            this.response.speak(s);

        this.emit(":responseReady");
    },
    "Unhandled": function() {
        var s = "Das habe ich nicht verstanden. Bitte sag wiederhole das.";

        this.response.listen(s);

        this.emit(":responseReady");
    },
    "SessionEndedRequest'": function () {
        this.handler.state = '';
        delete this.attributes.STATE;
        this.emit(':saveState', true);
    }
});

function askQuestion(s, a) {
    var q = {};

    if(a.attributes.adventure.questions.length >= a.attributes.adventure.currentQuestion + 1) {
        q = a.attributes.adventure.questions[a.attributes.adventure.currentQuestion++];
        s += resolveTextPropertyWithValue(q.message, q.values, a);
    } else {
        q.type = "";
        s += "Dein Abenteuer ist damit beendet. Du hast " + a.attributes.adventure.score + " von " + a.attributes.adventure.questions.length
            + " Fragen richtig beantwortet. Sehr gut!";
    }

    setMode(q, a);

    return s;
}

function createAdventure(continent) {
    //TODO Crappy as fuck, we need to think of a really good idea, this is just for testing
    var adventure = {};
    adventure.continent = continent;
    adventure.start_safari = safariConfig[continent].start_safari;

    adventure.questions = [];
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["MATH"][0], "MATH", continent));
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["GUESS"][0], "GUESS", continent));
    adventure.questions.push(createQuestion(safariConfig[continent].level[0].questions["SPELL"][0], "SPELL", continent));

    adventure.currentQuestion = 0;
    adventure.score = 0;

    return adventure;
}

function createQuestion(selectedQ, type, continent) {
    var q = {};
    q.answer = selectedQ.answer;
    q.type = type;

    var animals = [];
    if(selectedQ.supportedAnimals) {
        animals = selectedQ.supportedAnimals;
    } else {
        animals = safariConfig[continent].supportedAnimals;
    }
    var animal = animals[Math.floor(Math.random() * animals.length)];
    q.values = [];
    q.values.push(["ANIMAL", animal]);

    q.message = type + "." + selectedQ.id + ".VARIANT_" + (Math.floor(Math.random() * selectedQ.variants));

    return q
}

function resolveTextProperty(s, a) {
    return a.t(s) + " ";
}

function resolveTextPropertyWithValue(s, p, a) {
    var message = a.t(s);

    p.forEach(function(e) {
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
            delete this.attributes.STATE;
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}