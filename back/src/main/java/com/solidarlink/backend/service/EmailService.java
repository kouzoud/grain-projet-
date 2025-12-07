package com.solidarlink.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Service d'envoi d'emails pour SolidarLink.
 * Utilise @Async pour ne pas bloquer l'interface utilisateur (Fire and Forget).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name:SolidarLink}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Envoie un email de confirmation de validation de compte.
     * Cette méthode est asynchrone pour ne pas bloquer l'interface admin.
     *
     * @param toEmail   L'adresse email du destinataire
     * @param firstName Le prénom de l'utilisateur
     * @param role      Le rôle de l'utilisateur (CITOYEN ou BENEVOLE)
     */
    @Async
    public void sendAccountValidatedEmail(String toEmail, String firstName, String role) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Votre compte SolidarLink a été validé !");

            String roleDisplay = formatRole(role);
            String htmlContent = buildValidationEmailTemplate(firstName, roleDisplay);

            helper.setText(htmlContent, true); // true = HTML content

            mailSender.send(message);
            log.info("✅ Email de validation envoyé avec succès à : {}", toEmail);

        } catch (MessagingException e) {
            log.error("❌ Erreur lors de l'envoi de l'email à {} : {}", toEmail, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur inattendue lors de l'envoi de l'email à {} : {}", toEmail, e.getMessage());
        }
    }

    /**
     * Formate le rôle pour l'affichage dans l'email.
     */
    private String formatRole(String role) {
        return switch (role.toUpperCase()) {
            case "CITOYEN" -> "Citoyen";
            case "BENEVOLE" -> "Bénévole";
            case "ADMIN" -> "Administrateur";
            default -> role;
        };
    }

    /**
     * Construit le template HTML de l'email de validation.
     */
    private String buildValidationEmailTemplate(String firstName, String role) {
        return """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #06b6d4 0%%, #8b5cf6 100%%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
                            🎉 Félicitations %s !
                        </h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Nous avons le plaisir de vous informer que votre compte <strong style="color: #06b6d4;">%s</strong> 
                            sur <strong>SolidarLink</strong> a été validé par nos administrateurs.
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #f0fdfa 0%%, #f5f3ff 100%%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #06b6d4;">
                            <p style="color: #0f172a; font-size: 15px; margin: 0; line-height: 1.6;">
                                ✅ Vous pouvez désormais vous connecter et commencer à agir pour la solidarité !
                            </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="%s/login" 
                               style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%%, #8b5cf6 100%%); 
                                      color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; 
                                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);">
                                Se connecter maintenant →
                            </a>
                        </div>
                        
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                            Merci de faire partie de la communauté SolidarLink. Ensemble, nous pouvons faire la différence !
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="text-align: center; padding: 24px; color: #94a3b8; font-size: 12px;">
                        <p style="margin: 0;">© 2025 SolidarLink - Plateforme Humanitaire</p>
                        <p style="margin: 8px 0 0 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, role, frontendUrl);
    }

    /**
     * Envoie un email de bienvenue lors de l'inscription (optionnel).
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Bienvenue sur SolidarLink ! 🤝");

            String htmlContent = """
                <!DOCTYPE html>
                <html lang="fr">
                <body style="font-family: 'Segoe UI', sans-serif; background-color: #f8fafc; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="color: #0f172a; margin-bottom: 20px;">Bienvenue %s ! 👋</h1>
                        <p style="color: #475569; line-height: 1.6;">
                            Merci de vous être inscrit sur <strong>SolidarLink</strong>.
                        </p>
                        <p style="color: #475569; line-height: 1.6;">
                            Votre demande d'inscription est en cours de vérification par nos administrateurs. 
                            Vous recevrez un email de confirmation dès que votre compte sera validé.
                        </p>
                        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                            L'équipe SolidarLink
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(firstName);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Email de bienvenue envoyé à : {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'envoi de l'email de bienvenue à {} : {}", toEmail, e.getMessage());
        }
    }
}
