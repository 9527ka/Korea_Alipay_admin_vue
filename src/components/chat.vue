<template>
    <div class="chat-container">
        <div class="sidebar">
            <ul class="group-list">
                <li v-for="group in groups" :key="group.id" @click="selectGroup(group.id)"
                    :class="{ active: selectedListId === group.id }">
                    {{ group.name }}
                </li>
            </ul>
        </div>
        <div class="main-content">
            <div id="messages" class="messages"></div>
            <div class="input-group">
                <input v-model="message" type="text" placeholder="Type your message..." />
                <button @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const message = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const ws = ref<WebSocket | null>(null);
const selectedListId = ref('31d82e596de69e793223b362d592622f'); // 默认选中的群组
const groups = ref([
    { id: '1429d80efd7b34e024ed34a3f9fd067f', name: '高级红包小组' },
    { id: '635db41064cd21052754f24ddda0cb0e', name: '中级红包小组' },
    { id: '73470c204d434599e991d803212f186f', name: '初级级红包小组' }
]);

const _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5OCwiaXNzIjoiaW1faHR0cCIsImlhdCI6MTcyODQ0NDAyMywiZXhwIjoxNzY0NzMyMDIzLCJuYmYiOjE3Mjg0NDQwMjMsInN1YiI6IiIsImp0aSI6IjY0ZTJiMjIyY2Y3MDRhM2Q1MjIzNDg4YmVmMjZiYmI5In0.hciiP6XCdkyw-57iuueuONeNG39QocS1ZVeD02i_x4U';
const _agent_id = 0;
const content_type = 0;

function initWebSocket() {
    if (ws.value) {
        ws.value.close();
    }

    ws.value = new WebSocket(`wss://service.kq5.cc/wss`);

    ws.value.onopen = () => {
        console.log('Connected to the server');
        sendTokenVerification();
    };

    ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        if (data.action === 'checkToken') {
            return;
        }
        console.log(data.data.list_id + ' !== ' + selectedListId.value)
        if (data.data.list_id !== selectedListId.value) {
            console.log('Message filtered out due to different list_id');
            return;
        }
        if (data.action === 'chatData') {
            displayChatData(data);
        } else {
            displayMessage(data.data);
        }
    };
    ws.value.onclose = () => console.log('Disconnected from the server');
    ws.value.onerror = (error) => console.error('Error:', error);
}

function sendTokenVerification() {
    if (ws.value) {
        const tokenData = {
            action: 'checkToken',
            data: _token
        };
        ws.value.send(JSON.stringify(tokenData));
    }
}

function displayMessage(message: string) {
    if (messagesContainer.value) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messagesContainer.value.appendChild(messageElement);
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // 自动滚动到底部
    }
}

function displayChatData(data: any) {
    if (messagesContainer.value) {
        const chatData = data.data.data;
        const messageElement = document.createElement('div');
        const userInfo = chatData.msg.user_info;
        const content = chatData.msg.content;
        var face = 'https://service.kq5.cc/static/photo/' + userInfo.face;

        if (chatData.type == 0) {
            messageElement.classList.add('my-chat-message');
            if (chatData.msg.type == '5' || chatData.msg.type == '6') {
                var money = '';
                var text_msg = '';
                if (chatData.msg.type == 6) {
                    money = userInfo.money;
                    text_msg = userInfo.mobile + "成功搶到紅包";
                } else {
                    money = content.money;
                    text_msg = "本次红包由" + userInfo.mobile + "提供";
                }
                messageElement.innerHTML = `<div class="msg-box">
              <div class="user-name">${userInfo.name}</div>
              <div class="red-envelope msg">
                <div style="text-align: right;padding-right:10px;">
                  <div class="amount">₩${money}</div>
                  <div class="blessing">${text_msg}</div>
                </div>
                <div class="red red-box"><img src="https://service.kq5.cc/static/photo/red.png" class="red-img"></div>
              </div>
            </div>
            <div class="message-header">
              <img src="${face}" class="user-avatar">
            </div>`;
            } else {
                messageElement.innerHTML = `<div class="msg-box">
              <div class="user-name">${userInfo.name}</div>
              <div class="msg">
                <div class="msg-content">${content.text}</div>
              </div>
            </div>
            <div class="message-header">
              <img src="${face}" class="user-avatar">
            </div>`;
            }
        } else {
            messageElement.classList.add('chat-message');
            if (chatData.msg.type == '5' || chatData.msg.type == '6') {
                var money = '';
                var text_msg = '';
                if (chatData.msg.type == 6) {
                    money = userInfo.money;
                    text_msg = userInfo.mobile + "成功搶到紅包";
                } else {
                    money = content.money;
                    text_msg = "本次红包由" + userInfo.mobile + "提供";
                }
                messageElement.innerHTML = `<div class="message-header">
              <img src="${face}" class="user-avatar">
            </div>
            <div class="msg-box">
              <div class="user-name">${userInfo.mobile}</div>
              <div class="red-envelope msg">
                <div class="red red-box"><img src="https://service.kq5.cc/static/photo/red.png" class="red-img"></div>
                <div style="text-align: left;padding-left:10px;">
                  <div class="amount">₩${money}</div>
                  <div class="blessing">${text_msg}</div>
                </div>
              </div>
            </div>`;
            } else {
                messageElement.innerHTML = `<div class="message-header">
              <img src="${face}" class="user-avatar">
            </div>
            <div class="msg-box">
              <div class="user-name">${userInfo.mobile}</div>
              <div class="msg">
                <div class="msg-content">${content.text}</div>
              </div>
            </div>`;
            }
        }
        messagesContainer.value.appendChild(messageElement);
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // 自动滚动到底部
    }
}

