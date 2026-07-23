// Генерация случайного ID
const myId = Math.random().toString(36).substring(2, 11);

// Используем полностью открытый публичный ключ Pusher
const PUSHER_KEY = "app-key"; 
const PUSHER_CLUSTER = "mt1"; 

const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true
});

// ВАЖНО: Client-события работают ТОЛЬКО на приватных каналах (префикс private-)
const channel = pusher.subscribe('private-flychat-global');

const msgBox = document.getElementById('msgBox');
const textInp = document.getElementById('textInp');
const sendBtn = document.getElementById('sendBtn');

// Функция вывода текста на экран
function appendMessage(text, isMy) {
    const msgEl = document.createElement('div');
    msgEl.innerText = text;
    msgEl.classList.add('msg', isMy ? 'my' : 'other');
    msgBox.appendChild(msgEl);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// 1. Принимаем сообщения напрямую от другого устройства (префикс client-)
channel.bind('client-new-message', function(data) {
    if (data.sender !== myId) {
        appendMessage(data.text, false);
    }
});

// 2. Отправка сообщений в сеть
function send() {
    const text = textInp.value.trim();
    if (!text) return;

    // Сразу показываем у себя
    appendMessage(text, true);
    textInp.value = '';
    textInp.focus();

    // Шлем напрямую в сокет без fetch() и без CORS!
    channel.trigger('client-new-message', {
        text: text,
        sender: myId
    });
}

sendBtn.addEventListener('click', send);
textInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
