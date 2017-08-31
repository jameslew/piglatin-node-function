"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var unicodelib = require("unicode-properties");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

bot.dialog('/', function (session) {
    
    var replyMessage = new builder.Message(session);
    replyMessage.textFormat("plain");
    
   if (session.message.text=="MessageTypesTest") {
        var mtReply = session.send(messageTypesTest(session));
        return;
    }
    else if (session.message.text=="DataTypesTest") {
        //Activity dtResult = await dataTypesTest(message, connector);
        //var dtReply = session.send(replyMessage);
        //return;
    }
    //else if (session.message.text=="CardTypesTest") {
    //      var ctResult = await cardTypesTest(message, connector);
    //      var reply = session.send(replyMessage);
    //      return;
    //}
    else if (session.message.text == "OneOffTests") {
        oneOffTests_facebook_quick_replies(session);
        return;
    }
    else if (session.message.text.substr(0, 13) == "EmojiRepeater") {
        replyMessage.text(session.message.text);
        replyMessage.textFormat("markdown");
        session.send(replyMessage);
        return;
    }
    else
    {
        replyMessage.text(translateToPigLatin(session.message.text));
        session.send(replyMessage);
    }


});



if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

function messageTypesTest(session) {
    var message = session.message; 
    var address = clone(message.address);
    address.conversation.delete();

    var newDirectToUser = new builder.Message(session)
        .text("Should go directly to user")
        .address(address);
    
    session.send(newDirectToUser);
    
    var replyToConversation = new builder.message(session);
    replyToConversation.text("Should go back to the group or individual chat");
    session.send(replyToConversation);
}

function oneOffTests_slack_unfurl(session) {
    
    var replyMessage = new builder.Message(session)
        .text("<http://www.youtube.com/watch?v=wq1R93UMqlk>");
    
    replyMessage.channelData = ({
        unfurl_links: "true",
        unfurl_media: "true"
    });

    session.send(replyMessage);
}

function oneOffTests_facebook_quick_replies(session) {
    
    var replyMessage = new builder.Message(session)
        .text("Testing");

    replyMessage.sourceEvent({ 
            facebook: { 
                quick_replies: [{
                    content_type:"text",
                    title:"Red",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_RED",
                    image_url:"https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Button_Icon_Red.svg/300px-Button_Icon_Red.svg.png"
                },            
                {
                    content_type:"text",
                    title:"Blue",
                    payload:"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_BLUE",
                    image_url:"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Button_Icon_Blue.svg/768px-Button_Icon_Blue.svg.png"
                },
                {
                    content_type:"location"
                }
                ]
             }
        });

    session.send(replyMessage);
}

function oneOffTests_HeroCard_WithShare(session) {
    
    var replyMessage = new builder.Message(session)
        .text("Testing");

    var card = new builder.HeroCard(session)
        .title('BotFramework Hero Card')
        .subtitle('Your bots — wherever your users are talking')
        .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
        .images([new builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')])
        .buttons([new builder.CardAction.openUrl(session, 'https://docs.botframework.com/en-us/', 'Get Started'), {"type":"element_share"}]);

    replyMessage.addAttachment(card);
    session.send(replyMessage);
}

function emojiRepeater(session) {
    
    var replyMessage = new builder.Message(session)
        .text(session.Message.text);
}

function translateToPigLatin(message)
{
    var english = TrimPunctuation(message);
    var pigLatin = "";
    var firstLetter;
    var restOfWord;
    var vowels = "AEIOUaeiou";
    var letterPos;
    var outBuffer = "";
    
    english.split(" ").forEach(function(word)
    {
        if (word !== "") {
            firstLetter = word.substring(0, 1);
            restOfWord = word.substring(1, word.length);
            letterPos = vowels.indexOf(firstLetter);
            if (letterPos == -1) {
                //it's a consonant
                pigLatin = restOfWord + firstLetter + "ay";
            }
            else {
                //it's a vowel
                pigLatin = word + "way";
            }
            outBuffer += pigLatin + " ";
        }
    });
    return outBuffer.trim();
}

/// &llt;summary>
/// TrimPunctuation from start and end of string.
/// </summary>
function TrimPunctuation(value)
{
    // Count start punctuation.
    var removeFromStart = 0;
    for (var i = 0; i < value.length; i++) {
        if (unicodelib.isPunctuation(value[i]) || value[i] == '@') {
            removeFromStart++;
        }
        else {
            break;
        }
    }
    
    // Count end punctuation.
    var removeFromEnd = 0;
    for (var i = value.length - 1; i >= 0; i--) {
        if (unicodelib.isPunctuation(value[i])) {
            removeFromEnd++;
        }
        else {
            break;
        }
    }
    // No characters were punctuation.
    if (removeFromStart === 0 &&
                removeFromEnd === 0) {
        return value;
    }
    // All characters were punctuation.
    if (removeFromStart == value.length &&
                removeFromEnd == value.length) {
        return "";
    }
    // Substring.
    return value.substring(removeFromStart,
                value.length - removeFromEnd - removeFromStart);
}

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}
