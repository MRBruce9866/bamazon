var Database = require('./database');
var inquirer = require('inquirer');
var cTable = require('console.table');
var products = [];
var currentUser;

var inquireQuestions = {
    'Start': {
        questions: [{
            name: 'loginType',
            message: 'Choose an option: ',
            type: 'list',
            choices: ['Login', 'Create a New Account', 'Exit']
        }],
        run: function (answer) {
            if (answer.loginType !== 'Exit') {
                inquire(inquireQuestions[answer.loginType]);
            } else {
                Database.disconnectFromDatabase();
            }
        }
    },
    'Create a New Account': {
        questions: [{
                name: 'userName',
                message: 'Create Username: ',
            },
            {
                name: 'password1',
                message: 'Create Password: ',
                type: 'password'
            },
            {
                name: 'password2',
                message: 'Retype Password: ',
                type: 'password'
            },
        ],
        run: function (answer) {
            if (answer.password1 === answer.password2) {
                createUser(answer.userName, answer.password1)
            } else {
                console.log("Passwords didn't match. ");
                inquire(inquireQuestions["Create a New Account"])
            }

        }
    },
    'Login': {
        questions: [{
                name: 'name',
                message: 'Username: '
            },
            {
                name: 'password',
                message: 'Password',
                type: 'password',
                mask: '*'
            },
        ],
        run: function (answer) {

            Database.pullData(`SELECT * FROM users WHERE userName = '${answer.name}'`,
                function (err, res) {
                    if (err) throw err;
                    if (res.length > 0) {
                        if (res[0].userPassword === answer.password) {
                            currentUser = res[0];
                            displayProducts(showCustomerMenu);

                        } else {
                            console.log('Password incorrect');
                            start();
                        }
                    } else {
                        console.log(`Account for ${answer.name} has not been created!`);
                        start();;
                    }
                })

        }
    },
    'Customer': {
        questions: [{
            name: 'customerOption',
            message: 'Choose an option: ',
            type: 'list',
            choices: ['Add Funds', 'Purchase Item', 'Logout']
        }, ],
        run: function (answer) {
            if (answer.customerOption === 'Logout') {
                console.log(`\n ${currentUser.userName} logged out.\n`)
                currentUser = {};
                start();
            } else {
                inquire(inquireQuestions[answer.customerOption]);
            }

        }
    },
    'Admin': {
        questions: [{
            name: '',
            message: '',
            type: 'list',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Logout']
        }, ],
        run: function (answer) {

        }

    },
    'Add Funds': {
        questions: [{
            name: 'amount',
            message: 'How much would you like to add? ',
            type: 'number'

        }, ],
        run: function (answer) {
            if (parseFloat(answer.amount.toFixed(2)) > 0) {
                currentUser.currentFunds += parseFloat(answer.amount.toFixed(2));
                addFunds(function () {
                    displayProducts(showCustomerMenu);
                });
            } else {
                displayProducts(showCustomerMenu);
            }


        }

    },
    'Purchase Item': {
        questions: [{
                name: 'itemID',
                message: 'What itemID would you like to purchase? ',
                type: 'number',
            },
            {
                name: 'quantity',
                message: 'How many of the item would you like? ',
                type: 'number',
            },
        ],
        run: function (answer) {
            purchaseItem(answer.itemID, answer.quantity)
        }

    },
    'View Products for Sale': {
        questions: [{
            name: 'back',
            message: 'Go back to Customer Screen:',
            type: 'list',
            choices: ['Back']
        }, ],
        run: function (answer) {
            displayProducts(showCustomerMenu);
        }

    },
    'View Low Inventory': {
        questions: [{
            name: 'back',
            message: 'Go back to Customer Screen:',
            type: 'list',
            choices: ['Back']
        }, ],
        run: function (answer) {
            displayProducts(showCustomerMenu);
        }

    },
    'Add to Inventory': {
        questions: [{
                name: 'back',
                message: 'What itemID would you like to add to?',
                type: 'number'

            },
            {
                name: 'back',
                message: 'What itemID would you like to add to?',
                type: 'number'

            },
        ],
        run: function (answer) {
            displayProducts(showCustomerMenu);
        }

    },
    'Add New Product': {
        questions: [{
            name: 'back',
            message: 'Go back to Customer Screen:',
            type: 'list',
            choices: ['Back']
        }, ],
        run: function (answer) {
            displayProducts(showCustomerMenu);
        }

    },
};


