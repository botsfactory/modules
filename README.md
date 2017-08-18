# Bots Factory - Modules
This is the source for BotsFactory by The Bot Makers
## Modules
**bots**factory is made of multiple optional modules (except the Users module), each adding a specific functionality to your bot.
### Analitycs
Let's you connect with Dashbot 
### Microsoft Bot Framework
All the module integrate with Microsoft Bot Framework to ease development
### Conversation
Saves messages exchanged between your users and your bot.
### Proactive
Let's you define multiple types of proactive messages scheduled, manual, triggered by other integrations, etc.
### FAQ
Adds a connection from your QnAMaker to your bot.
### i18n
Enables multi-language chatbots with switch language option
### Log Errors
Enables error logs with Rollbar for when something goes wrong.
#### POST
`/api/proactive/:id`
Executes a proactive handler of `id`, to all user that satisfy `query`.
```json
{
    "query": {}, // optional, for example {connieId: `asdasdasd-asda-asdasd-ad` } wil send a message to only that user.
    "arg1": {},
    ...
    "argn": {}
}
```
`/api/proactive/sendmessage`
Sends a message to all the users, that satisfy `query`
```json
{
    "query": {},
    "channelId": "facebook",
    "text": "message text"
}
```
`/api/proactive/beginDialog`
Starts a dialog with `dialogId` to all the users that satisfy `query`
```json
{
    "query": {},
    "channelId": "facebook",
    "dialogId": "/askSign"
}
```
### Users
Autmatically loads custom user info from their channels and lets you link multiple accounts.
## UNDER HEAVY DEVELOPMENT
