// --- 日付選択プルダウン生成 ---
const yearSelect = document.getElementById('birth-year');
const monthSelect = document.getElementById('birth-month');
const daySelect = document.getElementById('birth-day');

function populateDateSelectors() {
    const today = new Date();
    const currentYear = today.getFullYear();
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const option = document.createElement('option');
        option.value = i; option.textContent = i;
        yearSelect.appendChild(option);
    }
    for (let i = 1; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i; option.textContent = i;
        monthSelect.appendChild(option);
    }
    function updateDays() {
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        const daysInMonth = new Date(year, month, 0).getDate();
        daySelect.innerHTML = '';
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i; option.textContent = i;
            daySelect.appendChild(option);
        }
    }
    yearSelect.addEventListener('change', updateDays);
    monthSelect.addEventListener('change', updateDays);
    updateDays();
}


// --- 死亡率・メッセージデータ ---
const mortalityData = {
    male: {
        "0-19": { "不慮の事故": 0.00025, "自殺": 0.00018, "悪性新生物": 0.00008 },
        "20-39": { "自殺": 0.00030, "不慮の事故": 0.00015, "悪性新生物": 0.00018, "心疾患": 0.0001 },
        "40-59": { "悪性新生物": 0.0020, "自殺": 0.00028, "心疾患": 0.0012, "脳血管疾患": 0.0007 },
        "60-79": { "悪性新生物": 0.0110, "心疾患": 0.0065, "肺炎": 0.0035, "脳血管疾患": 0.0040, "誤嚥性肺炎": 0.0030 },
        "80+": { "悪性新生物": 0.0280, "心疾患": 0.0250, "肺炎": 0.0200, "老衰": 0.0220, "誤嚥性肺炎": 0.0180 }
    },
    female: {
        "0-19": { "不慮の事故": 0.00018, "自殺": 0.00012, "悪性新生物": 0.00008 },
        "20-39": { "自殺": 0.00015, "悪性新生物": 0.00020, "不慮の事故": 0.00008, "心疾患": 0.00008 },
        "40-59": { "悪性新生物": 0.0018, "心疾患": 0.0007, "脳血管疾患": 0.0005, "自殺": 0.00012 },
        "60-79": { "悪性新生物": 0.0065, "心疾患": 0.0045, "脳血管疾患": 0.0035, "老衰": 0.0020, "肺炎": 0.0018 },
        "80+": { "老衰": 0.0550, "悪性新生物": 0.0150, "心疾患": 0.0220, "脳血管疾患": 0.0120, "アルツハイマー病": 0.008, "誤嚥性肺炎": 0.0150 }
    }
};
const averageLifespan = { male: 81.05, female: 87.09 };

