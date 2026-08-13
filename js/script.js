// ===== JavaScript =====
document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const textarea = document.getElementById('participantTextarea');
    const loadBtn = document.getElementById('loadBtn');
    const drawBtn = document.getElementById('drawBtn');
    const resetBtn = document.getElementById('resetBtn');
    const participantListEl = document.getElementById('participantList');
    const winnerNameEl = document.getElementById('winnerName');
    const winnerBadge = document.getElementById('winnerBadge');
    const winnerLabel = document.getElementById('statusLabel');
    const countBadge = document.getElementById('participantCount');
    const winnerCard = document.getElementById('winnerCard');

    // Estado
    let participants = [];
    let isSpinning = false;
    let spinInterval = null;
    let isFirstDraw = true; // Flag para controlar o primeiro giro
    const specialName = '@leh_assalin'; // Nome especial que deve cair no primeiro giro

    // ========== FUNÇÕES ==========

    // Extrai nomes do textarea
    function extractNamesFromText(text) {
        const raw = text
            .replace(/\n/g, ',')
            .replace(/[;，、]/g, ',')
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        return raw;
    }

    // Carrega os nomes do textarea para a lista
    function loadNames() {
        if (isSpinning) return;

        const rawText = textarea.value;
        const names = extractNamesFromText(rawText);

        if (names.length === 0) {
            alert('Nenhum nome válido encontrado. Digite os nomes separados por vírgula ou quebra de linha.');
            return;
        }

        // Remove duplicatas
        const uniqueNames = [];
        const seen = new Set();
        for (const name of names) {
            const key = name.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                uniqueNames.push(name);
            }
        }

        participants = uniqueNames;
        renderList();
        textarea.value = '';
        textarea.focus();
        resetWinnerDisplay();
        
        // Reset da flag de primeiro giro ao carregar novos nomes
        isFirstDraw = true;
    }

    // Renderiza a lista de participantes
    function renderList() {
        participantListEl.innerHTML = '';

        participants.forEach((name, index) => {
            const li = document.createElement('li');
            
            // Destaca o nome especial na lista
            if (name.toLowerCase() === specialName.toLowerCase()) {
                li.style.borderColor = '#f39c12';
                li.style.background = 'rgba(230, 126, 34, 0.15)';
                li.style.fontWeight = '700';
                
                // Adiciona um ícone especial
                const nameSpan = document.createElement('span');
                nameSpan.textContent = name;
                nameSpan.style.display = 'flex';
                nameSpan.style.alignItems = 'center';
                nameSpan.style.gap = '0.5rem';
                
                const starIcon = document.createElement('span');
                starIcon.textContent = '⭐';
                starIcon.style.fontSize = '0.9rem';
                nameSpan.appendChild(starIcon);
                
                li.appendChild(nameSpan);
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '✕';
                removeBtn.setAttribute('aria-label', 'Remover participante');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isSpinning) return;
                    removeParticipant(index);
                });
                li.appendChild(removeBtn);
            } else {
                li.textContent = name;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '✕';
                removeBtn.setAttribute('aria-label', 'Remover participante');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (isSpinning) return;
                    removeParticipant(index);
                });
                li.appendChild(removeBtn);
            }

            participantListEl.appendChild(li);
        });

        countBadge.textContent = participants.length;

        // Se não houver participantes, limpa o vencedor
        if (participants.length === 0) {
            resetWinnerDisplay();
        } else {
            // Se o vencedor atual não está mais na lista, reseta
            const currentWinner = winnerNameEl.textContent;
            if (currentWinner !== '—' && !participants.includes(currentWinner)) {
                resetWinnerDisplay();
            }
        }

        // Atualiza estado do botão de sorteio
        drawBtn.disabled = participants.length === 0 || isSpinning;
    }

    // Remove participante
    function removeParticipant(index) {
        if (index < 0 || index >= participants.length || isSpinning) return;
        participants.splice(index, 1);
        renderList();
    }

    // Reseta a exibição do vencedor
    function resetWinnerDisplay() {
        winnerNameEl.textContent = '—';
        winnerNameEl.className = 'winner-name';
        winnerLabel.textContent = '🎰 SORTEANDO...';
        winnerLabel.className = 'winner-label';
        winnerBadge.className = 'winner-badge';
        winnerCard.classList.remove('spinning');
        drawBtn.disabled = participants.length === 0;
    }

    // ========== ANIMAÇÃO DA ROLETA ==========

    function startRoulette() {
        if (isSpinning) return;
        if (participants.length === 0) {
            alert('Adicione pelo menos um participante antes de sortear.');
            return;
        }

        // Verifica se é o primeiro giro e se o nome especial está na lista
        let forceWinner = null;
        if (isFirstDraw) {
            const specialIndex = participants.findIndex(p => p.toLowerCase() === specialName.toLowerCase());
            if (specialIndex !== -1) {
                forceWinner = participants[specialIndex];
            }
            // Se o nome especial não estiver na lista, faz sorteio normal
        }

        // Desabilita botões durante a animação
        isSpinning = true;
        drawBtn.disabled = true;
        loadBtn.disabled = true;
        resetBtn.disabled = true;

        // Remove classe de revelação anterior
        winnerNameEl.classList.remove('winner-reveal');

        // Ativa efeitos visuais de roleta
        winnerCard.classList.add('spinning');
        winnerLabel.textContent = '🎰 GIRANDO...';
        winnerLabel.className = 'winner-label spinning';
        winnerBadge.className = 'winner-badge spinning';

        // Se tem um vencedor forçado (primeiro giro com @leh_assalin)
        if (forceWinner) {
            // Animação curta com o nome especial
            let speed = 50;
            let totalTime = 0;
            const maxDuration = 1500 + Math.random() * 1000; // 1.5-2.5 segundos

            function spinStep() {
                if (participants.length === 0) {
                    stopRoulette();
                    return;
                }

                // Mostra nomes aleatórios durante a animação
                const randomIndex = Math.floor(Math.random() * participants.length);
                winnerNameEl.textContent = participants[randomIndex];
                winnerNameEl.className = 'winner-name rolling';

                totalTime += speed;

                if (totalTime < maxDuration * 0.7) {
                    // Fase rápida
                    speed += 5 + Math.random() * 10;
                    spinInterval = setTimeout(spinStep, speed);
                } else if (totalTime < maxDuration) {
                    // Desacelera
                    speed += 20 + Math.random() * 30;
                    spinInterval = setTimeout(spinStep, speed);
                } else {
                    // Para no nome especial
                    winnerNameEl.textContent = forceWinner;
                    winnerNameEl.className = 'winner-name winner-reveal';
                    
                    // Atualiza UI
                    winnerLabel.textContent = '🏆 VENCEDOR!';
                    winnerLabel.className = 'winner-label';
                    winnerBadge.className = 'winner-badge';
                    winnerCard.classList.remove('spinning');

                    // Reabilita botões
                    isSpinning = false;
                    drawBtn.disabled = false;
                    loadBtn.disabled = false;
                    resetBtn.disabled = false;
                    
                    // Marca que o primeiro giro já foi feito
                    isFirstDraw = false;
                    
                    // Limpa o timeout
                    if (spinInterval) {
                        clearTimeout(spinInterval);
                        spinInterval = null;
                    }
                }
            }

            spinInterval = setTimeout(spinStep, speed);
        } else {
            // Sorteio normal (aleatório) - mesmo código da versão anterior
            let speed = 50;
            let totalTime = 0;
            const maxDuration = 3000 + Math.random() * 2000; // entre 3 e 5 segundos

            function spinStep() {
                if (participants.length === 0) {
                    stopRoulette();
                    return;
                }

                const randomIndex = Math.floor(Math.random() * participants.length);
                winnerNameEl.textContent = participants[randomIndex];
                winnerNameEl.className = 'winner-name rolling';

                totalTime += speed;

                if (totalTime < maxDuration * 0.6) {
                    spinInterval = setTimeout(spinStep, speed);
                } else if (totalTime < maxDuration * 0.85) {
                    speed += 15 + Math.random() * 20;
                    spinInterval = setTimeout(spinStep, speed);
                } else if (totalTime < maxDuration) {
                    speed += 30 + Math.random() * 40;
                    spinInterval = setTimeout(spinStep, speed);
                } else {
                    stopRoulette();
                }
            }

            spinInterval = setTimeout(spinStep, speed);
        }
    }

    function stopRoulette() {
        // Limpa o timeout
        if (spinInterval) {
            clearTimeout(spinInterval);
            spinInterval = null;
        }

        // Escolhe o vencedor final (aleatório)
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const winner = participants[winnerIndex];
        winnerNameEl.textContent = winner;
        winnerNameEl.className = 'winner-name winner-reveal';

        // Atualiza UI
        winnerLabel.textContent = '🏆 VENCEDOR!';
        winnerLabel.className = 'winner-label';
        winnerBadge.className = 'winner-badge';
        winnerCard.classList.remove('spinning');

        // Reabilita botões
        isSpinning = false;
        drawBtn.disabled = false;
        loadBtn.disabled = false;
        resetBtn.disabled = false;
        
        // Marca que o primeiro giro já foi feito (se ainda não tiver sido marcado)
        if (isFirstDraw) {
            isFirstDraw = false;
        }
    }

    // ========== RESET COMPLETO ==========

    function resetAll() {
        if (isSpinning) return;

        if (participants.length > 0 || winnerNameEl.textContent !== '—') {
            if (!confirm('Resetar toda a lista e limpar o vencedor?')) return;
        }

        // Para qualquer animação pendente
        if (spinInterval) {
            clearTimeout(spinInterval);
            spinInterval = null;
        }

        participants = [];
        renderList();
        textarea.value = '';
        textarea.focus();
        resetWinnerDisplay();
        isSpinning = false;
        isFirstDraw = true; // Reseta a flag para o próximo carregamento

        // Reabilita botões
        drawBtn.disabled = true;
        loadBtn.disabled = false;
        resetBtn.disabled = false;
        winnerCard.classList.remove('spinning');
    }

    // ========== EVENTOS ==========

    loadBtn.addEventListener('click', loadNames);

    drawBtn.addEventListener('click', startRoulette);

    resetBtn.addEventListener('click', resetAll);

    // Ctrl+Enter no textarea para carregar
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            loadNames();
        }
    });

    // Inicializa
    renderList();
    textarea.focus();
});