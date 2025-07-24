const carousel = document.getElementById('carousel');
const track = document.getElementById('track');
const items = Array.from(track.children);

let isDown = false;
let startX;
let scrollLeft;

// --- 鼠标拖动逻辑 ---

carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('active');
    // 禁用平滑过渡，让拖动立即响应
    track.style.transition = 'none';
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = track.getBoundingClientRect().x;
});

carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('active');
});

carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('active');

    // 拖动结束后，重新启用平滑过渡
    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5; // 乘以1.5可以增加拖动速度

    const currentTransform = scrollLeft + walk;
    track.style.transform = `translateX(${currentTransform}px)`;
});

// --- 键盘导航逻辑 ---

let currentIndex = 0;

const updatePosition = () => {
    // 计算每个项目的总宽度（项目宽度 + 间距）
    const itemWidth = items[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(track).gap, 10);
    const totalItemWidth = itemWidth + gap;

    // 计算新的 transform 值
    // 我们希望当前项的左侧边缘大致在屏幕的某个位置，例如左侧20%
    const screenOffset = window.innerWidth * 0.2;
    const newTransform = -currentIndex * totalItemWidth + screenOffset;

    track.style.transform = `translateX(${newTransform}px)`;
};

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        // 如果已经是最后一项，则不再前进
        if (currentIndex < items.length - 1) {
            currentIndex++;
            updatePosition();
        }
    } else if (e.key === 'ArrowLeft') {
        // 如果已经是第一项，则不再后退
        if (currentIndex > 0) {
            currentIndex--;
            updatePosition();
        }
    }
});

// 初始化位置
window.addEventListener('load', updatePosition);
window.addEventListener('resize', updatePosition); // 窗口大小变化时也更新位置

