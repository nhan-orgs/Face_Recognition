const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const fs = require('fs')

require('dotenv').config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', express.static(__dirname + '/load_face'))
app.use('/new', express.static(__dirname + '/save_face'))
app.set('view cache', false)

app.post('/save', async (req, res) => {
    const data = req.body.data
    if (!data) {
        res.status(400).send('Lacking of data')
    }
    try {
        fs.writeFileSync('load_face/face_descriptors.json', data)
        res.status(201).send('Succeeded')
    } catch (error) {
        console.log('save data error: ', error)
        res.status(500).send('Internal server error')
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Server listen on port: ${process.env.PORT}`)
})
