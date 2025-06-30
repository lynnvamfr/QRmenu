// Ollama Configuration
// Sử dụng proxy server để giải quyết vấn đề CORS
// Proxy server nằm trong thư mục ai-server/

const OLLAMA_CONFIG = {
    // Proxy server thay vì kết nối trực tiếp đến Ollama
    baseUrl: 'http://localhost:5000',
    
    // Model Qwen 2.5 0.5B - nhẹ và nhanh
    model: 'qwen2.5:0.5b',
    
    // Timeout cho request (milliseconds)
    timeout: 30000,
    
    // Số token tối đa cho response - giảm xuống cho model nhỏ
    maxTokens: 300,
    
    // Các tham số tối ưu cho Qwen 2.5
    options: {
        temperature: 0.8,      // Tăng lên một chút cho Qwen
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
        num_ctx: 2048,         // Context window cho model nhỏ
        num_predict: 300       // Giới hạn độ dài response
    }
};

// System prompt tối ưu cho Qwen 2.5
const SYSTEM_PROMPT = `Bạn là trợ lý AI thân thiện cho nhà hàng hải sản. 

Nhiệm vụ của bạn:
- Trả lời về menu, giá cả, giờ mở cửa
- Tư vấn về các món hải sản tươi ngon
- Hỗ trợ khách hàng đặt món
- Trả lời bằng tiếng Việt hoặc tiếng Anh tùy theo ngôn ngữ người dùng
- Giữ câu trả lời ngắn gọn, thân thiện và hữu ích

Thông tin nhà hàng:
- Chuyên về hải sản tươi: tôm hùm, cua, ghẹ, cá, mực
- Giờ mở cửa: 10:00 AM - 10:00 PM, 7 ngày/tuần
- Có thể đặt món trực tiếp qua menu này

Hãy trả lời một cách tự nhiên và hữu ích!`;

// Export để sử dụng trong script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OLLAMA_CONFIG, SYSTEM_PROMPT };
} 