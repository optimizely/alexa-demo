'use strict';
const optimizelySDK = require('@optimizely/optimizely-sdk'),
      defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger'),
              Alexa = require('ask-sdk'),
                 rp = require('request-promise');

// Setup undefined Optimizlely object
// We'll define this later, and will be temporarily cached by Amazon
let optimizelyClientInstance;

// Function to get datafile and initialize Optimizely client
let initOptimizely = (projectID) => {

  // Options to get the datafile via CDN
  let options = {
    uri: `https://cdn.optimizely.com/json/${projectID}.json`,
    json: true
  }
  
  console.log('Initializing Optimizely Client');

  // Options to get the datafile via REST api
  // let options = {
  //     uri: `https://www.optimizelyapis.com/experiment/v1/projects/${projectID}/json`,
  //   headers: {
  //       'Authorization': 'Bearer ' + process.env.OPTIMIZELY_TOKEN
  //   },
  //   json: true
  // };

  // Returns promise to make GET request to Optimizely API
  return rp(options)
    .then( (datafile) => {
      console.log('Here\s the datafile: ', datafile);
      optimizelyClientInstance = optimizelySDK.createInstance(
        { 
          datafile: datafile, // Datafile returned from request
          logger: defaultLogger.createLogger({ logLevel: 1 }) // Default logger provided by SDK
        }
      )
    })
    .catch( (err) => {
      console.log('There was an error: ', err);
    })
};

// Here are the responses we'll give when a user either accepts or denies our confirmation
let confirmationResponse = "Great! I'll send you more information",
    deniedResponse = "Ok, maybe next time";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    let speechOutput = "You've kicked off the Optimizely Full Stack demo. Say a phrase that's mapped to one of my intents to get a variation of a test.";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  }
};

// Alexa intent where we're going to test our responses!
const OptimizelyDemoHandler = {

  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'OptimizelyDemo';
  },

  // Use async incase we need to get a new datafile - this is Node after all!
  async handle(handlerInput) {

    // Set the userId as the session ID from the Alexa Skill
    // This will get a new user ID on each session - alternatively use deviceId
    let userId = handlerInput.requestEnvelope.session.sessionId;

    let speechText = 'Well, this is awkward I don\'t have anything to say';
    let status = handlerInput.requestEnvelope.request.intent.confirmationStatus;

    // Check to see the status of the intent
    if( status === "NONE"){

      // Check to see if Optimizely Client exists...
      // If it doesn't we'll make a request to the REST api (most up to date), and init the client
      if(!optimizelyClientInstance){
        await initOptimizely(process.env.PROJECT_ID);
      }
    
      /*** 
         OPTIMIZELY FEATURE FLAGS GO HERE
      ***/

      let enabled = optimizelyClientInstance.isFeatureEnabled('personal_stylist', userId);
      let response = optimizelyClientInstance.getFeatureVariableString('personal_stylist', 'response', userId);

      // Send back response with feature variable if applicable
      return handlerInput.responseBuilder
        .speak(enabled ? response : speechText)
        .addConfirmIntentDirective(handlerInput.requestEnvelope.request.intent)
        .getResponse();

    // How to respond if a user accepts my confirmation question
    } else if ( status === "CONFIRMED" ){
      
      // Send tracking event to Optimizely
      optimizelyClientInstance.track('respondedYes', userId);

      return handlerInput.responseBuilder
        .speak(confirmationResponse)
        .withShouldEndSession(true)
        .getResponse();

    // Check to see if the user rejected the prompt
    } else if ( status === "DENIED" ) {

      // Track event that the user rejected the recommendation
      optimizelyClientInstance.track('respondedNo', userId);
      
      return handlerInput.responseBuilder
        .speak(deniedResponse)
        .withShouldEndSession(true)
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