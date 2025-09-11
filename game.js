// 万花楼-万花消消乐游戏逻辑

class WanhuaGame {
    constructor() {
        // 游戏状态
        this.gameState = {
            board: [],
            selectedCell: null,
            score: 0,
            moves: 30,
            level: 1,
            targetScore: 500,
            coins: 20,
            isDragging: false,
            dragStart: null,
            dragEnd: null,
            tools: {
                hammer: 2,
                bomb: 1,
                shuffle: 3,
                magic: 0
            },
            moveTimer: null,
            moveTimeLeft: 10,
            baseMoveTime: 10,
            userId: null
        };
        
        // 游戏配置
        this.emojis = ['🍬', '🍭', '🍫', '🧁', '🍪', '🍩'];
        this.BOARD_SIZE = 8;
        
        // 障碍物类型
        this.obstacleTypes = {
            ICE: 'ice',           // 冰块 - 需要多次消除才能破坏
            LOCK: 'lock',         // 锁链 - 锁定相邻方块
            STONE: 'stone',       // 石头 - 无法移动，需要特殊道具破坏
            BOMB: 'time-bomb'     // 定时炸弹 - 步数减少时会倒计时
        };
        
        // 成就系统
        this.achievements = [
            { id: 1, name: "初出茅庐", description: "完成第1关", icon: "👶", unlocked: true },
            { id: 2, name: "小试牛刀", description: "完成第10关", icon: "新人玩家", unlocked: false },
            { id: 3, name: "渐入佳境", description: "完成第50关", icon: "🚀", unlocked: false },
            { id: 4, name: "炉火纯青", description: "完成第100关", icon: "🔥", unlocked: false },
            { id: 5, name: "登峰造极", description: "完成第500关", icon: "🏔️", unlocked: false },
            { id: 6, name: "无敌寂寞", description: "完成第1000关", icon: "😎", unlocked: false },
            { id: 7, name: "消除大师", description: "单次消除10个方块", icon: "🎯", unlocked: false },
            { id: 8, name: "连击高手", description: "一次操作引发3次连锁消除", icon: "⚡", unlocked: false },
            { id: 9, name: "完美通关", description: "以满步数完成关卡", icon: "💯", unlocked: false },
            { id: 10, name: "财源滚滚", description: "累计获得10000万花币", icon: "💰", unlocked: false },
            { id: 11, name: "坚持不懈", description: "连续签到7天", icon: "📅", unlocked: false },
            { id: 12, name: "社交达人", description: "分享游戏10次", icon: "📱", unlocked: false }
        ];

        // 为关卡预设成就
        for (let i = 1; i <= 60; i++) {
            const levelRange = (i - 1) * 100 + 1;
            const levelRangeEnd = i * 100;
            this.achievements.push({
                id: 12 + i,
                name: `关卡征服者 ${levelRange}-${levelRangeEnd}`,
                description: `完成第${levelRange}到${levelRangeEnd}关`,
                icon: "🏅",
                unlocked: false
            });
        }
        
        this.init();
    }

    init() {
        // 获取用户ID
        const urlParams = new URLSearchParams(window.location.search);
        this.gameState.userId = urlParams.get('user_id');
        
        // 如果没有用户ID，提示错误
        if (!this.gameState.userId) {
            this.showError('缺少用户信息，请通过Telegram重新进入游戏');
            return;
        }
        
        // 加载用户数据
        this.loadUserData();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 更新UI
        this.updateUI();
    }

