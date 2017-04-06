'use strict'

const program = require('commander')
const csv = require('csv')
const fs = require('fs')
const inquirer = require('inquirer')
const mongoose = require('mongoose')
const walk = require('./lib/helper').walk

const _ = require('lodash')
const async = require('async')

mongoose.connect('mongodb://localhost/users')               //连接数据库

//数据库连接测试
// let db = mongoose.connection
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log('db connect success')
// });

let User = mongoose.model('User',{
    name:String,
    email:String,
    creator:{
        name:String,
        telephone:String  
    },
    date:{type:Date,default:Date.now()},
})

program
    .version('1.0.0')
    .option('-l, --list [list]','list of customers in CSV file')
    .option('-d, --delete [delete]','delete customers  in CSV file')
    .option('-i, --insert [insert]','insert customers into mongodb ')
    .option('-u, --update [update]','update customer\'s infomation ')
    .parse(process.argv)

console.log(process.argv)

//命令行传入的参数存储在commander.optionName中。如 node broadcast --list customer/customer.csv
// [customer/customer.csv] 存储在[program.list]中
//console.log(program['list'])
// console.log(program.remove)
let workTypeObj={
    l:'list',
    d:'delete',
    i:'insert',
    u:'update',
}

let workTypeShort = process.argv[2].length > 2 ? (process.argv[2].substring(2,3).toString()): (process.argv[2].substring(1).toString())//前台传入的操作类型：list 、remove 、update
let workType =workTypeObj[workTypeShort]

console.log(program[workType])
let ary = walk(program[workType])                              //获取传入路径(或文件)下的所有csv文件
console.log(ary)

let questions = [
    {
        type:'input',
        name:'name',
        message:'creator\'s name '
    },
    {
        type:'input',
        name:'telephone',
        message:'creator\'s telephone'
    }
]

inquirer.prompt(questions).then((creator) => {
    // ary.forEach((__filename) => {        
    //     let parse = csv.parse
    //     let stream = fs.createReadStream(__filename).pipe(parse({delimiter :','}))

    //     let customer = []

    //     stream
    //         .on('error',(err) => {
    //             console.error(err.message)
    //         })
    //         .on('data',(data) => {
    //             let name = data[0] + data[1]
    //             let email = data[2]

    //             customer.push({name:name,email:email})
    //         })
    //         .on('end',() => {
    //             console.log('-----------------------------------------------------------------')
    //             console.log(customer)
    //             console.log(creator)
    //             customer.forEach((_customer) => {
    //                 let user = new User({
    //                      name:_customer.name,
    //                      email:_customer.email,
    //                      creator:{
    //                          name:creator.name,
    //                          telephone:creator.telephone,
    //                      }
    //                 })
    //                 user.save((err) => {
    //                     if(err){
    //                         console.err(err)
    //                     }else{
    //                         console.log('insert success')
    //                     }
    //                 })
    //             })
    //         })
    // })
    async.map(ary,(__filename) => {
        let parse = csv.parse
        let stream = fs.createReadStream(__filename).pipe(parse({delimiter :','}))

        let customer = []

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
                console.log('-----------------------------------------------------------------')
                console.log(customer)
                console.log(creator)
                customer.forEach((_customer) => {
                    let user = new User({
                         name:_customer.name,
                         email:_customer.email,
                         creator:{
                             name:creator.name,
                             telephone:creator.telephone,
                         }
                    })
                    user.save((err) => {
                        if(err){
                            console.err(err)
                        }else{
                            console.log('insert success')
                        }
                    })
                })
            })       
    },(err,results) => {
        mongoose.disconnect()
        if(err){console.err(err)}
    })
})