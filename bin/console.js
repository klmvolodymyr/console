#!/usr/bin/env node
const glob = require('glob');
const yargs = require('yargs');
const logger = require('vklymniuk-logger');


let pwd = process.env.PWD || process.cwd();
let projectDir = pwd + '/src/commands/*.js';
let nodeModules = pwd + '/node_modules/vklymniuk-*/lib/commands/*.js';
let run = false;

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at: Promise', promise, 'reason:', reason);
  process.exit(1);
});

//find and create commands
findCommands([projectDir, nodeModules])
  .then((commands) => {
    registerCommands(commands);
  });

/**
 * @param {string[]} dirs
 * @returns {Promise<*>}
 */
function findCommands(dirs) {
  let commands = [];
  dirs.forEach((dir) => {
    glob.sync(dir).forEach((file) => {
      commands.push(file);
    })
  });

  return Promise.resolve(commands);
}

/**
 * @param {string[]} files
 */
function registerCommands(files) {
  files.map((file) => {
    let command = require(file);
    createCommand(command, file)
  });


  yargs.scriptName("vklymniuk-console")
  yargs.usage('Usage: $0 <command> [options]');
  yargs.demandCommand().help().argv;

  if (!run) {
    logger.error('No such command found. Run dt-console --help to see the list of commands.');
    process.exit(1);
  }
}

/**
 * @param {Object} module
 * @param {string} scriptFile
 */
function createCommand(module, scriptFile) {
  if (typeof module.metadata !== 'object' || typeof module.run !== 'function') {
    logger.error(`Command in ${scriptFile} does not have metadata or run exports.`);
    return;
  }

  yargs.command({
    command: module.metadata.name,
    desc: module.metadata.description,
    builder: module.metadata.args || {},
    handler: (argv) => (run = true) && runCommand(module.run, {
      name: module.metadata.name,
      argv
    })
  });
}

/**
 * @param {Function} run
 * @param {Object} argv
 * @param {string} name
 * @returns {Promise<void>}
 */
async function runCommand(run, {argv, name}) {
  logger.info(`Running ${name}...`);

  try {
    await run(argv);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }

  logger.info(`Command ${name} is complete.`);
  process.exit(0);
}