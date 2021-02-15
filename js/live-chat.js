const emoji_btn = document.querySelector('#emoji-btn');
const picker = new EmojiButton();
const popup = document.querySelector('.chat-popup');
const chatBtn = document.querySelector('.chat-btn');
const chatSubmitBtn = document.querySelector('.chat-submit-btn');
const chatArea = document.querySelector('.chat-area');
const inputElm = document.querySelector('input[name="msg-input');
const nameInputArea = document.querySelector('.name-input-area');
const nameInputElm = document.querySelector('input[name="name-input');
const uuidCookieName = "zbc_auth_uuid";

const GET_ADDRESS = "https://localhost:44333/api/Chat";
const POST_ADDRESS = "https://localhost:44333/api/Chat";


// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

const chatRefreshTime = 1500;

let isChatActive = false;

// When a new session starts, ask for username
if(nameInputArea.classList.contains('show')) {
    nameInputArea.classList.remove('show');
}


console.log(getUUID());



// Add the ability to send messages with enter
inputElm.addEventListener('keyup', ({key}) => {
    if (key === "Enter") {
        submitChatMessage(inputElm.value);
        inputElm.value = "";
    }
})

// Emoji section
picker.on('emoji', emoji => {
    emoji_btn.innerHTML = emoji;
    inputElm.value += emoji;
});

emoji_btn.addEventListener('click', () => picker.togglePicker(emoji_btn));

// Chat toggler
chatBtn.addEventListener('click', () => {
    popup.classList.toggle('show');
    inputElm.focus();
})

// Sending messages with the button
chatSubmitBtn.addEventListener('click', submitChatMessage);

// Triggered when a chat message is sent
function submitChatMessage(msg) {

    if(msg === "/stop") {
        endChatSession();
        return;
    }   

    // Append the message
    appendUserMessage(msg)

    // send to POST
    sendPostMessage("hello", "carlo");

    isChatActive = true;
    chatLoop();


}

// Appends the user message
function appendUserMessage(userInput) {
    let messageText = `<div class="user-msg-container"> 
    <span class="user-msg-body">${userInput}</span>
    </div>`;

    chatArea.insertAdjacentHTML("beforeend", messageText);
}

function appendTeacherMessage(msg) {
    let messageText = `<div class="incoming-msg"> 
    <span class="incoming-msg-body">${msg}</span>
    </div>`;

    chatArea.insertAdjacentHTML("beforeend", messageText);
}

                                ///////// LOGIC  ////////////

function endChatSession(){
    isChatActive = false;
}
                                
// Keeps going untill isChatActive is false
async function chatLoop () {
    if(isChatActive) {
        getMessages();
        await timer(chatRefreshTime);
        chatLoop();
    }
}


                                   ////////// API ///////////

// UUID

function getUUID(){

    if(getCookie(uuidCookieName) == "") {
        setCookie(uuidCookieName, generateUUID(), 120);
    }
    // I'd rather do this twice so we are sure we are getting the one stored on the machine
    return getCookie(uuidCookieName);
}

// Generate a random UUID
function generateUUID() { 
    var d = new Date().getTime(); //Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// sets the specified cookie
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }


// Attempts to grab the specified cookie, otherwise returns an empty string
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}


// GET

const getMessagesAction = (callback) => {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        //console.log(request, request.readyState);
        if(request.readyState === 4 && request.status === 200){ 
            callback(undefined, request.responseText);
        } else if (request.readyState === 4) {
            callback('Error getting messages', undefined);
        }
    });

    //request.open('GET', 'https://jsonplaceholder.typicode.com/todos')
    request.open('GET', GET_ADDRESS)

    // Gets the UUID and sets it in the header. Creates one if not existing already
    request.setRequestHeader("zbc_auth_uuid", getUUID()); 

    request.send();
}



function getMessages() {

    if(!isChatActive) return;

    getMessagesAction((error, data) => {
        if(error) {
            console.log(error);
        } else {
            console.log(data);
        }
    });
}



// POST 

// Formats the data in JSON
function formatPostMessage(msg, username) {
    return JSON.stringify({
        user_name: username,
        message: msg
    })
}



// Sends POST message to the server
function sendPostMessage(msg, user_name) {
    const request = new XMLHttpRequest();
    //request.withCredentials = true;
    

    request.addEventListener('readystatechange', function() {
        if(this.readyState === this.DONE) {
            console.log(this.responseText);
        }
    })

    

    request.open('POST', POST_ADDRESS);
    request.setRequestHeader('zbc_auth_uuid', getUUID());
    request.setRequestHeader('zbc_user_name', getUUID());
    request.setRequestHeader('Content-Type', "application/json");

    // Formats the data into JSON and send the POST
    request.send(formatPostMessage(msg, user_name));
    
}

