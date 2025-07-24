// JavaScript 部分，增加了智能图片加载逻辑
document.addEventListener('DOMContentLoaded', async () => {
    const contentDiv = document.getElementById('album-content');

    try {
        const params = new URLSearchParams(window.location.search);
        const albumName = params.get('album');
        if (!albumName) { throw new Error('未指定相册名称。'); }

        const filePath = `galleries/${albumName}.md`;
        const response = await fetch(filePath);
        if (!response.ok) { throw new Error(`无法加载相册文件: ${response.statusText}`); }

        const markdownText = await response.text();

        const titleMatch = markdownText.match(/^#\s+(.*)/);
        if (titleMatch && titleMatch[1]) {
            document.title = titleMatch[1] + " - 我的相册";
        }

        // 1. 将 Markdown 正常解析为 HTML 字符串
        let htmlContent = marked.parse(markdownText);

        // 2. 获取容器的渲染宽度，并计算目标宽度（考虑 Retina 屏，乘以 1.5）
        const containerWidth = contentDiv.clientWidth;
        const targetWidth = Math.round(containerWidth * 1.5);

        // 3. 定义腾讯云 COS 图片处理参数
        // 推荐使用 webp 格式以获得最佳性能
        const cosParams = `?imageView2/2/w/${targetWidth}/q/85/format/webp`;

        // 4. 使用正则表达式查找所有图片链接，并为其追加参数
        // 这个正则表达式会捕获 <img src=" 和 " 中间的 URL 部分
        const imgRegex = /(<img src=")([^"]+?)(")/g;

        htmlContent = htmlContent.replace(imgRegex, (match, p1, p2, p3) => {
            // p1 是 '<img src="'
            // p2 是原始 URL
            // p3 是 '"'

            // 检查 URL 是否已经有查询参数
            const separator = p2.includes('?') ? '&' : '?';

            // 如果原始链接就是COS链接，则追加参数；否则保持原样（以防万一有非COS图片）
            if (p2.includes('.myqcloud.com')) {
                // 我们使用 p2 + cosParams.replace('?','&') 如果已经有?
                // 但为了简单，这里我们假设原始COS链接没有参数
                return p1 + p2 + cosParams + p3;
            } else {
                return match; // 不是COS链接，不处理
            }
        });

        // 5. 将【处理后】的 HTML 注入到页面
        contentDiv.innerHTML = htmlContent;

    } catch (error) {
        console.error('加载失败:', error);
        contentDiv.innerHTML = `<p class="error">抱歉，加载相册失败。请检查文件是否存在或稍后再试。</p>`;
    }
});