// This is a MOCK mail sender.
// In a real application, you would use a library like Nodemailer
// and an email service (e.g., SendGrid, Mailgun, or your own SMTP server).

const mailSender = async (email, title, body) => {
  try {
    // Simulate sending an email by logging it to the console
    console.log("--- MOCK EMAIL ---");
    console.log(`To: ${email}`);
    console.log(`Subject: ${title}`);
    console.log("Body:");
    console.log(body);
    console.log("------------------");
    
    // In a real implementation, this would return info about the sent email
    return { success: true, message: "Mock email sent successfully" };
  } catch (error) {
    console.log(error.message);
    return { success: false, message: "Failed to send mock email" };
  }
};

export { mailSender };