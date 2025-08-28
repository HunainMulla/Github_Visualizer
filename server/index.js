const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const dotenv = require('dotenv')
const axios = require('axios')  // Add this line

dotenv.config()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello World!" })
})

app.post('/auth', async (req, res) => {
    try {
        const { code } = req.body;  
        console.log("Code received on backend:", code)

        if (!code) {
            return res.status(400).json({ message: "No code provided" })
        }

        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code
        }, {
            headers: {
                'Accept': 'application/json'
            }
        })

        const access_token = response.data.access_token;
        console.log("Access token on backend:", access_token)
        
        if (!access_token) {
            return res.status(400).json({ message: "Failed to get access token", data: response.data })
        }

        res.status(200).json({ access_token })
    } catch (error) {
        console.error("Error in /auth:", error.response?.data || error.message)
        res.status(500).json({ 
            message: "Error getting access token",
            error: error.response?.data || error.message 
        })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})