// --- ▼▼▼ ここから修正・追加 ▼▼▼ ---
// レア死因の結末メッセージ
const specialDeathMessages = {
    "生き埋め": "息苦しい暗闇と土の重圧。薄れゆく意識の中、あなたが最後に呼んだのは誰の名前でしたか。享年{age}歳。",
    "縊死": "宙に浮いた足が最後に捉えたのは、床に散らばった思い出の欠片だった。あなたの時間は{age}歳で止まった。",
    "オピオイド過剰摂取": "現実から逃避するための甘い誘惑。それが、あなたから現実そのものを奪い去った。享年{age}歳、安らかな顔だったという。",
    "餓死": "世界のすべてが食べ物に見えるという妄想の果てに、あなたの胃はついに活動を停止した。享年{age}歳。",
    "過労死": "止まったあなたの時間と、動き続ける会社の時間。モニターに表示されたままのエラーメッセージだけが、あなたの最期を知っていた。享年{age}歳。",
    "諫死": "あなたの忠義と命を賭した諫言は、歴史の闇に葬られた。享年{age}歳。",
    "感電": "規格外の電流が全身を駆け巡る。一瞬の閃光と衝撃の後、あなたの神経系は永遠に沈黙した。享年{age}歳。",
    "グローバル・ポジショニング・システムによる死": "『目的地に到着しました』――その無機質なアナウンスが響いたのは、底知れぬ渓谷の淵だった。あなたの旅は{age}歳で終わった。",
    "呼吸停止": "当たり前のように繰り返される営みだと思っていた。それが途絶える恐怖を、あなたは最期に知った。享年{age}歳。",
    "呼吸不全": "吸っても吸っても酸素が入ってこない。水の中にいるような苦しみの中、あなたの肺は機能を停止した。享年{age}歳。",
    "獄死": "鉄格子の向こうの自由を夢見ながら、あなたの魂は肉体という名の檻から解放された。享年{age}歳。",
    "黒死病": "歴史上の病と思われていたそれに体を蝕まれ、あなたは高熱と悪夢の中で息絶えた。享年{age}歳。",
    "ココナッツによる死": "南国の穏やかな昼下がり、頭上から時速80kmで迫る脅威に、あなたは気づくことさえできなかった。享年{age}歳。",
    "死因究明": "あなたの死はあまりに不可解だったため、その原因究明の過程で解剖され、標本とされた。あなたの存在は医学の発展に貢献した。享年{age}歳。",
    "自己愛性災害": "鏡に映る完璧な自分に見惚れるうち、現実の肉体が朽ち果てていくことに、あなたは最後まで気づかなかった。享年{age}歳。",
    "自動車死亡事故": "鉄塊と化した車体の中で、あなたは途切れゆく意識の向こうに、見慣れた天井を見た気がした。享年{age}歳。",
    "殉教": "信じるもののために、あなたは自らの命を捧げた。その尊い犠牲を、後の世に知る者はいない。享年{age}歳。",
    "殉職": "使命を全うするための代償は、あまりにも大きかった。あなたの名はプレートに刻まれ、やがて忘れ去られる。享年{age}歳。",
    "焼死": "燃え盛る炎は、あなたの罪も後悔も、すべて灰に変えてくれただろうか。享年{age}歳。",
    "ショック": "信じがたい光景を目の当たりにし、あなたの心臓は許容量を超える衝撃に耐えきれなかった。享年{age}歳。",
    "心停止": "何の予兆もなく、心臓は突然その役目を放棄した。あなたの物語は、あまりにも唐突な終わりを迎えた。享年{age}歳。",
    "水死": "冷たい水が身体から熱と自由を奪っていく。水面に映る最後の光景は、歪んだ青空だった。享年{age}歳。",
    "衰弱死": "生きる気力も、食べる力も失い、あなたはロウソクの火が消えるように静かに命を終えた。享年{age}歳。",
    "戦死": "名も知らぬ地で、誰かの大義のために、あなたはただの数字となって散った。享年{age}歳。",
    "全身崩壊": "許容できない物理法則の歪みに巻き込まれ、あなたの身体は原子レベルにまで分解され、霧散した。享年{age}歳。",
    "戦病死": "前線の劣悪な環境があなたの体を蝕んだ。敵ではなく、見えざる病原体があなたの命を奪った。享年{age}歳。",
    "多臓器不全": "身体中の臓器が次々と機能を停止していく。ドミノ倒しのように、あなたの生命活動は連鎖的に終了した。享年{age}歳。",
    "窒息": "日常に潜む一瞬の油断。喉を塞ぐ絶望感の中、誰にも気づかれず……あなたの呼吸は{age}歳で静かに止まった。",
    "低体温症": "凍える寒さの中で、あなたは抗うのをやめ、奇妙な幸福感と共に永遠の眠りについた。享年{age}歳。",
    "転落死": "重力に引かれて落下していく数秒間、あなたは走馬灯を見ることもなく、ただ地面が迫るのを眺めていた。享年{age}歳。",
    "頭蓋底骨折": "後頭部を強打した鈍い衝撃。それが、あなたの意識を刈り取った最後の感覚だった。享年{age}歳。",
    "突然死": "昨日と同じ今日が、明日も続くと信じていた。その油断を嘲笑うかのように、あなたの命は突然奪われた。享年{age}歳。",
    "ドメスティックバイオレンス": "安息の地であるはずの場所が、あなたの死地となった。その悲鳴は誰にも届かなかった。享年{age}歳。",
    "トルサード・ド・ポワント": "致死性の不整脈があなたの心臓で発生。バレエのステップの名を持つそれに、あなたの命は踊らされるようにして尽きた。享年{age}歳。",
    "妊娠中絶": "この世に生を受けるはずだった命と共に、あなたもまたこの世を去った。その是非を問う者は、もういない。享年{age}歳。",
    "脳卒中": "脳の血管が破綻し、あなたの意識と記憶は一瞬にして闇に呑まれた。享年{age}歳。",
    "脳損傷": "修復不可能なレベルで脳が損傷。あなたは人間としての尊厳を失い、ただの生命維持装置と化した末に息絶えた。享年{age}歳。",
    "爆死": "轟音と閃光、そしてすべてを吹き飛ばす衝撃。あなたが最後に認識できたのはそこまでだった。享年{age}歳。",
    "ヒートショック現象": "暖かい部屋から寒い浴室へ。その急激な温度差が、あなたの心臓に致命的な一撃を与えた。享年{age}歳。",
    "人身御供": "古の因習の贄として、あなたは神々に捧げられた。あなたの犠牲の上に、偽りの平和が築かれる。享年{age}歳。",
    "腹上死": "人生で最も幸福な瞬間に、あなたの心臓は限界を迎えた。それは喜劇か、悲劇か。享年{age}歳。",
    "防ぎうる死": "ほんの少しの知識と注意があれば、この結末は避けられたはずだった。あなたの死は、後悔と共に語られる。享年{age}歳。",
    "憤死": "抑えきれない怒りと屈辱が、あなたの血管を破裂させた。その無念は、死してなお晴れることはない。享年{age}歳。",
    "変死体": "変わり果てた姿で発見されたあなた。その身に何が起こったのか、今となっては誰にも分からない。享年{age}歳、死因：不明（変死）。",
    "捕食": "食物連鎖の頂点にいるという人類の驕りは、野生の飢えの前では無力だった。あなたは自然の摂理に還った。享年{age}歳。",
    "冷蔵庫による事故死": "古い冷蔵庫に閉じ込められ、脱出することは叶わなかった。あなたの声は、厚い扉に阻まれ続けた。享年{age}歳。",
    "轢死": "迫り来る車輪の音。回避不可能と悟った瞬間、あなたの身体は無残に砕け散った。享年{age}歳。",
    "笑い死に": "あまりにもくだらないジョークに笑いが止まらなくなり、呼吸困難に陥った。人生最期の感情が幸福であったことを祈る。享年{age}歳。"
};

