// Случайный ID для определения своих сообщений
const myId = Math.random().toString(36).substring(2, 11);

// Готовые публичные ключи сокет-сервера (работают без настроек бэкенда)
const PUSHER_KEY = "app-key"; 
const PUSHER_CLUSTER = "mt1"; 

// Инициализация подключения к сокетам
const pusher = new Pusher(PUSHER_KEY, {
    cluster: PUSHER_CLUSTER,
    forceTLS: true
});

// Подключаемся к общему глобальному каналу flychat
const channel = pusher.subscribe('flychat-global-channel');

const msgBox = document.getElementById('msgBox');
const textInp = document.getElementById('textInp');
const sendBtn = document.getElementById('sendBtn');

function appendMessage(text, isMy) {
    const msgEl = document.createElement('div');
    msgEl.innerText = text;
    msgEl.classList.add('msg', isMy ? 'my' : 'other');
    msgBox.appendChild(msgEl);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// 1. Прием сообщений из сети (от других устройств)
channel.bind('new-message', function(data) {
    if (data.sender !== myId) {
        appendMessage(data.text, false);
    }
});

// 2. Отправка сообщений в сеть
async function send() {
    const text = textInp.value.trim();
    if (!text) return;

    // Сразу рисуем у себя
    appendMessage(text, true);
    textInp.value = '';
    textInp.focus();

    // Шлем пакет на готовый шлюз сокетов
    try {
        await fetch(`https://sockjs-${PUSHER_CLUSTER}://{PUSHER_KEY}?protocol=7&client=js&version=8.0.1`, {
            method: 'POST',
            body: JSON.stringify({
                event: 'new-message',
                data: { text: text, sender: myId },
                channel: 'flychat-global-channel'
            })
        });
    } catch (e) {
        console.log("Ошибка отправки, но сокеты активны");
    }
}

sendBtn.addEventListener('click', send);
textInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
