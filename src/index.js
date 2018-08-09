const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
var convert = require('xml-js');


function attributesFor(e) {
  return Object.keys(e.attributes || {}).map((f, i) => {
    return {
      name: f,
      value: e.attributes[f]
    };
  })
}

function elementFor(e) {
  return {
    name: e.name || e.text,
    attributes: {
      create: attributesFor(e)
    },
    elements: (e.elements) ? { create: e.elements.map((f, j) => {return elementFor(f)})} : []
  }
}

const resolvers = {
  XElement: {
    attributes(parent, {search}, ctx, info) {
      return (!parent.attributes) ? [] : parent.attributes.filter((e, i) => {
          return e.name.match(search);
        })
    },
    attribute(parent, {name}, ctx, info) {
      return parent.attributes.filter((e, i) => {
          return e.name.match(search);
        })[0]
    },

    elements(parent, {search}, context, info) {
      return (!parent.elements) ? []: parent.elements.filter((e, i) => {
          return e.name.match(search);
        })
    },
    element(parent, {name}, context, info) {
      return parent.elements.filter((e, i) => {
          return e.name.match(search);
        })[0]
    },
  },
  XDocument: {
    attributes(parent, {search}, ctx, info) {
      return parent.attributes.filter((e, i) => {
          return e.name.match(search);
        })
    },
    attribute(parent, {name}, ctx, info) {
      return parent.attributes.filter((e, i) => {
          return e.name.match(search);
        })[0]
    },

    elements(parent, {search}, ctx, info) {
      return parent.elements.filter((e, i) => {
          return e.name.match(search);
        })
    },
    element(parent, {name}, ctx, info) {
      return parent.elements.filter((e, i) => {
          return e.name.match(search);
        })[0]
    },
  },
  Query: {
    documents: (_, {search}, ctx, info) => {
      return ctx.db.query.xDocuments({where: {name_contains: search}}, info)
    },
    document: (_, {id}, ctx, info) => {
      if(id) {
        return ctx.db.query.xDocument({where: {id}}, info)
      }
    },
    element: (_, {id}, ctx, info) => {
      return ctx.db.query.xElement({where: {id}}, info)
    }
  },
  Mutation: {
    document: async (_, {name, body}, ctx, info) => {

      const document_ = convert.xml2js(body, {compact: false, spaces: 4});
      const data = {
        data: {
          name,
          attributes: {
            create: attributesFor(document_.declaration)
          },
          elements: {
            create: document_.elements.map((e, i) => {
              return elementFor(e);
            })
          }
        }
      }
      console.log(JSON.stringify(data, null, 2));
      return await ctx.db.mutation.createXDocument(data, info)

    },
  }
}

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
    }),
  }),
})
server.start(() => console.log(`GraphQL server is running on http://localhost:4000`))
