// Import from mongo
import * as mongodb from "mongodb"

// Import from employee
import { Employee } from "./employee"

// Create collecitons
export const collections: {
    employees?: mongodb.Collection<Employee>
} = {}

// Connect to database function
export async function connectToDatabase(uri: string) {
    // Setup client
    const client = new mongodb.MongoClient(uri)

    // Connect to client
    await client.connect()

    // setup variable for db
    const db = client.db("EmployeeManagement")

    // ??
    await applySchemaValidation(db)

    // Setup collection of employees
    const employeesCollection = db.collection<Employee>("employees")

    collections.employees = employeesCollection
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way

// Function for applySchemaValidation
async function applySchemaValidation(db: mongodb.Db) {
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "position", "level"],
            additionalProperties: false,
            properties: {
                _id: {},
                name: {
                    bsonType: "string",
                    description: "'name' is required and is a string",
                },
                position: {
                    bsonType: "string",
                    description: "'position' is required and is a string",
                    minLength: 5
                },
                level: {
                    bsonType: "string",
                    description: "'level' is required and is one of 'junior', 'mid', or 'senior'",
                    enum: ["junior", "mid", "senior"],
                },
            },
        },
    }

    // Try applying the modification to the collection, if the collection doesn't exist, create it
    await db.command({
        colMod: "employees",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("employees", {validator: jsonSchema})
        }
    })
}