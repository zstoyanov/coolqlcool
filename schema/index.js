const graphql = require('graphql');

const parse = require('./parse');
const action = require('./action');

const {
  GraphQLString
} = graphql;

const schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      site: parse,
      ip: action.ip,
      iprenew: action.iprenew,
    },
  }),
  
});

module.exports = schema;
