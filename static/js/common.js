async function submitData(submissionData,callback,failback) {
    try {
        const response = await fetch('https://api.redgecko.cn/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'dev-secret-key-change-in-production'
            },
            body: JSON.stringify(submissionData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '请求失败');
        }
        
        if (data.status === 'success') {
            console.log('提交成功：', data);
            callback && callback(data);
            return data;
        } else {
            failback && failback(data);
            throw new Error(data.message || '提交失败');
        }
        
    } catch (error) {
        failback && failback(data);
        console.log('提交错误：', error.message);
        throw error;  // 让调用方处理错误
    }
}