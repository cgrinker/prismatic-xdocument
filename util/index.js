const { request } = require('graphql-request');
const program = require('commander');
const fs = require('fs');

const query = `
mutation Test($name: String! $body: String!) {
  document(name: $name body: $body) {
    id
  }
}
`

program
  .command('doc <document>')
  .action(function (document, cmd) {
    request('http://localhost:4000', query, {
      name: document,
      body: fs.readFileSync(document).toString()
    }).then(data => console.log(data))
  })

program.parse(process.argv)