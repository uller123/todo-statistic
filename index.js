const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    // Разбиваем команду на части
    const parts = command.split(' ');
    const mainCommand = parts[0].toLowerCase(); // основная команда (show, user, exit)
    
    switch (mainCommand) {
        case 'exit':
            process.exit(0);
            break;

        case 'show':
            const todos = getAllTodos();
            todos.forEach(todo => console.log(todo));
            break;
        
        case 'user':
            let username = parts[1];
            username = username.replace('{', '').replace('}', '');
            const userTodos = getTodosByUser(username);
            userTodos.forEach(todo => console.log(todo));
            break;

        default:
            console.log('wrong command');
            break;
    }
}

function getAllTodos() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    const todos = [];
    for (const filePath of filePaths) {
        const content = readFile(filePath);
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('// TODO ')) {
                todos.push(trimmed);
            }
        }
    }
    return todos;
}

function getTodosByUser(username) {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    const userTodos = [];
    
    for (const filePath of filePaths) {
        const content = readFile(filePath);
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('// TODO ')) {
                const todoContent = trimmed.substring(8);
                const parts = todoContent.split(';');
                const author = parts[0].trim();
                if (author.toLowerCase() === username.toLowerCase()) {
                    userTodos.push(trimmed);
                }
            }
        }
    }
    
    return userTodos;
}