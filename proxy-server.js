require("dotenv").config(); // .env 파일에서 키 불러오기
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const NCP_CLIENT_ID = process.env.NCP_CLIENT_ID;
const NCP_CLIENT_SECRET = process.env.NCP_CLIENT_SECRET;

app.get("/geocode", async (req, res) => {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Missing 'query' parameter" });

    try {
        const result = await axios.get("https://maps.apigw.ntruss.com/map-geocode/v2", {
            headers: {
                "X-NCP-APIGW-API-KEY-ID": NCP_CLIENT_ID,
                "X-NCP-APIGW-API-KEY": NCP_CLIENT_SECRET
            },
            params: { query }
        });
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
