import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temporary')
    },
    filename: function (req, file, cb) {
     
      cb(null, file.originalname)
      console.log(file, "fileDetails")
    }
  })
  
  export const upload = multer({ storage })