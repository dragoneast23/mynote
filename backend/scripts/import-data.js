const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data-migration.json', 'utf-8'));

let sql = '';

sql += '-- Import Users\n';
data.users.forEach(user => {
  sql += `INSERT OR IGNORE INTO users (id, username, password, openid, nickname, register_time, token, token_expire) VALUES 
    (${user.id}, '${user.username || ''}', '${user.password || ''}', '${user.openid || ''}', '${user.nickname || ''}', '${user.register_time || ''}', NULL, NULL);\n`;
});

sql += '\n-- Import Registers\n';
data.registers.forEach(reg => {
  sql += `INSERT OR IGNORE INTO registers (registercode) VALUES ('${reg.registercode}');\n`;
});

sql += '\n-- Import Notes\n';
data.notes.forEach(note => {
  sql += `INSERT INTO notes (user_id, title, content, create_time, update_time, word_count) VALUES 
    (${note.user_id}, '${(note.title || '').replace(/'/g, "\\'")}', '${(note.content || '').replace(/'/g, "\\'")}', '${note.create_time || ''}', '${note.update_time || ''}', ${note.word_count || 0});\n`;
});

fs.writeFileSync('import-data.sql', sql);
console.log('SQL file generated: import-data.sql');
