const pool = require("../config/db");

// Store Booking Details
const BookingDetails = async (req, res) => {
    try {
        const {
            name,
            email,
            salonId,
            salonName,
            date,
            time,
            paymentMethod,
            totalAmount,
            services
        } = req.body;

        const query = `
            INSERT INTO bookings (name, email, salon_id, salon_name, date, time, payment_method, total_amount, services)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
        `;

        const values = [name, email, salonId, salonName, date, time, paymentMethod, totalAmount, JSON.stringify(services)];
        const { rows } = await pool.query(query, values);

        res.status(201).json({ message: "Booking successful", booking: rows[0] });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Fetch All Bookings
const getAllBookings = async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM bookings ORDER BY created_at DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Fetch Booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Fetch Bookings by Salon ID
const getBookingsBySalonId = async (req, res) => {
    try {
        const { salonId } = req.params;
        const { rows } = await pool.query("SELECT * FROM bookings WHERE salon_id = $1 ORDER BY date, time", [salonId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No bookings found for this salon" });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching bookings by salon ID:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete Booking
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await pool.query("DELETE FROM bookings WHERE id = $1", [id]);

        if (rowCount === 0) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const createDoctorBooking = async (req, res) => {
    try {
        const {
            name,
            email,
            doctorId,
            doctorName,
            date,
            time,
            paymentMethod,
            totalAmount,
            services
        } = req.body;

        const query = `
            INSERT INTO doctorbookings 
            (name, email, doctor_id, doctor_name, date, time, payment_method, total_amount, services)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;

        const values = [
            name,
            email,
            doctorId,
            doctorName,
            date,
            time,
            paymentMethod,
            totalAmount,
            JSON.stringify(services)
        ];

        const { rows } = await pool.query(query, values);

        res.status(201).json({ message: "Booking successful", booking: rows[0] });
    } catch (error) {
        console.error("Error creating doctor booking:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

const getBookingsByDoctorId = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const query = `
            SELECT * FROM doctorbookings WHERE doctor_id = $1 ORDER BY date, time;
        `;

        const { rows } = await pool.query(query, [doctorId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No bookings found for this doctor" });
        }

        res.status(200).json({ bookings: rows });
    } catch (error) {
        console.error("Error fetching doctor bookings:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { BookingDetails, getAllBookings, getBookingById, getBookingsBySalonId, deleteBooking, createDoctorBooking ,getBookingsByDoctorId };
