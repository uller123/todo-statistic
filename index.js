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
    switch (command) {
        case 'exit':
            process.exit(0);
            break;

        case 'show':
            const todos = getAllTodos();
            todos.forEach(todo => console.log(todo));
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
