const db = require('./db');

function desc(t, cb){
  db.query('DESCRIBE ' + t, (err, rows) => {
    if (err) { console.error('DESCRIBE', t, 'error', err); cb(); return; }
    console.log('\nDESCRIBE', t);
    console.table(rows.map(r=>({Field:r.Field,Type:r.Type,Null:r.Null,Default:r.Default,Extra:r.Extra}))); cb();
  });
}

desc('cart_items', ()=> desc('order_items', ()=> db.end()));
