require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// www → non-www 리다이렉트 처리
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.startsWith("www.")) {
    const newHost = req.headers.host.replace(/^www\./, "");
    return res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
  }
  next();
});

const NCP_CLIENT_ID = process.env.NCP_CLIENT_ID;
const NCP_CLIENT_SECRET = process.env.NCP_CLIENT_SECRET;

// 캐시 파일 경로
const CACHE_FILE = path.join(__dirname, "geocode-cache.json");

// 캐시 로드 (없으면 빈 객체)
let geocodeCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    geocodeCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch (e) {
    geocodeCache = {};
  }
}

// 캐시 저장 함수
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(geocodeCache, null, 2), "utf-8");
}

// /geocode?query=주소
app.get("/geocode", async (req, res) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  // 1. 캐시 확인
  if (geocodeCache[query]) {
    return res.json(geocodeCache[query]);
  }

  // 2. 네이버 API 요청
  try {
    const response = await axios.get(
      "https://maps.apigw.ntruss.com/map-geocode/v2/geocode",
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": NCP_CLIENT_ID,
          "X-NCP-APIGW-API-KEY": NCP_CLIENT_SECRET,
        },
        params: { query },
      }
    );

    // 3. 결과 캐싱 및 저장
    geocodeCache[query] = response.data;
    saveCache();

    res.json(response.data);
  } catch (error) {
    console.error("네이버 API 요청 실패:", error.message);
    res.status(500).json({ error: "Naver API request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
