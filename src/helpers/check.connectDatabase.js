'use strict'


const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECONDS = 30000
const _NUM_CORES = 4

// Count Connection
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections: ${numConnection}`)
}

// Check Overload Connection Pool
const checkOverload = () => {
    setInterval(()=> {
        
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss;

        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

        // Example max number of connections based on number of cores
        //const maxConnections = numCores * _NUM_CORES;
        
        //console.log(`Max connection should be: ${maxConnections}`)


    }, _SECONDS) // Monitor every 5 secs
}


module.exports = {
    countConnect,
    checkOverload
}