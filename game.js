// 万花楼-万象谜题游戏逻辑

class WanhuaGame {
    constructor() {
        this.currentUser = null;
        this.currentLevel = 1;
        this.coins = 0;
        this.consecutiveSignins = 0;
        this.achievements = [];
        this.levels = [];
        this.gameState = 'menu'; // menu, playing, completed, failed
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
        this.initGameLevels();
    }

    // 初始化游戏关卡数据
    initGameLevels() {
        this.levelTypes = [
            { id: 'puzzle', name: '解谜类' },
            { id: 'strategy', name: '策略类' },
            { id: 'action', name: '动作类' },
            { id: 'memory', name: '记忆类' }
        ];
        
        // 生成2000个关卡的数据
        this.levels = [];
        for (let i = 1; i <= 2000; i++) {
            const levelType = this.levelTypes[Math.floor(Math.random() * this.levelTypes.length)];
            this.levels.push({
                id: i,
                number: i,
                type: levelType.id,
                typeName: levelType.name,
                difficulty: Math.min(Math.floor(i / 100) + 1, 5),
                reward: this.getLevelReward(i),
                title: `${levelType.name}关卡 ${i}`,
                description: this.generateLevelDescription(i, levelType.id)
            });
        }
    }

    // 生成关卡描述
    generateLevelDescription(level, type) {
        const descriptions = {
            puzzle: [
                "将碎片拼接成完整图形",
                "根据线索推导密码",
                "按顺序触发机关",
                "解决复杂的图形重构问题",
                "破解密码锁获得线索"
            ],
            strategy: [
                "合理分配有限资源完成任务",
                "规划最优路径到达终点",
                "管理资源在限定时间内完成目标",
                "制定策略通过复杂迷宫",
                "优化资源配置获取最大收益"
            ],
            action: [
                "控制角色跳过平台",
                "在限定时间内点击目标",
                "精准操作完成挑战",
                "躲避障碍物到达终点",
                "快速反应点击出现的目标"
            ],
            memory: [
                "记住数字序列并复现",
                "观察图形位置并复原",
                "记忆操作步骤并重复",
                "记住颜色顺序并重现",
                "观察并记住关键信息"
            ]
        };
        
        const typeDesc = descriptions[type] || descriptions.puzzle;
        return typeDesc[Math.floor(Math.random() * typeDesc.length)];
    }

    // 保存用户数据到本地存储
    saveUserData() {
        try {
            localStorage.setItem('wanhuaGameUserData', JSON.stringify(this.currentUser));
        } catch (e) {
            console.error('保存用户数据时出错:', e);
            // 可以添加用户友好的错误提示
            // alert('保存数据时出现问题，请检查存储空间');
        }
    }

    // 模拟加载用户数据
    loadUserData() {
        try {
            // 检查本地存储中是否有用户数据
            const savedData = localStorage.getItem('wanhuaGameUserData');
            if (savedData) {
                this.currentUser = JSON.parse(savedData);
            } else {
                // 创建新用户
                this.currentUser = {
                    id: Date.now(), // 简单的用户ID生成
                    name: "玩家",
                    coins: 0,
                    currentLevel: 1,
                    consecutiveSignins: 0,
                    totalSignins: 0,
                    completedLevels: [],
                    achievements: []
                };
                this.saveUserData();
            }

            this.coins = this.currentUser.coins;
            this.currentLevel = this.currentUser.currentLevel;
            this.consecutiveSignins = this.currentUser.consecutiveSignins;
        } catch (e) {
            console.error('加载用户数据时出错:', e);
            // 使用默认值初始化
            this.currentUser = {
                id: Date.now(),
                name: "玩家",
                coins: 0,
                currentLevel: 1,
                consecutiveSignins: 0,
                totalSignins: 0,
                completedLevels: [],
                achievements: []
            };
            this.coins = 0;
            this.currentLevel = 1;
            this.consecutiveSignins = 0;
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 开始游戏按钮
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });

        // 获取提示按钮
        document.getElementById('get-hint').addEventListener('click', () => {
            this.getHint();
        });

        // 提现按钮
        document.getElementById('withdraw-btn').addEventListener('click', () => {
            this.openWithdrawModal();
        });

        // 签到按钮
        document.getElementById('signin-btn').addEventListener('click', () => {
            this.openSigninModal();
        });

        // 成就按钮
        document.getElementById('achievements-btn').addEventListener('click', () => {
            this.showAchievements();
        });

        // 资产明细按钮
        document.getElementById('assets-btn').addEventListener('click', () => {
            this.showAssets();
        });

