let currentSize = 9;
let solution = [];
let puzzle = [];
let showingSolution = false;

// 初始化游戏
function initGame() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    puzzle = [];
    solution = [];

    // 创建单元格
    for (let i = 0; i < currentSize; i++) {
        puzzle[i] = [];
        for (let j = 0; j < currentSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.row = i;
            input.dataset.col = j;
            input.addEventListener('input', function(e) {
                const val = e.target.value;
                if (val && !/^[1-9]$/.test(val)) {
                    e.target.value = '';
                }
                if (currentSize === 6 && val > 6) {
                    e.target.value = '';
                }
                puzzle[i][j] = e.target.value ? parseInt(e.target.value) : 0;
            });
            cell.appendChild(input);
            grid.appendChild(cell);
            puzzle[i][j] = 0;
        }
    }
}

// 切换游戏大小
function switchSize(size) {
    const grid = document.getElementById('grid');
    currentSize = size === '6x6' ? 6 : 9;
    grid.className = `grid grid-${size}`;
    newGame();
}

// 生成新游戏
function newGame() {
    initGame();
    generateSudoku();
    showingSolution = false;
}

// 生成数独谜题
function generateSudoku() {
    // 生成完整的解决方案
    solution = generateSolution();
    
    // 复制解决方案到谜题
    puzzle = JSON.parse(JSON.stringify(solution));
    
    // 随机移除一些数字来创建谜题
    const cellsToRemove = currentSize === 9 ? 45 : 20;
    for (let i = 0; i < cellsToRemove; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * currentSize);
            col = Math.floor(Math.random() * currentSize);
        } while (puzzle[row][col] === 0);
        puzzle[row][col] = 0;
    }
    
    // 更新界面
    updateDisplay();
}

// 生成完整的数独解决方案
function generateSolution() {
    const grid = Array(currentSize).fill().map(() => Array(currentSize).fill(0));
    fillGrid(grid);
    return grid;
}

// 填充数独网格
function fillGrid(grid) {
    for (let row = 0; row < currentSize; row++) {
        for (let col = 0; col < currentSize; col++) {
            if (grid[row][col] === 0) {
                const numbers = shuffle([...Array(currentSize)].map((_, i) => i + 1));
                for (let num of numbers) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (fillGrid(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// 检查数字是否有效
function isValid(grid, row, col, num) {
    // 检查行
    for (let x = 0; x < currentSize; x++) {
        if (grid[row][x] === num) return false;
    }
    
    // 检查列
    for (let x = 0; x < currentSize; x++) {
        if (grid[x][col] === num) return false;
    }
    
    // 检查宫格
    const boxSize = currentSize === 9 ? 3 : 2;
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;
    
    for (let i = 0; i < boxSize; i++) {
        for (let j = 0; j < boxSize; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

// 随机打乱数组
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 更新显示
function updateDisplay() {
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        const i = parseInt(input.dataset.row);
        const j = parseInt(input.dataset.col);
        const value = puzzle[i][j];
        input.value = value || '';
        input.readOnly = value !== 0;
        input.parentElement.classList.toggle('fixed', value !== 0);
    });
}

// 切换显示解决方案
function toggleSolution() {
    showingSolution = !showingSolution;
    const inputs = document.querySelectorAll('.cell input');
    inputs.forEach(input => {
        const i = parseInt(input.dataset.row);
        const j = parseInt(input.dataset.col);
        if (!input.readOnly) {
            input.value = showingSolution ? solution[i][j] : (puzzle[i][j] || '');
        }
    });
}

// 检查解决方案
function checkSolution() {
    const inputs = document.querySelectorAll('.cell input');
    let allCorrect = true;
    
    inputs.forEach(input => {
        const i = parseInt(input.dataset.row);
        const j = parseInt(input.dataset.col);
        const value = input.value ? parseInt(input.value) : 0;
        const isCorrect = value === solution[i][j];
        input.parentElement.classList.toggle('incorrect', !isCorrect && value !== 0);
        if (!isCorrect && value !== 0) allCorrect = false;
    });
    
    if (allCorrect) {
        alert('恭喜！你已经完成了数独谜题！');
    }
}

// 验证单个单元格
function validateCell(row, col) {
    const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
    const value = input.value ? parseInt(input.value) : 0;
    const isCorrect = value === 0 || value === solution[row][col];
    input.parentElement.classList.toggle('incorrect', !isCorrect);
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', newGame);