// import dotenv
import * as dotenv from "dotenv"

// import express
import express from "express"

// import cors
import cors from "cors"

// import from database
import { connectToDatabase } from "./database"

// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config()

// Setup ATLAS URI
const { ATLAS_URI } = process.env

// Determine if ATLAS_URI exists
if (!ATLAS_URI) {
    console.error(
        "No ATLAS_URI enviroment variable has been defined or configured in config.env"
    )
    process.exit(1)
}

// Connect to the database
connectToDatabase(ATLAS_URI)
    .then(() => {
        // Create the express app
        const app = express()

        // Use CORS
        app.use(cors())

        // Start express server
        app.listen(5200, () => {
            console.log("Server running at http://localhost:5200...")
        })
    })
    .catch((error) => console.error(error))