        // 分享按钮
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareGame();
        });

        // 刷新排行榜
        document.getElementById('refresh-leaderboard').addEventListener('click', () => {
            this.refreshLeaderboard();
        });

        // 模态框关闭按钮
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // 确认提现
        document.getElementById('confirm-withdraw').addEventListener('click', () => {
            this.confirmWithdraw();
        });

        // 确认签到
        document.getElementById('confirm-signin').addEventListener('click', () => {
            this.confirmSignin();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // 动态事件绑定：游戏区域的按钮点击
        document.getElementById('game-area').addEventListener('click', (e) => {
            const target = e.target;
            
            // 动作类游戏的目标点击
            if (target.id === 'action-target' && this.gameState === 'playing') {
                this.handleActionGameClick(e);
            }

            // 开始挑战按钮
            if (target.id === 'start-game-btn') {
                this.startGame();
            }

            // 获取提示按钮
            if (target.id === 'get-hint-btn') {
                this.getHint();
            }

            // 提交答案按钮
            if (target.id === 'submit-answer-btn') {
                this.submitAnswer();
            }

            // 放弃挑战按钮
            if (target.id === 'cancel-game-btn') {
                this.cancelGame();
            }

            // 进入下一关按钮
            if (target.id === 'next-level-btn') {
                this.nextLevel();
            }

            // 返回主菜单按钮
            if (target.id === 'back-to-menu-btn' || target.id === 'back-to-menu-fail-btn') {
                this.gameState = 'menu';
                this.updateUI();
            }

            // 重新挑战按钮
            if (target.id === 'retry-level-btn') {
                this.retryLevel();
            }
        });
    }

    // 更新UI
    updateUI() {
        document.getElementById('user-id').textContent = this.currentUser.id;
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('signin-days').textContent = this.consecutiveSignins;
        document.getElementById('reward-amount').textContent = this.getLevelReward(this.currentLevel);
        
        // 更新签到模态框数据
        document.getElementById('signin-reward').textContent = this.getSigninReward();
        document.getElementById('consecutive-days').textContent = this.consecutiveSignins + 1;
        
        // 更新游戏区域
        this.updateGameArea();
    }

    // 更新游戏区域显示
    updateGameArea() {
        const gameArea = document.getElementById('game-area');
        const levelData = this.levels[this.currentLevel - 1];
        
        if (this.gameState === 'menu') {
            gameArea.innerHTML = `
                <div class="level-display" id="level-display">${this.currentLevel}</div>
                <div class="reward-display">通关奖励：<span id="reward-amount">${this.getLevelReward(this.currentLevel)}</span> 万花币</div>
                <button class="btn btn-large pulse" id="start-game-btn">
                    <i class="fas fa-play"></i> 开始挑战
                </button>
                <button class="btn btn-secondary btn-block" id="get-hint-btn">
                    <i class="fas fa-lightbulb"></i> 获取提示 (-3币)
                </button>
            `;
        } else if (this.gameState === 'playing') {
            gameArea.innerHTML = `
                <h3>游戏副本 ${this.currentLevel}</h3>
                <p>类型：${levelData.typeName}</p>
                <p>难度：${'★'.repeat(levelData.difficulty)}${'☆'.repeat(5 - levelData.difficulty)}</p>
                <p>描述：${levelData.description}</p>
                <div id="game-content" style="margin: 20px 0; min-height: 150px; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 15px; text-align: center;">
                    ${this.generateGameContent(levelData)}
                </div>
                <button class="btn btn-block btn-success" id="submit-answer-btn">
                    <i class="fas fa-check"></i> 提交答案
                </button>
                <button class="btn btn-block btn-secondary" id="cancel-game-btn">
                    <i class="fas fa-times"></i> 放弃挑战
                </button>
            `;
        } else if (this.gameState === 'completed') {
            gameArea.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; color: #28a745; margin-bottom: 20px;">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <h3>恭喜通关！</h3>
                    <p>游戏副本 ${this.currentLevel} 完成</p>
                    <p>获得奖励：${levelData.reward} 万花币</p>
                    <button class="btn btn-block btn-success" id="next-level-btn">
                        <i class="fas fa-arrow-right"></i> 进入下一关
                    </button>
                    <button class="btn btn-block btn-secondary" id="back-to-menu-btn">
                        <i class="fas fa-home"></i> 返回主菜单
                    </button>
                </div>
            `;
        } else if (this.gameState === 'failed') {
            gameArea.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 4rem; color: #dc3545; margin-bottom: 20px;">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h3>挑战失败</h3>
                    <p>游戏副本 ${this.currentLevel} 未完成</p>
                    <button class="btn btn-block btn-warning" id="retry-level-btn">
                        <i class="fas fa-redo"></i> 重新挑战
                    </button>
                    <button class="btn btn-block btn-secondary" id="back-to-menu-fail-btn">
                        <i class="fas fa-home"></i> 返回主菜单
                    </button>
                </div>
            `;
        }
    }

    // 生成游戏内容
    generateGameContent(levelData) {
        switch (levelData.type) {
            case 'puzzle':
                return `
                    <div style="font-size: 3rem; margin: 20px 0;">🧩</div>
                    <p>请将以下图形碎片重新排列组成完整图形</p>
                    <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
                        <div style="width: 50px; height: 50px; background: var(--accent); transform: rotate(45deg);"></div>
                        <div style="width: 50px; height: 50px; background: var(--primary); transform: rotate(20deg);"></div>
                        <div style="width: 50px; height: 50px; background: var(--secondary); transform: rotate(-30deg);"></div>
                    </div>
                    <p>拖拽碎片到正确位置</p>
                `;
            case 'strategy':
                return `
                    <div style="font-size: 3rem; margin: 20px 0;">♟️</div>
                    <p>合理分配资源完成目标</p>
                    <div style="margin: 20px 0;">
                        <p>当前资源: <span style="color: var(--accent);">100</span> 点</p>
                        <p>目标: 分配资源使收益最大化</p>
                    </div>
                `;
            case 'action':
                return `
                    <div style="font-size: 3rem; margin: 20px 0;">⚡</div>
                    <p>快速点击出现的目标</p>
                    <div id="action-target" style="width: 80px; height: 80px; background: var(--danger); border-radius: 50%; margin: 20px auto; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white;">
                        点击
                    </div>
                    <p>剩余时间: <span id="timer">10</span>s</p>
                `;
            case 'memory':
                return `
                    <div style="font-size: 3rem; margin: 20px 0;">🧠</div>
                    <p>记住以下数字序列</p>
                    <div style="font-size: 2rem; margin: 20px 0; letter-spacing: 10px;">
                        ${Math.floor(Math.random() * 9000) + 1000}
                    </div>
                    <p>时间结束后请输入记住的数字</p>
                `;
            default:
                return `<p>开始挑战游戏副本 ${levelData.number}</p>`;
        }
    }

    // 处理动作游戏点击事件（已重命名）
    handleActionGameClick(e) {
        if (this.gameState !== 'playing') return;
        
        const levelData = this.levels[this.currentLevel - 1];
        if (levelData.type !== 'action') return;
        
        // 增加得分
        this.actionGameScore = (this.actionGameScore || 0) + 1;
        
        // 改变目标颜色
        const target = e.target;
        target.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        // 随机移动目标位置
        const gameContent = document.getElementById('game-content');
        const maxX = gameContent.clientWidth - 80;
        const maxY = gameContent.clientHeight - 80;
        const newX = Math.floor(Math.random() * maxX);
        const newY = Math.floor(Math.random() * maxY);
        
        target.style.position = 'absolute';
        target.style.left = `${newX}px`;
        target.style.top = `${newY}px`;
    }

    // 获取关卡奖励
    getLevelReward(level) {
        // 设计更平滑的奖励增长曲线
        if (level <= 50) return 3;
        if (level <= 100) return 5;
        if (level <= 200) return 8;
        if (level <= 300) return 10;
        if (level <= 400) return 12;
        if (level <= 500) return 15;
        if (level <= 750) return 18;
        if (level <= 1000) return 20;
        if (level <= 1250) return 25;
        if (level <= 1500) return 30;
        if (level <= 1750) return 35;
        if (level <= 2000) return 40;
        return 50; // 2000关之后的奖励
    }

    // 获取签到奖励
    getSigninReward() {
        // 签到奖励递增
        return Math.min(this.consecutiveSignins + 1, 7);
    }

    // 开始游戏
    startGame() {
        this.gameState = 'playing';
        this.updateUI();
        
        // 对于动作类游戏，启动计时器
        const levelData = this.levels[this.currentLevel - 1];
        if (levelData.type === 'action') {
            this.actionGameScore = 0;
            let timeLeft = 10;
            const timerElement = document.getElementById('timer');
            
            if (timerElement) {
                this.actionTimer = setInterval(() => {
                    timeLeft--;
                    timerElement.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        clearInterval(this.actionTimer);
                        // 自动提交答案
                        setTimeout(() => {
                            this.submitAnswer();
                        }, 500);
                    }
                }, 1000);
            }
        }
    }

    // 提交答案
    submitAnswer() {
        // 清除动作游戏计时器
        if (this.actionTimer) {
            clearInterval(this.actionTimer);
        }
        
        // 模拟判断答案正确性（70%成功率）
        const success = Math.random() > 0.3;
        
        if (success) {
            this.completeLevel();
        } else {
            this.failLevel();
        }
    }

    // 取消游戏
    cancelGame() {
        // 清除动作游戏计时器
        if (this.actionTimer) {
            clearInterval(this.actionTimer);
        }
        
        this.gameState = 'menu';
        this.updateUI();
    }

    // 完成关卡
    completeLevel() {
        const levelData = this.levels[this.currentLevel - 1];
        const reward = levelData.reward;
        
        this.coins += reward;
        this.currentUser.coins = this.coins;
        
        // 记录完成的关卡
        if (!this.currentUser.completedLevels.includes(this.currentLevel)) {
            this.currentUser.completedLevels.push(this.currentLevel);
        }
        
        // 解锁下一关
        if (this.currentLevel < 2000) {
            this.currentLevel++;
            this.currentUser.currentLevel = this.currentLevel;
        }
        
        this.gameState = 'completed';
        this.saveUserData();
        this.updateUI();
        
        // 检查成就
        this.checkAchievements();
    }

    // 关卡失败
    failLevel() {
        this.gameState = 'failed';
        this.updateUI();
    }

    // 进入下一关
    nextLevel() {
        if (this.currentLevel <= 2000) {
            this.gameState = 'menu';
            this.updateUI();
        } else {
            // 游戏完成
            alert('恭喜！您已完成所有2000个关卡！');
            this.gameState = 'menu';
            this.updateUI();
        }
    }

    // 重新挑战
    retryLevel() {
        this.gameState = 'playing';
        this.updateUI();
    }

    // 获取提示
    getHint() {
        if (this.coins >= 3) {
            this.coins -= 3;
            this.currentUser.coins = this.coins;
            this.saveUserData();
            
            const hints = [
                "仔细观察关卡描述中的线索",
                "尝试不同的组合方式",
                "注意时间限制，合理分配时间",
                "有些线索可能需要多步推理",
                "参考之前类似关卡的解决方案"
            ];
            
            const hint = hints[Math.floor(Math.random() * hints.length)];
            try {
                alert(`💡 提示：\n${hint}`);
            } catch (e) {
                console.error('显示提示时出错:', e);
                // 降级处理：在控制台输出提示
                console.log(`💡 提示：${hint}`);
            }
            this.updateUI();
        } else {
            try {
                alert('万花币不足，无法获取提示！');
            } catch (e) {
                console.error('显示提示时出错:', e);
                console.log('万花币不足，无法获取提示！');
            }
        }
    }

    // 打开提现模态框
    openWithdrawModal() {
        document.getElementById('withdraw-modal').style.display = 'flex';
    }

    // 打开签到模态框
    openSigninModal() {
        document.getElementById('signin-modal').style.display = 'flex';
    }

    // 确认签到
    confirmSignin() {
        // 检查今天是否已经签到
        const today = new Date().toDateString();
        const lastSignin = this.currentUser.lastSignin || '';
        
        if (lastSignin === today) {
            alert('您今天已经签到过了！');
            document.getElementById('signin-modal').style.display = 'none';
            return;
        }
        
        const reward = this.getSigninReward();
        this.coins += reward;
        this.currentUser.coins = this.coins;
        this.consecutiveSignins++;
        this.currentUser.consecutiveSignins = this.consecutiveSignins;
        this.currentUser.totalSignins = (this.currentUser.totalSignins || 0) + 1;
        this.currentUser.lastSignin = today;
        
        this.saveUserData();
        
        alert(`签到成功！\n\n获得 ${reward} 万花币\n连续签到 ${this.consecutiveSignins} 天`);
        
        // 关闭模态框
        document.getElementById('signin-modal').style.display = 'none';
        
        // 更新UI
        this.updateUI();
        
        // 检查成就
        this.checkAchievements();
    }

    // 检查成就
    checkAchievements() {
        try {
            // 这里可以实现成就检查逻辑
            // 为简化示例，我们只在特定条件下解锁成就
            if (this.currentUser.completedLevels.length >= 1 && !this.currentUser.achievements.includes('初入江湖')) {
                this.currentUser.achievements.push('初入江湖');
                try {
                    alert('🏆 成就解锁：初入江湖\n完成第1关');
                } catch (e) {
                    console.log('🏆 成就解锁：初入江湖\n完成第1关');
                }
            }
            
            if (this.currentUser.completedLevels.length >= 10 && !this.currentUser.achievements.includes('初窥门径')) {
                this.currentUser.achievements.push('初窥门径');
                try {
                    alert('🏆 成就解锁：初窥门径\n完成10关');
                } catch (e) {
                    console.log('🏆 成就解锁：初窥门径\n完成10关');
                }
            }
            
            this.saveUserData();
        } catch (e) {
            console.error('检查成就时出错:', e);
        }
    }

    // 显示成就
    showAchievements() {
        try {
            if (this.currentUser.achievements.length === 0) {
                try {
                    alert('您还没有解锁任何成就，继续游戏来解锁成就吧！');
                } catch (e) {
                    console.log('您还没有解锁任何成就，继续游戏来解锁成就吧！');
                }
                return;
            }
            
            let achievementText = '您已完成以下成就：\n\n';
            this.currentUser.achievements.forEach((achievement, index) => {
                achievementText += `${index + 1}. ${achievement}\n`;
            });
            
            try {
                alert(achievementText);
            } catch (e) {
                console.log(achievementText);
            }
        } catch (e) {
            console.error('显示成就时出错:', e);
            try {
                alert('显示成就时出现问题');
            } catch (e2) {
                console.log('显示成就时出现问题');
            }
        }
    }

    // 显示资产明细
    showAssets() {
        try {
            let assetsText = `资产明细：\n\n`;
            assetsText += `万花币余额：${this.coins}\n`;
            assetsText += `已完成关卡：${this.currentUser.completedLevels.length}\n`;
            assetsText += `连续签到：${this.consecutiveSignins} 天\n`;
            assetsText += `总签到：${this.currentUser.totalSignins || 0} 天\n`;
            assetsText += `解锁成就：${this.currentUser.achievements.length} 个\n\n`;
            
            if (this.currentUser.completedLevels.length > 0) {
                assetsText += `最近完成的关卡：\n`;
                const recentLevels = this.currentUser.completedLevels.slice(-5).reverse();
                recentLevels.forEach(level => {
                    assetsText += `游戏副本 ${level} (奖励${this.getLevelReward(level)}币)\n`;
                });
            }
            
            try {
                alert(assetsText);
            } catch (e) {
                console.log(assetsText);
            }
        } catch (e) {
            console.error('显示资产明细时出错:', e);
            try {
                alert('显示资产明细时出现问题');
            } catch (e2) {
                console.log('显示资产明细时出现问题');
            }
        }
    }

    // 分享游戏
    shareGame() {
        const shareText = '快来挑战《万象谜题》，解锁智力极限！';
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: '万象谜题',
                text: shareText,
                url: shareUrl
            }).catch(() => {
                this.copyToClipboard(`${shareText}\n${shareUrl}`);
            });
        } else {
            this.copyToClipboard(`${shareText}\n${shareUrl}`);
        }
    }

    // 复制到剪贴板
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('游戏链接已复制到剪贴板！');
    }

    // 刷新排行榜
    refreshLeaderboard() {
        const button = document.getElementById('refresh-leaderboard');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 刷新中...';
        
        // 模拟网络请求和排行榜更新
        setTimeout(() => {
            button.innerHTML = originalText;
            
            // 更新排行榜显示
            const leaderboardElement = document.getElementById('leaderboard');
            leaderboardElement.innerHTML = `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank rank-1">1.</span>
                    <span class="leaderboard-name">玩家A</span>
                    <span class="leaderboard-coins">1200 币</span>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank rank-2">2.</span>
                    <span class="leaderboard-name">玩家B</span>
                    <span class="leaderboard-coins">980 币</span>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank rank-3">3.</span>
                    <span class="leaderboard-name">玩家C</span>
                    <span class="leaderboard-coins">850 币</span>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">4.</span>
                    <span class="leaderboard-name">玩家D</span>
                    <span class="leaderboard-coins">620 币</span>
                </div>
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">5.</span>
                    <span class="leaderboard-name">${this.currentUser.name || '您'}</span>
                    <span class="leaderboard-coins">${this.coins} 币</span>
                </div>
            `;
            
            alert('排行榜已刷新');
        }, 1000);
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.wanhuaGame = new WanhuaGame();
});
