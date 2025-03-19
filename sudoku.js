class Sudoku {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.timer = null;
        this.seconds = 0;
        this.selectedCell = null;
        this.difficulty = {
            easy: 40,
            medium: () => Math.floor(Math.random() * (35 - 27 + 1)) + 27,  // 27-35个初始数字
            hard: () => Math.floor(Math.random() * (26 - 17 + 1)) + 17    // 17-26个初始数字
        };
    }

    // 生成有效的数独解
    generateSolution() {
        const fillGrid = (grid) => {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                        for (let num of nums) {
                            if (this.isValid(grid, row, col, num)) {
                                grid[row][col] = num;
                                if (fillGrid(grid)) return true;
                                grid[row][col] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        fillGrid(this.solution);
    }

    // 生成数独题目
    generatePuzzle(difficulty) {
        this.generateSolution();
        this.grid = this.solution.map(row => [...row]);
        const difficultyValue = typeof this.difficulty[difficulty] === 'function' 
            ? this.difficulty[difficulty]() 
            : this.difficulty[difficulty];
        const cellsToRemove = 81 - difficultyValue;

        const positions = Array.from({length: 81}, (_, i) => [Math.floor(i / 9), i % 9]);
        this.shuffleArray(positions);

        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = positions[i];
            const temp = this.grid[row][col];
            this.grid[row][col] = 0;

            // 检查是否仍然只有一个解
            if (!this.hasUniqueSolution()) {
                this.grid[row][col] = temp;
            }
        }
    }

    // 检查是否只有一个解
    hasUniqueSolution() {
        let solutions = 0;
        const tempGrid = this.grid.map(row => [...row]);

        const solve = (grid) => {
            if (solutions > 1) return;

            let row = -1;
            let col = -1;
            let isEmpty = false;

            for (let i = 0; i < 9 && !isEmpty; i++) {
                for (let j = 0; j < 9 && !isEmpty; j++) {
                    if (grid[i][j] === 0) {
                        row = i;
                        col = j;
                        isEmpty = true;
                    }
                }
            }

            if (!isEmpty) {
                solutions++;
                return;
            }

            for (let num = 1; num <= 9; num++) {
                if (this.isValid(grid, row, col, num)) {
                    grid[row][col] = num;
                    solve(grid);
                    grid[row][col] = 0;
                }
            }
        };

        solve(tempGrid);
        return solutions === 1;
    }

    // 检查数字是否有效
    isValid(grid, row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // 检查列
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // 检查3x3方格
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    // 打乱数组
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 获取提示
    getHint() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return {
                        row: row,
                        col: col,
                        value: this.solution[row][col]
                    };
                }
            }
        }
        return null;
    }

    // 检查当前填写是否正确
    checkSolution() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0 && 
                    this.grid[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }
}

// 游戏管理类
class GameManager {
    constructor() {
        this.sudoku = new Sudoku();
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createGrid();
        this.startNewGame();
        this.startTimer();
    }

    createGrid() {
        const grid = document.querySelector('.grid');
        grid.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = Math.floor(i / 9);
            cell.dataset.col = i % 9;
            grid.appendChild(cell);
        }
    }

    startNewGame() {
        const difficulty = document.getElementById('difficulty').value;
        this.sudoku.generatePuzzle(difficulty);
        this.updateGrid();
        this.resetTimer();
    }

    updateGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.sudoku.grid[row][col];
            cell.textContent = value || '';
            cell.className = 'cell';
            if (value !== 0) {
                cell.classList.add('fixed');
            }
        });
    }

    startTimer() {
        if (this.sudoku.timer) {
            clearInterval(this.sudoku.timer);
        }
        this.sudoku.seconds = 0;
        this.updateTimer();
        this.sudoku.timer = setInterval(() => {
            this.sudoku.seconds++;
            this.updateTimer();
        }, 1000);
    }

    resetTimer() {
        if (this.sudoku.timer) {
            clearInterval(this.sudoku.timer);
        }
        this.sudoku.seconds = 0;
        this.updateTimer();
        this.startTimer();
    }

    updateTimer() {
        const minutes = Math.floor(this.sudoku.seconds / 60);
        const seconds = this.sudoku.seconds % 60;
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        // 难度选择事件
        document.getElementById('difficulty').addEventListener('change', () => {
            this.startNewGame();
        });

        // 数字输入事件
        document.querySelector('.grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell') && !e.target.classList.contains('fixed')) {
                if (this.sudoku.selectedCell) {
                    this.sudoku.selectedCell.classList.remove('selected');
                }
                this.sudoku.selectedCell = e.target;
                e.target.classList.add('selected');
            }
        });

        // 键盘输入事件
        document.addEventListener('keydown', (e) => {
            if (this.sudoku.selectedCell && !this.sudoku.selectedCell.classList.contains('fixed')) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9) {
                    const row = parseInt(this.sudoku.selectedCell.dataset.row);
                    const col = parseInt(this.sudoku.selectedCell.dataset.col);
                    this.sudoku.grid[row][col] = num;
                    this.sudoku.selectedCell.textContent = num;
                    this.sudoku.selectedCell.classList.remove('error');
                    this.sudoku.selectedCell.classList.add('user-input');
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    const row = parseInt(this.sudoku.selectedCell.dataset.row);
                    const col = parseInt(this.sudoku.selectedCell.dataset.col);
                    this.sudoku.grid[row][col] = 0;
                    this.sudoku.selectedCell.textContent = '';
                    this.sudoku.selectedCell.classList.remove('error');
                }
            }
        });

        // 新游戏按钮
        document.getElementById('newGame').addEventListener('click', () => {
            this.startNewGame();
        });

        // 检查按钮
        document.getElementById('check').addEventListener('click', () => {
            let hasError = false;
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                if (!cell.classList.contains('fixed')) {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    const value = this.sudoku.grid[row][col];
                    if (value !== 0) {
                        if (value !== this.sudoku.solution[row][col]) {
                            cell.classList.add('error');
                            hasError = true;
                        } else {
                            cell.classList.remove('error');
                        }
                    }
                }
            });
            const message = document.getElementById('message');
            message.textContent = !hasError ? '太棒了！答案正确！' : '还没有完全正确，请继续努力！';
            message.className = `message ${!hasError ? 'success' : 'error'}`;
            setTimeout(() => {
                message.className = 'message';
            }, 3000);
        });

        // 提示按钮
        document.getElementById('hint').addEventListener('click', () => {
            const hint = this.sudoku.getHint();
            if (hint) {
                const cell = document.querySelector(
                    `[data-row="${hint.row}"][data-col="${hint.col}"]`
                );
                this.sudoku.grid[hint.row][hint.col] = hint.value;
                cell.textContent = hint.value;
            }
        });

        // 解答按钮
        document.getElementById('solve').addEventListener('click', () => {
            this.sudoku.grid = this.sudoku.solution.map(row => [...row]);
            this.updateGrid();
        });
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});