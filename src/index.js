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
    MATHMODE: "_MATHMODE", // User is trying to spell some name
    CONFIGMODE: "_CONFIGMODE", // Configure Name and Age
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

        if(Object.keys(this.attributes).length === 0 || this.attributes.adventure.currentQuestion == this.attributes.adventure.questions.length + 1) {
            if(!this.attributes.adventure || !this.attributes.adventure.score) {
                this.response.speak(resolveTextProperty("SAY_HELLO_MESSAGE", this)).listen();
            } else {
                this.response.speak("Wilkommen zurück! Bist du bereit für eine neue Safaritour? Dann verrate mir doch bitte zuerst deinen Namen.").listen();
                this.attributes.name = null;
                this.attributes.age = null;
            }

            this.handler.state = states.CONFIGMODE;
        } else {
            this.response.speak(resolveTextPropertyWithValue("CONTINUE", [["NAME", this.attributes.name]], this)).listen();
        }

        this.emit(":responseReady");
    },
    'AMAZON.YesIntent': function() {
        var s = "Okay, dann lass uns da weiter machen, wo du aufgehört hast!";

        s = askNextQuestion(s, this);

        this.response.speak(s).listen();
        this.emit(":responseReady");
    },
    'AMAZON.NoIntent': function() {
        this.attributes.adventure = {};
        this.response.speak("Also gut, starten wir eine neue Safari! Bitte nenne mir zuerst deinen Namen und dein Alter.").listen();
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

var configHandler = Alexa.CreateStateHandler(states.CONFIGMODE, {
    "FirstNameIntent": function () {
        if(this.attributes.name && !this.attributes.age) {
            this.response.speak("Ja, deinen Namen kenne ich bereits. Bitte nenne mir dein Alter.").listen();
        } else if (this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, Alter und Name kenne ich bereits. Wähle bitte den Kontinent, auf den die Reise gehen soll!").listen();
        } else {
            var firstName = this.event.request.intent.slots.firstName.value;
            this.attributes.name = firstName;

            this.response.speak("Danke " + firstName + ". Verrätst du mir nun auch noch dein Alter?").listen();
        }

        this.emit(":responseReady");
    },
    "AgeIntent": function () {
        if(!this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, dein Alter kenne ich bereits. Bitte nenne mir deinen Namen.").listen();
        } else if (this.attributes.name && this.attributes.age) {
            this.response.speak("Ja, Alter und Name kenne ich bereits. Wähle bitte den Kontinent, auf den die Reise gehen soll!").listen();
        } else {
            var age = this.event.request.intent.slots.age.value;
            this.attributes.age = age;

            this.response.speak(resolveTextPropertyWithValue("SELECT_CONTINENT", [["NAME", this.attributes.name]], this)).listen();
        }

        this.emit(":responseReady");
    },
    "ContinentIntent": function() {
        if(!this.attributes.name || !this.attributes.age) {
            this.response.speak("Ich glaube du hast mir deinen Namen noch nicht verraten, wie heißt du denn?").listen();
        } else if (!this.attributes.age) {
            this.response.speak("Ich glaube du hast mir dein Alter noch nicht verraten, wie alt bist du denn?").listen();
        } else {
            var continent = this.event.request.intent.slots.continent.value;

            if(continent !== "Afrika") {
                this.response.speak(resolveTextProperty("CONTINENT_NOT_SUPPORTED", this)).listen();
            } else {
                var adventure = createAdventure(continent);
                this.attributes.adventure = adventure;

                var s = resolveTextPropertyWithValue("CONTINENT_CHOSEN", [["CONTINENT", continent]], this);
                s += resolveTextProperty(adventure.start_safari, this);

                s = askNextQuestion(s, this);

                this.response.speak(s).listen();
            }
        }

        this.emit(":responseReady");
    }
});

var adventureHandler = Alexa.CreateStateHandler(states.ADVENTUREMODE, {
    "FirstNameIntent": function () {
        if(this.attributes.name) {
            this.response.speak("Ja, deinen Namen kenne ich bereits. Wähle bitte einen Kontinent").listen();
        }

        var firstName = this.event.request.intent.slots.firstName.value;
        this.attributes.name = firstName;

        this.response.speak(resolveTextPropertyWithValue("SELECT_CONTINENT", [["NAME", firstName]], this)).listen();
        this.emit(":responseReady");
    },
    "AgeIntent": function () {
        if(this.attributes.name) {
            this.response.speak("Ja, deinen Namen kenne ich bereits. Wähle bitte einen Kontinent").listen();
        }

        var firstName = this.event.request.intent.slots.firstName.value;
        this.attributes.name = firstName;

        this.response.speak(resolveTextPropertyWithValue("SELECT_CONTINENT", [["NAME", firstName]], this)).listen();
        this.emit(":responseReady");
    }
});

var guessHandler = Alexa.CreateStateHandler(states.GUESSMODE, {
    'RightIntent': function() {
        var s = resolveTextProperty("CORRECT", this);

        this.attributes.adventure.score++;
        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion-1)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

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
        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion-1)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion-1)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

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
        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion-1)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

        this.emit(":responseReady");
    },
    'WrongIntent': function() {
        var s = resolveTextProperty("WRONG", this);

        s = askNextQuestion(s, this);

        if(this.attributes.adventure.questions.length === this.attributes.adventure.currentQuestion-1)
            this.response.speak(s);
        else
            this.response.speak(s).listen();

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

function askNextQuestion(s, a) {
    var q = {};

    if(a.attributes.adventure.questions.length === a.attributes.adventure.currentQuestion) {
        q.type = "";
        a.attributes.adventure.currentQuestion++;
        s += "Dein Abenteuer ist damit beendet. Du hast " + a.attributes.adventure.score + " von " + a.attributes.adventure.questions.length
            + " Fragen richtig beantwortet. Sehr gut!";
    } else {
        q = a.attributes.adventure.questions[a.attributes.adventure.currentQuestion];
        a.attributes.adventure.currentQuestion++;
        s += resolveTextPropertyWithValue(q.message, q.values, a);
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
            delete a.attributes.STATE;
    }
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}