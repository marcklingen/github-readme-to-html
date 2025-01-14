#!/usr/bin/env node

const showdown = require('showdown');
const fs = require('fs-extra');
const { program } = require('commander');

const distDir = './dist';

const cssFile = __dirname + '/style.css'; //inside our module

program
  .option(
    '-i, --input <filename>',
    'The input readme/markdown file',
    'README.md'
  )
  .option('-o, --output <filename>', 'The output HTML file', 'index.html')
  .option('-t, --title <title>', 'The page title', 'Read Me');

program.parse(process.argv);
const options = program.opts();

const readmeFile = './' + options.input;
const pageTitle = options.title;
const outputFile = distDir + '/' + options.output;
const assetsDirSource = './assets/';
const assetsDirTarget = distDir + '/assets';

const converter = new showdown.Converter({
  ghCompatibleHeaderId: true,
  simpleLineBreaks: true,
  ghMentions: true,
  tables: true,
  emoji: true
});

converter.setFlavor('github');

fs.readFile(cssFile, 'utf-8', (err, cssText) => {
  if (err) {
    console.error('failed to read', cssFile);
    throw err;
  }

  fs.readFile(readmeFile, 'utf-8', (err, readmetext) => {
    if (err) {
      console.error('failed to read', readmeFile);
      throw err;
    }

    const preContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageTitle}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
          ${cssText}
          </style>
        </head>
        <body>
          <main>
      `;

    const postContent = `
          </main>
        </body>
      </html>`;

    const html = preContent + converter.makeHtml(readmetext) + postContent;

    fs.ensureDirSync(distDir);

    fs.writeFile(outputFile, html, { flag: 'w' }, function (err) {
      if (err) {
        console.log('Failed, could not open', outputFile, err);
      } else {
        console.log('Done, saved to ' + outputFile);

        if (fs.existsSync(assetsDirSource)) {
          fs.copySync(assetsDirSource, assetsDirTarget);
          console.log('assets copied to ' + assetsDirTarget);
        }
      }
    });
  });
});
