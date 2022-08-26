import PdfPrinter from "pdfmake"


export const getPDFReadableStream = user => {
  console.log("this is user:",user)
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  }

  const printer = new PdfPrinter(fonts)

  const tableContent = [
    ["NAME", "SURNAME","BIO","TITLE","EXPERIENCES","IMAGE"],
      [user.name, user.surname, user.bio, user.title, user.experiences[0]?.role || "no experience",user.image]
  ]

  console.log(tableContent)

  const docDefinition = {
   
    content: [
      {
        style: "tableExample",
        table: {
          body: tableContent,
        },
      },
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}