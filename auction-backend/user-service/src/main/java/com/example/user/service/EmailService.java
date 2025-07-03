package com.example.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Manually created constructor
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendAccountVerificationEmail(String email, String verificationToken) {
        String verificationUrl = baseUrl + "/auth/verify-account?token=" + verificationToken + "&email=" + email;

        String subject = "Verify Your Account";
        String content = String.format(
                """
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">Account Verification</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering. Please click the button below to verify your account:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Verify Account
                        </a>
                    </div>
                    <p>This link will expire in 24 hours.</p>
                    <p>Please do not share this link with anyone.</p>
                    <p>Best regards,<br>Your Support Team</p>
                </div>
                """, verificationUrl);

        sendEmail(email, subject, content);
    }

    public void sendLoginOtp(String email, String otp) {
        String subject = "Your Login OTP Code";
        String content = String.format(
                """
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">Login OTP Code</h2>
                    <p>Hello,</p>
                    <p>Below is your OTP code for logging into your account:</p>
                    <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        %s
                    </div>
                    <p>This code will expire in 5 minutes.</p>
                    <p>Please do not share this code with anyone.</p>
                    <p>Best regards,<br>Your Support Team</p>
                </div>
                """, otp);

        sendEmail(email, subject, content);
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        String resetUrl = baseUrl + "/auth/reset-password?token=" + resetToken + "&email=" + email;

        String subject = "Password Reset Request";
        String content = String.format(
                """
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">Reset Your Password</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset the password for your account. Please click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #4285F4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you did not request a password reset, please ignore this email or contact us if you have any questions.</p>
                    <p>Best regards,<br>Your Support Team</p>
                </div>
                """, resetUrl);

        sendEmail(email, subject, content);
    }

    public void sendAuctionWinEmail(String email, String auctionTitle, String auctionSlug, String imageUrl, double finalPrice) {
        System.out.println("📬 EmailService.sendAuctionWinEmail called");
        System.out.println("📧 Email: " + email);
        System.out.println("🏆 Title: " + auctionTitle);
        System.out.println("💰 Price: " + finalPrice);

        String auctionUrl = frontendUrl + "/auctions/" + auctionSlug;
        String subject = "🎉 Congratulations! You Won the Auction";

        String content = String.format("""
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #2E7D32;">Congratulations on Your Win!</h2>
            <p>Hello,</p>
            <p>You have won the auction for the following item:</p>
            <div style="text-align: center; margin: 20px 0;">
                <img src="%s" alt="Auction Image" style="max-width: 100%%; border-radius: 5px; border: 1px solid #ccc;" />
                <h3 style="margin-top: 15px; color: #333;">%s</h3>
                <p style="font-size: 18px;">Winning Bid: <strong>%.2f VND</strong></p>
                <a href="%s" style="background-color: #4CAF50; color: white; padding: 10px 18px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px;">
                    View Auction Details
                </a>
            </div>
            <p>Please complete the payment within the specified time to secure your item.</p>
            <p>Best regards,<br>Your Support Team</p>
        </div>
        """, imageUrl, auctionTitle, finalPrice, auctionUrl);

        try {
            sendEmail(email, subject, content);
            System.out.println("✅ Email sent successfully!");
        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

}