const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

console.log('Please, write your command!');
readLine(processCommand);

const TODO_REGEX = /^\/\/\s*todo[:\s]?/i;

function processCommand(command) {
    const parts = command.trim().split(' ');
    const mainCommand = parts[0].toLowerCase();

    switch (mainCommand) {
        case 'exit':
            process.exit(0);
            break;

        case 'show': {
            const todos = getAllTodos();
            todos.forEach(todo => console.log(todo));
            break;
        }

        case 'important': {
            const todos = getAllTodos();
            const importantTodos = todos.filter(todo => todo.includes('!'));
            importantTodos.forEach(todo => console.log(todo));
            break;
        }

        case 'user': {
            const username = parts[1];
            if (!username) {
                console.log('Please specify user');
                break;
            }
            const userTodos = getTodosByUser(username);
            userTodos.forEach(todo => console.log(todo));
            break;
        }

        case 'date': {
            const inputDate = parts[1];
            if (!inputDate) {
                console.log('Please specify date');
                break;
            }

            const filtered = getTodosAfterDate(inputDate);

            if (filtered === null) {
                console.log('Invalid date format');
                break;
            }

            filtered.forEach(todo => console.log(todo));
            break;
        }

        case 'sort': {
            const param = parts[1];
            if (!param) {
                console.log('Please specify sort type');
                break;
            }

            const todosWithMetadata = getAllTodosWithMetadata();

            switch (param.toLowerCase()) {
                case 'importance':
                    sortByImportance(todosWithMetadata);
                    break;
                case 'user':
                    sortByUser(todosWithMetadata);
                    break;
                case 'date':
                    sortByDate(todosWithMetadata);
                    break;
                default:
                    console.log('Wrong parameter');
            }
            break;
        }

        default:
            console.log('wrong command');
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

            if (TODO_REGEX.test(trimmed)) {
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

            if (TODO_REGEX.test(trimmed)) {
                const todoContent = trimmed
                    .replace(TODO_REGEX, '')
                    .trim();

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

function getAllTodosWithMetadata() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    const todos = [];

    for (const filePath of filePaths) {
        const content = readFile(filePath);
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();

            if (TODO_REGEX.test(trimmed)) {
                const todoContent = trimmed
                    .replace(TODO_REGEX, '')
                    .trim();

                const parts = todoContent.split(';');

                const todoObject = {
                    original: trimmed,
                    importance: countExclamationMarks(trimmed),
                    user: extractUser(parts),
                    date: extractDate(parts),
                    content: todoContent
                };

                todos.push(todoObject);
            }
        }
    }

    return todos;
}

function countExclamationMarks(text) {
    return (text.match(/!/g) || []).length;
}

function extractUser(parts) {
    return parts.length >= 1 ? parts[0].trim() || null : null;
}

function extractDate(parts) {
    if (parts.length < 2) return null;

    const dateStr = parts[1].trim();
    const date = new Date(dateStr);

    return isNaN(date.getTime()) ? null : date;
}

function sortByImportance(todos) {
    const sorted = [...todos].sort((a, b) => b.importance - a.importance);
    sorted.forEach(todo => console.log(todo.original));
}

function sortByUser(todos) {
    const withUser = todos.filter(todo => todo.user !== null);
    const withoutUser = todos.filter(todo => todo.user === null);

    withUser.sort((a, b) => a.user.localeCompare(b.user));

    [...withUser, ...withoutUser]
        .forEach(todo => console.log(todo.original));
}

function sortByDate(todos) {
    const withDate = todos.filter(todo => todo.date !== null);
    const withoutDate = todos.filter(todo => todo.date === null);

    withDate.sort((a, b) => b.date - a.date);

    [...withDate, ...withoutDate]
        .forEach(todo => console.log(todo.original));
}

function getTodosAfterDate(inputDate) {
    const filterDate = new Date(inputDate);

    if (isNaN(filterDate)) {
        return null;
    }

    const todos = getAllTodos();

    return todos.filter(todo => {
        const todoContent = todo
            .replace(TODO_REGEX, '')
            .trim();

        const parts = todoContent.split(';');

        if (parts.length < 2) return false;

        const todoDate = new Date(parts[1].trim());

        if (isNaN(todoDate)) return false;

        return todoDate > filterDate;
    });
}