'use strict';

const optimizelySDK = require('@optimizely/optimizely-sdk'),
      defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger'),
           dataFile = {"version": "4", "rollouts": [{"experiments": [{"status": "Not started", "key": "10826731225", "layerId": "10802195136", "trafficAllocation": [{"entityId": "10827941281", "endOfRange": 0 } ], "audienceIds": [], "variations": [{"variables": [], "id": "10827941281", "key": "10827941281", "featureEnabled": false } ], "forcedVariations": {}, "id": "10826731225"} ], "id": "10802195136"} ], "anonymizeIP": false, "projectId": "10804205657", "variables": [], "featureFlags": [{"experimentIds": ["10799256266"], "rolloutId": "10802195136", "variables": [{"defaultValue": "forex", "type": "string", "id": "10792846226", "key": "category"}, {"defaultValue": "Default response from Alexa skill", "type": "string", "id": "10799256241", "key": "response"} ], "id": "10813044048", "key": "inspirationAlexaSkill"} ], "experiments": [{"status": "Running", "key": "alexaSkill", "layerId": "10795615136", "trafficAllocation": [{"entityId": "10795846264", "endOfRange": 2000 }, {"entityId": "10797074292", "endOfRange": 4000 }, {"entityId": "10801826758", "endOfRange": 6000 }, {"entityId": "10828821070", "endOfRange": 8000 }, {"entityId": "10831651291", "endOfRange": 10000 } ], "audienceIds": [], "variations": [{"variables": [{"id": "10799256241", "value": "It’s summer and it’s 2018 which means that the FIFA World Cup is here. This battle for glory by national football teams from around the globe is mirrored by the battle fought by countries on electronic exchanges as they compete for global investors. Want to learn more?"}, {"id": "10792846226", "value": "games"} ], "id": "10797074292", "key": "variation_1", "featureEnabled": true }, {"variables": [{"id": "10799256241", "value": "Crypto Update: Rising in the East. This week the entire crypto market cap rose 4% to over $340 billion. Want to learn more?"}, {"id": "10792846226", "value": "crypto"} ], "id": "10831651291", "key": "variation_2", "featureEnabled": true }, {"variables": [{"id": "10799256241", "value": "Oil caught in a flood of conflicting news. WTI Crude oil, down 10% from its recent peak, with Venezuela's output is in free fall; the US has asked Saudi Arabia and others to raise production. Want to learn more?"}, {"id": "10792846226", "value": "commoditites"} ], "id": "10795846264", "key": "variation_3", "featureEnabled": true }, {"variables": [{"id": "10799256241", "value": "Euro focus more on ECB than Italy. Estimates suggest that a full implementation of the populist programme of flat taxes, a universal basic income, and other measures could cost some 4-5% of GDP and therefore put Italy in massive violation of the EU’s budget deficit rules. Want to learn more?"}, {"id": "10792846226", "value": "forex"} ], "id": "10828821070", "key": "variation_4", "featureEnabled": true }, {"variables": [{"id": "10799256241", "value": "Kay Van-Petersen, Global Macro Strategist suggests shorting silver on the Jun13 Fed hike meeting. Want to learn more?"}, {"id": "10792846226", "value": "tradeView"} ], "id": "10801826758", "key": "variation_5", "featureEnabled": true } ], "forcedVariations": {}, "id": "10799256266"} ], "audiences": [], "groups": [], "attributes": [], "botFiltering": false, "accountId": "1893931342", "events": [{"experimentIds": ["10799256266"], "id": "10793974956", "key": "respondedNo"}, {"experimentIds": ["10799256266"], "id": "10796886114", "key": "respondedYes"} ], "revision": "5"},
              Alexa = require('ask-sdk');

// Initialize Optimizely client
let optimizely = optimizelySDK.createInstance({ datafile: dataFile, logger: defaultLogger.createLogger({ logLevel: 1 })});

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    var speechOutput = "Skill kicked off!";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .withSimpleCard('Hello World', speechOutput)
      .getResponse();
  }
};

const DailyDealHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'DailyDeal';
  },
  handle(handlerInput) {
    let speechText = 'Well, this is awkward, there aren\'t any insights today';

    // Set the userId as the session ID from the Alexa Skill
    let userId = handlerInput.requestEnvelope.session.sessionId;
    console.log('USER ID aka session id = ', userId);

    // Check to see the status of the intent
    if(handlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED"){
      console.log('User confirmed intent');

      // Response when a user accepts the 
      speechText = "Excellent! I'll send you the full article.";
      optimizely.track('respondedYes', userId);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } 

    // Check to see if the user rejected the prompt
    else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED") {
      
      // Response when the user rejects the prompt
      speechText = "Ok, no problem"

      // Track event that the user rejected the recommendation
      optimizely.track('respondedNo', userId);
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } else {

      // Access feature flag and feture variables from Optimizely
      var enabled = optimizely.isFeatureEnabled('inspirationAlexaSkill', userId);
      var category = optimizely.getFeatureVariableString('inspirationAlexaSkill', 'category', userId);
      var response = optimizely.getFeatureVariableString('inspirationAlexaSkill', 'response', userId);
      
      // If the feature is enabled, give them one of the feature variables
      if(enabled){
        speechText = response;
      }

      console.log('FEATURE ENABLED? ', enabled);
      console.log('CATEGORY ', category);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Deal of the day', speechText)
        .addConfirmIntentDirective(handlerInput.requestEnvelope.request.intent)
        .getResponse();      
    }
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
                       DailyDealHandler,
                       HelpIntentHandler,
                       CancelAndStopIntentHandler,
                       SessionEndedRequestHandler)
   .lambda();