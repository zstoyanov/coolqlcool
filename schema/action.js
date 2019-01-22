const graphql = require('graphql');
const $ = require('cheerio');
const _ = require('underscore');
const { execSync } = require('child_process');
const element = require('./element');

const {
  GraphQLString
} = graphql;

const sysexec = async (cmd) => {
  const stdout = await execSync(cmd);
  return stdout;
}

const commands = {
  ip: {
    type: GraphQLString,
    description: 'Get current ip by calling http://checkip.amazonaws.com',
    resolve: () => {
      return sysexec('curl --socks5 127.0.0.1:9050 http://checkip.amazonaws.com');
    }
  },
  iprenew: {
    type: GraphQLString,
    description: 'Request new host ip',
    resolve: () => {
      return sysexec("printf 'AUTHENTICATE \"privacy1\"\r\nSIGNAL NEWNYM\r\n' | nc 127.0.0.1 9051");
    }
  }
};

module.exports = commands