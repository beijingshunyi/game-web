// 游戏逻辑JavaScript文件

class WanhuaGame {
    constructor() {
        this.apiBaseUrl = 'https://wanhua-game.bingkuijing.workers.dev';
        this.token = localStorage.getItem('wanhua_token');
        this.userData = null;
        this.init();
    }

    init() {
        // 检查用户是否已登录
        if (this.token) {
            this.loadUserData();
        }
        
        // 绑定事件
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // Telegram登录回调
        window.onTelegramAuth = (user) => this.handleTelegramAuth(user);
    }

    // 处理Telegram登录
    async handleTelegramAuth(user) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('wanhua_token', this.token);
                this.userData = data.user;
                this.showGameInterface();
            } else {
                console.error('登录失败:', data.error);
                alert('登录失败，请重试');
            }
        } catch (error) {
            console.error('登录错误:', error);
            alert('登录过程中发生错误，请重试');
        }
    }

    // 加载用户数据
    async loadUserData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/user/data`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.userData = data.data;
                this.updateUI();
            } else {
                // 令牌无效，清除本地存储
                localStorage.removeItem('wanhua_token');
                this.token = null;
            }
        } catch (error) {
            console.error('加载用户数据错误:', error);
        }
    }

    // 显示游戏界面
    showGameInterface() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('gameStats').style.display = 'flex';
        document.getElementById('mainNavigation').style.display = 'flex';
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        if (!this.userData) return;
        
        document.getElementById('coinsCount').textContent = this.userData.coins;
        document.getElementById('currentLevel').textContent = this.userData.current_level;
        document.getElementById('checkInDays').textContent = this.userData.checkin_streak;
        document.getElementById('ranking').textContent = this.userData.ranking || '-';
        document.getElementById('checkInStreak').textContent = this.userData.checkin_streak;
        document.getElementById('todayReward').textContent = Math.min(this.userData.checkin_streak + 1, 7);
        document.getElementById('withdrawCoins').textContent = this.userData.coins;
        
        // 生成关卡
        this.generateLevels();
    }

    // 生成关卡
    async generateLevels() {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/levels/list`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                const grid = document.getElementById('puzzleGrid');
                grid.innerHTML = '';
                
                data.data.forEach(level => {
                    const levelElement = document.createElement('div');
                    levelElement.className = `puzzle-item ${level.unlocked ? '' : 'locked'}`;
                    levelElement.innerHTML = `
                        <div class="puzzle-number">${level.name}</div>
                        <div class="puzzle-reward">类型: ${level.type}</div>
                        <div class="puzzle-reward">奖励: ${level.reward}万花币</div>
                    `;
                    
                    if (level.unlocked) {
                        levelElement.onclick = () => this.playLevel(level.id);
                    }
                    
                    grid.appendChild(levelElement);
                });
            }
        } catch (error) {
            console.error('加载关卡数据错误:', error);
        }
    }

    // 玩特定关卡
    async playLevel(levelId) {
        alert(`开始挑战第${levelId}关！\n这是一个模拟的游戏界面。`);
        
        // 模拟完成关卡
        setTimeout(async () => {
            const complete = confirm(`是否完成第${levelId}关？`);
            if (complete) {
                await this.completeLevel(levelId);
            }
        }, 2000);
    }

    // 完成关卡
    async completeLevel(levelId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/levels/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ levelId })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                // 更新用户数据
                await this.loadUserData();
            } else {
                alert('关卡完成失败，请重试');
            }
        } catch (error) {
            console.error('完成关卡错误:', error);
            alert('完成关卡过程中发生错误，请重试');
        }
    }

    // 签到
    async checkIn() {
        if (!this.token) return;
        
        const button = document.getElementById('checkInButton');
        const status = document.getElementById('checkInStatus');
        
        try {
            button.disabled = true;
            button.textContent = '签到中...';
            
            const response = await fetch(`${this.apiBaseUrl}/checkin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                status.textContent = data.message;
                status.style.color = 'green';
                button.textContent = '今日已签到';
                // 更新用户数据
                await this.loadUserData();
            } else {
                status.textContent = '签到失败，请重试';
                status.style.color = 'red';
                button.disabled = false;
                button.textContent = '立即签到';
            }
        } catch (error) {
            console.error('签到错误:', error);
            status.textContent = '签到过程中发生错误，请重试';
            status.style.color = 'red';
            button.disabled = false;
            button.textContent = '立即签到';
        }
    }

    // 获取排行榜
    async loadRanking() {
        if (!this.token) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/ranking`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                const rankingList = document.getElementById('rankingList');
                rankingList.innerHTML = '';
                
                data.data.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.className = 'feature-item';
                    playerElement.innerHTML = `
                        <div class="feature-title">${this.getRankEmoji(player.rank)} 第${player.rank}名</div>
                        <p>${player.username} - 通关进度: ${player.levels}关</p>
                        <p>万花币: ${player.coins}</p>
                    `;
                    rankingList.appendChild(playerElement);
                });
            }
        } catch (error) {
            console.error('加载排行榜错误:', error);
        }
    }

    // 获取排名表情
    getRankEmoji(rank) {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '';
        }
    }

    // 提现请求
    async requestWithdraw() {
        if (!this.token) return;
        
        const amount = document.getElementById('withdrawAmount').value;
        const account = document.getElementById('alipayAccount').value;
        const name = document.getElementById('realName').value;
        
        if (!account || !name) {
            alert('请填写完整的支付宝账号和真实姓名');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount: parseInt(amount), alipayAccount: account, realName: name })
            });

            const data = await response.json();
            
            if (data.success) {
                alert(data.message);
                // 更新用户数据
                await this.loadUserData();
                // 清空输入
                document.getElementById('alipayAccount').value = '';
                document.getElementById('realName').value = '';
            } else {
                alert('提现申请失败：' + data.error);
            }
        } catch (error) {
            console.error('提现请求错误:', error);
            alert('提现申请过程中发生错误，请重试');
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WanhuaGame();
    
    // 绑定签到按钮事件
    document.getElementById('checkInButton').addEventListener('click', () => {
        window.game.checkIn();
    });
    
    // 绑定提现按钮事件
    window.requestWithdraw = () => {
        window.game.requestWithdraw();
    };
    
    // 绑定排行榜显示事件
    const originalShowSection = window.showSection;
    window.showSection = (section) => {
        if (section === 'ranking') {
            window.game.loadRanking();
        }
        originalShowSection(section);
    };
});
