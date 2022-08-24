import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import mongoose from 'mongoose'
import { badRequestHandler, genericErrorHandler, notFoundHandler } from "./errorHandlers.js"
import usersRouter from './api/users/index.js'
import postsRouter from './api/posts/index.js'

const server = express()

const port = process.env.PORT || 3008

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]
server.use(cors({
    origin: (origin, corsNext) => {
       
        console.log("ORIGIN: ", origin)
  
        if (!origin || whitelist.indexOf(origin) !== -1) {
          
          corsNext(null, true)
        } else {
          
          corsNext(createHttpError(400, `Cors Error! Your origin ${origin} is not in the list!`))
        }
      },
}))
server.use(express.json())

server.use("/users", usersRouter)
server.use("/posts", postsRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION_URL)

mongoose.connection.on("connected", ()=>{
    console.log("Successfully conected to MongoDB!")
    server.listen(port,()=>{
        console.table(listEndpoints(server))
        console.log(`Server is running on port ${port}`)
    })
})