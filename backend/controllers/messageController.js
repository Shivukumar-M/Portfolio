const Message = require('../models/Message');

// Create a new message
const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  createMessage,
};