const resultMessages = {
    "悪性新生物": "無機質な天井を眺め、規則的な機械音だけが響く部屋。\n長い闘病の末、あなたの命の火は {age}歳 で静かに消えた。",
    "心疾患": "凍てつくような冬の夜、胸を突き刺す激痛。握りしめた電話は、どこにも繋がることはなかった。\nあなたの心臓は {age}歳 でその鼓動を止めた。",
    "脳血管疾患": "世界がぐにゃりと歪み、立っていることすらままならない。\n崩れ落ちる体とは裏腹に、意識だけがスローモーションで沈んでいく。\nあなたの思考は {age}歳 で永遠に停止した。",
    "老衰": "多くの思い出に包まれながら、眠るように安らかに。\nあなたの人生という長い物語は {age}歳 で幕を閉じた。",
    "不慮の事故": {
        "交通事故": "雨で濡れた横断歩道。ヘッドライトの光が迫り、全てが白に染まった。\nあなたの時間は {age}歳 の交通事故で唐突に終わりを告げた。",
        "転落・転倒": "慣れたはずの階段、ほんの少し踏み外しただけだった。\n打ち付けた後頭部の鈍い痛みと共に、あなたの意識は {age}歳 で闇に消えた。",
        "溺死": "夏の水辺、楽しむはずだった。冷たい水が肺を満し、もがく力も尽きたとき、\nあなたの時間は {age}歳 で水底に沈んだ。",
    },
    "自殺": "静まり返った部屋。窓から差し込む月明かりだけが、すべてを見ていた。\nあなたの苦しみは {age}歳 で、誰にも知られることなく終わった。\n（この結果に強い衝撃を受けた方は、専門の相談窓口にご相談ください）",
    "肺炎": "息を吸うたびに、水の中にいるような苦みが襲う。\n最期まで酸素を求め続けたあなたの呼吸は {age}歳 で絶えた。",
    "誤嚥性肺炎": "何気ない日常の食事。それが最期になるとは誰も思わなかった。\nあなたの命は {age}歳 で、あまりにも静かに終わりを迎えた。",
    "アルツハイマー病": "記憶が溶け、愛しい人の顔さえ分からなくなっていく。\n鏡に映る自分ではない誰かに見守られながら、あなたの物語は {age}歳 で終わった。",
    "詳細不明": "静まり返った自室。テーブルの上には、まだ湯気の立つコーヒーカップが残されていた。\nあなたが {age}歳 でそこで見つかった理由を、知る者は誰もいない。",
    "認識災害": "██ Log No.734 ██\n異常パターンを検知。対象は当シミュレーションの存在意義に気づきました。\nプロトコルに基づき、あなたは {age}歳 で処理されます。\n死因：このシミュレーションを見たこと",
    // レア死因を本体に追加
    ...specialDeathMessages
};

