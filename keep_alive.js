const express = require('express')
const app = express();
const port = (
    Number(
        require("./config.json").port
    ) 
     ? 
     (
      require("./config.json").port < 65535 
       ? 
      (
         require("./config.json").port == 0
         ?
         3000
         :
         require("./config.json").port
      ) 
      : 3000) 
    : 3000)

app.get('/', (req, res) => {
  res.send(`
  Please connect me into a hosting website to enable 24/7 hosting.
  Contact: Dxkhung#2006
  `)
});

app.listen(port, () =>{ 
    console.log(require("colors").green(`- Started web server with port ${port}!`));
});
