const mysql = require('mysql2/promise');
const fs = require('fs');

async function main() {
  const dbConfig = {
    host: '47.94.83.80',
    port: 3306,
    user: 'root',
    password: 'wjl403224736',
    database: 'note'
  };

  const connection = await mysql.createConnection(dbConfig);
  
  console.log('Connected to MySQL database');

  const [users] = await connection.execute('SELECT * FROM users');
  console.log(`Found ${users.length} users`);

  const [registers] = await connection.execute('SELECT * FROM registers');
  console.log(`Found ${registers.length} register codes`);

  const allNotes = [];
  
  for (const user of users) {
    const tableName = `notes_${user.id}`;
    try {
      const [notes] = await connection.execute(`SELECT * FROM ${tableName}`);
      console.log(`User ${user.id}: ${notes.length} notes`);
      
      notes.forEach(note => {
        allNotes.push({
          user_id: user.id,
          title: note.title,
          content: note.content,
          create_time: note.create_time,
          update_time: note.update_time,
          word_count: note.word_count
        });
      });
    } catch (error) {
      console.log(`Table ${tableName} not found, skipping`);
    }
  }

  console.log(`Total notes: ${allNotes.length}`);

  const exportData = {
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      password: u.password,
      openid: u.openid,
      nickname: u.nickname,
      register_time: u.register_time,
      token: null,
      token_expire: null
    })),
    registers: registers.map(r => ({ registercode: r.registercode })),
    notes: allNotes
  };

  fs.writeFileSync('data-migration.json', JSON.stringify(exportData, null, 2));
  console.log('Data exported to data-migration.json');

  await connection.end();
  console.log('Migration script completed');
}

main().catch(console.error);
