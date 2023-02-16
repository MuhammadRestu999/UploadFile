# UploadFile
This is a simple File Upload built using NodeJS and ExpressJS

# APIs
You can use the POST method to the api url from here to upload files<br>
<br>
<br>
curl:<br>
```bash
curl -F "files[]=@file.txt" https://example.com/upload # mine: http://rstu.my.id:5218/upload
```
<br>
axios(nodejs):<br>
```javascript
const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");

const url = "https://example.com/upload" // mine: http://rstu.my.id:5218/upload

async function upload(file) {
  const fd = new FormData();
  fd.append("files[]", fs.createReadStream(file));

  const { data } = await axios.post(url, fd, {
    headers: fd.getHeaders()
  });
  return data
};

upload("example.jpg").then(console.log);
```
