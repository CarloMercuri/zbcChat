const emoji_btn = document.querySelector('#emoji-btn');
const picker = new EmojiButton();
const popup = document.querySelector('.chat-popup');
const chatBtn = document.querySelector('.chat-btn');
const chatSubmitBtn = document.querySelector('.chat-submit-btn');
const chatArea = document.querySelector('.chat-area');
const adminArea = document.querySelector('.admin-chats-popup');
const inputElm = document.querySelector('input[name="msg-input');
const adminChatArea = document.querySelector('.admins-chat-area');
const nameInputArea = document.querySelector('.name-input-area');
const nameInputElm = document.querySelector('input[name="name-input');
const adminRefreshButton = document.querySelector('.admin-refresh-button');
const uuidCookieName = "zbc_auth_uuid";

const GET_ADDRESS = "https://localhost:44394/api/Conversation";
const ADMIN_GET_ADDRESS = "https://localhost:44394/api/Conversation/"
//const POST_ADDRESS = "https://localhost:44394/api/Conversation";
//const POST_ADDRESS = "zbctest.taotek.dk/api/Conversation/PostMessage";
const POST_ADDRESS = "https://localhost:44333/api/Chat";

// data
const user_name = "";
const own_uuid = "";
const is_admin = false;


// Returns a Promise that resolves after "ms" Milliseconds
const timer = ms => new Promise(res => setTimeout(res, ms))

const chatRefreshTime = 1500;

function InitializeSetup() {
    let isChatActive = false;   

    // When a new session starts, ask for username
    if(nameInputArea.classList.contains('show')) {
        nameInputArea.classList.remove('show');
    }

    // Set the color of the button to user color
    //chatBtn.classList.add('color-adminred');
    chatBtn.classList.add('color-dodgerblue');
    
    setCookie(uuidCookieName, generateUUID(), 120);
    /*
    adminRefreshButton.addEventListener('click', () => {

    });
    */
}

InitializeSetup();


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

chatSubmitBtn.addEventListener('click', () => {
    submitChatMessage(inputElm.value);
})

// Triggered when a chat message is sent
function submitChatMessage(msg) {

    if(msg === "/stop") {
        endChatSession();
        return;
    }   

    inputElm.value = "";

    // Append the message
    appendUserMessage(msg)

    // send to POST
    sendUserMessagePost(msg, "carlo");

    isChatActive = true;
    //chatLoop();
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

/////////// ADMIN /////////////////

function addQueuedConversation(user_name, message, uuid) {
    const parentDiv = document.createElement('div');
    const userNameDiv = document.createElement('div');
    const bodyDiv = document.createElement('div');

    parentDiv.classList.add('admins-chat-queue-parent');
    userNameDiv.classList.add('admins-chat-queue-user-name');
    bodyDiv.classList.add('admins-chat-queue-body');

    userNameDiv.innerHTML += user_name;
    bodyDiv.innerHTML += message;

    userNameDiv.append(bodyDiv);
    parentDiv.append(userNameDiv);

    // Add the click function with the given UUID
    parentDiv.addEventListener('click', function () {
        queueMessageClick(uuid);
    });

    adminChatArea.append(parentDiv);
}

function queueMessageClick(uuid) {
    console.log(`Clicked on queued message with id: ${uuid}`);
}

function switchToAdminMode() {
    chatBtn.classList.remove('color-dodgerblue');
    chatBtn.classList.add('color-adminred');

    if(!adminArea.classList.contains('show')) {
        adminArea.classList.add('show');
    }
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

    if(own_uuid == "") {
        return generateUUID();
    } else {
        return own_uuid;
    }
    /*
    if(getCookie(uuidCookieName) == "") {
        setCookie(uuidCookieName, generateUUID(), 120);
    }
    // I'd rather do this twice so we are sure we are getting the one stored on the machine
    return getCookie(uuidCookieName);
    */
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

const getAdminQueueAction = (callback) => {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if(request.readyState === 4 && request.status === 200){ 
            callback(undefined, request.responseText);
        } else if (request.readyState === 4) {
            callback('Error getting messages', undefined);
        }
    });

    let address = ADMIN_GET_ADDRESS.concat('/0');

    //request.open('GET', 'https://jsonplaceholder.typicode.com/todos')
    request.open('GET', address)

    // Gets the UUID and sets it in the header. Creates one if not existing already
    request.setRequestHeader("zbc_auth_uuid", getUUID()); 

    request.send();
}

function getAdminQueueUpdate() {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if(request.readyState === 4 && request.status === 200){ 
            // process data
        } else if (request.readyState === 4) {
            // error
        }
    });

    let address = ADMIN_GET_ADDRESS.concat('/0');

    //request.open('GET', 'https://jsonplaceholder.typicode.com/todos')
    request.open('GET', address)

    request.setRequestHeader("zbc_auth_uuid", getUUID()); 

    request.send();
}

function getAdminConversationUpdate(targ_uuid) {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {
        if(request.readyState === 4 && request.status === 200){ 
            // process data
        } else if (request.readyState === 4) {
            // error
        }
    });

    let address = ADMIN_GET_ADDRESS.concat('/1');

    //request.open('GET', 'https://jsonplaceholder.typicode.com/todos')
    request.open('GET', address)

    request.setRequestHeader("zbc_auth_uuid", getUUID()); 
    request.setRequestHeader("zbc_target_uuid", targ_uuid); 

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

function sendGetQueuedMessages() {

}



// POST 

// Formats the data in JSON
function formatPostMessage(msg, username) {
    return JSON.stringify({
        Message: msg
    })
}


function sendUserMessagePost(msg, username) {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', function() {
        if(this.readyState === this.DONE) {
            var json = JSON.parse(this.responseText);
            console.log(this.responseText);
            switch(json.Code) {
                case "#ZBC_CODE_140":
                    switchToAdminMode();
                    break;
            }
        }
    })

    request.open('POST', POST_ADDRESS);
    request.setRequestHeader('zbc_auth_uuid', getUUID());
    request.setRequestHeader('zbc_user_name', user_name);
    request.setRequestHeader('Content-Type', "application/json");
    

    // Formats the data into JSON and send the POST
    //request.send(formatPostMessage(msg, user_name), user_name);
    request.send("test");

    
}

