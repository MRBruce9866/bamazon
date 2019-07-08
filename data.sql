drop database if exists bamazon_db;
create database bamazon_db;
use bamazon_db;

create table users(
userID integer(10) not null auto_increment,
userName varchar(50) not null,
userPassword varchar(15) not null,
userType integer default 0,
currentFunds decimal(10,2) default 0.00,
primary key(userID)
);

create table products(
itemID integer(10) not null auto_increment,
productName varchar(100) not null,
departmentName varchar(30) not null,
unitPrice decimal(10,2) not null,
stockQuantity integer(10) not null,
primary key(itemID)
);

create table purchase_orders(
purchaseID integer(10) not null auto_increment,
customerID integer(10) not null,
itemID integer(10) not null,
quantityPurchased integer(10) not null,
priceAtPurchase decimal(10,2) not null,
totalCost decimal(10,2) not null,
primary key(purchaseID)

);
insert into users (userName, userPassword, userType) values ('admin','admin', 1);
insert into users (userName, userPassword) values ('Mark','1234');

insert into products (productName, departmentName, unitPrice, stockQuantity) values ('Milk','Groceries',2.99, 10);
insert into products (productName, departmentName, unitPrice, stockQuantity) values ('Laptop','Electronics',892.76, 5);
insert into products (productName, departmentName, unitPrice, stockQuantity) values ('Toothpaste', 'Cosmetics', 3.95, 100);
insert into products (productName, departmentName, unitPrice, stockQuantity) values ('DVD Player', 'Electronics', 36.41, 2);
insert into products (productName, departmentName, unitPrice, stockQuantity) values ('Charcoal Grill','Outdoors',29.99, 15);


