const { Pool } = require('pg');
const pool = new Pool();

module.exports = {
    getUsers: async () => {
        try {
            const { rows } = await pool.query('SELECT * FROM dummy');
            return rows;
        }
        catch (err) {
            throw err;
        }
    }
}