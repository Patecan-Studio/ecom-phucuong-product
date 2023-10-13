'use strict'

const mongoose = require('mongoose');
const connectString = `mongodb+srv://patecan:Patecan123!@ecom-phucuong.9sew3k3.mongodb.net/?retryWrites=true&w=majority`;
const { countConnect } = require('../helpers/check.connectDatabase')



class Database{

    constructor(){
        this.connect()
    }

    // connect
    connect(type = 'mongodb'){
        if(1 === 1){ // for DEV
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }

        mongoose.connect( connectString, { maxPoolSize: 50 }).then(_ => {
            countConnect() 
            console.log(`Connected MongoDB Success `)
        })
        .catch(err => console.log(`Error Connect`))
    }

    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database();
        }

        return Database.instance;
    }

}


const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb
