const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");
const request = require("request")
const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

app.use(express.static('public'))
// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/test", async (req, res) => {
  // https://api.weixin.qq.com/cgi-bin/message/template/send
  request({
    method: 'POST',
    // url: 'http://api.weixin.qq.com/wxa/msg_sec_check?access_token=TOKEN',
    url: 'https://api.weixin.qq.com/cgi-bin/message/template/send', // 这里就是少了一个token
    body: JSON.stringify({
      touser: req.headers["x-wx-openid"], // 可以从请求的header中直接获取 req.headers['x-wx-openid']
      template_id: "NVA8GqQ8LnAqUHFKbXAJfJvElGbr9B3XOrV5rc8AwGE",
      data:{
          "keyword1":{
            "value":"巧克力1"
        },
        "keyword2":{
          "value":"巧克力"
      },
      }
    })
  },function (error, response) {
    console.log(error,response)
  })
  res.send({
    openid:"123:"+req.headers["x-wx-openid"],
    code:0,
    data:"123"
  })
});
// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
