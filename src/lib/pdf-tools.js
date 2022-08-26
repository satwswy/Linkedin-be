import PdfPrinter from "pdfmake"
import imageToBase64 from 'image-to-base64'
import { response } from "express"

export const getPDFReadableStream = async user => {
  console.log("this is user:",user)
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
}

const printer = new PdfPrinter(fonts)


const response = await imageToBase64(user.image)


const docDefinition = {
   
    content: [
      {text : user.name + " " + user.surname , fontSize: 20, style: 'header'},
      {text : "location  "+ user.area, style: 'normal', margin: [0,5]},
      {image: 'profilePic',
    fit:[150,150]},
    {text: "BIO", alignment: 'center', style:'subheader', margin: [0,5]},
    {text: user.bio, alignment: 'center', margin: [0,5]},
    ],  

  images:{profilePic: `data:image/png;base64,${response}`,
   },
styles: {
  header: {
    fontSize: 18,
    bold: true,
  },
  subheader: {
    fontSize: 15,
    bold: true,
  },
  normal:{
    fontsize: 12,
  }
},
}

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}

/*import PdfPrinter from "pdfmake"


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

*/