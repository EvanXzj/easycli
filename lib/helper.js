'use strict'

const fs = require('fs')

module.exports = {
    walk:(path) =>{
        let ary =[]
        let statOuter = fs.statSync(path)
        if(statOuter.isFile()){
            ary.push(path)
        }else if(statOuter.isDirectory()){
            fs.readdirSync(path).forEach((file) => {
                let newPath = path +'/' + file             
                let statInner = fs.statSync(newPath)
                if(statInner.isFile()){
                    if(/(.*)\.csv/.test(file)){
                        ary.push(newPath)
                    }
                }else if(statInner.isDirectory()){
                    walk(newPath)
                }
            })
        }
        return ary
    },
}