// 図鑑用の全死因リスト
const ALL_CAUSES_LIST = [
    "悪性新生物", "心疾患", "脳血管疾患", "老衰", "肺炎", "誤嚥性肺炎",
    "アルツハイマー病", "自殺", "交通事故", "転落・転倒", "溺死",
    "詳細不明", "認識災害",
    ...Object.keys(specialDeathMessages) // レア死因をリストに追加
].sort();

const COMPLETION_MESSAGE = "全ての死因を収集しましたね。\nあなたはこの世界の真理に触れ、死の運命を超越しました。\nもう、このシミュレーターがあなたを捉えることはありません。\n……おめでとうございます。";
// --- ▲▲▲ ここまで修正・追加 ▲▲▲ ---

// --- DOM要素取得 ---
const startScreen = document.getElementById('start-screen');
const simScreen = document.getElementById('simulation-screen');
const resultScreen = document.getElementById('result-screen');
const startButton = document.getElementById('start-button');
const ageCounter = document.getElementById('age-counter');
const retryButton = document.getElementById('retry-button');
const ambientSound = document.getElementById('ambient-sound');
const heartbeatSound = document.getElementById('heartbeat-sound');
const jumpscareSound = document.getElementById('jumpscare-sound');
const memoryMessage = document.getElementById('memory-message');
const bugMessageDiv = document.getElementById('bug-message');
let allSounds = [ambientSound, heartbeatSound, jumpscareSound];

const dexButton = document.getElementById('dex-button');
const dexModal = document.getElementById('dex-modal');
const dexGrid = document.getElementById('dex-grid');
const dexCloseButton = document.getElementById('dex-close-button');
const dexCompletionMessage = document.getElementById('dex-completion-message');


// --- 結果表示用要素の動的作成 ---
let resultCause, resultDetails, resultRank, surveillanceMessage;
function initializeResultElements() {
    resultScreen.innerHTML = '';
    resultCause = document.createElement('p');
    resultCause.id = 'result-cause';
    resultDetails = document.createElement('p');
    resultDetails.id = 'result-details';
    resultRank = document.createElement('p');
    resultRank.id = 'result-rank';
    surveillanceMessage = document.createElement('p');
    surveillanceMessage.id = 'surveillance-message';
    resultScreen.appendChild(resultCause);
    resultScreen.appendChild(resultDetails);
    resultScreen.appendChild(resultRank);
    resultScreen.appendChild(surveillanceMessage);
    resultScreen.appendChild(retryButton);
}
initializeResultElements();


// --- 音声再生のロックを解除 ---
let isAudioUnlocked = false;
function unlockAudio() {
    if (isAudioUnlocked) return;
    allSounds.forEach(sound => {
        sound.volume = 0;
        sound.play().catch(() => {});
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 1;
    });
    isAudioUnlocked = true;
}

// --- ページ読み込み時の処理 ---
document.addEventListener('DOMContentLoaded', () => {
    populateDateSelectors();
    const previousResult = localStorage.getItem('deathSimulatorResult');
    if (previousResult) {
        const { age, cause } = JSON.parse(previousResult);
        memoryMessage.innerText = `...前回は ${age}歳 で ${cause} でしたね。\nもう一度、あなたの運命を覗きますか？`;
    } else {
        memoryMessage.style.display = 'none';
    }
});


// --- イベントリスナー ---
startButton.addEventListener('click', () => {
    unlockAudio();
    
    if (!yearSelect.value || !monthSelect.value || !daySelect.value) {
        alert('生年月日を正しく選択してください。'); return;
    }
    const birthDate = new Date(parseInt(yearSelect.value), parseInt(monthSelect.value) - 1, parseInt(daySelect.value));

    const today = new Date();
    let currentAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        currentAge--;
    }
    const gender = document.querySelector('input[name="gender"]:checked').value;

    ageCounter.innerText = currentAge;
    ageCounter.dataset.text = currentAge;

    startScreen.classList.add('hidden');
    simScreen.classList.remove('hidden');
    ambientSound.currentTime = 0;
    heartbeatSound.currentTime = 0;
    ambientSound.play();
    heartbeatSound.play();
    runSimulation(currentAge, gender);
});

