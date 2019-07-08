var Database = require('./database');
var inquirer = require('inquirer');
var cTable = require('console.table');
var products = [];
var currentUsername;

var inquireQuestions = {
    'Start': {
        questions: [{
            name: 'loginType',
            message: 'Choose an option: ',
            type: 'list',
            choices: ['Login', 'Create a New Account', 'Exit']
        }],
        run: function (answer) {
            if(answer.loginType !== 'Exit'){
                inquire(inquireQuestions[answer.loginType]);
            }else{
                Database.disconnectFromDatabase();
                
            }               
        }
    },
    'Create a New Account': {
        questions: [
            {
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
            if(answer.password1 === answer.password2){
                createUser(answer.userName, answer.password1)
            }else{
                console.log("Passwords didn't match. ");
                inquire(inquireQuestions["Create a New Account"])
            }
            
        }
    },
    'Login' :{
        questions:[
            {
                name: 'name',
                message: 'Username: '
            },
            {
                name: 'password',
                message: 'Password',
                type: 'password'
            },
        ],
        run: function (answer){

            Database.pullData(`SELECT * FROM users WHERE userName = '${answer.name}'`, 
            function(err, res){
                if(err) throw err;
                if(res.length > 0){
                    if(res[0].userPassword === answer.password){
                        currentUsername = res[0].userName;
                        console.log(`Logged in as ${currentUsername}`);
                        displayProducts(function(){
                            inquire(inquireQuestions['Customer']);
                        });
                        
                    }else{
                        console.log('Password incorrect');
                        start();
                    }
                }else{
                    console.log(`Account for ${answer.name} has not been created!`);
                    start();;
                }
            })

        }
    },
    'Customer': {
        questions:[
            {
                name:'customerOption',
                message:'What item ID would you like to purchase? ',
                
            },
        ],
        run: function(answer){
                var product = products.find(function(item){
                    if(item.itemID === parseInt(answer.customerOption)){
                        return item;
                    }
                });
                console.log(product);
        }
        
    },
    'Admin':{
        questions:[
            {
                name:'',
                message:'',
                type:'list',
                choices:[]
            },
        ],
        run: function(answer){
                
        }
        
    },
    '':{
        questions:[
            {
                name:'',
                message:'',
                type:'list',
                choices:[]
            },
        ],
        run: function(answer){
                
        }
        
    },
    '':{
        questions:[
            {
                name:'',
                message:'',
                type:'list',
                choices:[]
            },
        ],
        run: function(answer){
                
        }
        
    },

};

Database.connectToDatabase(function (){
    start();
});

function start(){
    inquire(inquireQuestions['Start']);
}


function createUser(name, password){

    Database.pullData('SELECT userName FROM users', function (err, res){
        if(err) throw err;

        if(res.find(function(result){
            if(result.userName === name){
                return result;
            }
        })){
            console.log('Username already exists');
            inquire(inquireQuestions['Create a New Account']);
        }else{

            Database.insertData('INSERT INTO users SET ?',{
                userName: name,
                userPassword: password,
            },function(err,res){
                if(err) throw err;
                if(res){
                    console.log(`${name} was created!`);
                    start();;
                }
            });
        }
    });

};

function displayProducts(callback){
    Database.pullData('SELECT * FROM products', function(err, res){
        if(err) throw err;
        // console.log(err);
        // console.log(res);
        if(res.length !== 0){
            products = res;
            // console.log(res);
            console.log('\n\n')
            console.table('Products',products);
            callback(); 
        }
        
    });
}



function inquire(prompt) {
    inquirer.prompt(prompt.questions).then(prompt.run);
};





