<template>
    <div class="chat-container">
        <div class="sidebar">
            <div class="chat-box">
                <div class="user-group">
                    <div class="user-box" @click="selectTab('user')" :class="{ active: activeTab === 'user' }">一般客服
                    </div>
                    <div class="group-box" @click="selectTab('group')" :class="{ active: activeTab === 'group' }">红包群
                    </div>
                </div>
                <ul class="chat-list" v-show="activeTab === 'user'">
                    <li v-for="u in userBoxData" :key="u.list_id" @click="selectUser(u.list_id)"
                        :class="{ active: selectedListId === u.list_id }">
                        <div class="head-msg">
                            <div class="message-header head-box">
                                <img :src="u.face" class="user-avatar">
                                <div class="no-read-num" v-if="u.no_reader_num > 0">{{ u.no_reader_num }}</div>
                            </div>
                            <div class="name-msg">
                                <div class="name-time">
                                    <div class="name-txt">{{ u.name }}</div>
                                    <div class="time-txt">{{ formatTime(u.time) }}</div>
                                </div>
                                <div class="msg-txt">{{ u.msg }}</div>
                            </div>
                        </div>
                    </li>
                </ul>

                <ul class="group-list" v-show="activeTab === 'group'">
                    <li v-for="group in groupBoxData" :key="group.id" @click="selectGroup(group.id)"
                        :class="{ active: selectedListId === group.id }">
                        {{ group.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="main-content">
            <div id="messages" class="messages"></div>
            <div class="input-group">
                <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 6 }" v-model="message" maxlength="200"
                    show-word-limit clearable />
                <button @click="sendMessage" class="el-button el-button--primary msg-btn"
                    :class="{ 'disabled-btn': !selectedListId }" :disabled="isSending">
                    <text v-if="isSending">发送中...</text>
                    <text v-else>发送</text>
                </button>
            </div>
        </div>
        <transition name="fade">
            <div v-if="showModal" class="modal-overlay" @click="showModal = false">
                <div class="modal-content" @click.stop>
                    <img :src="imageSrc" alt="放大后的图片" />
                    <span class="close-btn" @click="showModal = false">&times;</span>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import feedback from '@/utils/feedback'
const activeTab = ref('user'); // 初始状态下显示用户列表

const message = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const ws = ref<WebSocket | null>(null);
const isSending = ref(false);
const showModal = ref(false);
const isModalVisible = ref(false);
const imageSrc = ''
const selectedListId = ref(''); // 默认选中的
const userBoxData = ref([
    { list_id: '', name: '', 'face': 'https://service.kq5.cc/static/photo/user.png', 'msg': '', 'no_reader_num': 0, 'time': 0 },
]);

const groupBoxData = ref([
    { id: '73470c204d434599e991d803212f186f', name: '初级红包小组' },
    { id: '635db41064cd21052754f24ddda0cb0e', name: '中级红包小组' },
    { id: '1429d80efd7b34e024ed34a3f9fd067f', name: '高级红包小组' },
]);

const _token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5OCwiaXNzIjoiaW1faHR0cCIsImlhdCI6MTcyODQ0NDAyMywiZXhwIjoxNzY0NzMyMDIzLCJuYmYiOjE3Mjg0NDQwMjMsInN1YiI6IiIsImp0aSI6IjY0ZTJiMjIyY2Y3MDRhM2Q1MjIzNDg4YmVmMjZiYmI5In0.hciiP6XCdkyw-57iuueuONeNG39QocS1ZVeD02i_x4U';
const _agent_id = 0;
const content_type = 0;

const selectTab = (tab: any) => {
    messagesContainer.value.innerHTML = ''
    selectedListId.value = ''
    activeTab.value = tab
    var divTag = '.chat-list li'
    if (tab == 'group') divTag = '.group-list li';
    nextTick(() => {
        const firstLi = document.querySelector(divTag);
        if (firstLi) {
            firstLi.click(); // 模拟点击第一个 li 标签
        }
    });
};
//初始更新会话列表
async function startChatList() {
    const response = await fetch(`https://service.kq5.cc/im/get/serviceList`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            _token: _token,
            _agent_id: _agent_id.toString()
        })
    });
    const res = await response.json();
    if (res.err === 0) {
        const list = res.data
        userBoxData.value = []
        list.forEach((v: { list_id: any; show_name: any; last_msg: any; no_reader_num: any; photo_path: any; time: any; }) => {
            return userBoxData.value.push({
                list_id: v.list_id,
                name: v.show_name ?? "新访客",
                msg: v.last_msg,
                no_reader_num: v.no_reader_num,
                face: v.photo_path,
                time: v.time
            });
        })
    } else {
        console.error('Failed to fetch chat list:', res);
    }
}

