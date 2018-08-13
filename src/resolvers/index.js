var convert = require('xml-js');

function attributesFor(e) {
  return Object.keys(e.attributes || {}).map((f, i) => {
    return {
      name: f,
      value: e.attributes[f]
    };
  })
}

function matchAttr(e, matchAttribute) {
  if(!matchAttribute) return true;

  if(e.name === matchAttribute.name && !matchAttribute.value) return true;

  else return e.value === matchAttribute.value;
}

function matchElement(e, name, matchAttribute) {
  if(!name && !matchAttribute) return true;

  if(name && e.name !== name) return false;

  if(matchAttribute) {
    if(e.attributes.find((k) => {
      return matchAttr(k, matchAttribute)
    })) return true;
    else
      return false;
  }

  return true
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
    attributes(parent, {matchAttribute, backtrack}, ctx, info) {
      const res = (!parent.attributes) ? null : parent.attributes.filter((e, i) => {
          return matchAttr(e, matchAttribute)
        })
      
      if(backtrack === "EXISTENTIAL" && res.length === 0) return [{name: "cgr:DEAD_PATH", value:true}]
      else if(backtrack === "UNIVERSAL" && res.length !== parent.attributes.length) return [{name: "cgr:DEAD_PATH", value:true}]
      else if(backtrack === "NEXISTENTIAL" && res.length !== 0)  return [{name: "cgr:DEAD_PATH", value:true}]
      else if(backtrack === "NUNIVERSAL" && res.length === parent.attributes.length)  return [{name: "cgr:DEAD_PATH", value:true}]

      return res;
    },
    attribute(parent, {matchAttribute}, ctx, info) {
      return parent.attributes.filter((e, i) => {
          return matchAttr(e, matchAttribute)
        })[0]
    },

    elements(parent, {name, matchAttribute, backtrack}, context, info) {
      const res = (!parent.elements) ? []: parent.elements.filter((e, i) => {
          return matchElement(e, name, matchAttribute)
      })
      if(backtrack === "EXISTENTIAL" && res.length === 0) return [{name: "cgr:DEAD_PATH", attributes:[], elements:[]}]
      else if(backtrack === "UNIVERSAL" && res.length !== parent.attributes.length) return [{name: "cgr:DEAD_PATH", attributes:[], elements:[]}]
      else if(backtrack === "NEXISTENTIAL" && res.length !== 0)  return [{name: "cgr:DEAD_PATH", attributes:[], elements:[]}]
      else if(backtrack === "NUNIVERSAL" && res.length === parent.attributes.length)  return [{name: "cgr:DEAD_PATH", attributes:[], elements:[]}]

      return res;
    },
    element(parent, {name, matchAttribute}, context, info) {
      return parent.elements.filter((e, i) => {
          return matchElement(e, name, matchAttribute)
        })[0]
    },
  },
  XDocument: {
    attributes(parent, {matchAttribute}, ctx, info) {
      return (!parent.attributes) ? [] : parent.attributes.filter((e, i) => {
          return matchAttr(e, matchAttribute)
        })
    },
    attribute(parent, {matchAttribute}, ctx, info) {
      return parent.attributes.filter((e, i) => {
          return matchAttr(e, matchAttribute)
        })[0]
    },

    elements(parent, {name, matchAttribute}, ctx, info) {
      return parent.elements.filter((e, i) => {
          return matchElement(e, name, matchAttribute)
        })
    },
    element(parent, {name, matchAttribute}, ctx, info) {
      return parent.elements.filter((e, i) => {
          return matchElement(e, name, matchAttribute)
        })[0]
    },
  },
  Query: {
    documents: async (_, {search}, ctx, info) => {
      return await ctx.db.query.xDocuments({where: {name_contains: search}}, info)
    },
    document: async (_, {id}, ctx, info) => {
      if(id) {
        return await ctx.db.query.xDocument({where: {id}}, info)
      }
    },
    elements: async (_, {name, matchAttribute}, ctx, info) => {
      const res = await ctx.db.query.xElements({where: {
        name: name,
        attributes_some: {
          name: (matchAttribute) ? matchAttribute.name: undefined,
          value: (matchAttribute) ?  matchAttribute.value: undefined
        }
      }}, info)

      return res;
    },
    element: (_, {id}, ctx, info) => {
      return ctx.db.query.xElement({where: {id}}, info)
    }
  },
  Mutation: {
    document: async (_, {name, body}, ctx, info) => {
      let document_
      try {
       document_ = convert.xml2js(body, {compact: false, spaces: 4});
      } catch (e) {
        throw "Parse Error"
      } finally {

      }

      const data = {
        data: {
          name,
          attributes: {
            create: attributesFor(document_.declaration || {})
          },
          elements: {
            create: document_.elements.map((e, i) => {
              return elementFor(e);
            })
          }
        }
      }
      return await ctx.db.mutation.createXDocument(data, info)

    },
  }
}

module.exports = resolvers;