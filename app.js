// ゲームの状態をまとめて管理する入れ物
const game = {
    player1: { name: '', lore: 0 },
    player2: { name: '', lore: 0 },
    firstPlayerKey: 'player1',  // 先攻はplayer1かplayer2か
    secondPlayerKey: 'player2', // 後攻はplayer1かplayer2か
    turn: 1,
    log: [],               // ターンごとのロア値を記録
    firstTurnEnded: false, // 先攻がターン終了ボタンを押したか
    boostFirst: false,     // 先攻のブーストON/OFF
    boostSecond: false,    // 後攻のブーストON/OFF
};

// ── 画面を切り替える ──
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ── ダイスを振る ──
function rollDice() {
    const p1Name = document.getElementById('player1-name').value.trim() || 'Player 1';
    const p2Name = document.getElementById('player2-name').value.trim() || 'Player 2';

    game.player1.name = p1Name;
    game.player2.name = p2Name;

    document.getElementById('p1-dice-name').textContent = p1Name;
    document.getElementById('p2-dice-name').textContent = p2Name;

    const dice1El = document.getElementById('dice1');
    const dice2El = document.getElementById('dice2');
    const resultEl = document.getElementById('dice-result');
    const messageEl = document.getElementById('dice-message');
    const startBtn = document.getElementById('start-btn');

    // リセット
    resultEl.classList.remove('hidden');
    dice1El.classList.remove('winner');
    dice2El.classList.remove('winner');
    startBtn.style.display = 'none';
    messageEl.textContent = '';

    // アニメーション（約0.8秒間ランダムな数字をパラパラ表示）
    let count = 0;
    const interval = setInterval(() => {
        dice1El.textContent = Math.ceil(Math.random() * 6);
        dice2El.textContent = Math.ceil(Math.random() * 6);
        count++;

        if (count >= 8) {
            clearInterval(interval);

            // 最終的な目を決定（同じ目が出たら振り直し）
            let d1 = Math.ceil(Math.random() * 6);
            let d2 = Math.ceil(Math.random() * 6);
            while (d1 === d2) {
                d2 = Math.ceil(Math.random() * 6);
            }

            dice1El.textContent = d1;
            dice2El.textContent = d2;

            // 大きい目のプレイヤーが先攻
            if (d1 > d2) {
                game.firstPlayerKey  = 'player1';
                game.secondPlayerKey = 'player2';
                dice1El.classList.add('winner');
                messageEl.textContent = `${p1Name} が先攻です！`;
            } else {
                game.firstPlayerKey  = 'player2';
                game.secondPlayerKey = 'player1';
                dice2El.classList.add('winner');
                messageEl.textContent = `${p2Name} が先攻です！`;
            }

            startBtn.style.display = 'block';
        }
    }, 100);
}

// ── ゲーム開始 ──
function startGame() {
    // 状態を初期化
    game.turn = 1;
    game.log = [];
    game.player1.lore = 0;
    game.player2.lore = 0;
    game.firstTurnEnded = false;

    const first  = game[game.firstPlayerKey];
    const second = game[game.secondPlayerKey];

    // 画面に名前・ロア値をセット
    document.getElementById('first-player-name').textContent  = first.name;
    document.getElementById('second-player-name').textContent = second.name;
    document.getElementById('first-lore').textContent  = 0;
    document.getElementById('second-lore').textContent = 0;
    document.getElementById('turn-label').textContent  = 'ターン 1';

    // ブーストをリセット
    game.boostFirst  = false;
    game.boostSecond = false;
    document.getElementById('first-boost-btn').classList.remove('active');
    document.getElementById('second-boost-btn').classList.remove('active');

    // 最初は先攻のターン（後攻ボタンは押せない）
    document.getElementById('first-turn-btn').disabled  = false;
    document.getElementById('second-turn-btn').disabled = true;

    showScreen('screen-game');
}

// ── ロア値を増減する ──
function changeLore(who, amount) {
    const key    = who === 'first' ? game.firstPlayerKey : game.secondPlayerKey;
    const player = game[key];
    const boost  = who === 'first' ? game.boostFirst : game.boostSecond;
    const cap    = boost ? 25 : 20; // ブーストONなら上限25、OFFなら20

    player.lore = Math.min(cap, Math.max(0, player.lore + amount));
    document.getElementById(`${who}-lore`).textContent = player.lore;

    // 上限に到達したらキラキラエフェクトを表示してから終了
    if (player.lore >= cap) {
        showSparkleEffect(player.name);
    }
}

// ── ブーストボタンのON/OFFを切り替える ──
function toggleBoost(who) {
    if (who === 'first') {
        game.boostFirst = !game.boostFirst;
        document.getElementById('first-boost-btn').classList.toggle('active', game.boostFirst);
        // OFFに切り替えた時点でロア値が20以上なら勝利
        if (!game.boostFirst && game[game.firstPlayerKey].lore >= 20) {
            showSparkleEffect(game[game.firstPlayerKey].name);
        }
    } else {
        game.boostSecond = !game.boostSecond;
        document.getElementById('second-boost-btn').classList.toggle('active', game.boostSecond);
        // OFFに切り替えた時点でロア値が20以上なら勝利
        if (!game.boostSecond && game[game.secondPlayerKey].lore >= 20) {
            showSparkleEffect(game[game.secondPlayerKey].name);
        }
    }
}