function initWebSocket() {
    if (ws.value) {
        ws.value.close();
    }

    ws.value = new WebSocket(`wss://service.kq5.cc/wss`);

    ws.value.onopen = () => {
        sendTokenVerification();
    };

    ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.action === 'checkToken') {
            return;
        }
        if (data.action === 'getChatList') {
            getNewChatInfo(data.data.list_id);
            return;
        }
        //消息列表排序
        if (data.action === 'chatData') {
            handleChatData(data.data)
        }

        console.log(data.data.list_id + '!==' + selectedListId.value)

        if (data.list_id !== selectedListId.value) {
            return;
        }

        if (data.action === 'chatData') {
            displayChatData(data)
        }
    };

    ws.value.onclose = () => {
        console.log('Disconnected from the server');
        setTimeout(initWebSocket, 5000);
    };
    ws.value.onerror = (error) => console.error('Error:', error);
}

function handleChatData(data: any) {
    const listId = data.list_id;
    const chatData = data.data.msg;

    // 更新 userBoxData 中对应 list_id 的数据
    const existingUser = userBoxData.value.find(u => u.list_id === listId);

    if (existingUser) {
        // 更新未读消息数
        if (listId !== selectedListId.value) {
            existingUser.no_reader_num += 1
        }
        // 更新最新消息
        existingUser.msg = chatData.content.text;
        existingUser.time = chatData.time;

        // 将该用户移到数组的最前面
        userBoxData.value = [existingUser, ...userBoxData.value.filter(u => u.list_id !== listId)];
    }
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

function displayChatData(data: any) {
    handleChatData(data)
    var d = data.data.data
    if (messagesContainer.value) {
        if (d.msg.type == 5 || d.msg.type == 6 || d.msg.type == 7) {
            addGroupHtml(d)
        } else {
            addUserHtml(d)
        }
    }
}

async function sendMessage() {
    if (!selectedListId.value) {
        feedback.msgError(`未选择发送对象`)
        return
    }
    if (!message.value.trim()) {
        feedback.msgError(`不可发送空消息`)
        return
    }

    try {
        isSending.value = true
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
        isSending.value = false
        if (data.err === 0) {
            addMyHtml(message.value);
            message.value = ''; // 清空输入框
        } else {
            console.error('Failed to send message:', data);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}
async function getNewChatInfo(listId: string) {
    const response = await fetch(`https://service.kq5.cc/im/get/chatdanList`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            list_id: listId,
            _token: _token,
            _agent_id: "0"
        })
    });
    const res = await response.json();
    if (res.err === 0) {
        userBoxData.value.unshift({
            list_id: res.data.list_id,
            name: res.data.show_name ?? "新访客",
            msg: res.data.last_msg,
            no_reader_num: res.data.no_reader_num,
            face: res.data.photo_path,
            time: res.data.time
        });
    }
}
//选择用户
function selectUser(list_id: string) {
    // 更新当前选中的用户ID
    selectedListId.value = list_id;

    // 隐藏未读消息数
    const userBox = userBoxData.value.find(user => user.list_id === list_id);
    if (userBox) {
        userBox.no_reader_num = 0; // 将未读消息数量设置为0
    }

    // 获取当前选中的<li>元素
    const selectedLi = document.querySelector(`.chat-list li[id="${list_id}"]`) as HTMLElement;
    if (selectedLi) {
        // 将选中的<li>元素置顶
        selectedLi.parentNode?.insertBefore(selectedLi, selectedLi.parentNode.firstChild);
    }
    messagesContainer.value.innerHTML = ''
    getChatData(list_id);
}
//选择群组
function selectGroup(list_id: string) {
    selectedListId.value = list_id;
    // 重置当前聊天记录
    if (messagesContainer.value) {
        messagesContainer.value.innerHTML = '';
    }
    getChatData(list_id);
}

