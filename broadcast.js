'use strict'

const program = require('commander')
const csv = require('csv')
const fs = require('fs')
const inquirer = require('inquirer')
const walk = require('./lib/helper').walk

program
    .version('1.0.0')
    .option('-l, --list [list]','list of customers in CSV file')
    .option('-r, --remove [remove]','remove customers who is in CSV file')
    .parse(process.argv)

//console.log(process.argv)

//命令行传入的参数存储在commander.optionName中。如 node broadcast --list customer/customer.csv
// [customer/customer.csv] 存储在[program.list]中
// console.log(program.list)
// console.log(program.remove)

//let ary = walk(program.remove)      //获取传入路径(或文件)下的所有csv文件

let parse = csv.parse
let stream = fs.createReadStream(program.list).pipe(parse({delimiter :','}))

let customer = []
let questions = [
    {
        type:'input',
        name:'creator',
        message:'creator\'s name '
    },
    {
        type:'input',
        name:'creator\'s phone',
        message:'creator\'s telephone'
    }
]

stream
    .on('error',(err) => {
        console.error(err.message)
    })
    .on('data',(data) => {
        let name = data[0] + data[1]
        let email = data[2]

        customer.push({name:name,email:email})
    })
    .on('end',() => {
        inquirer.prompt(questions).then((creator) => {
            console.log(creator)
        })
    })
