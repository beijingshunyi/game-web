// 万花楼-万象谜题游戏逻辑

class WanhuaGame {
    constructor() {
        this.currentUser = null;
        this.currentLevel = 1;
        this.coins = 0;
        this.consecutiveSignins = 0;
        this.achievements = [];
        this.levels = [];
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
    }

    // 模拟加载用户数据
    loadUserData() {
        // 在实际应用中，这里会从后端API获取数据
        this.currentUser = {
            id: 8392100400,
            name: "玩家",
            coins: 125,
            currentLevel: 5,
            consecutiveSignins: 3
        };

        this.coins = this.currentUser.coins;
        this.currentLevel = this.currentUser.currentLevel;
        this.consecutiveSignins = this.currentUser.consecutiveSignins;
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
    }

    // 获取关卡奖励
    getLevelReward(level) {
        if (level <= 50) return 3;
        if (level <= 100) return 5;
        if (level <= 150) return 8;
        if (level <= 200) return 12;
        if (level <= 300) return 10;
        if (level <= 400) return 15;
        if (level <= 500) return 18;
        if (level <= 600) return 22;
        if (level <= 700) return 16;
        if (level <= 750) return 20;
        if (level <= 850) return 18;
        if (level <= 900) return 23;
        if (level <= 1000) return 20;
        if (level <= 1050) return 25;
        if (level <= 1100) return 22;
        if (level <= 1150) return 28;
        if (level <= 1200) return 24;
        if (level <= 1250) return 30;
        if (level <= 1300) return 32;
        return Math.min(35 + Math.floor((level - 1300) / 100) * 5, 100);
    }

    // 获取签到奖励
    getSigninReward() {
        // 签到奖励递增
        return Math.min(this.consecutiveSignins + 1, 7);
    }

    // 开始游戏
    startGame() {
        alert(`游戏副本 ${this.currentLevel} 开始！\n\n关卡类型：解谜类\n关卡描述：请将以下图形碎片拼接成完整图形\n\n限时：60秒`);
        
        // 模拟游戏过程
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% 成功率
            if (success) {
                this.completeLevel();
            } else {
                this.failLevel();
            }
        }, 2000);
    }

    // 完成关卡
    completeLevel() {
        const reward = this.getLevelReward(this.currentLevel);
        this.coins += reward;
        this.currentLevel++;
        
        alert(`恭喜通关！\n\n获得 ${reward} 万花币\n已解锁第 ${this.currentLevel} 关`);
        
        // 更新用户数据
        this.updateUserProgress();
        
        // 更新UI
        this.updateUI();
    }

    // 关卡失败
    failLevel() {
        alert('挑战失败！请再试一次');
    }

    // 获取提示
    getHint() {
        if (this.coins >= 3) {
            this.coins -= 3;
            alert('提示：注意观察碎片的边缘形状，寻找匹配的连接点');
            this.updateUI();
        } else {
            alert('万花币不足，无法获取提示！');
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

    // 确认提现
    confirmWithdraw() {
        const alipay = document.getElementById('alipay-account').value;
        const name = document.getElementById('real-name').value;
        const amount = document.getElementById('withdraw-amount').value;
        
        if (!alipay || !name) {
            alert('请填写完整的支付宝信息');
            return;
        }
        
        const coinsNeeded = amount * 100;
        if (this.coins < coinsNeeded) {
            alert(`万花币不足！需要 ${coinsNeeded} 万花币`);
            return;
        }
        
        this.coins -= coinsNeeded;
        alert(`提现申请已提交！\n支付宝账号：${alipay}\n真实姓名：${name}\n金额：${amount}元\n\n请等待3-5个工作日到账`);
        
        // 关闭模态框
        document.getElementById('withdraw-modal').style.display = 'none';
        
        // 重置表单
        document.getElementById('alipay-account').value = '';
        document.getElementById('real-name').value = '';
        
        // 更新UI
        this.updateUI();
    }

    // 确认签到
    confirmSignin() {
        const reward = this.getSigninReward();
        this.coins += reward;
        this.consecutiveSignins++;
        
        alert(`签到成功！\n\n获得 ${reward} 万花币\n连续签到 ${this.consecutiveSignins} 天`);
        
        // 关闭模态框
        document.getElementById('signin-modal').style.display = 'none';
        
        // 更新用户数据
        this.updateUserProgress();
        
        // 更新UI
        this.updateUI();
    }

    // 显示成就
    showAchievements() {
        alert('您已完成以下成就：\n1. 初入江湖 - 完成第1关\n2. 坚持不懈 - 连续签到7天');
    }

    // 显示资产明细
    showAssets() {
        alert(`资产明细：\n\n总收入：200 万花币\n总支出：75 万花币\n余额：${this.coins} 万花币\n\n最近交易记录：\n+3 万花币 - 第5关奖励\n-3 万花币 - 购买提示\n+5 万花币 - 第4关奖励\n+10 万花币 - 连续签到奖励`);
    }

    // 分享游戏
    shareGame() {
        if (navigator.share) {
            navigator.share({
                title: '万象谜题',
                text: '快来挑战《万象谜题》，解锁智力极限！',
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(window.location.href);
            });
        } else {
            this.copyToClipboard(window.location.href);
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
        alert('链接已复制到剪贴板！');
    }

    // 刷新排行榜
    refreshLeaderboard() {
        const button = document.getElementById('refresh-leaderboard');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 刷新中...';
        
        // 模拟网络请求
        setTimeout(() => {
            button.innerHTML = originalText;
            alert('排行榜已刷新');
        }, 1000);
    }

    // 更新用户进度
    updateUserProgress() {
        // 在实际应用中，这里会向后端发送更新请求
        console.log('用户进度已更新');
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.wanhuaGame = new WanhuaGame();
});