//获取最近聊天数据
async function getChatData(listId: string) {
    try {
        const response = await fetch(`https://service.kq5.cc/im/get/chatData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                list_id: listId,
                is_up: "1",
                _token: _token,
                _agent_id: "0",
                time: "0"
            })
        });
        const res = await response.json();
        if (res.err === 0) {
            const list = res.data.list
            list.forEach((v: any) => {
                if (v.msg.type == 5 || v.msg.type == 6 || v.msg.type == 7) {
                    addGroupHtml(v)
                } else {
                    addUserHtml(v)
                }
            })
        } else {
            console.error('Failed to fetch chat list:', res);
        }
    } catch (error) {
        console.error('Error fetching chat list:', error);
    }
}
//当前是否选择群组对象
function isGroupSelected() {
    return groupBoxData.value.some(group => group.id === selectedListId.value);
}

//添加群租红包聊天数据
function addGroupHtml(chatData: any) {
    const messageElement = document.createElement('div')
    const userInfo = chatData.msg.user_info
    const content = chatData.msg.content
    var face = 'https://service.kq5.cc/static/photo/' + userInfo.face
    messageElement.classList.add('chat-message')
    if (chatData.msg.type == 5 || chatData.msg.type == 6 || chatData.msg.type == 7) {
        var money = '', red_img = '', text_msg = ''
        if (chatData.msg.type == 7) {
            money = "此轮红包已结束"
            text_msg = "最小金额为：" + userInfo.name
            red_img = "https://service.kq5.cc/static/photo/red_end.png"
        } else if (chatData.msg.type == 6) {
            money = "₩" + userInfo.money
            text_msg = userInfo.name + "成功搶到紅包"
            red_img = "https://service.kq5.cc/static/photo/red_open.png"
        } else if (chatData.msg.type == 5) {
            money = "₩" + content.money;
            text_msg = "本次红包由" + userInfo.name + "提供"
            red_img = "https://service.kq5.cc/static/photo/red.png"
        }
        messageElement.innerHTML = `<div class="message-header">
        <img src="${face}" class="user-avatar">
    </div>
    <div class="msg-box">
        <div class="user-name">${userInfo.name}</div>
        <div class="red-envelope msg">
        <div class="red red-box"><img src="${red_img}" class="red-img"></div>
        <div style="text-align: left;padding-left:10px;">
            <div class="amount">${money}</div>
            <div class="blessing">${text_msg}</div>
        </div>
        </div>
    </div>`;
        messagesContainer.value.appendChild(messageElement);
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // 自动滚动到底部
    }
}

const toggleModal = () => {
    isModalVisible.value = !isModalVisible.value;
};
//添加用户聊天数据
function addUserHtml(chatData: any) {
    const messageElement = document.createElement('div')
    const userInfo = chatData.msg.user_info
    const content = chatData.msg.content
    var face = 'https://service.kq5.cc/static/photo/user.png'
    var userName = 'Amber'
    if (chatData.msg.user_info.uid == 98) {
        messageElement.classList.add('my-chat-message')
    } else {
        userName = userInfo.name
        messageElement.classList.add('chat-message')
    }
    var content_txt = content.text
    //图片类型
    if (chatData.msg.type == 2) {
        content_txt = `<img src="${content.url}" width="${content.w}" height="${content.h}">`
    }
    messageElement.innerHTML = `<div class="message-header">
        <img src="${face}" class="user-avatar"></div>
        <div class="msg-box">
        <div class="user-name">${userName}</div>
        <div class="msg">
            <div class="msg-content">${content_txt}</div>
        </div>
        </div>`;
    messageElement.querySelector('img').addEventListener('click', toggleModal);
    messagesContainer.value.appendChild(messageElement);
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // 自动滚动到底部
}
//即时添加自己的聊天消息
function addMyHtml(content: any) {
    const messageElement = document.createElement('div');
    var face = 'https://service.kq5.cc/static/photo/user.png';
    messageElement.classList.add('my-chat-message');
    messageElement.innerHTML = `<div class="message-header">
        <img src="${face}" class="user-avatar"></div>
        <div class="msg-box">
        <div class="user-name">Amber</div>
        <div class="msg">
            <div class="msg-content">${content}</div>
        </div>
        </div>`;
    messagesContainer.value.appendChild(messageElement);
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight; // 自动滚动到底部
}
//时间格式化
function formatTime(timestamp: number) {
    // 计算属性：时间戳转换
    const curTimestamp = parseInt(new Date().getTime() / 1000); // 当前时间戳
    const timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数
    const curDate = new Date(curTimestamp * 1000); // 当前时间日期对象
    const tmDate = new Date(timestamp * 1000); // 参数时间戳转换成的日期对象
    const Y = tmDate.getFullYear();
    const m = tmDate.getMonth() + 1;
    const d = tmDate.getDate();
    const H = tmDate.getHours();
    const i = tmDate.getMinutes();
    const s = tmDate.getSeconds();

    if (timestampDiff < 60 || timestamp === undefined) { // 一分钟以内
        return "刚刚";
    } else if (timestampDiff < 3600) { // 一小时前之内
        return Math.floor(timestampDiff / 60) + "分钟前";
    } else if (curDate.getFullYear() === Y && curDate.getMonth() + 1 === m && curDate.getDate() === d) {
        return '今天 ' + ((String(H).length === 1 ? '0' : '') + H) + ':' + ((String(i).length === 1 ? '0' : '') + i);
    } else {
        const newDate = new Date((curTimestamp - 86400) * 1000); // 参数中的时间戳加一天转换成的日期对象
        if (newDate.getFullYear() === Y && newDate.getMonth() + 1 === m && newDate.getDate() === d) {
            return '昨天 ' + ((String(H).length === 1 ? '0' : '') + H) + ':' + ((String(i).length === 1 ? '0' : '') + i);
        } else if (curDate.getFullYear() === Y) {
            return ((String(m).length === 1 ? '0' : '') + m) + '月' + ((String(d).length === 1 ? '0' : '') + d) + '日 ' + ((String(H).length === 1 ? '0' : '') + H) + ':' + ((String(i).length === 1 ? '0' : '') + i);
        } else {
            return Y + '年' + ((String(m).length === 1 ? '0' : '') + m) + '月' + ((String(d).length === 1 ? '0' : '') + d) + '日 ' + ((String(H).length === 1 ? '0' : '') + H) + ':' + ((String(i).length === 1 ? '0' : '') + i);
        }
    }
}

onMounted(() => {
    messagesContainer.value = document.getElementById('messages'); // 初始化 messagesContainer
    initWebSocket(); // 初始加载时初始化 WebSocket
    startChatList();
});

onBeforeUnmount(() => {
    if (ws.value) {
        ws.value.close();
    }
});
</script>

<style>
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

.red-envelope {
    text-align: center;
    display: flex;
    width: 270px;
}



.user-group {
    display: flex;
    margin-bottom: 10px;
}

.user-group div {
    width: 50%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 5px;
    cursor: pointer;
}

.disabled-btn {
    background: #ccc;
    border: #ccc;
}

.msg-btn {
    margin-top: 10px;
}

.input-group {
    text-align: right;
}

.input-group .el-textarea {
    border: 1px #f0f0f0 solid;
    border-radius: 5px;
}

.no-read-num {
    font-size: 11px;
    line-height: 1;
    padding: 3px 6px;
    color: #fff;
    border-radius: 100px;
    position: absolute;
    top: -12px;
    right: -6px;
    background: #e25252;
}

.msg-txt {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 150px;
    font-size: 12px;
}

.head-msg {
    display: flex;
}

.chat-container {
    display: flex;
    height: 80vh;
    width: 100%;
    max-width: 1000px;
    margin: auto;
    background: #fff;
}

.sidebar {
    width: 250px;
    border-right: 1px solid #f0f0f0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
}

.group-list,
.chat-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    height: 74vh;
}

.group-list li,
.chat-list li {
    padding: .8rem .5rem;
    cursor: pointer;
    margin-bottom: 5px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s;
}

.chat-box .active {
    background-color: #007bff;
    color: white;
}

.group-list li:hover,
.chat-list li:hover {
    background-color: #f0f0f0;
    color: #007bff;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    height: 80vh;
}

.messages {
    flex: 1;
    overflow-y: scroll;
    border: 1px solid #f0f0f0;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 5px;
}

input[type="text"] {
    flex: 1;
    padding: 0.5rem;
}

button {
    padding: 0.5rem 1rem;
}

.my-chat-message {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
    margin: 10px 0;
}

.my-chat-message .user-name {
    text-align: right;
}

.chat-message {
    display: flex;
    align-items: flex-start;
    margin: 10px 0;
}

.message-header {
    margin-right: 5px;
}

.head-box {
    position: relative;
}

.user-avatar {
    width: 35px;
    border-radius: 50%;
}

.msg-box {
    max-width: 70%;
    border-radius: 15px;
    position: relative;
    line-height: 1.5;
    margin-top: 5px;
}

.name-time .name-txt {
    float: left;
    font-size: 12px;
}

.name-time .time-txt {
    float: right;
    font-size: 12px;
}

.my-chat-message .msg-box {
    color: #fff;
    position: relative;
    right: 10px;
    top: -10px;
}

.chat-message .msg-box {
    color: #fff;
    position: relative;
    left: 10px;
    top: -10px;
}

.blessing {
    font-size: 14px;
    margin-bottom: 0.5rem;
}

.amount {
    font-size: 18px;
    color: #c82d36;
}

.number {
    font-size: 0.9rem;
    color: #666;
}

.red-box {
    display: inline-block;
    width: 50px;
    height: 50px;
    position: relative;
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
    top: 25px;
    border-width: 10px;
    border-style: solid;
    right: -15px;
    border-color: transparent transparent transparent #98c2ff !important;
}

.msg-content {
    max-width: 300px;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
    text-align: left;
}
</style>