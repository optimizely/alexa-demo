
'use strict';

const optimizelySDK = require('@optimizely/optimizely-sdk'),
      defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger'),
           dataFile = {"version": "4", "rollouts": [{"experiments": [{"status": "Not started", "key": "10673962079", "layerId": "10678700998", "trafficAllocation": [{"entityId": "10682510591", "endOfRange": 0 } ], "audienceIds": [], "variations": [{"variables": [], "id": "10682510591", "key": "10682510591", "featureEnabled": false } ], "forcedVariations": {}, "id": "10673962079"} ], "id": "10678700998"} ], "anonymizeIP": true, "projectId": "10683461849", "variables": [], "featureFlags": [{"experimentIds": ["10683770620"], "rolloutId": "10678700998", "variables": [{"defaultValue": "1000", "type": "integer", "id": "10673080993", "key": "priceCeiling"}, {"defaultValue": "tv", "type": "string", "id": "10678280658", "key": "category"}, {"defaultValue": "Here's your daily deal!", "type": "string", "id": "10680340843", "key": "dealResponse"} ], "id": "10685231285", "key": "dailyDealSkill"} ], "experiments": [{"status": "Running", "key": "dailyDealSkill_test", "layerId": "10677330777", "trafficAllocation": [{"entityId": "10675900974", "endOfRange": 2000 }, {"entityId": "10678330521", "endOfRange": 4000 }, {"entityId": "10678691194", "endOfRange": 6000 }, {"entityId": "10680500866", "endOfRange": 8000 }, {"entityId": "10684351053", "endOfRange": 10000 } ], "audienceIds": [], "variations": [{"variables": [{"id": "10680340843", "value": "For a very limited time Save  $270 on a Sony 50 inch 4k LED TV with a final price of $429.99. Want to learn more?"}, {"id": "10678280658", "value": "tv"}, {"id": "10673080993", "value": "1000"} ], "id": "10684351053", "key": "tv", "featureEnabled": true }, {"variables": [{"id": "10680340843", "value": "Get a PS4 Star Wars Battlefront 2 edition for $269, and save $30 off the retail price. Want to learn more?"}, {"id": "10678280658", "value": "gaming"}, {"id": "10673080993", "value": "1000"} ], "id": "10680500866", "key": "gaming", "featureEnabled": true }, {"variables": [{"id": "10680340843", "value": "50% off Master and Dynamic on ear headphones! Sale ends tomorrow, want to learn more?"}, {"id": "10678280658", "value": "headphone"}, {"id": "10673080993", "value": "1000"} ], "id": "10678330521", "key": "headphones", "featureEnabled": true }, {"variables": [{"id": "10680340843", "value": "Rise and shine with $10 off Mr. Coffee 4 cup programmable coffeemaker for only $14.99. Want to learn more?"}, {"id": "10678280658", "value": "appliance"}, {"id": "10673080993", "value": "1000"} ], "id": "10675900974", "key": "appliance", "featureEnabled": true }, {"variables": [{"id": "10680340843", "value": "Save $30 with on the latest Fitbit charge 2 activity tracker, and get moving for $119. Want to learn more?"}, {"id": "10678280658", "value": "fitness"}, {"id": "10673080993", "value": "1000"} ], "id": "10678691194", "key": "fitness", "featureEnabled": true } ], "forcedVariations": {}, "id": "10683770620"} ], "audiences": [], "groups": [], "attributes": [], "accountId": "8177152216", "events": [{"experimentIds": ["10683770620"], "id": "10680920316", "key": "respondedYes"}, {"experimentIds": ["10683770620"], "id": "10681750993", "key": "viewedProduct"}, {"experimentIds": ["10683770620"], "id": "10685341248", "key": "respondedNo"} ], "revision": "7"},
              Alexa = require('ask-sdk-core');

let optimizely = optimizelySDK.createInstance({ datafile: dataFile, logger: defaultLogger.createLogger({ logLevel: 1 })});

// Launch Helper
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    var speechOutput = "Skill kicked off!";
    var userId = Math.floor((Math.random() * 1000000) + 1).toString();
  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .withSimpleCard('Hello World', speechOutput)
    .getResponse();
  }
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    const speechText = 'Great!';
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const DailyDealHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DailyDeal';
  },
  handle(handlerInput) {
    let speechText = 'Well, this is awkward, there aren\'t any deals today';
    let userId = Math.floor((Math.random() * 1000000) + 1).toString();
    let enabled = optimizely.isFeatureEnabled('dailyDealSkill', userId);
    let priceCeiling = optimizely.getFeatureVariableInteger('dailyDealSkill', 'priceCeiling', userId);
    let category = optimizely.getFeatureVariableString('dailyDealSkill', 'category', userId);
    let dealResponse = optimizely.getFeatureVariableString('dailyDealSkill', 'dealResponse', userId);
    
    console.log('FEATURE ENABLED? ', enabled);
    console.log('CATEGORY ', category);

    if(enabled){
      speechText = dealResponse;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Deal of the day', speechText)
      .getResponse();
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    console.log('stop request USER ', userId);
    const speechText = 'Goodbye!';
    //optimizely.track('completedSession', userId);
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    return handlerInput.responseBuilder.getResponse();
  }
};

let skill;

exports.handler = Alexa.SkillBuilders.custom()
   .addRequestHandlers(LaunchRequestHandler,
                       HelloWorldIntentHandler,
                       DailyDealHandler,
                       HelpIntentHandler,
                       CancelAndStopIntentHandler,
                       SessionEndedRequestHandler)
   .lambda();