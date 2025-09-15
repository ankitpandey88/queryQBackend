

require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Razorpay Config
// const razorpay = new Razorpay({
//     key_id: 'rzp_live_CW3A67eVfhqgaj', 
//     key_secret: 'abe9tGk6Tp68RV9Rd3vHN3MC' 
// });
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ➡️ Create Order
const createOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ success: false, message: 'Amount and currency are required' });
        }

        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ➡️ Verify Payment
const verifyPayment = (req, res) => {
    try {
        const { order_id, payment_id, signature } = req.body;

        const key_secret = 'abe9tGk6Tp68RV9Rd3vHN3MC'; // Replace with your key_secret

        // Generate HMAC SHA256 Signature
        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

        if (generated_signature === signature) {
            return res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