async function sendMessage() {
    if (!message.value.trim()) return;
    try {
        const response = await fetch('https://service.kq5.cc/im/message/textMsg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                list_id: selectedListId.value,
                content_type: content_type.toString(),
                content: JSON.stringify({ text: message.value, tapmsg: [] }),
                _token: _token,
                _agent_id: _agent_id.toString()
            })
        });

        const data = await response.json();
        if (data.code === 0) { // 假设 0 是成功状态码
            displayMessage(`Me: ${message.value}`);
            message.value = ''; // 清空输入框
        } else {
            console.error('Failed to send message:', data);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function selectGroup(listId: string) {
    selectedListId.value = listId;
    console.log(listId)
    // 重置当前聊天记录
    if (messagesContainer.value) {
        messagesContainer.value.innerHTML = '';
    }
    // 重新初始化 WebSocket 连接
    // initWebSocket(selectedListId.value);
}

onMounted(() => {
    messagesContainer.value = document.getElementById('messages'); // 初始化 messagesContainer
    initWebSocket();
});

onBeforeUnmount(() => {
    if (ws.value) {
        ws.value.close();
    }
});
</script>

<style>
.main-content {
    width: 100%;
}

.red-box {
    background: #ffffff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    text-align: center;
    line-height: 58px;
}

.red-img {
    width: 31px;
    text-align: center;
    display: inline;
    vertical-align: sub;
}

.chat-container {
    display: flex;
    width: 100%;
    max-width: 85%;
    margin: auto;
    padding: 1rem;
}

.messages {
    height: 300px;
    overflow-y: scroll;
    border: 1px solid #ccc;
    padding: 1rem;
    margin-bottom: 1rem;
}

.input-group {
    display: flex;
}

input[type="text"] {
    flex: 1;
    padding: 0.5rem;
}

button {
    padding: 0.5rem 1rem;
}

.chat-message {
    display: flex;
    margin-bottom: 1rem;
}

.my-chat-message {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
}

.my-chat-message .msg-box {
    margin-right: 8px;
    text-align: right;
}

.message-header {
    display: flex;
    align-items: center;
}

.user-avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    margin-right: 0.5rem;
    margin-bottom: 30px;
}

.user-name {
    color: #a0a0a0;
}

.msg-box {
    position: relative;
    border-radius: 5px;
}

.msg {
    background-color: #98C2FF;
    border-radius: 5px;
    padding: 10px;
}

.chat-message .msg::before {
    content: '';
    position: absolute;
    top: 30px;
    left: -15px;
    border-width: 10px;
    border-style: solid;
    border-color: transparent #98c2ff transparent transparent;
}

.my-chat-message .msg::before {
    content: '';
    position: absolute;
    top: 30px;
    border-width: 10px;
    border-style: solid;
    right: -15px;
    border-color: transparent transparent transparent #98c2ff !important;
}

.red-envelope {
    text-align: center;
    display: flex;
    width: 270px;
}

.blessing {
    font-size: 14px;
    margin-bottom: 0.5rem;
}

.amount {
    font-size: 18px;
    color: #000000;
}

.number {
    font-size: 0.9rem;
    color: #666;
}

.msg-content {
    max-width: 300px;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    text-align: left;
}








.sidebar {
    width: 200px;
    border-right: 1px solid #ccc;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.group-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.group-list li {
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.group-list li.active {
    background-color: #007bff;
    color: white;
}

.group-list li:hover {
    background-color: #f0f0f0;
}
</style>