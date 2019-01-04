const rocket = require('@rocket.chat/sdk')
require('dotenv').config()
const respmap = require('./reply');
//const respmap3 = require('./reply');
const moment = require('moment')
let channelId = ''
let submited = []
let users = []
const TIME_DIALOG = '15:03:00';
const TIME_PUBLISH = '15:04:00';


// customize the following with your server and BOT account information
const HOST = process.env.ROCKETCHAT_URL;
const USER = process.env.ROCKETCHAT_USER;
const PASS = process.env.ROCKETCHAT_PASSWORD;
const BOTNAME = 'bot';  // name  bot response to
const SSL = true;  // server uses https ?
const ROOMS = ['test'];
const userInput= "";




var myuserid;
// this simple bot does not handle errors, different message types, server resets 
// and other production situations
const runbot = async () => {
    const conn = await rocket.driver.connect( { host: HOST, useSsl: SSL})
    myuserid = await rocket.driver.login({username: 'BahasoBot', password: 'bot123'});
    const roomsJoined = await rocket.driver.joinRooms(ROOMS);
    console.log('joined rooms');

    // set up subscriptions - rooms we are interested in listening to
    const subscribed = await rocket.driver.subscribeToMessages();
    console.log('subscribed');

    // connect the processMessages callback
    const msgloop = await rocket.driver.respondToMessages( Messages );
    console.log('connected and waiting for messages');

    // when a message is created in one of the ROOMS, we 
    // receive it in the processMesssages callback

    // greets from the first room in ROOMS 
    const sent = await rocket.driver.sendToRoom( BOTNAME + ' is listening ...',ROOMS[0]);
    console.log('Greeting message sent');
} 




// callback for incoming messages filter and processing
// const processMessages = async(err, message, messageOptions) => {
//   if (!err) {
//     // filter our own message
//     if (message.u._id === myuserid) return;
//     // can filter further based on message.rid
//     const roomname = await rocket.driver.getRoomName(message.rid);
//     if (message.msg.toLowerCase(userInput)) {
//         var response
//         let inputMessage = message.msg.substr(userInput);
//               if (inputMessage in respmap2) {
//                 submited.push(inputMessage)
//                 console.log(submited)
//                 response = inputMessage[respmap2];
                
//             }
//             const sentmsg = await rocket.driver.sendToRoom(response, roomname);
//         }
//     }
// }

const Messages = async(err, message, messageOptions) => {
  if (!err) {
    // filter our own message
    if (message.u._id === myuserid) return;
    // can filter further based on message.rid
    const roomname = await rocket.driver.getRoomName(message.rid)
    if (message.msg.toLowerCase(userInput)) {
        var response
        let inputMessage = message.msg.substr(userInput);
              if (inputMessage in respmap) {
                submited.push(inputMessage)
                console.log(submited)
                response = inputMessage[respmap];
                
            }
            const sentmsg = await rocket.driver.sendToRoom(response, roomname);
        }
    }
}
function getChannelMemberList() {
    console.log('try to get members from channel '+process.env.BOT_CHANNEL_NAME)

    rocket.api.get('channels.members', {
        roomId: channelId
    })
    .then(response => {
        users = []

        response.members.forEach(user => {
            if(!user.username.toLowerCase().includes('bot')) {
                users.push(user)
            }
        })

        console.log('get '+users.length+' members from channel '+process.env.BOT_CHANNEL_NAME)
    })
    .catch(error => {
        console.log(error)
    })
}

function inviteUserToChannel(username){
    rocket.api.post('channels.invite', {
        roomId: channelId,
        username: username
    })
    .then(response => {
        console.log('invite '+username+' to channel')
    })
    .catch(error => {
        console.log(error)
    })
}

function findInSubmit(username){
    let response = submited.find(submit => {
        return submit.user.name == username
    })

    return submited.indexOf(response)
}

rocket.api.get('channels.list')
.then(response => {
    console.log(response)
    response.channels.forEach(channel => {
        console.log(channel.name)
        if (channel.name == process.env.BOT_CHANNEL_NAME){
            channelId = channel._id
        }
    })

    getChannelMemberList()
})







setInterval(() => {
    if(moment().format('HH:mm:ss') == time.dialog) {
        users.forEach(user => {
            if (user.username == 'topgatling12') {
                rocket.driver.getDirectMessageRoomId(user.username)
                .then(userRoomId => {
                    rocket.driver.sendMessage({
                        rid: userRoomId,
                        msg: 'Hi, '+user.name+'. What did you do since yesterday? (answer with "yesterday {your answer}")'
                    })  
                })
                .catch(error => {
                    console.log(error)
                })
            }
        })
    }

    if(moment().format('HH:mm:ss') == time.publish) {
        let message1 = ''
        let message2 = ''
        let message3 = ''
        let unsubmited = ''


        users.forEach(user => {
            if (findInSubmit(user.username) < 0) {
                unsubmited+=' @'+user.username
            }
        })

        if (unsubmited.length > 0) {
            unsubmited = "i didn't hear from"+unsubmited
        }
        
        submited.forEach(submit => {
            message1+='> '+submit.user.fullName+'\n'+'> '+submit.message1+'\n'+'** ** \n'
            message2+='> '+submit.user.fullName+'\n'+'> '+submit.message2+'\n'+'** ** \n'
            message3+='> '+submit.user.fullName+'\n'+'> '+submit.message3+'\n'+'** ** \n'
        })

        rocket.driver.sendMessage({
            rid: channelId,
            msg: 'Hey, @here our daily stand-up team :coffee:\n'+
                 '**1. What did you do since yesterday?**\n'+
                 message1+
                 '**2. What will you do today?**\n'+
                 message2+
                 '**3. Anything is blocking your progress?**\n'+
                 message3+
                 unsubmited
        })
        .then(response => {
            submited = []
        })
        .catch(error => {
            console.log(error)
        })

    }
}, 1000)


 runbot()