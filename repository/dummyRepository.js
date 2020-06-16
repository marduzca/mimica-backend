const { Pool } = require('pg');
const pool = new Pool();

module.exports = {
    getUsers: async () => {
        try {
            console.log('Env variable: ' + process.env.PGHOST)
            const { rows } = await pool.query('SELECT * FROM dummy');
            console.log(rows);
            return rows;
        }
        catch (err) {
            throw err;
        }
    }
}