package com.example.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

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

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendAccountVerificationEmail(String email, String verificationToken) {
        String verificationUrl = baseUrl + "/auth/verify-account?token=" + verificationToken + "&email=" + email;

        String subject = "Xác thực tài khoản của bạn";
        String content = String.format(
                """
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">Xác thực tài khoản</h2>
                    <p>Xin chào,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng click vào nút bên dưới để xác thực tài khoản:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Xác thực tài khoản
                        </a>
                    </div>
                    <p>Hoặc bạn có thể copy đường link sau vào trình duyệt:</p>
                    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px;">%s</p>
                    <p>Đường link này sẽ hết hạn sau 24 giờ.</p>
                    <p>Xin vui lòng không chia sẻ đường link này với bất kỳ ai.</p>
                    <p>Trân trọng,<br>Đội ngũ hỗ trợ của chúng tôi</p>
                </div>
                """, verificationUrl, verificationUrl);

        sendEmail(email, subject, content);
    }

    public void sendLoginOtp(String email, String otp) {
        String subject = "Mã OTP đăng nhập của bạn";
        String content =     String.format(
                """
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">Mã OTP đăng nhập</h2>
                    <p>Xin chào,</p>
                    <p>Dưới đây là mã OTP để đăng nhập vào tài khoản của bạn:</p>
                    <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        %s
                    </div>
                    <p>Mã này sẽ hết hạn sau 5 phút.</p>
                    <p>Xin vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                    <p>Trân trọng,<br>Đội ngũ hỗ trợ của chúng tôi</p>
                </div>
                """, otp);

        sendEmail(email, subject, content);
    }
}