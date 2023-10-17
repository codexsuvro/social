import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import "./Chat.css";
import LogoSearch from '../../components/LogoSearch/LogoSearch';
import { userChats } from '../../api/ChatRequests';
import Conversation from '../../components/Conversation/Conversation';
import ChatBox from '../../components/ChatBox/ChatBox';
import NavIcons from '../../components/NavIcons/NavIcons';
import {io} from "socket.io-client";

const Chat = () => {

    const [currentChat, setCurrentChat] = useState(null);

    const { user } = useSelector((state) => state.authReducer.authData);

    const [chats, setChats] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const [sendMessage, setSendMessage] = useState(null);

    const [receiveMessage, setReceiveMessage] = useState(null);

    const socket = useRef();

    useEffect(() => {
        if (sendMessage !== null) {
            socket.current.emit('send-message', sendMessage);
        };
    }, [sendMessage]);

    useEffect(() => {
        socket.current = io('http://localhost:8800');
        socket.current.emit("new-user-add", user._id);
        socket.current.on('get-users', (users) => {
            setOnlineUsers(users);
        });
    }, [user]);

    useEffect(() => {
        const getChats = async () => {
            try {
                const { data } = await userChats(user._id);
                setChats(data);
            } catch (error) {
                console.log(error);
            }
        };
        getChats();
    }, [user._id]);

    useEffect(() => {
        socket.current.on("receive-message", (data) => {
            setReceiveMessage(data);
        });
    }, []);

    const checkOnlineStatus = (chat) => {
        const chatMember = chat.members.find((member) => member !== user._id);
        const online = onlineUsers.find((user) => user.userId === chatMember);
        return online ? true : false;
    };

    return (
        <div className="Chat">
            {/* Left Side Components */}
            <div className="Left-side-chat">
                <LogoSearch />
                <div className="Chat-container">
                    <h2>Chats</h2>
                    <div className="Chat-list">
                        {chats.map((chat) => (
                            <div onClick={() => setCurrentChat(chat)}>
                                <Conversation data={chat} currentUserId={user._id} online={checkOnlineStatus(chat)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Right Side Components */}
            <div className="Right-side-chat">
                <div style={{width: '20rem', alignSelf: 'flex-end'}}>
                    <NavIcons />
                </div>
                {/* Chat body */}
                <ChatBox chat={currentChat} currentUser={user._id} setSendMessage={setSendMessage} receiveMessage={receiveMessage} />
            </div>
        </div>
    );
};

export default Chat;