const graphql = require('graphql');
const $ = require('cheerio');
const _ = require('underscore');

const {
  GraphQLNonNull,
  GraphQLString
} = graphql;
const cssSelector = {
  type: GraphQLString,
  description:
    'A [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors).',
}

const recursiveArgs = {
  selector: cssSelector,
};

const resolve = (root, args) => root(args.selector);
const querySelect = (root, {selector}) => {
  if (selector) {
    return query(root, {selector});
  }
  return $(root);
}

const query = (root, args) => {
  const html = $(root).html();
  // Need XML Mode true so that all HTML works.
  // e.g. Without it would not pase <tr><td>BLah</td></td> correctly
  return $.load(html, {
    xmlMode: true
  })(args.selector);
}

const element = new graphql.GraphQLObjectType({
  name: 'Element',
  fields: () => ({
    select: {
      args: recursiveArgs,
      description: 'Get an element from inside of this element',
      resolve: (root, args) => query(root, args),
      type: element,
    },
    selectAll: {
      args: recursiveArgs,
      description: 'Get an element from inside of this element',
      resolve: (root, args) => query(root, args),
      type: new graphql.GraphQLList(element),
    },
    count: {
      args: recursiveArgs,
      description: 'Get a count of provided elements',
      resolve: (root, args) => query(root, args).length,
      type: graphql.GraphQLInt,
    },
    classList: {
      description: 'Get a list of the classes on the given element',
      resolve: root => $(root).attr('class').split(' '),
      type: new graphql.GraphQLList(GraphQLString),
    },
    class: {
      description: 'Get the class attribute on the given element',
        resolve: root => $(root).attr('class'),
        type: GraphQLString,
    },
    html: {
      description: 'The inner html of the element',
      resolve: root => {
        console.log(root.length);
        return $(root).html()
      },
      type: GraphQLString
    },
    text: {
      description: 'The inner text of the element',
      args: recursiveArgs,
      resolve: (root, args) => querySelect(root, args).text(),  
      type: GraphQLString,
    },
    href: {
      description: 'Get the href of the element',
      resolve: root => $(root).attr('href'),
      type: GraphQLString,
    },
    src: {
      description: 'Get the src of the element',
      resolve: root => $(root).attr('src'),
      type: GraphQLString,
    },
    /**
     * Looks for data attribute on element,
     * if the `name` argument is provided
     * then grab the specific `data-${name}`
     * attribute.
     */
    data: {
      args: {
        selector: cssSelector,
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      description: 'Get the data attribute for element, if name is provided will grab that specific data attribute',
      resolve: (root, args) => {
        if (args.name && args.name.trim() !== '') {
          return querySelect(root, args).data(args.name);
        }
        return querySelect(root, args).attr('data');
      },
      type: GraphQLString,
    },
    attr: {
      args: {
        selector: cssSelector,
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      description: 'Get an attribute off of the element',
      resolve: (root, args) => querySelect(root, args).attr(args.name),
      type: GraphQLString,
    },
  }),
});

module.exports = {
  args: recursiveArgs,
  resolve,
  type: element,
};
