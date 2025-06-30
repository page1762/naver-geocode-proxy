require("dotenv").config(); // .env 파일 또는 Render 환경변수 불러오기

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const NCP_CLIENT_ID = process.env.NCP_CLIENT_ID;
const NCP_CLIENT_SECRET = process.env.NCP_CLIENT_SECRET;

// /geocode?query=주소 형태의 요청 처리
app.get("/geocode", async (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).json({ error: "Missing 'query' parameter" });
    }

    try {
        const response = await axios.get("https://maps.apigw.ntruss.com/map-geocode/v2", {
            headers: {
                "X-NCP-APIGW-API-KEY-ID": NCP_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": NCP_CLIENT_SECRET
            },
            params: {
                query: query
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("네이버 API 요청 실패:", error.message);
        res.status(500).json({ error: "Naver API request failed" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Proxy server is running on http://localhost:${PORT}`);
});
