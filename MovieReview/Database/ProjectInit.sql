drop database if exists kstan;
create database kstan;
use kstan;

create table User (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

create table Movie (
   id int auto_increment primary key,
   title varchar(80) not null,
   director varchar(80) not null,
   ownerId int,
   releaseYear int not null,
   rating decimal,
   genre varchar(30),
   constraint FKReview_ownerId foreign key (ownerId) references User(id)
    on delete cascade,
   unique key UK_title(title, director, releaseYear)
);

create table Review (
   id int auto_increment primary key,
   mvId int not null,
   username varchar(30) not null,
   postedOn datetime not null,
   content varchar(5000) not null,
   score decimal,
   constraint FKReview_mvId foreign key (mvId) references Movie(id)
    on delete cascade,
   constraint FKReview_username foreign key (username) references User(email)
    on delete cascade
);

create table Sentiment (
    id int auto_increment primary key,
    mvId int not null,
    username varchar(30) not null,
    sentiment int not null,
    constraint FKReview_mvId foreign key (mvId) references Movie(id)
     on delete cascade,
    constraint FKReview_username foreign key (username) references User(email)
     on delete cascade

);

insert into User (firstName, lastName, email, password, whenRegistered, role)
            VALUES ("Joe", "Admin", "adm@11.com", "password", NOW(), 1);
