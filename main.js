#!/usr/bin/env node
const express = require("express")
const fs = require('fs')
const app = express()

app.use(express.json())

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)
    console.log('Request headers:', req.headers)
    next()
})

const file = "expenses.json"

function readData() {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "[]")
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}


function writeData(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}


app.get("/expenses", (req, res) => {

    try {
        const data = readData()

        const page = parseInt(req.query.page) || 1
        let take = parseInt(req.query.take) || 10
        if (take > 50) take = 50

        const start = (page - 1) * take
        const end = start + take

        res.json({
            page,
            take,
            total: data.length,
            data: data.slice(start, end)
        })

    } catch (err) {
        console.error("Error reading expenses:", err)
        res.status(500).send("Internal Server Error")

    }
})

app.get("/expenses/:id", (req, res) => {
    try {
        const data = readData()
        const expense = data.find((e) => e.id == req.params.id)
        if (!expense) return res.status(404).send("not Foudn")
        res.json(expense)
    } catch (err) {
        console.error("Error reading expense:", err)
        res.status(500).send("Internal Server Error")
    }
})


app.post("/expenses", (req, res) => {

    try {
        const data = readData()

        const lastId = data.length ? data[data.length - 1].id : 0;
        const newExpense = {
            id: lastId + 1,
            description: req.body.description,
            amount: req.body.amount,
            done: false
        }
        data.push(newExpense)
        writeData(data)
        res.status(201).json(newExpense)
    }
    catch (err) {
        console.error("Error creating expense:", err)
        res.status(500).send("Internal Server Error")
    }
})
//უშუალოდ განახელბა
app.put("/expenses/:id", (req, res) => {
    try {
        const data = readData()
        const index = data.findIndex((e) => e.id == req.params.id)
        if (index === -1) return res.status(404).send("not found")

        data[index] = { ...data[index], ...req.body }
        writeData(data)
        res.json(data[index])
    }
    catch (err) {
        console.error("Error updating expense:", err)
        res.status(500).send("Internal Server Error")
    }
})

console.log("leo")
app.delete("/expenses/:id", (req, res) => {
    try {
        const data = readData()
        const index = data.findIndex((e) => e.id == req.params.id)
        if (index === -1) return res.status(404).send("not found")
        const newData = data.filter((e) => e.id != req.params.id)

        const secretHeader = req.headers['secret']
        if (secretHeader !== "random123") {
            console.log("Invalid secret header:", secretHeader);
            return res.status(403).send("Forbidden: invalid secret")
        }


        writeData(newData)
        res.send("deleted")
    }
    catch (err) {
        console.error("Error deleating expense:", err)
        res.status(500).send("Internal Server Error")
    }
})//არ ვიცი delete ვერ ავამუშავე იმენა ვეტანჯე გპტს ვუგდე ათასი რაღაცა ვნახე ვცადე ვერ ავამუშავე უეჭველი 
//ერთი პატარა fix აქ და ვერ ვპოულობ :) ვსოო წესით ეგაა 



app.listen(3000, () => { console.log("server running on http://localhost:3000") })

// კაი ვიწვალე მარა წესით ყველაფერი სწორედ არის 