Database.connectToDatabase(function () {
    start();
});

function start() {
    console.log('\033c');
    console.log("\n[***] Welcome to Bamazon [***]\n")

    inquire(inquireQuestions['Start']);
}

function createUser(name, password) {
    Database.pullData('SELECT userName FROM users', function (err, res) {
        if (err) throw err;

        if (res.find(function (result) {
                if (result.userName === name) {
                    return result;
                }
            })) {
            console.log('Username already exists');
            inquire(inquireQuestions['Create a New Account']);
        } else {

            Database.insertData('INSERT INTO users SET ?', {
                userName: name,
                userPassword: password,
            }, function (err, res) {
                if (err) throw err;
                if (res) {
                    console.log(`${name} was created!`);
                    start();;
                }
            });
        }
    });

};

function displayProducts(callback) {
    // console.log('\033c');
    console.log("\n[***] Bamazon Store [***]\n")
    Database.pullData('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        if (res.length !== 0) {
            products = res;
            console.table('Products', products);
            callback();
        }

    });
}

function showCustomerMenu() {
    console.log(currentUser.userName);
    console.log('--------------------------')
    console.log(`Funds: $${currentUser.currentFunds.toFixed(2)}\n`)
    inquire(inquireQuestions['Customer']);
}

function showAdminMenu() {
    // console.log(`Funds: $${currentUser.currentFunds.toFixed(2)}\n`)
    // inquire(inquireQuestions['Customer']);
}

function addFunds(callback) {
    Database.updateData('UPDATE users SET ? WHERE ?',
        [{
                currentFunds: currentUser.currentFunds
            },
            {
                userID: currentUser.userID
            }

        ],
        function (err, res) {
            if (err) throw err;
            callback();
        });
}

function purchaseItem(id, qty) {
    Database.pullData(`SELECT * FROM products WHERE itemID = ${id}`,
        function (err, res) {
            if (err) throw err;
            if (res.length > 0) {
                if (res[0].stockQuantity >= qty) {
                    var totalCost = res[0].unitPrice * qty;
                    if (totalCost <= currentUser.currentFunds) {
                        var newStock = res[0].stockQuantity - qty;
                        Database.updateData('UPDATE products SET ? WHERE ?',
                            [{
                                    stockQuantity: newStock
                                },
                                {
                                    itemID: id
                                }
                            ],
                            function (err, res) {
                                if (err) throw err;
                                console.log('Database Updated');
                                console.log(currentUser)
                                currentUser.currentFunds -= totalCost;
                                Database.updateData('UPDATE users SET ? WHERE ?',
                                    [{
                                            currentFunds: currentUser.currentFunds
                                        },
                                        {
                                            userID: currentUser.userID
                                        }
                                    ],
                                    function (err, res) {
                                        if (err) throw err;
                                        console.log(`Transaction Successful. You bought ${qty} unit(s) of item ${id}`);
                                        displayProducts(showCustomerMenu);
                                    });
                            });


                    } else {
                        console.log("Your account does not have enough funds!")
                        displayProducts(showCustomerMenu);
                    }

                } else {
                    console.log(`Insufficient quantity for item ${id}`)
                    displayProducts(showCustomerMenu);
                }
            } else {
                console.log(`Item id: ${id} does not exist`);
                displayProducts(showCustomerMenu);
            }
        })
}

function inquire(prompt) {

    inquirer.prompt(prompt.questions).then(prompt.run);
};