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

const ifconfig = {
  type: GraphQLString,
  description: 'Execute ifconfig command',
  resolve: () => {
    return sysexec('ifconfig');
  },
};

module.exports = {
  ifconfig: ifconfig
}