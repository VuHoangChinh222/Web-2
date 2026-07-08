import docx

doc = docx.Document("VuHoangChinh-2122110380.docx")

with open("docx_structure.txt", "w", encoding="utf-8") as f:
    f.write("--- DANH SÁCH CÁC TIÊU ĐỀ TRONG FILE DOCX ---\n")
    for i, para in enumerate(doc.paragraphs):
        # Check if paragraph has heading style or looks like a heading
        if para.style.name.startswith("Heading") or len(para.text) < 100 and para.text.strip().startswith(("Chương", "CHƯƠNG", "Phần", "PHẦN", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.")):
            f.write(f"Para {i} (Style: {para.style.name}): {para.text}\n")

print("Successfully written structure to docx_structure.txt")
