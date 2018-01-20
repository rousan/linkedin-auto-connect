const login = require('./login');
const peoples = require('./peoples');

function start(email, password) {
  login.sessionCookies(email, password)
    .then(cookies => peoples.fetch(cookies))
    .then((ppls) => {
      console.log(ppls);
    })
    .catch((err) => {
      if (err.response) {
        const statusCode = err.response.status;
        if (statusCode === 401 || statusCode === 403) {
          console.error('Error: inacorrect authentication');
        } else {
          console.log(`Error: ${err.message}`);
        }
      } else if (err.request) {
        console.log('Error: Could not connect to the LinkedIn server');
      } else {
        console.log(`Error: ${err.message}`);
      }
    });
}

module.exports = { start };