// ── ターン終了ボタンを押したとき ──
function endTurn(who) {
    if (who === 'first') {
        // 先攻がターン終了 → 後攻のターンへ
        game.firstTurnEnded = true;
        document.getElementById('first-turn-btn').disabled  = true;
        document.getElementById('second-turn-btn').disabled = false;

    } else {
        // 後攻がターン終了 → ログを記録してターン数を+1
        const first  = game[game.firstPlayerKey];
        const second = game[game.secondPlayerKey];

        game.log.push({
            turn:       game.turn,
            firstName:  first.name,
            firstLore:  first.lore,
            secondName: second.name,
            secondLore: second.lore,
        });

        game.turn++;
        document.getElementById('turn-label').textContent = `ターン ${game.turn}`;

        // 先攻のターンへ戻す
        game.firstTurnEnded = false;
        document.getElementById('first-turn-btn').disabled  = false;
        document.getElementById('second-turn-btn').disabled = true;
    }
}

// ── ゲームを終了してログを表示する ──
function endGame() {
    const first  = game[game.firstPlayerKey];
    const second = game[game.secondPlayerKey];

    // 日時を「YYYY-MM-DD HH:MM」形式で作る
    const now = new Date();
    const dateStr = `${now.getFullYear()}-`
        + `${String(now.getMonth() + 1).padStart(2, '0')}-`
        + `${String(now.getDate()).padStart(2, '0')} `
        + `${String(now.getHours()).padStart(2, '0')}:`
        + `${String(now.getMinutes()).padStart(2, '0')}`;

    // テキストログを組み立てる
    let text = `=== Lore Counter 対戦ログ ===\n`;
    text += `日時: ${dateStr}\n`;
    text += `先攻: ${first.name} ／ 後攻: ${second.name}\n`;
    text += `\n`;

    if (game.log.length === 0) {
        text += `（記録なし）\n`;
    } else {
        game.log.forEach(entry => {
            text += `ターン ${entry.turn}: `
                + `${entry.firstName} ${entry.firstLore} ／ `
                + `${entry.secondName} ${entry.secondLore}\n`;
        });
    }

    text += `\n総ターン数: ${game.log.length}\n`;
    text += `最終スコア: ${first.name} ${first.lore} ／ ${second.name} ${second.lore}\n`;

    document.getElementById('log-text').value = text;
    showScreen('screen-result');
}

// ── テキストファイルとして端末に保存する ──
function exportLog() {
    const text = document.getElementById('log-text').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');

    // ファイル名に今日の日付を入れる（例: lore-log-20260329.txt）
    const now = new Date();
    const filename = `lore-log-`
        + `${now.getFullYear()}`
        + `${String(now.getMonth() + 1).padStart(2, '0')}`
        + `${String(now.getDate()).padStart(2, '0')}.txt`;

    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ── キラキラエフェクトを表示してから終了画面へ ──
function showSparkleEffect(winnerName) {
    const overlay = document.getElementById('sparkle-overlay');
    const nameEl  = document.getElementById('sparkle-winner-name');
    const particles = document.getElementById('sparkle-particles');

    nameEl.textContent = `${winnerName} の勝利！`;

    // 粒子を生成（30個）
    particles.innerHTML = '';
    const colors = ['#c9a441', '#ffffff', '#f0d080', '#ffe44d', '#1e3a6e'];
    for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.classList.add('particle');

        // ランダムな方向・距離・サイズ・色・速度
        const angle    = Math.random() * 360;
        const distance = 80 + Math.random() * 140;
        const rad      = (angle * Math.PI) / 180;
        const tx       = Math.cos(rad) * distance;
        const ty       = Math.sin(rad) * distance;
        const size     = 6 + Math.random() * 10;
        const duration = 0.6 + Math.random() * 0.8;
        const color    = colors[Math.floor(Math.random() * colors.length)];

        el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            --tx: ${tx}px;
            --ty: ${ty}px;
            --duration: ${duration}s;
        `;
        particles.appendChild(el);
    }

    // オーバーレイを表示
    overlay.classList.remove('hidden');

    // 2.2秒後に終了画面へ
    setTimeout(() => {
        overlay.classList.add('hidden');
        endGame();
    }, 2200);
}

// ── 最初の画面に戻る ──
function resetGame() {
    game.player1 = { name: '', lore: 0 };
    game.player2 = { name: '', lore: 0 };
    game.turn = 1;
    game.log  = [];
    game.firstTurnEnded = false;

    document.getElementById('player1-name').value = '';
    document.getElementById('player2-name').value = '';
    document.getElementById('dice-result').classList.add('hidden');

    showScreen('screen-top');
}