    // 显示错误信息
    showError(message) {
        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h2 style="color: #ff4757;">游戏初始化失败</h2>
                    <p>${message}</p>
                    <p>请访问我们的Telegram机器人: @bjxcyouxiBot</p>
                </div>
            `;
        }
        alert(message);
    }

    // 从数据库加载用户数据
    async loadUserData() {
        // 在实际实现中，这里会从Supabase加载用户数据
        // 目前使用默认值
        console.log('加载用户数据，用户ID:', this.gameState.userId);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 首页事件
        const startGameBtn = document.getElementById('start-game');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.showGamePage());
        }
        
        // 游戏页面事件
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.resetGame());
        }
        
        const shopBtn = document.getElementById('shop-btn');
        if (shopBtn) {
            shopBtn.addEventListener('click', () => this.openModal('shop-modal'));
        }
        
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => this.showHomePage());
        }
        
        const checkinBtn = document.getElementById('checkin-btn');
        if (checkinBtn) {
            checkinBtn.addEventListener('click', () => this.openModal('checkin-modal'));
        }
        
        const rankingBtn = document.getElementById('ranking-btn');
        if (rankingBtn) {
            rankingBtn.addEventListener('click', () => this.openModal('ranking-modal'));
        }
        
        const achievementsBtn = document.getElementById('achievements-btn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => this.showAchievements());
        }
        
        const withdrawBtn = document.getElementById('withdraw-btn');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.openModal('withdraw-modal'));
        }
        
        // 道具事件
        const hammerTool = document.getElementById('hammer-tool');
        if (hammerTool) {
            hammerTool.addEventListener('click', () => this.useTool('hammer'));
        }
        
        const bombTool = document.getElementById('bomb-tool');
        if (bombTool) {
            bombTool.addEventListener('click', () => this.useTool('bomb'));
        }
        
        const shuffleTool = document.getElementById('shuffle-tool');
        if (shuffleTool) {
            shuffleTool.addEventListener('click', () => this.useTool('shuffle'));
        }
        
        const magicTool = document.getElementById('magic-tool');
        if (magicTool) {
            magicTool.addEventListener('click', () => this.useTool('magic'));
        }
    }

    // 显示游戏页面
    showGamePage() {
        const homePage = document.getElementById('home-page');
        const gamePage = document.getElementById('game-page');
        
        if (homePage) homePage.style.display = 'none';
        if (gamePage) gamePage.style.display = 'block';
        
        this.createBoard();
        this.renderBoard();
        this.setupTouchEvents();
        this.resetMoveTimer();
    }

    // 显示首页
    showHomePage() {
        const homePage = document.getElementById('home-page');
        const gamePage = document.getElementById('game-page');
        
        // 清除当前计时器
        if (this.gameState.moveTimer) {
            clearInterval(this.gameState.moveTimer);
            this.gameState.moveTimer = null;
        }
        
        if (gamePage) gamePage.style.display = 'none';
        if (homePage) homePage.style.display = 'block';
        
        this.updateHomeUI();
    }

    // 更新首页UI
    updateHomeUI() {
        const homeCoins = document.getElementById('home-coins');
        const homeLevel = document.getElementById('home-level');
        const homeAchievements = document.getElementById('home-achievements');
        
        if (homeCoins) homeCoins.textContent = this.gameState.coins;
        if (homeLevel) homeLevel.textContent = this.gameState.level;
        if (homeAchievements) homeAchievements.textContent = this.achievements.filter(a => a.unlocked).length;
    }

    // 创建游戏板
    createBoard() {
        this.gameState.board = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            this.gameState.board[i] = [];
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                // 根据关卡确定是否生成障碍物
                const obstacleChance = Math.min(0.4, this.gameState.level * 0.008);
                
                if (Math.random() < obstacleChance && !(i === 0 && j === 0) && !(i === this.BOARD_SIZE-1 && j === this.BOARD_SIZE-1)) {
                    // 生成障碍物
                    let obstacleType;
                    const levelFactor = this.gameState.level / 100;
                    
                    if (Math.random() < 0.1 + levelFactor) {
                        obstacleType = this.obstacleTypes.STONE;
                    } else if (Math.random() < 0.3 + levelFactor) {
                        obstacleType = this.obstacleTypes.LOCK;
                    } else {
                        obstacleType = this.obstacleTypes.ICE;
                    }
                    
                    this.gameState.board[i][j] = {
                        type: obstacleType,
                        special: null,
                        durability: obstacleType === this.obstacleTypes.ICE ? 2 : 
                                   obstacleType === this.obstacleTypes.STONE ? 999 : 1
                    };
                } else {
                    // 生成普通方块
                    this.gameState.board[i][j] = {
                        type: this.getRandomEmoji(),
                        special: null,
                        durability: 1
                    };
                }
            }
        }
        
        // 确保初始状态没有可消除的组合
        while (this.hasMatches()) {
            this.shuffleBoardInternal();
        }
        
        // 根据关卡调整步数，使步数与目标分数更匹配
        // 调整步数和目标分数的平衡性
        if (this.gameState.level <= 10) {
            this.gameState.moves = 25; // 前10关25步
        } else if (this.gameState.level <= 30) {
            this.gameState.moves = 23; // 11-30关23步
        } else if (this.gameState.level <= 60) {
            this.gameState.moves = 21; // 31-60关21步
        } else if (this.gameState.level <= 100) {
            this.gameState.moves = 20; // 61-100关20步
        } else if (this.gameState.level <= 200) {
            this.gameState.moves = 19; // 101-200关19步
        } else if (this.gameState.level <= 500) {
            this.gameState.moves = 18; // 201-500关18步
        } else if (this.gameState.level <= 1000) {
            this.gameState.moves = 17; // 501-1000关17步
        } else if (this.gameState.level <= 2000) {
            this.gameState.moves = 16; // 1001-2000关16步
        } else {
            this.gameState.moves = 15; // 2001+关15步
        }
        
        // 调整目标分数计算方式，使其与步数更匹配
        // 使用更合理的公式来平衡步数和目标分数
        this.gameState.targetScore = 300 + Math.floor(this.gameState.level * 25 * (1 + this.gameState.level * 0.05));
        
        // 设置每步时间
        this.gameState.baseMoveTime = Math.max(5, 12 - Math.floor(this.gameState.level / 12)); // 增加基本时间
        this.gameState.moveTimeLeft = this.gameState.baseMoveTime;
    }

    // 渲染游戏板
    renderBoard() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return;
        
        // 使用文档片段来减少重排次数
        const fragment = document.createDocumentFragment();
        const cells = boardElement.querySelectorAll('.game-cell');
        let cellIndex = 0;
        
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                let cell;
                // 重用现有的单元格元素，减少DOM操作
                if (cellIndex < cells.length) {
                    cell = cells[cellIndex];
                    // 清除之前的类和内容
                    cell.className = 'game-cell';
                    cell.textContent = '';
                } else {
                    cell = document.createElement('div');
                    cell.className = 'game-cell';
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                }
                
                const cellData = this.gameState.board[i][j];
                
                // 根据类型设置显示内容和样式
                switch(cellData.type) {
                    case this.obstacleTypes.ICE:
                        cell.textContent = '❄️';
                        cell.classList.add('ice');
                        break;
                    case this.obstacleTypes.LOCK:
                        cell.textContent = '🔗';
                        cell.classList.add('lock');
                        break;
                    case this.obstacleTypes.STONE:
                        cell.textContent = '🪨';
                        cell.classList.add('stone');
                        break;
                    case this.obstacleTypes.BOMB:
                        cell.textContent = '💣';
                        cell.classList.add('time-bomb');
                        break;
                    default:
                        cell.textContent = cellData.type;
                }
                
                // 添加特殊方块样式
                if (cellData.special) {
                    cell.classList.add('special', cellData.special);
                }
                
                if (cellIndex >= cells.length) {
                    cell.dataset.row = i;
                    cell.dataset.col = j;
                    fragment.appendChild(cell);
                }
                cellIndex++;
            }
        }
        
        // 删除多余的单元格
        while (cells.length > cellIndex) {
            cells[cells.length - 1].remove();
        }
        
        // 只有在有新元素时才添加到DOM
        if (fragment.childNodes.length > 0) {
            boardElement.appendChild(fragment);
        }
    }

    // 获取随机表情符号
    getRandomEmoji() {
        return this.emojis[Math.floor(Math.random() * this.emojis.length)];
    }

    // 检查是否有匹配
    hasMatches() {
        // 检查水平匹配
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE - 2; j++) {
                if (this.gameState.board[i][j].type !== '' && 
                    !this.isObstacle(this.gameState.board[i][j].type) &&
                    this.gameState.board[i][j].type === this.gameState.board[i][j+1].type && 
                    this.gameState.board[i][j].type === this.gameState.board[i][j+2].type) {
                    return true;
                }
            }
        }
        
        // 检查垂直匹配
        for (let i = 0; i < this.BOARD_SIZE - 2; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (this.gameState.board[i][j].type !== '' && 
                    !this.isObstacle(this.gameState.board[i][j].type) &&
                    this.gameState.board[i][j].type === this.gameState.board[i+1][j].type && 
                    this.gameState.board[i][j].type === this.gameState.board[i+2][j].type) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // 检查是否为障碍物
    isObstacle(type) {
        return [this.obstacleTypes.ICE, this.obstacleTypes.LOCK, this.obstacleTypes.STONE, this.obstacleTypes.BOMB].includes(type);
    }

    // 随机打乱游戏板内部
    shuffleBoardInternal() {
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                // 只打乱普通方块，保留障碍物
                if (!this.isObstacle(this.gameState.board[i][j].type)) {
                    this.gameState.board[i][j] = {
                        type: this.getRandomEmoji(),
                        special: null,
                        durability: 1
                    };
                }
            }
        }
    }

    // 设置触摸事件
    setupTouchEvents() {
        const board = document.getElementById('game-board');
        if (!board) return;
        
        // 先移除所有现有的事件监听器，防止重复绑定
        board.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        board.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        board.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        board.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        board.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        board.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        board.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // 重新添加事件监听器
        board.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        board.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        board.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // 鼠标事件作为备选
        board.addEventListener('mousedown', this.handleMouseDown.bind(this));
        board.addEventListener('mousemove', this.handleMouseMove.bind(this));
        board.addEventListener('mouseup', this.handleMouseUp.bind(this));
        board.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('game-cell')) {
            this.gameState.isDragging = true;
            this.gameState.dragStart = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col),
                x: touch.clientX,
                y: touch.clientY
            };
            cell.classList.add('selected');
        }
    }

    handleTouchMove(e) {
        if (!this.gameState.isDragging) return;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.gameState.isDragging) return;
        e.preventDefault();
        if (this.gameState.dragStart) {
            const touch = e.changedTouches[0];
            const cell = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (cell && cell.classList.contains('game-cell')) {
                const startCell = document.querySelector(`.game-cell[data-row="${this.gameState.dragStart.row}"][data-col="${this.gameState.dragStart.col}"]`);
                if (startCell) startCell.classList.remove('selected');
                
                this.gameState.dragEnd = {
                    row: parseInt(cell.dataset.row),
                    col: parseInt(cell.dataset.col)
                };
                
                // 检查是否相邻
                if (this.isAdjacent(this.gameState.dragStart.row, this.gameState.dragStart.col, this.gameState.dragEnd.row, this.gameState.dragEnd.col)) {
                    this.swapAndProcess(this.gameState.dragStart.row, this.gameState.dragStart.col, this.gameState.dragEnd.row, this.gameState.dragEnd.col);
                }
                
                this.gameState.isDragging = false;
                this.gameState.dragStart = null;
                this.gameState.dragEnd = null;
            } else {
                // 如果没有找到目标单元格，也要重置状态
                this.gameState.isDragging = false;
                this.gameState.dragStart = null;
                this.gameState.dragEnd = null;
            }
        }
    }

    handleMouseDown(e) {
        const cell = e.target;
        if (cell && cell.classList.contains('game-cell')) {
            this.gameState.isDragging = true;
            this.gameState.dragStart = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };
            cell.classList.add('selected');
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.gameState.isDragging) return;
        e.preventDefault();
    }

    handleMouseUp(e) {
        if (!this.gameState.isDragging) return;
        e.preventDefault();
        
        const cell = document.elementFromPoint(e.clientX, e.clientY);
        if (cell && cell.classList.contains('game-cell') && this.gameState.dragStart) {
            const startCell = document.querySelector(`.game-cell[data-row="${this.gameState.dragStart.row}"][data-col="${this.gameState.dragStart.col}"]`);
            if (startCell) startCell.classList.remove('selected');
            
            this.gameState.dragEnd = {
                row: parseInt(cell.dataset.row),
                col: parseInt(cell.dataset.col)
            };
            
            // 检查是否相邻
            if (this.isAdjacent(this.gameState.dragStart.row, this.gameState.dragStart.col, this.gameState.dragEnd.row, this.gameState.dragEnd.col)) {
                this.swapAndProcess(this.gameState.dragStart.row, this.gameState.dragStart.col, this.gameState.dragEnd.row, this.gameState.dragEnd.col);
            }
        }
        
        this.gameState.isDragging = false;
        this.gameState.dragStart = null;
        this.gameState.dragEnd = null;
    }

    // 检查两个单元格是否相邻且可交换
    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        // 检查是否相邻
        const adjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        
        // 检查是否包含不可移动的障碍物
        const cell1Movable = this.gameState.board[row1][col1].type !== this.obstacleTypes.STONE && 
                            this.gameState.board[row1][col1].type !== this.obstacleTypes.LOCK;
        const cell2Movable = this.gameState.board[row2][col2].type !== this.obstacleTypes.STONE && 
                            this.gameState.board[row2][col2].type !== this.obstacleTypes.LOCK;
        
        return adjacent && cell1Movable && cell2Movable;
    }

    // 交换并处理游戏逻辑
    swapAndProcess(row1, col1, row2, col2) {
        // 重置步数计时器
        this.resetMoveTimer();
        
        // 执行交换
        this.swapCells(row1, col1, row2, col2);
        
        // 检查是否有匹配
        if (this.hasMatches()) {
            // 有匹配，减少步数
            this.gameState.moves--;
            this.updateUI();
            
            // 处理匹配和得分
            this.processMatches();
        } else {
            // 没有匹配，交换回来
            this.swapCells(row1, col1, row2, col2);
            this.renderBoard();
            
            // 确保重新绑定事件监听器
            setTimeout(() => {
                this.setupTouchEvents();
            }, 50);
        }
    }

    // 交换两个单元格
    swapCells(row1, col1, row2, col2) {
        const temp = this.gameState.board[row1][col1];
        this.gameState.board[row1][col1] = this.gameState.board[row2][col2];
        this.gameState.board[row2][col2] = temp;
    }

    // 处理匹配
    processMatches() {
        // 查找所有匹配
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // 标记匹配的方块
            this.markMatches(matches);
            
            // 计算得分 - 调整万花币获取
            let scoreIncrease = 0;
            const obstaclePositions = []; // 存储需要消除的障碍物位置
            
            // 先处理普通方块的消除
            matches.forEach(match => {
                match.forEach(pos => {
                    const cell = this.gameState.board[pos.row][pos.col];
                    
                    // 只处理普通方块的消除
                    if (!this.isObstacle(cell.type) && cell.durability === 1) {
                        cell.type = '';
                        cell.special = null;
                        scoreIncrease += 1; // 普通方块得分
                    }
                });
            });
            
            // 然后处理障碍物的耐久度减少
            matches.forEach(match => {
                match.forEach(pos => {
                    const cell = this.gameState.board[pos.row][pos.col];
                    
                    // 处理障碍物
                    if (this.isObstacle(cell.type)) {
                        // 记录障碍物位置，用于后续处理
                        obstaclePositions.push(pos);
                        
                        cell.durability--;
                        // 如果耐久度为0，消除障碍物
                        if (cell.durability <= 0) {
                            cell.type = this.getRandomEmoji();
                            cell.durability = 1;
                            scoreIncrease += 5; // 障碍物消除奖励
                        }
                    }
                });
            });
            
            this.gameState.score += scoreIncrease;
            // 万花币获取：10分等于1万花币
            this.gameState.coins += Math.floor(scoreIncrease / 10);
            
            // 显示动画效果
            this.animateMatches(matches);
            
            // 延迟更新界面 - 减少延迟时间以提高响应速度
            setTimeout(() => {
                // 填充空位
                this.fillEmptyCells();
                
                // 渲染更新后的游戏板
                this.renderBoard();
                
                // 更新UI
                this.updateUI();
                
                // 重新绑定触摸事件，确保游戏可以继续
                this.setupTouchEvents();
                
                // 检查是否还有自动匹配 - 减少延迟时间以提高响应速度
                setTimeout(() => {
                    if (this.hasMatches()) {
                        this.processMatches(); // 递归处理自动匹配
                    } else {
                        // 检查游戏是否结束
                        this.checkGameEnd();
                    }
                }, 150); // 从300ms减少到150ms
            }, 150); // 从300ms减少到150ms
        } else {
            // 检查游戏是否结束
            this.checkGameEnd();
        }
    }

    // 查找所有匹配
    findMatches() {
        const matches = [];
        
        // 查找水平匹配
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            let count = 1;
            let currentType = this.gameState.board[i][0].type;
            let match = [{row: i, col: 0}];
            
            for (let j = 1; j < this.BOARD_SIZE; j++) {
                // 只有普通方块才能参与匹配
                if (this.gameState.board[i][j].type === currentType && currentType !== '' && !this.isObstacle(currentType)) {
                    count++;
                    match.push({row: i, col: j});
                } else {
                    if (count >= 3) {
                        matches.push([...match]);
                    }
                    count = 1;
                    currentType = this.gameState.board[i][j].type;
                    match = [{row: i, col: j}];
                }
            }
            
            if (count >= 3) {
                matches.push([...match]);
            }
        }
        
        // 查找垂直匹配
        for (let j = 0; j < this.BOARD_SIZE; j++) {
            let count = 1;
            let currentType = this.gameState.board[0][j].type;
            let match = [{row: 0, col: j}];
            
            for (let i = 1; i < this.BOARD_SIZE; i++) {
                // 只有普通方块才能参与匹配
                if (this.gameState.board[i][j].type === currentType && currentType !== '' && !this.isObstacle(currentType)) {
                    count++;
                    match.push({row: i, col: j});
                } else {
                    if (count >= 3) {
                        matches.push([...match]);
                    }
                    count = 1;
                    currentType = this.gameState.board[i][j].type;
                    match = [{row: i, col: j}];
                }
            }
            
            if (count >= 3) {
                matches.push([...match]);
            }
        }
        
        return matches;
    }

    // 标记匹配
    markMatches(matches) {
        matches.forEach(match => {
            match.forEach(pos => {
                const cell = document.querySelector(`.game-cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
                if (cell) {
                    cell.classList.add('matched');
                }
            });
        });
    }

    // 动画匹配效果
    animateMatches(matches) {
        matches.forEach(match => {
            match.forEach(pos => {
                const cell = document.querySelector(`.game-cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
                if (cell) {
                    // 使用CSS类而不是直接修改样式来提高性能
                    cell.classList.add('matched');
                }
            });
        });
    }

    // 填充空位 - 优化此函数以提高性能
    fillEmptyCells() {
        for (let j = 0; j < this.BOARD_SIZE; j++) {
            let emptySpaces = 0;
            
            // 从底部开始处理每一列
            for (let i = this.BOARD_SIZE - 1; i >= 0; i--) {
                if (this.gameState.board[i][j].type === '') {
                    emptySpaces++;
                } else if (emptySpaces > 0 && 
                          this.gameState.board[i][j].type !== this.obstacleTypes.STONE && 
                          this.gameState.board[i][j].type !== this.obstacleTypes.LOCK) {
                    // 移动可移动的方块到空位（石头和锁链不能移动）
                    this.gameState.board[i + emptySpaces][j] = {...this.gameState.board[i][j]};
                    this.gameState.board[i][j] = {type: '', special: null, durability: 1};
                }
            }
            
            // 填充顶部的空位
            for (let i = 0; i < emptySpaces; i++) {
                this.gameState.board[i][j] = {
                    type: this.getRandomEmoji(),
                    special: null,
                    durability: 1
                };
            }
        }
    }

    // 使用道具
    useTool(toolName) {
        if (this.gameState.tools[toolName] > 0) {
            this.gameState.tools[toolName]--;
            this.updateToolCounts();
            
            switch (toolName) {
                case 'hammer':
                    this.showFloatingText("使用了锤子道具，点击一个方块消除它", "#6a11cb");
                    this.enableTargetSelectionMode('hammer');
                    break;
                case 'bomb':
                    this.showFloatingText("使用了炸弹道具，点击中心点消除3x3区域内的方块", "#ff4757");
                    this.enableTargetSelectionMode('bomb');
                    break;
                case 'shuffle':
                    this.shuffleBoard();
                    this.showFloatingText("使用了洗牌道具", "#ffa502");
                    break;
                case 'magic':
                    this.showFloatingText("使用了魔法棒道具，自动完成一次最佳消除", "#2ed573");
                    this.performMagicMove();
                    break;
            }
        } else {
            this.showFloatingText(`没有${this.getToolName(toolName)}道具了，请先购买`, "#ff4757");
        }
    }

    // 启用目标选择模式
    enableTargetSelectionMode(toolName) {
        const board = document.getElementById('game-board');
        if (!board) return;
        
        const handler = (e) => {
            if (e.target.classList.contains('game-cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                
                switch (toolName) {
                    case 'hammer':
                        // 锤子消除单个方块
                        if (this.gameState.board[row][col].type !== this.obstacleTypes.STONE) {
                            this.gameState.board[row][col] = {type: '', special: null, durability: 1};
                            this.showFloatingText("锤子道具使用成功", "#6a11cb");
                        } else {
                            this.showFloatingText("无法破坏石头障碍物", "#ff4757");
                        }
                        break;
                    case 'bomb':
                        // 炸弹消除3x3区域
                        for (let i = Math.max(0, row - 1); i <= Math.min(this.BOARD_SIZE - 1, row + 1); i++) {
                            for (let j = Math.max(0, col - 1); j <= Math.min(this.BOARD_SIZE - 1, col + 1); j++) {
                                if (this.gameState.board[i][j].type !== this.obstacleTypes.STONE) {
                                    this.gameState.board[i][j] = {type: '', special: null, durability: 1};
                                }
                            }
                        }
                        this.showFloatingText("炸弹道具使用成功", "#ff4757");
                        break;
                }
                
                // 更新游戏板
                this.renderBoard();
                board.removeEventListener('click', handler);
            }
        };
        
        board.addEventListener('click', handler);
    }

    // 执行魔法移动
    performMagicMove() {
        // 寻找最佳消除位置
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                // 检查水平交换
                if (j < this.BOARD_SIZE - 1) {
                    // 检查两个方块是否都可以移动
                    if (this.gameState.board[i][j].type !== this.obstacleTypes.STONE && 
                        this.gameState.board[i][j].type !== this.obstacleTypes.LOCK &&
                        this.gameState.board[i][j+1].type !== this.obstacleTypes.STONE && 
                        this.gameState.board[i][j+1].type !== this.obstacleTypes.LOCK) {
                        // 交换
                        this.swapCells(i, j, i, j+1);
                        if (this.hasMatches()) {
                            // 找到有效移动，执行消除
                            this.gameState.moves--; // 使用魔法棒消耗一步
                            this.updateUI();
                            // 使用较小的延迟来提高响应速度
                            setTimeout(() => {
                                this.processMatches();
                            }, 50);
                            return;
                        }
                        // 换回来
                        this.swapCells(i, j, i, j+1);
                    }
                }
                
                // 检查垂直交换
                if (i < this.BOARD_SIZE - 1) {
                    // 检查两个方块是否都可以移动
                    if (this.gameState.board[i][j].type !== this.obstacleTypes.STONE && 
                        this.gameState.board[i][j].type !== this.obstacleTypes.LOCK &&
                        this.gameState.board[i+1][j].type !== this.obstacleTypes.STONE && 
                        this.gameState.board[i+1][j].type !== this.obstacleTypes.LOCK) {
                        // 交换
                        this.swapCells(i, j, i+1, j);
                        if (this.hasMatches()) {
                            // 找到有效移动，执行消除
                            this.gameState.moves--; // 使用魔法棒消耗一步
                            this.updateUI();
                            // 使用较小的延迟来提高响应速度
                            setTimeout(() => {
                                this.processMatches();
                            }, 50);
                            return;
                        }
                        // 换回来
                        this.swapCells(i, j, i+1, j);
                    }
                }
            }
        }
        
        this.showFloatingText("未找到有效移动", "#ff4757");
    }

    // 洗牌功能
    shuffleBoard() {
        // 收集所有可移动的方块
        const movableCells = [];
        const positions = [];
        
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                // 只收集可移动的普通方块
                if (this.gameState.board[i][j].type !== this.obstacleTypes.STONE && 
                    this.gameState.board[i][j].type !== this.obstacleTypes.LOCK && 
                    this.gameState.board[i][j].durability <= 1 &&
                    this.gameState.board[i][j].type !== '') {
                    movableCells.push(this.gameState.board[i][j]);
                    positions.push({row: i, col: j});
                }
            }
        }
        
        // 洗牌可移动方块
        for (let i = movableCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [movableCells[i], movableCells[j]] = [movableCells[j], movableCells[i]];
        }
        
        // 重新分配洗牌后的方块
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            this.gameState.board[pos.row][pos.col] = movableCells[i];
        }
        
        this.renderBoard();
        this.showFloatingText("棋盘已重新排列", "#2575fc");
    }

    // 获取道具名称
    getToolName(toolName) {
        const names = {
            'hammer': '锤子',
            'bomb': '炸弹',
            'shuffle': '洗牌',
            'magic': '魔法棒'
        };
        return names[toolName] || toolName;
    }

    // 重置游戏
    resetGame() {
        // 清除当前计时器
        if (this.gameState.moveTimer) {
            clearInterval(this.gameState.moveTimer);
            this.gameState.moveTimer = null;
        }
        
        this.gameState.score = 0;
        // 根据关卡调整步数，使步数与目标分数更匹配
        // 调整步数和目标分数的平衡性
        if (this.gameState.level <= 10) {
            this.gameState.moves = 25; // 前10关25步
        } else if (this.gameState.level <= 30) {
            this.gameState.moves = 23; // 11-30关23步
        } else if (this.gameState.level <= 60) {
            this.gameState.moves = 21; // 31-60关21步
        } else if (this.gameState.level <= 100) {
            this.gameState.moves = 20; // 61-100关20步
        } else if (this.gameState.level <= 200) {
            this.gameState.moves = 19; // 101-200关19步
        } else if (this.gameState.level <= 500) {
            this.gameState.moves = 18; // 201-500关18步
        } else if (this.gameState.level <= 1000) {
            this.gameState.moves = 17; // 501-1000关17步
        } else if (this.gameState.level <= 2000) {
            this.gameState.moves = 16; // 1001-2000关16步
        } else {
            this.gameState.moves = 15; // 2001+关15步
        }
        this.gameState.baseMoveTime = Math.max(5, 12 - Math.floor(this.gameState.level / 12));
        this.gameState.moveTimeLeft = this.gameState.baseMoveTime;
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        // 重启计时器
        this.resetMoveTimer();
        this.showFloatingText("游戏已重置", "#6a11cb");
    }

    // 重置步数计时器
    resetMoveTimer() {
        // 清除之前的计时器
        if (this.gameState.moveTimer) {
            clearInterval(this.gameState.moveTimer);
            this.gameState.moveTimer = null;
        }
        
        // 重置时间
        this.gameState.moveTimeLeft = this.gameState.baseMoveTime;
        this.updateMoveTimerDisplay();
        
        // 启动新计时器
        this.gameState.moveTimer = setInterval(() => {
            this.gameState.moveTimeLeft--;
            this.updateMoveTimerDisplay();
            
            // 时间到
            if (this.gameState.moveTimeLeft <= 0) {
                clearInterval(this.gameState.moveTimer);
                this.gameState.moveTimer = null;
                // 减少步数而不是直接结束游戏
                this.gameState.moves--;
                showFloatingText("时间到！步数-1", "#ff4757");
                updateUI();
                
                // 检查游戏是否结束
                checkGameEnd();
                
                // 如果游戏未结束，重新启动计时器
                if (this.gameState.moves > 0 && this.gameState.score < this.gameState.targetScore) {
                    resetMoveTimer();
                }
            }
        }, 1000);
    }

    // 更新倒计时显示
    updateMoveTimerDisplay() {
        const timerElement = document.getElementById('move-timer');
        if (timerElement) {
            timerElement.textContent = this.gameState.moveTimeLeft;
            // 根据剩余时间改变颜色和大小
            if (this.gameState.moveTimeLeft <= 3) {
                timerElement.style.color = '#ff4757'; // 红色
                timerElement.style.fontWeight = 'bold';
            } else if (this.gameState.moveTimeLeft <= 5) {
                timerElement.style.color = '#ffa502'; // 橙色
            } else {
                timerElement.style.color = '#6a11cb'; // 紫色
            }
        }
    }

    // 检查游戏是否结束
    checkGameEnd() {
        // 清除计时器
        if (this.gameState.moveTimer) {
            clearInterval(this.gameState.moveTimer);
            this.gameState.moveTimer = null;
        }
        
        if (this.gameState.moves <= 0) {
            if (this.gameState.score >= this.gameState.targetScore) {
                // 通关 - 关卡奖励
                const levelBonus = Math.min(5, 1 + Math.floor(this.gameState.level / 20));
                this.gameState.coins += levelBonus;
                this.showFireworks();
                this.showFloatingText(`恭喜通关！获得${levelBonus}万花币奖励！`, "#2ed573");
                
                setTimeout(() => {
                    this.nextLevel();
                }, 2000);
            } else {
                // 失败
                this.showFloatingText(`游戏结束！差${this.gameState.targetScore - this.gameState.score}分通关`, "#ff4757");
                setTimeout(() => {
                    this.showAttemptsModal();
                }, 2000);
            }
        } else if (this.gameState.score >= this.gameState.targetScore) {
            // 提前通关 - 关卡奖励
            const levelBonus = Math.min(5, 1 + Math.floor(this.gameState.level / 20));
            this.gameState.coins += levelBonus;
            this.showFireworks();
            this.showFloatingText(`恭喜提前通关！获得${levelBonus}万花币奖励！`, "#2ed573");
            
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        }
    }

    // 下一关
    nextLevel() {
        // 清除当前计时器
        if (this.gameState.moveTimer) {
            clearInterval(this.gameState.moveTimer);
            this.gameState.moveTimer = null;
        }
        
        this.gameState.level++;
        // 调整目标分数计算方式，使其与步数更匹配
        // 使用更合理的公式来平衡步数和目标分数
        this.gameState.targetScore = 300 + Math.floor(this.gameState.level * 25 * (1 + this.gameState.level * 0.05));
        // 步数随关卡递减，但不低于10步
        // 调整步数和目标分数的平衡性
        if (this.gameState.level <= 10) {
            this.gameState.moves = 25; // 前10关25步
        } else if (this.gameState.level <= 30) {
            this.gameState.moves = 23; // 11-30关23步
        } else if (this.gameState.level <= 60) {
            this.gameState.moves = 21; // 31-60关21步
        } else if (this.gameState.level <= 100) {
            this.gameState.moves = 20; // 61-100关20步
        } else if (this.gameState.level <= 200) {
            this.gameState.moves = 19; // 101-200关19步
        } else if (this.gameState.level <= 500) {
            this.gameState.moves = 18; // 201-500关18步
        } else if (this.gameState.level <= 1000) {
            this.gameState.moves = 17; // 501-1000关17步
        } else if (this.gameState.level <= 2000) {
            this.gameState.moves = 16; // 1001-2000关16步
        } else {
            this.gameState.moves = 15; // 2001+关15步
        }
        this.gameState.score = 0;
        // 减少每步时间
        this.gameState.baseMoveTime = Math.max(5, 12 - Math.floor(this.gameState.level / 12));
        this.gameState.moveTimeLeft = this.gameState.baseMoveTime;
        this.createBoard();
        this.renderBoard();
        this.updateUI();
        // 重启计时器
        this.resetMoveTimer();
        this.showFloatingText(`第${this.gameState.level}关开始`, "#6a11cb");
    }

    // 更新UI
    updateUI() {
        const currentLevel = document.getElementById('current-level');
        const targetScore = document.getElementById('target-score');
        const movesLeft = document.getElementById('moves-left');
        const currentScore = document.getElementById('current-score');
        const coinCount = document.getElementById('coin-count');
        
        if (currentLevel) currentLevel.textContent = this.gameState.level;
        if (targetScore) targetScore.textContent = this.gameState.targetScore;
        if (movesLeft) movesLeft.textContent = this.gameState.moves;
        if (currentScore) currentScore.textContent = this.gameState.score;
        if (coinCount) coinCount.textContent = this.gameState.coins;
        
        // 更新道具数量
        this.updateToolCounts();
        
        // 更新进度条
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = Math.min(100, Math.max(0, (this.gameState.score / this.gameState.targetScore) * 100));
            progressBar.style.width = `${progress}%`;
        }
        
        // 更新倒计时显示
        this.updateMoveTimerDisplay();
    }

    // 更新道具数量
    updateToolCounts() {
        const hammerCount = document.getElementById('hammer-count');
        const bombCount = document.getElementById('bomb-count');
        const shuffleCount = document.getElementById('shuffle-count');
        const magicCount = document.getElementById('magic-count');
        
        if (hammerCount) hammerCount.textContent = this.gameState.tools.hammer;
        if (bombCount) bombCount.textContent = this.gameState.tools.bomb;
        if (shuffleCount) shuffleCount.textContent = this.gameState.tools.shuffle;
        if (magicCount) magicCount.textContent = this.gameState.tools.magic;
    }

    // 显示成就
    showAchievements() {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const item = document.createElement('div');
            item.className = `achievement-item ${achievement.unlocked ? '' : 'locked'}`;
            item.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            `;
            grid.appendChild(item);
        });
        
        this.openModal('achievements-modal');
    }

    // 打开弹窗
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // 关闭弹窗
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 显示浮动文字
    showFloatingText(text, color) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.position = 'fixed';
        floatingText.style.top = '50%';
        floatingText.style.left = '50%';
        floatingText.style.transform = 'translate(-50%, -50%)';
        floatingText.style.backgroundColor = color;
        floatingText.style.color = 'white';
        floatingText.style.padding = '15px 25px';
        floatingText.style.borderRadius = '30px';
        floatingText.style.zIndex = '2000';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        floatingText.style.opacity = '0';
        floatingText.style.transition = 'opacity 0.3s, transform 0.3s';
        
        document.body.appendChild(floatingText);
        
        // 显示动画
        setTimeout(() => {
            floatingText.style.opacity = '1';
            floatingText.style.transform = 'translate(-50%, -50%) scale(1.1)';
        }, 10);
        
        // 移除元素
        setTimeout(() => {
            floatingText.style.opacity = '0';
            floatingText.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                if (floatingText.parentNode) {
                    floatingText.parentNode.removeChild(floatingText);
                }
            }, 300);
        }, 2000);
    }

    // 显示烟花效果
    showFireworks() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFirework(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            }, i * 300);
        }
    }

    // 创建烟花粒子
    createFirework(x, y) {
        const colors = ['#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#6a11cb', '#2575fc'];
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // 随机方向
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const xOffset = Math.cos(angle) * distance;
            const yOffset = Math.sin(angle) * distance;
            
            particle.style.setProperty('--x', `${xOffset}px`);
            particle.style.setProperty('--y', `${yOffset}px`);
            
            document.body.appendChild(particle);
            
            // 2秒后移除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    // 显示次数不足弹窗
    showAttemptsModal() {
        this.openModal('attempts-modal');
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.wanhuaGame = new WanhuaGame();
});
