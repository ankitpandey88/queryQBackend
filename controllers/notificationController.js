

const nodemailer = require("nodemailer");

const sendBookingEmail = async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🎉 QuirkyQ Booking Confirmation 🎉",
        html: `
            <div style="background: linear-gradient(to right, #111827, #6b21a8, #111827); padding: 40px; text-align: center; border-radius: 10px; box-shadow: 0px 10px 30px rgba(0,0,0,0.3);">
                <div style="background-color: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; color: white; font-family: Arial, sans-serif;">
                    <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🎊 Booking Confirmed! 🎊</h2>
                    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong style="color: #ffcc00;">${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Your booking has been successfully confirmed with <strong style="color: #ffcc00;">QuirkyQ</strong>!</p>
                    <p style="font-size: 16px; margin-bottom: 20px;">We are thrilled to have you with us. If you have any questions, feel free to reach out.</p>
                    
                    <a href="https://quirkyq.co.in" style="display: inline-block; background-color: #ffcc00; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; margin-top: 20px;">
                        Visit QuirkyQ
                    </a>

                    <p style="font-size: 14px; margin-top: 30px; opacity: 0.8;">Thank you for choosing <strong style="color: #ffcc00;">QuirkyQ</strong>! 🎉</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Booking confirmation email sent!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email" });
    }
};

module.exports = { sendBookingEmail };
