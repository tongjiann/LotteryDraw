<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>抽奖活动</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="lottery-container">
        <!-- 活动名称及结束时间 -->
        <div class="lottery-info">
            <h1 id="activity-name"></h1>
            <p id="expiration-time"></p>
        </div>

        <!-- 奖项列表 -->
        <div class="award-list" id="award-list">
        </div>

        <!-- 左右分割 -->
        <div class="lottery-action">
            <div class="left">
                <input type="text" id="ticket-input" placeholder="请输入奖券码" />
            </div>
            <div class="right">
                <button id="draw-button">开始抽奖</button>
            </div>
        </div>

        <!-- 抽奖结果 -->
        <div id="result" class="result"></div>
    </div>

    <script src="script.js"></script>
</body>
</html>