retryButton.addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    ageCounter.innerText = "0";
    ageCounter.dataset.text = "0";
    initializeResultElements();
    memoryMessage.style.display = 'block';
    const previousResult = localStorage.getItem('deathSimulatorResult');
    if (previousResult) {
        const { age, cause } = JSON.parse(previousResult);
        memoryMessage.innerText = `...前回は ${age}歳 で ${cause} でしたね。\nもう一度、あなたの運命を覗きますか？`;
    } else {
        memoryMessage.style.display = 'none';
    }
});

dexButton.addEventListener('click', () => {
    updateDex();
    dexModal.classList.remove('hidden');
});
dexCloseButton.addEventListener('click', () => {
    dexModal.classList.add('hidden');
});

function updateDex() {
    const collectedCauses = JSON.parse(localStorage.getItem('collectedDeathCauses')) || [];
    dexGrid.innerHTML = '';

    ALL_CAUSES_LIST.forEach(cause => {
        const item = document.createElement('div');
        item.classList.add('dex-item');
        if (collectedCauses.includes(cause)) {
            item.classList.add('unlocked');
            item.textContent = cause;
        } else {
            item.classList.add('locked');
            item.textContent = '？？？？？？';
        }
        dexGrid.appendChild(item);
    });

    if (ALL_CAUSES_LIST.every(cause => collectedCauses.includes(cause))) {
        dexCompletionMessage.textContent = COMPLETION_MESSAGE;
        dexCompletionMessage.classList.remove('hidden');
    } else {
        dexCompletionMessage.classList.add('hidden');
    }
}


// --- コアロジック ---
function typewrite(element, text, speed) {
    return new Promise(resolve => {
        let i = 0;
        element.innerHTML = '';
        element.classList.add('typing-effect');
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i).replace('\n', '<br>');
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typing-effect');
                resolve();
            }
        }, speed);
    });
}

const bugMessages = [
    "SYSTEM_FAILURE", "DATA_CORRUPTION", "ERROR: reality.dll NOT FOUND",
    "これは公開すべき情報ではない", "観測対象コード: 81-δ", "████があなたを見ています",
    "このシミュレーションは記録されています", "ALERT: SUBJECT IS BECOMING AWARE",
    "なぜあなたはこれを読めるのですか？", "...ACCESS DENIED...", "LOG_EXPOSED: Subject shows unusual awareness."
];

function showBugMessage() {
    bugMessageDiv.classList.remove('hidden');
    bugMessageDiv.innerText = bugMessages[Math.floor(Math.random() * bugMessages.length)];
    bugMessageDiv.style.animation = 'none';
    void bugMessageDiv.offsetWidth;
    bugMessageDiv.style.animation = '';
    
    setTimeout(() => {
        bugMessageDiv.classList.add('hidden');
    }, 800);
}

function runSimulation(startAge, gender) {
    if (Math.random() < 0.001) {
        showResult(startAge, "認識災害", gender);
        return;
    }
    let age = startAge;
    const data = mortalityData[gender];
    const rareCauses = Object.keys(specialDeathMessages);
    heartbeatSound.playbackRate = 1.0;

    const interval = setInterval(() => {
        age++;
        ageCounter.innerText = age;
        ageCounter.dataset.text = age;
        if (age > 40) {
            heartbeatSound.playbackRate = 1.0 + ((age - 40) / 100);
        }
        if (Math.random() < 0.006 && age > startAge + 5) {
             showBugMessage();
        }

        // --- ▼▼▼ ここから修正・追加 ▼▼▼ ---
        // レア死因の判定 (低確率)
        const RARE_DEATH_PROBABILITY = 0.0008; // 1ループ(100ms)あたりの発生確率
        if (Math.random() < RARE_DEATH_PROBABILITY && age > startAge + 3) {
            const randomRareCause = rareCauses[Math.floor(Math.random() * rareCauses.length)];
            clearInterval(interval);
            showResult(age, randomRareCause, gender);
            return; // 判定終了
        }
        // --- ▲▲▲ ここまで修正・追加 ▲▲▲ ---

        const ageGroup = getAgeGroup(age);
        const causes = data[ageGroup];
        const random = Math.random();
        let cumulativeProbability = 0;
        for (const cause in causes) {
            cumulativeProbability += causes[cause];
            if (random < cumulativeProbability) {
                clearInterval(interval);
                showResult(age, cause, gender);
                return;
            }
        }
        if (age > 120) {
            clearInterval(interval);
            showResult(age, "老衰", gender);
        }
    }, 100);
}

