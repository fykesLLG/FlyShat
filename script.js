const myId = Math.random().toString(36).substring(2, 11);

// ТВОЙ URL ПРОЕКТА УЖЕ ВСТАВЛЕН:
const SUPABASE_URL = "https://supabase.co";

// СЮДА ВСТАВЬ ТОТ САМЫЙ ДЛИННЫЙ КЛЮЧ АНОН ИЗ SUPABASE:
const SUPABASE_KEY = "ВСТАВЬ_СЮДА_ДЛИННЫЙ_КЛЮЧ_ANON";

// Инициализируем клиент
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Подключаемся к быстрому широковещательному каналу (Broadcast)
const channel = supabaseClient.channel('global-flychat', {
    config: { broadcast: { self: false } } // Не получать свои же сообщения обратно
});

const msgBox = document.getElementById('msgBox');
const textInp = document.getElementById('textInp');
const sendBtn = document.getElementById('sendBtn');

// Функция отрисовки сообщения на экране
function appendMessage(text, isMy) {
    const msgEl = document.createElement('div');
    msgEl.innerText = text;
    msgEl.classList.add('msg', isMy ? 'my' : 'other');
    msgBox.appendChild(msgEl);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// 1. СЛУШАЕМ СЕТЬ: принимаем сообщения от других устройств
channel
  .on('broadcast', { event: 'message' }, (payload) => {
      if (payload.payload && payload.payload.text) {
          appendMessage(payload.payload.text, false);
      }
  })
  .subscribe();

// 2. ОТПРАВЛЯЕМ В СЕТЬ
async function send() {
    const text = textInp.value.trim();
    if (!text) return;

    appendMessage(text, true);
    textInp.value = '';
    textInp.focus();

    await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { text: text, sender: myId }
    });
}

sendBtn.addEventListener('click', send);
textInp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
