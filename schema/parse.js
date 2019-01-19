const graphql = require('graphql');
const cheerio = require('cheerio');
const nodeFetch = require('node-fetch');
const fetch = require('fetch-cookie')(nodeFetch)
const Nightmare = require('nightmare');

const element = require('./element');
const headers = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-US,en;q=0.9",
  "Dnt": "1",
  "Host": "www.httpbin.org",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
};

const site = new graphql.GraphQLObjectType({
  name: 'Site',
  fields: {
    select: {
      args: element.args,
      description: 'Grab a specific child element',
      resolve: element.resolve,
      type: element.type,
    },
    selectAll: {
      args: element.args,
      description: 'Grab all child elements of a tag',
      resolve: element.resolve,
      type: new graphql.GraphQLList(element.type),
    },
    count: {
      args: element.args,
      description: 'Get a count of provided elements',
      resolve: (root, args) => {
        const elems = root(args.elem);
        return elems.length;
      },
      type: graphql.GraphQLInt,
    },
  },
});

module.exports = {
  type: site,
  args: {
    url: {
      description: 'URL to grab information from.',
      type: graphql.GraphQLString,
    },
    html: {
      description: 'Passed in HTML to query off of, can use this when you already have the HTMl and just want to query off of it.',
      type: graphql.GraphQLString,
    },
    wait: {
      description: 'This will wait for a certain amount of time in milliseconds, only works with passing URL.',
      type: graphql.GraphQLInt,
    },
    waitForSelector: {
      description: `This will wait for a specific element to show on
      the page before starting to query, only works with passing URL.`,
      type: graphql.GraphQLString,
    },
    waitForFn: {
      description: `This will wait for an evaluated function to return true
      before starting to query, only works with passing URL.`,
      type: graphql.GraphQLString,
    },
  },
  resolve: async (root, args) => {
    if (args.html && args.html.trim() !== '') {
      return cheerio.load(args.html, {
        xmlMode: true
      });
    }

    if (args.url === undefined) {
      throw new Error('expected URL argument to be present');
    }

    // Use Nightmare to render the page and grab the document body when
    //  `waitForSelector`, `waitForFn, or `wait` exist
    if (args.waitForSelector !== undefined || args.wait !== undefined || args.waitForFn !== undefined) {
      const wait = args.waitForSelector || args.wait || Function(`try { return ${args.waitForFn} } catch(e) {}`);
      return Nightmare()
        .goto(args.url)
        .wait(wait)
        .evaluate(() => {
          return document.body.innerHTML;
        })
        .end()
        .then((body) => {
          return cheerio.load(body, {
            xmlMode: true
          });
        })
        .catch(function (error) {
          throw new Error('Nightmare parsing failed', error);
        });
    }

    return fetch(args.url, {headers: headers})
      .then(res => res.text())
      .then(body => cheerio.load(body, {
        xmlMode: true
      }));
  },
};
