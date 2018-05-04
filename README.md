#Overview
---
This demo shows how Full Stack and feature management could be applied to an Amazon Alexa skill.

For the purpose of this demo, we build a "daily deal" feature that recommends a daily deal. The functionality of this feature uses Feature Managemand, and feature variables to change the category, price ceiling, and actual responses from Alexa.

Additionally, we use the Twilio SDK to send a text message with a link to the product so that we can show cross device tracking.

This demo is hosted via a Lambda function, and uses the latest Alexa Skills Kit (ASK) SDK.

*Important to note*
This demo uses a static datafile. In the future, a better approach would be either, to grab a new datafile per request, or setup a datafile service that stores the datafile in S3 that the lambda function can then consume.
