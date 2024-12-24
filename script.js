const domain = "https://xiw.world";


// 使用 async/await 获取校验码
async function getValidatedCode() {
    try {
        const response = await fetch(domain + `/api/get-validated-code?code=xiw`);
        const data = await response.json();
        if (data.code === 1000 && data.data) {
            return data.data.validatedCode;
        }
    } catch (error) {
        console.error('获取校验码失败', error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const lotteryId = "1871367312066818048";
    const activityNameElement = document.getElementById("activity-name");
    const expirationTimeElement = document.getElementById("expiration-time");
    const awardListElement = document.getElementById("award-list");
    const ticketInputElement = document.getElementById("ticket-input");
    const drawButton = document.getElementById("draw-button");
    const resultElement = document.getElementById("result");
    const validatedCode = await getValidatedCode();
    const urlParams = new URLSearchParams(window.location.search);
    const ticket = urlParams.get('ticket');
    if (ticket) {
        // 设置输入框的值为ticket参数的值
        ticketInputElement.value = ticket;
        // 禁止编辑输入框
        ticketInputElement.disabled = true;
    }

    // 获取活动配置信息
    await fetch(domain + `/api/lottery/get-vo-by-id?id=${lotteryId}&validateCode=` + validatedCode)
        .then(response => response.json())
        .then(data => {
            console.log(validatedCode)

            if (data.code === 1000 && data.data) {
                const lotteryData = data.data;
                activityNameElement.textContent = lotteryData.name;
                expirationTimeElement.textContent = `活动结束时间: ${lotteryData.expirationTime}`;

                // 创建奖项列表
                const awards = lotteryData.awardConfigList;
                awards.forEach(award => {
                    const awardElement = document.createElement("div");
                    awardElement.classList.add("award-item");
                    awardElement.textContent = `${award.name} (概率: ${award.probability * 100}%)`;
                    awardElement.id = award.id;
                    awardListElement.appendChild(awardElement);
                });
            }
        })
        .catch(error => console.error('获取活动信息失败', error));


    function clearFocusAndHighLight() {
        const awardElements = document.querySelectorAll(".award-item");
        const totalAwards = awardElements.length;
        for (let i = 0; i < totalAwards; i++) {
            awardElements[i].classList.remove("award-item-highlight")
            awardElements[i].classList.remove("award-item-focus");
        }
    }

    // 处理抽奖按钮点击事件
    drawButton.addEventListener('click', await async function () {
        drawButton.disabled = true; // 禁用抽奖按钮
        const ticket = ticketInputElement.value.trim();
        const validatedCode = await getValidatedCode();

        if (!ticket) {
            alert("请输入奖券码");
            drawButton.disabled = false; // 启用抽奖按钮
            return;
        }
        clearFocusAndHighLight()

        const frontendCheckingTime = parseInt(Date.now() / 1000);
        resultElement.textContent = "正在抽奖中...";

        // 请求抽奖结果
        fetch(domain + '/api/ticket/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket: ticket,
                frontendCheckingTime: frontendCheckingTime,
                validateCode: validatedCode
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.code === 1000 && data.data) {
                    const award = data.data;
                    setTimeout(() => {
                        resultElement.textContent = `恭喜您，抽中了：${award.name}`;
                        clearInterval(interval)
                        // 找到中奖的奖项并高亮
                        highlightAward(award.id);
                    }, 5000);
                } else if (data.code === 500) {
                    // 如果返回代码是500，显示msg弹窗
                    alert(`错误：${data.msg}`);
                    resultElement.textContent = `${data.msg}`
                    // 停止滚动并显示结果
                    setTimeout(() => {
                        clearInterval(interval);
                    }, 0);
                } else {
                    setTimeout(() => {
                        resultElement.textContent = "未中奖，请再接再厉！";
                    }, 5000);
                }
            })
            .catch(error => {
                console.error('抽奖请求失败', error);
                resultElement.textContent = "抽奖失败，请稍后再试。";
            })
            .finally(() => {
                drawButton.disabled = false; // 请求完成后重新启用按钮
            });


        // 获取所有奖项元素
        const awards = document.querySelectorAll(".award-item");
        let index = 0;
        const totalAwards = awards.length;

        // 开始滚动显示奖项
        const interval = setInterval(() => {
            awards[index].classList.add("award-item-focus"); // 当前项突出显示
            if (index > 0) {
                awards[index - 1].classList.remove("award-item-focus");
            } else if (index === 0) {
                awards[totalAwards - 1].classList.remove("award-item-focus");
            }
            index = (index + 1) % totalAwards;
        }, 100);

        // 停止滚动并显示结果
        setTimeout(() => {
            clearInterval(interval);
            clearFocusAndHighLight()
        }, 5000);

        // 高亮中奖的奖项
        function highlightAward(awardId) {
            const totalAwards = awards.length;
            for (let i = 0; i < totalAwards; i++) {
                awards[i].classList.remove("award-item-focus");
                if (awards[i].id === awardId) {
                    awards[i].classList.add("award-item-highlight");
                    break; // 找到后退出循环
                }
            }
        }
    });
});
