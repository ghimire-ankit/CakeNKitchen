const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => {
    console.log('HASH:', hash);
    return bcrypt.compare('admin123', hash);
}).then(res => {
    console.log('COMPARE:', res);
});
