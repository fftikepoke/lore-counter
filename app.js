// ゲームの状態をまとめて管理する入れ物
const game = {
    player1: { name: '', lore: 0 },
    player2: { name: '', lore: 0 },
    firstPlayerKey: 'player1',  // 先攻はplayer1かplayer2か
    secondPlayerKey: 'player2', // 後攻はplayer1かplayer2か
    firstSide: 'first',         // 先攻が表示されているHTML側（'first'=左 / 'second'=右）
    secondSide: 'second',       // 後攻が表示されているHTML側
    turn: 1,
    log: [],
    firstTurnEnded: false,
    boostFirst: false,  // 左側（Player1）のブーストON/OFF
    boostSecond: false, // 右側（Player2）のブーストON/OFF
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

    const dice1El  = document.getElementById('dice1');
    const dice2El  = document.getElementById('dice2');
    const resultEl = document.getElementById('dice-result');
    const messageEl = document.getElementById('dice-message');
    const startBtn = document.getElementById('start-btn');

    resultEl.classList.remove('hidden');
    dice1El.classList.remove('winner');
    dice2El.classList.remove('winner');
    startBtn.style.display = 'none';
    messageEl.textContent = '';

    let count = 0;
    const interval = setInterval(() => {
        dice1El.textContent = Math.ceil(Math.random() * 6);
        dice2El.textContent = Math.ceil(Math.random() * 6);
        count++;

        if (count >= 8) {
            clearInterval(interval);

            let d1 = Math.ceil(Math.random() * 6);
            let d2 = Math.ceil(Math.random() * 6);
            while (d1 === d2) {
                d2 = Math.ceil(Math.random() * 6);
            }

            dice1El.textContent = d1;
            dice2El.textContent = d2;

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
    game.turn = 1;
    game.log  = [];
    game.player1.lore = 0;
    game.player2.lore = 0;
    game.firstTurnEnded = false;

    // Player1は常に左（first側）、Player2は常に右（second側）に固定
    document.getElementById('first-player-name').textContent  = game.player1.name;
    document.getElementById('second-player-name').textContent = game.player2.name;
    document.getElementById('first-lore').textContent  = 0;
    document.getElementById('second-lore').textContent = 0;
    document.getElementById('turn-label').textContent  = 'ターン 1';

    // 先攻/後攻バッジをダイス結果に合わせて書き換える
    const firstBadge  = document.getElementById('first-order-badge');
    const secondBadge = document.getElementById('second-order-badge');

    if (game.firstPlayerKey === 'player1') {
        // Player1が先攻 → 左が先攻・右が後攻
        game.firstSide  = 'first';
        game.secondSide = 'second';
        firstBadge.textContent  = '先攻';
        firstBadge.className    = 'player-order-badge first-badge';
        secondBadge.textContent = '後攻';
        secondBadge.className   = 'player-order-badge second-badge';
    } else {
        // Player2が先攻 → 右が先攻・左が後攻
        game.firstSide  = 'second';
        game.secondSide = 'first';
        firstBadge.textContent  = '後攻';
        firstBadge.className    = 'player-order-badge second-badge';
        secondBadge.textContent = '先攻';
        secondBadge.className   = 'player-order-badge first-badge';
    }

    // ブーストをリセット
    game.boostFirst  = false;
    game.boostSecond = false;
    document.getElementById('first-boost-btn').classList.remove('active');
    document.getElementById('second-boost-btn').classList.remove('active');

    // 先攻側のターン終了ボタンだけ有効にする
    document.getElementById(`${game.firstSide}-turn-btn`).disabled  = false;
    document.getElementById(`${game.secondSide}-turn-btn`).disabled = true;

    showScreen('screen-game');
}

// ── ロア値を増減する ──
// who='first' は常にPlayer1（左）、'second' は常にPlayer2（右）
function changeLore(who, amount) {
    const player = who === 'first' ? game.player1 : game.player2;
    const boost  = who === 'first' ? game.boostFirst : game.boostSecond;
    const cap    = boost ? 25 : 20;

    player.lore = Math.min(cap, Math.max(0, player.lore + amount));
    document.getElementById(`${who}-lore`).textContent = player.lore;

    if (player.lore >= cap) {
        showSparkleEffect(player.name);
    }
}

// ── ブーストボタンのON/OFFを切り替える ──
function toggleBoost(who) {
    const player = who === 'first' ? game.player1 : game.player2;

    if (who === 'first') {
        game.boostFirst = !game.boostFirst;
        document.getElementById('first-boost-btn').classList.toggle('active', game.boostFirst);
        if (!game.boostFirst && player.lore >= 20) {
            showSparkleEffect(player.name);
        }
    } else {
        game.boostSecond = !game.boostSecond;
        document.getElementById('second-boost-btn').classList.toggle('active', game.boostSecond);
        if (!game.boostSecond && player.lore >= 20) {
            showSparkleEffect(player.name);
        }
    }
}

// ── ターン終了ボタンを押したとき ──
function endTurn(who) {
    if (who === game.firstSide) {
        // 先攻側がターン終了 → 後攻側のターンへ
        game.firstTurnEnded = true;
        document.getElementById(`${game.firstSide}-turn-btn`).disabled  = true;
        document.getElementById(`${game.secondSide}-turn-btn`).disabled = false;
    } else {
        // 後攻側がターン終了 → ログ記録・ターン数+1
        const firstPlayer  = game[game.firstPlayerKey];
        const secondPlayer = game[game.secondPlayerKey];

        game.log.push({
            turn:       game.turn,
            firstName:  firstPlayer.name,
            firstLore:  firstPlayer.lore,
            secondName: secondPlayer.name,
            secondLore: secondPlayer.lore,
        });

        game.turn++;
        document.getElementById('turn-label').textContent = `ターン ${game.turn}`;

        game.firstTurnEnded = false;
        document.getElementById(`${game.firstSide}-turn-btn`).disabled  = false;
        document.getElementById(`${game.secondSide}-turn-btn`).disabled = true;
    }
}

// ── ゲームを終了してログを表示する ──
function endGame() {
    const firstPlayer  = game[game.firstPlayerKey];
    const secondPlayer = game[game.secondPlayerKey];

    const now = new Date();
    const dateStr = `${now.getFullYear()}-`
        + `${String(now.getMonth() + 1).padStart(2, '0')}-`
        + `${String(now.getDate()).padStart(2, '0')} `
        + `${String(now.getHours()).padStart(2, '0')}:`
        + `${String(now.getMinutes()).padStart(2, '0')}`;

    let text = `=== Lore Counter 対戦ログ ===\n`;
    text += `日時: ${dateStr}\n`;
    text += `先攻: ${firstPlayer.name} ／ 後攻: ${secondPlayer.name}\n\n`;

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
    text += `最終スコア: ${firstPlayer.name} ${firstPlayer.lore} ／ ${secondPlayer.name} ${secondPlayer.lore}\n`;

    document.getElementById('log-text').value = text;
    showScreen('screen-result');
}

// ── テキストファイルとして端末に保存する ──
function exportLog() {
    const text = document.getElementById('log-text').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');

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
    const overlay   = document.getElementById('sparkle-overlay');
    const nameEl    = document.getElementById('sparkle-winner-name');
    const particles = document.getElementById('sparkle-particles');

    nameEl.textContent = `${winnerName} の勝利！`;

    particles.innerHTML = '';
    const colors = ['#c9a441', '#ffffff', '#f0d080', '#ffe44d', '#1e3a6e'];
    for (let i = 0; i < 30; i++) {
        const el       = document.createElement('div');
        el.classList.add('particle');

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

    overlay.classList.remove('hidden');

    setTimeout(() => {
        overlay.classList.add('hidden');
        endGame();
    }, 2200);
}

// ── 最初の画面に戻る ──
function resetGame() {
    game.player1 = { name: '', lore: 0 };
    game.player2 = { name: '', lore: 0 };
    game.turn    = 1;
    game.log     = [];
    game.firstTurnEnded = false;
    game.firstSide  = 'first';
    game.secondSide = 'second';

    document.getElementById('player1-name').value = '';
    document.getElementById('player2-name').value = '';
    document.getElementById('dice-result').classList.add('hidden');

    showScreen('screen-top');
}
