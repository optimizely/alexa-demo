'use strict';

const optimizelySDK = require('@optimizely/optimizely-sdk'),
      defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger'),
           dataFile = {"version": "4", "rollouts": [{"experiments": [{"status": "Not started", "key": "10962361102", "layerId": "10956230699", "trafficAllocation": [{"entityId": "10955220954", "endOfRange": 0}], "audienceIds": [], "variations": [{"variables": [], "id": "10955220954", "key": "10955220954", "featureEnabled": false}], "forcedVariations": {}, "id": "10962361102"}], "id": "10956230699"}], "anonymizeIP": true, "projectId": "10931961385", "variables": [], "featureFlags": [{"experimentIds": ["10918050455"], "rolloutId": "10956230699", "variables": [{"defaultValue": "hi this is a response", "type": "string", "id": "10939900461", "key": "response"}, {"defaultValue": "denim", "type": "string", "id": "10955431073", "key": "category"}], "id": "10943720961", "key": "inspirationAlexaSkill"}], "experiments": [{"status": "Not started", "key": "PRICE_SENSITIVITY_TEST", "layerId": "10972150451", "trafficAllocation": [{"entityId": "10931910578", "endOfRange": 5000}, {"entityId": "10955290433", "endOfRange": 10000}], "audienceIds": [], "variations": [{"variables": [], "id": "10955290433", "key": "regular_shopper"}, {"variables": [], "id": "10931910578", "key": "price_sensitive"}], "forcedVariations": {}, "id": "10918041183"}, {"status": "Running", "key": "inspirationAlexaSkill_test", "layerId": "10944080934", "trafficAllocation": [{"entityId": "10930090987", "endOfRange": 2000}, {"entityId": "10939920989", "endOfRange": 4000}, {"entityId": "10949471062", "endOfRange": 6000}, {"entityId": "10956271090", "endOfRange": 8000}, {"entityId": "10964240695", "endOfRange": 10000}], "audienceIds": [], "variations": [{"variables": [{"id": "10955431073", "value": "bootcut"}, {"id": "10939900461", "value": "Thoughts on boot cut? Want to learn more about this fit?"}], "id": "10939920989", "key": "variation_1", "featureEnabled": true}, {"variables": [{"id": "10955431073", "value": "skinny"}, {"id": "10939900461", "value": "Do you like your jeans skinny? We've got skinny jeans I know you'll love. Want to learn more about this fit?"}], "id": "10964240695", "key": "variation_2", "featureEnabled": true}, {"variables": [{"id": "10955431073", "value": "straight"}, {"id": "10939900461", "value": "Straight jeans are the perfect weekend cut with room to move, yet not to loose. Want to learn more about this fit?"}], "id": "10949471062", "key": "variation_3", "featureEnabled": true}, {"variables": [{"id": "10955431073", "value": "slim"}, {"id": "10939900461", "value": "In between skinny and straight, our slim jeans are some of the most popular. Want to learn more about this fit?"}], "id": "10956271090", "key": "variation_4", "featureEnabled": true}, {"variables": [{"id": "10955431073", "value": "relaxed"}, {"id": "10939900461", "value": "For the most relaxed look, may I recommend our relaxed fit. Want to learn more about this fit?"}], "id": "10930090987", "key": "variation_5", "featureEnabled": true}], "forcedVariations": {}, "id": "10918050455"}, {"status": "Not started", "key": "SORTING_ALGORITHM_EXPERIMENT", "layerId": "10948080503", "trafficAllocation": [{"entityId": "10962150817", "endOfRange": 5000}, {"entityId": "10962270995", "endOfRange": 10000}], "audienceIds": [], "variations": [{"variables": [], "id": "10962150817", "key": "POPULARITY_SORT"}, {"variables": [], "id": "10962270995", "key": "SORT_BY_PRICE"}], "forcedVariations": {}, "id": "10939840734"}, {"status": "Not started", "key": "WISH_LIST_FEATURE_ROLLOUT", "layerId": "10976790156", "trafficAllocation": [{"entityId": "10948030670", "endOfRange": 5000}, {"entityId": "10970220465", "endOfRange": 10000}], "audienceIds": [], "variations": [{"variables": [], "id": "10948030670", "key": "NO_WISH_LIST_FEATURE"}, {"variables": [], "id": "10970220465", "key": "SHOW_WISH_LIST"}], "forcedVariations": {}, "id": "10943790539"}], "audiences": [], "groups": [], "attributes": [], "botFiltering": false, "accountId": "8785893177", "events": [{"experimentIds": ["10918050455"], "id": "10929960439", "key": "respondedYes"}, {"experimentIds": ["10918050455"], "id": "10931920312", "key": "respondedNo"}, {"experimentIds": [], "id": "10941930970", "key": "COMPLETED_PURCHASE"}, {"experimentIds": [], "id": "10972170748", "key": "ADD_TO_CART"}], "revision": "9"},
              Alexa = require('ask-sdk');

// Initialize Optimizely client
let optimizely = optimizelySDK.createInstance({ datafile: dataFile, logger: defaultLogger.createLogger({ logLevel: 1 })});

// Optional, change the responses when a user confirms or denies your request
let confirmationResponse = "Great! I'll send you more information",
    deniedResponse = "Ok, next time we'll find you the perfect fit";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    var speechOutput = "Skill kicked off!";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};

const OptimizelyDemoHandler = {

  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'OptimizelyDemo';
  },

  handle(handlerInput) {
    let speechText = 'Well, this is awkward I don\'t have anything to say';

    // Set the userId as the session ID from the Alexa Skill
    let userId = handlerInput.requestEnvelope.session.sessionId;

    // Check to see the status of the intent
    if(handlerInput.requestEnvelope.request.intent.confirmationStatus === "CONFIRMED"){
      var category = optimizely.getFeatureVariableString('inspirationAlexaSkill', 'category', userId);
      // Response when a user accepts the intent
      speechText = confirmationResponse + ' on the ' + category + ' fit';
      
      // Track the dialog response in Optimizely
      optimizely.track('respondedYes', userId);

      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } 

    // Check to see if the user rejected the prompt
    else if (handlerInput.requestEnvelope.request.intent.confirmationStatus === "DENIED") {
      
      // Response when the user rejects the prompt
      speechText = deniedResponse;

      // Track event that the user rejected the recommendation
      optimizely.track('respondedNo', userId);
      
      return handlerInput.responseBuilder
        .speak(speechText)
        .withShouldEndSession(true)
        .getResponse();

    } else {

      // Access feature flag and feture variables from Optimizely
      var enabled = optimizely.isFeatureEnabled('alexaDemo', userId);
      var category = optimizely.getFeatureVariableString('alexaDemo', 'category', userId);
      var response = optimizely.getFeatureVariableString('alexaDemo', 'response', userId);
      
      // If the feature is enabled, give them one of the feature variables
      if(enabled){
        speechText = response;
      }

      return handlerInput.responseBuilder
        .speak(speechText)
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
                       OptimizelyDemoHandler,
                       HelpIntentHandler,
                       CancelAndStopIntentHandler,
                       SessionEndedRequestHandler)
   .lambda();