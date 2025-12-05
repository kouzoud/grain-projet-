package com.solidarlink.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.solidarlink.backend.entity.CasHumanitaire;
import com.solidarlink.backend.repository.CasHumanitaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final CasHumanitaireRepository casRepository;

    // Colors
    private static final Color COLOR_PRIMARY = new Color(17, 155, 209); // #119bd1
    private static final Color COLOR_SECONDARY = new Color(242, 242, 242); // #f2f2f2
    private static final Color COLOR_WHITE = Color.WHITE;

    public ByteArrayInputStream exportCasesToPdf() {
        List<CasHumanitaire> cases = casRepository.findAll();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 90, 36); // Top margin increased for header
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);

            // Add Header and Footer Event
            HeaderFooterPageEvent event = new HeaderFooterPageEvent();
            writer.setPageEvent(event);

            document.open();

            // Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            // ID=5%, Titre=20%, Catégorie=15%, Statut=15%, Dates=10%, Noms=15% (Approx
            // adjusted for 6 cols)
            // Columns: ID, Titre, Catégorie, Statut, Ville, Date
            table.setWidths(new float[] { 1, 4, 3, 3, 3, 2 });
            table.setSpacingBefore(10);

            // Table Header
            addTableHeader(table, "ID", "Titre", "Catégorie", "Statut", "Ville", "Date");

            // Table Data
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            boolean alternate = false;

            for (CasHumanitaire cas : cases) {
                addTableCell(table, String.valueOf(cas.getId()), alternate);
                addTableCell(table, cas.getTitre(), alternate);
                addTableCell(table, cas.getCategorie() != null ? cas.getCategorie().name() : "N/A", alternate);
                addTableCell(table, cas.getStatus() != null ? cas.getStatus().name() : "N/A", alternate);
                addTableCell(table, "N/A", alternate); // Ville placeholder
                addTableCell(table, cas.getCreatedAt() != null ? cas.getCreatedAt().format(formatter) : "N/A",
                        alternate);

                alternate = !alternate;
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(
                    new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, COLOR_WHITE)));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setBackgroundColor(COLOR_PRIMARY);
            cell.setPadding(5);
            cell.setBorderColor(Color.LIGHT_GRAY);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String data, boolean alternate) {
        PdfPCell cell = new PdfPCell(
                new Phrase(data != null ? data : "", FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        cell.setBorderColor(Color.LIGHT_GRAY);
        if (alternate) {
            cell.setBackgroundColor(COLOR_SECONDARY);
        }
        table.addCell(cell);
    }

    // CSV Export remains unchanged
    public ByteArrayInputStream exportCasesToCsv() {
        List<CasHumanitaire> cases = casRepository.findAll();
        StringBuilder csvContent = new StringBuilder();
        csvContent.append("ID,Titre,Description,Catégorie,Statut,Date\n");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (CasHumanitaire cas : cases) {
            csvContent.append(cas.getId()).append(",")
                    .append(escapeSpecialCharacters(cas.getTitre())).append(",")
                    .append(escapeSpecialCharacters(cas.getDescription())).append(",")
                    .append(cas.getCategorie()).append(",")
                    .append(cas.getStatus()).append(",")
                    .append(cas.getCreatedAt() != null ? cas.getCreatedAt().format(formatter) : "").append("\n");
        }

        return new ByteArrayInputStream(csvContent.toString().getBytes(StandardCharsets.UTF_8));
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null)
            return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    // Inner class for Header and Footer
    class HeaderFooterPageEvent extends PdfPageEventHelper {

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();

            // HEADER
            try {
                // Logo
                ClassPathResource imgFile = new ClassPathResource("static/images/logo.jpg");
                if (imgFile.exists()) {
                    Image logo = Image.getInstance(imgFile.getURL());
                    logo.scaleToFit(100, 50);
                    logo.setAbsolutePosition(document.left(), document.top() + 10);
                    cb.addImage(logo);
                }
            } catch (IOException | DocumentException e) {
                // Ignore if logo fails, just continue
                System.err.println("Logo not found or error loading: " + e.getMessage());
            }

            // Title and Date
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Rapport des Demandes Humanitaires",
                            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, COLOR_PRIMARY)),
                    document.right(), document.top() + 30, 0);

            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Généré le : " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                            FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY)),
                    document.right(), document.top() + 15, 0);

            // Separator Line
            cb.setLineWidth(1f);
            cb.setColorStroke(Color.LIGHT_GRAY);
            cb.moveTo(document.left(), document.top() + 5);
            cb.lineTo(document.right(), document.top() + 5);
            cb.stroke();

            // FOOTER
            float footerY = document.bottom() - 20;

            // Left Text
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("SolidarLink - Plateforme d'entraide",
                            FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY)),
                    document.left(), footerY, 0);

            // Right Page Number
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(),
                            FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY)),
                    document.right(), footerY, 0);
        }
    }
}
