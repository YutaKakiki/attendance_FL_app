const ejs = require('ejs');
const fs = require('fs');

ejs.renderFile('home.ejs', {}, (err, str) => {
  if (err) throw err;
  fs.writeFileSync('index.html', str);
});
