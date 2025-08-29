echo document.addEventListener('DOMContentLoaded', () => { > script.js
echo     // Initialize Supabase >> script.js
echo     const SUPABASE_URL = "https://ylnfjlltesnlfanrxfoy.supabase.co"; >> script.js
echo     const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbmZqbGx0ZXNubGZhbnJ4Zm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMDc0MjMsImV4cCI6MjA3MTY4MzQyM30.czuQwYoFd7Ew9f-PBaojhsWJkXrBEtkqTRdhfX-DWFk"; >> script.js
echo     const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); >> script.js
echo      >> script.js
echo     // Game variables >> script.js
echo     let boardSize = 16; >> script.js
echo     let board = []; >> script.js
echo     let score = 0; >> script.js
echo     let coins = 0; >> script.js
echo     let moves = 0; >> script.js
echo     let level = 1; >> script.js
echo     let selectedTile = null; >> script.js
echo     let sessionId = null; >> script.js
echo     let userId = null; >> script.js
echo     let isProcessing = false; >> script.js
echo      >> script.js
echo     // DOM elements >> script.js
echo     const gameBoard = document.getElementById('gameBoard'); >> script.js
echo     const scoreElement = document.getElementById('score'); >> script.js
echo     const coinsElement = document.getElementById('coins'); >> script.js
echo     const movesElement = document.getElementById('moves'); >> script.js
echo     const levelElement = document.getElementById('level'); >> script.js
echo     const shuffleBtn = document.getElementById('shuffleBtn'); >> script.js
echo     const hintBtn = document.getElementById('hintBtn'); >> script.js
echo     const backBtn = document.getElementById('backBtn'); >> script.js
echo     const watchAdBtn = document.getElementById('watchAdBtn'); >> script.js
echo     const gameOverModal = document.getElementById('gameOverModal'); >> script.js
echo     const gameOverMessage = document.getElementById('gameOverMessage'); >> script.js
echo     const closeGameOverModal = document.getElementById('closeGameOverModal'); >> script.js
echo     const adModal = document.getElementById('adModal'); >> script.js
echo     const confirmWatchAd = document.getElementById('confirmWatchAd'); >> script.js
echo     const closeAdModal = document.getElementById('closeAdModal'); >> script.js
echo      >> script.js
echo     // Get session ID and user ID from URL parameters >> script.js
echo     const urlParams = new URLSearchParams(window.location.search); >> script.js
echo     sessionId = urlParams.get('session_id'); >> script.js
echo     userId = urlParams.get('user_id'); >> script.js
echo      >> script.js
echo     // Initialize game >> script.js
echo     async function initGame() { >> script.js
echo         if (!sessionId || !userId) { >> script.js
echo             alert('游戏参数错误，请重新开始游戏'); >> script.js
echo             window.location.href = 'https://t.me/bjxcwhljiluBot'; >> script.js
echo             return; >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Get user info >> script.js
echo         const { data: user, error: userError } = await supabase >> script.js
echo             .from('users') >> script.js
echo             .select('*') >> script.js
echo             .eq('id', userId); >> script.js
echo              >> script.js
echo         if (userError || !user || user.length === 0) { >> script.js
echo             alert('用户信息获取失败，请重新开始游戏'); >> script.js
echo             window.location.href = 'https://t.me/bjxcwhljiluBot'; >> script.js
echo             return; >> script.js
echo         } >> script.js
echo          >> script.js
echo         coins = user[0].coins; >> script.js
echo         coinsElement.textContent = coins; >> script.js
echo          >> script.js
echo         // Get game session info >> script.js
echo         const { data: session, error: sessionError } = await supabase >> script.js
echo             .from('game_sessions') >> script.js
echo             .select('*') >> script.js
echo             .eq('id', sessionId); >> script.js
echo              >> script.js
echo         if (sessionError || !session || session.length === 0) { >> script.js
echo             alert('游戏会话获取失败，请重新开始游戏'); >> script.js
echo             window.location.href = 'https://t.me/bjxcwhljiluBot'; >> script.js
echo             return; >> script.js
echo         } >> script.js
echo          >> script.js
echo         level = session[0].level; >> script.js
echo         levelElement.textContent = level; >> script.js
echo          >> script.js
echo         // Calculate board size based on level >> script.js
echo         boardSize = 16 + (level - 1) * 2; // Start with 16x16, increase by 2 each level >> script.js
echo          >> script.js
echo         // Initialize game board >> script.js
echo         initializeBoard(); >> script.js
echo         renderBoard(); >> script.js
echo          >> script.js
echo         // Check for initial matches >> script.js
echo         setTimeout(() => { >> script.js
echo             checkAndRemoveMatches(); >> script.js
echo         }, 500); >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Initialize game board >> script.js
echo     function initializeBoard() { >> script.js
echo         board = []; >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             board[row] = []; >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 board[row][col] = Math.floor(Math.random() * 6) + 1; // 6 different colors >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Ensure no initial matches >> script.js
echo         while (hasMatches()) { >> script.js
echo             shuffleBoard(); >> script.js
echo         } >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Check if board has matches >> script.js
echo     function hasMatches() { >> script.js
echo         // Check horizontal matches >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize - 2; col++) { >> script.js
echo                 if (board[row][col] === board[row][col + 1] &&  >> script.js
echo                     board[row][col] === board[row][col + 2]) { >> script.js
echo                     return true; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Check vertical matches >> script.js
echo         for (let row = 0; row < boardSize - 2; row++) { >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 if (board[row][col] === board[row + 1][col] &&  >> script.js
echo                     board[row][col] === board[row + 2][col]) { >> script.js
echo                     return true; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         return false; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Shuffle board >> script.js
echo     function shuffleBoard() { >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 board[row][col] = Math.floor(Math.random() * 6) + 1; >> script.js
echo             } >> script.js
echo         } >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Render game board >> script.js
echo     function renderBoard() { >> script.js
echo         gameBoard.innerHTML = ''; >> script.js
echo         gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`; >> script.js
echo          >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 const tile = document.createElement('div'); >> script.js
echo                 tile.className = `tile color-${board[row][col]}`; >> script.js
echo                 tile.dataset.row = row; >> script.js
echo                 tile.dataset.col = col; >> script.js
echo                  >> script.js
echo                 // Add emoji based on color >> script.js
echo                 const emojis = ['', '🍎', '🍊', '🍋', '🍇', '🍓', '🍒']; >> script.js
echo                 tile.textContent = emojis[board[row][col]]; >> script.js
echo                  >> script.js
echo                 tile.addEventListener('click', handleTileClick); >> script.js
echo                 gameBoard.appendChild(tile); >> script.js
echo             } >> script.js
echo         } >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Handle tile click >> script.js
echo     function handleTileClick(e) { >> script.js
echo         if (isProcessing) return; >> script.js
echo          >> script.js
echo         const row = parseInt(e.target.dataset.row); >> script.js
echo         const col = parseInt(e.target.dataset.col); >> script.js
echo          >> script.js
echo         if (!selectedTile) { >> script.js
echo             // First tile selection >> script.js
echo             selectedTile = { row, col }; >> script.js
echo             e.target.classList.add('selected'); >> script.js
echo         } else { >> script.js
echo             // Second tile selection >> script.js
echo             const prevRow = selectedTile.row; >> script.js
echo             const prevCol = selectedTile.col; >> script.js
echo              >> script.js
echo             // Remove selection from previous tile >> script.js
echo             document.querySelector('.tile.selected')?.classList.remove('selected'); >> script.js
echo              >> script.js
echo             // Check if tiles are adjacent >> script.js
echo             if (isAdjacent(prevRow, prevCol, row, col)) { >> script.js
echo                 // Swap tiles >> script.js
echo                 swapTiles(prevRow, prevCol, row, col); >> script.js
echo                  >> script.js
echo                 // Check for matches >> script.js
echo                 setTimeout(() => { >> script.js
echo                     if (hasMatchesAfterSwap(prevRow, prevCol, row, col)) { >> script.js
echo                         moves++; >> script.js
echo                         movesElement.textContent = moves; >> script.js
echo                         checkAndRemoveMatches(); >> script.js
echo                     } else { >> script.js
echo                         // Swap back if no matches >> script.js
echo                         swapTiles(prevRow, prevCol, row, col); >> script.js
echo                     } >> script.js
echo                 }, 300); >> script.js
echo             } >> script.js
echo              >> script.js
echo             selectedTile = null; >> script.js
echo         } >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Check if two tiles are adjacent >> script.js
echo     function isAdjacent(row1, col1, row2, col2) { >> script.js
echo         return (Math.abs(row1 - row2) === 1 && col1 === col2) ||  >> script.js
echo                (Math.abs(col1 - col2) === 1 && row1 === row2); >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Swap two tiles >> script.js
echo     function swapTiles(row1, col1, row2, col2) { >> script.js
echo         const temp = board[row1][col1]; >> script.js
echo         board[row1][col1] = board[row2][col2]; >> script.js
echo         board[row2][col2] = temp; >> script.js
echo          >> script.js
echo         // Update UI >> script.js
echo         const tile1 = document.querySelector(`[data-row="${row1}"][data-col="${col1}"]`); >> script.js
echo         const tile2 = document.querySelector(`[data-row="${row2}"][data-col="${col2}"]`); >> script.js
echo          >> script.js
echo         const emojis = ['', '🍎', '🍊', '🍋', '🍇', '🍓', '🍒']; >> script.js
echo          >> script.js
echo         tile1.className = `tile color-${board[row1][col1]}`; >> script.js
echo         tile1.textContent = emojis[board[row1][col1]]; >> script.js
echo          >> script.js
echo         tile2.className = `tile color-${board[row2][col2]}`; >> script.js
echo         tile2.textContent = emojis[board[row2][col2]]; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Check if there are matches after swapping >> script.js
echo     function hasMatchesAfterSwap(row1, col1, row2, col2) { >> script.js
echo         // Check horizontal matches for row1 >> script.js
echo         let count = 1; >> script.js
echo         for (let i = col1 - 1; i >= 0 && board[row1][i] === board[row1][col1]; i--) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         for (let i = col1 + 1; i < boardSize && board[row1][i] === board[row1][col1]; i++) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         if (count >= 3) return true; >> script.js
echo          >> script.js
echo         // Check vertical matches for col1 >> script.js
echo         count = 1; >> script.js
echo         for (let i = row1 - 1; i >= 0 && board[i][col1] === board[row1][col1]; i--) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         for (let i = row1 + 1; i < boardSize && board[i][col1] === board[row1][col1]; i++) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         if (count >= 3) return true; >> script.js
echo          >> script.js
echo         // Check horizontal matches for row2 >> script.js
echo         count = 1; >> script.js
echo         for (let i = col2 - 1; i >= 0 && board[row2][i] === board[row2][col2]; i--) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         for (let i = col2 + 1; i < boardSize && board[row2][i] === board[row2][col2]; i++) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         if (count >= 3) return true; >> script.js
echo          >> script.js
echo         // Check vertical matches for col2 >> script.js
echo         count = 1; >> script.js
echo         for (let i = row2 - 1; i >= 0 && board[i][col2] === board[row2][col2]; i--) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         for (let i = row2 + 1; i < boardSize && board[i][col2] === board[row2][col2]; i++) { >> script.js
echo             count++; >> script.js
echo         } >> script.js
echo         if (count >= 3) return true; >> script.js
echo          >> script.js
echo         return false; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Check and remove matches >> script.js
echo     async function checkAndRemoveMatches() { >> script.js
echo         isProcessing = true; >> script.js
echo          >> script.js
echo         const matches = findMatches(); >> script.js
echo          >> script.js
echo         if (matches.length > 0) { >> script.js
echo             // Animate matched tiles >> script.js
echo             matches.forEach(match => { >> script.js
echo                 const tile = document.querySelector(`[data-row="${match.row}"][data-col="${match.col}"]`); >> script.js
echo                 tile.classList.add('matched'); >> script.js
echo             }); >> script.js
echo              >> script.js
echo             // Calculate score >> script.js
echo             const points = matches.length * 10; >> script.js
echo             score += points; >> script.js
echo             scoreElement.textContent = score; >> script.js
echo              >> script.js
echo             // Calculate coins earned >> script.js
echo             const coinsEarned = Math.floor(matches.length / 3) * 5; >> script.js
echo             coins += coinsEarned; >> script.js
echo             coinsElement.textContent = coins; >> script.js
echo              >> script.js
echo             // Wait for animation >> script.js
echo             await new Promise(resolve => setTimeout(resolve, 500)); >> script.js
echo              >> script.js
echo             // Remove matched tiles >> script.js
echo             matches.forEach(match => { >> script.js
echo                 board[match.row][match.col] = 0; >> script.js
echo             }); >> script.js
echo              >> script.js
echo             // Drop tiles >> script.js
echo             await dropTiles(); >> script.js
echo              >> script.js
echo             // Fill empty spaces >> script.js
echo             await fillEmptySpaces(); >> script.js
echo              >> script.js
echo             // Check for more matches >> script.js
echo             setTimeout(() => { >> script.js
echo                 checkAndRemoveMatches(); >> script.js
echo             }, 300); >> script.js
echo         } else { >> script.js
echo             // Check if game is over >> script.js
echo             if (!hasPossibleMoves()) { >> script.js
echo                 endGame(); >> script.js
echo             } else { >> script.js
echo                 isProcessing = false; >> script.js
echo             } >> script.js
echo         } >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Find all matches >> script.js
echo     function findMatches() { >> script.js
echo         const matches = []; >> script.js
echo          >> script.js
echo         // Check horizontal matches >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize - 2; col++) { >> script.js
echo                 if (board[row][col] !== 0 &&  >> script.js
echo                     board[row][col] === board[row][col + 1] &&  >> script.js
echo                     board[row][col] === board[row][col + 2]) { >> script.js
echo                      >> script.js
echo                     // Find all consecutive tiles >> script.js
echo                     let matchLength = 3; >> script.js
echo                     while (col + matchLength < boardSize && board[row][col] === board[row][col + matchLength]) { >> script.js
echo                         matchLength++; >> script.js
echo                     } >> script.js
echo                      >> script.js
echo                     // Add all tiles in the match >> script.js
echo                     for (let i = 0; i < matchLength; i++) { >> script.js
echo                         matches.push({ row, col: col + i }); >> script.js
echo                     } >> script.js
echo                      >> script.js
echo                     // Skip the matched tiles >> script.js
echo                     col += matchLength - 1; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Check vertical matches >> script.js
echo         for (let col = 0; col < boardSize; col++) { >> script.js
echo             for (let row = 0; row < boardSize - 2; row++) { >> script.js
echo                 if (board[row][col] !== 0 &&  >> script.js
echo                     board[row][col] === board[row + 1][col] &&  >> script.js
echo                     board[row][col] === board[row + 2][col]) { >> script.js
echo                      >> script.js
echo                     // Find all consecutive tiles >> script.js
echo                     let matchLength = 3; >> script.js
echo                     while (row + matchLength < boardSize && board[row][col] === board[row + matchLength][col]) { >> script.js
echo                         matchLength++; >> script.js
echo                     } >> script.js
echo                      >> script.js
echo                     // Add all tiles in the match >> script.js
echo                     for (let i = 0; i < matchLength; i++) { >> script.js
echo                         matches.push({ row: row + i, col }); >> script.js
echo                     } >> script.js
echo                      >> script.js
echo                     // Skip the matched tiles >> script.js
echo                     row += matchLength - 1; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Remove duplicates >> script.js
echo         const uniqueMatches = []; >> script.js
echo         const matchSet = new Set(); >> script.js
echo          >> script.js
echo         matches.forEach(match => { >> script.js
echo             const key = `${match.row},${match.col}`; >> script.js
echo             if (!matchSet.has(key)) { >> script.js
echo                 matchSet.add(key); >> script.js
echo                 uniqueMatches.push(match); >> script.js
echo             } >> script.js
echo         }); >> script.js
echo          >> script.js
echo         return uniqueMatches; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Drop tiles down to fill empty spaces >> script.js
echo     async function dropTiles() { >> script.js
echo         for (let col = 0; col < boardSize; col++) { >> script.js
echo             let emptyRow = boardSize - 1; >> script.js
echo              >> script.js
echo             for (let row = boardSize - 1; row >= 0; row--) { >> script.js
echo                 if (board[row][col] !== 0) { >> script.js
echo                     if (row !== emptyRow) { >> script.js
echo                         board[emptyRow][col] = board[row][col]; >> script.js
echo                         board[row][col] = 0; >> script.js
echo                     } >> script.js
echo                     emptyRow--; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Update UI >> script.js
echo         renderBoard(); >> script.js
echo          >> script.js
echo         // Animate falling tiles >> script.js
echo         const tiles = document.querySelectorAll('.tile'); >> script.js
echo         tiles.forEach(tile => { >> script.js
echo             tile.classList.add('falling'); >> script.js
echo         }); >> script.js
echo          >> script.js
echo         // Wait for animation >> script.js
echo         await new Promise(resolve => setTimeout(resolve, 500)); >> script.js
echo          >> script.js
echo         // Remove animation class >> script.js
echo         tiles.forEach(tile => { >> script.js
echo             tile.classList.remove('falling'); >> script.js
echo         }); >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Fill empty spaces with new tiles >> script.js
echo     async function fillEmptySpaces() { >> script.js
echo         for (let col = 0; col < boardSize; col++) { >> script.js
echo             for (let row = 0; row < boardSize; row++) { >> script.js
echo                 if (board[row][col] === 0) { >> script.js
echo                     board[row][col] = Math.floor(Math.random() * 6) + 1; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Update UI >> script.js
echo         renderBoard(); >> script.js
echo          >> script.js
echo         // Animate new tiles >> script.js
echo         const tiles = document.querySelectorAll('.tile'); >> script.js
echo         tiles.forEach(tile => { >> script.js
echo             tile.classList.add('falling'); >> script.js
echo         }); >> script.js
echo          >> script.js
echo         // Wait for animation >> script.js
echo         await new Promise(resolve => setTimeout(resolve, 500)); >> script.js
echo          >> script.js
echo         // Remove animation class >> script.js
echo         tiles.forEach(tile => { >> script.js
echo             tile.classList.remove('falling'); >> script.js
echo         }); >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Check if there are possible moves >> script.js
echo     function hasPossibleMoves() { >> script.js
echo         // Check all possible swaps >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 // Check right swap >> script.js
echo                 if (col < boardSize - 1) { >> script.js
echo                     // Swap tiles >> script.js
echo                     const temp = board[row][col]; >> script.js
echo                     board[row][col] = board[row][col + 1]; >> script.js
echo                     board[row][col + 1] = temp; >> script.js
echo                      >> script.js
echo                     // Check for matches >> script.js
echo                     const hasMatch = hasMatchesAfterSwap(row, col, row, col + 1); >> script.js
echo                      >> script.js
echo                     // Swap back >> script.js
echo                     board[row][col + 1] = board[row][col]; >> script.js
echo                     board[row][col] = temp; >> script.js
echo                      >> script.js
echo                     if (hasMatch) return true; >> script.js
echo                 } >> script.js
echo                  >> script.js
echo                 // Check down swap >> script.js
echo                 if (row < boardSize - 1) { >> script.js
echo                     // Swap tiles >> script.js
echo                     const temp = board[row][col]; >> script.js
echo                     board[row][col] = board[row + 1][col]; >> script.js
echo                     board[row + 1][col] = temp; >> script.js
echo                      >> script.js
echo                     // Check for matches >> script.js
echo                     const hasMatch = hasMatchesAfterSwap(row, col, row + 1, col); >> script.js
echo                      >> script.js
echo                     // Swap back >> script.js
echo                     board[row + 1][col] = board[row][col]; >> script.js
echo                     board[row][col] = temp; >> script.js
echo                      >> script.js
echo                     if (hasMatch) return true; >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         return false; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // End game >> script.js
echo     async function endGame() { >> script.js
echo         isProcessing = true; >> script.js
echo          >> script.js
echo         // Calculate coins earned >> script.js
echo         const coinsEarned = Math.floor(score / 100) * 10; >> script.js
echo          >> script.js
echo         // Update game session in database >> script.js
echo         const { error } = await supabase >> script.js
echo             .from('game_sessions') >> script.js
echo             .update({ >> script.js
echo                 score, >> script.js
echo                 coins_earned: coinsEarned, >> script.js
echo                 status: 'completed', >> script.js
echo                 completed_at: new Date().toISOString() >> script.js
echo             }) >> script.js
echo             .eq('id', sessionId); >> script.js
echo              >> script.js
echo         if (error) { >> script.js
echo             console.error('Error updating game session:', error); >> script.js
echo         } >> script.js
echo          >> script.js
echo         // Show game over modal >> script.js
echo         gameOverMessage.textContent = `游戏结束！\n\n最终得分: ${score}\n获得金币: ${coinsEarned}\n总步数: ${moves}`; >> script.js
echo         gameOverModal.style.display = 'flex'; >> script.js
echo     } >> script.js
echo      >> script.js
echo     // Shuffle board >> script.js
echo     shuffleBtn.addEventListener('click', async () => { >> script.js
echo         if (isProcessing) return; >> script.js
echo          >> script.js
echo         // Show ad modal >> script.js
echo         adModal.style.display = 'flex'; >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Show hint >> script.js
echo     hintBtn.addEventListener('click', () => { >> script.js
echo         if (isProcessing) return; >> script.js
echo          >> script.js
echo         // Find a possible move >> script.js
echo         for (let row = 0; row < boardSize; row++) { >> script.js
echo             for (let col = 0; col < boardSize; col++) { >> script.js
echo                 // Check right swap >> script.js
echo                 if (col < boardSize - 1) { >> script.js
echo                     // Swap tiles >> script.js
echo                     const temp = board[row][col]; >> script.js
echo                     board[row][col] = board[row][col + 1]; >> script.js
echo                     board[row][col + 1] = temp; >> script.js
echo                      >> script.js
echo                     // Check for matches >> script.js
echo                     const hasMatch = hasMatchesAfterSwap(row, col, row, col + 1); >> script.js
echo                      >> script.js
echo                     // Swap back >> script.js
echo                     board[row][col + 1] = board[row][col]; >> script.js
echo                     board[row][col] = temp; >> script.js
echo                      >> script.js
echo                     if (hasMatch) { >> script.js
echo                         // Highlight tiles >> script.js
echo                         const tile1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`); >> script.js
echo                         const tile2 = document.querySelector(`[data-row="${row}"][data-col="${col + 1}"]`); >> script.js
echo                          >> script.js
echo                         tile1.style.border = '3px solid #FFD700'; >> script.js
echo                         tile2.style.border = '3px solid #FFD700'; >> script.js
echo                          >> script.js
echo                         // Remove highlight after 2 seconds >> script.js
echo                         setTimeout(() => { >> script.js
echo                             tile1.style.border = ''; >> script.js
echo                             tile2.style.border = ''; >> script.js
echo                         }, 2000); >> script.js
echo                          >> script.js
echo                         return; >> script.js
echo                     } >> script.js
echo                 } >> script.js
echo                  >> script.js
echo                 // Check down swap >> script.js
echo                 if (row < boardSize - 1) { >> script.js
echo                     // Swap tiles >> script.js
echo                     const temp = board[row][col]; >> script.js
echo                     board[row][col] = board[row + 1][col]; >> script.js
echo                     board[row + 1][col] = temp; >> script.js
echo                      >> script.js
echo                     // Check for matches >> script.js
echo                     const hasMatch = hasMatchesAfterSwap(row, col, row + 1, col); >> script.js
echo                      >> script.js
echo                     // Swap back >> script.js
echo                     board[row + 1][col] = board[row][col]; >> script.js
echo                     board[row][col] = temp; >> script.js
echo                      >> script.js
echo                     if (hasMatch) { >> script.js
echo                         // Highlight tiles >> script.js
echo                         const tile1 = document.querySelector(`[data-row="${row}"][data-col="${col}"]`); >> script.js
echo                         const tile2 = document.querySelector(`[data-row="${row + 1}"][data-col="${col}"]`); >> script.js
echo                          >> script.js
echo                         tile1.style.border = '3px solid #FFD700'; >> script.js
echo                         tile2.style.border = '3px solid #FFD700'; >> script.js
echo                          >> script.js
echo                         // Remove highlight after 2 seconds >> script.js
echo                         setTimeout(() => { >> script.js
echo                             tile1.style.border = ''; >> script.js
echo                             tile2.style.border = ''; >> script.js
echo                         }, 2000); >> script.js
echo                          >> script.js
echo                         return; >> script.js
echo                     } >> script.js
echo                 } >> script.js
echo             } >> script.js
echo         } >> script.js
echo          >> script.js
echo         // No possible moves found >> script.js
echo         alert('没有可用的移动了！'); >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Back to bot >> script.js
echo     backBtn.addEventListener('click', () => { >> script.js
echo         window.location.href = 'https://t.me/bjxcwhljiluBot'; >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Watch ad >> script.js
echo     watchAdBtn.addEventListener('click', () => { >> script.js
echo         adModal.style.display = 'flex'; >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Confirm watch ad >> script.js
echo     confirmWatchAd.addEventListener('click', async () => { >> script.js
echo         const rewardType = document.querySelector('input[name="adReward"]:checked').value; >> script.js
echo          >> script.js
echo         // Close modal >> script.js
echo         adModal.style.display = 'none'; >> script.js
echo          >> script.js
echo         // Simulate watching ad >> script.js
echo         // In a real implementation, this would integrate with an ad platform >> script.js
echo          >> script.js
echo         if (rewardType === 'coins') { >> script.js
echo             coins += 50; >> script.js
echo             coinsElement.textContent = coins; >> script.js
echo             alert('恭喜！您获得了50金币！'); >> script.js
echo         } else { >> script.js
echo             // In a real implementation, this would update the user's daily plays in the database >> script.js
echo             alert('恭喜！您获得了1次游戏机会！'); >> script.js
echo         } >> script.js
echo          >> script.js
echo         // If shuffle was requested >> script.js
echo         if (shuffleBtn.dataset.requested === 'true') { >> script.js
echo             shuffleBtn.dataset.requested = 'false'; >> script.js
echo             shuffleBoard(); >> script.js
echo             renderBoard(); >> script.js
echo         } >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Close ad modal >> script.js
echo     closeAdModal.addEventListener('click', () => { >> script.js
echo         adModal.style.display = 'none'; >> script.js
echo         shuffleBtn.dataset.requested = 'false'; >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Close game over modal >> script.js
echo     closeGameOverModal.addEventListener('click', () => { >> script.js
echo         gameOverModal.style.display = 'none'; >> script.js
echo         window.location.href = 'https://t.me/bjxcwhljiluBot'; >> script.js
echo     }); >> script.js
echo      >> script.js
echo     // Initialize game >> script.js
echo     initGame(); >> script.js
echo }); >> script.js
