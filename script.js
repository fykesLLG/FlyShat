// Генерируем случайный ID для этой вкладки/смартфона
const myId = Math.random().toString(36).substring(2, 11);

// Инициализируем Gun. Используем публичные реле-серверы для синхронизации между устройствами
const gun = Gun([
    'https://herokuapp.com',
    'https://githack.com'
]);

// Создаем узел для нашего чата (комната 'anon-global-chat')
const chatRoom = gun.get('anon-global-chat');

const msgBox = document.getElementById('msgBox');
const textInp = document.getElementById('textInp');
const sendBtn = document.getElementById('sendBtn');

// Функция отправки
function send() {
    const text = textInp.value.trim();
    if (!text) return;

    // Публикуем сообщение в Gun DB
    chatRoom.set({
        sender: myId,
        text: text,
        time: Date.now()
    });

    textInp.value = '';
    textInp.focus();
}

// Слушаем новые сообщения из P2P сети
chatRoom.map().on((data, id) => {
    // Проверка на валидность данных
    if (!data || !data.text) return;
    
    // Проверяем, существует ли уже это сообщение на экране (чтобы избежать дубликатов от Gun)
    if (document.getElementById(id)) return;

    const msgEl = document.createElement('div');
    msgEl.id = id; // Присваиваем ID узла, чтобы не дублировать
    msgEl.innerText = data.text;

    // Стилизуем: свое или чужое
    if (data.sender === myId) {
        msgEl.classList.add('msg', 'my');
    } else {
        msgEl.classList.add('msg', 'other');
    }

    msgBox.appendChild(msgEl);
    msgBox.scrollTop = msgBox.scrollHeight; // Автоматический скролл вниз
});

// Нажатие на кнопку и Enter
sendBtn.addEventListener('click', send);
textInp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
});
