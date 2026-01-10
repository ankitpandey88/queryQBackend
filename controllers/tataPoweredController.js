const pool = require("../config/db");

const getLogin = async (req, res) => {
    try {
        const { employee_id, password } = req.body;

        // Validate input
        if (!employee_id || !password) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and password are required"
            });
        }

        // Query database
        const query = `
            SELECT employee_id, name, email 
            FROM employemaster 
            WHERE employee_id = $1 AND password = $2
        `;

        const result = await pool.query(query, [employee_id, password]);

        // Check user exists
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid employee ID or password"
            });
        }

        // Success
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    getLogin
};
