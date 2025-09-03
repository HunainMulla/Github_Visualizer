const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const dotenv = require('dotenv')
const axios = require('axios')  // Add this line
const jwt = require('jsonwebtoken')
dotenv.config()

app.use(cors())
app.use(express.json())

let access_token = "" 


app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello World!", access_token })
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

        access_token = response.data.access_token;
        console.log("Access token on backend:", access_token)
        
        if (!access_token) {
            return res.status(400).json({ message: "Failed to get access token", data: response.data })
        }

        const jwt_token = jwt.sign({ access_token }, process.env.JWT_SECRET, { expiresIn: '1h' })
        console.log("JWT token on backend:", jwt_token)
        res.status(200).json({ access_token,jwt_token })
    } catch (error) {
        console.error("Error in /auth:", error.response?.data || error.message)
        res.status(500).json({ 
            message: "Error getting access token",
            error: error.response?.data || error.message 
        })
    }
})


// app.get('/events', async (req, res) => {
//     try {
//       const jwt_token = req.headers.authorization?.split(' ')[1];
//       if (!jwt_token) return res.status(401).json({ message: "JWT missing" });
  
//       const decoded = jwt.verify(jwt_token, process.env.JWT_SECRET);
//       if (!decoded?.access_token) return res.status(401).json({ message: "Access token missing" });
  
//       // Fetch events for authenticated user (includes private events)
//       const response = await axios.get('https://api.github.com/users/events/public', {
//         headers: {
//           'Authorization': `token ${decoded.access_token}`,
//           'Accept': 'application/vnd.github+json'
//         }
//       });
  
//       res.status(200).json(response.data);
//     } catch (error) {
//       console.error("Error fetching private events:", error.response?.data || error.message);
//       res.status(500).json({ message: "Failed to fetch events" });
//     }
//   });
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})