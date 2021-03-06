import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../firebase/Auth';
import io from 'socket.io-client';
const domain = process.env.REACT_APP_DOMAIN || `https://aglie-monsters-frontend.herokuapp.com/`
const apiDomain = process.env.REACT_APP_API_DOMAIN || `https://agile-monsters.herokuapp.com`;
const port = process.env.EXPRESS_PORT || ``;
const socket = io(`${domain}:${port}/chat`,{transports: ['websocket'], upgrade: false});

export default function Chat(props) {
    const { currentUser } = useContext(AuthContext);
    const [roomName, setRoomName] = useState(null);

    useEffect(() => {
        console.log(currentUser.displayName);
        if (roomName !== props.match.params.roomname) setRoomName(props.match.params.roomname);
        if (roomName) socket.emit('join', { name: currentUser.displayName, room: roomName });
    }, [roomName, props.match.params.roomname]);

    useEffect(()=>{
        socket.on("message", ({user, text}) => {
            addMessage(user, text);
        });
    }, []);

    function addMessage(user, text) {
        const messages = document.querySelector("#chat-messages");
        const li = document.createElement("li");
        li.innerHTML = user + ": " + text;
        if (user === 'Admin') li.className = 'admin-message';
        messages.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
    }

    const sendText = (e) => {
        e.preventDefault();
        const input = document.querySelector(".input");
        if(input.value) socket.emit("message", { name: currentUser.displayName, room: roomName, message: input.value });
        input.value = "";
        return false;
    }

    return (
        <div id='chat-div'>
            <ul id="chat-messages"></ul>
            <form id='chat-message-form'>
                <label htmlFor='chat-input'/>
                <input type="text" className="input" autoComplete="off" id='chat-input' autoFocus />
                <button onClick={sendText}>Send</button>
            </form>
        </div>)
}

