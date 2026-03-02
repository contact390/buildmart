const db = require('./db');

function inspect() {
  db.query("SHOW CREATE TABLE products", (err, rows) => {
    if (err) {
      console.error('SHOW CREATE TABLE error:', err);
    } else {
      console.log('\nSHOW CREATE TABLE products:');
      console.log(rows[0]['Create Table']);
    }

    db.query('DESCRIBE products', (err2, cols) => {
      if (err2) {
        console.error('DESCRIBE error:', err2);
      } else {
        console.log('\nDESCRIBE products:');
        console.table(cols);
      }
      db.end();
    });
  });
}

inspect();
