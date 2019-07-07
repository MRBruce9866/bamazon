var mysql = require('mysql');

var Database = {
    connection: "",
    connectToDatabase: function (callback){
        this.connection = mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'root',
            database: 'bamazon_db'
        })

        this.connection.connect(function (err) {
            if (err) throw err;
            console.log("Connected as id " + Database.connection.threadId);
            callback();
        });
        
    },

    pullData: function (string, callback){
        this.connection.query(string, callback);

    },

    insertData: function (string, obj, callback){
        this.connection.query(string, obj, callback);
    },

    updateData: function (string, obj, callback){
        this.connection.query(string, obj, callback);
    },

    deleteData: function (string, obj, callback){
        this.connection.query(string, obj, callback);
    },

    disconnectFromDatabase: function (){
        this.connection.end();
    }

};

module.exports = Database;

