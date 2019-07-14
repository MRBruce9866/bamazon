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
                console.log(`Passwords didn't match. `);
                inquire(inquireQuestions[`Create a New Account`])
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

                            switch (currentUser.userType) {
                                case 1:
                                    displayProducts(`Admin`)
                                    break;

                                default:
                                    displayProducts(`Customer`)
                                    break;
                            }

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
                start();
            } else {
                inquire(inquireQuestions[answer.customerOption]);
            }

        }
    },
    'Admin': {
        questions: [{
            name: 'adminChoice',
            message: 'Choose an option',
            type: 'list',
            choices: ['View Products of Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Logout']
        }, ],
        run: function (answer) {
            switch (answer.adminChoice) {
                case 'View Products of Sale':
                    displayProducts('Admin')
                    break;
                case 'View Low Inventory':
                    displayLowInventory();
                    break;

                case 'Logout':
                    start();
                    break;

                default:
                    inquire(inquireQuestions[answer.adminChoice]);
                    break;
            }
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
                    displayProducts('Customer', `$${answer.amount.toFixed(2)} has been added to your account`);
                });
            } else {
                displayProducts('Customer', `No funds have been added.`);
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
    'Add to Inventory': {
        questions: [{
                name: 'id',
                message: 'What itemID would you like to add to?',
                type: 'number'

            },
            {
                name: 'qty',
                message: 'What itemID would you like to add to?',
                type: 'number'

            },
        ],
        run: function (answer) {
            Database.pullData(`SELECT stockQuantity FROM products WHERE itemID = ${answer.id}`,
                function (err, res) {
                    if (err) throw err;

                    if (res.length > 0) {
                        Database.updateData('UPDATE products SET ? WHERE ?',
                            [{
                                    stockQuantity: res[0].stockQuantity + answer.qty
                                },
                                {
                                    itemID: answer.id
                                }
                            ],
                            function (err, res) {
                                if (err) throw err;
                                products = [];
                                displayProducts('Admin', `Added ${answer.qty} unit(s) of item ${answer.id} in stock`)
                            });
                    } else {
                        displayProducts('Admin', `${answer.id} is not a valid itemID`)
                    }

                    console.log(res);
                })


        }

    },
    'Add New Product': {
        questions: 
        [
            {
                name: 'name',
                message: 'Name: ',
            },
            {
                name: 'department',
                message: 'Department: ',
            },
            {
                name: 'unitPrice',
                message: 'Unit Price: (numbers only)',
                type: 'number'
            },
            {
                name: 'quantity',
                message: 'Quantity: ',
            },
        ],
        run: function (answer) {
            if(answer.name){
                var item = {
                    productName: answer.name,
                    departmentName: answer.department,
                    unitPrice: answer.unitPrice,
                    stockQuantity: answer.quantity
                }

                Database.insertData("INSERT INTO products SET ?", item, function (err, res){
                    if(err) throw err;
                    if(res){
                        displayProducts('Admin', `Item Successfully Added`);
                    }else{
                        console.log(res);
                    }
                })
            }else{

            }
        }

    },
};


Database.connectToDatabase(function () {
    start();
});

function start() {
    currentUser = "";
    console.log('\033c');
    console.log(`\n[***] Welcome to Bamazon [***]\n`)

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

function displayProducts(menuType, message) {
    console.log('\033c');
    console.log(`\n[***] Bamazon Store [***]\n`)
    if (products.length > 0) {
        console.table('Products', products);

        showMenu(menuType, message);
    } else {
        Database.pullData('SELECT * FROM products', function (err, res) {
            if (err) throw err;

            if (res.length !== 0) {
                products = res;
                console.table('Products', products);

                showMenu(menuType, message);

            }

        });
    }

}

function displayLowInventory() {
    console.log('\033c');
    console.log(`\n[***] Bamazon Store [***]\n`)

    Database.pullData('SELECT * FROM products WHERE stockQuantity < 10', function (err, res) {
        if (err) throw err;


        console.table('Low inventory', res);

        showMenu('Admin');



    });


}

function showMenu(menuType = 'Customer', message = ``) {
    console.log(currentUser.userName);
    console.log(`Funds: $${currentUser.currentFunds.toFixed(2)}\n`)
    console.log('--------------------------')
    console.log(message)
    console.log('--------------------------\n');

    inquire(inquireQuestions[menuType]);

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
                                if (res) {
                                    console.log('Database Updated');
                                    products = [];
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
                                            if (res)
                                                displayProducts(`Customer`, `Transaction Successful. You bought ${qty} unit(s) of item ${id} for $${totalCost}`);
                                        });
                                }

                            });


                    } else {
                        displayProducts(`Customer`, `You do not have enough money in your account. Total cost would be $${totalCost}`);
                    }

                } else {
                    console.log(`Insufficient quantity for item ${id}`)
                    displayProducts('Customer', `Sorry, we only have ${res[0].stockQuantity} units of item ${res[0].itemID} in stock!`);
                }
            } else {
                console.log();
                displayProducts(`Customer`, `Item id: ${id} does not exist`);
            }
        })
}

function inquire(prompt) {

    inquirer.prompt(prompt.questions).then(prompt.run);
};