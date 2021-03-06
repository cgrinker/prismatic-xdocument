const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const resolvers = require('./resolvers');
const  formatResponse = require('./backtrack');

console.log("This is the Prismatic-XDocument API server.")
const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_ENDPOINT,
      secret: process.env.PRISMA_SECRET
    }),
  }),
  
})
server.start({
  formatResponse,
}, () => console.log(`GraphQL server is running on http://localhost:3999`))
