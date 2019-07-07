var mysql = require('mysql');
var inquirer = require('inquirer');

var inquireQuestions = {
    'Login': {
        questions: [{
            name: 'loginType',
            message: 'Choose an option: ',
            type: 'list',
            choices: ['Customer Login', 'Admin Login', 'Create a New Account']
        }],
        run: function (answer) {
                inquire(inquireQuestions[answer.loginType]);
        }
    },
    'Create a New Account': {
        questions: [{
            name: 'loginType',
            message: 'Choose an option: ',
            type: 'list',
            choices: ['A', 'B', 'C']
        }],
        run: function (answer) {
            console.log(`\n${answer.loginType}`)
        }
    },

};

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon_db'
});


connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
    inquire(inquireQuestions['Login']);
    connection.end();
});





function inquire(prompt) {
    inquirer.prompt(prompt.questions).then(prompt.run);
}