const surveillanceMessages = [
    "あなたの背後にいる人も、同じ運命をたどるでしょう。", "部屋の隅に、何かがいますね。見つかっていますか？",
    "あなたの鼓動が速くなっています。すべて見えていますよ。", "モニターの向こう側から、誰かがあなたを見ています。",
    "このシミュレーションは、あなたの思考に深く刻まれました。", "次は、どんな結末になるのでしょうね？"
];

function showResult(age, cause, gender) {
    heartbeatSound.pause();
    ambientSound.pause();
    setTimeout(() => {
        simScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        jumpscareSound.currentTime = 0;
        jumpscareSound.play();
        let actualCause = cause;
        let messageTemplate;

        // 「不慮の事故」の場合、その中からさらにランダムで死因を決定
        if (cause === "不慮の事故") {
            const accidentTypes = Object.keys(resultMessages["不慮の事故"]);
            const randomAccident = accidentTypes[Math.floor(Math.random() * accidentTypes.length)];
            messageTemplate = resultMessages["不慮の事故"][randomAccident];
            actualCause = randomAccident;
        } else {
            messageTemplate = resultMessages[actualCause] || resultMessages["詳細不明"];
        }

        const causeText = `死因：${actualCause}`;
        const detailsText = messageTemplate.replace(/{age}/g, age);
        
        localStorage.setItem('deathSimulatorResult', JSON.stringify({ age: age, cause: actualCause }));
        
        let collectedCauses = JSON.parse(localStorage.getItem('collectedDeathCauses')) || [];
        if (!collectedCauses.includes(actualCause)) {
            collectedCauses.push(actualCause);
            localStorage.setItem('collectedDeathCauses', JSON.stringify(collectedCauses));
        }

        typewrite(resultCause, causeText, 100)
            .then(() => typewrite(resultDetails, detailsText, 50))
            .then(() => {
                // 統計に基づかないレア死因の場合はランキングを表示しない
                const isNormalCause = mortalityData.male["80+"].hasOwnProperty(cause) || cause === "老衰" || cause === "自殺" || cause === "不慮の事故" || cause.includes("事故") || cause.includes("転倒");
                if (cause === "認識災害" || !isNormalCause) {
                    resultRank.style.display = 'none';
                } else {
                    resultRank.style.display = 'block';
                    const avgLifespan = averageLifespan[gender];
                    let rankMessage = "";
                    if (age < avgLifespan * 0.8) {
                        rankMessage = `あなたの寿命は同世代の約【下位10%】に位置します。あまりにも早い終焉でした。`;
                    } else if (age < avgLifespan * 0.95) {
                        rankMessage = `あなたの寿命は同世代の約【下位30%】に位置します。平均より少し短かったようです。`;
                    } else if (age < avgLifespan * 1.05) {
                        rankMessage = `あなたの寿命は同世代の約【平均的】です。多くの人と同じように人生を歩みました。`;
                    } else if (age < avgLifespan * 1.15) {
                        rankMessage = `あなたの寿命は同世代の約【上位30%】に位置します。長く人生を謳歌しましたね。`;
                    } else {
                        rankMessage = `あなたの寿命は同世代の約【上位10%】に位置します。まさに大往生、見事な人生でした。`;
                    }
                    resultRank.innerText = rankMessage;
                }
                setTimeout(() => {
                    surveillanceMessage.innerText = surveillanceMessages[Math.floor(Math.random() * surveillanceMessages.length)];
                    surveillanceMessage.classList.add('show');
                }, 4000);
            });
    }, 1200);
}

function getAgeGroup(age) {
    if (age <= 19) return "0-19";
    if (age <= 39) return "20-39";
    if (age <= 59) return "40-59";
    if (age <= 79) return "60-79";
    return "80+";
}